'use client'
import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'

export default function NewPostPage() {
  const router = useRouter()
  const [form, setForm] = useState({ title: '', slug: '', excerpt: '', content: '', category_id: '', status: 'draft', cover_image: '' })
  const [categories, setCategories] = useState([])
  const [saving, setSaving] = useState(false)
  const [uploading, setUploading] = useState(false)
  const [error, setError] = useState('')
  const [ok, setOk] = useState(false)

  useEffect(() => {
    fetch('/api/categories').then(r => r.json()).then(d => setCategories(d.categories || [])).catch(() => {})
  }, [])

  useEffect(() => {
    if (form.title && !form.slug) {
      const s = form.title.toLowerCase().replace(/[\u4e00-\u9fa5]/g, '').replace(/[^\w\s-]/g, '').replace(/\s+/g, '-').replace(/-+/g, '-').replace(/^-|-$/g, '') || Date.now().toString()
      setForm(f => ({...f, slug: s}))
    }
  }, [form.title])

  const set = (k) => (e) => setForm(f => ({...f, [k]: e.target.value}))

  async function uploadImage(e) {
    const file = e.target.files?.[0]
    if (!file) return
    setUploading(true)
    const fd = new FormData()
    fd.append('file', file)
    const r = await fetch('/api/upload', { method: 'POST', body: fd }).catch(() => null)
    const d = r ? await r.json() : {}
    if (d.url) setForm(f => ({...f, cover_image: d.url}))
    else setError(d.error || '上传失败')
    setUploading(false)
  }

  async function submit(e) {
    e.preventDefault()
    if (!form.title || !form.content) return setError('标题和正文不能为空')
    setSaving(true)
    setError('')
    const r = await fetch('/api/admin/posts', { method: 'POST', headers: {'Content-Type':'application/json'}, body: JSON.stringify({...form, slug: form.slug || Date.now().toString()}) }).catch(() => null)
    const d = r ? await r.json() : {}
    if (!r || !r.ok) setError(d.error || '保存失败')
    else { setOk(true); setTimeout(() => router.push('/admin'), 1500) }
    setSaving(false)
  }

  return (
    <div className="p-8 max-w-4xl">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">发布文章</h1>
          <p className="text-gray-500 text-sm">创建新教程或文章</p>
        </div>
        <button type="button" onClick={() => router.back()} className="text-sm text-gray-500">返回</button>
      </div>
      {ok && <p className="mb-4 text-green-600 text-sm">保存成功！正在跳转...</p>}
      {error && <p className="mb-4 text-red-600 text-sm">{error}</p>}
      <form onSubmit={submit} className="space-y-5">
        <div className="bg-white border rounded-2xl p-6 space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">标题 *</label>
            <input type="text" required value={form.title} onChange={set('title')} className="w-full px-4 py-2.5 border rounded-lg text-sm" placeholder="文章标题" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">URL Slug</label>
            <input type="text" value={form.slug} onChange={set('slug')} className="w-full px-4 py-2.5 border rounded-lg text-sm font-mono" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">摘要</label>
            <textarea value={form.excerpt} onChange={set('excerpt')} rows={2} className="w-full px-4 py-2.5 border rounded-lg text-sm resize-none" />
          </div>
        </div>
        <div className="bg-white border rounded-2xl p-6">
          <label className="block text-sm font-medium text-gray-700 mb-1">正文 *（Markdown）</label>
          <textarea required value={form.content} onChange={set('content')} rows={16} className="w-full px-4 py-2.5 border rounded-lg text-sm font-mono resize-y" />
        </div>
        <div className="bg-white border rounded-2xl p-6 space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">分类</label>
              <select value={form.category_id} onChange={set('category_id')} className="w-full px-4 py-2.5 border rounded-lg text-sm">
                <option value="">未分类</option>
                {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">状态</label>
              <select value={form.status} onChange={set('status')} className="w-full px-4 py-2.5 border rounded-lg text-sm">
                <option value="draft">草稿</option>
                <option value="published">发布</option>
              </select>
            </div>
          </div>
          {!form.cover_image ? (
            <label className="flex flex-col items-center py-8 border-2 border-dashed rounded-lg cursor-pointer hover:border-blue-400">
              <span className="text-sm text-gray-400">{uploading ? '上传中...' : '点击上传封面图'}</span>
              <input type="file" accept="image/*" className="hidden" onChange={uploadImage} />
            </label>
          ) : (
            <div className="relative">
              <img src={form.cover_image} className="w-full h-40 object-cover rounded-lg" alt="" />
              <button type="button" onClick={() => setForm(f => ({...f, cover_image: ''}))} className="absolute top-2 right-2 bg-white rounded-full w-6 h-6 text-xs shadow">✕</button>
            </div>
          )}
        </div>
        <div className="flex justify-end gap-3 pb-8">
          <button type="button" onClick={() => router.back()} className="px-6 py-2.5 border rounded-lg text-sm text-gray-700">取消</button>
          <button type="submit" disabled={saving} className="px-6 py-2.5 bg-blue-600 text-white rounded-lg text-sm disabled:opacity-50">
            {saving ? '保存中...' : form.status === 'published' ? '发布文章' : '保存草稿'}
          </button>
        </div>
      </form>
    </div>
  )
}
