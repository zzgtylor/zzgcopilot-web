import { NextRequest, NextResponse } from 'next/server'
import { getDb } from '@/lib/cloudflare-db'
import { publishDuePosts, scheduledAt } from '@/lib/post-scheduling'
import { canManageAllContent, canPublish, requireAdminRole } from '@/lib/admin-auth'
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
        db.prepare("SELECT id, name FROM users WHERE is_active = 1 AND COALESCE(NULLIF(role_key, ''), role) IN ('admin', 'editor', 'author', 'contributor') ORDER BY name ASC").all(),
      ])
      return NextResponse.json({ categories: categories.results || [], authors: authors.results || [], role: access.role, capabilities: { manageAll: canManageAllContent(access.role), publish: canPublish(access.role), upload: access.role !== 'contributor' } }, { headers: noStore })
    }
    const id = searchParams.get('id')
    if (id) {
      const post = await db
        .prepare(
          `SELECT p.*, u.name AS author_name, c.name AS category_name
           FROM posts p
           LEFT JOIN users u ON p.author_id = u.id
           LEFT JOIN categories c ON p.category_id = c.id
           WHERE p.id = ? ${canManageAllContent(access.role) ? '' : 'AND p.author_id = ?'}`
        )
        .bind(...(canManageAllContent(access.role) ? [id] : [id, access.userId]))
        .first()
      if (!post) return NextResponse.json({ error: '文章不存在或没有访问权限' }, { status: 404 })
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
    if (!canManageAllContent(access.role)) { conditions.push('p.author_id = ?'); bindings.push(access.userId) }
    if (query) {
      conditions.push('(p.title LIKE ? OR p.slug LIKE ? OR p.excerpt LIKE ?)')
      const term = `%${query}%`
      bindings.push(term, term, term)
    }
    if (status === 'scheduled') {
      conditions.push("p.status = 'draft' AND p.scheduled_at IS NOT NULL")
    } else if (status === 'pending') {
      conditions.push("p.review_status = 'pending'")
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
        `SELECT p.id, p.title, p.slug, p.status, p.review_status, p.review_note, p.scheduled_at, p.tags, p.view_count, p.created_at,
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
    return NextResponse.json({ posts, total: count?.total || 0, page, pageSize, role: access.role, capabilities: { manageAll: canManageAllContent(access.role), publish: canPublish(access.role) } }, { headers: noStore })
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
    const wantsReview = body.status === 'pending' || body.submit_review === true
    const wantsSchedule = body.status === 'scheduled' && canPublish(access.role)
    const requestedStatus = wantsReview ? 'draft' : body.status
    const status = canPublish(access.role) ? (wantsSchedule ? 'draft' : normalizedStatus(requestedStatus)) : 'draft'
    const reviewStatus = wantsReview ? 'pending' : 'none'
    const userId = access.userId

    if (!title || !slug || !userId || ((status === 'published' || wantsSchedule) && !content)) {
      return NextResponse.json({ error: status === 'published' || wantsSchedule ? '发布文章需要标题、URL Slug 和正文' : '草稿至少需要标题和 URL Slug' }, { status: 400 })
    }
    if (wantsSchedule && (!schedule || new Date(schedule).getTime() <= Date.now())) return NextResponse.json({ error: '请选择未来的发布时间' }, { status: 400 })

    await db
      .prepare(
        `INSERT INTO posts (
          title, slug, content, excerpt, cover_image, category_id, author_id, status, tags,
          meta_title, meta_description, og_image, published_at, scheduled_at, review_status
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, CASE WHEN ? = 'published' THEN datetime('now') ELSE NULL END, ?, ?)`
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
        , wantsSchedule ? schedule : null,
        reviewStatus
      )
      .run()

    const post = await db.prepare('SELECT id, updated_at FROM posts WHERE slug = ?').bind(slug).first<{ id: string; updated_at: string }>()
    await writeAuditLog(db, { userId: access.userId, action: wantsReview ? 'post.submit_review' : status === 'published' ? 'post.publish' : wantsSchedule ? 'post.schedule' : 'post.create_draft', targetType: 'post', targetId: post?.id, summary: `${wantsReview ? '提交审核' : status === 'published' ? '发布' : wantsSchedule ? '定时发布' : '创建草稿'}：${String(title).slice(0, 120)}`, request })
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
    const current = await db.prepare('SELECT author_id, review_status FROM posts WHERE id = ?').bind(id).first<{ author_id: string; review_status: string }>()
    if (!current) return NextResponse.json({ error: '文章不存在' }, { status: 404 })
    if (!canManageAllContent(access.role) && current.author_id !== access.userId) return NextResponse.json({ error: '只能编辑自己的文章' }, { status: 403 })
    const schedule = scheduledAt(body.scheduled_at)
    const wantsReview = body.status === 'pending' || body.submit_review === true
    const wantsSchedule = body.status === 'scheduled' && canPublish(access.role)
    const status = canPublish(access.role) ? (wantsSchedule ? 'draft' : normalizedStatus(wantsReview ? 'draft' : body.status)) : 'draft'
    const reviewStatus = wantsReview ? 'pending' : (current.review_status === 'pending' && !canManageAllContent(access.role) ? 'pending' : 'none')
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
             review_status = ?, review_note = CASE WHEN ? = 'pending' THEN '' ELSE review_note END,
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
        reviewStatus,
        reviewStatus,
        id,
        expectedUpdatedAt,
        expectedUpdatedAt
      )
      .run()
    if (Number(update.meta.changes || 0) === 0 && expectedUpdatedAt) {
      return NextResponse.json({ error: '文章已在其他窗口被修改，请刷新后再保存。', conflict: true }, { status: 409 })
    }
    const updated = await db.prepare('SELECT updated_at FROM posts WHERE id = ?').bind(id).first<{ updated_at: string }>()
    await writeAuditLog(db, { userId: access.userId, action: wantsReview ? 'post.submit_review' : status === 'published' ? 'post.update_published' : wantsSchedule ? 'post.schedule' : 'post.update_draft', targetType: 'post', targetId: id, summary: `${wantsReview ? '提交审核' : '保存文章'}：${String(title).slice(0, 120)}`, request })
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

    const post = await db.prepare('SELECT author_id FROM posts WHERE id = ?').bind(id).first<{ author_id: string }>()
    if (!post) return NextResponse.json({ error: '文章不存在' }, { status: 404 })
    if (!canManageAllContent(access.role) && post.author_id !== access.userId) return NextResponse.json({ error: '只能管理自己的文章' }, { status: 403 })
    await db.prepare("UPDATE posts SET status = 'archived', review_status = 'none', updated_at = datetime('now') WHERE id = ?").bind(id).run()
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

    const { id, ids, action, revisionId, note: rawNote } = (await request.json()) as { id?: string; ids?: string[]; action?: string; revisionId?: string; note?: string }
    if (id) {
      const target = await db.prepare('SELECT author_id FROM posts WHERE id = ?').bind(id).first<{ author_id: string }>()
      if (!target) return NextResponse.json({ error: '文章不存在' }, { status: 404 })
      if (!canManageAllContent(access.role) && target.author_id !== access.userId) return NextResponse.json({ error: '只能管理自己的文章' }, { status: 403 })
    }
    if ((action === 'approve' || action === 'reject') && id) {
      if (!canManageAllContent(access.role)) return NextResponse.json({ error: '只有管理员或编辑可以审核文章' }, { status: 403 })
      const note = String(rawNote || '').slice(0, 500)
      if (action === 'approve') await db.prepare("UPDATE posts SET status = 'published', review_status = 'none', review_note = ?, published_at = COALESCE(published_at, datetime('now')), updated_at = datetime('now') WHERE id = ? AND review_status = 'pending'").bind(note, id).run()
      else await db.prepare("UPDATE posts SET status = 'draft', review_status = 'none', review_note = ?, updated_at = datetime('now') WHERE id = ? AND review_status = 'pending'").bind(note, id).run()
      await writeAuditLog(db, { userId: access.userId, action: `post.review_${action}`, targetType: 'post', targetId: id, summary: action === 'approve' ? '审核通过并发布文章' : '退回文章修改', metadata: { note }, request })
      return NextResponse.json({ success: true })
    }
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
    if (action === 'publish' && !canPublish(access.role)) return NextResponse.json({ error: '没有发布权限，请提交审核' }, { status: 403 })
    const nextStatus = action === 'publish' ? 'published' : action === 'draft' ? 'draft' : action === 'archive' ? 'archived' : null
    if (!nextStatus || selected.length === 0) return NextResponse.json({ error: '请求无效' }, { status: 400 })

    const placeholders = selected.map(() => '?').join(', ')
    await db.prepare(
      `UPDATE posts SET status = ?,
        published_at = CASE WHEN ? = 'published' AND published_at IS NULL THEN datetime('now') WHEN ? <> 'published' THEN NULL ELSE published_at END,
        review_status = 'none', updated_at = datetime('now') WHERE id IN (${placeholders}) ${canManageAllContent(access.role) ? '' : 'AND author_id = ?'}`
    ).bind(nextStatus, nextStatus, nextStatus, ...selected, ...(canManageAllContent(access.role) ? [] : [access.userId])).run()
    await writeAuditLog(db, { userId: access.userId, action: `post.bulk_${action}`, targetType: 'post', summary: `批量处理 ${selected.length} 篇文章`, metadata: { ids: selected }, request })
    return NextResponse.json({ success: true, status: nextStatus, count: selected.length })
  } catch (e: any) {
    return NextResponse.json({ error: e.message || '恢复失败' }, { status: 500 })
  }
}
