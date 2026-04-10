import { questions } from '../data/questions';
import { personalities, hiddenTitles, type HiddenTitle } from '../data/personalities';

export interface Scores {
  GD: number; // + = G, - = D
  ZR: number; // + = Z, - = R
  NL: number; // + = N, - = L
  YF: number; // + = Y, - = F
  hidden: number; // 撤回大师纠结值
}

export type RelationshipStatus = 'active' | 'crush' | 'solo' | null;

export interface Result {
  code: string;
  personality: typeof personalities[string];
  /** 至少解锁一个隐藏标签时为 true（兼容旧字段） */
  hasHiddenTitle: boolean;
  /** 所有解锁的隐藏叠加标签 */
  unlockedHiddenTitles: HiddenTitle[];
  /** 是否触发了骑墙党（≥2 个维度平票） */
  isLimbo: boolean;
  /** 被判为平票的维度列表（用于加星号显示） */
  tiedDimensions: Array<'GD' | 'ZR' | 'NL' | 'YF'>;
  /** 前置题选择：恋爱状态 */
  status: RelationshipStatus;
  scores: Scores;
  dimensionLabels: { dim: string; labelA: string; labelB: string; valueA: number; valueB: number }[];
}

/** 每题答案为选项索引 0 = A，1 = B，2 = C */
export function resolveOptionIndex(value: number): number | null {
  if (!Number.isInteger(value) || value < 0 || value > 2) return null;
  return value;
}

export function calculateScores(answers: Record<number, number>): Scores {
  const scores: Scores = { GD: 0, ZR: 0, NL: 0, YF: 0, hidden: 0 };

  for (const q of questions) {
    const raw = answers[q.id];
    if (raw === undefined) continue;
    const idx = resolveOptionIndex(raw);
    if (idx === null) continue;
    const option = q.options[idx];
    if (!option) continue;

    // META 前置题不计入任何维度
    if (q.dimension === 'META') continue;

    if (q.tag === '彩蛋') {
      scores.hidden += option.hidden ?? 0;
      continue;
    }

    const delta = option.score;
    switch (q.dimension) {
      case 'GD': scores.GD += delta; break;
      case 'ZR': scores.ZR += delta; break;
      case 'NL': scores.NL += delta; break;
      case 'YF': scores.YF += delta; break;
    }
  }

  return scores;
}

/** 从答案中读取前置题（META）的恋爱状态 */
export function getRelationshipStatus(answers: Record<number, number>): RelationshipStatus {
  const metaQ = questions.find((q) => q.dimension === 'META');
  if (!metaQ) return null;
  const idx = answers[metaQ.id];
  if (idx === undefined) return null;
  const opt = metaQ.options[idx];
  if (!opt) return null;
  return (opt.meta as RelationshipStatus) ?? null;
}

/** 计算解锁的隐藏叠加标签 */
export function detectHiddenTitles(
  answers: Record<number, number>,
  scores: Scores,
): HiddenTitle[] {
  const unlocked: HiddenTitle[] = [];
  const A = 0;
  const C = 2;

  // ① 撤回大师：彩蛋题触发
  if (scores.hidden >= 1) {
    unlocked.push(hiddenTitles.retractMaster);
  }

  // ② 夜谈冠军：Q12 / Q13 / Q29 至少两题选极端 Z 或 Y（即 A 选项）
  const nightTalkHits = [12, 13, 29].filter((id) => answers[id] === A).length;
  if (nightTalkHits >= 2) {
    unlocked.push(hiddenTitles.nightTalkChamp);
  }

  // ③ 朋友圈考古学家：Q26 + Q27 都选 A
  if (answers[26] === A && answers[27] === A) {
    unlocked.push(hiddenTitles.momentsArchaeologist);
  }

  // ④ 薛定谔的前任：Q14 + Q28 都选 A（都是维度极端选项）
  if (answers[14] === A && answers[28] === A) {
    unlocked.push(hiddenTitles.schrodingerEx);
  }

  // ⑤ 电子乙方：Q2 = C（对方定）, Q3 = A（先低头）, Q5 = A（主动联系）
  if (answers[2] === C && answers[3] === A && answers[5] === A) {
    unlocked.push(hiddenTitles.electronicVendor);
  }

  // ⑥ 空想家：前置题选 "solo"（纯单身），且主线题 ≥ 6 题选极端（A 或 C）
  const status = getRelationshipStatus(answers);
  if (status === 'solo') {
    let extremeCount = 0;
    for (const q of questions) {
      if (q.dimension === 'META') continue;
      if (q.tag === '彩蛋') continue;
      const idx = answers[q.id];
      if (idx === A || idx === C) extremeCount++;
    }
    if (extremeCount >= 6) {
      unlocked.push(hiddenTitles.daydreamer);
    }
  }

  return unlocked;
}

export function getResult(answers: Record<number, number>): Result {
  const scores = calculateScores(answers);
  const status = getRelationshipStatus(answers);

  // 找出平票的维度
  const tied: Array<'GD' | 'ZR' | 'NL' | 'YF'> = [];
  if (scores.GD === 0) tied.push('GD');
  if (scores.ZR === 0) tied.push('ZR');
  if (scores.NL === 0) tied.push('NL');
  if (scores.YF === 0) tied.push('YF');

  const isLimbo = tied.length >= 2;

  let code: string;
  let personality: typeof personalities[string];

  if (isLimbo) {
    code = 'LIMBO';
    personality = personalities.LIMBO;
  } else {
    // 平票时（仅有 0 或 1 个维度平票），0 分走默认"废"方向：D, Z, N, Y
    const g = scores.GD > 0 ? 'G' : 'D';
    const z = scores.ZR > 0 ? 'Z' : 'R';
    const n = scores.NL > 0 ? 'N' : 'L';
    const y = scores.YF > 0 ? 'Y' : 'F';
    code = g + z + n + y;
    personality = personalities[code];
  }

  const unlockedHiddenTitles = detectHiddenTitles(answers, scores);
  const hasHiddenTitle = unlockedHiddenTitles.length > 0;

  // 维度条形数据
  const maxPerDim: Record<string, number> = { GD: 16, ZR: 14, NL: 16, YF: 14 };
  const dimensionLabels = [
    {
      dim: '主动性',
      labelA: '冲 Go',
      labelB: '蹲 Dwell',
      valueA: Math.max(0, scores.GD) / maxPerDim.GD * 100,
      valueB: Math.max(0, -scores.GD) / maxPerDim.GD * 100,
    },
    {
      dim: '情绪表达',
      labelA: '炸 Zha',
      labelB: '忍 Ren',
      valueA: Math.max(0, scores.ZR) / maxPerDim.ZR * 100,
      valueB: Math.max(0, -scores.ZR) / maxPerDim.ZR * 100,
    },
    {
      dim: '亲密需求',
      labelA: '黏 Nian',
      labelB: '离 Li',
      valueA: Math.max(0, scores.NL) / maxPerDim.NL * 100,
      valueB: Math.max(0, -scores.NL) / maxPerDim.NL * 100,
    },
    {
      dim: '安全感',
      labelA: '疑 Yi',
      labelB: '佛 Fo',
      valueA: Math.max(0, scores.YF) / maxPerDim.YF * 100,
      valueB: Math.max(0, -scores.YF) / maxPerDim.YF * 100,
    },
  ];

  return {
    code,
    personality,
    hasHiddenTitle,
    unlockedHiddenTitles,
    isLimbo,
    tiedDimensions: tied,
    status,
    scores,
    dimensionLabels,
  };
}
