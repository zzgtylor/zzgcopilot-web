import { NextRequest, NextResponse } from 'next/server'
import { hashPassword } from '@/auth'

export async function POST(request: NextRequest) {
    try {
          const { name, email, password } = await request.json()

      if (!name || !email || !password) {
              return NextResponse.json({ error: '请填写所有必填项' }, { status: 400 })
      }
          if (password.length < 8) {
                  return NextResponse.json({ error: '密码至少需要8位字符' }, { status: 400 })
          }

      const db: D1Database = (globalThis as any).__env__?.DB
          if (!db) {
                  return NextResponse.json({ error: '服务暂时不可用' }, { status: 503 })
          }

      const existing = await db
            .prepare('SELECT id FROM users WHERE email = ?')
            .bind(email.toLowerCase().trim())
            .first<any>()

      if (existing) {
              return NextResponse.json({ error: '该邮箱已被注册' }, { status: 409 })
      }

      const passwordHash = await hashPassword(password)

      await db
            .prepare(
                      'INSERT INTO users (name, email, password_hash, role) VALUES (?, ?, ?, ?)'
                    )
            .bind(name.trim(), email.toLowerCase().trim(), passwordHash, 'user')
            .run()

      return NextResponse.json({ success: true }, { status: 201 })
    } catch (e) {
          console.error('Register error:', e)
          return NextResponse.json({ error: '注册失败，请稍后重试' }, { status: 500 })
    }
}
