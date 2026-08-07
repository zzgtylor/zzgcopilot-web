'use client'

import { useEffect, useRef, useState } from 'react'
import { Copy, Image as ImageIcon, Search, Trash2, Upload } from 'lucide-react'

type MediaItem = {
  id: string
  filename: string
  original_name: string
  mime_type: string
  size: number
  url: string
  alt_text?: string
  created_at: string
  deleted_at?: string | null
  references?: number
}

function formatSize(bytes: number) {
  if (bytes < 1024) return `${bytes} B`
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
  return `${(bytes / 1024 / 1024).toFixed(1)} MB`
}

export default function MediaLibraryPage() {
  const [items, setItems] = useState<MediaItem[]>([])
  const [loading, setLoading] = useState(true)
  const [uploading, setUploading] = useState(false)
  const [error, setError] = useState('')
  const [copiedId, setCopiedId] = useState('')
  const [trash, setTrash] = useState(false)
  const [query, setQuery] = useState('')
  const [type, setType] = useState('')
  const [month, setMonth] = useState('')
  const [duplicates, setDuplicates] = useState(false)
  const [page, setPage] = useState(1)
  const [total, setTotal] = useState(0)
  const [selected, setSelected] = useState<string[]>([])
  const [detail, setDetail] = useState<MediaItem | null>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  function load() {
    setLoading(true)
    const params = new URLSearchParams({ page: String(page), pageSize: '30' })
    if (trash) params.set('trash', '1')
    if (query) params.set('q', query)
    if (type) params.set('type', type)
    if (month) params.set('month', month)
    if (duplicates) params.set('duplicates', '1')
    fetch('/api/upload?' + params.toString(), { cache: 'no-store' })
      .then(async (r) => { const d: any = await r.json(); if (!r.ok) throw new Error(d.error || '加载失败'); return d })
      .then((d: any) => { setItems(d.media || []); setTotal(Number(d.total || 0)); setSelected([]) })
      .catch((error) => setError(error.message || '加载失败'))
      .finally(() => setLoading(false))
  }

  useEffect(() => {
    load()
  }, [trash, query, type, month, duplicates, page])

  async function handleFiles(files: FileList | null) {
    if (!files || files.length === 0) return
    setUploading(true)
    setError('')
    for (const file of Array.from(files)) {
      const fd = new FormData()
      fd.append('file', file)
      const r = await fetch('/api/upload', { method: 'POST', body: fd }).catch(() => null)
      if (!r || !r.ok) {
        const d = r ? await r.json().catch(() => ({})) : {}
        setError(d.error || `上传 ${file.name} 失败`)
      }
    }
    setUploading(false)
    load()
  }

  async function remove(id: string) {
    if (!confirm('将这张图片移入回收站？正在被文章使用的图片不会被删除。')) return
    const r = await fetch('/api/upload?id=' + encodeURIComponent(id), { method: 'DELETE' }).catch(() => null)
    const d = r ? await r.json().catch(() => ({})) : {}
    if (r?.ok) setItems((prev) => prev.filter((i) => i.id !== id))
    else alert(d.error || '删除失败')
  }

  async function restore(id: string) {
    const r = await fetch('/api/upload', { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ id, action: 'restore' }) }).catch(() => null)
    if (r?.ok) setItems(prev => prev.filter(item => item.id !== id)); else alert('恢复失败')
  }

  async function permanentDelete(id: string) {
    if (!confirm('永久删除后无法恢复，确定继续吗？')) return
    const r = await fetch('/api/upload?id=' + encodeURIComponent(id) + '&permanent=1', { method: 'DELETE' }).catch(() => null)
    const d = r ? await r.json().catch(() => ({})) : {}
    if (r?.ok) setItems(prev => prev.filter(item => item.id !== id)); else alert(d.error || '永久删除失败')
  }

  function copyUrl(item: MediaItem) {
    navigator.clipboard.writeText(item.url).then(() => {
      setCopiedId(item.id)
      setTimeout(() => setCopiedId(''), 1500)
    })
  }

  async function saveAltText(id: string, alt_text: string) {
    const r = await fetch('/api/upload', { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ id, alt_text }) }).catch(() => null)
    if (!r?.ok) setError('图片替代文字保存失败')
  }

  async function runBulk(action: 'trash' | 'restore') {
    if (!selected.length || !confirm(`确定批量处理 ${selected.length} 个文件吗？`)) return
    const r = await fetch('/api/upload', { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ ids: selected, action }) }).catch(() => null)
    if (r?.ok) load(); else setError('批量操作失败；正在被文章引用的媒体请单独检查。')
  }

  async function transformImage(item: MediaItem, action: 'rotate' | 'square' | 'wide') {
    setUploading(true); setError('')
    try {
      const image = new window.Image(); image.crossOrigin = 'anonymous'; image.src = item.url; await image.decode()
      const sourceWidth = image.naturalWidth; const sourceHeight = image.naturalHeight
      const ratio = action === 'square' ? 1 : 16 / 9
      let sx = 0; let sy = 0; let sw = sourceWidth; let sh = sourceHeight
      if (action !== 'rotate') { if (sourceWidth / sourceHeight > ratio) { sw = sourceHeight * ratio; sx = (sourceWidth - sw) / 2 } else { sh = sourceWidth / ratio; sy = (sourceHeight - sh) / 2 } }
      const canvas = document.createElement('canvas')
      if (action === 'rotate') { canvas.width = sourceHeight; canvas.height = sourceWidth; const context = canvas.getContext('2d'); if (!context) throw new Error('浏览器无法编辑图片'); context.translate(canvas.width, 0); context.rotate(Math.PI / 2); context.drawImage(image, 0, 0) }
      else { canvas.width = Math.round(sw); canvas.height = Math.round(sh); canvas.getContext('2d')?.drawImage(image, sx, sy, sw, sh, 0, 0, canvas.width, canvas.height) }
      const blob = await new Promise<Blob | null>(resolve => canvas.toBlob(resolve, item.mime_type === 'image/png' ? 'image/png' : 'image/jpeg', 0.9)); if (!blob) throw new Error('图片处理失败')
      const extension = blob.type === 'image/png' ? 'png' : 'jpg'; const fd = new FormData(); fd.append('file', new File([blob], `${item.original_name.replace(/\.[^.]+$/, '')}-${action}.${extension}`, { type: blob.type }))
      const response = await fetch('/api/upload', { method: 'POST', body: fd }); const data: any = await response.json(); if (!response.ok) throw new Error(data.error || '上传失败')
      setDetail(null); load()
    } catch (reason) { setError(reason instanceof Error ? reason.message : '图片编辑失败') } finally { setUploading(false) }
  }

  return (
    <div className="p-8">
      <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">媒体库</h1>
          <p className="mt-1 text-sm text-gray-500">上传和管理图片，可在文章和站点设置中使用</p>
        </div>
        {!trash && <button
          type="button"
          onClick={() => inputRef.current?.click()}
          disabled={uploading}
          className="inline-flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 disabled:opacity-50"
        >
          <Upload className="h-4 w-4" />
          {uploading ? '上传中...' : '上传图片'}
        </button>}
        <input
          ref={inputRef}
          type="file"
          accept="image/jpeg,image/png,image/webp,image/gif"
          multiple
          className="hidden"
          onChange={(e) => handleFiles(e.target.files)}
        />
      </div>

      <div className="mb-5 flex gap-2"><button onClick={() => { setTrash(false); setPage(1) }} className={'rounded-lg border px-3 py-1.5 text-sm ' + (!trash ? 'border-blue-600 bg-blue-600 text-white' : 'bg-white text-gray-600')}>媒体库</button><button onClick={() => { setTrash(true); setPage(1) }} className={'rounded-lg border px-3 py-1.5 text-sm ' + (trash ? 'border-blue-600 bg-blue-600 text-white' : 'bg-white text-gray-600')}>回收站</button></div>
      {selected.length > 0 && <div className="mb-5 flex items-center gap-3 rounded-xl border border-blue-100 bg-blue-50 px-4 py-3 text-sm"><span className="font-medium text-blue-800">已选择 {selected.length} 个文件</span><button onClick={() => runBulk(trash ? 'restore' : 'trash')} className="rounded-md bg-blue-600 px-3 py-1.5 text-white">{trash ? '批量恢复' : '批量移入回收站'}</button><button onClick={() => setSelected([])} className="text-gray-600">取消选择</button></div>}
      <div className="mb-5 grid gap-3 rounded-xl border bg-white p-4 sm:grid-cols-2 lg:grid-cols-[1fr_170px_170px_auto]"><label className="relative"><Search className="absolute left-3 top-2.5 h-4 w-4 text-gray-400"/><input value={query} onChange={event => { setQuery(event.target.value); setPage(1) }} placeholder="搜索文件名或替代文字" className="w-full rounded-lg border py-2 pl-9 pr-3 text-sm"/></label><select value={type} onChange={event => { setType(event.target.value); setPage(1) }} className="rounded-lg border px-3 py-2 text-sm"><option value="">全部格式</option><option value="image/jpeg">JPG</option><option value="image/png">PNG</option><option value="image/webp">WEBP</option><option value="image/gif">GIF</option></select><input type="month" value={month} onChange={event => { setMonth(event.target.value); setPage(1) }} className="rounded-lg border px-3 py-2 text-sm"/><label className="flex items-center gap-2 whitespace-nowrap text-sm text-gray-600"><input type="checkbox" checked={duplicates} onChange={event => { setDuplicates(event.target.checked); setPage(1) }}/>仅看重复文件</label></div>
      {error && <div className="mb-5 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">{error}</div>}

      {!trash && <div
        onDragOver={(e) => e.preventDefault()}
        onDrop={(e) => {
          e.preventDefault()
          handleFiles(e.dataTransfer.files)
        }}
        className="mb-6 flex flex-col items-center justify-center rounded-2xl border-2 border-dashed bg-white py-10 text-center text-sm text-gray-400"
      >
        <ImageIcon className="mb-2 h-8 w-8 text-gray-300" />
        拖拽图片到此处上传，或点击右上角按钮
      </div>}

      {loading ? (
        <div className="py-16 text-center text-gray-400">加载中...</div>
      ) : items.length === 0 ? (
        <div className="rounded-2xl border bg-white py-16 text-center text-gray-400">{trash ? '回收站是空的' : '还没有上传任何图片'}</div>
      ) : (
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
          {items.map((item) => (
            <div key={item.id} className="group relative overflow-hidden rounded-xl border bg-white">
              <label className="absolute left-2 top-2 z-10 rounded bg-white/90 p-1 shadow"><input type="checkbox" checked={selected.includes(item.id)} onChange={() => setSelected(current => current.includes(item.id) ? current.filter(id => id !== item.id) : [...current, item.id])} aria-label={`选择 ${item.original_name}`}/></label>
              <div className="aspect-square w-full overflow-hidden bg-gray-50">
                <img src={item.url} alt={item.alt_text || item.original_name} className="h-full w-full object-cover" />
              </div>
              <div className="p-2.5">
                <p className="truncate text-xs font-medium text-gray-700" title={item.original_name}>
                  {item.original_name}
                </p>
                <p className="mt-0.5 text-[11px] text-gray-400">{formatSize(item.size)} · {item.references || 0} 处引用</p>
                <button type="button" onClick={() => setDetail(item)} className="mt-2 text-xs text-blue-600">查看详情</button>
                {!trash && <label className="mt-2 block text-[11px] text-gray-500">图片替代文字<input defaultValue={item.alt_text || ''} onBlur={(event) => saveAltText(item.id, event.target.value)} placeholder="说明图片内容" className="mt-1 w-full rounded border px-2 py-1 text-xs text-gray-700 outline-none focus:border-blue-500" /></label>}
              </div>
              <div className="absolute inset-x-0 top-0 flex justify-end gap-1 bg-gradient-to-b from-black/40 to-transparent p-2 opacity-0 transition group-hover:opacity-100">
                {!trash && <button
                  type="button"
                  onClick={() => copyUrl(item)}
                  title="复制链接"
                  className="rounded-md bg-white/90 p-1.5 text-gray-700 hover:bg-white"
                >
                  <Copy className="h-3.5 w-3.5" />
                </button>}
                {!trash ? <button
                  type="button"
                  onClick={() => remove(item.id)}
                  title="删除"
                  className="rounded-md bg-white/90 p-1.5 text-red-600 hover:bg-white"
                >
                  <Trash2 className="h-3.5 w-3.5" />
                </button> : <><button type="button" onClick={() => restore(item.id)} title="恢复" className="rounded-md bg-white/90 px-2 py-1.5 text-xs text-blue-700 hover:bg-white">恢复</button><button type="button" onClick={() => permanentDelete(item.id)} title="永久删除" className="rounded-md bg-white/90 px-2 py-1.5 text-xs text-red-600 hover:bg-white">永久删除</button></>}
              </div>
              {copiedId === item.id && (
                <div className="absolute inset-x-0 bottom-0 bg-green-600 py-1 text-center text-[11px] text-white">已复制链接</div>
              )}
            </div>
          ))}
        </div>
      )}
      <div className="mt-6 flex items-center justify-between text-sm text-gray-500"><span>共 {total} 个文件 · 第 {page} 页</span><div className="flex gap-2"><button disabled={page <= 1} onClick={() => setPage(value => value - 1)} className="rounded border bg-white px-3 py-1.5 disabled:opacity-40">上一页</button><button disabled={page * 30 >= total} onClick={() => setPage(value => value + 1)} className="rounded border bg-white px-3 py-1.5 disabled:opacity-40">下一页</button></div></div>
      {detail && <div className="fixed inset-0 z-50 flex items-center justify-center bg-gray-950/50 p-4"><div className="w-full max-w-3xl rounded-2xl bg-white p-6 shadow-2xl"><div className="flex items-center justify-between"><h2 className="text-lg font-semibold">媒体详情</h2><button onClick={() => setDetail(null)} className="rounded border px-3 py-1.5 text-sm">关闭</button></div><div className="mt-5 grid gap-6 md:grid-cols-2"><img src={detail.url} alt={detail.alt_text || detail.original_name} className="max-h-[55vh] w-full rounded-xl bg-gray-50 object-contain"/><dl className="space-y-3 text-sm"><div><dt className="text-gray-400">文件名</dt><dd className="break-all text-gray-800">{detail.original_name}</dd></div><div><dt className="text-gray-400">格式与大小</dt><dd>{detail.mime_type} · {formatSize(detail.size)}</dd></div><div><dt className="text-gray-400">上传时间</dt><dd>{String(detail.created_at).replace('T', ' ').slice(0, 19)}</dd></div><div><dt className="text-gray-400">文章引用</dt><dd>{detail.references || 0} 处</dd></div><div><dt className="text-gray-400">文件地址</dt><dd className="break-all text-blue-600">{detail.url}</dd></div><div><dt className="mb-2 text-gray-400">基础编辑（生成新文件，保留原图）</dt><dd className="flex flex-wrap gap-2"><button disabled={uploading} onClick={() => transformImage(detail, 'rotate')} className="rounded border px-3 py-1.5">顺时针旋转</button><button disabled={uploading} onClick={() => transformImage(detail, 'square')} className="rounded border px-3 py-1.5">裁剪 1:1</button><button disabled={uploading} onClick={() => transformImage(detail, 'wide')} className="rounded border px-3 py-1.5">裁剪 16:9</button></dd></div><button onClick={() => copyUrl(detail)} className="rounded-lg bg-gray-900 px-4 py-2 text-white">复制文件地址</button></dl></div></div></div>}
    </div>
  )
}
