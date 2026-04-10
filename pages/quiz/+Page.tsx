import { navigate } from 'vike/client/router'
import {
  QuizPage,
  answers,
  setAnswers,
  setRetreatCount,
  mainQ,
} from '../../src/App'
import { questions, questionIds } from '../../src/data/questions'
import { metaQuestionId, applyAnswerSelection } from '../../src/logic/answers'
import { encodeAnswers } from '../../src/logic/codec'

export default function Page() {
  const metaAnswered = () => answers()[metaQuestionId] !== undefined
  const mainProgress = () => {
    const cur = answers()
    let n = 0
    for (const q of questions) {
      if (q.dimension === 'META') continue
      if (cur[q.id] !== undefined) n += 1
    }
    return n
  }

  function selectOption(qId: number, optionIdx: number) {
    // v0.3 · 「退退退」触发计数：只统计主线题的"改答"——即已经选过一次、现在换成另一个
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
    const cur = answers()
    // 从当前题的下一题开始、环形扫描一圈找第一道未答题
    const n = questions.length
    const fromIdx = questions.findIndex((q) => q.id === fromId)
    for (let step = 1; step <= n; step++) {
      const q = questions[(fromIdx + step) % n]
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
    const encoded = encodeAnswers(answers(), questionIds)
    void navigate(`/result/${encoded}`)
  }

  return (
    <QuizPage
      mainTotal={mainQ}
      mainProgress={mainProgress()}
      metaAnswered={metaAnswered()}
      answers={answers()}
      onSelect={selectOption}
      onSubmit={submitQuiz}
      canSubmit={metaAnswered() && mainProgress() >= mainQ}
    />
  )
}
