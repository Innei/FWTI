/**
 * 把答案按给定的题目 ID 列表顺序编码成一个字符串。
 * 每个位置对应 ids[i] 这道题的答案：未作答记 '-'，否则一位数字。
 *
 * 编码顺序完全由 ids 数组决定，不再隐式依赖"ID 是紧凑的 1..n"。
 * 生产上请传一份稳定排序后的 ID（见 src/data/questions.ts 的 questionIds），
 * 这样即使将来题库插入跳号 ID 也不会破坏现有分享链接。
 */
export function encodeAnswers(
  answers: Record<number, number>,
  ids: readonly number[],
): string {
  let s = '';
  for (const id of ids) {
    const v = answers[id];
    s += v === undefined ? '-' : String(v);
  }
  return btoa(s).replace(/=+$/, '').replace(/\+/g, '-').replace(/\//g, '_');
}

export function decodeAnswers(
  encoded: string,
  ids: readonly number[],
): Record<number, number> | null {
  try {
    const b64 = encoded.replace(/-/g, '+').replace(/_/g, '/');
    const pad = b64.length % 4 === 0 ? '' : '='.repeat(4 - (b64.length % 4));
    const s = atob(b64 + pad);
    if (s.length !== ids.length) return null;
    const out: Record<number, number> = {};
    for (let i = 0; i < ids.length; i++) {
      const c = s[i];
      if (c === '-') continue;
      const n = Number(c);
      if (!Number.isInteger(n) || n < 0 || n > 9) return null;
      out[ids[i]] = n;
    }
    return out;
  } catch {
    return null;
  }
}
