import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/auth'
import { getDb } from '@/lib/cloudflare-db'

export async function GET(request: NextRequest) {
  try {
    const session = await auth()
    if (!session?.user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const db = await getDb()
    if (!db) return NextResponse.json({ posts: [] })

    const { searchParams } = new URL(request.url)
    const id = searchParams.get('id')

    if (id) {
      const post = await db.prepare('SELECT * FROM posts WHERE id = ?').bind(id).first()
      if (!post) return NextResponse.json({ error: '文章不存在' }, { status: 404 })
      return NextResponse.json({ post })
    }

    const result = await db
      .prepare(
        'SELECT p.id, p.title, p.slug, p.status, p.view_count, p.created_at, u.name as author_name, c.name as category_name FROM posts p LEFT JOIN users u ON p.author_id = u.id LEFT JOIN categories c ON p.category_id = c.id ORDER BY p.created_at DESC LIMIT 100'
      )
      .all()
    return NextResponse.json({ posts: result.results || [] })
  } catch (e) {
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
    const { title, slug, content, excerpt, cover_image, category_id, status, tags, meta_title, meta_description, og_image } = body
    const userId = (session.user as any).id
    const publishedAt = status === 'published' ? new Date().toISOString() : null

    await db
      .prepare(
        'INSERT INTO posts (title, slug, content, excerpt, cover_image, category_id, author_id, status, tags, published_at, meta_title, meta_description, og_image) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)'
      )
      .bind(title, slug, content, excerpt || '', cover_image || '', category_id || null, userId, status || 'draft', JSON.stringify(tags || []), publishedAt, meta_title || null, meta_description || null, og_image || null)
      .run()

    return NextResponse.json({ success: true })
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 })
  }
}

export async function PUT(request: NextRequest) {
  try {
    const session = await auth()
    if (!session?.user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const db = await getDb()
    if (!db) return NextResponse.json({ error: 'DB unavailable' }, { status: 500 })

    const body = (await request.json()) as any
    const { id, title, slug, content, excerpt, cover_image, category_id, status, tags, meta_title, meta_description, og_image } = body

    const existing = await db.prepare('SELECT status, published_at FROM posts WHERE id = ?').bind(id).first() as any
    const shouldStampPublishedAt = status === 'published' && !existing?.published_at

    await db
      .prepare(
        "UPDATE posts SET title=?, slug=?, content=?, excerpt=?, cover_image=?, category_id=?, status=?, tags=?, meta_title=?, meta_description=?, og_image=?, published_at = COALESCE(?, published_at), updated_at=datetime('now') WHERE id=?"
      )
      .bind(title, slug, content, excerpt || '', cover_image || '', category_id || null, status, JSON.stringify(tags || []), meta_title || null, meta_description || null, og_image || null, shouldStampPublishedAt ? new Date().toISOString() : null, id)
      .run()

    return NextResponse.json({ success: true })
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 })
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const session = await auth()
    if (!session?.user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const db = await getDb()
    if (!db) return NextResponse.json({ error: 'DB unavailable' }, { status: 500 })

    const { searchParams } = new URL(request.url)
    const id = searchParams.get('id')
    await db.prepare('DELETE FROM posts WHERE id = ?').bind(id).run()
    return NextResponse.json({ success: true })
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 })
  }
}
