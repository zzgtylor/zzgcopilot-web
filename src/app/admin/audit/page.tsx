'use client'
import { useEffect, useState } from 'react'

type Log = { id: string; action: string; summary: string; target_type: string; user_name?: string; user_email?: string; ip_address?: string; created_at: string }

export default function AuditPage() {
  const [logs, setLogs] = useState<Log[]>([])
  const [query, setQuery] = useState('')
  const [page, setPage] = useState(1)
  const [total, setTotal] = useState(0)
  const [loading, setLoading] = useState(true)
  useEffect(() => {
    const timer = setTimeout(() => {
      setLoading(true)
      fetch(`/api/admin/audit?page=${page}&q=${encodeURIComponent(query)}`, { cache: 'no-store' }).then(response => response.json() as Promise<{ logs?: Log[]; total?: number }>).then(data => { setLogs(data.logs || []); setTotal(data.total || 0) }).finally(() => setLoading(false))
    }, 200)
    return () => clearTimeout(timer)
  }, [query, page])
  return <div className="p-5 sm:p-8"><div className="mb-7 flex flex-wrap items-end justify-between gap-4"><div><h1 className="text-2xl font-bold text-gray-900">操作日志</h1><p className="mt-1 text-sm text-gray-500">追踪登录、文章、媒体和用户管理操作</p></div><input value={query} onChange={event => { setQuery(event.target.value); setPage(1) }} placeholder="搜索操作、用户或说明" className="w-72 rounded-lg border px-3 py-2 text-sm"/></div><div className="overflow-hidden rounded-2xl border bg-white">{loading ? <div className="py-16 text-center text-gray-400">加载中…</div> : <div className="divide-y">{logs.map(log => <div key={log.id} className="grid gap-2 px-5 py-4 text-sm md:grid-cols-[170px_1fr_220px]"><div><code className="rounded bg-gray-100 px-2 py-1 text-xs text-gray-600">{log.action}</code><p className="mt-2 text-xs text-gray-400">{String(log.created_at).replace('T', ' ').slice(0, 19)}</p></div><div><p className="font-medium text-gray-800">{log.summary}</p><p className="mt-1 text-xs text-gray-400">对象：{log.target_type}</p></div><div className="text-gray-600"><p>{log.user_name || '系统'}{log.user_email ? ` · ${log.user_email}` : ''}</p>{log.ip_address && <p className="mt-1 text-xs text-gray-400">IP：{log.ip_address}</p>}</div></div>)}</div>}</div><div className="mt-5 flex items-center justify-between text-sm text-gray-500"><span>共 {total} 条记录</span><div className="flex gap-2"><button disabled={page <= 1} onClick={() => setPage(value => value - 1)} className="rounded border px-3 py-1.5 disabled:opacity-40">上一页</button><button disabled={page * 30 >= total} onClick={() => setPage(value => value + 1)} className="rounded border px-3 py-1.5 disabled:opacity-40">下一页</button></div></div></div>
}
