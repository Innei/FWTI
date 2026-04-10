export type Family = 'gz' | 'gr' | 'dz' | 'dr';

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
};

export function getFamily(code: string): Family {
  const g = code[0] === 'G' ? 'g' : 'd';
  const z = code[1] === 'Z' ? 'z' : 'r';
  return (g + z) as Family;
}

export function getFamilyTheme(code: string): FamilyTheme {
  return FAMILY_THEMES[getFamily(code)];
}
