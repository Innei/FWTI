export type Family =
  | 'gz'
  | 'gr'
  | 'dz'
  | 'dr'
  | 'all'
  | 'rat'
  | 'pure'
  | 'mad'
  | 'edog'
  | 'chaos'
  | 'cpu'
  | 'bench'
  | 'void'
  | 'limbo';

export interface FamilyTheme {
  key: Family;
  name: string;
  color: string;
  tint: string;
}

export const FAMILY_THEMES: Record<Family, FamilyTheme> = {
  gz: { key: 'gz', name: '冲动暴躁', color: '#F25E62', tint: 'rgba(242, 94, 98, 0.08)' },
  gr: { key: 'gr', name: '冲动忍耐', color: '#E4AE3A', tint: 'rgba(228, 174, 58, 0.10)' },
  dz: { key: 'dz', name: '犹豫暴躁', color: '#88619A', tint: 'rgba(136, 97, 154, 0.08)' },
  dr: { key: 'dr', name: '犹豫忍耐', color: '#33A474', tint: 'rgba(51, 164, 116, 0.08)' },
  // v0.3 隐藏人格：每型自有配色（对应 PROMPT.md §5 各条目的 family color cue）。
  all: { key: 'all', name: '我全都要', color: '#6B7280', tint: 'rgba(107, 114, 128, 0.10)' },
  rat: { key: 'rat', name: '鼠鼠恋人', color: '#4A4A4A', tint: 'rgba(74, 74, 74, 0.10)' },
  pure: { key: 'pure', name: '纯爱战士', color: '#D4A574', tint: 'rgba(212, 165, 116, 0.10)' },
  mad: { key: 'mad', name: '发疯文学家', color: '#C73E3E', tint: 'rgba(199, 62, 62, 0.10)' },
  edog: { key: 'edog', name: '赛博舔狗', color: '#E8A5C8', tint: 'rgba(232, 165, 200, 0.10)' },
  chaos: { key: 'chaos', name: '已读乱回', color: '#B7A4D1', tint: 'rgba(183, 164, 209, 0.10)' },
  cpu: { key: 'cpu', name: 'CPU 恋人', color: '#E07A2B', tint: 'rgba(224, 122, 43, 0.10)' },
  bench: { key: 'bench', name: '备胎之王', color: '#CBB89A', tint: 'rgba(203, 184, 154, 0.10)' },
  void: { key: 'void', name: '电子断联户', color: '#3B4252', tint: 'rgba(59, 66, 82, 0.10)' },
  limbo: { key: 'limbo', name: '意难平学家', color: '#5A3A5E', tint: 'rgba(90, 58, 94, 0.10)' },
};

/** 隐藏人格代号 → family key 映射 */
const HIDDEN_FAMILY_MAP: Record<string, Family> = {
  ALL: 'all',
  RAT: 'rat',
  PURE: 'pure',
  MAD: 'mad',
  'E-DOG': 'edog',
  CHAOS: 'chaos',
  CPU: 'cpu',
  BENCH: 'bench',
  VOID: 'void',
  LIMBO: 'limbo',
};

export function getFamily(code: string): Family {
  const hidden = HIDDEN_FAMILY_MAP[code];
  if (hidden) return hidden;
  const g = code[0] === 'G' ? 'g' : 'd';
  const z = code[1] === 'Z' ? 'z' : 'r';
  return (g + z) as Family;
}

export function getFamilyTheme(code: string): FamilyTheme {
  return FAMILY_THEMES[getFamily(code)];
}
