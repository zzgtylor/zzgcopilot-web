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

  async function handleImageUpload(e: React.ChangeEvent<HTMLInputElement>) {
        const file = e.target.files?.[0]
        if (!file) return
        setUploading(true)
        try {
                const form = new FormData()
                form.append('file', file)
                const res = await fetch('/api/upload', { method: 'POST', body: form })
                const data = await res.json()
                if (res.ok && data.url) setCoverImage(data.url)
                else setError(data.error || '\u56fe\u7247\u4e0a\u4f20\u5931\u8d25')
        } catch {
                setError('\u56fe\u7247\u4e0a\u4f20\u5931\u8d25')
        } finally {
                setUploading(false)
        }
  }

  async function handleSubmit(e: React.FormEvent) {
        e.preventDefault()
        setError('')
        if (!title.trim() || !content.trim()) {
                setError('\u6807\u9898\u548c\u6b63\u6587\u4e0d\u80fd\u4e3a\u7a7a')
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
                          setError(data.error || '\u4fdd\u5b58\u5931\u8d25\uff0c\u8bf7\u7a0d\u540e\u91cd\u8bd5')
                } else {
                          setSuccess(true)
                          setTimeout(() => router.push('/admin'), 1500)
                }
        } catch {
                setError('\u4fdd\u5b58\u5931\u8d25\uff0c\u8bf7\u7a0d\u540e\u91cd\u8bd5')
        } finally {
                setSaving(false)
        }
  }

  return (
        <div className="p-8 max-w-4xl">
              <div className="flex items-center justify-between mb-8">
                      <div>
                                <h1 className="text-2xl font-bold text-gray-900">\u53d1\u5e03\u6587\u7ae0</h1>h1>
                                <p className="text-gray-500 text-sm mt-1">\u521b\u5efa\u65b0\u6559\u7a0b\u6216\u6587\u7ae0</p>p>
                      </div>div>
                      <button onClick={() => router.back()} className="text-sm text-gray-500 hover:text-gray-700">\u8fd4\u56de</button>button>
              </div>div>
        
          {success && (
                  <div className="mb-6 bg-green-50 border border-green-200 text-green-700 text-sm px-4 py-3 rounded-lg">
                            \u6587\u7ae0\u4fdd\u5b58\u6210\u529f\uff01\u6b63\u5728\u8df3\u8f6c...
                  </div>div>
              )}
          {error && (
                  <div className="mb-6 bg-red-50 border border-red-200 text-red-700 text-sm px-4 py-3 rounded-lg">
                    {error}
                  </div>div>
              )}
        
              <form onSubmit={handleSubmit} className="space-y-6">
                      <div className="bg-white rounded-2xl border p-6 space-y-5">
                                <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-1.5">\u6807\u9898 *</label>label>
                                            <input
                                                            type="text" required value={title}
                                                            onChange={e => setTitle(e.target.value)}
                                                            placeholder="\u8f93\u5165\u6587\u7ae0\u6807\u9898"
                                                            className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                                                          />
                                </div>div>
                                <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-1.5">
                                                          URL Slug
                                                          <span className="ml-2 text-xs font-normal text-gray-400">(\u7f51\u5740\u6807\u8bc6\u7b26)</span>span>
                                            </label>label>
                                            <input
                                                            type="text" value={slug}
                                                            onChange={e => { setSlug(e.target.value); setSlugManual(true) }}
                                                            placeholder="\u81ea\u52a8\u6839\u636e\u6807\u9898\u751f\u6210"
                                                            className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm font-mono"
                                                          />
                                </div>div>
                                <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-1.5">\u6458\u8981</label>label>
                                            <textarea
                                                            value={excerpt} onChange={e => setExcerpt(e.target.value)}
                                                            rows={2} placeholder="\u6587\u7ae0\u6458\u8981\uff08\u53ef\u9009\uff09"
                                                            className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm resize-none"
                                                          />
                                </div>div>
                      </div>div>
              
                      <div className="bg-white rounded-2xl border p-6">
                                <label className="block text-sm font-medium text-gray-700 mb-1.5">\u6b63\u6587 *</label>label>
                                <textarea
                                              required value={content} onChange={e => setContent(e.target.value)}
                                              rows={18} placeholder="\u652f\u6301 Markdown \u683c\u5f0f..."
                                              className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm font-mono resize-y"
                                            />
                                <p className="text-xs text-gray-400 mt-2">\u652f\u6301 Markdown \u8bed\u6cd5\uff1a**\u52a0\u7c97** *\u659c\u4f53* `\u4ee3\u7801` ## \u6807\u9898 \u7b49</p>p>
                      </div>div>
              
                      <div className="bg-white rounded-2xl border p-6 space-y-5">
                                <div className="grid grid-cols-2 gap-5">
                                            <div>
                                                          <label className="block text-sm font-medium text-gray-700 mb-1.5">\u5206\u7c7b</label>label>
                                                          <select
                                                                            value={categoryId} onChange={e => setCategoryId(e.target.value)}
                                                                            className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm bg-white"
                                                                          >
                                                                          <option value="">\u672a\u5206\u7c7b</option>option>
                                                            {categories.map(c => (
                                                                                              <option key={c.id} value={c.id}>{c.name}</option>option>
                                                                                            ))}
                                                          </select>select>
                                            </div>div>
                                            <div>
                                                          <label className="block text-sm font-medium text-gray-700 mb-1.5">\u72b6\u6001</label>label>
                                                          <select
                                                                            value={status} onChange={e => setStatus(e.target.value as any)}
                                                                            className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm bg-white"
                                                                          >
                                                                          <option value="draft">\u8349\u7a3f</option>option>
                                                                          <option value="published">\u53d1\u5e03</option>option>
                                                          </select>select>
                                            </div>div>
                                </div>div>
                                <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-1.5">\u5c01\u9762\u56fe\u7247</label>label>
                                  {coverImage ? (
                        <div className="relative">
                                        <img src={coverImage} alt="cover" className="w-full h-40 object-cover rounded-lg border" />
                                        <button type="button" onClick={() => setCoverImage('')}
                                                            className="absolute top-2 right-2 w-7 h-7 bg-white rounded-full shadow flex items-center justify-center text-gray-600 hover:text-red-600 text-xs">
                                                          \u2715
                                        </button>button>
                        </div>div>
                      ) : (
                        <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed border-gray-300 rounded-lg cursor-pointer hover:border-blue-400 transition">
                                        <span className="text-sm text-gray-400">{uploading ? '\u4e0a\u4f20\u4e2d...' : '\u70b9\u51fb\u4e0a\u4f20\u56fe\u7247'}</span>span>
                                        <span className="text-xs text-gray-300 mt-1">PNG, JPG, WebP \u6700\u59272MB</span>span>
                                        <input type="file" accept="image/*" className="hidden" onChange={handleImageUpload} disabled={uploading} />
                        </label>label>
                                            )}
                                </div>div>
                      </div>div>
              
                      <div className="flex gap-3 justify-end">
                                <button type="button" onClick={() => router.back()}
                                              className="px-6 py-2.5 border border-gray-300 text-gray-700 text-sm font-medium rounded-lg hover:bg-gray-50 transition">
                                            \u53d6\u6d88
                                </button>button>
                                <button type="submit" disabled={saving}
                                              className="px-6 py-2.5 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 disabled:opacity-50 transition">
                                  {saving ? '\u4fdd\u5b58\u4e2d...' : status === 'published' ? '\u53d1\u5e03\u6587\u7ae0' : '\u4fdd\u5b58\u8349\u7a3f'}
                                </button>button>
                      </div>div>
              </form>form>
        </div>div>
      )
}</div>
