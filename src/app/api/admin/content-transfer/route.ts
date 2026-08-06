import { NextRequest, NextResponse } from 'next/server'
import { requireAdminRole } from '@/lib/admin-auth'
import { writeAuditLog } from '@/lib/audit'

type ImportPost = { title?: string; slug?: string; excerpt?: string; content?: string; cover_image?: string; category_slug?: string; tags?: string[]; meta_title?: string; meta_description?: string; og_image?: string }

function cleanSlug(value: string) {
  return value.toLowerCase().trim().replace(/[^a-z0-9_-]+/g, '-').replace(/-+/g, '-').replace(/^-|-$/g, '').slice(0, 120) || `import-${crypto.randomUUID().slice(0, 8)}`
}

function markdownExport(post: Record<string, unknown>) {
  const tags = (() => { try { return JSON.parse(String(post.tags || '[]')) as string[] } catch { return [] } })()
  return [`---`, `title: ${String(post.title || '').replace(/\n/g, ' ')}`, `slug: ${post.slug || ''}`, `excerpt: ${String(post.excerpt || '').replace(/\n/g, ' ')}`, `category: ${post.category_slug || ''}`, `tags: ${tags.join(', ')}`, `cover_image: ${post.cover_image || ''}`, `meta_title: ${String(post.meta_title || '').replace(/\n/g, ' ')}`, `meta_description: ${String(post.meta_description || '').replace(/\n/g, ' ')}`, `---`, '', String(post.content || '')].join('\n')
}

export async function GET(request: NextRequest) {
  const access = await requireAdminRole()
  if (!access.ok) return NextResponse.json({ error: access.error }, { status: access.status })
  const db = access.db
  if (!db) return NextResponse.json({ error: '数据库暂时不可用' }, { status: 503 })
  const params = new URL(request.url).searchParams; const id = params.get('id'); const format = params.get('format') === 'markdown' ? 'markdown' : 'json'
  const condition = id ? 'WHERE p.id = ?' : ''
  const result = await db.prepare(`SELECT p.title, p.slug, p.excerpt, p.content, p.cover_image, p.status, p.tags, p.meta_title, p.meta_description, p.og_image, p.published_at, p.created_at, c.slug AS category_slug FROM posts p LEFT JOIN categories c ON p.category_id = c.id ${condition} ORDER BY p.created_at DESC`).bind(...(id ? [id] : [])).all()
  const posts = result.results || []
  if (id && !posts.length) return NextResponse.json({ error: '文章不存在' }, { status: 404 })
  await writeAuditLog(db, { userId: access.userId, action: 'content.export', targetType: id ? 'post' : 'site', targetId: id, summary: id ? '导出一篇文章' : `导出 ${posts.length} 篇文章`, metadata: { format }, request })
  if (format === 'markdown') {
    const post = posts[0] as Record<string, unknown>
    return new NextResponse(markdownExport(post), { headers: { 'Content-Type': 'text/markdown; charset=utf-8', 'Content-Disposition': `attachment; filename="${post.slug || 'article'}.md"` } })
  }
  return new NextResponse(JSON.stringify({ version: 1, exported_at: new Date().toISOString(), posts }, null, 2), { headers: { 'Content-Type': 'application/json; charset=utf-8', 'Content-Disposition': `attachment; filename="zzgcopilot-content-${new Date().toISOString().slice(0, 10)}.json"` } })
}

export async function POST(request: NextRequest) {
  const access = await requireAdminRole()
  if (!access.ok) return NextResponse.json({ error: access.error }, { status: access.status })
  const db = access.db
  if (!db) return NextResponse.json({ error: '数据库暂时不可用' }, { status: 503 })
  const body = await request.json() as { posts?: ImportPost[]; post?: ImportPost }
  const posts = (Array.isArray(body.posts) ? body.posts : body.post ? [body.post] : []).slice(0, 100)
  if (!posts.length) return NextResponse.json({ error: '没有可导入的文章' }, { status: 400 })
  const created: { id: string; title: string; slug: string }[] = []
  for (const source of posts) {
    const title = String(source.title || '').trim().slice(0, 200)
    const content = String(source.content || '').slice(0, 2_000_000)
    if (!title || !content) continue
    let slug = cleanSlug(String(source.slug || title)); let suffix = 1
    while (await db.prepare('SELECT 1 FROM posts WHERE slug = ?').bind(slug).first()) { suffix += 1; slug = `${cleanSlug(String(source.slug || title)).slice(0, 110)}-${suffix}` }
    const category = source.category_slug ? await db.prepare('SELECT id FROM categories WHERE slug = ?').bind(source.category_slug).first<{ id: string }>() : null
    const id = crypto.randomUUID()
    await db.prepare(`INSERT INTO posts (id, title, slug, excerpt, content, cover_image, author_id, category_id, status, tags, meta_title, meta_description, og_image) VALUES (?, ?, ?, ?, ?, ?, ?, ?, 'draft', ?, ?, ?, ?)`).bind(id, title, slug, String(source.excerpt || '').slice(0, 500), content, String(source.cover_image || ''), access.userId, category?.id || null, JSON.stringify(Array.isArray(source.tags) ? source.tags.slice(0, 12) : []), source.meta_title || null, source.meta_description || null, source.og_image || null).run()
    created.push({ id, title, slug })
  }
  await writeAuditLog(db, { userId: access.userId, action: 'content.import', targetType: 'post', summary: `导入 ${created.length} 篇草稿`, metadata: { ids: created.map(item => item.id) }, request })
  return NextResponse.json({ success: true, created }, { status: 201 })
}
