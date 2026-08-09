'use client'

import { useEffect } from 'react'

export function AnalyticsBeacon() {
  useEffect(() => {
    const send = (type: string, path = location.pathname, label = '') => {
      const payload = JSON.stringify({ type, path, label })
      if (navigator.sendBeacon) navigator.sendBeacon('/api/analytics', new Blob([payload], { type: 'application/json' }))
      else fetch('/api/analytics', { method: 'POST', headers: { 'content-type': 'application/json' }, body: payload, keepalive: true }).catch(() => undefined)
    }
    let lastUrl = ''
    const pageView = () => {
      const current = `${location.pathname}${location.search}`
      if (current === lastUrl) return
      lastUrl = current
      send('page_view', current)
      const search = new URLSearchParams(location.search).get('q')?.trim().slice(0, 80)
      if (search) send('search', location.pathname, search)
    }
    const onClick = (event: MouseEvent) => {
      const anchor = (event.target as Element | null)?.closest('a') as HTMLAnchorElement | null
      if (!anchor?.href) return
      const label = (anchor.dataset.analyticsLabel || anchor.textContent || '').trim().slice(0, 120)
      const url = new URL(anchor.href, location.href)
      const isDownload = Boolean(anchor.download) || /\.(pdf|docx?|xlsx?|pptx?|zip|rar|png|jpe?g)$/i.test(url.pathname)
      if (isDownload) send('download', location.pathname, label || url.pathname)
      else if (url.origin !== location.origin) send('external_click', location.pathname, label || url.hostname)
      else if (anchor.dataset.analyticsEvent === 'cta') send('cta_click', location.pathname, label || url.pathname)
    }
    const originalPush = history.pushState.bind(history)
    const originalReplace = history.replaceState.bind(history)
    history.pushState = (...args) => { originalPush(...args); queueMicrotask(pageView) }
    history.replaceState = (...args) => { originalReplace(...args); queueMicrotask(pageView) }
    window.addEventListener('popstate', pageView)
    document.addEventListener('click', onClick, { capture: true })
    pageView()
    return () => { history.pushState = originalPush; history.replaceState = originalReplace; window.removeEventListener('popstate', pageView); document.removeEventListener('click', onClick, { capture: true }) }
  }, [])
  return null
}
