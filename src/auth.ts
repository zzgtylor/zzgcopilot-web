import NextAuth from 'next-auth'
import Credentials from 'next-auth/providers/credentials'
import { authConfig } from './auth.config'
import { getDb } from '@/lib/cloudflare-db'
import { verifyPassword } from '@/lib/passwords'

export const { handlers, auth, signIn, signOut } = NextAuth({
    ...authConfig,
    providers: [
          Credentials({
                  name: 'credentials',
                  credentials: {
                            email: { label: 'Email', type: 'email' },
                            password: { label: 'Password', type: 'password' },
                  },
                  async authorize(credentials) {
                            if (!credentials?.email || !credentials?.password) return null
                            const email = String(credentials.email).toLowerCase().trim()
                            const password = String(credentials.password)

                    try {
                                const db = await getDb()
                                if (!db) {
                                              console.error('D1 binding not available')
                                              return null
                                }

                              const user = await db
                                  .prepare('SELECT * FROM users WHERE email = ?')
                                  .bind(email)
                                  .first<any>()

                              if (!user) return null
                              if (user.is_active === 0 || user.is_active === '0') return null

                              const isValid = await verifyPassword(
                                            password,
                                            String(user.password_hash || '')
                                          )
                                if (!isValid) return null

                              return {
                                            id: String(user.id),
                                            email: user.email,
                                            name: user.name,
                                            role: user.role,
                              }
                    } catch (e) {
                                console.error('Auth error:', e)
                                return null
                    }
                  },
          }),
        ],
})
