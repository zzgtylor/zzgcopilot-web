import { NextResponse } from 'next/server'
import { auth } from '@/auth'



export async function GET() {
  try {
      const session = await auth()
          if (!session?.user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
              const db: D1Database = (globalThis as any).__env__?.DB
                  if (!db) return NextResponse.json({ posts: 0, users: 0, comments: 0 })
                      const [posts, users, comments] = await Promise.all([
                            db.prepare("SELECT COUNT(*) as count FROM posts").first<any>(),
                                  db.prepare("SELECT COUNT(*) as count FROM users").first<any>(),
                                        db.prepare("SELECT COUNT(*) as count FROM comments").first<any>(),
                                            ])
                                                return NextResponse.json({
                                                      posts: posts?.count || 0,
                                                            users: users?.count || 0,
                                                                  comments: comments?.count || 0,
                                                                      })
                                                                        } catch (e) {
                                                                            return NextResponse.json({ posts: 0, users: 0, comments: 0 })
                                                                              }
                                                                              }