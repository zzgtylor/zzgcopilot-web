'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'

type Post = { id: string; title: string; slug: string; status: 'draft' | 'published' | 'archived'; tags?: string[]; category_name?: string; view_count?: number; created_at?: string }

const pageSize = 12

export default function AdminPostsPage() {
  const [posts, setPosts] = useState<Post[]>([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState('all')
  const [query, setQuery] = useState('')
  const [search, setSearch] = useState('')
  const [page, setPage] = useState(1)
  const [total, setTotal] = useState(0)
  const [selected, setSelected] = useState<string[]>([])
  const [bulkAction, setBulkAction] = useState('')
  const [error, setError] = useState('')

  function load() {
    setLoading(true)
    setError('')
    const params = new URLSearchParams({ page: String(page), pageSize: String(pageSize) })
    if (filter !== 'all') params.set('status', filter)
    if (search) params.set('q', search)
    fetch('/api/admin/posts?' + params)
      .then(r => r.ok ? r.json() : Promise.reject())
      .then(d => { setPosts(d.posts || []); setTotal(d.total || 0); setSelected([]) })
      .catch(() => setError('加载失败，请刷新后重试。'))
      .finally(() => setLoading(false))
  }

  useEffect(() => { load() }, [page, filter, search])

  function switchFilter(next: string) { setFilter(next); setPage(1) }
  function submitSearch(event: React.FormEvent) { event.preventDefault(); setPage(1); setSearch(query.trim()) }

  async function remove(id: string, title: string) {
    if (!confirm('将文章「' + title + '」移入回收站？以后可以恢复。')) return
    const r = await fetch('/api/admin/posts?id=' + encodeURIComponent(id), { method: 'DELETE' }).catch(() => null)
    if (r?.ok) load(); else alert('操作失败')
  }

  async function restore(id: string) {
    const r = await fetch('/api/admin/posts', { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ id, action: 'restore' }) }).catch(() => null)
    if (r?.ok) load(); else alert('恢复失败')
  }

  async function runBulk() {
    if (!bulkAction || selected.length === 0) return
    const labels: Record<string, string> = { publish: '发布', draft: '转为草稿', archive: '移入回收站' }
    if (!confirm(`确定要将 ${selected.length} 篇文章${labels[bulkAction]}吗？`)) return
    const r = await fetch('/api/admin/posts', { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ ids: selected, action: bulkAction }) }).catch(() => null)
    if (r?.ok) { setBulkAction(''); load() } else alert('批量操作失败')
  }

  function toggle(id: string) { setSelected(current => current.includes(id) ? current.filter(value => value !== id) : [...current, id]) }
  const allSelected = posts.length > 0 && posts.every(post => selected.includes(post.id))
  const totalPages = Math.max(1, Math.ceil(total / pageSize))

  return (
    <div className="p-8">
      <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
        <div><h1 className="text-2xl font-bold text-gray-900">文章管理</h1><p className="mt-1 text-sm text-gray-500">共 {total} 篇文章</p></div>
        <Link href="/admin/posts/new" className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700">+ 发布文章</Link>
      </div>

      <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-wrap gap-2">
          {[['all', '全部'], ['published', '已发布'], ['draft', '草稿'], ['archived', '回收站']].map(([key, label]) => <button key={key} onClick={() => switchFilter(key)} className={'rounded-lg border px-3 py-1.5 text-sm ' + (filter === key ? 'border-blue-600 bg-blue-600 text-white' : 'bg-white text-gray-600 hover:bg-gray-50')}>{label}</button>)}
        </div>
        <form onSubmit={submitSearch} className="flex gap-2"><input value={query} onChange={event => setQuery(event.target.value)} placeholder="搜索标题或链接…" className="w-48 rounded-lg border px-3 py-2 text-sm outline-none focus:border-blue-500" /><button className="rounded-lg border bg-white px-3 py-2 text-sm text-gray-700 hover:bg-gray-50">搜索</button></form>
      </div>

      {error && <p className="mb-4 text-sm text-red-600">{error}</p>}
      {selected.length > 0 && <div className="mb-4 flex flex-wrap items-center gap-3 rounded-xl border border-blue-100 bg-blue-50 px-4 py-3 text-sm"><span className="font-medium text-blue-800">已选择 {selected.length} 篇</span><select value={bulkAction} onChange={event => setBulkAction(event.target.value)} className="rounded-md border bg-white px-2 py-1.5"><option value="">选择批量操作</option><option value="publish">发布</option><option value="draft">转为草稿</option><option value="archive">移入回收站</option></select><button type="button" onClick={runBulk} disabled={!bulkAction} className="rounded-md bg-blue-600 px-3 py-1.5 text-white disabled:opacity-50">应用</button></div>}

      <div className="overflow-hidden rounded-2xl border bg-white">
        {loading ? <div className="py-16 text-center text-gray-400">加载中…</div> : posts.length === 0 ? <div className="py-16 text-center text-gray-400"><p className="mb-4">没有找到文章</p><Link href="/admin/posts/new" className="text-sm text-blue-600">发布第一篇文章</Link></div> : (
          <table className="w-full text-sm"><thead><tr className="border-b bg-gray-50 text-left text-gray-500"><th className="w-12 px-4 py-3"><input type="checkbox" checked={allSelected} onChange={() => setSelected(allSelected ? [] : posts.map(post => post.id))} aria-label="选择当前页全部文章" /></th><th className="px-3 py-3 font-medium">标题</th><th className="px-4 py-3 font-medium">分类 / 标签</th><th className="px-4 py-3 font-medium">状态</th><th className="px-4 py-3 font-medium">浏览</th><th className="px-4 py-3 font-medium">创建日期</th><th className="px-4 py-3 text-right font-medium">操作</th></tr></thead><tbody className="divide-y">
            {posts.map(post => <tr key={post.id} className="hover:bg-gray-50"><td className="px-4 py-4"><input type="checkbox" checked={selected.includes(post.id)} onChange={() => toggle(post.id)} aria-label={'选择 ' + post.title} /></td><td className="px-3 py-4"><p className="font-medium text-gray-900">{post.title}</p><p className="mt-0.5 font-mono text-xs text-gray-400">/{post.slug}{post.status === 'published' && <a href={`/tutorials/${post.slug}`} target="_blank" rel="noreferrer" className="ml-2 text-blue-500 hover:underline">查看 ↗</a>}</p></td><td className="px-4 py-4 text-gray-600"><p>{post.category_name || '未分类'}</p>{post.tags?.length ? <p className="mt-1 text-xs text-gray-400">{post.tags.join(' · ')}</p> : null}</td><td className="px-4 py-4"><span className={'rounded-full px-2 py-0.5 text-xs ' + (post.status === 'published' ? 'bg-green-100 text-green-700' : post.status === 'archived' ? 'bg-gray-100 text-gray-600' : 'bg-yellow-100 text-yellow-700')}>{post.status === 'published' ? '已发布' : post.status === 'archived' ? '已删除' : '草稿'}</span></td><td className="px-4 py-4 text-gray-600">{post.view_count ?? 0}</td><td className="px-4 py-4 text-gray-400">{post.created_at?.split('T')[0]}</td><td className="px-4 py-4 text-right">{post.status !== 'archived' ? <><Link href={`/admin/posts/${post.id}/edit`} className="mr-4 text-blue-600 hover:text-blue-800">编辑</Link><button onClick={() => remove(post.id, post.title)} className="text-red-500 hover:text-red-700">移入回收站</button></> : <button onClick={() => restore(post.id)} className="text-blue-600 hover:text-blue-800">恢复为草稿</button>}</td></tr>)}
          </tbody></table>
        )}
      </div>
      {totalPages > 1 && <div className="mt-5 flex items-center justify-between text-sm text-gray-600"><span>第 {page} / {totalPages} 页</span><div className="flex gap-2"><button onClick={() => setPage(value => Math.max(1, value - 1))} disabled={page === 1} className="rounded-lg border bg-white px-3 py-2 disabled:opacity-40">上一页</button><button onClick={() => setPage(value => Math.min(totalPages, value + 1))} disabled={page === totalPages} className="rounded-lg border bg-white px-3 py-2 disabled:opacity-40">下一页</button></div></div>}
    </div>
  )
}
