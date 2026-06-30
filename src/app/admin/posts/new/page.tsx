'use client'
import { useState, useEffect, useRef } from 'react'
import { useRouter } from 'next/navigation'

// Convert editor HTML to Markdown so stored content stays compatible with react-markdown
function htmlToMarkdown(html) {
  const div = document.createElement('div')
  div.innerHTML = html
  function walk(node) {
    let out = ''
    node.childNodes.forEach((n) => {
      if (n.nodeType === 3) { out += n.textContent; return }
      if (n.nodeType !== 1) return
      const tag = n.tagName.toLowerCase()
      const inner = walk(n)
      switch (tag) {
        case 'h1': out += '\n# ' + inner + '\n\n'; break
        case 'h2': out += '\n## ' + inner + '\n\n'; break
        case 'h3': out += '\n### ' + inner + '\n\n'; break
        case 'strong': case 'b': out += '**' + inner + '**'; break
        case 'em': case 'i': out += '*' + inner + '*'; break
        case 'code': out += '\`' + inner + '\`'; break
        case 'pre': out += '\n\`\`\`\n' + n.textContent + '\n\`\`\`\n\n'; break
        case 'a': out += '[' + inner + '](' + (n.getAttribute('href') || '') + ')'; break
        case 'img': out += '![' + (n.getAttribute('alt') || '') + '](' + (n.getAttribute('src') || '') + ')'; break
        case 'blockquote': out += '\n> ' + inner.trim().replace(/\n/g, '\n> ') + '\n\n'; break
        case 'ul': out += '\n' + Array.from(n.children).map((li) => '- ' + walk(li).trim()).join('\n') + '\n\n'; break
        case 'ol': out += '\n' + Array.from(n.children).map((li, i) => (i + 1) + '. ' + walk(li).trim()).join('\n') + '\n\n'; break
        case 'br': out += '\n'; break
        case 'p': case 'div': out += inner + '\n\n'; break
        default: out += inner
      }
    })
    return out
  }
  return walk(div).replace(/\n{3,}/g, '\n\n').trim()
}

// Minimal Markdown to HTML for loading existing content into the editor
function markdownToHtml(md) {
  if (!md) return ''
  return md.split(/\n{2,}/).map((block) => {
    if (/^### /.test(block)) return '<h3>' + block.slice(4) + '</h3>'
    if (/^## /.test(block)) return '<h2>' + block.slice(3) + '</h2>'
    if (/^# /.test(block)) return '<h1>' + block.slice(2) + '</h1>'
    if (/^> /.test(block)) return '<blockquote>' + block.replace(/^> /gm, '') + '</blockquote>'
    if (/^\`\`\`/.test(block)) return '<pre>' + block.replace(/^\`\`\`\w*\n?|\n?\`\`\`$/g, '') + '</pre>'
    if (/^- /.test(block)) return '<ul>' + block.split('\n').map((l) => '<li>' + l.replace(/^- /, '') + '</li>').join('') + '</ul>'
    if (/^\d+\. /.test(block)) return '<ol>' + block.split('\n').map((l) => '<li>' + l.replace(/^\d+\. /, '') + '</li>').join('') + '</ol>'
    let h = block.replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>').replace(/\*(.+?)\*/g, '<em>$1</em>').replace(/\`(.+?)\`/g, '<code>$1</code>')
    return '<p>' + h.replace(/\n/g, '<br>') + '</p>'
  }).join('')
}

function ToolbarBtn({ onClick, title, children }) {
  return (
    <button type="button" title={title} onMouseDown={(e) => { e.preventDefault(); onClick() }}
      className="px-2.5 py-1.5 rounded hover:bg-gray-100 text-gray-700 text-sm min-w-[32px]">
      {children}
    </button>
  )
}

function RichEditor({ value, onChange, onImage }) {
  const ref = useRef(null)
  const [mode, setMode] = useState('rich')

  useEffect(() => {
    if (mode === 'rich' && ref.current && !ref.current.innerHTML) {
      ref.current.innerHTML = markdownToHtml(value)
    }
  }, [mode])

  const cmd = (c, v) => { document.execCommand(c, false, v); sync() }
  const sync = () => { if (ref.current) onChange(htmlToMarkdown(ref.current.innerHTML)) }

  const insertLink = () => { const url = prompt('链接地址 URL:'); if (url) cmd('createLink', url) }
  const insertImage = async () => {
    const url = await onImage()
    if (url) { cmd('insertHTML', '<img src="' + url + '" alt="" style="max-width:100%" />') }
  }

  return (
    <div className="border rounded-lg overflow-hidden">
      <div className="flex flex-wrap items-center gap-0.5 border-b bg-gray-50 px-2 py-1.5">
        {mode === 'rich' ? (
          <>
            <select onChange={(e) => { cmd('formatBlock', e.target.value); e.target.value = '' }} defaultValue=""
              className="text-sm border rounded px-2 py-1 mr-1 bg-white">
              <option value="" disabled>段落样式</option>
              <option value="p">正文</option>
              <option value="h1">标题 1</option>
              <option value="h2">标题 2</option>
              <option value="h3">标题 3</option>
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
          className="prose max-w-none px-4 py-3 min-h-[320px] focus:outline-none text-sm leading-relaxed"
          style={{ wordBreak: 'break-word' }} />
      ) : (
        <textarea value={value} onChange={(e) => onChange(e.target.value)} rows={16}
          className="w-full px-4 py-3 text-sm font-mono resize-y focus:outline-none" />
      )}
    </div>
  )
}

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

  async function uploadFile() {
    return new Promise((resolve) => {
      const input = document.createElement('input')
      input.type = 'file'; input.accept = 'image/*'
      input.onchange = async () => {
        const file = input.files?.[0]
        if (!file) return resolve('')
        const fd = new FormData(); fd.append('file', file)
        const r = await fetch('/api/upload', { method: 'POST', body: fd }).catch(() => null)
        const d = r ? await r.json() : {}
        resolve(d.url || '')
      }
      input.click()
    })
  }

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
          <label className="block text-sm font-medium text-gray-700 mb-2">正文 *</label>
          <RichEditor value={form.content} onChange={(v) => setForm(f => ({...f, content: v}))} onImage={uploadFile} />
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
