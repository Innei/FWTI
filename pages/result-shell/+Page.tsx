import { onMount } from 'solid-js'
import { navigate } from 'vike/client/router'

export default function Page() {
  onMount(() => {
    if (window.location.pathname === '/result-shell') {
      void navigate('/', { overwriteLastHistoryEntry: true })
    }
  })

  return null
}