'use client'
import { useEffect, useState } from 'react'
import Link from 'next/link'

type EventInfo = { status?: string; created_at?: string; details?: string } | null
type Stats = { posts: number; published: number; drafts: number; scheduled: number; archived: number; users: number; comments: number; views: number; media: number; backup?: EventInfo; scheduler?: EventInfo; trend?: { view_date: string; views: number }[] }
type Post = { id: string; title: string; status: string; scheduled_at?: string | null; category_name?: string; created_at?: string; view_count?: number }
type Check = { key: string; label: string; count: number; hint: string; href: string }

function statusInfo(post: Post) {
  if (post.status === 'archived') return ['已删除', 'bg-gray-100 text-gray-600']
  if (post.status === 'published') return ['已发布', 'bg-green-100 text-green-700']
  if (post.scheduled_at) return ['定时发布', 'bg-blue-100 text-blue-700']
  return ['草稿', 'bg-yellow-100 text-yellow-700']
}

export default function AdminPage() {
  const [stats, setStats] = useState<Stats | null>(null)
  const [posts, setPosts] = useState<Post[]>([])
  const [checks, setChecks] = useState<Check[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    Promise.all([
      fetch('/api/admin/stats', { cache: 'no-store' }),
      fetch('/api/admin/posts?pageSize=10&sort=updated', { cache: 'no-store' }),
      fetch('/api/admin/publishing-health', { cache: 'no-store' }),
    ]).then(async ([statsResponse, postsResponse, healthResponse]) => {
      if (!statsResponse.ok || !postsResponse.ok || !healthResponse.ok) throw new Error('后台数据加载失败')
      const [s, p, h] = await Promise.all([statsResponse.json(), postsResponse.json(), healthResponse.json()]) as [Stats, { posts: Post[] }, { checks: Check[] }]
      setStats(s); setPosts((p.posts || []).slice(0, 10)); setChecks(h.checks || [])
    }).catch(() => setError('仪表盘数据加载失败，请刷新后重试。')).finally(() => setLoading(false))
  }, [])

  const cards = [
    { label: '文章总数', value: stats?.posts, detail: `${stats?.published || 0} 已发布 · ${stats?.drafts || 0} 草稿`, icon: '📝' },
    { label: '等待发布', value: stats?.scheduled, detail: '每分钟检查一次', icon: '🕒' },
    { label: '总浏览量', value: stats?.views, detail: '仅作站内趋势参考', icon: '📈' },
    { label: '媒体文件', value: stats?.media, detail: '不含回收站', icon: '🖼️' },
    { label: '启用用户', value: stats?.users, detail: '管理员可调整角色', icon: '👥' },
    { label: '评论总数', value: stats?.comments, detail: '全部评论', icon: '💬' },
  ]
  const maxTrend = Math.max(1, ...(stats?.trend || []).map(item => Number(item.views || 0)))

  return <div className="p-8">
    <div className="mb-8 flex items-center justify-between"><div><h1 className="text-2xl font-bold text-gray-900">仪表盘</h1><p className="mt-1 text-sm text-gray-500">内容、发布任务与运行状态</p></div><Link href="/admin/posts/new" className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700">+ 发布文章</Link></div>
    {error && <div className="mb-6 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">{error}</div>}

    <div className="mb-8 rounded-2xl border bg-white"><div className="flex items-center justify-between border-b px-6 py-4"><div><h2 className="font-semibold text-gray-900">发布检查</h2><p className="mt-0.5 text-xs text-gray-500">点击项目即可查看需要处理的文章</p></div><Link href="/admin/posts" className="text-sm text-blue-600 hover:underline">管理文章</Link></div><div className="grid gap-px bg-gray-100 sm:grid-cols-2 lg:grid-cols-4">{loading ? <div className="col-span-full bg-white px-6 py-8 text-center text-sm text-gray-400">检查中…</div> : checks.map(check => <Link href={check.href} key={check.key} className="bg-white px-5 py-4 transition hover:bg-blue-50"><p className={'text-2xl font-bold ' + (check.count ? 'text-amber-600' : 'text-green-600')}>{check.count}</p><p className="mt-1 text-sm font-medium text-gray-800">{check.label}</p><p className="mt-1 text-xs leading-5 text-gray-400">{check.hint}</p></Link>)}</div></div>

    <div className="mb-8 grid gap-5 sm:grid-cols-2 xl:grid-cols-3">{cards.map(card => <div key={card.label} className="flex items-center gap-4 rounded-2xl border bg-white p-5"><div className="flex h-12 w-12 items-center justify-center rounded-xl bg-blue-50 text-2xl">{card.icon}</div><div><p className="text-2xl font-bold text-gray-900">{loading ? '…' : card.value ?? '—'}</p><p className="text-sm font-medium text-gray-600">{card.label}</p><p className="mt-0.5 text-xs text-gray-400">{card.detail}</p></div></div>)}</div>

    <div className="mb-8 rounded-2xl border bg-white p-6"><div className="mb-5"><h2 className="font-semibold text-gray-900">最近 14 天阅读趋势</h2><p className="mt-1 text-xs text-gray-500">已排除常见爬虫和后台管理员预览</p></div>{stats?.trend?.length ? <div className="flex h-36 items-end gap-2">{stats.trend.map(item => <div key={item.view_date} className="flex min-w-0 flex-1 flex-col items-center justify-end gap-2"><span className="text-[10px] text-gray-400">{item.views}</span><div className="w-full rounded-t bg-blue-500" style={{ height: `${Math.max(4, Number(item.views) / maxTrend * 100)}%` }} title={`${item.view_date}: ${item.views} 次`}/><span className="text-[9px] text-gray-400">{item.view_date.slice(5)}</span></div>)}</div> : <div className="py-10 text-center text-sm text-gray-400">新统计将在读者访问文章后开始显示。</div>}</div>

    <div className="mb-8 grid gap-5 lg:grid-cols-2"><div className="rounded-2xl border bg-white p-5"><h2 className="font-semibold text-gray-900">定时发布任务</h2><p className="mt-2 text-sm text-gray-600">{stats?.scheduler?.created_at ? `最近运行：${String(stats.scheduler.created_at).replace('T', ' ').slice(0, 16)}` : '部署定时 Worker 后将在这里显示最近运行记录。'}</p></div><div className="rounded-2xl border bg-white p-5"><h2 className="font-semibold text-gray-900">最近备份</h2><p className="mt-2 text-sm text-gray-600">{stats?.backup?.created_at ? `最近成功：${String(stats.backup.created_at).replace('T', ' ').slice(0, 16)}` : '下次月度备份成功后将在这里显示记录。'}</p></div></div>

    <div className="rounded-2xl border bg-white"><div className="flex items-center justify-between border-b px-6 py-4"><h2 className="font-semibold text-gray-900">最近文章</h2><Link href="/admin/posts" className="text-sm text-blue-600 hover:underline">查看全部</Link></div>{loading ? <div className="py-16 text-center text-gray-400">加载中…</div> : posts.length === 0 ? <div className="py-16 text-center text-gray-400">还没有文章</div> : <div className="divide-y">{posts.map(post => { const [label, style] = statusInfo(post); return <div key={post.id} className="flex items-center justify-between px-6 py-4 hover:bg-gray-50"><div className="min-w-0 flex-1"><p className="truncate font-medium text-gray-900">{post.title}</p><p className="mt-0.5 text-xs text-gray-400">{post.category_name || '未分类'} · {String(post.created_at || '').slice(0, 10)}</p></div><div className="ml-4 flex items-center gap-3"><span className={`rounded-full px-2 py-0.5 text-xs ${style}`}>{label}</span><span className="text-xs text-gray-400">{post.view_count || 0} 浏览</span><Link href={`/admin/posts/${post.id}/edit`} className="text-xs text-blue-600">编辑</Link></div></div> })}</div>}</div>
  </div>
}
