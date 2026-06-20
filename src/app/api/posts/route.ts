import { NextRequest, NextResponse } from 'next/server'



export async function GET(request: NextRequest) {
  try {
      const db: D1Database = (globalThis as any).__env__?.DB
          if (!db) return NextResponse.json({ posts: [], categories: [] })

              const { searchParams } = new URL(request.url)
                  const limit = parseInt(searchParams.get('limit') || '20')
                      const offset = parseInt(searchParams.get('offset') || '0')
                          const category = searchParams.get('category')

                              let query = `SELECT p.*, u.name as author_name, c.name as category_name
                                    FROM posts p
                                          LEFT JOIN users u ON p.author_id = u.id
                                                LEFT JOIN categories c ON p.category_id = c.id
                                                      WHERE p.status = 'published'`

                                                          const params: any[] = []
                                                              if (category) {
                                                                    query += ' AND c.slug = ?'
                                                                          params.push(category)
                                                                              }
                                                                                  query += ' ORDER BY p.created_at DESC LIMIT ? OFFSET ?'
                                                                                      params.push(limit, offset)

                                                                                          const result = await db.prepare(query).bind(...params).all()
                                                                                              const categories = await db.prepare('SELECT * FROM categories ORDER BY name').all()

                                                                                                  return NextResponse.json({
                                                                                                        posts: result.results || [],
                                                                                                              categories: categories.results || [],
                                                                                                                  })
                                                                                                                    } catch (e) {
                                                                                                                        console.error(e)
                                                                                                                            return NextResponse.json({ posts: [], categories: [] })
                                                                                                                              }
                                                                                                                              }