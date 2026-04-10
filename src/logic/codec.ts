export function encodeAnswers(
  answers: Record<number, number>,
  total: number,
): string {
  let s = '';
  for (let i = 1; i <= total; i++) {
    const v = answers[i];
    s += v === undefined ? '-' : String(v);
  }
  return btoa(s).replace(/=+$/, '').replace(/\+/g, '-').replace(/\//g, '_');
}

export function decodeAnswers(
  encoded: string,
  total: number,
): Record<number, number> | null {
  try {
    const b64 = encoded.replace(/-/g, '+').replace(/_/g, '/');
    const pad = b64.length % 4 === 0 ? '' : '='.repeat(4 - (b64.length % 4));
    const s = atob(b64 + pad);
    if (s.length !== total) return null;
    const out: Record<number, number> = {};
    for (let i = 0; i < total; i++) {
      const c = s[i];
      if (c === '-') continue;
      const n = Number(c);
      if (!Number.isInteger(n) || n < 0 || n > 9) return null;
      out[i + 1] = n;
    }
    return out;
  } catch {
    return null;
  }
}
