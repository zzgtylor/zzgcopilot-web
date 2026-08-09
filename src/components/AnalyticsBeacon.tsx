'use client'

import { useEffect } from 'react'

export function AnalyticsBeacon() {
  useEffect(() => {
    const payload = JSON.stringify({ path: `${location.pathname}${location.search}` })
    if (navigator.sendBeacon) navigator.sendBeacon('/api/analytics', new Blob([payload], { type: 'application/json' }))
    else fetch('/api/analytics', { method: 'POST', headers: { 'content-type': 'application/json' }, body: payload, keepalive: true }).catch(() => undefined)
  }, [])
  return null
}
