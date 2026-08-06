import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/auth'
import { getDb } from '@/lib/cloudflare-db'

function normalizedStatus(value: unknown) {
  return value === 'published' || value === 'archived' ? value : 'draft'
}

function parseTags(value: unknown) {
  if (Array.isArray(value)) return value.map((tag) => String(tag).trim()).filter(Boolean).slice(0, 12)
  if (typeof value !== 'string') return []
  return value.split(',').map((tag) => tag.trim()).filter(Boolean).slice(0, 12)
}

export async function GET(request: NextRequest) {
  try {
    const session = await auth()
    if (!session?.user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const db = await getDb()
    if (!db) return NextResponse.json({ posts: [] })

    const id = new URL(request.url).searchParams.get('id')
    if (id) {
      const post = await db
        .prepare(
          `SELECT p.*, u.name AS author_name, c.name AS category_name
           FROM posts p
           LEFT JOIN users u ON p.author_id = u.id
           LEFT JOIN categories c ON p.category_id = c.id
           WHERE p.id = ?`
        )
        .bind(id)
        .first()
      return NextResponse.json({ post: post || null })
    }

    const { searchParams } = new URL(request.url)
    const query = (searchParams.get('q') || '').trim().slice(0, 100)
    const status = searchParams.get('status')
    const page = Math.max(1, Number(searchParams.get('page')) || 1)
    const pageSize = Math.min(50, Math.max(5, Number(searchParams.get('pageSize')) || 12))
    const conditions: string[] = []
    const bindings: unknown[] = []
    if (query) {
      conditions.push('(p.title LIKE ? OR p.slug LIKE ? OR p.excerpt LIKE ?)')
      const term = `%${query}%`
      bindings.push(term, term, term)
    }
    if (status === 'published' || status === 'draft' || status === 'archived') {
      conditions.push('p.status = ?')
      bindings.push(status)
    }
    const where = conditions.length ? `WHERE ${conditions.join(' AND ')}` : ''
    const count = await db.prepare(`SELECT COUNT(*) AS total FROM posts p ${where}`).bind(...bindings).first<{ total: number }>()
    const result = await db
      .prepare(
        `SELECT p.id, p.title, p.slug, p.status, p.tags, p.view_count, p.created_at,
                u.name AS author_name, c.name AS category_name
         FROM posts p
         LEFT JOIN users u ON p.author_id = u.id
         LEFT JOIN categories c ON p.category_id = c.id
         ${where}
         ORDER BY p.created_at DESC
         LIMIT ? OFFSET ?`
      )
      .bind(...bindings, pageSize, (page - 1) * pageSize)
      .all()

    const posts = (result.results || []).map((post: any) => ({
      ...post,
      tags: (() => { try { return JSON.parse(post.tags || '[]') } catch { return [] } })(),
    }))
    return NextResponse.json({ posts, total: count?.total || 0, page, pageSize })
  } catch {
    return NextResponse.json({ posts: [] })
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await auth()
    if (!session?.user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const db = await getDb()
    if (!db) return NextResponse.json({ error: 'DB unavailable' }, { status: 500 })

    const body = (await request.json()) as any
    const { title, slug, content, excerpt, cover_image, category_id, tags, meta_title, meta_description, og_image } = body
    const status = normalizedStatus(body.status)
    const userId = (session.user as any).id

    if (!title || !slug || !userId || (status === 'published' && !content)) {
      return NextResponse.json({ error: status === 'published' ? '标题、URL Slug 和正文不能为空' : '草稿至少需要标题和 URL Slug' }, { status: 400 })
    }

    await db
      .prepare(
        `INSERT INTO posts (
          title, slug, content, excerpt, cover_image, category_id, author_id, status, tags,
          meta_title, meta_description, og_image, published_at
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, CASE WHEN ? = 'published' THEN datetime('now') ELSE NULL END)`
      )
      .bind(
        title,
        slug,
        content || '',
        excerpt || '',
        cover_image || '',
        category_id || null,
        userId,
        status,
        JSON.stringify(parseTags(tags)),
        meta_title || null,
        meta_description || null,
        og_image || null,
        status
      )
      .run()

    const post = await db.prepare('SELECT id FROM posts WHERE slug = ?').bind(slug).first<{ id: string }>()
    return NextResponse.json({ success: true, id: post?.id })
  } catch (e: any) {
    return NextResponse.json({ error: e.message || '保存失败' }, { status: 500 })
  }
}

export async function PUT(request: NextRequest) {
  try {
    const session = await auth()
    if (!session?.user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const db = await getDb()
    if (!db) return NextResponse.json({ error: 'DB unavailable' }, { status: 500 })

    const body = (await request.json()) as any
    const { id, title, slug, content, excerpt, cover_image, category_id, tags, meta_title, meta_description, og_image } = body
    const status = normalizedStatus(body.status)

    if (!id || !title || !slug || (status === 'published' && !content)) {
      return NextResponse.json({ error: '文章信息不完整' }, { status: 400 })
    }

    await db
      .prepare(
        `UPDATE posts
         SET title = ?, slug = ?, content = ?, excerpt = ?, cover_image = ?, category_id = ?,
             status = ?, tags = ?, meta_title = ?, meta_description = ?, og_image = ?,
             published_at = CASE
               WHEN ? = 'published' AND published_at IS NULL THEN datetime('now')
               WHEN ? <> 'published' THEN NULL
               ELSE published_at
             END,
             updated_at = datetime('now')
         WHERE id = ?`
      )
      .bind(
        title,
        slug,
        content || '',
        excerpt || '',
        cover_image || '',
        category_id || null,
        status,
        JSON.stringify(parseTags(tags)),
        meta_title || null,
        meta_description || null,
        og_image || null,
        status,
        status,
        id
      )
      .run()

    return NextResponse.json({ success: true })
  } catch (e: any) {
    return NextResponse.json({ error: e.message || '保存失败' }, { status: 500 })
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const session = await auth()
    if (!session?.user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const db = await getDb()
    if (!db) return NextResponse.json({ error: 'DB unavailable' }, { status: 500 })

    const id = new URL(request.url).searchParams.get('id')
    if (!id) return NextResponse.json({ error: '缺少文章 ID' }, { status: 400 })

    await db.prepare("UPDATE posts SET status = 'archived', updated_at = datetime('now') WHERE id = ?").bind(id).run()
    return NextResponse.json({ success: true, status: 'archived' })
  } catch (e: any) {
    return NextResponse.json({ error: e.message || '删除失败' }, { status: 500 })
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const session = await auth()
    if (!session?.user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const db = await getDb()
    if (!db) return NextResponse.json({ error: 'DB unavailable' }, { status: 500 })

    const { id, ids, action } = (await request.json()) as { id?: string; ids?: string[]; action?: string }
    if (action === 'restore' && id) {
      await db.prepare("UPDATE posts SET status = 'draft', updated_at = datetime('now') WHERE id = ? AND status = 'archived'").bind(id).run()
      return NextResponse.json({ success: true, status: 'draft' })
    }

    const selected = Array.isArray(ids) ? [...new Set(ids.filter((value) => typeof value === 'string' && value))].slice(0, 100) : []
    const nextStatus = action === 'publish' ? 'published' : action === 'draft' ? 'draft' : action === 'archive' ? 'archived' : null
    if (!nextStatus || selected.length === 0) return NextResponse.json({ error: '请求无效' }, { status: 400 })

    const placeholders = selected.map(() => '?').join(', ')
    await db.prepare(
      `UPDATE posts SET status = ?,
        published_at = CASE WHEN ? = 'published' AND published_at IS NULL THEN datetime('now') WHEN ? <> 'published' THEN NULL ELSE published_at END,
        updated_at = datetime('now') WHERE id IN (${placeholders})`
    ).bind(nextStatus, nextStatus, nextStatus, ...selected).run()
    return NextResponse.json({ success: true, status: nextStatus, count: selected.length })
  } catch (e: any) {
    return NextResponse.json({ error: e.message || '恢复失败' }, { status: 500 })
  }
}
