import { NextResponse } from 'next/server'
import { auth } from '@/auth'
import { getDb } from '@/lib/cloudflare-db'



export async function GET() {
  try {
      const session = await auth()
          if (!session?.user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
              const db = await getDb()
                  if (!db) return NextResponse.json({ users: [] })
                      const result = await db.prepare('SELECT id, name, email, role, created_at FROM users ORDER BY created_at DESC').all()
                          return NextResponse.json({ users: result.results || [] })
                            } catch (e) {
                                return NextResponse.json({ users: [] })
                                  }
                                  }
