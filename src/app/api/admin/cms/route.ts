import { NextRequest, NextResponse } from 'next/server'
import { requireAdminRole } from '@/lib/admin-auth'
import { writeAuditLog } from '@/lib/audit'

const noStore = { 'Cache-Control': 'private, no-store, max-age=0' }
const validSlug = /^[a-z0-9]+(?:-[a-z0-9]+)*$/

function clean(value: unknown, max = 200) { return String(value || '').trim().slice(0, max) }
function flag(value: unknown) { return value === true || value === 1 || value === '1' ? 1 : 0 }
function resourceOf(request: NextRequest, body?: Record<string, unknown>) {
  return clean(body?.resource || new URL(request.url).searchParams.get('resource'), 30)
}

export async function GET(request: NextRequest) {
  const access = await requireAdminRole(['admin', 'editor'])
  if (!access.ok) return NextResponse.json({ error: access.error }, { status: access.status })
  if (!access.db) return NextResponse.json({ error: '数据库暂时不可用' }, { status: 503 })
  const resource = resourceOf(request)
  try {
    if (resource === 'pages') {
      const rows = await access.db.prepare('SELECT p.*, u.name AS author_name FROM pages p LEFT JOIN users u ON p.author_id = u.id ORDER BY p.updated_at DESC LIMIT 200').all()
      return NextResponse.json({ items: rows.results || [] }, { headers: noStore })
    }
    if (resource === 'navigation') {
      const rows = await access.db.prepare('SELECT * FROM navigation_items ORDER BY sort_order ASC, created_at ASC').all()
      return NextResponse.json({ items: rows.results || [] }, { headers: noStore })
    }
    if (resource === 'templates') {
      const rows = await access.db.prepare('SELECT * FROM content_templates ORDER BY updated_at DESC LIMIT 100').all()
      return NextResponse.json({ items: rows.results || [] }, { headers: noStore })
    }
    if (resource === 'tags') {
      const rows = await access.db.prepare("SELECT tags FROM posts WHERE tags IS NOT NULL AND tags <> '[]'").all<{ tags: string }>()
      const counts = new Map<string, number>()
      for (const row of rows.results || []) {
        let tags: unknown[] = []; try { tags = JSON.parse(row.tags || '[]') } catch {}
        for (const tag of tags) { const name = clean(tag, 60); if (name) counts.set(name, (counts.get(name) || 0) + 1) }
      }
      return NextResponse.json({ items: [...counts].map(([name, count]) => ({ name, count })).sort((a, b) => b.count - a.count || a.name.localeCompare(b.name, 'zh-CN')) }, { headers: noStore })
    }
    return NextResponse.json({ error: '未知内容类型' }, { status: 400 })
  } catch (error) {
    console.error(JSON.stringify({ message: 'cms list failed', resource, error: error instanceof Error ? error.message : String(error) }))
    return NextResponse.json({ error: '内容加载失败' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  const access = await requireAdminRole(['admin', 'editor'])
  if (!access.ok) return NextResponse.json({ error: access.error }, { status: access.status })
  if (!access.db) return NextResponse.json({ error: '数据库暂时不可用' }, { status: 503 })
  try {
    const body = (await request.json()) as Record<string, unknown>
    const resource = resourceOf(request, body)
    if (resource === 'pages') {
      const title = clean(body.title, 160); const slug = clean(body.slug, 120); const status = body.status === 'published' ? 'published' : 'draft'
      if (!title || !validSlug.test(slug)) return NextResponse.json({ error: '请输入标题和仅含小写字母、数字、连字符的链接别名' }, { status: 400 })
      await access.db.prepare("INSERT INTO pages (title, slug, content, excerpt, status, author_id, meta_title, meta_description, published_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, CASE WHEN ? = 'published' THEN datetime('now') END)").bind(title, slug, clean(body.content, 200000), clean(body.excerpt, 500), status, access.userId, clean(body.meta_title, 160) || null, clean(body.meta_description, 320) || null, status).run()
      const item = await access.db.prepare('SELECT * FROM pages WHERE slug = ?').bind(slug).first()
      await writeAuditLog(access.db, { userId: access.userId, action: 'page.create', targetType: 'page', targetId: String((item as any)?.id || ''), summary: `创建页面：${title}`, request })
      return NextResponse.json({ item })
    }
    if (resource === 'navigation') {
      const label = clean(body.label, 60); const href = clean(body.href, 500)
      if (!label || !href || !(href.startsWith('/') || href.startsWith('https://') || href === '__latest_tutorial__')) return NextResponse.json({ error: '请输入名称和有效链接' }, { status: 400 })
      const order = await access.db.prepare('SELECT COALESCE(MAX(sort_order), -1) + 1 AS value FROM navigation_items').first<{ value: number }>()
      await access.db.prepare('INSERT INTO navigation_items (label, href, sort_order, is_visible, open_new_tab) VALUES (?, ?, ?, ?, ?)').bind(label, href, Number(order?.value || 0), flag(body.is_visible), flag(body.open_new_tab)).run()
    } else if (resource === 'templates') {
      const name = clean(body.name, 100); if (!name) return NextResponse.json({ error: '请输入模板名称' }, { status: 400 })
      await access.db.prepare('INSERT INTO content_templates (name, description, content, created_by) VALUES (?, ?, ?, ?)').bind(name, clean(body.description, 300), clean(body.content, 200000), access.userId).run()
    } else return NextResponse.json({ error: '未知内容类型' }, { status: 400 })
    await writeAuditLog(access.db, { userId: access.userId, action: `${resource}.create`, targetType: resource, summary: `创建${resource}`, request })
    return NextResponse.json({ success: true })
  } catch (error: any) {
    const message = String(error?.message || '')
    return NextResponse.json({ error: message.includes('UNIQUE') ? '链接别名已经存在' : '创建失败' }, { status: 500 })
  }
}

export async function PUT(request: NextRequest) {
  const access = await requireAdminRole(['admin', 'editor'])
  if (!access.ok) return NextResponse.json({ error: access.error }, { status: access.status })
  if (!access.db) return NextResponse.json({ error: '数据库暂时不可用' }, { status: 503 })
  try {
    const body = (await request.json()) as Record<string, unknown>; const resource = resourceOf(request, body); const id = clean(body.id, 64)
    if (!id) return NextResponse.json({ error: '缺少 ID' }, { status: 400 })
    if (resource === 'pages') {
      const title = clean(body.title, 160); const slug = clean(body.slug, 120); const status = ['draft', 'published', 'archived'].includes(String(body.status)) ? String(body.status) : 'draft'
      if (!title || !validSlug.test(slug)) return NextResponse.json({ error: '标题或链接别名无效' }, { status: 400 })
      await access.db.prepare("UPDATE pages SET title=?, slug=?, content=?, excerpt=?, status=?, meta_title=?, meta_description=?, published_at=CASE WHEN ?='published' AND published_at IS NULL THEN datetime('now') WHEN ?<>'published' THEN NULL ELSE published_at END, updated_at=datetime('now') WHERE id=?").bind(title, slug, clean(body.content, 200000), clean(body.excerpt, 500), status, clean(body.meta_title, 160) || null, clean(body.meta_description, 320) || null, status, status, id).run()
    } else if (resource === 'navigation') {
      const href = clean(body.href, 500); if (!clean(body.label, 60) || !(href.startsWith('/') || href.startsWith('https://') || href === '__latest_tutorial__')) return NextResponse.json({ error: '导航内容无效' }, { status: 400 })
      await access.db.prepare("UPDATE navigation_items SET label=?, href=?, sort_order=?, is_visible=?, open_new_tab=?, updated_at=datetime('now') WHERE id=?").bind(clean(body.label, 60), href, Math.max(0, Number(body.sort_order) || 0), flag(body.is_visible), flag(body.open_new_tab), id).run()
    } else if (resource === 'templates') {
      await access.db.prepare("UPDATE content_templates SET name=?, description=?, content=?, updated_at=datetime('now') WHERE id=?").bind(clean(body.name, 100), clean(body.description, 300), clean(body.content, 200000), id).run()
    } else return NextResponse.json({ error: '未知内容类型' }, { status: 400 })
    await writeAuditLog(access.db, { userId: access.userId, action: `${resource}.update`, targetType: resource, targetId: id, summary: `更新${resource}`, request })
    return NextResponse.json({ success: true })
  } catch (error: any) { return NextResponse.json({ error: String(error?.message || '').includes('UNIQUE') ? '链接别名已经存在' : '保存失败' }, { status: 500 }) }
}

export async function PATCH(request: NextRequest) {
  const access = await requireAdminRole(['admin', 'editor'])
  if (!access.ok) return NextResponse.json({ error: access.error }, { status: access.status })
  if (!access.db) return NextResponse.json({ error: '数据库暂时不可用' }, { status: 503 })
  const body = (await request.json()) as Record<string, unknown>
  if (resourceOf(request, body) !== 'tags') return NextResponse.json({ error: '未知内容类型' }, { status: 400 })
  const oldName = clean(body.oldName, 60); const newName = clean(body.newName, 60); if (!oldName) return NextResponse.json({ error: '缺少标签' }, { status: 400 })
  const rows = await access.db.prepare("SELECT id, tags FROM posts WHERE tags LIKE ?").bind(`%${oldName}%`).all<{ id: string; tags: string }>()
  const statements: D1PreparedStatement[] = []
  for (const row of rows.results || []) {
    let tags: string[] = []; try { tags = JSON.parse(row.tags || '[]') } catch {}
    if (!tags.includes(oldName)) continue
    const next = [...new Set(tags.flatMap(tag => tag === oldName ? (newName ? [newName] : []) : [tag]))]
    statements.push(access.db.prepare("UPDATE posts SET tags=?, updated_at=datetime('now') WHERE id=?").bind(JSON.stringify(next), row.id))
  }
  if (statements.length) await access.db.batch(statements)
  await writeAuditLog(access.db, { userId: access.userId, action: newName ? 'tag.rename' : 'tag.delete', targetType: 'tag', summary: newName ? `重命名标签：${oldName} → ${newName}` : `删除标签：${oldName}`, request })
  return NextResponse.json({ success: true, changed: statements.length })
}

export async function DELETE(request: NextRequest) {
  const access = await requireAdminRole(['admin', 'editor'])
  if (!access.ok) return NextResponse.json({ error: access.error }, { status: access.status })
  if (!access.db) return NextResponse.json({ error: '数据库暂时不可用' }, { status: 503 })
  const params = new URL(request.url).searchParams; const resource = clean(params.get('resource'), 30); const id = clean(params.get('id'), 64)
  if (!id || !['pages', 'navigation', 'templates'].includes(resource)) return NextResponse.json({ error: '请求无效' }, { status: 400 })
  if (resource === 'pages') {
    const page = await access.db.prepare('SELECT status FROM pages WHERE id=?').bind(id).first<{status:string}>()
    if (page?.status !== 'archived') { await access.db.prepare("UPDATE pages SET status='archived', updated_at=datetime('now') WHERE id=?").bind(id).run() }
    else { await access.db.prepare('DELETE FROM pages WHERE id=?').bind(id).run() }
  } else await access.db.prepare(`DELETE FROM ${resource === 'navigation' ? 'navigation_items' : 'content_templates'} WHERE id=?`).bind(id).run()
  await writeAuditLog(access.db, { userId: access.userId, action: `${resource}.delete`, targetType: resource, targetId: id, summary: `删除${resource}`, request })
  return NextResponse.json({ success: true })
}
