'use client'
import { useEffect, useState } from 'react'

type Comment = { id: string; author_name: string; body: string; content_slug: string; report_count: number; created_at: string }
export default function AdminModerationQueue() {
  const [items, setItems] = useState<Comment[]>([])
  const load = () => fetch('/api/admin/comments', { cache: 'no-store' }).then(response => response.ok ? response.json() : { comments: [] }).then(data => setItems(data.comments || []))
  useEffect(() => { void load() }, [])
  async function moderate(id: string, status: string) { await fetch('/api/admin/comments', { method: 'PATCH', headers: { 'content-type': 'application/json' }, body: JSON.stringify({ id, status }) }); await load() }
  return <section className="mt-8 rounded-xl border border-gray-200 bg-white p-5"><h2 className="text-xl font-semibold">评论审核队列</h2>{items.length === 0 ? <p className="mt-3 text-sm text-gray-500">暂无待处理评论或举报。</p> : <div className="mt-4 space-y-4">{items.map(item => <article key={item.id} className="rounded-lg border p-4"><div className="flex flex-wrap justify-between gap-2"><strong>{item.author_name}</strong><span className="text-xs text-gray-500">举报 {item.report_count} 次 · {item.content_slug}</span></div><p className="mt-2 whitespace-pre-wrap text-sm">{item.body}</p><div className="mt-3 flex gap-2"><button onClick={() => moderate(item.id, 'approved')} className="rounded bg-green-700 px-3 py-1 text-sm text-white">通过</button><button onClick={() => moderate(item.id, 'spam')} className="rounded bg-red-700 px-3 py-1 text-sm text-white">标记垃圾</button><button onClick={() => moderate(item.id, 'trash')} className="rounded border px-3 py-1 text-sm">删除</button></div></article>)}</div>}</section>
}
