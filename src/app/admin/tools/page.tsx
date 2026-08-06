'use client'
import { useRef, useState } from 'react'
import Link from 'next/link'

function parseMarkdown(content: string, fallbackTitle: string) {
  let body = content; const metadata: Record<string, string> = {}
  const frontmatter = content.match(/^---\n([\s\S]*?)\n---\n?/)
  if (frontmatter) {
    for (const line of frontmatter[1].split('\n')) { const separator = line.indexOf(':'); if (separator > 0) metadata[line.slice(0, separator).trim()] = line.slice(separator + 1).trim() }
    body = content.slice(frontmatter[0].length)
  }
  const heading = body.match(/^#\s+(.+)$/m)
  return { title: metadata.title || heading?.[1] || fallbackTitle, slug: metadata.slug || '', excerpt: metadata.excerpt || '', category_slug: metadata.category || '', tags: (metadata.tags || '').split(',').map(item => item.trim()).filter(Boolean), cover_image: metadata.cover_image || '', meta_title: metadata.meta_title || '', meta_description: metadata.meta_description || '', content: body.trim() }
}

export default function ContentToolsPage() {
  const inputRef = useRef<HTMLInputElement>(null)
  const [message, setMessage] = useState('')
  const [error, setError] = useState('')
  const [created, setCreated] = useState<{ id: string; title: string }[]>([])
  async function importFile(file?: File) {
    if (!file) return; setError(''); setMessage('正在导入…')
    try {
      const text = await file.text(); let payload: { posts?: unknown[]; post?: unknown }
      if (file.name.toLowerCase().endsWith('.json')) { const parsed = JSON.parse(text); payload = Array.isArray(parsed) ? { posts: parsed } : parsed.posts ? { posts: parsed.posts } : { post: parsed } }
      else payload = { post: parseMarkdown(text, file.name.replace(/\.[^.]+$/, '')) }
      const response = await fetch('/api/admin/content-transfer', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) })
      const data = await response.json() as { error?: string; created?: { id: string; title: string }[] }; if (!response.ok) throw new Error(data.error || '导入失败')
      setCreated(data.created || []); setMessage(`成功导入 ${data.created?.length || 0} 篇草稿。`)
    } catch (reason) { setMessage(''); setError(reason instanceof Error ? reason.message : '导入失败') }
  }
  return <div className="mx-auto max-w-5xl p-5 sm:p-8"><div className="mb-7"><h1 className="text-2xl font-bold text-gray-900">导入与导出</h1><p className="mt-1 text-sm text-gray-500">迁移文章内容或保存一份编辑器可读的本地副本</p></div>{message && <p className="mb-5 rounded-lg border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-700">{message}</p>}{error && <p className="mb-5 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">{error}</p>}<div className="grid gap-6 md:grid-cols-2"><section className="rounded-2xl border bg-white p-6"><h2 className="font-semibold text-gray-900">导出全部文章</h2><p className="mt-2 text-sm leading-6 text-gray-500">下载 JSON 文件，包含文章正文、摘要、分类、标签、SEO 和封面字段。系统级 D1/R2 备份仍独立保留。</p><a href="/api/admin/content-transfer?format=json" className="mt-5 inline-block rounded-lg bg-blue-600 px-4 py-2.5 text-sm font-medium text-white">下载内容 JSON</a></section><section className="rounded-2xl border bg-white p-6"><h2 className="font-semibold text-gray-900">导入文章</h2><p className="mt-2 text-sm leading-6 text-gray-500">支持本站导出的 JSON 或 Markdown 文件。为避免误发布，所有导入内容先保存为草稿。</p><button onClick={() => inputRef.current?.click()} className="mt-5 rounded-lg border px-4 py-2.5 text-sm font-medium text-gray-700">选择 JSON / Markdown</button><input ref={inputRef} type="file" accept=".json,.md,.markdown,text/markdown,application/json" className="hidden" onChange={event => void importFile(event.target.files?.[0])}/></section></div>{created.length > 0 && <section className="mt-6 rounded-2xl border bg-white p-6"><h2 className="font-semibold text-gray-900">已导入草稿</h2><div className="mt-3 divide-y">{created.map(item => <div key={item.id} className="flex items-center justify-between py-3 text-sm"><span>{item.title}</span><Link href={`/admin/posts/${item.id}/edit`} className="text-blue-600">打开编辑</Link></div>)}</div></section>}</div>
}
