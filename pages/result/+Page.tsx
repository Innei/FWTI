import { createMemo, Show } from 'solid-js'
import { navigate } from 'vike/client/router'
import { usePageContext } from 'vike-solid/usePageContext'
import { ResultPage, setAnswers } from '../../src/App'
import { questionIds } from '../../src/data/questions'
import { decodeAnswers } from '../../src/logic/codec'
import { getResult, type Result } from '../../src/logic/scoring'

export default function Page() {
  const pageContext = usePageContext()

  const result = createMemo<Result | null>(() => {
    const hash = pageContext.routeParams?.hash
    if (!hash) return null
    const decoded = decodeAnswers(hash, questionIds)
    if (!decoded) return null
    for (const id of questionIds) {
      if (decoded[id] === undefined) return null
    }
    return getResult(decoded)
  })

  return (
    <Show when={result()} fallback={<RedirectHome />}>
      <ResultPage
        result={result()!}
        onRestart={() => {
          setAnswers({})
          void navigate('/')
        }}
      />
    </Show>
  )
}

function RedirectHome() {
  void navigate('/')
  return null
}
