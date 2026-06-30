'use client'
import { useState, useEffect } from 'react'

const ROLE_LABELS = { admin: '管理员', editor: '编辑', user: '普通用户' }
const ROLE_STYLES = {
  admin: 'bg-purple-100 text-purple-700',
  editor: 'bg-blue-100 text-blue-700',
  user: 'bg-gray-100 text-gray-600',
}

export default function AdminUsersPage() {
  const [users, setUsers] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [query, setQuery] = useState('')

  useEffect(() => {
    fetch('/api/admin/users')
      .then(r => r.ok ? r.json() : { users: [] })
      .then(d => { setUsers(d.users || []); setLoading(false) })
      .catch(() => { setError('加载失败'); setLoading(false) })
  }, [])

  const shown = users.filter(u => {
    if (!query) return true
    const q = query.toLowerCase()
    return (u.name || '').toLowerCase().includes(q) || (u.email || '').toLowerCase().includes(q)
  })

  return (
    <div className="p-8">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">用户管理</h1>
          <p className="text-gray-500 text-sm mt-1">共 {users.length} 位用户</p>
        </div>
        <input
          type="text"
          value={query}
          onChange={e => setQuery(e.target.value)}
          placeholder="搜索姓名或邮箱"
          className="px-4 py-2 border rounded-lg text-sm w-64"
        />
      </div>

      {error && <p className="mb-4 text-red-600 text-sm">{error}</p>}

      <div className="bg-white rounded-2xl border overflow-hidden">
        {loading ? (
          <div className="py-16 text-center text-gray-400">加载中...</div>
        ) : shown.length === 0 ? (
          <div className="py-16 text-center text-gray-400">没有匹配的用户</div>
        ) : (
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-gray-500 border-b bg-gray-50">
                <th className="px-6 py-3 font-medium">用户</th>
                <th className="px-4 py-3 font-medium">邮箱</th>
                <th className="px-4 py-3 font-medium">角色</th>
                <th className="px-4 py-3 font-medium">注册日期</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {shown.map(user => (
                <tr key={user.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-full bg-blue-100 text-blue-700 flex items-center justify-center font-medium uppercase">
                        {(user.name || '?').charAt(0)}
                      </div>
                      <span className="font-medium text-gray-900">{user.name || '未命名'}</span>
                    </div>
                  </td>
                  <td className="px-4 py-4 text-gray-600">{user.email}</td>
                  <td className="px-4 py-4">
                    <span className={'text-xs px-2 py-0.5 rounded-full ' + (ROLE_STYLES[user.role] || ROLE_STYLES.user)}>
                      {ROLE_LABELS[user.role] || user.role}
                    </span>
                  </td>
                  <td className="px-4 py-4 text-gray-400">{user.created_at?.split('T')[0]}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  )
}
