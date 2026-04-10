import { metaQuestion } from '../data/questions';

export const metaQuestionId = metaQuestion.id;

/**
 * 前置题决定整套题的语境。若语境切换，则丢弃旧语境下的作答，
 * 只保留新的前置题答案，避免题干已变而答案仍沿用旧上下文。
 */
export function applyAnswerSelection(
  prev: Record<number, number>,
  qId: number,
  optionIdx: number,
): Record<number, number> {
  if (
    qId === metaQuestionId &&
    prev[qId] !== undefined &&
    prev[qId] !== optionIdx
  ) {
    return { [qId]: optionIdx };
  }
  return { ...prev, [qId]: optionIdx };
}
