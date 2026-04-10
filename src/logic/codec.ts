/**
 * v0.4 · 分享链接编解码 · 显式版本分流。
 *
 * 两种格式：
 *   v1 (legacy): 无前缀，直接是 base64url(digit-or-dash 序列)。对应 v0.3 的 32–34 位
 *     扁平 questionIds。解码走 `legacyQuestionIdsV1` + legacy scoring。
 *   v2 (current): `v2.<statusChar>.<payload>`，statusChar ∈ {d, a, c, s}，
 *     payload 与 v1 同形但针对 v0.4 的 questionIds（含主干 + 四状态 extensions + follow-ups）。
 *
 * 新链接必须走 v2（携带 status，便于 scoring 按路径过滤）。旧链接自动落入 legacy
 * 渲染并在 UI 上挂"旧版结果"徽标，不重新解释到 v0.4 规则。
 *
 * 关键安全线：不得尝试用 v0.4 scoring 解释 v1 answers——两者的题 id 空间已分叉，
 * 直接跨版本跑 getResult 会产生错误的维度归一化。decodeAnswers 返回的 version 字段
 * 就是消费者选择 scorer 的依据。
 */

import { questionIds as v2Ids } from '../data/questions';
import { legacyQuestionIdsV1 } from '../data/legacy/questions-v1';
import type { RelationshipStatus } from './scoring';

export type StatusChar = 'd' | 'a' | 'c' | 's';

const STATUS_TO_CHAR: Record<Exclude<RelationshipStatus, null>, StatusChar> = {
  dating: 'd',
  ambiguous: 'a',
  crush: 'c',
  solo: 's',
};

const CHAR_TO_STATUS: Record<StatusChar, Exclude<RelationshipStatus, null>> = {
  d: 'dating',
  a: 'ambiguous',
  c: 'crush',
  s: 'solo',
};

export type DecodedAnswers =
  | {
      version: 2;
      answers: Record<number, number>;
      status: Exclude<RelationshipStatus, null>;
    }
  | {
      version: 1;
      answers: Record<number, number>;
      status: null;
    };

// ───────────────────────────────────────────────────────────────
// base64url helpers
// ───────────────────────────────────────────────────────────────

function b64urlEncode(plain: string): string {
  return btoa(plain).replace(/=+$/, '').replace(/\+/g, '-').replace(/\//g, '_');
}

function b64urlDecode(b64url: string): string | null {
  try {
    const b64 = b64url.replace(/-/g, '+').replace(/_/g, '/');
    const pad = b64.length % 4 === 0 ? '' : '='.repeat(4 - (b64.length % 4));
    return atob(b64 + pad);
  } catch {
    return null;
  }
}

// ───────────────────────────────────────────────────────────────
// v2 encode / decode
// ───────────────────────────────────────────────────────────────

/**
 * v0.4 编码。ids 默认走当前 `questionIds`，调用方一般不必传。
 * 输出格式：`v2.<d|a|c|s>.<base64url(payload)>`。
 */
export function encodeAnswersV2(
  answers: Record<number, number>,
  status: Exclude<RelationshipStatus, null>,
  ids: readonly number[] = v2Ids,
): string {
  let payload = '';
  for (const id of ids) {
    const v = answers[id];
    payload += v === undefined ? '-' : String(v);
  }
  return `v2.${STATUS_TO_CHAR[status]}.${b64urlEncode(payload)}`;
}

function decodeV2(encoded: string): DecodedAnswers | null {
  const m = /^v2\.([dacs])\.([A-Za-z0-9_-]+)$/.exec(encoded);
  if (!m) return null;
  const status = CHAR_TO_STATUS[m[1] as StatusChar];
  const raw = b64urlDecode(m[2]);
  if (raw === null) return null;
  let payload = raw;
  // 向后兼容：v2 link 生成后，题库可能 append 新题 id。payload 长度 < 当前 ids 时右侧补 '-'。
  if (payload.length < v2Ids.length) {
    payload = payload + '-'.repeat(v2Ids.length - payload.length);
  }
  if (payload.length !== v2Ids.length) return null;
  const answers: Record<number, number> = {};
  for (let i = 0; i < v2Ids.length; i += 1) {
    const c = payload[i];
    if (c === '-') continue;
    const n = Number(c);
    if (!Number.isInteger(n) || n < 0 || n > 9) return null;
    answers[v2Ids[i]] = n;
  }
  return { version: 2, answers, status };
}

// ───────────────────────────────────────────────────────────────
// v1 decode (legacy, frozen)
// ───────────────────────────────────────────────────────────────

function decodeV1(encoded: string): DecodedAnswers | null {
  const raw = b64urlDecode(encoded);
  if (raw === null) return null;
  let payload = raw;
  // 老版本 link 可能更短（ATM 题上线前只有 32 位），右侧补 '-' 让旧链接依然可解码。
  if (payload.length < legacyQuestionIdsV1.length) {
    payload =
      payload + '-'.repeat(legacyQuestionIdsV1.length - payload.length);
  }
  if (payload.length !== legacyQuestionIdsV1.length) return null;
  const answers: Record<number, number> = {};
  for (let i = 0; i < legacyQuestionIdsV1.length; i += 1) {
    const c = payload[i];
    if (c === '-') continue;
    const n = Number(c);
    if (!Number.isInteger(n) || n < 0 || n > 9) return null;
    answers[legacyQuestionIdsV1[i]] = n;
  }
  return { version: 1, answers, status: null };
}

// ───────────────────────────────────────────────────────────────
// public decode entry · version-aware
// ───────────────────────────────────────────────────────────────

/**
 * 自动版本检测 · 先看前缀走 v2，否则回退 v1 legacy。
 * 返回 null 表示完全无法解析（两路都失败），调用方应 redirect 回首页。
 */
export function decodeAnswers(encoded: string): DecodedAnswers | null {
  if (!encoded) return null;
  if (encoded.startsWith('v2.')) {
    return decodeV2(encoded);
  }
  return decodeV1(encoded);
}

// ───────────────────────────────────────────────────────────────
// v1 encode · 已废弃（仅保留类型占位，不再被调用）
// ───────────────────────────────────────────────────────────────

/**
 * @deprecated v0.4 起所有新链接一律走 `encodeAnswersV2`。此函数仍保留
 * 签名以防第三方代码引用，但 quiz 页不再调用它。
 */
export function encodeAnswers(
  _answers: Record<number, number>,
  _ids: readonly number[],
): string {
  throw new Error(
    'encodeAnswers (v1) is deprecated; use encodeAnswersV2(answers, status) instead',
  );
}
