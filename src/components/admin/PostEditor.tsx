'use client'
import { useState, useEffect, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { ChevronDown, ExternalLink, Loader2, Upload } from 'lucide-react'
import StructuredEditor from '@/components/admin/StructuredEditor'

type PostForm = { id?: string; title: string; slug: string; excerpt: string; content: string; category_id: string; status: string; scheduled_at: string; cover_image: string; tags: string[]; meta_title: string; meta_description: string; og_image: string; comments_enabled: boolean }
type Category = { id: string; name: string }
type MediaItem = { id: string; original_name: string; url: string; size: number }
type Revision = { id: string; title: string; status: string; scheduled_at?: string; excerpt?: string; content?: string; created_at: string; created_by_name?: string }
type ContentTemplate = { id: string; name: string; description: string; content: string }

function lineDiff(before: string, after: string) {
  const left = before.split('\n').slice(0, 500)
  const right = after.split('\n').slice(0, 500)
  const matrix = Array.from({ length: left.length + 1 }, () => new Uint16Array(right.length + 1))
  for (let i = left.length - 1; i >= 0; i -= 1) for (let j = right.length - 1; j >= 0; j -= 1) matrix[i][j] = left[i] === right[j] ? matrix[i + 1][j + 1] + 1 : Math.max(matrix[i + 1][j], matrix[i][j + 1])
  const output: { kind: 'same' | 'add' | 'remove'; text: string }[] = []; let i = 0; let j = 0
  while (i < left.length || j < right.length) {
    if (i < left.length && j < right.length && left[i] === right[j]) { output.push({ kind: 'same', text: left[i] }); i += 1; j += 1 }
    else if (j < right.length && (i === left.length || matrix[i][j + 1] >= matrix[i + 1][j])) { output.push({ kind: 'add', text: right[j] }); j += 1 }
    else { output.push({ kind: 'remove', text: left[i] }); i += 1 }
  }
  return output
}

function RevisionDiff({ before, after }: { before: string; after: string }) {
  return <div className="max-h-[62vh] overflow-auto rounded-lg border bg-gray-50 font-mono text-xs leading-6">{lineDiff(before, after).map((line, index) => <div key={index} className={line.kind === 'add' ? 'bg-green-100 text-green-900' : line.kind === 'remove' ? 'bg-red-100 text-red-900 line-through' : 'text-gray-600'}><span className="inline-block w-8 select-none pr-2 text-right text-gray-400">{line.kind === 'add' ? '+' : line.kind === 'remove' ? '−' : ' '}</span><span className="whitespace-pre-wrap break-words">{line.text || ' '}</span></div>)}</div>
}

function MediaPicker({ onSelect, onClose }: { onSelect: (url: string) => void; onClose: () => void }) {
  const [items, setItems] = useState<MediaItem[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch('/api/upload')
      .then((r) => (r.ok ? r.json() : { media: [] }))
      .then((data: any) => setItems(data.media || []))
      .finally(() => setLoading(false))
  }, [])

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-gray-950/45 p-4" role="dialog" aria-modal="true" aria-label="选择媒体">
      <div className="max-h-[80vh] w-full max-w-3xl overflow-hidden rounded-xl bg-white shadow-2xl">
        <div className="flex items-center justify-between border-b px-5 py-4">
          <div><h2 className="font-semibold text-gray-900">媒体库</h2><p className="mt-0.5 text-xs text-gray-500">选择一张已上传的图片作为封面</p></div>
          <button type="button" onClick={onClose} className="rounded px-3 py-1.5 text-sm text-gray-500 hover:bg-gray-100">关闭</button>
        </div>
        <div className="max-h-[60vh] overflow-y-auto p-5">
          {loading ? <div className="py-14 text-center text-sm text-gray-400">正在加载媒体库…</div> : items.length === 0 ? (
            <div className="py-14 text-center text-sm text-gray-400">媒体库还是空的。请先使用“上传图片”。</div>
          ) : (
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4">
              {items.map((item) => <button key={item.id} type="button" onClick={() => { onSelect(item.url); onClose() }} className="group overflow-hidden rounded-lg border text-left hover:border-blue-500 hover:ring-2 hover:ring-blue-100">
                <img src={item.url} alt={item.original_name} className="aspect-square w-full object-cover" />
                <span className="block truncate px-2 py-2 text-xs text-gray-600">{item.original_name}</span>
              </button>)}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default function PostEditor({ postId }: { postId?: string }) {
  const router = useRouter()
  const isEdit = Boolean(postId)
  const [form, setForm] = useState<PostForm>({ title: '', slug: '', excerpt: '', content: '', category_id: '', status: 'draft', scheduled_at: '', cover_image: '', tags: [], meta_title: '', meta_description: '', og_image: '', comments_enabled: false })
  const [revisions, setRevisions] = useState<Revision[]>([])
  const [categories, setCategories] = useState<Category[]>([])
  const [saving, setSaving] = useState(false)
  const [loading, setLoading] = useState(isEdit)
  const [uploading, setUploading] = useState(false)
  const [mediaPickerOpen, setMediaPickerOpen] = useState(false)
  const [error, setError] = useState('')
  const [ok, setOk] = useState(false)
  const slugTouchedRef = useRef(isEdit)
  const [currentPostId, setCurrentPostId] = useState(postId || '')
  const [lastSavedAt, setLastSavedAt] = useState('')
  const [savedSignature, setSavedSignature] = useState('')
  const [revisionPreview, setRevisionPreview] = useState<Revision | null>(null)
  const [serverUpdatedAt, setServerUpdatedAt] = useState('')
  const [reviewNote, setReviewNote] = useState('')
  const [capabilities, setCapabilities] = useState({ manageAll: false, publish: true, upload: true })
  const [templates, setTemplates] = useState<ContentTemplate[]>([])
  const autoSaveTimer = useRef<ReturnType<typeof setTimeout> | null>(null)

  useEffect(() => {
    fetch('/api/admin/posts?meta=1', { cache: 'no-store' }).then(r => r.json()).then((d: any) => { setCategories(d.categories || []); setTemplates(d.templates || []); if (!isEdit && d.discussionDefaults) setForm(f => ({ ...f, comments_enabled: Boolean(d.discussionDefaults.comments_enabled) })); if (d.capabilities) setCapabilities(d.capabilities) }).catch(() => {})
  }, [])

  useEffect(() => {
    if (!isEdit) return
    fetch('/api/admin/posts?id=' + encodeURIComponent(postId!) + '&revisions=1').then(r => r.json())
      .then((d: any) => {
        if (d.post) {
          let tags: string[] = []
          try { tags = Array.isArray(d.post.tags) ? d.post.tags : JSON.parse(d.post.tags || '[]') } catch { tags = [] }
          const loadedForm = { id: d.post.id, title: d.post.title || '', slug: d.post.slug || '', excerpt: d.post.excerpt || '', content: d.post.content || '', category_id: d.post.category_id || '', status: d.post.review_status === 'pending' ? 'pending' : d.post.scheduled_at ? 'scheduled' : d.post.status || 'draft', scheduled_at: d.post.scheduled_at ? new Date(d.post.scheduled_at).toISOString().slice(0, 16) : '', cover_image: d.post.cover_image || '', tags, meta_title: d.post.meta_title || '', meta_description: d.post.meta_description || '', og_image: d.post.og_image || '', comments_enabled: Boolean(d.post.comments_enabled) }
          setForm(loadedForm)
          setSavedSignature(JSON.stringify(loadedForm))
          setServerUpdatedAt(d.post.updated_at || '')
          setReviewNote(d.post.review_note || '')
          setRevisions(d.revisions || [])
        }
        else setError(d.error || '加载文章失败')
      }).catch(() => setError('加载文章失败')).finally(() => setLoading(false))
  }, [isEdit, postId])

  useEffect(() => {
    if (!isEdit) setSavedSignature(JSON.stringify(form))
  }, [])

  useEffect(() => {
    if (form.title && !slugTouchedRef.current && !form.slug) {
      const s = form.title.toLowerCase().replace(/[\u4e00-\u9fa5]/g, '').replace(/[^\w\s-]/g, '').replace(/\s+/g, '-').replace(/-+/g, '-').replace(/^-|-$/g, '') || Date.now().toString()
      setForm(f => ({ ...f, slug: s }))
    }
  }, [form.title])

  const set = (k: keyof PostForm) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    if (k === 'slug') slugTouchedRef.current = true
    setForm(f => ({ ...f, [k]: e.target.value }))
  }

  async function uploadFile(): Promise<string> {
    return new Promise((resolve) => {
      const input = document.createElement('input')
      input.type = 'file'; input.accept = 'image/jpeg,image/png,image/webp,image/gif'
      input.onchange = async () => {
        const file = input.files?.[0]; if (!file) return resolve('')
        const fd = new FormData(); fd.append('file', file)
        const r = await fetch('/api/upload', { method: 'POST', body: fd }).catch(() => null)
        const d = r ? await r.json() : {}; resolve(d.url || '')
      }
      input.click()
    })
  }

  async function uploadImage(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]; if (!file) return
    setUploading(true)
    const fd = new FormData(); fd.append('file', file)
    const r = await fetch('/api/upload', { method: 'POST', body: fd }).catch(() => null)
    const d = r ? await r.json() : {}
    if (d.url) setForm(f => ({ ...f, cover_image: d.url }))
    else setError(d.error || '上传失败')
    setUploading(false)
  }

  async function save(automatic = false) {
    if (!form.title || (!automatic && form.status === 'published' && !form.content)) {
      if (!automatic) setError('发布文章需要标题和正文')
      return false
    }
    setSaving(true); setError('')
    const payload = { ...form, id: currentPostId || undefined, expected_updated_at: serverUpdatedAt || undefined, status: form.status, scheduled_at: form.status === 'scheduled' ? form.scheduled_at : '', save_revision: !automatic, slug: form.slug || Date.now().toString() }
    const r = currentPostId
      ? await fetch('/api/admin/posts', { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) }).catch(() => null)
      : await fetch('/api/admin/posts', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) }).catch(() => null)
    const d = r ? await r.json() : {}
    if (!r || !r.ok) setError(d.error || '保存失败')
    else {
      if (!currentPostId && d.id) {
        setCurrentPostId(d.id)
        if (automatic) router.replace(`/admin/posts/${d.id}/edit`)
      }
      setLastSavedAt(new Date().toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit' }))
      if (d.updated_at) setServerUpdatedAt(d.updated_at)
      setSavedSignature(JSON.stringify({ ...form, slug: payload.slug }))
      if (!automatic) { setOk(true); setTimeout(() => router.push('/admin/posts'), 1200) }
    }
    setSaving(false)
    return Boolean(r?.ok)
  }

  async function submit(e: React.FormEvent) {
    e.preventDefault()
    await save(false)
  }

  useEffect(() => {
    if (!form.title || saving || form.status !== 'draft') return
    if (autoSaveTimer.current) clearTimeout(autoSaveTimer.current)
    autoSaveTimer.current = setTimeout(() => { void save(true) }, 10000)
    return () => { if (autoSaveTimer.current) clearTimeout(autoSaveTimer.current) }
  }, [form.title, form.slug, form.excerpt, form.content, form.category_id, form.cover_image, form.tags, form.meta_title, form.meta_description, form.og_image, form.status])

  const currentSignature = JSON.stringify(form)
  const dirty = Boolean(savedSignature && currentSignature !== savedSignature)
  const plainContent = form.content.replace(/[#*_>`\[\]()!-]/g, ' ').replace(/\s+/g, ' ').trim()
  const wordCount = plainContent ? plainContent.split(/\s+/).length : 0
  const chineseCount = (plainContent.match(/[\u4e00-\u9fff]/g) || []).length
  const readingMinutes = Math.max(1, Math.ceil((wordCount + chineseCount) / 300))
  const outline = form.content.split('\n').filter(line => /^#{1,3}\s+/.test(line)).slice(0, 12)

  useEffect(() => {
    const warn = (event: BeforeUnloadEvent) => { if (dirty) event.preventDefault() }
    window.addEventListener('beforeunload', warn)
    return () => window.removeEventListener('beforeunload', warn)
  }, [dirty])

  async function restoreRevision(revisionId: string) {
    if (!currentPostId || !confirm('恢复这个版本？系统会先保留当前内容，便于再次恢复。')) return
    const r = await fetch('/api/admin/posts', { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ id: currentPostId, revisionId, action: 'restoreRevision' }) }).catch(() => null)
    if (!r?.ok) { setError('版本恢复失败'); return }
    window.location.reload()
  }

  async function review(action: 'approve' | 'reject') {
    if (!currentPostId) return
    const note = action === 'reject' ? prompt('请填写退回修改说明（可选）：') || '' : ''
    const r = await fetch('/api/admin/posts', { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ id: currentPostId, action, note }) })
    if (r.ok) router.push('/admin/posts?status=pending'); else { const data: any = await r.json().catch(() => ({})); setError(data.error || '审核操作失败') }
  }

  if (loading) return <div className="p-8 text-sm text-gray-400">加载中...</div>

  return (
    <div className="mx-auto max-w-7xl p-5 sm:p-8">
      <div className="mb-6 flex items-center justify-between">
        <div><h1 className="text-2xl font-bold text-gray-900">{isEdit ? '编辑文章' : '写文章'}</h1><p className="mt-1 text-sm text-gray-500">内容发布后会自动出现在首页的教程卡片中。{dirty ? <span className="ml-2 font-medium text-amber-600">有未保存修改</span> : savedSignature ? <span className="ml-2 text-green-600">已保存</span> : null}</p></div>
        <button type="button" onClick={() => router.back()} className="rounded-md border bg-white px-3 py-2 text-sm text-gray-600 hover:bg-gray-50">返回列表</button>
      </div>
      {ok && <p className="mb-4 rounded-lg border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-700">保存成功，正在返回文章列表…</p>}
      {error && <p className="mb-4 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">{error}</p>}
      {isEdit && reviewNote && form.status !== 'pending' && <p className="mb-4 rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800">编辑审核说明：{reviewNote}</p>}
      <form onSubmit={submit} className="grid items-start gap-6 lg:grid-cols-[minmax(0,1fr)_320px]">
        <section className="min-w-0 space-y-5">
          <div className="rounded-xl border bg-white p-5 shadow-sm sm:p-6">
            <label className="mb-2 block text-sm font-semibold text-gray-800">文章标题</label>
            <input type="text" required value={form.title} onChange={set('title')} className="w-full border-0 border-b border-gray-200 px-0 py-3 text-2xl font-semibold text-gray-900 outline-none placeholder:text-gray-300 focus:border-blue-500" placeholder="在这里输入文章标题" />
            <div className="mt-4 flex flex-col gap-2 border-t pt-4 sm:flex-row sm:items-center">
              <span className="shrink-0 text-sm text-gray-500">文章链接</span>
              <span className="shrink-0 text-sm text-gray-400">/tutorials/</span>
              <input value={form.slug} onChange={set('slug')} className="min-w-0 flex-1 rounded-md border px-3 py-2 font-mono text-sm text-gray-700 outline-none focus:border-blue-500" placeholder="article-url-slug" />
              {form.slug && <a href={`/tutorials/${form.slug}`} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1 text-sm text-blue-600 hover:underline">预览 <ExternalLink className="h-3.5 w-3.5" /></a>}
            </div>
          </div>

          <div className="rounded-xl border bg-white p-5 shadow-sm sm:p-6">
            <div className="mb-3 flex flex-wrap items-center justify-between gap-3"><label className="text-sm font-semibold text-gray-800">正文内容</label><div className="flex items-center gap-3"><select defaultValue="" onChange={e => { const template = templates.find(item => item.id === e.target.value); if (template && (!form.content || confirm('应用模板会替换当前正文，继续吗？'))) setForm(f => ({ ...f, content: template.content })); e.target.value = '' }} className="rounded-md border px-2 py-1 text-xs"><option value="">应用内容模板…</option>{templates.map(item => <option key={item.id} value={item.id}>{item.name}</option>)}</select><span className="text-xs text-gray-400">{wordCount + chineseCount} 字 · 约 {readingMinutes} 分钟阅读</span></div></div>
            <StructuredEditor value={form.content} onChange={(v) => setForm(f => ({ ...f, content: v }))} onImage={uploadFile} />
          </div>

          <div className="rounded-xl border bg-white p-5 shadow-sm sm:p-6">
            <label className="mb-2 block text-sm font-semibold text-gray-800">摘要 <span className="font-normal text-gray-400">（可选）</span></label>
            <textarea value={form.excerpt} onChange={set('excerpt')} rows={3} className="w-full resize-none rounded-lg border px-3 py-2.5 text-sm outline-none focus:border-blue-500" placeholder="用一两句话介绍这篇文章，便于搜索和分享。" />
          </div>

          <details className="rounded-xl border bg-white shadow-sm">
            <summary className="flex cursor-pointer list-none items-center justify-between px-5 py-4 text-sm font-semibold text-gray-800">SEO 设置（可选）<ChevronDown className="h-4 w-4 text-gray-400" /></summary>
            <div className="space-y-4 border-t p-5">
              <div><label className="mb-1 flex justify-between text-sm font-medium text-gray-700"><span>SEO 标题</span><span className={(form.meta_title || form.title).length > 60 ? 'text-red-600' : 'text-gray-400'}>{(form.meta_title || form.title).length}/60</span></label><input type="text" value={form.meta_title} onChange={set('meta_title')} placeholder={form.title || '留空则使用文章标题'} className="w-full rounded-lg border px-3 py-2.5 text-sm outline-none focus:border-blue-500" /></div>
              <div><label className="mb-1 flex justify-between text-sm font-medium text-gray-700"><span>SEO 描述</span><span className={(form.meta_description || form.excerpt).length > 160 ? 'text-red-600' : 'text-gray-400'}>{(form.meta_description || form.excerpt).length}/160</span></label><textarea value={form.meta_description} onChange={set('meta_description')} rows={3} placeholder={form.excerpt || '留空则使用摘要'} className="w-full resize-none rounded-lg border px-3 py-2.5 text-sm outline-none focus:border-blue-500" /></div>
              <div><label className="mb-1 block text-sm font-medium text-gray-700">社交分享图片 URL</label><input type="url" value={form.og_image} onChange={set('og_image')} placeholder={form.cover_image || '留空则使用文章封面'} className="w-full rounded-lg border px-3 py-2.5 text-sm outline-none focus:border-blue-500" /></div>
              <div className="rounded-lg border bg-gray-50 p-4"><p className="truncate text-base text-blue-700">{form.meta_title || form.title || '文章标题预览'}</p><p className="mt-1 truncate text-xs text-green-700">zzgcopilot.com/tutorials/{form.slug || 'article-slug'}</p><p className="mt-1 line-clamp-2 text-sm text-gray-600">{form.meta_description || form.excerpt || '这里会显示搜索结果描述。'}</p></div>
            </div>
          </details>
        </section>

        <aside className="space-y-5 lg:sticky lg:top-5">
          <section className="rounded-xl border bg-white shadow-sm">
            <div className="border-b px-5 py-4"><h2 className="font-semibold text-gray-900">发布</h2></div>
            <div className="space-y-4 p-5">
              <div className="rounded-lg bg-gray-50 p-3 text-sm"><p className="font-medium text-gray-700">状态</p><div className="mt-2 grid grid-cols-3 gap-2">
                {([['draft', '草稿'], ...(capabilities.publish ? [['published', '立即发布'], ['scheduled', '定时发布']] : [['pending', '提交审核']])] as string[][]).map(([value, label]) => <button key={value} type="button" onClick={() => setForm(f => ({ ...f, status: value }))} className={'rounded-md border px-2 py-2 text-xs font-medium transition ' + (form.status === value ? 'border-blue-600 bg-blue-50 text-blue-700' : 'bg-white text-gray-600 hover:bg-gray-50')}>{label}</button>)}
              </div>{form.status === 'scheduled' && <label className="mt-3 block text-xs text-gray-600">发布时间<input type="datetime-local" value={form.scheduled_at} onChange={set('scheduled_at')} className="mt-1 w-full rounded-md border bg-white px-2 py-2 text-sm" /></label>}</div>
              <p className="text-xs leading-5 text-gray-500">{capabilities.publish ? '立即发布会显示在首页；定时发布到点后自动公开；草稿仅在后台可见。' : '投稿者保存草稿后提交审核，由编辑审核通过后公开。'}{lastSavedAt ? ` 已自动保存 ${lastSavedAt}` : ' 输入后会自动保存为草稿。'}</p>
              <button type="submit" disabled={saving} className="flex w-full items-center justify-center gap-2 rounded-lg bg-blue-600 px-4 py-3 text-sm font-semibold text-white hover:bg-blue-700 disabled:opacity-50">
                {saving && <Loader2 className="h-4 w-4 animate-spin" />}{saving ? '保存中…' : form.status === 'published' ? '发布文章' : form.status === 'scheduled' ? '设定发布时间' : form.status === 'pending' ? '提交审核' : '保存草稿'}
              </button>
              {capabilities.manageAll && form.status === 'pending' && <div className="grid grid-cols-2 gap-2"><button type="button" onClick={() => review('approve')} className="rounded-lg bg-green-600 px-3 py-2 text-sm font-medium text-white">审核通过并发布</button><button type="button" onClick={() => review('reject')} className="rounded-lg border border-amber-300 px-3 py-2 text-sm text-amber-700">退回修改</button></div>}
            </div>
          </section>

          <section className="rounded-xl border bg-white shadow-sm"><div className="border-b px-5 py-4"><h2 className="font-semibold text-gray-900">讨论</h2></div><label className="flex items-start gap-3 p-5 text-sm text-gray-700"><input type="checkbox" checked={form.comments_enabled} onChange={e => setForm(f => ({ ...f, comments_enabled: e.target.checked }))} className="mt-0.5"/><span>允许这篇文章显示已审核评论<span className="mt-1 block text-xs text-gray-400">默认关闭，不会改变现有前台页面。</span></span></label></section>

          {isEdit && <section className="rounded-xl border bg-white shadow-sm"><div className="border-b px-5 py-4"><h2 className="font-semibold text-gray-900">版本记录</h2><p className="mt-1 text-xs text-gray-500">手动保存保留版本，最多 20 个；可高亮比较再恢复。</p></div><div className="divide-y">{revisions.length ? revisions.map(revision => <div key={revision.id} className="flex items-center justify-between gap-3 px-5 py-3"><div className="min-w-0"><p className="truncate text-sm text-gray-700">{revision.title}</p><p className="text-xs text-gray-400">{String(revision.created_at).replace('T', ' ').slice(0, 16)}{revision.created_by_name ? ` · ${revision.created_by_name}` : ''}</p></div><div className="flex gap-3"><button type="button" onClick={() => setRevisionPreview(revision)} className="text-sm text-gray-600 hover:underline">比较</button><button type="button" onClick={() => restoreRevision(revision.id)} className="text-sm text-blue-600 hover:underline">恢复</button></div></div>) : <p className="px-5 py-4 text-sm text-gray-400">还没有可恢复的历史版本。</p>}</div></section>}

          <section className="rounded-xl border bg-white shadow-sm"><div className="border-b px-5 py-4"><h2 className="font-semibold text-gray-900">文章目录</h2><p className="mt-1 text-xs text-gray-500">根据正文中的一级至三级标题生成</p></div><div className="p-5">{outline.length ? <ul className="space-y-2 text-sm text-gray-600">{outline.map((heading, index) => <li key={index} className={heading.startsWith('###') ? 'pl-6' : heading.startsWith('##') ? 'pl-3' : ''}>{heading.replace(/^#{1,3}\s+/, '')}</li>)}</ul> : <p className="text-sm text-gray-400">正文中还没有标题。</p>}</div></section>

          <section className="rounded-xl border bg-white shadow-sm">
            <div className="border-b px-5 py-4"><h2 className="font-semibold text-gray-900">分类</h2></div>
            <div className="p-5"><select value={form.category_id} onChange={set('category_id')} className="w-full rounded-lg border px-3 py-2.5 text-sm outline-none focus:border-blue-500"><option value="">未分类</option>{categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}</select></div>
          </section>

          <section className="rounded-xl border bg-white shadow-sm">
            <div className="border-b px-5 py-4"><h2 className="font-semibold text-gray-900">标签</h2><p className="mt-1 text-xs text-gray-500">用逗号隔开，例如：Word, 排版, 新手</p></div>
            <div className="p-5"><input value={form.tags.join(', ')} onChange={(event) => setForm(f => ({ ...f, tags: event.target.value.split(',').map(tag => tag.trim()).filter(Boolean).slice(0, 12) }))} placeholder="输入标签" className="w-full rounded-lg border px-3 py-2.5 text-sm outline-none focus:border-blue-500" /></div>
          </section>

          <section className="rounded-xl border bg-white shadow-sm">
            <div className="border-b px-5 py-4"><h2 className="font-semibold text-gray-900">特色图片</h2><p className="mt-1 text-xs text-gray-500">作为首页文章卡片的封面。</p></div>
            <div className="p-5">
              {form.cover_image ? <div className="space-y-3"><img src={form.cover_image} className="aspect-[16/9] w-full rounded-lg object-cover" alt="文章封面" /><div className="flex gap-2"><button type="button" onClick={() => setMediaPickerOpen(true)} className="flex-1 rounded-md border px-3 py-2 text-sm text-gray-700 hover:bg-gray-50">替换</button><button type="button" onClick={() => setForm(f => ({ ...f, cover_image: '' }))} className="rounded-md px-3 py-2 text-sm text-red-600 hover:bg-red-50">移除</button></div></div> : <div className="space-y-3"><img src="/uploads/tmp-final-base.jpg" className="aspect-[16/9] w-full rounded-lg object-cover opacity-75" alt="当前默认封面"/><p className="rounded-md bg-amber-50 px-3 py-2 text-xs leading-5 text-amber-800">当前前台会显示上面的默认封面。建议为每篇文章设置独立封面。</p><button type="button" onClick={() => setForm(f => ({ ...f, cover_image: '/uploads/tmp-final-base.jpg' }))} className="w-full rounded-md border px-3 py-2 text-sm text-gray-700">使用当前默认封面</button><label className="flex cursor-pointer items-center justify-center gap-2 rounded-md bg-gray-900 px-3 py-2.5 text-sm font-medium text-white hover:bg-gray-800"><Upload className="h-4 w-4" />{uploading ? '上传中…' : '上传图片'}<input type="file" accept="image/jpeg,image/png,image/webp,image/gif" className="hidden" onChange={uploadImage} /></label><button type="button" onClick={() => setMediaPickerOpen(true)} className="w-full rounded-md border px-3 py-2.5 text-sm text-gray-700 hover:bg-gray-50">从媒体库选择</button></div>}
            </div>
          </section>
        </aside>
      </form>
      {mediaPickerOpen && <MediaPicker onSelect={(url) => setForm(f => ({ ...f, cover_image: url }))} onClose={() => setMediaPickerOpen(false)} />}
      {revisionPreview && <div className="fixed inset-0 z-50 flex items-center justify-center bg-gray-950/50 p-4"><div className="max-h-[88vh] w-full max-w-5xl overflow-auto rounded-xl bg-white p-6 shadow-2xl"><div className="mb-5 flex items-center justify-between"><div><h2 className="font-semibold text-gray-900">版本差异</h2><p className="text-xs text-gray-500">绿色为当前新增，红色删除线为历史版本中已删除</p></div><button type="button" onClick={() => setRevisionPreview(null)} className="rounded border px-3 py-1.5 text-sm">关闭</button></div><RevisionDiff before={revisionPreview.content || ''} after={form.content}/></div></div>}
    </div>
  )
}
