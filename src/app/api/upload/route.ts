import { NextRequest, NextResponse } from 'next/server'
import { getDb } from '@/lib/cloudflare-db'
import { getR2, getR2PublicUrl } from '@/lib/cloudflare-r2'
import { requireAdminRole } from '@/lib/admin-auth'
import { sha256 } from '@/lib/totp'
import { writeAuditLog } from '@/lib/audit'

const ALLOWED_TYPES: Record<string, string> = { 'image/jpeg': 'jpg', 'image/png': 'png', 'image/webp': 'webp', 'image/gif': 'gif' }
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
  const result = await db.prepare('SELECT COUNT(*) AS count FROM posts WHERE cover_image = ? OR og_image = ? OR content LIKE ?').bind(url, url, `%${url}%`).first<{ count: number }>()
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
    if (!mime || !ALLOWED_TYPES[mime] || mime !== file.type) return NextResponse.json({ error: '文件内容与格式不匹配，仅支持 JPG、PNG、WEBP、GIF' }, { status: 400 })
    const r2 = await getR2()
    const db = access.db || await getDb()
    if (!r2) return NextResponse.json({ error: 'R2 存储未配置' }, { status: 503 })
    if (!db) return NextResponse.json({ error: '数据库暂时不可用' }, { status: 503 })

    const checksum = await sha256(arrayBuffer)
    const duplicate = await db.prepare('SELECT id, original_name, r2_key, source_url FROM media WHERE checksum = ? AND deleted_at IS NULL LIMIT 1').bind(checksum).first<{ id: string; original_name: string; r2_key: string; source_url?: string | null }>()
    if (duplicate) return NextResponse.json({ error: `该图片已经存在：${duplicate.original_name}`, duplicate: { ...duplicate, url: await mediaUrl(duplicate) } }, { status: 409 })

    const now = new Date(); const uniqueId = crypto.randomUUID()
    const datePrefix = `${now.getUTCFullYear()}/${String(now.getUTCMonth() + 1).padStart(2, '0')}`
    const filename = `${safeBaseName(file.name || 'image')}-${uniqueId.slice(0, 8)}.${ALLOWED_TYPES[mime]}`
    const r2Key = `media/${datePrefix}/${filename}`
    await r2.put(r2Key, arrayBuffer, { httpMetadata: { contentType: mime, cacheControl: 'public, max-age=31536000, immutable' } })
    await db.prepare('INSERT INTO media (id, filename, original_name, r2_key, mime_type, size, alt_text, uploaded_by, checksum) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)').bind(uniqueId, filename, file.name || filename, r2Key, mime, file.size, '', access.userId, checksum).run()
    await writeAuditLog(db, { userId: access.userId, action: 'media.upload', targetType: 'media', targetId: uniqueId, summary: `上传图片：${file.name || filename}`, metadata: { mime, size: file.size }, request })
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
    const db = access.db || await getDb()
    if (!db) return NextResponse.json({ error: '数据库暂时不可用' }, { status: 503 })
    const params = new URL(request.url).searchParams
    const page = Math.max(1, Number(params.get('page')) || 1)
    const pageSize = Math.min(100, Math.max(12, Number(params.get('pageSize') || params.get('limit')) || 30))
    const trash = params.get('trash') === '1'; const query = String(params.get('q') || '').trim().slice(0, 100)
    const type = String(params.get('type') || ''); const month = String(params.get('month') || ''); const duplicates = params.get('duplicates') === '1'
    const conditions = [`deleted_at IS ${trash ? 'NOT NULL' : 'NULL'}`]; const bindings: unknown[] = []
    if (query) { conditions.push('(original_name LIKE ? OR filename LIKE ? OR alt_text LIKE ?)'); const term = `%${query}%`; bindings.push(term, term, term) }
    if (Object.hasOwn(ALLOWED_TYPES, type)) { conditions.push('mime_type = ?'); bindings.push(type) }
    if (/^\d{4}-\d{2}$/.test(month)) { conditions.push("strftime('%Y-%m', created_at) = ?"); bindings.push(month) }
    if (duplicates) conditions.push(`COALESCE(checksum, mime_type || ':' || size || ':' || lower(original_name)) IN (SELECT COALESCE(checksum, mime_type || ':' || size || ':' || lower(original_name)) FROM media WHERE deleted_at IS NULL GROUP BY COALESCE(checksum, mime_type || ':' || size || ':' || lower(original_name)) HAVING COUNT(*) > 1)`)
    const where = `WHERE ${conditions.join(' AND ')}`
    const [count, result, postReferences] = await Promise.all([
      db.prepare(`SELECT COUNT(*) AS total FROM media ${where}`).bind(...bindings).first<{ total: number }>(),
      db.prepare(`SELECT id, filename, original_name, r2_key, mime_type, size, alt_text, source_url, checksum, deleted_at, created_at FROM media ${where} ORDER BY created_at DESC LIMIT ? OFFSET ?`).bind(...bindings, pageSize, (page - 1) * pageSize).all(),
      db.prepare("SELECT cover_image, og_image, content FROM posts WHERE status != 'archived'").all<{ cover_image?: string; og_image?: string; content?: string }>(),
    ])
    const publicBase = await getR2PublicUrl(); const referencedBy = postReferences.results || []
    const media = (result.results || []).map((row) => {
      const item = row as Record<string, unknown> & { r2_key: string; source_url?: string; content?: string }
      const url = item.source_url || (publicBase ? `${publicBase}/${item.r2_key}` : `/api/media/${encodeURIComponent(item.r2_key)}`)
      const references = referencedBy.filter(post => post.cover_image === url || post.og_image === url || String(post.content || '').includes(url)).length
      return { ...item, url, references }
    })
    return NextResponse.json({ media, total: Number(count?.total || 0), page, pageSize }, { headers: noStore })
  } catch (error) {
    console.error(JSON.stringify({ message: 'media list failed', error: error instanceof Error ? error.message : String(error) }))
    return NextResponse.json({ error: '媒体加载失败' }, { status: 500 })
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const access = await requireAdminRole(); if (!access.ok) return NextResponse.json({ error: access.error }, { status: access.status })
    const body = await request.json() as { id?: string; alt_text?: string; action?: string }
    if (!body.id) return NextResponse.json({ error: '缺少 id' }, { status: 400 })
    const db = access.db || await getDb(); if (!db) return NextResponse.json({ error: '数据库暂时不可用' }, { status: 503 })
    if (body.action === 'restore') {
      await db.prepare('UPDATE media SET deleted_at = NULL WHERE id = ?').bind(body.id).run()
      await writeAuditLog(db, { userId: access.userId, action: 'media.restore', targetType: 'media', targetId: body.id, summary: '从回收站恢复媒体', request })
      return NextResponse.json({ success: true })
    }
    await db.prepare('UPDATE media SET alt_text = ? WHERE id = ? AND deleted_at IS NULL').bind(String(body.alt_text || '').trim().slice(0, 180), body.id).run()
    await writeAuditLog(db, { userId: access.userId, action: 'media.alt_updated', targetType: 'media', targetId: body.id, summary: '更新图片替代文字', request })
    return NextResponse.json({ success: true })
  } catch (error) { return NextResponse.json({ error: error instanceof Error ? error.message : '保存失败' }, { status: 500 }) }
}

export async function DELETE(request: NextRequest) {
  try {
    const access = await requireAdminRole(); if (!access.ok) return NextResponse.json({ error: access.error }, { status: access.status })
    const params = new URL(request.url).searchParams; const id = params.get('id'); const permanent = params.get('permanent') === '1'
    if (!id) return NextResponse.json({ error: '缺少 id' }, { status: 400 })
    const db = access.db || await getDb(); if (!db) return NextResponse.json({ error: '数据库暂时不可用' }, { status: 503 })
    const row = await db.prepare('SELECT r2_key, source_url FROM media WHERE id = ?').bind(id).first<{ r2_key: string; source_url?: string | null }>()
    if (!row) return NextResponse.json({ error: '未找到该文件' }, { status: 404 })
    const url = await mediaUrl(row); const references = await referenceCount(db, url)
    if (references > 0) return NextResponse.json({ error: `该图片仍被 ${references} 篇文章引用，不能删除` }, { status: 409 })
    if (!permanent) {
      await db.prepare("UPDATE media SET deleted_at = datetime('now') WHERE id = ?").bind(id).run()
      await writeAuditLog(db, { userId: access.userId, action: 'media.trash', targetType: 'media', targetId: id, summary: '将媒体移入回收站', request })
      return NextResponse.json({ success: true, trashed: true })
    }
    if (access.role !== 'admin') return NextResponse.json({ error: '只有管理员可以永久删除' }, { status: 403 })
    if (!row.source_url) { const r2 = await getR2(); if (r2) await r2.delete(row.r2_key) }
    await db.prepare('DELETE FROM media WHERE id = ?').bind(id).run()
    await writeAuditLog(db, { userId: access.userId, action: 'media.delete_permanent', targetType: 'media', targetId: id, summary: '永久删除媒体', request })
    return NextResponse.json({ success: true, permanent: true })
  } catch (error) {
    console.error(JSON.stringify({ message: 'media delete failed', error: error instanceof Error ? error.message : String(error) }))
    return NextResponse.json({ error: '删除失败' }, { status: 500 })
  }
}
