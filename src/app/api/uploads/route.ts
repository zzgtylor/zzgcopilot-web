import { put } from '@vercel/blob'
import { headers } from 'next/headers'
import { NextRequest, NextResponse } from 'next/server'
import { adminEmail } from '@/lib/admin-auth'
import { auditEvent } from '@/lib/operational'

const allowedTypes = new Set(['image/jpeg', 'image/png', 'image/webp', 'image/gif', 'application/pdf'])
const maxBytes = 10 * 1024 * 1024

export async function POST(request: NextRequest) {
  const email = await adminEmail(await headers())
  if (!email) return NextResponse.json({ error: '访问未授权' }, { status: 403 })
  if (!process.env.BLOB_READ_WRITE_TOKEN) return NextResponse.json({ error: '上传存储尚未配置' }, { status: 503 })
  const form = await request.formData().catch(() => null)
  const file = form?.get('file')
  if (!(file instanceof File) || file.size === 0) return NextResponse.json({ error: '请选择文件' }, { status: 400 })
  if (file.size > maxBytes || !allowedTypes.has(file.type)) return NextResponse.json({ error: '文件类型或大小不符合限制' }, { status: 400 })
  const safeName = file.name.replace(/[^a-zA-Z0-9._-]/g, '-').slice(-120)
  const blob = await put(`uploads/${Date.now()}-${safeName}`, file, { access: 'public', addRandomSuffix: true })
  await auditEvent({ actorEmail: email, action: 'file_uploaded', targetType: 'blob', targetId: blob.pathname, metadata: { type: file.type, bytes: file.size } })
  return NextResponse.json({ ok: true, url: blob.url, pathname: blob.pathname }, { status: 201 })
}
