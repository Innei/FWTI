import { onMount } from 'solid-js'
import { HistoryPage } from '../../src/components/HistoryPage'
import { trackPageView } from '../../src/telemetry/client'

export default function Page() {
  onMount(() => {
    trackPageView('history')
  })

  return <HistoryPage />
}
