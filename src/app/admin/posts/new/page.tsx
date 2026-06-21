'use client'
import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'

type Category = { id: string; name: string }

function slugify(str: string) {
    return str
      .toLowerCase()
      .trim()
      .replace(/[\u4e00-\u9fa5]/g, '')
      .replace(/[^\w\s-]/g, '')
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-')
      .replace(/^-|-$/g, '') || Date.now().toString()
}

export default function NewPostPage() {
    const router = useRouter()
    const [title, setTitle] = useState('')
    const [slug, setSlug] = useState('')
    const [slugManual, setSlugManual] = useState(false)
    const [excerpt, setExcerpt] = useState('')
    const [content, setContent] = useState('')
    const [categoryId, setCategoryId] = useState('')
    const [status, setStatus] = useState<'draft' | 'published'>('draft')
    const [coverImage, setCoverImage] = useState('')
    const [categories, setCategories] = useState<Category[]>([])
    const [uploading, setUploading] = useState(false)
    const [saving, setSaving] = useState(false)
    const [error, setError] = useState('')
    const [success, setSuccess] = useState(false)

  useEffect(() => {
        fetch('/api/categories').then(r => r.json()).then(d => setCategories(d.categories || [])).catch(() => {})
  }, [])

  useEffect(() => {
    if (!slugManual && title) setSlug(slugify(title))
  }, [title, slugManual])

  async function handleImageUpload(e) {
    const file = e.target.files?.[0]
    if (!file) return
    setUploading(true)
    try {
      const form = new FormData()
      form.append('file', file)
      const res = await fetch('/api/upload', { method: 'POST', body: form })
      const data = await res.json()
      if (res.ok && data.url) setCoverImage(data.url)
      else setError(data.error || '图片上传失败')
    } catch {
      setError('图片上传失败')
    } finally {
      setUploading(false)
    }
  }

  async function handleSubmit(e) {
    e.preventDefault()
    setError('')
    if (!title.trim() || !content.trim()) {
      setError('标题和正文不能为空')
      return
    }
    setSaving(true)
    try {
      const res = await fetch('/api/admin/posts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: title.trim(),
          slug: slug || slugify(title),
          excerpt: excerpt.trim(),
          content: content.trim(),
          category_id: categoryId || null,
          status,
          cover_image: coverImage || null,
        }),
      })
      const data = await res.json()
      if (!res.ok) {
        setError(data.error || '保存失败，请稍后重试')
      } else {
        setSuccess(true)
        setTimeout(() => router.push('/admin'), 1500)
      }
    } catch {
      setError('保存失败，请稍后重试')
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="p-8 max-w-4xl">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">发布文章</h1>
          <p className="text-gray-500 text-sm mt-1">创建新教程或文章</p>
        </div>
        <button type="button" onClick={() => router.back()} className="text-sm text-gray-500 hover:text-gray-700">返回</button>
      </div>
      {success && <div className="mb-6 bg-green-50 border border-green-200 text-green-700 text-sm px-4 py-3 rounded-lg">文章保存成功！正在跳转...</div>}
      {error && <div className="mb-6 bg-red-50 border border-red-200 text-red-700 text-sm px-4 py-3 rounded-lg">{error}</div>}
      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="bg-white rounded-2xl border p-6 space-y-5">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">标题 *</label>
            <input type="text" required value={title} onChange={e => setTitle(e.target.value)} placeholder="输入文章标题" className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">URL Slug</label>
            <input type="text" value={slug} onChange={e => { setSlug(e.target.value); setSlugManual(true) }} placeholder="自动根据标题生成" className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm font-mono" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">摘要</label>
            <textarea value={excerpt} onChange={e => setExcerpt(e.target.value)} rows={2} placeholder="文章摘要（可选）" className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm resize-none" />
          </div>
        </div>
        <div className="bg-white rounded-2xl border p-6">
          <label className="block text-sm font-medium text-gray-700 mb-1.5">正文 *</label>
          <textarea required value={content} onChange={e => setContent(e.target.value)} rows={18} placeholder="支持 Markdown 格式..." className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm font-mono resize-y" />
          <p className="text-xs text-gray-400 mt-2">支持 Markdown 语法：**加粗** *斜体* `代码` ## 标题 等</p>
        </div>
        <div className="bg-white rounded-2xl border p-6 space-y-5">
          <div className="grid grid-cols-2 gap-5">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">分类</label>
              <select value={categoryId} onChange={e => setCategoryId(e.target.value)} className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm bg-white">
                <option value="">未分类</option>
                {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'

export default function NewPostPage() {
  const router = useRouter()
  const [title, setTitle] = useState('')
  const [slug, setSlug] = useState('')
  const [excerpt, setExcerpt] = useState('')
  const [content, setContent] = useState('')
  const [categoryId, setCategoryId] = useState('')
  const [status, setStatus] = useState('draft')
  const [coverImage, setCoverImage] = useState('')
  const [categories, setCategories] = useState([])
  const [uploading, setUploading] = useState(false)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)

  useEffect(() => {
    fetch('/api/categories').then(r => r.json()).then(d => setCategories(d.categories || [])).catch(() => {})
  }, [])

  useEffect(() => {
    if (!title) return
    setSlug(title.toLowerCase().replace(/[\u4e00-\u9fa5]/g,'').replace(/[^\w\s-]/g,'').replace(/\s+/g,'-').replace(/-+/g,'-').replace(/^-|-$/g,'') || Date.now().toString())
  }, [title])

  async function handleImageUpload(e) {
    const file = e.target.files?.[0]
    if (!file) return
    setUploading(true)
    try {
      const form = new FormData()
      form.append('file', file)
      const res = await fetch('/api/upload', { method: 'POST', body: form })
      const data = await res.json()
      if (res.ok && data.url) setCoverImage(data.url)
      else setError(data.error || '图片上传失败')
    } catch { setError('图片上传失败') }
    finally { setUploading(false) }
  }

  async function handleSubmit(e) {
    e.preventDefault()
    setError('')
    if (!title.trim() || !content.trim()) { setError('标题和正文不能为空'); return }
    setSaving(true)
    try {
      const res = await fetch('/api/admin/posts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title: title.trim(), slug, excerpt: excerpt.trim(), content: content.trim(), category_id: categoryId || null, status, cover_image: coverImage || null }),
      })
      const data = await res.json()
      if (!res.ok) { setError(data.error || '保存失败') }
      else { setSuccess(true); setTimeout(() => router.push('/admin'), 1500) }
    } catch { setError('保存失败，请稍后重试') }
    finally { setSaving(false) }
  }

  return (
    <div className="p-8 max-w-4xl">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">发布文章</h1>
          <p className="text-gray-500 text-sm mt-1">创建新教程或文章</p>
        </div>
        <button type="button" onClick={() => router.back()} className="text-sm text-gray-500 hover:text-gray-700">返回</button>
      </div>
      {success && <div className="mb-6 bg-green-50 border border-green-200 text-green-700 text-sm px-4 py-3 rounded-lg">保存成功！正在跳转...</div>}
      {error && <div className="mb-6 bg-red-50 border border-red-200 text-red-700 text-sm px-4 py-3 rounded-lg">{error}</div>}
      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="bg-white rounded-2xl border p-6 space-y-5">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">标题 *</label>
            <input type="text" required value={title} onChange={e => setTitle(e.target.value)} placeholder="输入文章标题" className="w-full px-4 py-2.5 border border-gray-300 rounded-lg text-sm" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">URL Slug</label>
            <input type="text" value={slug} onChange={e => setSlug(e.target.value)} className="w-full px-4 py-2.5 border border-gray-300 rounded-lg text-sm font-mono" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">摘要</label>
            <textarea value={excerpt} onChange={e => setExcerpt(e.target.value)} rows={2} className="w-full px-4 py-2.5 border border-gray-300 rounded-lg text-sm resize-none" />
          </div>
        </div>
        <div className="bg-white rounded-2xl border p-6">
          <label className="block text-sm font-medium text-gray-700 mb-1.5">正文 *（支持 Markdown）</label>
          <textarea required value={content} onChange={e => setContent(e.target.value)} rows={16} className="w-full px-4 py-2.5 border border-gray-300 rounded-lg text-sm font-mono resize-y" />
        </div>
        <div className="bg-white rounded-2xl border p-6 space-y-5">
          <div className="grid grid-cols-2 gap-5">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">分类</label>
              <select value={categoryId} onChange={e => setCategoryId(e.target.value)} className="w-full px-4 py-2.5 border border-gray-300 rounded-lg text-sm bg-white">
                <option value="">未分类</option>
                {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">状态</label>
              <select value={status} onChange={e => setStatus(e.target.value)} className="w-full px-4 py-2.5 border border-gray-300 rounded-lg text-sm bg-white">
                <option value="draft">草稿</option>
                <option value="published">发布</option>
              </select>
            </div>
          </div>
          {!coverImage ? (
            <label className="flex flex-col items-center justify-center w-full h-28 border-2 border-dashed border-gray-300 rounded-lg cursor-pointer hover:border-blue-400">
              <span className="text-sm text-gray-400">{uploading ? '上传中...' : '点击上传封面图片'}</span>
              <input type="file" accept="image/*" className="hidden" onChange={handleImageUpload} disabled={uploading} />
            </label>
          ) : (
            <div className="relative">
              <img src={coverImage} alt="cover" className="w-full h-40 object-cover rounded-lg" />
              <button type="button" onClick={() => setCoverImage('')} className="absolute top-2 right-2 bg-white rounded-full w-6 h-6 text-xs shadow">✕</button>
            </div>
          )}
        </div>
        <div className="flex gap-3 justify-end pb-8">
          <button type="button" onClick={() => router.back()} className="px-6 py-2.5 border border-gray-300 text-gray-700 text-sm rounded-lg hover:bg-gray-50">取消</button>
          <button type="submit" disabled={saving} className="px-6 py-2.5 bg-blue-600 text-white text-sm rounded-lg hover:bg-blue-700 disabled:opacity-50">
            {saving ? '保存中...' : status === 'published' ? '发布文章' : '保存草稿'}
          </button>
        </div>
      </form>
    </div>
  )
                  }
