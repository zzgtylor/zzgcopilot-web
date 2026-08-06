import { NextRequest } from 'next/server'
import { getR2 } from '@/lib/cloudflare-r2'

const SAFE_TYPES = new Set(['image/jpeg', 'image/png', 'image/webp', 'image/gif'])

export async function GET(_request: NextRequest, { params }: { params: Promise<{ key: string[] }> }) {
  const { key } = await params
  const objectKey = key.map((part) => decodeURIComponent(part)).join('/')
  if (!objectKey.startsWith('media/') || objectKey.split('/').includes('..')) return new Response('Not found', { status: 404 })
  const r2 = await getR2()
  if (!r2) return new Response('Storage unavailable', { status: 503 })
  const object = await r2.get(objectKey)
  if (!object) return new Response('Not found', { status: 404 })
  const contentType = object.httpMetadata?.contentType || 'application/octet-stream'
  if (!SAFE_TYPES.has(contentType)) return new Response('Unsupported media type', { status: 415 })
  return new Response(object.body, {
    headers: {
      'Content-Type': contentType,
      'Cache-Control': object.httpMetadata?.cacheControl || 'public, max-age=31536000, immutable',
      'X-Content-Type-Options': 'nosniff',
    },
  })
}

