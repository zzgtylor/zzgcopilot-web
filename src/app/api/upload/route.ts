import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/auth'
import { getDb } from '@/lib/cloudflare-db'
import { getR2, getR2PublicUrl } from '@/lib/cloudflare-r2'

const ALLOWED_TYPES: Record<string, string> = {
  'image/jpeg': 'jpg',
  'image/png': 'png',
  'image/webp': 'webp',
  'image/gif': 'gif',
  'image/svg+xml': 'svg',
}

const MAX_SIZE = 8 * 1024 * 1024 // 8MB

function canUpload(session: any) {
  const role = session?.user?.role
  return role === 'admin' || role === 'editor'
}

function safeBaseName(name: string) {
  return (
    name
      .replace(/\.[^/.]+$/, '')
      .replace(/[^\w\u4e00-\u9fa5-]+/g, '-')
      .replace(/-+/g, '-')
      .replace(/^-|-$/g, '')
      .slice(0, 60) || 'file'
  )
}

export async function POST(request: NextRequest) {
  try {
    const session = await auth()
    if (!canUpload(session)) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const formData = await request.formData().catch(() => null)
    const file = formData?.get('file') as File | null
    if (!file) {
      return NextResponse.json({ error: '未找到上传文件' }, { status: 400 })
    }

    const ext = ALLOWED_TYPES[file.type]
    if (!ext) {
      return NextResponse.json({ error: '不支持的文件类型，仅支持 JPG/PNG/WEBP/GIF/SVG' }, { status: 400 })
    }

    if (file.size > MAX_SIZE) {
      return NextResponse.json({ error: '文件过大，最大支持 8MB' }, { status: 400 })
    }

    const r2 = await getR2()
    if (!r2) {
      return NextResponse.json({ error: 'R2 存储未配置' }, { status: 500 })
    }

    const db = await getDb()
    if (!db) {
      return NextResponse.json({ error: 'DB unavailable' }, { status: 500 })
    }

    const now = new Date()
    const datePrefix = now.getFullYear() + '/' + String(now.getMonth() + 1).padStart(2, '0')
    const uniqueId =
      typeof crypto !== 'undefined' && 'randomUUID' in crypto
        ? crypto.randomUUID()
        : Math.random().toString(36).slice(2)
    const baseName = safeBaseName(file.name || 'image')
    const filename = baseName + '-' + uniqueId.slice(0, 8) + '.' + ext
    const r2Key = 'media/' + datePrefix + '/' + filename

    const arrayBuffer = await file.arrayBuffer()
    await r2.put(r2Key, arrayBuffer, {
      httpMetadata: { contentType: file.type },
    })

    const publicBase = await getR2PublicUrl()
    const url = publicBase ? publicBase + '/' + r2Key : '/api/media/' + encodeURIComponent(r2Key)

    const userId = (session!.user as any).id
    const mediaId = uniqueId

    await db
      .prepare(
        'INSERT INTO media (id, filename, original_name, r2_key, mime_type, size, uploaded_by) VALUES (?, ?, ?, ?, ?, ?, ?)'
      )
      .bind(mediaId, filename, file.name || filename, r2Key, file.type, file.size, userId)
      .run()

    return NextResponse.json({ url, id: mediaId, filename, size: file.size, mime_type: file.type })
  } catch (e: any) {
    return NextResponse.json({ error: e.message || '上传失败' }, { status: 500 })
  }
}

export async function GET(request: NextRequest) {
  try {
    const session = await auth()
    if (!canUpload(session)) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const db = await getDb()
    if (!db) return NextResponse.json({ media: [] })

    const { searchParams } = new URL(request.url)
    const limit = Math.min(Number(searchParams.get('limit')) || 60, 200)

    const result = await db
      .prepare(
        'SELECT id, filename, original_name, r2_key, mime_type, size, created_at FROM media ORDER BY created_at DESC LIMIT ?'
      )
      .bind(limit)
      .all()

    const publicBase = await getR2PublicUrl()
    const media = (result.results || []).map((row: any) => ({
      ...row,
      url: publicBase ? publicBase + '/' + row.r2_key : '/api/media/' + encodeURIComponent(row.r2_key),
    }))

    return NextResponse.json({ media })
  } catch (e: any) {
    return NextResponse.json({ media: [], error: e.message }, { status: 500 })
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const session = await auth()
    if (!canUpload(session)) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const id = searchParams.get('id')
    if (!id) return NextResponse.json({ error: '缺少 id' }, { status: 400 })

    const db = await getDb()
    if (!db) return NextResponse.json({ error: 'DB unavailable' }, { status: 500 })

    const row = await db.prepare('SELECT r2_key FROM media WHERE id = ?').bind(id).first() as any
    if (!row) return NextResponse.json({ error: '未找到该文件' }, { status: 404 })

    const r2 = await getR2()
    if (r2) {
      await r2.delete(row.r2_key).catch(() => {})
    }

    await db.prepare('DELETE FROM media WHERE id = ?').bind(id).run()

    return NextResponse.json({ success: true })
  } catch (e: any) {
    return NextResponse.json({ error: e.message || '删除失败' }, { status: 500 })
  }
        }
