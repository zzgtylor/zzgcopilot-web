'use client'
import { useState, useEffect } from 'react'
import Link from 'next/link'

export default function AdminPage() {
  const [stats, setStats] = useState(null)
  const [posts, setPosts] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    Promise.all([
      fetch('/api/admin/stats').then(r => r.ok ? r.json() : null).catch(() => null),
      fetch('/api/admin/posts').then(r => r.ok ? r.json() : {posts: []}).catch(() => ({posts: []})),
    ]).then(([s, p]) => {
      setStats(s)
      setPosts((p?.posts || []).slice(0, 10))
      setLoading(false)
    })
  }, [])

  return (
    <div className="p-8">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">仪表盘</h1>
          <p className="text-gray-500 text-sm mt-1">欢迎回来，管理员</p>
        </div>
        <Link href="/admin/posts/new" className="px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700">+ 发布文章</Link>
      </div>

      <div className="grid grid-cols-3 gap-5 mb-8">
        {[
          {label: '文章总数', value: stats?.posts ?? '—', icon: '📝', bg: 'bg-blue-50 text-blue-700'},
          {label: '用户总数', value: stats?.users ?? '—', icon: '👥', bg: 'bg-green-50 text-green-700'},
          {label: '评论总数', value: stats?.comments ?? '—', icon: '💬', bg: 'bg-purple-50 text-purple-700'},
        ].map(card => (
          <div key={card.label} className="bg-white rounded-2xl border p-5 flex items-center gap-4">
            <div className={`w-12 h-12 rounded-xl flex items-center justify-center text-2xl ${card.bg}`}>{card.icon}</div>
            <div>
              <p className="text-2xl font-bold text-gray-900">{loading ? '...' : card.value}</p>
              <p className="text-sm text-gray-500">{card.label}</p>
            </div>
          </div>
        ))}
      </div>

      <div className="bg-white rounded-2xl border">
        <div className="flex justify-between items-center px-6 py-4 border-b">
          <h2 className="font-semibold text-gray-900">最近文章</h2>
          <Link href="/admin/posts" className="text-sm text-blue-600 hover:underline">查看全部</Link>
        </div>
        {loading ? (
          <div className="py-16 text-center text-gray-400">加载中...</div>
        ) : posts.length === 0 ? (
          <div className="py-16 text-center text-gray-400">
            <p className="mb-4">还没有文章</p>
            <Link href="/admin/posts/new" className="text-blue-600 text-sm">发布第一篇文章</Link>
          </div>
        ) : (
          <div className="divide-y">
            {posts.map((post) => (
              <div key={post.id} className="px-6 py-4 flex items-center justify-between hover:bg-gray-50">
                <div className="min-w-0 flex-1">
                  <p className="font-medium text-gray-900 truncate">{post.title}</p>
                  <p className="text-xs text-gray-400 mt-0.5">{post.category_name || '未分类'} · {post.created_at?.split('T')[0]}</p>
                </div>
                <div className="flex items-center gap-3 ml-4">
                  <span className={`text-xs px-2 py-0.5 rounded-full ${post.status === 'published' ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'}`}>
                    {post.status === 'published' ? '已发布' : '草稿'}
                  </span>
                  <span className="text-xs text-gray-400">{post.view_count} 浏览</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
