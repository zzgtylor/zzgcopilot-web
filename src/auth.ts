import NextAuth from 'next-auth'
import Credentials from 'next-auth/providers/credentials'

/**
   * Compare a plain-text password against a stored hash.
   * Supports two formats:
   *   1. PBKDF2 format: "pbkdf2:iterations:salt:hash" (Web Crypto, Edge-compatible)
   *   2. Legacy bcrypt hashes starting with "$2" – returns false so you can migrate users.
   */
async function verifyPassword(password: string, storedHash: string): Promise<boolean> {
    // Legacy bcrypt hash – cannot verify in Edge Runtime, deny login
  if (storedHash.startsWith('$2')) {
        console.warn('Legacy bcrypt hash detected. Please re-hash this password with PBKDF2.')
        return false
  }

  // PBKDF2 format: "pbkdf2:<iterations>:<hex-salt>:<hex-hash>"
  const parts = storedHash.split(':')
    if (parts.length === 4 && parts[0] === 'pbkdf2') {
          const iterations = parseInt(parts[1], 10)
          const salt = hexToBuffer(parts[2])
          const expectedHash = parts[3]

      const keyMaterial = await crypto.subtle.importKey(
              'raw',
              new TextEncoder().encode(password),
              'PBKDF2',
              false,
              ['deriveBits']
            )
          const derivedBits = await crypto.subtle.deriveBits(
            { name: 'PBKDF2', hash: 'SHA-256', salt, iterations },
                  keyMaterial,
                  256
                )
          const actualHash = bufferToHex(derivedBits)
          return actualHash === expectedHash
    }

  return false
}

function hexToBuffer(hex: string): Uint8Array {
    const bytes = new Uint8Array(hex.length / 2)
    for (let i = 0; i < hex.length; i += 2) {
          bytes[i / 2] = parseInt(hex.slice(i, i + 2), 16)
    }
    return bytes
}

function bufferToHex(buffer: ArrayBuffer): string {
    return Array.from(new Uint8Array(buffer))
      .map((b) => b.toString(16).padStart(2, '0'))
      .join('')
}

export const { auth, signIn, signOut } = NextAuth({
    providers: [
          Credentials({
                  name: 'credentials',
                  credentials: {
                            email: { label: 'Email', type: 'email' },
                            password: { label: 'Password', type: 'password' },
                  },
                  async authorize(credentials) {
                            if (!credentials?.email || !credentials?.password) return null

                    try {
                                const db: D1Database = (globalThis as any).__env__?.DB
                                if (!db) {
                                              console.error('D1 binding not available')
                                              return null
                                }

                              const user = await db
                                  .prepare('SELECT * FROM users WHERE email = ? AND is_active = 1')
                                  .bind(credentials.email)
                                  .first<any>()

                              if (!user) return null

                              const isValid = await verifyPassword(
                                            credentials.password as string,
                                            user.password_hash
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
    },
    pages: {
          signIn: '/login',
          error: '/login',
    },
    session: {
          strategy: 'jwt',
          maxAge: 30 * 24 * 60 * 60,
    },
})
