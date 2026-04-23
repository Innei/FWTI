/**
 * FWTI v3 · 题路径引擎（极简版）
 *
 * v3 的核心简化：
 *   - 无 extensions 分支（status 仅改措辞，题目同一套 32 道）
 *   - 无 follow-up 子题（扁平结构）
 *   - META 未答 → 路径只有 META
 *   - META 已答 → META + 32 道按 `questionIdsV3` 顺序
 *
 * 同 v2 同名接口，便于 UI 复用：`buildQuestionPathV3` / `nextQuestionV3` / `isPathCompleteV3`。
 */

import {
  metaQuestionV3,
  questionsV3,
  SOLO_EXCLUDED_IDS_V3,
  SOLO_ONLY_IDS_V3,
} from '../../copy/v3/questions';
import type { QuestionV3 } from '../../copy/v3/types';
import type { RelationshipStatusV3 } from './codec';

export type RelationshipStatusV3OrNull = RelationshipStatusV3 | null;

export interface FlowStepV3 {
  question: QuestionV3;
  index: number; // 1-based
  total: number;
}

export function buildQuestionPathV3(
  answers: Record<number, number>,
  status: RelationshipStatusV3OrNull,
): QuestionV3[] {
  if (status === null) return [metaQuestionV3];
  // solo 路径：剔除 5 道以"假设恋爱 / 暗恋 / 前任"为锚的题，保留 solo-only 补题。
  // 非 solo：保留原 32 题，剔除 solo-only 补题。
  // 两支皆 32 道非 META，且每维 8 题（4+/4- A 极性），见 questions.ts §五 注。
  const filtered =
    status === 'solo'
      ? questionsV3.filter((q) => !SOLO_EXCLUDED_IDS_V3.has(q.id))
      : questionsV3.filter((q) => !SOLO_ONLY_IDS_V3.has(q.id));
  return [metaQuestionV3, ...filtered];
}

export function nextQuestionV3(
  answers: Record<number, number>,
  status: RelationshipStatusV3OrNull,
): FlowStepV3 | null {
  const path = buildQuestionPathV3(answers, status);
  if (answers[metaQuestionV3.id] === undefined) {
    return { question: metaQuestionV3, index: 0, total: 0 };
  }
  const nonMeta = path.filter((q) => q.dimension !== 'META');
  const total = nonMeta.length;
  for (let i = 0; i < nonMeta.length; i += 1) {
    const q = nonMeta[i];
    if (answers[q.id] === undefined) {
      return { question: q, index: i + 1, total };
    }
  }
  return null;
}

export function isPathCompleteV3(
  answers: Record<number, number>,
  status: RelationshipStatusV3OrNull,
): boolean {
  if (answers[metaQuestionV3.id] === undefined) return false;
  const path = buildQuestionPathV3(answers, status);
  return path.every((q) => answers[q.id] !== undefined);
}

/** 依 META 选项读取 status。返回 null 表示 META 未答或无效。 */
export function getRelationshipStatusV3(
  answers: Record<number, number>,
): RelationshipStatusV3OrNull {
  const idx = answers[metaQuestionV3.id];
  if (idx === undefined) return null;
  const opt = metaQuestionV3.options[idx];
  if (!opt) return null;
  return (opt.meta as RelationshipStatusV3) ?? null;
}
