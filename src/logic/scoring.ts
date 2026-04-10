import { questions } from '../data/questions';
import { personalities, hiddenTitle } from '../data/personalities';

export interface Scores {
  GD: number; // + = G, - = D
  ZR: number; // + = Z, - = R
  NL: number; // + = N, - = L
  YF: number; // + = Y, - = F
  hidden: number; // 撤回大师纠结值
}

export interface Result {
  code: string;
  personality: typeof personalities[string];
  hasHiddenTitle: boolean;
  scores: Scores;
  dimensionLabels: { dim: string; labelA: string; labelB: string; valueA: number; valueB: number }[];
}

// 七点双极尺映射 (value 0-6) → 三选项索引 0/1/2 及权重
// 0 → A 满强；1 → A 六成；2 → A 三成；3 → B（中立）；4 → C 三成；5 → C 六成；6 → C 满强
const SCALE_MAP: { idx: number; weight: number }[] = [
  { idx: 0, weight: 1 },
  { idx: 0, weight: 0.66 },
  { idx: 0, weight: 0.33 },
  { idx: 1, weight: 1 },
  { idx: 2, weight: 0.33 },
  { idx: 2, weight: 0.66 },
  { idx: 2, weight: 1 },
];

export function resolveScale(value: number): { idx: number; weight: number } | null {
  if (!Number.isInteger(value) || value < 0 || value > 6) return null;
  return SCALE_MAP[value];
}

export function calculateScores(answers: Record<number, number>): Scores {
  const scores: Scores = { GD: 0, ZR: 0, NL: 0, YF: 0, hidden: 0 };

  for (const q of questions) {
    const raw = answers[q.id];
    if (raw === undefined) continue;
    const resolved = resolveScale(raw);
    if (!resolved) continue;
    const option = q.options[resolved.idx];
    if (!option) continue;

    if (q.tag === '彩蛋') {
      scores.hidden += (option.hidden ?? 0) * resolved.weight;
      continue;
    }

    const delta = option.score * resolved.weight;
    switch (q.dimension) {
      case 'GD': scores.GD += delta; break;
      case 'ZR': scores.ZR += delta; break;
      case 'NL': scores.NL += delta; break;
      case 'YF': scores.YF += delta; break;
    }
  }

  return scores;
}

export function getResult(answers: Record<number, number>): Result {
  const scores = calculateScores(answers);

  // 当得分为0时，取更"废"的方向: D, Z, N, Y
  const g = scores.GD > 0 ? 'G' : 'D';
  const z = scores.ZR > 0 ? 'Z' : 'R';
  const n = scores.NL > 0 ? 'N' : 'L';
  const y = scores.YF > 0 ? 'Y' : 'F';

  const code = g + z + n + y;
  const personality = personalities[code];
  const hasHiddenTitle = scores.hidden >= hiddenTitle.threshold;

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

  return { code, personality, hasHiddenTitle, scores, dimensionLabels };
}
