'use client'
import { useState } from 'react'
import { TurnstileBox } from './TurnstileBox'

export function MemberLoginForm({ siteKey }: { siteKey: string }) {
  const [token, setToken] = useState(''), [message, setMessage] = useState('')
  async function submit(formData: FormData) {
    const response = await fetch('/api/member/request-link', { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify({ email: formData.get('email'), turnstileToken: token }) })
    const result = await response.json() as { message?: string; error?: string }; setMessage(result.message || result.error || '请求失败')
  }
  return <form action={submit} className="mt-6 space-y-4"><input name="email" type="email" required placeholder="你的邮箱" className="w-full rounded border px-3 py-2"/><TurnstileBox siteKey={siteKey} onToken={setToken}/><button disabled={!token} className="rounded bg-[var(--site-primary)] px-5 py-2.5 text-white disabled:opacity-50">发送登录链接</button>{message && <p className="text-sm">{message}</p>}</form>
}
