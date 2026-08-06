import { NextRequest, NextResponse } from 'next/server'
import { getDb } from '@/lib/cloudflare-db'
import { publishDuePosts, scheduledAt } from '@/lib/post-scheduling'
import { requireAdminRole } from '@/lib/admin-auth'
import { writeAuditLog } from '@/lib/audit'

const noStore = { 'Cache-Control': 'private, no-store, max-age=0' }

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
    const access = await requireAdminRole()
    if (!access.ok) return NextResponse.json({ error: access.error }, { status: access.status })

    const db = await getDb()
    if (!db) return NextResponse.json({ error: '数据库暂时不可用' }, { status: 503 })
    await publishDuePosts(db)

    const searchParams = new URL(request.url).searchParams
    if (searchParams.get('meta') === '1') {
      const [categories, authors] = await Promise.all([
        db.prepare('SELECT id, name FROM categories ORDER BY sort_order ASC, name ASC').all(),
        db.prepare("SELECT id, name FROM users WHERE is_active = 1 AND role IN ('admin', 'editor') ORDER BY name ASC").all(),
      ])
      return NextResponse.json({ categories: categories.results || [], authors: authors.results || [] }, { headers: noStore })
    }
    const id = searchParams.get('id')
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
      if (searchParams.get('revisions') === '1') {
        const revisions = await db.prepare('SELECT r.id, r.title, r.status, r.scheduled_at, r.excerpt, r.content, r.created_at, u.name AS created_by_name FROM post_revisions r LEFT JOIN users u ON r.created_by = u.id WHERE r.post_id = ? ORDER BY r.created_at DESC LIMIT 20').bind(id).all()
        return NextResponse.json({ post: post || null, revisions: revisions.results || [] }, { headers: noStore })
      }
      return NextResponse.json({ post: post || null }, { headers: noStore })
    }

    const query = (searchParams.get('q') || '').trim().slice(0, 100)
    const status = searchParams.get('status')
    const categoryId = searchParams.get('category_id')
    const authorId = searchParams.get('author_id')
    const dateFrom = searchParams.get('date_from')
    const dateTo = searchParams.get('date_to')
    const sort = searchParams.get('sort')
    const quality = searchParams.get('quality')
    const page = Math.max(1, Number(searchParams.get('page')) || 1)
    const pageSize = Math.min(50, Math.max(5, Number(searchParams.get('pageSize')) || 12))
    const conditions: string[] = []
    const bindings: unknown[] = []
    if (query) {
      conditions.push('(p.title LIKE ? OR p.slug LIKE ? OR p.excerpt LIKE ?)')
      const term = `%${query}%`
      bindings.push(term, term, term)
    }
    if (status === 'scheduled') {
      conditions.push("p.status = 'draft' AND p.scheduled_at IS NOT NULL")
    } else if (status === 'published' || status === 'draft' || status === 'archived') {
      conditions.push('p.status = ?')
      bindings.push(status)
    }
    if (categoryId) { conditions.push('p.category_id = ?'); bindings.push(categoryId) }
    if (authorId) { conditions.push('p.author_id = ?'); bindings.push(authorId) }
    if (quality === 'cover') conditions.push("p.status = 'published' AND (p.cover_image IS NULL OR p.cover_image = '')")
    if (quality === 'description') conditions.push("p.status = 'published' AND (p.meta_description IS NULL OR p.meta_description = '')")
    if (quality === 'category') conditions.push("p.status = 'published' AND p.category_id IS NULL")
    if (dateFrom && /^\d{4}-\d{2}-\d{2}$/.test(dateFrom)) { conditions.push('date(p.created_at) >= date(?)'); bindings.push(dateFrom) }
    if (dateTo && /^\d{4}-\d{2}-\d{2}$/.test(dateTo)) { conditions.push('date(p.created_at) <= date(?)'); bindings.push(dateTo) }
    const where = conditions.length ? `WHERE ${conditions.join(' AND ')}` : ''
    const orderBy = sort === 'oldest' ? 'p.created_at ASC' : sort === 'views' ? 'p.view_count DESC, p.created_at DESC' : sort === 'updated' ? 'p.updated_at DESC' : 'p.created_at DESC'
    const count = await db.prepare(`SELECT COUNT(*) AS total FROM posts p ${where}`).bind(...bindings).first<{ total: number }>()
    const result = await db
      .prepare(
        `SELECT p.id, p.title, p.slug, p.status, p.scheduled_at, p.tags, p.view_count, p.created_at,
                p.published_at, p.updated_at, u.name AS author_name, u.id AS author_id, c.name AS category_name, c.id AS category_id
         FROM posts p
         LEFT JOIN users u ON p.author_id = u.id
         LEFT JOIN categories c ON p.category_id = c.id
         ${where}
         ORDER BY ${orderBy}
         LIMIT ? OFFSET ?`
      )
      .bind(...bindings, pageSize, (page - 1) * pageSize)
      .all()

    const posts = (result.results || []).map((post: any) => ({
      ...post,
      tags: (() => { try { return JSON.parse(post.tags || '[]') } catch { return [] } })(),
    }))
    return NextResponse.json({ posts, total: count?.total || 0, page, pageSize }, { headers: noStore })
  } catch (error) {
    console.error(JSON.stringify({ message: 'admin posts list failed', error: error instanceof Error ? error.message : String(error) }))
    return NextResponse.json({ error: '文章加载失败，请稍后重试' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const access = await requireAdminRole()
    if (!access.ok) return NextResponse.json({ error: access.error }, { status: access.status })

    const db = await getDb()
    if (!db) return NextResponse.json({ error: 'DB unavailable' }, { status: 500 })

    const body = (await request.json()) as any
    const { title, slug, content, excerpt, cover_image, category_id, tags, meta_title, meta_description, og_image } = body
    const schedule = scheduledAt(body.scheduled_at)
    const wantsSchedule = body.status === 'scheduled'
    const status = wantsSchedule ? 'draft' : normalizedStatus(body.status)
    const userId = access.userId

    if (!title || !slug || !userId || ((status === 'published' || wantsSchedule) && !content)) {
      return NextResponse.json({ error: status === 'published' || wantsSchedule ? '发布文章需要标题、URL Slug 和正文' : '草稿至少需要标题和 URL Slug' }, { status: 400 })
    }
    if (wantsSchedule && (!schedule || new Date(schedule).getTime() <= Date.now())) return NextResponse.json({ error: '请选择未来的发布时间' }, { status: 400 })

    await db
      .prepare(
        `INSERT INTO posts (
          title, slug, content, excerpt, cover_image, category_id, author_id, status, tags,
          meta_title, meta_description, og_image, published_at, scheduled_at
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, CASE WHEN ? = 'published' THEN datetime('now') ELSE NULL END, ?)`
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
        , wantsSchedule ? schedule : null
      )
      .run()

    const post = await db.prepare('SELECT id, updated_at FROM posts WHERE slug = ?').bind(slug).first<{ id: string; updated_at: string }>()
    await writeAuditLog(db, { userId: access.userId, action: status === 'published' ? 'post.publish' : wantsSchedule ? 'post.schedule' : 'post.create_draft', targetType: 'post', targetId: post?.id, summary: `${status === 'published' ? '发布' : wantsSchedule ? '定时发布' : '创建草稿'}：${String(title).slice(0, 120)}`, request })
    return NextResponse.json({ success: true, id: post?.id, updated_at: post?.updated_at })
  } catch (e: any) {
    return NextResponse.json({ error: e.message || '保存失败' }, { status: 500 })
  }
}

export async function PUT(request: NextRequest) {
  try {
    const access = await requireAdminRole()
    if (!access.ok) return NextResponse.json({ error: access.error }, { status: access.status })

    const db = await getDb()
    if (!db) return NextResponse.json({ error: 'DB unavailable' }, { status: 500 })

    const body = (await request.json()) as any
    const { id, title, slug, content, excerpt, cover_image, category_id, tags, meta_title, meta_description, og_image } = body
    const schedule = scheduledAt(body.scheduled_at)
    const wantsSchedule = body.status === 'scheduled'
    const status = wantsSchedule ? 'draft' : normalizedStatus(body.status)
    const expectedUpdatedAt = body.expected_updated_at ? String(body.expected_updated_at) : null

    if (!id || !title || !slug || ((status === 'published' || wantsSchedule) && !content)) {
      return NextResponse.json({ error: '文章信息不完整' }, { status: 400 })
    }
    if (wantsSchedule && (!schedule || new Date(schedule).getTime() <= Date.now())) return NextResponse.json({ error: '请选择未来的发布时间' }, { status: 400 })

    if (body.save_revision) {
      await db.prepare(
        `INSERT INTO post_revisions (post_id, title, slug, excerpt, content, cover_image, category_id, status, scheduled_at, tags, meta_title, meta_description, og_image, created_by)
         SELECT id, title, slug, excerpt, content, cover_image, category_id, status, scheduled_at, tags, meta_title, meta_description, og_image, ? FROM posts WHERE id = ?`
      ).bind(access.userId || null, id).run()
      await db.prepare('DELETE FROM post_revisions WHERE post_id = ? AND id NOT IN (SELECT id FROM post_revisions WHERE post_id = ? ORDER BY created_at DESC LIMIT 20)').bind(id, id).run()
    }

    const update = await db
      .prepare(
        `UPDATE posts
         SET title = ?, slug = ?, content = ?, excerpt = ?, cover_image = ?, category_id = ?,
             status = ?, tags = ?, meta_title = ?, meta_description = ?, og_image = ?, scheduled_at = ?,
             published_at = CASE
               WHEN ? = 'published' AND published_at IS NULL THEN datetime('now')
               WHEN ? <> 'published' THEN NULL
               ELSE published_at
             END,
             updated_at = datetime('now')
         WHERE id = ? AND (? IS NULL OR updated_at = ?)`
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
        wantsSchedule ? schedule : null,
        status,
        status,
        id,
        expectedUpdatedAt,
        expectedUpdatedAt
      )
      .run()
    if (Number(update.meta.changes || 0) === 0 && expectedUpdatedAt) {
      return NextResponse.json({ error: '文章已在其他窗口被修改，请刷新后再保存。', conflict: true }, { status: 409 })
    }
    const updated = await db.prepare('SELECT updated_at FROM posts WHERE id = ?').bind(id).first<{ updated_at: string }>()
    await writeAuditLog(db, { userId: access.userId, action: status === 'published' ? 'post.update_published' : wantsSchedule ? 'post.schedule' : 'post.update_draft', targetType: 'post', targetId: id, summary: `保存文章：${String(title).slice(0, 120)}`, request })
    return NextResponse.json({ success: true, updated_at: updated?.updated_at })
  } catch (e: any) {
    return NextResponse.json({ error: e.message || '保存失败' }, { status: 500 })
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const access = await requireAdminRole()
    if (!access.ok) return NextResponse.json({ error: access.error }, { status: access.status })

    const db = await getDb()
    if (!db) return NextResponse.json({ error: 'DB unavailable' }, { status: 500 })

    const id = new URL(request.url).searchParams.get('id')
    if (!id) return NextResponse.json({ error: '缺少文章 ID' }, { status: 400 })

    await db.prepare("UPDATE posts SET status = 'archived', updated_at = datetime('now') WHERE id = ?").bind(id).run()
    await writeAuditLog(db, { userId: access.userId, action: 'post.trash', targetType: 'post', targetId: id, summary: '将文章移入回收站', request })
    return NextResponse.json({ success: true, status: 'archived' })
  } catch (e: any) {
    return NextResponse.json({ error: e.message || '删除失败' }, { status: 500 })
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const access = await requireAdminRole()
    if (!access.ok) return NextResponse.json({ error: access.error }, { status: access.status })

    const db = await getDb()
    if (!db) return NextResponse.json({ error: 'DB unavailable' }, { status: 500 })

    const { id, ids, action, revisionId } = (await request.json()) as { id?: string; ids?: string[]; action?: string; revisionId?: string }
    if (action === 'restore' && id) {
      await db.prepare("UPDATE posts SET status = 'draft', updated_at = datetime('now') WHERE id = ? AND status = 'archived'").bind(id).run()
      await writeAuditLog(db, { userId: access.userId, action: 'post.restore', targetType: 'post', targetId: id, summary: '从回收站恢复文章', request })
      return NextResponse.json({ success: true, status: 'draft' })
    }
    if (action === 'restoreRevision' && id && revisionId) {
      const revision = await db.prepare('SELECT * FROM post_revisions WHERE id = ? AND post_id = ?').bind(revisionId, id).first<any>()
      if (!revision) return NextResponse.json({ error: '未找到该版本' }, { status: 404 })
      await db.prepare(
        `INSERT INTO post_revisions (post_id, title, slug, excerpt, content, cover_image, category_id, status, scheduled_at, tags, meta_title, meta_description, og_image, created_by)
         SELECT id, title, slug, excerpt, content, cover_image, category_id, status, scheduled_at, tags, meta_title, meta_description, og_image, ? FROM posts WHERE id = ?`
      ).bind(access.userId || null, id).run()
      await db.prepare(
        `UPDATE posts SET title = ?, slug = ?, excerpt = ?, content = ?, cover_image = ?, category_id = ?, status = ?, scheduled_at = ?, tags = ?, meta_title = ?, meta_description = ?, og_image = ?, updated_at = datetime('now') WHERE id = ?`
      ).bind(revision.title, revision.slug, revision.excerpt || '', revision.content, revision.cover_image || '', revision.category_id || null, revision.status, revision.scheduled_at || null, revision.tags || '[]', revision.meta_title || null, revision.meta_description || null, revision.og_image || null, id).run()
      await writeAuditLog(db, { userId: access.userId, action: 'post.revision_restore', targetType: 'post', targetId: id, summary: `恢复历史版本：${String(revision.title).slice(0, 120)}`, metadata: { revisionId }, request })
      return NextResponse.json({ success: true })
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
    await writeAuditLog(db, { userId: access.userId, action: `post.bulk_${action}`, targetType: 'post', summary: `批量处理 ${selected.length} 篇文章`, metadata: { ids: selected }, request })
    return NextResponse.json({ success: true, status: nextStatus, count: selected.length })
  } catch (e: any) {
    return NextResponse.json({ error: e.message || '恢复失败' }, { status: 500 })
  }
}
