import { NextResponse } from 'next/server'

export async function GET() {
    try {
          const db: D1Database = (globalThis as any).__env__?.DB
          if (!db) return NextResponse.json({ categories: [] })
          const result = await db
            .prepare('SELECT id, name, slug, description FROM categories ORDER BY sort_order ASC')
            .all()
          return NextResponse.json({ categories: result.results || [] })
    } catch {
          return NextResponse.json({ categories: [] })
    }
}
