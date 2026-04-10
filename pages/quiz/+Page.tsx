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
    for (let i = 0; i < questions.length; i++) {
      const q = questions[i]
      if (q.id <= fromId) continue
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
