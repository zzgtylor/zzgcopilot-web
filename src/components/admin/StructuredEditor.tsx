'use client'

import { useEffect, useMemo, useRef, useState } from 'react'
import { ArrowDown, ArrowUp, Copy, GripVertical, Image as ImageIcon, Plus, Trash2 } from 'lucide-react'

type BlockKind = 'paragraph' | 'heading2' | 'heading3' | 'bullets' | 'numbers' | 'quote' | 'callout' | 'steps' | 'table' | 'code' | 'image' | 'video'
type Block = { id: string; kind: BlockKind; text: string; extra?: string }

const LABELS: Record<BlockKind, string> = {
  paragraph: '段落', heading2: '标题 2', heading3: '标题 3', bullets: '项目列表', numbers: '编号列表', quote: '引用', callout: '提示框', steps: '步骤', table: '表格', code: '代码', image: '图片', video: '视频',
}

function id() { return crypto.randomUUID() }

function parseMarkdown(markdown: string): Block[] {
  if (!markdown.trim()) return [{ id: id(), kind: 'paragraph', text: '' }]
  const lines = markdown.replace(/\r/g, '').split('\n')
  const blocks: Block[] = []
  let index = 0
  while (index < lines.length) {
    if (!lines[index].trim()) { index += 1; continue }
    const line = lines[index]
    if (line.startsWith('```')) {
      const language = line.slice(3).trim(); const content: string[] = []; index += 1
      while (index < lines.length && !lines[index].startsWith('```')) { content.push(lines[index]); index += 1 }
      index += 1; blocks.push({ id: id(), kind: 'code', text: content.join('\n'), extra: language }); continue
    }
    if (/^##\s+/.test(line)) { blocks.push({ id: id(), kind: 'heading2', text: line.replace(/^##\s+/, '') }); index += 1; continue }
    if (/^###\s+/.test(line)) { blocks.push({ id: id(), kind: 'heading3', text: line.replace(/^###\s+/, '') }); index += 1; continue }
    const image = line.match(/^!\[([^\]]*)\]\(([^)]+)\)$/)
    if (image) { blocks.push({ id: id(), kind: 'image', text: image[2], extra: image[1] }); index += 1; continue }
    if (/^>\s*[💡⚠️✅ℹ️]/u.test(line)) { blocks.push({ id: id(), kind: 'callout', text: line.replace(/^>\s*[💡⚠️✅ℹ️]\s*/u, '') }); index += 1; continue }
    if (/^>\s?/.test(line)) { const content: string[] = []; while (index < lines.length && /^>\s?/.test(lines[index])) { content.push(lines[index].replace(/^>\s?/, '')); index += 1 } blocks.push({ id: id(), kind: 'quote', text: content.join('\n') }); continue }
    if (/^-\s+/.test(line)) { const content: string[] = []; while (index < lines.length && /^-\s+/.test(lines[index])) { content.push(lines[index].replace(/^-\s+/, '')); index += 1 } blocks.push({ id: id(), kind: 'bullets', text: content.join('\n') }); continue }
    if (/^\d+\.\s+/.test(line)) { const content: string[] = []; while (index < lines.length && /^\d+\.\s+/.test(lines[index])) { content.push(lines[index].replace(/^\d+\.\s+/, '')); index += 1 } blocks.push({ id: id(), kind: content.length >= 3 ? 'steps' : 'numbers', text: content.join('\n') }); continue }
    if (line.includes('|') && lines[index + 1] && /^\s*\|?\s*:?-+/.test(lines[index + 1])) { const content: string[] = [line, lines[index + 1]]; index += 2; while (index < lines.length && lines[index].includes('|')) { content.push(lines[index]); index += 1 } blocks.push({ id: id(), kind: 'table', text: content.join('\n') }); continue }
    const video = line.match(/^\[(?:观看视频|视频)[^\]]*\]\(([^)]+)\)$/)
    if (video) { blocks.push({ id: id(), kind: 'video', text: video[1] }); index += 1; continue }
    const content = [line]; index += 1
    while (index < lines.length && lines[index].trim() && !/^(#{2,3}\s|```|>\s?|[-*]\s+|\d+\.\s+|!\[)/.test(lines[index])) { content.push(lines[index]); index += 1 }
    blocks.push({ id: id(), kind: 'paragraph', text: content.join('\n') })
  }
  return blocks.length ? blocks : [{ id: id(), kind: 'paragraph', text: '' }]
}

function serializeBlock(block: Block) {
  const lines = block.text.split('\n').filter((line, index, all) => line.trim() || (index > 0 && index < all.length - 1))
  switch (block.kind) {
    case 'heading2': return `## ${block.text.trim()}`
    case 'heading3': return `### ${block.text.trim()}`
    case 'bullets': return lines.map(line => `- ${line}`).join('\n')
    case 'numbers': case 'steps': return lines.map((line, index) => `${index + 1}. ${line}`).join('\n')
    case 'quote': return lines.map(line => `> ${line}`).join('\n')
    case 'callout': return `> 💡 ${block.text.trim()}`
    case 'code': return `\`\`\`${block.extra || ''}\n${block.text}\n\`\`\``
    case 'image': return block.text.trim() ? `![${block.extra || ''}](${block.text.trim()})` : ''
    case 'video': return block.text.trim() ? `[观看视频](${block.text.trim()})` : ''
    default: return block.text.trim()
  }
}

function serialize(blocks: Block[]) { return blocks.map(serializeBlock).filter(Boolean).join('\n\n') }

function BlockCard({ block, index, total, update, move, remove, duplicate, onImage }: { block: Block; index: number; total: number; update: (block: Block) => void; move: (offset: number) => void; remove: () => void; duplicate: () => void; onImage: () => Promise<string> }) {
  const inputRef = useRef<HTMLTextAreaElement>(null)
  function inline(marker: string) {
    const input = inputRef.current
    if (!input) return
    const start = input.selectionStart; const end = input.selectionEnd
    const selected = block.text.slice(start, end) || '文字'
    update({ ...block, text: block.text.slice(0, start) + marker + selected + marker + block.text.slice(end) })
  }
  const rows = block.kind === 'code' || block.kind === 'table' ? 7 : block.kind === 'paragraph' ? 4 : 3
  return <article className="group rounded-xl border bg-white shadow-sm focus-within:border-blue-400 focus-within:ring-2 focus-within:ring-blue-50">
    <div className="flex flex-wrap items-center gap-1 border-b bg-gray-50 px-3 py-2"><GripVertical className="h-4 w-4 text-gray-300"/><select value={block.kind} onChange={event => update({ ...block, kind: event.target.value as BlockKind })} className="rounded border bg-white px-2 py-1 text-xs font-medium text-gray-700">{Object.entries(LABELS).map(([value, label]) => <option key={value} value={value}>{label}</option>)}</select>{['paragraph', 'heading2', 'heading3', 'quote', 'callout'].includes(block.kind) && <><button type="button" onClick={() => inline('**')} className="rounded px-2 py-1 text-xs font-bold hover:bg-gray-200">B</button><button type="button" onClick={() => inline('*')} className="rounded px-2 py-1 text-xs italic hover:bg-gray-200">I</button><button type="button" onClick={() => inline('`')} className="rounded px-2 py-1 text-xs font-mono hover:bg-gray-200">代码</button></>}<div className="ml-auto flex items-center"><button type="button" disabled={index === 0} onClick={() => move(-1)} title="上移" className="rounded p-1.5 hover:bg-gray-200 disabled:opacity-25"><ArrowUp className="h-3.5 w-3.5"/></button><button type="button" disabled={index === total - 1} onClick={() => move(1)} title="下移" className="rounded p-1.5 hover:bg-gray-200 disabled:opacity-25"><ArrowDown className="h-3.5 w-3.5"/></button><button type="button" onClick={duplicate} title="复制区块" className="rounded p-1.5 hover:bg-gray-200"><Copy className="h-3.5 w-3.5"/></button><button type="button" onClick={remove} title="删除区块" className="rounded p-1.5 text-red-500 hover:bg-red-50"><Trash2 className="h-3.5 w-3.5"/></button></div></div>
    <div className="p-3">{block.kind === 'image' ? <div className="grid gap-3 sm:grid-cols-[160px_1fr]"><div className="flex aspect-video items-center justify-center overflow-hidden rounded-lg bg-gray-100">{block.text ? <img src={block.text} alt={block.extra || ''} className="h-full w-full object-cover"/> : <ImageIcon className="h-7 w-7 text-gray-300"/>}</div><div className="space-y-2"><div className="flex gap-2"><input value={block.text} onChange={event => update({ ...block, text: event.target.value })} placeholder="图片 URL" className="min-w-0 flex-1 rounded border px-3 py-2 text-sm"/><button type="button" onClick={async () => { const url = await onImage(); if (url) update({ ...block, text: url }) }} className="rounded border px-3 py-2 text-xs">上传</button></div><input value={block.extra || ''} onChange={event => update({ ...block, extra: event.target.value })} placeholder="图片替代文字" className="w-full rounded border px-3 py-2 text-sm"/></div></div> : <>{block.kind === 'code' && <input value={block.extra || ''} onChange={event => update({ ...block, extra: event.target.value })} placeholder="代码语言，例如 bash" className="mb-2 w-full rounded border px-3 py-2 text-xs"/>}<textarea ref={inputRef} value={block.text} onChange={event => update({ ...block, text: event.target.value })} rows={rows} placeholder={block.kind === 'table' ? '| 标题 | 标题 |\n| --- | --- |\n| 内容 | 内容 |' : block.kind === 'video' ? '视频地址 URL' : block.kind === 'steps' ? '每行填写一个步骤' : `输入${LABELS[block.kind]}内容`} className="w-full resize-y border-0 px-1 py-1 text-sm leading-7 outline-none"/></>}</div>
  </article>
}

export default function StructuredEditor({ value, onChange, onImage }: { value: string; onChange: (value: string) => void; onImage: () => Promise<string> }) {
  const initialValue = useRef(value)
  const [blocks, setBlocks] = useState<Block[]>(() => parseMarkdown(value))
  const [sourceMode, setSourceMode] = useState(false)
  const [source, setSource] = useState(value)
  const [insertKind, setInsertKind] = useState<BlockKind>('paragraph')
  const markdown = useMemo(() => serialize(blocks), [blocks])
  useEffect(() => { if (!sourceMode && markdown !== initialValue.current) onChange(markdown) }, [markdown, onChange, sourceMode])

  function commit(next: Block[]) { setBlocks(next); initialValue.current = serialize(next); onChange(initialValue.current) }
  function add(kind = insertKind) { commit([...blocks, { id: id(), kind, text: kind === 'table' ? '| 标题 | 标题 |\n| --- | --- |\n| 内容 | 内容 |' : '' }]) }
  function switchMode() {
    if (sourceMode) { const next = parseMarkdown(source); setBlocks(next); initialValue.current = source; onChange(source) }
    else setSource(markdown)
    setSourceMode(!sourceMode)
  }

  return <div className="rounded-xl border bg-gray-50 p-3 sm:p-4"><div className="mb-4 flex flex-wrap items-center gap-2"><select value={insertKind} onChange={event => setInsertKind(event.target.value as BlockKind)} className="rounded-lg border bg-white px-3 py-2 text-sm">{Object.entries(LABELS).map(([value, label]) => <option key={value} value={value}>{label}</option>)}</select><button type="button" onClick={() => add()} className="inline-flex items-center gap-1.5 rounded-lg bg-gray-900 px-3 py-2 text-sm font-medium text-white"><Plus className="h-4 w-4"/>添加区块</button><button type="button" onClick={switchMode} className="ml-auto rounded-lg border bg-white px-3 py-2 text-xs text-gray-600">{sourceMode ? '返回区块编辑' : 'Markdown 源码'}</button></div>{sourceMode ? <textarea value={source} onChange={event => { setSource(event.target.value); onChange(event.target.value) }} rows={24} className="w-full rounded-lg border bg-white p-4 font-mono text-sm leading-6 outline-none focus:border-blue-500"/> : <div className="space-y-3">{blocks.map((block, index) => <BlockCard key={block.id} block={block} index={index} total={blocks.length} onImage={onImage} update={next => commit(blocks.map(item => item.id === block.id ? next : item))} move={offset => { const next = [...blocks]; const target = index + offset; [next[index], next[target]] = [next[target], next[index]]; commit(next) }} duplicate={() => { const next = [...blocks]; next.splice(index + 1, 0, { ...block, id: id() }); commit(next) }} remove={() => commit(blocks.length === 1 ? [{ id: id(), kind: 'paragraph', text: '' }] : blocks.filter(item => item.id !== block.id))}/>)}</div>}</div>
}
