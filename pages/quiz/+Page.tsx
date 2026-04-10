import { navigate } from 'vike/client/router'
import {
  QuizPage,
  answers,
  setAnswers,
  setRetreatCount,
} from '../../src/App'
import { metaQuestionId, applyAnswerSelection } from '../../src/logic/answers'
import { encodeAnswersV2 } from '../../src/logic/codec'
import { getRelationshipStatus } from '../../src/logic/scoring'
import { buildQuestionPath, isPathComplete } from '../../src/logic/flow'

export default function Page() {
  const metaAnswered = () => answers()[metaQuestionId] !== undefined
  const status = () => getRelationshipStatus(answers())
  const path = () => buildQuestionPath(answers(), status())
  const nonMetaPath = () => path().filter((q) => q.dimension !== 'META')
  const mainTotal = () => nonMetaPath().length
  const mainProgress = () => {
    const cur = answers()
    return nonMetaPath().filter((q) => cur[q.id] !== undefined).length
  }
  const canSubmit = () => isPathComplete(answers(), status())

  function selectOption(qId: number, optionIdx: number) {
    // v0.3 · 「退退退」触发计数：只统计路径上的题"改答"——即已经选过一次、现在换成另一个
    // 选项。META 前置题的改动会走 applyAnswerSelection 的语境清空路径，不算在内；
    // 重复点击同一选项也不增加计数。
    const prev = answers()
    const isRetreat =
      qId !== metaQuestionId &&
      prev[qId] !== undefined &&
      prev[qId] !== optionIdx
    if (isRetreat) {
      setRetreatCount((n) => n + 1)
    }
    setAnswers((p) => applyAnswerSelection(p, qId, optionIdx))
    queueMicrotask(() => scrollToNextUnanswered(qId))
  }

  function scrollToNextUnanswered(fromId: number) {
    // 基于"当前路径"扫描而非全题库：follow-up 被触发后会立即进入 path，
    // 父题答案变更后失效的 follow-up 也会自动从 path 中消失。
    const cur = answers()
    const list = path()
    if (list.length === 0) return
    const fromIdx = list.findIndex((q) => q.id === fromId)
    const start = fromIdx === -1 ? 0 : fromIdx
    for (let step = 1; step <= list.length; step += 1) {
      const q = list[(start + step) % list.length]
      if (cur[q.id] === undefined) {
        const el = document.getElementById(`q-${q.id}`)
        if (el) el.scrollIntoView({ behavior: 'smooth', block: 'center' })
        return
      }
    }
    const submit = document.getElementById('submit-bar')
    if (submit) submit.scrollIntoView({ behavior: 'smooth', block: 'end' })
  }

  function submitQuiz() {
    const s = status()
    if (s === null) return // META 未答，按钮也 disabled，双保险
    const encoded = encodeAnswersV2(answers(), s)
    void navigate(`/result/${encoded}`)
  }

  return (
    <QuizPage
      path={path()}
      mainTotal={mainTotal()}
      mainProgress={mainProgress()}
      metaAnswered={metaAnswered()}
      answers={answers()}
      onSelect={selectOption}
      onSubmit={submitQuiz}
      canSubmit={canSubmit()}
    />
  )
}
