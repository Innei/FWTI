import { onMount } from 'solid-js'
import { navigate } from 'vike/client/router'
import { HomePage, setAnswers, setRetreatCount } from '../../src/App'
import { resetTelemetryQuizRun, trackPageView } from '../../src/telemetry/client'

export default function Page() {
  onMount(() => {
    trackPageView('home')
  })

  return (
    <HomePage
      onStart={() => {
        setAnswers({})
        setRetreatCount(0)
        resetTelemetryQuizRun()
        void navigate('/quiz')
      }}
    />
  )
}
