'use client'

import { useEffect, useState } from 'react'

declare global { interface Window { turnstile?: { render: (element: HTMLElement, options: Record<string, unknown>) => string } } }

type Comment = { id: string; author_name: string; body: string; created_at: string }

export function Comments({ contentId, slug, siteKey }: { contentId: string; slug: string; siteKey: string }) {
  const [comments, setComments] = useState<Comment[]>([])
  const [token, setToken] = useState('')
  const [message, setMessage] = useState('')
  useEffect(() => { fetch(`/api/comments?contentId=${encodeURIComponent(contentId)}`).then(r => r.json() as Promise<{ comments?: Comment[] }>).then(data => setComments(data.comments || [])).catch(() => undefined) }, [contentId])
  useEffect(() => {
    if (!siteKey) return
    const render = () => { const target = document.getElementById(`turnstile-${contentId}`); if (target && window.turnstile && !target.childElementCount) window.turnstile.render(target, { sitekey: siteKey, callback: setToken }) }
    const existing = document.querySelector('script[data-turnstile]')
    if (existing) { render(); return }
    const script = document.createElement('script'); script.src = 'https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit'; script.async = true; script.defer = true; script.dataset.turnstile = 'true'; script.onload = render; document.head.appendChild(script)
  }, [contentId, siteKey])

  async function submit(formData: FormData) {
    setMessage('正在提交…')
    const response = await fetch('/api/comments', { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify({ contentId, slug, name: formData.get('name'), email: formData.get('email'), body: formData.get('body'), turnstileToken: token }) })
    const result = await response.json() as { message?: string; error?: string }
    setMessage(result.message || result.error || '提交失败')
  }

  return <section className="mt-14 border-t border-gray-200 pt-8"><h2 className="text-2xl font-bold">评论</h2>{comments.length ? <div className="mt-5 space-y-4">{comments.map(comment => <article key={comment.id} className="rounded-lg border border-gray-200 p-4"><strong>{comment.author_name}</strong><p className="mt-2 whitespace-pre-wrap text-gray-700">{comment.body}</p><time className="mt-2 block text-xs text-gray-400">{comment.created_at}</time></article>)}</div> : <p className="mt-3 text-sm text-gray-500">还没有公开评论。</p>}
    {siteKey ? <form action={submit} className="mt-7 space-y-3"><div className="grid gap-3 sm:grid-cols-2"><input name="name" required maxLength={80} placeholder="姓名" className="rounded border border-gray-300 px-3 py-2"/><input name="email" type="email" required maxLength={160} placeholder="邮箱（不会公开）" className="rounded border border-gray-300 px-3 py-2"/></div><textarea name="body" required maxLength={4000} rows={5} placeholder="写下评论…" className="w-full rounded border border-gray-300 px-3 py-2"/><div id={`turnstile-${contentId}`} /><button type="submit" disabled={!token} className="rounded bg-[var(--site-primary)] px-5 py-2.5 text-white disabled:opacity-50">提交审核</button>{message && <p className="text-sm text-gray-600">{message}</p>}</form> : <p className="mt-5 rounded bg-amber-50 p-3 text-sm text-amber-900">管理员需先配置 Turnstile 才能接收评论。</p>}
  </section>
}
