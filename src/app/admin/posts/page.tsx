'use client'
import { useState, useEffect } from 'react'
import Link from 'next/link'

export default function AdminPostsPage() {
  const [posts, setPosts] = useState([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState('all')
  const [error, setError] = useState('')

  function load() {
    setLoading(true)
    fetch('/api/admin/posts')
      .then(r => r.ok ? r.json() : { posts: [] })
      .then(d => { setPosts(d.posts || []); setLoading(false) })
      .catch(() => { setError('加载失败'); setLoading(false) })
  }

  useEffect(() => { load() }, [])

  async function remove(id, title) {
    if (!confirm('确定要删除文章「' + title + '」吗？此操作不可恢复。')) return
    const r = await fetch('/api/admin/posts?id=' + encodeURIComponent(id), { method: 'DELETE' }).catch(() => null)
    if (r && r.ok) { setPosts(p => p.filter(x => x.id !== id)) }
    else { alert('删除失败') }
  }

  const shown = posts.filter(p => filter === 'all' ? true : p.status === filter)

  return (
    <div className="p-8">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">文章管理</h1>
          <p className="text-gray-500 text-sm mt-1">共 {posts.length} 篇文章</p>
        </div>
        <Link href="/admin/posts/new" className="px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700">+ 发布文章</Link>
      </div>

      <div className="flex gap-2 mb-5">
        {[
          { k: 'all', label: '全部' },
          { k: 'published', label: '已发布' },
          { k: 'draft', label: '草稿' },
        ].map(t => (
          <button key={t.k} onClick={() => setFilter(t.k)} className={'px-3 py-1.5 text-sm rounded-lg border ' + (filter === t.k ? 'bg-blue-600 text-white border-blue-600' : 'bg-white text-gray-600 hover:bg-gray-50')}>
            {t.label}
          </button>
        ))}
      </div>

      {error && <p className="mb-4 text-red-600 text-sm">{error}</p>}

      <div className="bg-white rounded-2xl border overflow-hidden">
        {loading ? (
          <div className="py-16 text-center text-gray-400">加载中...</div>
        ) : shown.length === 0 ? (
          <div className="py-16 text-center text-gray-400">
            <p className="mb-4">还没有文章</p>
            <Link href="/admin/posts/new" className="text-blue-600 text-sm">发布第一篇文章</Link>
          </div>
        ) : (
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-gray-500 border-b bg-gray-50">
                <th className="px-6 py-3 font-medium">标题</th>
                <th className="px-4 py-3 font-medium">分类</th>
                <th className="px-4 py-3 font-medium">状态</th>
                <th className="px-4 py-3 font-medium">浏览</th>
                <th className="px-4 py-3 font-medium">创建日期</th>
                <th className="px-4 py-3 font-medium text-right">操作</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {shown.map(post => (
                <tr key={post.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4">
                    <p className="font-medium text-gray-900">{post.title}</p>
                    <p className="text-xs text-gray-400 font-mono mt-0.5">/{post.slug}</p>
                  </td>
                  <td className="px-4 py-4 text-gray-600">{post.category_name || '未分类'}</td>
                  <td className="px-4 py-4">
                    <span className={'text-xs px-2 py-0.5 rounded-full ' + (post.status === 'published' ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700')}>
                      {post.status === 'published' ? '已发布' : '草稿'}
                    </span>
                  </td>
                  <td className="px-4 py-4 text-gray-600">{post.view_count ?? 0}</td>
                  <td className="px-4 py-4 text-gray-400">{post.created_at?.split('T')[0]}</td>
                  <td className="px-4 py-4 text-right">
                    <button onClick={() => remove(post.id, post.title)} className="text-red-500 hover:text-red-700 text-sm">删除</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  )
}
