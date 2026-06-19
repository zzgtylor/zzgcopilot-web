import NextAuth from 'next-auth'
import CredentialsProvider from 'next-auth/providers/credentials'
import { getRequestContext } from '@cloudflare/next-on-pages'
import bcrypt from 'bcryptjs'

export const runtime = 'edge'

const handler = NextAuth({
  providers: [
    CredentialsProvider({
      name: 'credentials',
      credentials: {
        email: { label: 'Email', type: 'email' },
        password: { label: 'Password', type: 'password' },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) return null

        try {
          const ctx = getRequestContext()
          const db: D1Database = ctx.env.DB

          const user = await db
            .prepare('SELECT * FROM users WHERE email = ? AND is_active = 1')
            .bind(credentials.email)
            .first<any>()

          if (!user) return null

          const isValid = await bcrypt.compare(credentials.password, user.password_hash)
          if (!isValid) return null

          return {
            id: user.id,
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
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.role = (user as any).role
        token.id = user.id
      }
      return token
    },
    async session({ session, token }) {
      if (session.user) {
        (session.user as any).role = token.role
        ;(session.user as any).id = token.id
      }
      return session
    },
  },
  pages: {
    signIn: '/login',
    error: '/login',
  },
  session: {
    strategy: 'jwt',
    maxAge: 30 * 24 * 60 * 60, // 30 days
  },
})

export { handler as GET, handler as POST }
