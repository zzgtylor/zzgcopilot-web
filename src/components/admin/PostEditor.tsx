'use client'
import { useState, useEffect, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { ChevronDown, ExternalLink, Image as ImageIcon, Loader2, Upload } from 'lucide-react'

function htmlToMarkdown(html: string) {
  const div = document.createElement('div')
  div.innerHTML = html
  function walk(node: Node): string {
    let out = ''
    node.childNodes.forEach((n) => {
      if (n.nodeType === 3) { out += n.textContent; return }
      if (n.nodeType !== 1) return
      const el = n as HTMLElement
      const tag = el.tagName.toLowerCase()
      const inner = walk(el)
      switch (tag) {
        case 'h1': out += '\n# ' + inner + '\n\n'; break
        case 'h2': out += '\n## ' + inner + '\n\n'; break
        case 'h3': out += '\n### ' + inner + '\n\n'; break
        case 'strong': case 'b': out += '**' + inner + '**'; break
        case 'em': case 'i': out += '*' + inner + '*'; break
        case 'code': out += '`' + inner + '`'; break
        case 'pre': out += '\n```\n' + el.textContent + '\n```\n\n'; break
        case 'a': out += '[' + inner + '](' + (el.getAttribute('href') || '') + ')'; break
        case 'img': out += '![' + (el.getAttribute('alt') || '') + '](' + (el.getAttribute('src') || '') + ')'; break
        case 'blockquote': out += '\n> ' + inner.trim().replace(/\n/g, '\n> ') + '\n\n'; break
        case 'ul': out += '\n' + Array.from(el.children).map((li) => '- ' + walk(li).trim()).join('\n') + '\n\n'; break
        case 'ol': out += '\n' + Array.from(el.children).map((li, i) => (i + 1) + '. ' + walk(li).trim()).join('\n') + '\n\n'; break
        case 'br': out += '\n'; break
        case 'p': case 'div': out += inner + '\n\n'; break
        default: out += inner
      }
    })
    return out
  }
  return walk(div).replace(/\n{3,}/g, '\n\n').trim()
}

function markdownToHtml(md: string) {
  if (!md) return ''
  return md.split(/\n{2,}/).map((block) => {
    if (/^### /.test(block)) return '<h3>' + block.slice(4) + '</h3>'
    if (/^## /.test(block)) return '<h2>' + block.slice(3) + '</h2>'
    if (/^# /.test(block)) return '<h1>' + block.slice(2) + '</h1>'
    if (/^> /.test(block)) return '<blockquote>' + block.replace(/^> /gm, '') + '</blockquote>'
    if (/^```/.test(block)) return '<pre>' + block.replace(/^```\w*\n?|\n?```$/g, '') + '</pre>'
    if (/^- /.test(block)) return '<ul>' + block.split('\n').map((l) => '<li>' + l.replace(/^- /, '') + '</li>').join('') + '</ul>'
    if (/^\d+\./.test(block)) return '<ol>' + block.split('\n').map((l) => '<li>' + l.replace(/^\d+\.\s/, '') + '</li>').join('') + '</ol>'
    let h = block.replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>').replace(/\*(.+?)\*/g, '<em>$1</em>').replace(/`(.+?)`/g, '<code>$1</code>')
    return '<p>' + h.replace(/\n/g, '<br>') + '</p>'
  }).join('')
}

function ToolbarBtn({ onClick, title, children }: { onClick: () => void; title: string; children: React.ReactNode }) {
  return (
    <button type="button" title={title} onMouseDown={(e) => { e.preventDefault(); onClick() }}
      className="px-2.5 py-1.5 rounded hover:bg-gray-100 text-gray-700 text-sm min-w-[32px]">
      {children}
    </button>
  )
}

function RichEditor({ value, onChange, onImage }: { value: string; onChange: (v: string) => void; onImage: () => Promise<string> }) {
  const ref = useRef<HTMLDivElement>(null)
  const [mode, setMode] = useState<'rich' | 'source'>('rich')
  const loadedRef = useRef(false)
  useEffect(() => {
    if (mode === 'rich' && ref.current && !loadedRef.current) {
      ref.current.innerHTML = markdownToHtml(value)
      loadedRef.current = true
    }
  }, [mode, value])
  const cmd = (c: string, v?: string) => { document.execCommand(c, false, v); sync() }
  const sync = () => { if (ref.current) onChange(htmlToMarkdown(ref.current.innerHTML)) }
  const insertLink = () => { const url = prompt('链接地址 URL:'); if (url) cmd('createLink', url) }
  const insertImage = async () => { const url = await onImage(); if (url) cmd('insertHTML', '<img src="' + url + '" alt="" style="max-width:100%" />') }
  return (
    <div className="border rounded-lg overflow-hidden">
      <div className="flex flex-wrap items-center gap-0.5 border-b bg-gray-50 px-2 py-1.5">
        {mode === 'rich' ? (
          <>
            <select onChange={(e) => { cmd('formatBlock', e.target.value); e.target.value = '' }} defaultValue="" className="text-sm border rounded px-2 py-1 mr-1 bg-white">
              <option value="" disabled>段落样式</option>
              <option value="p">正文</option><option value="h1">标题 1</option><option value="h2">标题 2</option><option value="h3">标题 3</option>
            </select>
            <ToolbarBtn title="加粗" onClick={() => cmd('bold')}><b>B</b></ToolbarBtn>
            <ToolbarBtn title="斜体" onClick={() => cmd('italic')}><i>I</i></ToolbarBtn>
            <ToolbarBtn title="下划线" onClick={() => cmd('underline')}><u>U</u></ToolbarBtn>
            <span className="w-px h-5 bg-gray-300 mx-1" />
            <ToolbarBtn title="无序列表" onClick={() => cmd('insertUnorderedList')}>• 列表</ToolbarBtn>
            <ToolbarBtn title="有序列表" onClick={() => cmd('insertOrderedList')}>1. 列表</ToolbarBtn>
            <ToolbarBtn title="引用" onClick={() => cmd('formatBlock', 'blockquote')}>❝</ToolbarBtn>
            <span className="w-px h-5 bg-gray-300 mx-1" />
            <ToolbarBtn title="链接" onClick={insertLink}>🔗</ToolbarBtn>
            <ToolbarBtn title="图片" onClick={insertImage}>🖼️</ToolbarBtn>
            <ToolbarBtn title="清除格式" onClick={() => cmd('removeFormat')}>✕格式</ToolbarBtn>
          </>
        ) : <span className="text-sm text-gray-500 px-1">Markdown 源码模式</span>}
        <button type="button" onClick={() => { if (mode === 'rich') sync(); setMode(mode === 'rich' ? 'source' : 'rich'); if (mode === 'source' && ref.current) ref.current.innerHTML = markdownToHtml(value) }}
          className="ml-auto text-xs px-2.5 py-1 rounded border bg-white text-gray-600 hover:bg-gray-100">
          {mode === 'rich' ? '<> 源码' : '✎ 可视化'}
        </button>
      </div>
      {mode === 'rich' ? (
        <div ref={ref} contentEditable suppressContentEditableWarning onInput={sync}
          className="prose max-w-none px-4 py-3 min-h-[320px] focus:outline-none text-sm leading-relaxed" style={{ wordBreak: 'break-word' }} />
      ) : (
        <textarea value={value} onChange={(e) => onChange(e.target.value)} rows={16} className="w-full px-4 py-3 text-sm font-mono resize-y focus:outline-none" />
      )}
    </div>
  )
}

type PostForm = { id?: string; title: string; slug: string; excerpt: string; content: string; category_id: string; status: string; scheduled_at: string; cover_image: string; tags: string[]; meta_title?: string; meta_description?: string }
type Category = { id: string; name: string }
type MediaItem = { id: string; original_name: string; url: string; size: number }
type Revision = { id: string; title: string; status: string; scheduled_at?: string; created_at: string }

function MediaPicker({ onSelect, onClose }: { onSelect: (url: string) => void; onClose: () => void }) {
  const [items, setItems] = useState<MediaItem[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch('/api/upload')
      .then((r) => (r.ok ? r.json() : { media: [] }))
      .then((data) => setItems(data.media || []))
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
  const [form, setForm] = useState<PostForm>({ title: '', slug: '', excerpt: '', content: '', category_id: '', status: 'draft', scheduled_at: '', cover_image: '', tags: [], meta_title: '', meta_description: '' })
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
  const autoSaveTimer = useRef<ReturnType<typeof setTimeout> | null>(null)

  useEffect(() => {
    fetch('/api/categories').then(r => r.json()).then((d: any) => setCategories(d.categories || [])).catch(() => {})
  }, [])

  useEffect(() => {
    if (!isEdit) return
    fetch('/api/admin/posts?id=' + encodeURIComponent(postId!) + '&revisions=1').then(r => r.json())
      .then((d: any) => {
        if (d.post) {
          let tags: string[] = []
          try { tags = Array.isArray(d.post.tags) ? d.post.tags : JSON.parse(d.post.tags || '[]') } catch { tags = [] }
          setForm({ id: d.post.id, title: d.post.title || '', slug: d.post.slug || '', excerpt: d.post.excerpt || '', content: d.post.content || '', category_id: d.post.category_id || '', status: d.post.scheduled_at ? 'scheduled' : d.post.status || 'draft', scheduled_at: d.post.scheduled_at ? new Date(d.post.scheduled_at).toISOString().slice(0, 16) : '', cover_image: d.post.cover_image || '', tags, meta_title: d.post.meta_title || '', meta_description: d.post.meta_description || '' })
          setRevisions(d.revisions || [])
        }
        else setError(d.error || '加载文章失败')
      }).catch(() => setError('加载文章失败')).finally(() => setLoading(false))
  }, [isEdit, postId])

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
      input.type = 'file'; input.accept = 'image/*'
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
    const payload = { ...form, id: currentPostId || undefined, status: automatic ? 'draft' : form.status, scheduled_at: automatic ? '' : form.status === 'scheduled' ? form.scheduled_at : '', save_revision: !automatic, slug: form.slug || Date.now().toString() }
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
    if (!form.title || saving) return
    if (autoSaveTimer.current) clearTimeout(autoSaveTimer.current)
    autoSaveTimer.current = setTimeout(() => { void save(true) }, 10000)
    return () => { if (autoSaveTimer.current) clearTimeout(autoSaveTimer.current) }
  }, [form.title, form.slug, form.excerpt, form.content, form.category_id, form.cover_image, form.tags, form.meta_title, form.meta_description])

  async function restoreRevision(revisionId: string) {
    if (!currentPostId || !confirm('恢复这个版本？系统会先保留当前内容，便于再次恢复。')) return
    const r = await fetch('/api/admin/posts', { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ id: currentPostId, revisionId, action: 'restoreRevision' }) }).catch(() => null)
    if (!r?.ok) { setError('版本恢复失败'); return }
    window.location.reload()
  }

  if (loading) return <div className="p-8 text-sm text-gray-400">加载中...</div>

  return (
    <div className="mx-auto max-w-7xl p-5 sm:p-8">
      <div className="mb-6 flex items-center justify-between">
        <div><h1 className="text-2xl font-bold text-gray-900">{isEdit ? '编辑文章' : '写文章'}</h1><p className="mt-1 text-sm text-gray-500">内容发布后会自动出现在首页的教程卡片中。</p></div>
        <button type="button" onClick={() => router.back()} className="rounded-md border bg-white px-3 py-2 text-sm text-gray-600 hover:bg-gray-50">返回列表</button>
      </div>
      {ok && <p className="mb-4 rounded-lg border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-700">保存成功，正在返回文章列表…</p>}
      {error && <p className="mb-4 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">{error}</p>}
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
            <div className="mb-3 flex items-center justify-between"><label className="text-sm font-semibold text-gray-800">正文内容</label><span className="text-xs text-gray-400">支持标题、列表、链接、图片与 Markdown</span></div>
            <RichEditor value={form.content} onChange={(v) => setForm(f => ({ ...f, content: v }))} onImage={uploadFile} />
          </div>

          <div className="rounded-xl border bg-white p-5 shadow-sm sm:p-6">
            <label className="mb-2 block text-sm font-semibold text-gray-800">摘要 <span className="font-normal text-gray-400">（可选）</span></label>
            <textarea value={form.excerpt} onChange={set('excerpt')} rows={3} className="w-full resize-none rounded-lg border px-3 py-2.5 text-sm outline-none focus:border-blue-500" placeholder="用一两句话介绍这篇文章，便于搜索和分享。" />
          </div>

          <details className="rounded-xl border bg-white shadow-sm">
            <summary className="flex cursor-pointer list-none items-center justify-between px-5 py-4 text-sm font-semibold text-gray-800">SEO 设置（可选）<ChevronDown className="h-4 w-4 text-gray-400" /></summary>
            <div className="space-y-4 border-t p-5">
              <div><label className="mb-1 block text-sm font-medium text-gray-700">SEO 标题</label><input type="text" value={form.meta_title} onChange={set('meta_title')} placeholder={form.title || '留空则使用文章标题'} className="w-full rounded-lg border px-3 py-2.5 text-sm outline-none focus:border-blue-500" /></div>
              <div><label className="mb-1 block text-sm font-medium text-gray-700">SEO 描述</label><textarea value={form.meta_description} onChange={set('meta_description')} rows={3} placeholder={form.excerpt || '留空则使用摘要'} className="w-full resize-none rounded-lg border px-3 py-2.5 text-sm outline-none focus:border-blue-500" /></div>
            </div>
          </details>
        </section>

        <aside className="space-y-5 lg:sticky lg:top-5">
          <section className="rounded-xl border bg-white shadow-sm">
            <div className="border-b px-5 py-4"><h2 className="font-semibold text-gray-900">发布</h2></div>
            <div className="space-y-4 p-5">
              <div className="rounded-lg bg-gray-50 p-3 text-sm"><p className="font-medium text-gray-700">状态</p><div className="mt-2 grid grid-cols-3 gap-2">
                {([['draft', '草稿'], ['published', '立即发布'], ['scheduled', '定时发布']] as const).map(([value, label]) => <button key={value} type="button" onClick={() => setForm(f => ({ ...f, status: value }))} className={'rounded-md border px-2 py-2 text-xs font-medium transition ' + (form.status === value ? 'border-blue-600 bg-blue-50 text-blue-700' : 'bg-white text-gray-600 hover:bg-gray-50')}>{label}</button>)}
              </div>{form.status === 'scheduled' && <label className="mt-3 block text-xs text-gray-600">发布时间<input type="datetime-local" value={form.scheduled_at} onChange={set('scheduled_at')} className="mt-1 w-full rounded-md border bg-white px-2 py-2 text-sm" /></label>}</div>
              <p className="text-xs leading-5 text-gray-500">立即发布会显示在首页；定时发布到点后自动公开；草稿仅在后台可见。{lastSavedAt ? ` 已自动保存 ${lastSavedAt}` : ' 输入后会自动保存为草稿。'}</p>
              <button type="submit" disabled={saving} className="flex w-full items-center justify-center gap-2 rounded-lg bg-blue-600 px-4 py-3 text-sm font-semibold text-white hover:bg-blue-700 disabled:opacity-50">
                {saving && <Loader2 className="h-4 w-4 animate-spin" />}{saving ? '保存中…' : form.status === 'published' ? '发布文章' : form.status === 'scheduled' ? '设定发布时间' : '保存草稿'}
              </button>
            </div>
          </section>

          {isEdit && <section className="rounded-xl border bg-white shadow-sm"><div className="border-b px-5 py-4"><h2 className="font-semibold text-gray-900">版本记录</h2><p className="mt-1 text-xs text-gray-500">每次手动保存都会保留一个版本，最多 20 个。</p></div><div className="divide-y">{revisions.length ? revisions.map(revision => <div key={revision.id} className="flex items-center justify-between gap-3 px-5 py-3"><div className="min-w-0"><p className="truncate text-sm text-gray-700">{revision.title}</p><p className="text-xs text-gray-400">{String(revision.created_at).replace('T', ' ').slice(0, 16)}</p></div><button type="button" onClick={() => restoreRevision(revision.id)} className="shrink-0 text-sm text-blue-600 hover:underline">恢复</button></div>) : <p className="px-5 py-4 text-sm text-gray-400">还没有可恢复的历史版本。</p>}</div></section>}

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
              {form.cover_image ? <div className="space-y-3"><img src={form.cover_image} className="aspect-[16/9] w-full rounded-lg object-cover" alt="文章封面" /><div className="flex gap-2"><button type="button" onClick={() => setMediaPickerOpen(true)} className="flex-1 rounded-md border px-3 py-2 text-sm text-gray-700 hover:bg-gray-50">替换</button><button type="button" onClick={() => setForm(f => ({ ...f, cover_image: '' }))} className="rounded-md px-3 py-2 text-sm text-red-600 hover:bg-red-50">移除</button></div></div> : <div className="space-y-3"><div className="flex aspect-[16/9] flex-col items-center justify-center rounded-lg border-2 border-dashed bg-gray-50 text-center text-sm text-gray-400"><ImageIcon className="mb-2 h-7 w-7" />上传一张横向图片</div><p className="rounded-md bg-amber-50 px-3 py-2 text-xs leading-5 text-amber-800">建议上传 16:9 横向封面；没有封面时首页会使用默认图片。</p><label className="flex cursor-pointer items-center justify-center gap-2 rounded-md bg-gray-900 px-3 py-2.5 text-sm font-medium text-white hover:bg-gray-800"><Upload className="h-4 w-4" />{uploading ? '上传中…' : '上传图片'}<input type="file" accept="image/*" className="hidden" onChange={uploadImage} /></label><button type="button" onClick={() => setMediaPickerOpen(true)} className="w-full rounded-md border px-3 py-2.5 text-sm text-gray-700 hover:bg-gray-50">从媒体库选择</button></div>}
            </div>
          </section>
        </aside>
      </form>
      {mediaPickerOpen && <MediaPicker onSelect={(url) => setForm(f => ({ ...f, cover_image: url }))} onClose={() => setMediaPickerOpen(false)} />}
    </div>
  )
}
