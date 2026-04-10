import { createMemo, Show } from 'solid-js'
import { navigate } from 'vike/client/router'
import { usePageContext } from 'vike-solid/usePageContext'
import { ResultPage, retreatCount, setAnswers, setRetreatCount } from '../../src/App'
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
    // 分享链接解码进来时 retreatCount 恒为 0（当前 session 未答题），故「退退退」标签
    // 不会在观众端触发；只有从 /quiz 亲自提交过来的 session 才会带上非零的回退计数。
    return getResult(decoded, retreatCount())
  })

  return (
    <Show when={result()} fallback={<RedirectHome />}>
      <ResultPage
        result={result()!}
        onRestart={() => {
          setAnswers({})
          setRetreatCount(0)
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
