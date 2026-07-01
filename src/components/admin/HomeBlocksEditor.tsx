'use client'

import { useEffect, useState } from 'react'
import { ArrowDown, ArrowUp, LayoutPanelTop, Plus, Save, Trash2 } from 'lucide-react'

type HomeBlockType = 'hero' | 'latestPosts' | 'richText' | 'cta'
type HomeBlock = {
  id: string; type: HomeBlockType; visible: boolean
  title?: string; body?: string
  ctaTitle?: string; ctaSubtitle?: string; ctaButtonLabel?: string; ctaButtonHref?: string
}
const TYPE_LABELS: Record<HomeBlockType, string> = {
  hero: '首屏（标题 / 按钮）', latestPosts: '最新教程列表',
  richText: '自由文字区块', cta: '行动号召横幅',
}
const LOCKED: HomeBlockType[] = ['hero', 'latestPosts']

export default function HomeBlocksEditor() {
  const [blocks, setBlocks] = useState<HomeBlock[]>([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [message, setMessage] = useState('')
  const [error, setError] = useState('')

  useEffect(() => {
    fetch('/api/admin/home-blocks').then(r => r.ok ? r.json() : null)
      .then((d: any) => setBlocks(d?.blocks || []))
      .catch(() => setError('区块加载失败')).finally(() => setLoading(false))
  }, [])

  function move(i: number, dir: -1 | 1) {
    const next = [...blocks]; const t = i + dir
    if (t < 0 || t >= next.length) return
    ;[next[i], next[t]] = [next[t], next[i]]; setBlocks(next); setMessage('')
  }
  function toggle(i: number) { setBlocks(prev => prev.map((b, j) => j === i ? { ...b, visible: !b.visible } : b)); setMessage('') }
  function upd(i: number, patch: Partial<HomeBlock>) { setBlocks(prev => prev.map((b, j) => j === i ? { ...b, ...patch } : b)); setMessage('') }
  function add(type: 'richText' | 'cta') {
    const id = Math.random().toString(36).slice(2, 10)
    setBlocks(prev => [...prev, type === 'richText'
      ? { id, type, visible: true, title: '新区块标题', body: '...' }
      : { id, type, visible: true, ctaTitle: '行动号召', ctaSubtitle: '说明', ctaButtonLabel: '立即查看', ctaButtonHref: '/tutorials' }])
    setMessage('')
  }
  function del(i: number) { if (!confirm('确定删除？')) return; setBlocks(prev => prev.filter((_, j) => j !== i)); setMessage('') }

  async function save() {
    setSaving(true); setMessage(''); setError('')
    const r = await fetch('/api/admin/home-blocks', { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ blocks }) }).catch(() => null)
    const d: any = r ? await r.json().catch(() => ({})) : {}
    if (!r || !r.ok) setError(d.error || '保存失败')
    else { setBlocks(d.blocks || blocks); setMessage('已保存') }
    setSaving(false)
  }

  if (loading) return <section className="rounded-lg border bg-white p-5"><div className="text-sm text-gray-400">加载中...</div></section>

  return (
    <section className="rounded-lg border bg-white p-5">
      <div className="mb-5 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-gray-100"><LayoutPanelTop className="h-4 w-4" /></span>
          <div><h2 className="font-semibold text-gray-900">首页区块顺序</h2><p className="text-xs text-gray-400">上下移动调整顺序</p></div>
        </div>
        <button type="button" onClick={save} disabled={saving} className="inline-flex items-center gap-2 rounded-lg bg-gray-900 px-4 py-2 text-sm font-medium text-white disabled:opacity-50">
          <Save className="h-4 w-4" />{saving ? '保存中' : '保存区块顺序'}
        </button>
      </div>
      {message && <div className="mb-4 rounded-lg border border-green-200 bg-green-50 px-4 py-2 text-sm text-green-700">{message}</div>}
      {error && <div className="mb-4 rounded-lg border border-red-200 bg-red-50 px-4 py-2 text-sm text-red-700">{error}</div>}
      <div className="space-y-3">
        {blocks.map((block, i) => (
          <div key={block.id} className={`rounded-lg border p-4 ${block.visible ? '' : 'opacity-50'}`}>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <span className="rounded bg-gray-100 px-2 py-1 text-xs font-medium">{i + 1}</span>
                <span className="text-sm font-medium">{TYPE_LABELS[block.type]}</span>
              </div>
              <div className="flex items-center gap-1">
                <button type="button" onClick={() => move(i, -1)} disabled={i === 0} className="rounded p-1.5 text-gray-500 hover:bg-gray-100 disabled:opacity-30"><ArrowUp className="h-4 w-4" /></button>
                <button type="button" onClick={() => move(i, 1)} disabled={i === blocks.length - 1} className="rounded p-1.5 text-gray-500 hover:bg-gray-100 disabled:opacity-30"><ArrowDown className="h-4 w-4" /></button>
                <button type="button" onClick={() => toggle(i)} className={`ml-1 rounded-full px-3 py-1 text-xs font-medium ${block.visible ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'}`}>{block.visible ? '显示中' : '已隐藏'}</button>
                {!LOCKED.includes(block.type) && <button type="button" onClick={() => del(i)} className="ml-1 rounded p-1.5 text-red-500 hover:bg-red-50"><Trash2 className="h-4 w-4" /></button>}
              </div>
            </div>
            {block.type === 'richText' && (
              <div className="mt-3 space-y-2 border-t pt-3">
                <input type="text" value={block.title || ''} onChange={e => upd(i, { title: e.target.value })} placeholder="区块标题" className="w-full rounded-lg border px-3 py-2 text-sm" />
                <textarea value={block.body || ''} onChange={e => upd(i, { body: e.target.value })} placeholder="区块正文" rows={3} className="w-full resize-none rounded-lg border px-3 py-2 text-sm" />
              </div>
            )}
            {block.type === 'cta' && (
              <div className="mt-3 grid grid-cols-2 gap-2 border-t pt-3">
                <input type="text" value={block.ctaTitle || ''} onChange={e => upd(i, { ctaTitle: e.target.value })} placeholder="标题" className="col-span-2 rounded-lg border px-3 py-2 text-sm" />
                <input type="text" value={block.ctaSubtitle || ''} onChange={e => upd(i, { ctaSubtitle: e.target.value })} placeholder="说明文字" className="col-span-2 rounded-lg border px-3 py-2 text-sm" />
                <input type="text" value={block.ctaButtonLabel || ''} onChange={e => upd(i, { ctaButtonLabel: e.target.value })} placeholder="按钮文字" className="rounded-lg border px-3 py-2 text-sm" />
                <input type="text" value={block.ctaButtonHref || ''} onChange={e => upd(i, { ctaButtonHref: e.target.value })} placeholder="按钮链接" className="rounded-lg border px-3 py-2 text-sm" />
              </div>
            )}
          </div>
        ))}
      </div>
      <div className="mt-4 flex gap-2">
        <button type="button" onClick={() => add('richText')} className="inline-flex items-center gap-1.5 rounded-lg border px-3 py-2 text-xs font-medium text-gray-700 hover:bg-gray-50"><Plus className="h-3.5 w-3.5" /> 添加文字区块</button>
        <button type="button" onClick={() => add('cta')} className="inline-flex items-center gap-1.5 rounded-lg border px-3 py-2 text-xs font-medium text-gray-700 hover:bg-gray-50"><Plus className="h-3.5 w-3.5" /> 添加行动号召横幅</button>
      </div>
    </section>
  )
}
