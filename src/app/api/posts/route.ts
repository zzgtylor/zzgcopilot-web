import { NextRequest, NextResponse } from 'next/server'
import { getSanityCategories, getSanityPublishedPostCount, getSanityPublishedPosts } from '@/lib/sanity-content'

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const limit = Number.parseInt(searchParams.get('limit') || '20', 10)
  const offset = Number.parseInt(searchParams.get('offset') || '0', 10)
  const category = searchParams.get('category') || undefined
  const search = searchParams.get('q') || undefined
  const [posts, categories, total] = await Promise.all([
    getSanityPublishedPosts({ limit: Number.isFinite(limit) ? limit : 20, offset: Number.isFinite(offset) ? offset : 0, category, search }),
    getSanityCategories(),
    getSanityPublishedPostCount({ category, search }),
  ])
  return NextResponse.json({ posts, categories, total })
}
