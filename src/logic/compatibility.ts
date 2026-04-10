import { personalities } from '../data/personalities';

export interface CompatibilityChoice {
  code: string;
  score: number;
  summary: string;
  reasons: string[];
}

export interface CompatibilityOutcome {
  best: CompatibilityChoice;
  worst: CompatibilityChoice;
}

interface CompatibilityVector {
  GD: number;
  ZR: number;
  NL: number;
  YF: number;
  volatility: number;
}

interface PairMetrics {
  a: CompatibilityVector;
  b: CompatibilityVector;
  center: Omit<CompatibilityVector, 'volatility'>;
  gdDiff: number;
  zrDiff: number;
  nlDiff: number;
  yfDiff: number;
  volatilitySum: number;
  dualHyperactivation: boolean;
  pursueWithdraw: boolean;
}

interface NarrativeFactor {
  weight: number;
  summary: string;
  reason: string;
}

const LETTER_VALUE: Record<string, number> = {
  G: 1,
  D: -1,
  Z: 1,
  R: -1,
  N: 1,
  L: -1,
  Y: 1,
  F: -1,
};

/**
 * Hidden personas are overlays on top of the same four-dimensional space. They still need
 * a prototype vector so compatibility remains explainable and can be computed consistently.
 *
 * Important boundary:
 * this is a theory-informed heuristic, not a validated matching model. We optimize for:
 *   1. lower pair-level insecurity, especially lower anxious vigilance (`YF`)
 *   2. moderate pair equilibrium rather than two simultaneous extremes
 *   3. low interpersonal mismatch on closeness, emotional expression, and initiative
 *   4. explicit penalties for pursue-withdraw and high-anxiety collisions
 */
const HIDDEN_PROTOTYPES: Record<string, CompatibilityVector> = {
  ALL: { GD: 0, ZR: 0, NL: 0, YF: 0, volatility: 0.2 },
  RAT: { GD: -0.8, ZR: -0.7, NL: -0.7, YF: 0.9, volatility: 0.5 },
  PURE: { GD: 0.9, ZR: 0.1, NL: 0.9, YF: -0.9, volatility: 0.2 },
  MAD: { GD: 1, ZR: 1, NL: 1, YF: 1, volatility: 1 },
  'E-DOG': { GD: 0.7, ZR: 0.2, NL: 0, YF: 0.2, volatility: 0.4 },
  CHAOS: { GD: 0, ZR: 0.1, NL: -0.2, YF: -0.1, volatility: 0.95 },
  CPU: { GD: 0.1, ZR: 0.1, NL: 0.3, YF: 1, volatility: 0.85 },
  BENCH: { GD: 0.4, ZR: -0.5, NL: -0.3, YF: 0.6, volatility: 0.45 },
  VOID: { GD: -0.9, ZR: -0.2, NL: -0.8, YF: -0.2, volatility: 0.2 },
  LIMBO: { GD: 0, ZR: 0, NL: 0.4, YF: 0.9, volatility: 0.65 },
};

function standardVectorFromCode(code: string): CompatibilityVector | null {
  if (code.length !== 4) return null;
  const gd = LETTER_VALUE[code[0]];
  const zr = LETTER_VALUE[code[1]];
  const nl = LETTER_VALUE[code[2]];
  const yf = LETTER_VALUE[code[3]];
  if (
    gd === undefined ||
    zr === undefined ||
    nl === undefined ||
    yf === undefined
  ) {
    return null;
  }

  return {
    GD: gd,
    ZR: zr,
    NL: nl,
    YF: yf,
    volatility: Math.max(0, zr) * 0.45 + Math.max(0, yf) * 0.55,
  };
}

function vectorOf(code: string): CompatibilityVector {
  return HIDDEN_PROTOTYPES[code] ?? standardVectorFromCode(code) ?? {
    GD: 0,
    ZR: 0,
    NL: 0,
    YF: 0,
    volatility: 0.2,
  };
}

function getPairMetrics(aCode: string, bCode: string): PairMetrics {
  const a = vectorOf(aCode);
  const b = vectorOf(bCode);
  const center = {
    GD: (a.GD + b.GD) / 2,
    ZR: (a.ZR + b.ZR) / 2,
    NL: (a.NL + b.NL) / 2,
    YF: (a.YF + b.YF) / 2,
  };
  const gdDiff = Math.abs(a.GD - b.GD);
  const zrDiff = Math.abs(a.ZR - b.ZR);
  const nlDiff = Math.abs(a.NL - b.NL);
  const yfDiff = Math.abs(a.YF - b.YF);

  return {
    a,
    b,
    center,
    gdDiff,
    zrDiff,
    nlDiff,
    yfDiff,
    volatilitySum: a.volatility + b.volatility,
    dualHyperactivation: a.YF > 0.6 && b.YF > 0.6,
    pursueWithdraw:
      (a.GD > 0.6 && a.NL > 0.4 && b.GD < -0.6 && b.NL < -0.4) ||
      (b.GD > 0.6 && b.NL > 0.4 && a.GD < -0.6 && a.NL < -0.4),
  };
}

function pairScore(aCode: string, bCode: string): number {
  const { a, b, center, gdDiff, zrDiff, nlDiff, yfDiff, volatilitySum, dualHyperactivation, pursueWithdraw } =
    getPairMetrics(aCode, bCode);

  // Pair-level target state: some initiative, moderated expression, modest closeness, low vigilance.
  let score = 100;
  score -= 10 * Math.abs(center.GD - 0.15);
  score -= 7 * Math.abs(center.ZR - 0);
  score -= 8 * Math.abs(center.NL - 0.1);
  score -= 14 * Math.abs(center.YF + 0.5);

  // Interpersonal fit: strong mismatches raise friction even if the pair centroid looks acceptable.
  score -= 8 * gdDiff;
  score -= 7 * zrDiff;
  score -= 10 * nlDiff;
  score -= 12 * yfDiff;

  // Known unstable dyads from attachment / regulation logic.
  if (dualHyperactivation) score -= 16;
  if (pursueWithdraw) score -= 16;
  if (
    (a.ZR > 0.6 && b.ZR < -0.6) ||
    (b.ZR > 0.6 && a.ZR < -0.6)
  ) {
    score -= 8;
  }
  if (
    (a.NL > 0.6 && b.NL < -0.6) ||
    (b.NL > 0.6 && a.NL < -0.6)
  ) {
    score -= 10;
  }

  // Mild rewards for matched pacing and a calmer shared field.
  if (center.YF <= -0.4) score += 6;
  if (Math.abs(a.GD - b.GD) <= 0.4) score += 3;
  if (Math.abs(a.ZR - b.ZR) <= 0.4) score += 4;
  if (Math.abs(a.NL - b.NL) <= 0.4) score += 5;

  // Volatility hurts pair stability even when poles align.
  score -= volatilitySum * 5;

  return score;
}

function bestFactors(metrics: PairMetrics): NarrativeFactor[] {
  const factors: NarrativeFactor[] = [];

  if (metrics.center.YF <= -0.4) {
    factors.push({
      weight: 3.2,
      summary: '共享警觉较低，关系更容易稳定。',
      reason: '双方对不确定信号的放大倾向较低，不容易把一次延迟或沉默直接解释成关系危机。',
    });
  }
  if (metrics.nlDiff <= 0.4) {
    factors.push({
      weight: 3,
      summary: '亲密需求较同频，日常体感更一致。',
      reason: '双方对靠近与留白的需求更接近，不必长期在“太黏”与“太冷”之间拉扯。',
    });
  }
  if (metrics.gdDiff <= 0.4 && metrics.nlDiff <= 0.4) {
    factors.push({
      weight: 2.8,
      summary: '关系推进节奏接近，较少出现一追一逃。',
      reason: '主动性与靠近节奏较一致，关系更容易在协商中前进，而非由单方拖拽。',
    });
  }
  if (metrics.zrDiff <= 0.4) {
    factors.push({
      weight: 2.2,
      summary: '表达方式接近，沟通成本较低。',
      reason: '双方更接近同一种表达或克制节奏，冲突较容易说开，而不是互相误读。',
    });
  }
  if (metrics.yfDiff <= 0.5) {
    factors.push({
      weight: 2,
      summary: '安全感阈值接近，不必反复对表。',
      reason: '双方对关系确认的需求更接近，不容易出现“你太敏感”或“你太迟钝”的互相指责。',
    });
  }
  if (metrics.volatilitySum <= 0.9) {
    factors.push({
      weight: 1.6,
      summary: '整体波动较低，更容易沉淀出稳定互动。',
      reason: '双方都不太容易把一次互动迅速升级成系统性危机，关系场更平稳。',
    });
  }

  if (factors.length === 0) {
    factors.push({
      weight: 1,
      summary: '整体张力较低，仍属于可协商的组合。',
      reason: '虽然不存在单一突出优势，但主要维度没有形成高强度冲突，因此仍相对容易维持。',
    });
  }

  return factors.sort((a, b) => b.weight - a.weight);
}

function worstFactors(metrics: PairMetrics): NarrativeFactor[] {
  const factors: NarrativeFactor[] = [];

  if (metrics.dualHyperactivation) {
    factors.push({
      weight: 3.3,
      summary: '双方警觉都高，小信号也容易被放大。',
      reason: '两边都更容易把模糊信息读成危险，关系很容易在猜测与验证中反复过热。',
    });
  }
  if (metrics.pursueWithdraw) {
    factors.push({
      weight: 3.1,
      summary: '推进节奏错位，容易形成一追一逃。',
      reason: '一方更想靠近并推动关系，另一方更倾向后撤或降温，消耗会持续累积。',
    });
  }
  if (metrics.nlDiff > 1.2) {
    factors.push({
      weight: 2.8,
      summary: '亲密需求差距过大，关系体感很难一致。',
      reason: '一方需要更多靠近与回应，另一方更需要距离与缓冲，日常相处容易长期失拍。',
    });
  }
  if (metrics.yfDiff > 1.1) {
    factors.push({
      weight: 2.4,
      summary: '安全感阈值差距较大，彼此容易觉得对方失真。',
      reason: '一方更警觉，另一方更松弛，双方会对同一件事给出完全不同的危险判断。',
    });
  }
  if (metrics.zrDiff > 1.2) {
    factors.push({
      weight: 1.9,
      summary: '表达方式相冲，沟通成本偏高。',
      reason: '一方更外放，一方更压抑，情绪进入关系后更容易转化成误读而非修复。',
    });
  }
  if (metrics.gdDiff > 1.2) {
    factors.push({
      weight: 1.6,
      summary: '主动性落差较大，关系推进会失衡。',
      reason: '关系通常会由单方承担大部分推进成本，另一方则更容易显得迟缓、撤退或被动。',
    });
  }
  if (metrics.volatilitySum > 1.4) {
    factors.push({
      weight: 1.4,
      summary: '整体波动偏高，稳定性较弱。',
      reason: '至少一方的情绪或回应节奏波动较大，关系更难沉淀出可预测的稳定结构。',
    });
  }

  if (factors.length === 0) {
    factors.push({
      weight: 1,
      summary: '总体错配偏高，长期磨合成本会较重。',
      reason: '即便没有单一极端冲突，多个维度的小幅错位叠加后，仍会形成持续摩擦。',
    });
  }

  return factors.sort((a, b) => b.weight - a.weight);
}

function buildChoice(
  code: string,
  score: number,
  factors: NarrativeFactor[],
): CompatibilityChoice {
  return {
    code,
    score,
    summary: factors[0]?.summary ?? '',
    reasons: factors.slice(0, 3).map((factor) => factor.reason),
  };
}

const COMPATIBILITY_CACHE = new Map<string, CompatibilityOutcome>();

export function getCompatibilityOutcome(code: string): CompatibilityOutcome {
  const cached = COMPATIBILITY_CACHE.get(code);
  if (cached) return cached;

  const allCodes = Object.keys(personalities).filter(
    (candidate) => candidate !== code,
  );
  let bestCode = code;
  let worstCode = code;
  let bestScore = Number.NEGATIVE_INFINITY;
  let worstScore = Number.POSITIVE_INFINITY;

  for (const candidate of allCodes) {
    const score = pairScore(code, candidate);
    if (
      score > bestScore ||
      (score === bestScore && candidate.localeCompare(bestCode) < 0)
    ) {
      bestCode = candidate;
      bestScore = score;
    }
    if (
      score < worstScore ||
      (score === worstScore && candidate.localeCompare(worstCode) < 0)
    ) {
      worstCode = candidate;
      worstScore = score;
    }
  }

  const outcome = {
    best: buildChoice(bestCode, bestScore, bestFactors(getPairMetrics(code, bestCode))),
    worst: buildChoice(worstCode, worstScore, worstFactors(getPairMetrics(code, worstCode))),
  };
  COMPATIBILITY_CACHE.set(code, outcome);
  return outcome;
}
