/**
 * FWTI v3 · 评分与分类
 *
 * 流程：
 *   1. calculateScoresV3: 按 questionsV3 路径聚合各维 ratio（± 2/2 = ±1 归一），
 *      每维均值 → ratio ∈ [-1, +1]。仅非 META 且题目 dim ∈ {C,R,A,S} 的题计数。
 *   2. classifyV3: 先按优先级跑 hidden（VOID > MAD > RAT > ALL），
 *      若无命中则走「主导维度 × 档位」映射至 12 主型。
 *   3. getResultV3: 返回与 v2 `Result` 同形结构（scores 字段保留 GD/ZR/NL/YF
 *      键名为向下兼容 alias，语义对应 C/R/A/S）。UI 无需改动即可消费。
 *
 * 家族分类表：
 *   dominant = argmax(|C|, |R|, |A|, |S|) · 平手按 C>R>A>S 顺序择前。
 *   tier by dominant.score: ≥ +0.33 → 正端 ／ ≤ -0.33 → 负端 ／ else → 中段。
 *   (family, tier) → code：
 *     C: + CHS / 0 CMD / - CNV
 *     R: + RSO / 0 RBS / - RSU
 *     A: + ACL / 0 ANR / - ADS
 *     S: + SCA / 0 SNT / - SFL
 */

import { questionsV3, questionByIdV3 } from '../../copy/v3/questions';
import type { QuestionV3, StatusKey } from '../../copy/v3/types';
import { personalitiesV3 } from '../../copy/v3/personalities';
import { hiddenTitlesV3 } from '../../copy/v3/tags';
import type { Personality, HiddenTitle } from '../../copy/personalities';
import type { AttachmentApproximation } from '../scoring';
import {
  makeAnswerLensV3,
  hiddenPersonalityTriggersV3,
  hiddenTagTriggersV3,
  type RatioDimV3,
  type RatioMapV3,
} from './predicates';
import type { ResultNarrative } from '../resultNarrative';

export type RelationshipStatusV3 =
  | 'dating'
  | 'ambiguous'
  | 'crush'
  | 'solo'
  | null;

// 与 v2 Result 保持同形，便于 UI（ResultPage/compatibility）无缝消费。
// scores 字段仍用 GD/ZR/NL/YF 作为 alias（GD=C, ZR=R, NL=A, YF=S），
// 这样 resultNarrative 与 compatibility 现有代码可直接读取。
export interface ScoresV3 {
  GD: number; // alias of C
  ZR: number; // alias of R
  NL: number; // alias of A
  YF: number; // alias of S
  rawC: number;
  nC: number;
  rawR: number;
  nR: number;
  rawA: number;
  nA: number;
  rawS: number;
  nS: number;
  hidden: number;
}

export interface ResultV3 {
  code: string;
  displayCode: string;
  personality: Personality;
  hasHiddenTitle: boolean;
  unlockedHiddenTitles: HiddenTitle[];
  isAll: boolean;
  isHidden: boolean;
  closestCode: string;
  closestPersonality: Personality;
  tiedDimensions: RatioDimV3[];
  status: RelationshipStatusV3;
  scores: ScoresV3;
  dimensionLabels: {
    dim: string;
    labelA: string;
    labelB: string;
    valueA: number;
    valueB: number;
  }[];
  narrative: ResultNarrative;
  attachmentApproximation: AttachmentApproximation;
}

const EMPTY_SCORES = (): ScoresV3 => ({
  GD: 0,
  ZR: 0,
  NL: 0,
  YF: 0,
  rawC: 0,
  nC: 0,
  rawR: 0,
  nR: 0,
  rawA: 0,
  nA: 0,
  rawS: 0,
  nS: 0,
  hidden: 0,
});

export function calculateScoresV3(
  answers: Record<number, number>,
): ScoresV3 {
  const scores = EMPTY_SCORES();
  for (const q of questionsV3) {
    if (q.dimension === 'META') continue;
    const idx = answers[q.id];
    if (idx === undefined) continue;
    const opt = q.options[idx];
    if (!opt) continue;
    const delta = opt.score / 2; // 归一到 [-1, +1]
    switch (q.dimension) {
      case 'C':
        scores.rawC += delta;
        scores.nC += 1;
        break;
      case 'R':
        scores.rawR += delta;
        scores.nR += 1;
        break;
      case 'A':
        scores.rawA += delta;
        scores.nA += 1;
        break;
      case 'S':
        scores.rawS += delta;
        scores.nS += 1;
        break;
    }
  }
  const C = scores.nC > 0 ? scores.rawC / scores.nC : 0;
  const R = scores.nR > 0 ? scores.rawR / scores.nR : 0;
  const A = scores.nA > 0 ? scores.rawA / scores.nA : 0;
  const S = scores.nS > 0 ? scores.rawS / scores.nS : 0;
  scores.GD = C;
  scores.ZR = R;
  scores.NL = A;
  scores.YF = S;
  return scores;
}

function collectTies(ratio: RatioMapV3): RatioDimV3[] {
  const tied: RatioDimV3[] = [];
  if (ratio.C === 0) tied.push('C');
  if (ratio.R === 0) tied.push('R');
  if (ratio.A === 0) tied.push('A');
  if (ratio.S === 0) tied.push('S');
  return tied;
}

function buildAttachmentApproximation(
  ratio: RatioMapV3,
): AttachmentApproximation {
  const anxious = ratio.S >= TIER_THRESHOLD;
  const avoidant = ratio.A <= -TIER_THRESHOLD;
  const axis = {
    attachment: ratio.A,
    security: ratio.S,
  };

  if (anxious && avoidant) {
    return {
      label: '焦虑-回避混合型',
      summary:
        '安全感偏疑，同时黏附需求偏离；既会警觉关系风险，也会用拉开距离来保护自己。',
      rule: 'S >= 0.33 且 A <= -0.33',
      axis,
    };
  }

  if (anxious) {
    return {
      label: '焦虑型',
      summary:
        '安全感偏疑，但并未明显抗拒亲密；更容易需要确认、回应和关系仍然稳定的证据。',
      rule: 'S >= 0.33 且 A > -0.33',
      axis,
    };
  }

  if (avoidant) {
    return {
      label: '回避型',
      summary:
        '黏附需求偏离，安全警觉未明显升高；更需要个人空间，亲密过密时容易感到负荷。',
      rule: 'S < 0.33 且 A <= -0.33',
      axis,
    };
  }

  return {
    label: '安全型',
    summary:
      '安全警觉未明显升高，也未明显抗拒亲密；整体更接近能信任关系、也能保留边界的模式。',
    rule: 'S < 0.33 且 A > -0.33',
    axis,
  };
}

const TIER_THRESHOLD = 0.33;

const FAMILY_MAP: Record<RatioDimV3, { pos: string; mid: string; neg: string }> = {
  C: { pos: 'CHS', mid: 'CMD', neg: 'CNV' },
  R: { pos: 'RSO', mid: 'RBS', neg: 'RSU' },
  A: { pos: 'ACL', mid: 'ANR', neg: 'ADS' },
  S: { pos: 'SCA', mid: 'SNT', neg: 'SFL' },
};

export function classify12(ratio: RatioMapV3): string {
  const dims: Array<{ k: RatioDimV3; v: number }> = [
    { k: 'C', v: ratio.C },
    { k: 'R', v: ratio.R },
    { k: 'A', v: ratio.A },
    { k: 'S', v: ratio.S },
  ];
  // 主导维度 · argmax |ratio|，平手取声明序（C > R > A > S）。
  let dom = dims[0];
  for (const d of dims) {
    if (Math.abs(d.v) > Math.abs(dom.v)) dom = d;
  }
  const tier: 'pos' | 'mid' | 'neg' =
    dom.v >= TIER_THRESHOLD
      ? 'pos'
      : dom.v <= -TIER_THRESHOLD
        ? 'neg'
        : 'mid';
  return FAMILY_MAP[dom.k][tier];
}

/**
 * 生成与 v2 ResultNarrative 同形的极简叙事（v3 未复用 v2 narrative machine）。
 * 占用四段式：summary + 三段 profileParagraphs + 四 evidenceTraits + 四 evidenceCards。
 */
function buildV3Narrative(
  status: RelationshipStatusV3,
  ratio: RatioMapV3,
  answers: Record<number, number>,
  personality: Personality,
  isHidden: boolean,
  isAll: boolean,
): ResultNarrative {
  const summary = isHidden
    ? `你触发了隐藏人格：${personality.name}。${personality.tagline}。`
    : `这次的你，是一位${personality.name}——${personality.tagline}。`;

  const dimPhrase = (label: string, v: number): string => {
    if (v >= 0.5) return `${label}：偏强（${(v * 100).toFixed(0)}）`;
    if (v >= 0.15) return `${label}：偏正（${(v * 100).toFixed(0)}）`;
    if (v <= -0.5) return `${label}：偏弱（${(-v * 100).toFixed(0)}）`;
    if (v <= -0.15) return `${label}：偏负（${(-v * 100).toFixed(0)}）`;
    return `${label}：基本持平（${(Math.abs(v) * 100).toFixed(0)}）`;
  };

  const profileParagraphs: string[] = [
    isAll
      ? '你的四维都接近零，在恋爱场上像一面镜子，照见谁就像谁。'
      : `你这次的关键词是「${personality.cnSlang}」——${personality.description.split('\n\n')[0]}`,
    `四维拆解：${dimPhrase('接触 C', ratio.C)} · ${dimPhrase('调节 R', ratio.R)} · ${dimPhrase('黏附 A', ratio.A)} · ${dimPhrase('安全 S', ratio.S)}。`,
    personality.advice,
  ];

  const evidenceTraits: string[] = [
    personality.traits[0] ?? '',
    personality.traits[1] ?? '',
    personality.traits[2] ?? '',
    personality.traits[3] ?? '',
  ];

  // 每维取一道代表性已答题作为 evidence card（按 dim 的第一道题 id）。
  const FIRST_OF_DIM: Record<RatioDimV3, number> = { C: 1, R: 9, A: 17, S: 25 };
  const evidenceCards = (['C', 'R', 'A', 'S'] as RatioDimV3[])
    .map((dim) => {
      const qId = FIRST_OF_DIM[dim];
      const q = questionByIdV3.get(qId);
      const idx = answers[qId];
      if (!q || idx === undefined) return null;
      const opt = q.options[idx];
      if (!opt) return null;
      const facetLabel: Record<RatioDimV3, string> = {
        C: 'initiative',
        R: 'expression',
        A: 'closeness',
        S: 'security',
      };
      const dimName: Record<RatioDimV3, string> = {
        C: '接触主动',
        R: '情绪调节',
        A: '黏附需求',
        S: '安全感',
      };
      return {
        facet: facetLabel[dim],
        questionId: qId,
        question: resolveStatusText(q, status),
        answer: resolveStatusOptionText(q, idx, status) ?? opt.text,
        note: `${dimName[dim]}维取样：你这题选了「${opt.text}」（score ${opt.score}）。`,
      };
    })
    .filter((c): c is NonNullable<typeof c> => c !== null);

  return {
    summary,
    profileParagraphs,
    evidenceTraits,
    evidenceCards,
  };
}

function resolveStatusText(q: QuestionV3, status: RelationshipStatusV3): string {
  if (!status || !q.variants) return q.text;
  return q.variants[status as StatusKey]?.text ?? q.text;
}

function resolveStatusOptionText(
  q: QuestionV3,
  idx: number,
  status: RelationshipStatusV3,
): string | null {
  const fallback = q.options[idx]?.text ?? null;
  if (!status || !q.variants) return fallback;
  const v = q.variants[status as StatusKey];
  if (!v?.options) return fallback;
  return v.options[idx] ?? fallback;
}

export function getResultV3(
  answers: Record<number, number>,
  retreatCount = 0,
  statusOverride?: RelationshipStatusV3,
): ResultV3 {
  const status = statusOverride ?? null;
  const scores = calculateScoresV3(answers);
  const ratio: RatioMapV3 = {
    C: scores.GD,
    R: scores.ZR,
    A: scores.NL,
    S: scores.YF,
  };
  const tied = collectTies(ratio);
  const closestCode = classify12(ratio);

  const lens = makeAnswerLensV3({
    answers,
    ratio,
    status: (status as StatusKey | null) ?? null,
    retreatCount,
    tiedDimensions: tied,
  });

  // 优先级跑 hidden。
  let hiddenCode: string | null = null;
  for (const trigger of hiddenPersonalityTriggersV3) {
    if (trigger.test(lens)) {
      if (personalitiesV3[trigger.code]) {
        hiddenCode = trigger.code;
      }
      break;
    }
  }

  const isAll = hiddenCode === 'ALL';
  const code = hiddenCode ?? closestCode;
  const personality =
    personalitiesV3[code] ?? personalitiesV3[closestCode] ?? personalitiesV3.ALL;
  const closestPersonality =
    personalitiesV3[closestCode] ?? personalitiesV3.ALL;
  const isHidden = hiddenCode !== null;

  // 叠加 tags
  const unlockedHiddenTitles: HiddenTitle[] = [];
  for (const trig of hiddenTagTriggersV3) {
    if (!trig.test(lens)) continue;
    const title = hiddenTitlesV3[trig.key];
    if (title) unlockedHiddenTitles.push(title);
  }
  const hasHiddenTitle = unlockedHiddenTitles.length > 0;

  // Dimension bars
  const barsFor = (r: number) => ({
    valueA: Math.max(0, r) * 100,
    valueB: Math.max(0, -r) * 100,
  });
  const dimensionLabels = [
    { dim: '接触主动', labelA: '追 Chase', labelB: '避 Avoid', ...barsFor(ratio.C) },
    { dim: '情绪调节', labelA: '暴 Burst', labelB: '闷 Mute', ...barsFor(ratio.R) },
    { dim: '黏附需求', labelA: '黏 Cling', labelB: '离 Loose', ...barsFor(ratio.A) },
    { dim: '安全感', labelA: '疑 Doubt', labelB: '佛 Chill', ...barsFor(ratio.S) },
  ];

  const narrative = buildV3Narrative(
    status,
    ratio,
    answers,
    personality,
    isHidden,
    isAll,
  );
  const attachmentApproximation = buildAttachmentApproximation(ratio);

  return {
    code,
    displayCode: code,
    personality,
    hasHiddenTitle,
    unlockedHiddenTitles,
    isAll,
    isHidden,
    closestCode,
    closestPersonality,
    tiedDimensions: tied,
    status,
    scores,
    dimensionLabels,
    narrative,
    attachmentApproximation,
  };
}
