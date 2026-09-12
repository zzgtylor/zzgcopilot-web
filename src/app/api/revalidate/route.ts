import { revalidateTag } from 'next/cache'
import { NextRequest, NextResponse } from 'next/server'
import { platformValue } from '@/lib/platform'

function secretFromEnvironment(): string {
  return platformValue('SANITY_REVALIDATE_SECRET')
}

export async function POST(request: NextRequest) {
  const expected = secretFromEnvironment()
  const supplied = request.headers.get('x-sanity-revalidate-secret') || ''
  if (!expected || supplied !== expected) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const body = await request.json().catch(() => null) as { _type?: string; _id?: string; slug?: { current?: string } | string } | null
  const type = body?._type || ''
  const id = body?._id || ''
  const slug = typeof body?.slug === 'string' ? body.slug : body?.slug?.current || ''
  const tags = new Set(['sanity'])
  if (type === 'post') tags.add('sanity:posts')
  if (type === 'page') tags.add('sanity:pages')
  if (type === 'siteSettings') tags.add('sanity:settings')
  if (type === 'navigationItem') tags.add('sanity:navigation')
  if (type === 'category') tags.add('sanity:categories')
  if (type === 'redirect') tags.add('sanity:redirects')
  if (slug && type === 'post') tags.add(`sanity:post:${slug}`)
  if (slug && type === 'page') tags.add(`sanity:page:${slug}`)
  for (const tag of tags) revalidateTag(tag, 'max')
  return NextResponse.json({ revalidated: true, id: id || null, tags: [...tags] })
}

export async function GET() {
  return NextResponse.json({ error: 'Method Not Allowed' }, { status: 405, headers: { Allow: 'POST' } })
}
