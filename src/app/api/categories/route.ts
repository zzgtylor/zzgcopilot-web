import { NextResponse } from 'next/server'
import { getDb } from '@/lib/cloudflare-db'

export async function GET() {
    try {
          const db = await getDb()
          if (!db) return NextResponse.json({ categories: [] })
          const result = await db
            .prepare('SELECT id, name, slug, description FROM categories ORDER BY sort_order ASC')
            .all()
          return NextResponse.json({ categories: result.results || [] })
    } catch {
          return NextResponse.json({ categories: [] })
    }
}
