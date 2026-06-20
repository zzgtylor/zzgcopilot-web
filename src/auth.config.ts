import type { NextAuthConfig } from 'next-auth'

/**
   * Edge-compatible auth configuration.
   *
   * This config contains NO providers that depend on Node.js APIs
   * (no Credentials provider, no crypto, no jose). It is safe to import
   * from the Edge Runtime middleware. The full config (with the Credentials
   * provider and password verification) lives in `auth.ts` and is only used
   * by the Node.js API route.
   */
export const authConfig = {
    pages: {
          signIn: '/login',
          error: '/login',
    },
    session: {
          strategy: 'jwt',
          maxAge: 30 * 24 * 60 * 60,
    },
    providers: [],
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
                            ;(session.user as any).role = token.role
                            ;(session.user as any).id = token.id
                  }
                  return session
          },
          authorized({ auth, request: { nextUrl } }) {
                  const isLoggedIn = !!auth?.user
                  const path = nextUrl.pathname
                  if (path.startsWith('/admin')) {
                            if (!isLoggedIn) return false
                            const role = (auth?.user as any)?.role
                            return role === 'admin' || role === 'editor'
                  }
                  return true
          },
    },
} satisfies NextAuthConfig
