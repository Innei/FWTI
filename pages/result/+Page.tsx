import { createMemo, Show } from 'solid-js'
import { navigate } from 'vike/client/router'
import { usePageContext } from 'vike-solid/usePageContext'
import { ResultPage, setAnswers, totalQ } from '../../src/App'
import { decodeAnswers } from '../../src/logic/codec'
import { getResult, type Result } from '../../src/logic/scoring'

export default function Page() {
  const pageContext = usePageContext()

  const result = createMemo<Result | null>(() => {
    const hash = pageContext.routeParams?.hash
    if (!hash) return null
    const decoded = decodeAnswers(hash, totalQ)
    if (!decoded) return null
    for (let i = 1; i <= totalQ; i++) {
      if (decoded[i] === undefined) return null
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
