import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/auth'
import { getDb } from '@/lib/cloudflare-db'

async function requireAdmin() {
  const session = await auth()
  return session?.user && (session.user as any).role === 'admin'
}

function normalizeSlug(value: unknown) {
  return String(value || '').trim().toLowerCase().replace(/[^a-z0-9-]+/g, '-').replace(/^-|-$/g, '').slice(0, 80)
}

export async function GET() {
  if (!await requireAdmin()) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const db = await getDb()
  if (!db) return NextResponse.json({ categories: [] })
  const result = await db.prepare(`SELECT c.id, c.name, c.slug, c.description, c.sort_order, COUNT(p.id) AS post_count FROM categories c LEFT JOIN posts p ON p.category_id = c.id AND p.status != 'archived' GROUP BY c.id ORDER BY c.sort_order ASC, c.name ASC`).all()
  return NextResponse.json({ categories: result.results || [] })
}

export async function POST(request: NextRequest) {
  if (!await requireAdmin()) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const body = await request.json() as any
  const name = String(body.name || '').trim().slice(0, 50)
  const slug = normalizeSlug(body.slug || name)
  if (!name || !slug) return NextResponse.json({ error: '请填写分类名称和链接' }, { status: 400 })
  const db = await getDb()
  if (!db) return NextResponse.json({ error: 'DB unavailable' }, { status: 500 })
  await db.prepare('INSERT INTO categories (name, slug, description, sort_order) VALUES (?, ?, ?, COALESCE((SELECT MAX(sort_order) + 1 FROM categories), 0))').bind(name, slug, String(body.description || '').trim().slice(0, 300) || null).run()
  return NextResponse.json({ success: true })
}

export async function PUT(request: NextRequest) {
  if (!await requireAdmin()) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const body = await request.json() as any
  const id = String(body.id || '')
  const name = String(body.name || '').trim().slice(0, 50)
  const slug = normalizeSlug(body.slug || name)
  if (!id || !name || !slug) return NextResponse.json({ error: '分类信息不完整' }, { status: 400 })
  const db = await getDb()
  if (!db) return NextResponse.json({ error: 'DB unavailable' }, { status: 500 })
  await db.prepare('UPDATE categories SET name = ?, slug = ?, description = ? WHERE id = ?').bind(name, slug, String(body.description || '').trim().slice(0, 300) || null, id).run()
  return NextResponse.json({ success: true })
}

export async function DELETE(request: NextRequest) {
  if (!await requireAdmin()) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const id = new URL(request.url).searchParams.get('id')
  if (!id) return NextResponse.json({ error: '缺少分类 ID' }, { status: 400 })
  const db = await getDb()
  if (!db) return NextResponse.json({ error: 'DB unavailable' }, { status: 500 })
  const used = await db.prepare('SELECT COUNT(*) AS total FROM posts WHERE category_id = ?').bind(id).first<{ total: number }>()
  if ((used?.total || 0) > 0) return NextResponse.json({ error: '该分类仍有文章，请先修改文章分类。' }, { status: 409 })
  await db.prepare('DELETE FROM categories WHERE id = ?').bind(id).run()
  return NextResponse.json({ success: true })
}
