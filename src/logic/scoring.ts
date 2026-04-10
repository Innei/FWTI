/**
 * v0.4 · scoring · path-aware ratio scoring + delegated hidden triggers.
 *
 * 与 v0.3 的行为差异：
 *   - 评分按当前 `buildQuestionPath(answers, status)` 过滤，只统计"当前路径"上的题。
 *   - 每道题的 option.score 先除以 2 归一到 [-1, +1]，再按维度取均值 → `ratio`。
 *   - `Scores` 对外暴露 ratio（GD/ZR/NL/YF 字段，浮点），同时保留 rawGD/nGD 等明细。
 *   - 隐藏人格与隐藏标签的触发逻辑全部迁至 `predicates.ts`，scoring 只负责数据准备与路由。
 *   - dimensionLabels 的 valueA / valueB 改为 `|ratio| * 100`，与百分比语义一致。
 *
 * API 稳定面（见 Result 接口）向 UI 消费者保持兼容：displayCode、closestCode、
 * tiedDimensions、dimensionLabels、isAll、isHidden 等字段语义不变。
 */

import { metaQuestion } from '../data/questions';
import {
  personalities,
  hiddenTitles,
  type HiddenTitle,
} from '../data/personalities';
import { buildQuestionPath } from './flow';
import {
  makeAnswerLens,
  hiddenPersonalityTriggers,
  hiddenTitleTriggers,
  type RatioDim,
  type RatioMap,
} from './predicates';

export type RelationshipStatus =
  | 'dating'
  | 'ambiguous'
  | 'crush'
  | 'solo'
  | null;

export interface Scores {
  /** 归一化比值 ∈ [-1, +1]。正向 = G/Z/N/Y，负向 = D/R/L/F。 */
  GD: number;
  ZR: number;
  NL: number;
  YF: number;

  rawGD: number; nGD: number;
  rawZR: number; nZR: number;
  rawNL: number; nNL: number;
  rawYF: number; nYF: number;

  /** 撤回大师彩蛋累加纠结值 */
  hidden: number;
}

export interface Result {
  code: string;
  /** v0.3 起与 code 一致，字段仅为兼容旧 ShareImageModal。 */
  displayCode: string;
  personality: typeof personalities[string];
  hasHiddenTitle: boolean;
  unlockedHiddenTitles: HiddenTitle[];
  isAll: boolean;
  isHidden: boolean;
  closestCode: string;
  closestPersonality: typeof personalities[string];
  tiedDimensions: Array<RatioDim>;
  status: RelationshipStatus;
  scores: Scores;
  dimensionLabels: {
    dim: string;
    labelA: string;
    labelB: string;
    valueA: number;
    valueB: number;
  }[];
}

// ───────────────────────────────────────────────────────────────
// helpers
// ───────────────────────────────────────────────────────────────

export function resolveOptionIndex(value: number): number | null {
  // 0..5 · 支持最多 6 个选项（5 档单调 + 1 档分支）
  if (!Number.isInteger(value) || value < 0 || value > 5) return null;
  return value;
}

/** 从答案中读取前置题（META）的恋爱状态。 */
export function getRelationshipStatus(
  answers: Record<number, number>,
): RelationshipStatus {
  const idx = answers[metaQuestion.id];
  if (idx === undefined) return null;
  const opt = metaQuestion.options[idx];
  if (!opt) return null;
  return (opt.meta as RelationshipStatus) ?? null;
}

// ───────────────────────────────────────────────────────────────
// ratio scoring
// ───────────────────────────────────────────────────────────────

const EMPTY_SCORES = (): Scores => ({
  GD: 0, ZR: 0, NL: 0, YF: 0,
  rawGD: 0, nGD: 0,
  rawZR: 0, nZR: 0,
  rawNL: 0, nNL: 0,
  rawYF: 0, nYF: 0,
  hidden: 0,
});

/**
 * 按当前路径对已答题做归一化累加。未答题不贡献、不计分母。
 * 彩蛋题（tag === '彩蛋'）只累加 hidden 值，不进入维度均值。
 */
export function calculateScores(
  answers: Record<number, number>,
  status: RelationshipStatus,
): Scores {
  const scores = EMPTY_SCORES();
  const path = buildQuestionPath(answers, status);

  for (const q of path) {
    const raw = answers[q.id];
    if (raw === undefined) continue;
    const idx = resolveOptionIndex(raw);
    if (idx === null) continue;
    const option = q.options[idx];
    if (!option) continue;

    if (q.dimension === 'META') continue;

    if (q.tag === '彩蛋') {
      scores.hidden += option.hidden ?? 0;
      continue;
    }

    const delta = option.score / 2; // 3 档: ±1/0；5 档: ±1/±0.5/0；6 档（分支）：F 一般为 0
    switch (q.dimension) {
      case 'GD': scores.rawGD += delta; scores.nGD += 1; break;
      case 'ZR': scores.rawZR += delta; scores.nZR += 1; break;
      case 'NL': scores.rawNL += delta; scores.nNL += 1; break;
      case 'YF': scores.rawYF += delta; scores.nYF += 1; break;
    }

    // 次要维度贡献：follow-up 细分时 C 选项可同时打两维。
    // 亦贡献 n 分母——语义上该 follow-up 对两维都"表达了一次"。
    if (option.secondary) {
      const sdelta = option.secondary.score / 2;
      switch (option.secondary.dimension) {
        case 'GD': scores.rawGD += sdelta; scores.nGD += 1; break;
        case 'ZR': scores.rawZR += sdelta; scores.nZR += 1; break;
        case 'NL': scores.rawNL += sdelta; scores.nNL += 1; break;
        case 'YF': scores.rawYF += sdelta; scores.nYF += 1; break;
      }
    }
  }

  // 均值 → ratio；分母为 0 时 ratio 视作 0。
  scores.GD = scores.nGD > 0 ? scores.rawGD / scores.nGD : 0;
  scores.ZR = scores.nZR > 0 ? scores.rawZR / scores.nZR : 0;
  scores.NL = scores.nNL > 0 ? scores.rawNL / scores.nNL : 0;
  scores.YF = scores.nYF > 0 ? scores.rawYF / scores.nYF : 0;

  return scores;
}

// ───────────────────────────────────────────────────────────────
// 16-grid classification + hidden routing
// ───────────────────────────────────────────────────────────────

function collectTies(scores: Scores): RatioDim[] {
  const tied: RatioDim[] = [];
  if (scores.GD === 0) tied.push('GD');
  if (scores.ZR === 0) tied.push('ZR');
  if (scores.NL === 0) tied.push('NL');
  if (scores.YF === 0) tied.push('YF');
  return tied;
}

function classify16(scores: Scores): string {
  // 默认废方向：GD → D（负），ZR → Z（正），NL → N（正），YF → Y（正）。
  // 这四条不对称，注释请保留——GD 与其他三维的"废方向"位于极性的不同侧。
  const g = scores.GD > 0 ? 'G' : 'D';
  const z = scores.ZR < 0 ? 'R' : 'Z';
  const n = scores.NL < 0 ? 'L' : 'N';
  const y = scores.YF < 0 ? 'F' : 'Y';
  return g + z + n + y;
}

/**
 * 计算结果。
 * @param retreatCount v0.3 · 答题过程中的"改答次数"，由前端 quiz 页累计后传入，触发「退退退」。
 *                     分享链接解码出的答案没有这个数据，缺省为 0——即分享者的"退退退"标签
 *                     不会被观众看到，这是故意的。
 * @param statusOverride 来自 URL（v2 codec 前缀）的状态断言。若提供，优先于 `answers[32]`
 *                       反推的状态，用于防手改 URL 场景——statusChar 与 answers[32] 不一致
 *                       时以 URL 为准，令观者所见与分享链一致。quiz 作答流不传此参数，
 *                       回落到从 answers 重构 status 的原路径。
 */
export function getResult(
  answers: Record<number, number>,
  retreatCount = 0,
  statusOverride?: RelationshipStatus,
): Result {
  const status = statusOverride ?? getRelationshipStatus(answers);
  const scores = calculateScores(answers, status);
  const tied = collectTies(scores);
  const closestCode = classify16(scores);
  const closestPersonality = personalities[closestCode];

  const path = buildQuestionPath(answers, status);
  const lens = makeAnswerLens({
    answers,
    ratio: { GD: scores.GD, ZR: scores.ZR, NL: scores.NL, YF: scores.YF },
    status,
    retreatCount,
    hiddenCount: scores.hidden,
    tiedDimensions: tied,
    path,
  });

  // v0.4 · 先按 DRAFT §5·附 的优先级检查隐藏人格；命中覆盖 code。
  let hiddenCode: string | null = null;
  for (const trigger of hiddenPersonalityTriggers) {
    if (trigger.test(lens)) {
      // 防御：personality 不在表中则降级跳过（例如 VOID/LIMBO 在 ENABLE_NEW_HIDDEN=false
      // 时实际应被 trigger 内部拒绝，但额外一层容错无害）
      if (personalities[trigger.code]) {
        hiddenCode = trigger.code;
      }
      break;
    }
  }

  const isAllTied = tied.length >= 2;
  let code: string;
  let personality: typeof personalities[string];
  if (hiddenCode) {
    code = hiddenCode;
    personality = personalities[hiddenCode];
  } else if (isAllTied) {
    code = 'ALL';
    personality = personalities.ALL;
  } else {
    code = closestCode;
    personality = closestPersonality;
  }

  const isAll = !hiddenCode && isAllTied;
  const isHidden = hiddenCode !== null || isAllTied;
  const displayCode = code;

  // Hidden titles
  const unlockedHiddenTitles: HiddenTitle[] = [];
  for (const trig of hiddenTitleTriggers) {
    if (!trig.test(lens)) continue;
    const title = hiddenTitles[trig.key as keyof typeof hiddenTitles];
    if (title) unlockedHiddenTitles.push(title);
  }
  const hasHiddenTitle = unlockedHiddenTitles.length > 0;

  // Dimension bars · ratio 绝对值 × 100
  const barsFor = (ratio: number): { valueA: number; valueB: number } => ({
    valueA: Math.max(0, ratio) * 100,
    valueB: Math.max(0, -ratio) * 100,
  });
  const dimensionLabels = [
    { dim: '主动性', labelA: '冲 Go', labelB: '蹲 Dwell', ...barsFor(scores.GD) },
    { dim: '情绪表达', labelA: '炸 Zha', labelB: '忍 Ren', ...barsFor(scores.ZR) },
    { dim: '亲密需求', labelA: '黏 Nian', labelB: '离 Li', ...barsFor(scores.NL) },
    { dim: '安全感', labelA: '疑 Yi', labelB: '佛 Fo', ...barsFor(scores.YF) },
  ];

  return {
    code,
    displayCode,
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
  };
}
