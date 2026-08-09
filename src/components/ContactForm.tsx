'use client'
import { useState } from 'react'
import { TurnstileBox } from './TurnstileBox'

export function ContactForm({ siteKey }: { siteKey: string }) {
  const [token, setToken] = useState(''), [message, setMessage] = useState('')
  async function submit(formData: FormData) {
    const response = await fetch('/api/contact', { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify({ name: formData.get('name'), email: formData.get('email'), message: formData.get('message'), sourcePath: location.pathname, turnstileToken: token }) })
    const result = await response.json() as { message?: string; error?: string }; setMessage(result.message || result.error || '提交失败')
  }
  return <section className="mx-auto max-w-2xl px-5 py-12"><h2 className="text-2xl font-bold">联系我们</h2><form action={submit} className="mt-5 space-y-3"><input name="name" required placeholder="姓名" className="w-full rounded border px-3 py-2"/><input name="email" type="email" required placeholder="邮箱" className="w-full rounded border px-3 py-2"/><textarea name="message" required rows={5} placeholder="留言" className="w-full rounded border px-3 py-2"/><TurnstileBox siteKey={siteKey} onToken={setToken}/><button disabled={!token} className="rounded bg-[var(--site-primary)] px-5 py-2.5 text-white disabled:opacity-50">发送</button>{message && <p className="text-sm">{message}</p>}</form></section>
}
