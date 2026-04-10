import { navigate } from 'vike/client/router'
import { QuizPage, answers, setAnswers, totalQ } from '../../src/App'
import { questions } from '../../src/data/questions'
import { encodeAnswers } from '../../src/logic/codec'

export default function Page() {
  const progress = () => Object.keys(answers()).length

  function selectOption(qId: number, optionIdx: number) {
    setAnswers((prev) => ({ ...prev, [qId]: optionIdx }))
    queueMicrotask(() => scrollToNextUnanswered(qId))
  }

  function scrollToNextUnanswered(fromId: number) {
    const cur = answers()
    // 找到当前题在数组中的位置，然后向后（按 array 顺序）找第一道未答题
    const fromIdx = questions.findIndex((q) => q.id === fromId)
    for (let i = fromIdx + 1; i < questions.length; i++) {
      const q = questions[i]
      if (cur[q.id] === undefined) {
        const el = document.getElementById(`q-${q.id}`)
        if (el) el.scrollIntoView({ behavior: 'smooth', block: 'center' })
        return
      }
    }
    // 向后都答完了，再从头扫一遍兜底
    for (let i = 0; i < questions.length; i++) {
      const q = questions[i]
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
    const encoded = encodeAnswers(answers(), totalQ)
    void navigate(`/result/${encoded}`)
  }

  return (
    <QuizPage
      totalQ={totalQ}
      progress={progress()}
      answers={answers()}
      onSelect={selectOption}
      onSubmit={submitQuiz}
      canSubmit={progress() >= totalQ}
    />
  )
}
