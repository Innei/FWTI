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

export function calculateScores(answers: Record<number, number>): Scores {
  const scores: Scores = { GD: 0, ZR: 0, NL: 0, YF: 0, hidden: 0 };

  for (const q of questions) {
    const answerIdx = answers[q.id];
    if (answerIdx === undefined) continue;
    const option = q.options[answerIdx];
    if (!option) continue;

    // 彩蛋题不计入维度
    if (q.tag === '彩蛋') {
      scores.hidden += option.hidden ?? 0;
      continue;
    }

    switch (q.dimension) {
      case 'GD': scores.GD += option.score; break;
      case 'ZR': scores.ZR += option.score; break;
      case 'NL': scores.NL += option.score; break;
      case 'YF': scores.YF += option.score; break;
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
