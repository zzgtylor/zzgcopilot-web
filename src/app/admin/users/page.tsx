'use client'
import { useEffect, useState } from 'react'

type Role = 'admin' | 'editor' | 'author' | 'contributor' | 'user'
type User = { id: string; name: string; email: string; role: Role; is_active: number; created_at?: string }
const ROLE_LABELS: Record<Role, string> = { admin: '管理员', editor: '编辑', author: '作者', contributor: '投稿者', user: '普通用户' }

export default function AdminUsersPage() {
  const [users, setUsers] = useState<User[]>([])
  const [currentUserId, setCurrentUserId] = useState('')
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [query, setQuery] = useState('')
  const [creating, setCreating] = useState(false)
  const [form, setForm] = useState({ name: '', email: '', password: '', role: 'editor' as Role })

  function load() {
    setLoading(true); setError('')
    fetch('/api/admin/users', { cache: 'no-store' }).then(async response => {
      const data: any = await response.json(); if (!response.ok) throw new Error(data.error || '加载失败')
      setUsers(data.users || []); setCurrentUserId(data.currentUserId || '')
    }).catch(error => setError(error.message)).finally(() => setLoading(false))
  }
  useEffect(load, [])

  async function createUser(event: React.FormEvent) {
    event.preventDefault(); setError('')
    const response = await fetch('/api/admin/users', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(form) })
    const data: any = await response.json().catch(() => ({}))
    if (!response.ok) return setError(data.error || '创建失败')
    setCreating(false); setForm({ name: '', email: '', password: '', role: 'editor' }); load()
  }

  async function updateUser(user: User, patch: Partial<User> & { password?: string }) {
    setError('')
    const response = await fetch('/api/admin/users', { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ id: user.id, ...patch }) })
    const data: any = await response.json().catch(() => ({}))
    if (!response.ok) return setError(data.error || '更新失败')
    load()
  }

  async function resetPassword(user: User) {
    const password = prompt(`为 ${user.name} 设置新密码（至少12位，包含大小写字母和数字）：`)
    if (!password) return
    await updateUser(user, { password })
  }

  const shown = users.filter(user => !query || `${user.name} ${user.email}`.toLowerCase().includes(query.toLowerCase()))
  return <div className="p-8">
    <div className="mb-8 flex flex-wrap items-center justify-between gap-4"><div><h1 className="text-2xl font-bold text-gray-900">用户管理</h1><p className="mt-1 text-sm text-gray-500">编辑可管理全部内容；作者发布自己的文章；投稿者需提交审核。</p></div><div className="flex gap-3"><input value={query} onChange={event => setQuery(event.target.value)} placeholder="搜索姓名或邮箱" className="w-64 rounded-lg border px-4 py-2 text-sm"/><button onClick={() => setCreating(value => !value)} className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white">+ 创建用户</button></div></div>
    {error && <div className="mb-5 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">{error}</div>}
    {creating && <form onSubmit={createUser} className="mb-6 grid gap-3 rounded-2xl border bg-white p-5 md:grid-cols-4"><input required value={form.name} onChange={event => setForm({...form, name: event.target.value})} placeholder="姓名" className="rounded-lg border px-3 py-2 text-sm"/><input required type="email" value={form.email} onChange={event => setForm({...form, email: event.target.value})} placeholder="邮箱" className="rounded-lg border px-3 py-2 text-sm"/><input required type="password" value={form.password} onChange={event => setForm({...form, password: event.target.value})} placeholder="强密码（至少12位）" className="rounded-lg border px-3 py-2 text-sm"/><div className="flex gap-2"><select value={form.role} onChange={event => setForm({...form, role: event.target.value as Role})} className="min-w-0 flex-1 rounded-lg border px-3 py-2 text-sm"><option value="admin">管理员</option><option value="editor">编辑</option><option value="author">作者</option><option value="contributor">投稿者</option><option value="user">普通用户</option></select><button className="rounded-lg bg-gray-900 px-4 py-2 text-sm text-white">创建</button></div></form>}
    <div className="overflow-hidden rounded-2xl border bg-white">{loading ? <div className="py-16 text-center text-gray-400">加载中…</div> : shown.length === 0 ? <div className="py-16 text-center text-gray-400">没有匹配用户</div> : <table className="w-full text-sm"><thead><tr className="border-b bg-gray-50 text-left text-gray-500"><th className="px-6 py-3 font-medium">用户</th><th className="px-4 py-3 font-medium">邮箱</th><th className="px-4 py-3 font-medium">角色</th><th className="px-4 py-3 font-medium">状态</th><th className="px-4 py-3 text-right font-medium">操作</th></tr></thead><tbody className="divide-y">{shown.map(user => <tr key={user.id} className="hover:bg-gray-50"><td className="px-6 py-4"><p className="font-medium text-gray-900">{user.name}{user.id === currentUserId && <span className="ml-2 text-xs text-blue-600">当前账号</span>}</p><p className="mt-1 text-xs text-gray-400">{String(user.created_at || '').slice(0, 10)}</p></td><td className="px-4 py-4 text-gray-600">{user.email}</td><td className="px-4 py-4"><select value={user.role} disabled={user.id === currentUserId} onChange={event => updateUser(user, { role: event.target.value as Role })} className="rounded-md border bg-white px-2 py-1.5 text-sm disabled:bg-gray-50"><option value="admin">管理员</option><option value="editor">编辑</option><option value="author">作者</option><option value="contributor">投稿者</option><option value="user">普通用户</option></select></td><td className="px-4 py-4"><span className={`rounded-full px-2 py-1 text-xs ${user.is_active ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-600'}`}>{user.is_active ? '已启用' : '已停用'}</span></td><td className="px-4 py-4 text-right"><button onClick={() => resetPassword(user)} className="mr-4 text-blue-600">重置密码</button><button disabled={user.id === currentUserId} onClick={() => updateUser(user, { is_active: user.is_active ? 0 : 1 })} className="text-amber-700 disabled:text-gray-300">{user.is_active ? '停用' : '启用'}</button></td></tr>)}</tbody></table>}</div>
  </div>
}
