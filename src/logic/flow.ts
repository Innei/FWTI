/**
 * v0.4 · 动态题路径引擎。
 *
 * 输入：`answers`（已作答映射）+ `status`（META 解码后的关系语境）。
 * 输出：当前应当出现的题目有序列表（含已作答与未作答），follow-up 已按
 * 父题选项展开。UI 迭代此列表渲染；scoring 迭代此列表取 ratio 分母。
 *
 * 关键性质：
 *   1. 纯函数 · 同输入恒同输出，可放心 memo。
 *   2. META 永远在首位。未答 META 时路径只含 META 一题。
 *   3. 状态切换（改 META 答案）会在上游 `applyAnswerSelection` 清空其他作答，
 *      本函数无需感知——拿到的 `answers` 已经是新语境的空壳。
 *   4. 父题答案变更会自动改变 follow-up 插入——旧 follow-up 直接从路径中消失，
 *      对应的 `answers[childId]` 留在 map 中但不再参与路径与评分（惰性清理）。
 *   5. 递归深度硬上限 2：follow-up 的 follow-up 允许，但它们不能再有 follow-up。
 *      该约束由 `src/data/questions.ts` 的 invariant 层强制，本函数只管执行。
 */

import {
  metaQuestion,
  trunk,
  extensions,
  followups,
  type Question,
  type StatusKey,
} from '../data/questions';
import type { RelationshipStatus } from './scoring';

const MAX_FOLLOWUP_DEPTH = 2;

export interface FlowStep {
  question: Question;
  /** 1-based · 非 META 段中的序号 */
  index: number;
  /** 当前路径的非 META 题总数 */
  total: number;
}

const toStatusKey = (s: RelationshipStatus): StatusKey | null =>
  s === 'dating' || s === 'ambiguous' || s === 'crush' || s === 'solo'
    ? s
    : null;

/**
 * 构建当前路径。META 未答时仅返回 `[metaQuestion]`。
 * 已答 META 时：META → trunk → extensions[status] → 按父题选项展开 follow-up。
 */
export function buildQuestionPath(
  answers: Record<number, number>,
  status: RelationshipStatus,
): Question[] {
  const path: Question[] = [metaQuestion];
  const key = toStatusKey(status);
  if (!key) return path;

  const baseSequence: Question[] = [...trunk, ...extensions[key]];
  for (const q of baseSequence) {
    path.push(q);
    appendFollowupsIfTriggered(path, q, answers, 0);
  }
  return path;
}

function appendFollowupsIfTriggered(
  path: Question[],
  parent: Question,
  answers: Record<number, number>,
  depth: number,
): void {
  if (depth >= MAX_FOLLOWUP_DEPTH) return;
  const ans = answers[parent.id];
  if (ans === undefined) return;
  const branches = followups[parent.id];
  if (!branches) return;
  const children = branches[ans];
  if (!children || children.length === 0) return;
  for (const child of children) {
    path.push(child);
    appendFollowupsIfTriggered(path, child, answers, depth + 1);
  }
}

/**
 * 返回当前路径中第一道未答的非 META 题，附带 1-based 序号与当前非 META 总数。
 * 全部答完时返回 null。META 未答时返回 META 自身，序号为 0、total 为 0。
 */
export function nextQuestion(
  answers: Record<number, number>,
  status: RelationshipStatus,
): FlowStep | null {
  const path = buildQuestionPath(answers, status);
  if (answers[metaQuestion.id] === undefined) {
    return { question: metaQuestion, index: 0, total: 0 };
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

/**
 * 判断当前路径是否全部作答完毕（用于 quiz 提交按钮 enable 判断）。
 */
export function isPathComplete(
  answers: Record<number, number>,
  status: RelationshipStatus,
): boolean {
  if (answers[metaQuestion.id] === undefined) return false;
  const path = buildQuestionPath(answers, status);
  return path.every((q) => answers[q.id] !== undefined);
}
