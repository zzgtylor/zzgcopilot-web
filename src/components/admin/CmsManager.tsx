'use client'
import { useEffect, useState } from 'react'
import StructuredEditor from '@/components/admin/StructuredEditor'

type Mode = 'pages' | 'navigation' | 'tags' | 'templates'
type Item = Record<string, any>
const config = {
  pages: { title: '独立页面', note: '管理“关于我们”等不进入文章列表的固定页面。' },
  navigation: { title: '导航菜单', note: '调整首页顶部菜单；默认项目与当前首页完全一致。' },
  tags: { title: '标签管理', note: '统一重命名或删除文章中的标签。' },
  templates: { title: '内容模板', note: '保存可重复使用的文章结构，在写文章时一键套用。' },
}

const blank = (mode: Mode): Item => mode === 'pages'
  ? { title: '', slug: '', content: '', excerpt: '', status: 'draft', meta_title: '', meta_description: '' }
  : mode === 'navigation' ? { label: '', href: '__latest_tutorial__', sort_order: 0, is_visible: 1, open_new_tab: 0 }
  : { name: '', description: '', content: '' }

export default function CmsManager({ mode }: { mode: Mode }) {
  const [items, setItems] = useState<Item[]>([]); const [form, setForm] = useState<Item>(blank(mode)); const [editing, setEditing] = useState('')
  const [loading, setLoading] = useState(true); const [message, setMessage] = useState(''); const [error, setError] = useState('')
  async function load() { setLoading(true); const r = await fetch(`/api/admin/cms?resource=${mode}`, { cache: 'no-store' }); const d: any = await r.json(); if (r.ok) setItems(d.items || []); else setError(d.error || '加载失败'); setLoading(false) }
  useEffect(() => { void load() }, [mode])
  function edit(item: Item) { setEditing(String(item.id || item.name)); setForm({ ...item }); setMessage(''); window.scrollTo({ top: 0, behavior: 'smooth' }) }
  function reset() { setEditing(''); setForm(blank(mode)); setError('') }
  async function save() {
    setError(''); setMessage('')
    const method = editing ? 'PUT' : 'POST'; const r = await fetch('/api/admin/cms', { method, headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ resource: mode, ...form }) }); const d: any = await r.json()
    if (!r.ok) return setError(d.error || '保存失败'); setMessage('已保存'); reset(); await load()
  }
  async function remove(item: Item) {
    if (!confirm(mode === 'pages' && item.status !== 'archived' ? '移入回收站？' : '确认删除？此操作可能无法恢复。')) return
    const r = await fetch(`/api/admin/cms?resource=${mode}&id=${encodeURIComponent(item.id)}`, { method: 'DELETE' }); const d: any = await r.json(); if (!r.ok) setError(d.error || '删除失败'); else await load()
  }
  async function tagChange(item: Item, removeTag = false) {
    const newName = removeTag ? '' : prompt('新的标签名称', item.name); if (newName === null) return
    const r = await fetch('/api/admin/cms', { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ resource: 'tags', oldName: item.name, newName }) }); const d: any = await r.json(); if (!r.ok) setError(d.error || '操作失败'); else { setMessage(`已更新 ${d.changed || 0} 篇文章`); await load() }
  }
  async function move(item: Item, delta: number) {
    const target = items.find(other => Number(other.sort_order) === Number(item.sort_order) + delta); if (!target) return
    await Promise.all([fetch('/api/admin/cms', { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ resource: mode, ...item, sort_order: target.sort_order }) }), fetch('/api/admin/cms', { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ resource: mode, ...target, sort_order: item.sort_order }) })]); await load()
  }
  return <div className="p-5 sm:p-8"><div className="mb-6"><h1 className="text-2xl font-bold text-gray-900">{config[mode].title}</h1><p className="mt-1 text-sm text-gray-500">{config[mode].note}</p></div>
    {error && <p className="mb-4 rounded-lg bg-red-50 px-4 py-3 text-sm text-red-700">{error}</p>}{message && <p className="mb-4 rounded-lg bg-green-50 px-4 py-3 text-sm text-green-700">{message}</p>}
    {mode !== 'tags' && <section className="mb-6 rounded-xl border bg-white p-5 shadow-sm"><h2 className="mb-4 font-semibold">{editing ? '编辑' : '新建'}{config[mode].title}</h2>
      {mode === 'pages' && <div className="space-y-4"><div className="grid gap-4 sm:grid-cols-2"><input value={form.title || ''} onChange={e => setForm({ ...form, title: e.target.value })} placeholder="页面标题" className="rounded-lg border px-3 py-2"/><input value={form.slug || ''} onChange={e => setForm({ ...form, slug: e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, '-') })} placeholder="链接别名，例如 about" className="rounded-lg border px-3 py-2 font-mono"/></div><textarea value={form.excerpt || ''} onChange={e => setForm({ ...form, excerpt: e.target.value })} placeholder="页面摘要" className="w-full rounded-lg border px-3 py-2"/><StructuredEditor value={form.content || ''} onChange={content => setForm({ ...form, content })} onImage={async () => ''}/><div className="grid gap-4 sm:grid-cols-3"><select value={form.status || 'draft'} onChange={e => setForm({ ...form, status: e.target.value })} className="rounded-lg border px-3 py-2"><option value="draft">草稿</option><option value="published">发布</option><option value="archived">回收站</option></select><input value={form.meta_title || ''} onChange={e => setForm({ ...form, meta_title: e.target.value })} placeholder="SEO 标题" className="rounded-lg border px-3 py-2"/><input value={form.meta_description || ''} onChange={e => setForm({ ...form, meta_description: e.target.value })} placeholder="SEO 描述" className="rounded-lg border px-3 py-2"/></div></div>}
      {mode === 'navigation' && <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5"><input value={form.label || ''} onChange={e => setForm({ ...form, label: e.target.value })} placeholder="菜单名称" className="rounded-lg border px-3 py-2"/><input value={form.href || ''} onChange={e => setForm({ ...form, href: e.target.value })} placeholder="/pages/about 或网址" className="rounded-lg border px-3 py-2 lg:col-span-2"/><label className="flex items-center gap-2 text-sm"><input type="checkbox" checked={Boolean(form.is_visible)} onChange={e => setForm({ ...form, is_visible: e.target.checked ? 1 : 0 })}/>显示</label><label className="flex items-center gap-2 text-sm"><input type="checkbox" checked={Boolean(form.open_new_tab)} onChange={e => setForm({ ...form, open_new_tab: e.target.checked ? 1 : 0 })}/>新窗口</label></div>}
      {mode === 'templates' && <div className="space-y-4"><input value={form.name || ''} onChange={e => setForm({ ...form, name: e.target.value })} placeholder="模板名称" className="w-full rounded-lg border px-3 py-2"/><input value={form.description || ''} onChange={e => setForm({ ...form, description: e.target.value })} placeholder="用途说明" className="w-full rounded-lg border px-3 py-2"/><StructuredEditor value={form.content || ''} onChange={content => setForm({ ...form, content })} onImage={async () => ''}/></div>}
      <div className="mt-4 flex gap-3"><button onClick={save} className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white">保存</button>{editing && <button onClick={reset} className="rounded-lg border px-4 py-2 text-sm">取消</button>}</div>
    </section>}
    <section className="overflow-hidden rounded-xl border bg-white shadow-sm">{loading ? <p className="p-8 text-center text-gray-400">加载中…</p> : items.length === 0 ? <p className="p-8 text-center text-gray-400">暂无内容</p> : <div className="divide-y">{items.map((item, index) => <div key={item.id || item.name} className="flex flex-wrap items-center justify-between gap-3 px-5 py-4"><div className="min-w-0"><p className="font-medium text-gray-900">{item.title || item.label || item.name}</p><p className="mt-1 truncate text-xs text-gray-500">{mode === 'pages' ? `/pages/${item.slug} · ${item.status}` : mode === 'navigation' ? `${item.href} · ${item.is_visible ? '显示' : '隐藏'}` : mode === 'tags' ? `${item.count} 篇文章` : item.description || '无说明'}</p></div><div className="flex items-center gap-3 text-sm">{mode === 'navigation' && <><button disabled={index === 0} onClick={() => move(item, -1)} className="disabled:opacity-30">上移</button><button disabled={index === items.length - 1} onClick={() => move(item, 1)} className="disabled:opacity-30">下移</button></>}{mode === 'tags' ? <><button onClick={() => tagChange(item)} className="text-blue-600">重命名</button><button onClick={() => tagChange(item, true)} className="text-red-600">删除</button></> : <><button onClick={() => edit(item)} className="text-blue-600">编辑</button><button onClick={() => remove(item)} className="text-red-600">{mode === 'pages' && item.status !== 'archived' ? '移入回收站' : '删除'}</button></>}</div></div>)}</div>}</section>
  </div>
}
