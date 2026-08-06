'use client'

import { FormEvent, useEffect, useState } from 'react'

type Category = { id: string; name: string; slug: string; description?: string; post_count: number }
const empty = { name: '', slug: '', description: '' }

export default function AdminCategoriesPage() {
  const [categories, setCategories] = useState<Category[]>([])
  const [form, setForm] = useState(empty)
  const [editing, setEditing] = useState<Category | null>(null)
  const [message, setMessage] = useState('')

  function load() { fetch('/api/admin/categories').then(r => r.ok ? r.json() : { categories: [] }).then((data: any) => setCategories(data.categories || [])) }
  useEffect(() => { load() }, [])
  async function submit(event: FormEvent) {
    event.preventDefault(); setMessage('')
    const r = await fetch('/api/admin/categories', { method: editing ? 'PUT' : 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(editing ? { ...form, id: editing.id } : form) }).catch(() => null)
    const data = r ? await r.json().catch(() => ({})) : {}
    if (!r?.ok) { setMessage(data.error || '保存失败'); return }
    setForm(empty); setEditing(null); setMessage('已保存'); load()
  }
  async function remove(category: Category) {
    if (!confirm(`删除分类「${category.name}」？`)) return
    const r = await fetch('/api/admin/categories?id=' + encodeURIComponent(category.id), { method: 'DELETE' }).catch(() => null)
    const data = r ? await r.json().catch(() => ({})) : {}
    if (!r?.ok) { alert(data.error || '删除失败'); return }
    load()
  }
  return <div className="p-8"><div className="mb-7"><h1 className="text-2xl font-bold text-gray-900">分类管理</h1><p className="mt-1 text-sm text-gray-500">建立文章分类，写文章时可直接选择。</p></div><div className="grid gap-6 lg:grid-cols-[360px_minmax(0,1fr)]"><form onSubmit={submit} className="h-fit rounded-2xl border bg-white p-5"><h2 className="mb-4 font-semibold">{editing ? '编辑分类' : '新建分类'}</h2><label className="mb-3 block text-sm">名称<input required value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} className="mt-1 w-full rounded-lg border px-3 py-2" /></label><label className="mb-3 block text-sm">链接 Slug<input value={form.slug} onChange={e => setForm({ ...form, slug: e.target.value })} placeholder="留空自动生成" className="mt-1 w-full rounded-lg border px-3 py-2" /></label><label className="mb-4 block text-sm">描述<textarea value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} rows={3} className="mt-1 w-full rounded-lg border px-3 py-2" /></label>{message && <p className="mb-3 text-sm text-blue-700">{message}</p>}<div className="flex gap-2"><button className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white">保存分类</button>{editing && <button type="button" onClick={() => { setEditing(null); setForm(empty) }} className="rounded-lg border px-4 py-2 text-sm">取消</button>}</div></form><div className="overflow-hidden rounded-2xl border bg-white"><table className="w-full text-sm"><thead><tr className="border-b bg-gray-50 text-left text-gray-500"><th className="px-5 py-3">名称</th><th className="px-5 py-3">链接</th><th className="px-5 py-3">文章</th><th className="px-5 py-3 text-right">操作</th></tr></thead><tbody className="divide-y">{categories.map(category => <tr key={category.id}><td className="px-5 py-4"><p className="font-medium">{category.name}</p>{category.description && <p className="mt-1 text-xs text-gray-400">{category.description}</p>}</td><td className="px-5 py-4 font-mono text-xs text-gray-500">{category.slug}</td><td className="px-5 py-4">{category.post_count}</td><td className="px-5 py-4 text-right"><button onClick={() => { setEditing(category); setForm({ name: category.name, slug: category.slug, description: category.description || '' }); setMessage('') }} className="mr-3 text-blue-600">编辑</button><button onClick={() => remove(category)} className="text-red-600">删除</button></td></tr>)}{categories.length === 0 && <tr><td colSpan={4} className="px-5 py-12 text-center text-gray-400">还没有分类</td></tr>}</tbody></table></div></div></div>
}
