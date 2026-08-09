'use client'
import { useEffect, useId } from 'react'

declare global { interface Window { turnstile?: { render: (element: HTMLElement, options: Record<string, unknown>) => string } } }

export function TurnstileBox({ siteKey, onToken }: { siteKey: string; onToken: (token: string) => void }) {
  const reactId = useId(), id = `captcha-${reactId.replace(/:/g, '')}`
  useEffect(() => {
    if (!siteKey) return
    const render = () => { const target = document.getElementById(id); if (target && window.turnstile && !target.childElementCount) window.turnstile.render(target, { sitekey: siteKey, callback: onToken }) }
    const existing = document.querySelector('script[data-turnstile]')
    if (existing) { render(); return }
    const script = document.createElement('script'); script.src = 'https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit'; script.async = true; script.defer = true; script.dataset.turnstile = 'true'; script.onload = render; document.head.appendChild(script)
  }, [id, onToken, siteKey])
  return siteKey ? <div id={id} /> : <p className="text-sm text-amber-800">管理员尚未配置 Turnstile。</p>
}
