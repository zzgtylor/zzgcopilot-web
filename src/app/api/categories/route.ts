import { NextResponse } from 'next/server'
import { getSanityCategories } from '@/lib/sanity-content'

export async function GET() {
  return NextResponse.json({ categories: await getSanityCategories() })
}
