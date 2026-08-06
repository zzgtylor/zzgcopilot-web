import { NextRequest, NextResponse } from 'next/server'
import { getDb } from '@/lib/cloudflare-db'
import { getR2, getR2PublicUrl } from '@/lib/cloudflare-r2'
import { requireAdminRole } from '@/lib/admin-auth'

const ALLOWED_TYPES: Record<string, string> = {
  'image/jpeg': 'jpg',
  'image/png': 'png',
  'image/webp': 'webp',
  'image/gif': 'gif',
}
const MAX_SIZE = 8 * 1024 * 1024
const noStore = { 'Cache-Control': 'private, no-store, max-age=0' }

function safeBaseName(name: string) {
  return name.replace(/\.[^/.]+$/, '').replace(/[^\w\u4e00-\u9fa5-]+/g, '-').replace(/-+/g, '-').replace(/^-|-$/g, '').slice(0, 60) || 'file'
}

function detectedMime(bytes: Uint8Array) {
  if (bytes[0] === 0xff && bytes[1] === 0xd8 && bytes[2] === 0xff) return 'image/jpeg'
  if (bytes.slice(0, 8).every((value, index) => value === [0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a][index])) return 'image/png'
  const prefix = new TextDecoder().decode(bytes.slice(0, 12))
  if (prefix.startsWith('GIF87a') || prefix.startsWith('GIF89a')) return 'image/gif'
  if (prefix.startsWith('RIFF') && prefix.slice(8, 12) === 'WEBP') return 'image/webp'
  return ''
}

async function mediaUrl(row: { r2_key: string; source_url?: string | null }) {
  if (row.source_url) return row.source_url
  const publicBase = await getR2PublicUrl()
  return publicBase ? `${publicBase}/${row.r2_key}` : `/api/media/${encodeURIComponent(row.r2_key)}`
}

async function referenceCount(db: D1Database, url: string) {
  const match = `%${url}%`
  const result = await db.prepare(
    `SELECT COUNT(*) AS count FROM posts
     WHERE cover_image = ? OR og_image = ? OR content LIKE ?`
  ).bind(url, url, match).first<{ count: number }>()
  return Number(result?.count || 0)
}

export async function POST(request: NextRequest) {
  try {
    const access = await requireAdminRole()
    if (!access.ok) return NextResponse.json({ error: access.error }, { status: access.status })
    const formData = await request.formData().catch(() => null)
    const file = formData?.get('file') as File | null
    if (!file) return NextResponse.json({ error: '未找到上传文件' }, { status: 400 })
    if (file.size > MAX_SIZE) return NextResponse.json({ error: '文件过大，最大支持 8MB' }, { status: 400 })

    const arrayBuffer = await file.arrayBuffer()
    const mime = detectedMime(new Uint8Array(arrayBuffer).slice(0, 16))
    if (!mime || !ALLOWED_TYPES[mime] || mime !== file.type) {
      return NextResponse.json({ error: '文件内容与格式不匹配，仅支持 JPG、PNG、WEBP、GIF' }, { status: 400 })
    }
    const r2 = await getR2()
    const db = await getDb()
    if (!r2) return NextResponse.json({ error: 'R2 存储未配置' }, { status: 503 })
    if (!db) return NextResponse.json({ error: '数据库暂时不可用' }, { status: 503 })

    const now = new Date()
    const uniqueId = crypto.randomUUID()
    const datePrefix = `${now.getUTCFullYear()}/${String(now.getUTCMonth() + 1).padStart(2, '0')}`
    const filename = `${safeBaseName(file.name || 'image')}-${uniqueId.slice(0, 8)}.${ALLOWED_TYPES[mime]}`
    const r2Key = `media/${datePrefix}/${filename}`
    await r2.put(r2Key, arrayBuffer, { httpMetadata: { contentType: mime, cacheControl: 'public, max-age=31536000, immutable' } })

    await db.prepare(
      'INSERT INTO media (id, filename, original_name, r2_key, mime_type, size, alt_text, uploaded_by) VALUES (?, ?, ?, ?, ?, ?, ?, ?)'
    ).bind(uniqueId, filename, file.name || filename, r2Key, mime, file.size, '', access.userId).run()
    return NextResponse.json({ url: await mediaUrl({ r2_key: r2Key }), id: uniqueId, filename, size: file.size, mime_type: mime, alt_text: '' })
  } catch (error) {
    console.error(JSON.stringify({ message: 'media upload failed', error: error instanceof Error ? error.message : String(error) }))
    return NextResponse.json({ error: '上传失败' }, { status: 500 })
  }
}

export async function GET(request: NextRequest) {
  try {
    const access = await requireAdminRole()
    if (!access.ok) return NextResponse.json({ error: access.error }, { status: access.status })
    const db = await getDb()
    if (!db) return NextResponse.json({ error: '数据库暂时不可用' }, { status: 503 })
    const { searchParams } = new URL(request.url)
    const limit = Math.min(Number(searchParams.get('limit')) || 60, 200)
    const trash = searchParams.get('trash') === '1'
    const result = await db.prepare(
      `SELECT id, filename, original_name, r2_key, mime_type, size, alt_text, source_url, deleted_at, created_at
       FROM media WHERE deleted_at IS ${trash ? 'NOT NULL' : 'NULL'} ORDER BY created_at DESC LIMIT ?`
    ).bind(limit).all()
    const media = await Promise.all((result.results || []).map(async (row) => ({ ...row, url: await mediaUrl(row as { r2_key: string; source_url?: string | null }), references: await referenceCount(db, await mediaUrl(row as { r2_key: string; source_url?: string | null })) })))
    return NextResponse.json({ media }, { headers: noStore })
  } catch (error) {
    console.error(JSON.stringify({ message: 'media list failed', error: error instanceof Error ? error.message : String(error) }))
    return NextResponse.json({ error: '媒体加载失败' }, { status: 500 })
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const access = await requireAdminRole()
    if (!access.ok) return NextResponse.json({ error: access.error }, { status: access.status })
    const body = await request.json() as { id?: string; alt_text?: string; action?: string }
    if (!body.id) return NextResponse.json({ error: '缺少 id' }, { status: 400 })
    const db = await getDb()
    if (!db) return NextResponse.json({ error: '数据库暂时不可用' }, { status: 503 })
    if (body.action === 'restore') {
      await db.prepare('UPDATE media SET deleted_at = NULL WHERE id = ?').bind(body.id).run()
      return NextResponse.json({ success: true })
    }
    await db.prepare('UPDATE media SET alt_text = ? WHERE id = ? AND deleted_at IS NULL').bind(String(body.alt_text || '').trim().slice(0, 180), body.id).run()
    return NextResponse.json({ success: true })
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : '保存失败' }, { status: 500 })
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const access = await requireAdminRole()
    if (!access.ok) return NextResponse.json({ error: access.error }, { status: access.status })
    const id = new URL(request.url).searchParams.get('id')
    const permanent = new URL(request.url).searchParams.get('permanent') === '1'
    if (!id) return NextResponse.json({ error: '缺少 id' }, { status: 400 })
    const db = await getDb()
    if (!db) return NextResponse.json({ error: '数据库暂时不可用' }, { status: 503 })
    const row = await db.prepare('SELECT r2_key, source_url FROM media WHERE id = ?').bind(id).first<{ r2_key: string; source_url?: string | null }>()
    if (!row) return NextResponse.json({ error: '未找到该文件' }, { status: 404 })
    const url = await mediaUrl(row)
    const references = await referenceCount(db, url)
    if (references > 0) return NextResponse.json({ error: `该图片仍被 ${references} 篇文章引用，不能删除` }, { status: 409 })
    if (!permanent) {
      await db.prepare("UPDATE media SET deleted_at = datetime('now') WHERE id = ?").bind(id).run()
      return NextResponse.json({ success: true, trashed: true })
    }
    if (access.role !== 'admin') return NextResponse.json({ error: '只有管理员可以永久删除' }, { status: 403 })
    if (!row.source_url) {
      const r2 = await getR2()
      if (r2) await r2.delete(row.r2_key)
    }
    await db.prepare('DELETE FROM media WHERE id = ?').bind(id).run()
    return NextResponse.json({ success: true, permanent: true })
  } catch (error) {
    console.error(JSON.stringify({ message: 'media delete failed', error: error instanceof Error ? error.message : String(error) }))
    return NextResponse.json({ error: '删除失败' }, { status: 500 })
  }
}
