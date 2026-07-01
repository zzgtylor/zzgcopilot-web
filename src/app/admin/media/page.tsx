'use client'

import { useEffect, useRef, useState } from 'react'
import { Copy, Image as ImageIcon, Trash2, Upload } from 'lucide-react'

type MediaItem = {
  id: string
  filename: string
  original_name: string
  mime_type: string
  size: number
  url: string
  created_at: string
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
  const inputRef = useRef<HTMLInputElement>(null)

  function load() {
    setLoading(true)
    fetch('/api/upload')
      .then((r) => (r.ok ? r.json() : { media: [] }))
      .then((d: any) => setItems(d.media || []))
      .catch(() => setError('加载失败'))
      .finally(() => setLoading(false))
  }

  useEffect(() => {
    load()
  }, [])

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
    if (!confirm('确定删除这张图片吗？此操作不可恢复。')) return
    const r = await fetch('/api/upload?id=' + encodeURIComponent(id), { method: 'DELETE' }).catch(() => null)
    if (r && r.ok) setItems((prev) => prev.filter((i) => i.id !== id))
    else alert('删除失败')
  }

  function copyUrl(item: MediaItem) {
    navigator.clipboard.writeText(item.url).then(() => {
      setCopiedId(item.id)
      setTimeout(() => setCopiedId(''), 1500)
    })
  }

  return (
    <div className="p-8">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">媒体库</h1>
          <p className="mt-1 text-sm text-gray-500">上传和管理图片，可在文章和站点设置中使用</p>
        </div>
        <button
          type="button"
          onClick={() => inputRef.current?.click()}
          disabled={uploading}
          className="inline-flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 disabled:opacity-50"
        >
          <Upload className="h-4 w-4" />
          {uploading ? '上传中...' : '上传图片'}
        </button>
        <input
          ref={inputRef}
          type="file"
          accept="image/*"
          multiple
          className="hidden"
          onChange={(e) => handleFiles(e.target.files)}
        />
      </div>

      {error && <div className="mb-5 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">{error}</div>}

      <div
        onDragOver={(e) => e.preventDefault()}
        onDrop={(e) => {
          e.preventDefault()
          handleFiles(e.dataTransfer.files)
        }}
        className="mb-6 flex flex-col items-center justify-center rounded-2xl border-2 border-dashed bg-white py-10 text-center text-sm text-gray-400"
      >
        <ImageIcon className="mb-2 h-8 w-8 text-gray-300" />
        拖拽图片到此处上传，或点击右上角按钮
      </div>

      {loading ? (
        <div className="py-16 text-center text-gray-400">加载中...</div>
      ) : items.length === 0 ? (
        <div className="rounded-2xl border bg-white py-16 text-center text-gray-400">还没有上传任何图片</div>
      ) : (
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
          {items.map((item) => (
            <div key={item.id} className="group relative overflow-hidden rounded-xl border bg-white">
              <div className="aspect-square w-full overflow-hidden bg-gray-50">
                <img src={item.url} alt={item.original_name} className="h-full w-full object-cover" />
              </div>
              <div className="p-2.5">
                <p className="truncate text-xs font-medium text-gray-700" title={item.original_name}>
                  {item.original_name}
                </p>
                <p className="mt-0.5 text-[11px] text-gray-400">{formatSize(item.size)}</p>
              </div>
              <div className="absolute inset-x-0 top-0 flex justify-end gap-1 bg-gradient-to-b from-black/40 to-transparent p-2 opacity-0 transition group-hover:opacity-100">
                <button
                  type="button"
                  onClick={() => copyUrl(item)}
                  title="复制链接"
                  className="rounded-md bg-white/90 p-1.5 text-gray-700 hover:bg-white"
                >
                  <Copy className="h-3.5 w-3.5" />
                </button>
                <button
                  type="button"
                  onClick={() => remove(item.id)}
                  title="删除"
                  className="rounded-md bg-white/90 p-1.5 text-red-600 hover:bg-white"
                >
                  <Trash2 className="h-3.5 w-3.5" />
                </button>
              </div>
              {copiedId === item.id && (
                <div className="absolute inset-x-0 bottom-0 bg-green-600 py-1 text-center text-[11px] text-white">已复制链接</div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
