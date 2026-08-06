'use client'
import { useEffect, useState } from 'react'

type Check = { key: string; label: string; status: 'good' | 'warning' | 'critical'; detail: string; href?: string }
export default function SiteHealthPage() {
  const [checks, setChecks] = useState<Check[]>([]); const [loading, setLoading] = useState(true); const [error, setError] = useState('')
  function load() { setLoading(true); setError(''); fetch('/api/admin/site-health', { cache: 'no-store' }).then(async r => { const d: any = await r.json(); if (!r.ok) throw new Error(d.error || '检查失败'); setChecks(d.checks || []) }).catch(e => setError(e.message)).finally(() => setLoading(false)) }
  useEffect(load, [])
  const problemCount = checks.filter(c => c.status !== 'good').length
  return <div className="p-8"><div className="mb-7 flex items-center justify-between"><div><h1 className="text-2xl font-bold text-gray-900">站点健康</h1><p className="mt-1 text-sm text-gray-500">集中检查数据库、媒体、发布、备份与账号安全。</p></div><button onClick={load} className="rounded-lg border bg-white px-4 py-2 text-sm">重新检查</button></div>
    {error && <p className="mb-5 rounded-lg bg-red-50 px-4 py-3 text-sm text-red-700">{error}</p>}
    {!loading && <div className={'mb-6 rounded-2xl border p-5 ' + (problemCount ? 'border-amber-200 bg-amber-50' : 'border-green-200 bg-green-50')}><p className="text-lg font-semibold">{problemCount ? `发现 ${problemCount} 项需要关注` : '所有主要检查均正常'}</p><p className="mt-1 text-sm opacity-75">红色项目需要优先处理；黄色项目不会立即影响网站，但建议完善。</p></div>}
    <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">{loading ? <div className="col-span-full py-16 text-center text-gray-400">正在执行检查…</div> : checks.map(check => { const box = <div className="rounded-2xl border bg-white p-5 transition hover:shadow-sm"><div className="flex items-center justify-between"><h2 className="font-semibold text-gray-900">{check.label}</h2><span className={'rounded-full px-2 py-1 text-xs ' + (check.status === 'good' ? 'bg-green-100 text-green-700' : check.status === 'warning' ? 'bg-amber-100 text-amber-700' : 'bg-red-100 text-red-700')}>{check.status === 'good' ? '正常' : check.status === 'warning' ? '建议改进' : '需要处理'}</span></div><p className="mt-3 text-sm leading-6 text-gray-600">{check.detail}</p></div>; return check.href ? <a key={check.key} href={check.href}>{box}</a> : <div key={check.key}>{box}</div> })}</div>
  </div>
}
