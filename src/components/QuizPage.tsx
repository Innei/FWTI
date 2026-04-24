import { For, Show } from 'solid-js'
import { ArrowRight } from 'lucide-solid'
import {
  resolveQuestionText,
  resolveOptionText,
  type Question,
} from '../copy/questions'
import {
  getRelationshipStatusV3 as getRelationshipStatus,
  type RelationshipStatusV3OrNull as RelationshipStatus,
} from '../logic/v3/flow'
import { quizPageCopy } from '../copy/ui'
import { TopNav } from './Nav'

export function QuizPage(props: {
  /** 当前路径（META + trunk + extensions[status] + 已触发 follow-up） */
  path: Question[]
  /** 当前路径中非 META 题总数 */
  mainTotal: number
  /** 已作答的路径内非 META 题数量 */
  mainProgress: number
  /** 前置题是否已作答 */
  metaAnswered: boolean
  answers: Record<number, number>
  onSelect: (qId: number, optionIdx: number) => void
  onSubmit: () => void
  canSubmit: boolean
}) {
  const pct = () =>
    props.mainTotal === 0
      ? 0
      : Math.round((props.mainProgress / props.mainTotal) * 100)
  // 根据前置题结果，派生当前的关系语境；未选时为 null（使用默认题干）
  const status = (): RelationshipStatus => getRelationshipStatus(props.answers)
  // 基于 path() 的 1-based 连续序号（跳过 META）。path 随 follow-up 触发而变长/变短，
  // 所以每次渲染都从当前 path 现算。
  const mainIndexOf = (qId: number): number => {
    let idx = 0
    for (const q of props.path) {
      if (q.dimension === 'META') continue
      idx += 1
      if (q.id === qId) return idx
    }
    return 0
  }
  const mainLeft = () => Math.max(0, props.mainTotal - props.mainProgress)
  const submitLabel = () => {
    if (props.canSubmit) return quizPageCopy.viewResult
    if (!props.metaAnswered) return quizPageCopy.completeMeta
    return quizPageCopy.remainingQuestions(mainLeft())
  }

  return (
    <div class="page quiz-page">
      <TopNav meta={quizPageCopy.topMeta(props.mainProgress, props.mainTotal)} />

      <section class="quiz-hero">
        <div class="quiz-hero-inner">
          <h1 class="quiz-hero-title">{quizPageCopy.heroTitle}</h1>
          <p class="quiz-hero-sub">{quizPageCopy.heroSubtitle}</p>
        </div>
      </section>

      <div class="quiz-list">
        <For each={props.path}>
          {(q) => (
            <article id={`q-${q.id}`} class="quiz-item">
              <div class="quiz-item-head">
                <Show
                  when={q.dimension !== 'META'}
                  fallback={
                    <span class="quiz-item-num quiz-item-num-meta">{quizPageCopy.metaBadge}</span>
                  }
                >
                  <span class="quiz-item-num">
                    Q{String(mainIndexOf(q.id)).padStart(2, '0')}
                  </span>
                </Show>
                <Show when={q.tag && q.dimension !== 'META'}>
                  <span class="quiz-item-tag">{q.tag}</span>
                </Show>
              </div>
              <p class="quiz-item-text">{resolveQuestionText(q, status())}</p>
              <Show when={q.dimension === 'META'}>
                <p class="quiz-item-note">{quizPageCopy.metaNote}</p>
              </Show>

              <div class="quiz-options" role="group" aria-label={quizPageCopy.optionGroupAria}>
                <For each={q.options}>
                  {(opt, oi) => (
                      <button
                        type="button"
                        class="quiz-opt"
                        classList={{
                          'is-selected': props.answers[q.id] === oi(),
                        }}
                        aria-pressed={props.answers[q.id] === oi()}
                        aria-label={quizPageCopy.optionAria(opt.label)}
                        onClick={() => props.onSelect(q.id, oi())}
                      >
                        <span class="quiz-opt-badge">{opt.label}</span>
                        <span class="quiz-opt-text">
                          {resolveOptionText(q, oi(), status())}
                        </span>
                      </button>
                  )}
                </For>
              </div>

              <Show when={q.dimension !== 'META'}>
                <div class="quiz-item-meter">
                  <span>
                    {mainIndexOf(q.id)} / {props.mainTotal}
                  </span>
                </div>
              </Show>
            </article>
          )}
        </For>
      </div>

      <div id="submit-bar" class="submit-bar">
        <div class="submit-bar-inner">
          <div class="submit-bar-progress">
            <div class="submit-progress-track">
              <div
                class="submit-progress-fill"
                style={{ width: `${pct()}%` }}
              />
            </div>
            <span class="submit-progress-pct">{pct()}%</span>
          </div>
          <button
            class="btn btn-green"
            onClick={props.onSubmit}
            disabled={!props.canSubmit}
          >
            <span>{submitLabel()}</span>
            <Show when={props.canSubmit}>
              <span class="btn-arrow" aria-hidden="true">
                <ArrowRight size={18} />
              </span>
            </Show>
          </button>
        </div>
      </div>
    </div>
  )
}
