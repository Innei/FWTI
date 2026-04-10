import { navigate } from 'vike/client/router'
import type { OnHydrationEndSync } from 'vike/types'

export const onHydrationEnd: OnHydrationEndSync = (pageContext) => {
  const pathname = window.location.pathname

  if (!pathname.startsWith('/result/')) return
  if (pageContext.routeParams?.hash) return

  const url = `${pathname}${window.location.search}${window.location.hash}`
  void navigate(url, { overwriteLastHistoryEntry: true })
}