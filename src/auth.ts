import NextAuth from 'next-auth'
import Credentials from 'next-auth/providers/credentials'
import { authConfig } from './auth.config'
import { getDb } from '@/lib/cloudflare-db'

const PBKDF2_ITERATIONS = 310000

/**
   * Hash a plain-text password using PBKDF2 (Web Crypto, Edge-compatible).
   * Returns a string in the format: "pbkdf2:<iterations>:<hex-salt>:<hex-hash>"
   */
export async function hashPassword(password: string): Promise<string> {
    const salt = crypto.getRandomValues(new Uint8Array(16))
    const keyMaterial = await crypto.subtle.importKey(
          'raw',
          new TextEncoder().encode(password),
          'PBKDF2',
          false,
          ['deriveBits']
        )
    const derivedBits = await crypto.subtle.deriveBits(
      { name: 'PBKDF2', hash: 'SHA-256', salt, iterations: PBKDF2_ITERATIONS },
          keyMaterial,
          256
        )
    return `pbkdf2:${PBKDF2_ITERATIONS}:${bufferToHex(salt.buffer)}:${bufferToHex(derivedBits)}`
}

/**
 * Verify a plain-text password against a stored hash.
 * Supports PBKDF2 format. Legacy bcrypt hashes ("$2...") are rejected so
 * that affected users are forced to reset their password.
 */
export async function verifyPassword(password: string, storedHash: string): Promise<boolean> {
    if (!storedHash) return false
    if (storedHash.startsWith('$2')) {
          console.warn('Legacy bcrypt hash detected. Please re-hash this password with PBKDF2.')
          return false
    }

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
          return bufferToHex(derivedBits) === expectedHash
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

                    try {
                                const db = await getDb()
                                if (!db) {
                                              console.error('D1 binding not available')
                                              return null
                                }

                              const user = await db
                                  .prepare('SELECT * FROM users WHERE email = ?')
                                  .bind(credentials.email)
                                  .first<any>()

                              if (!user) return null
                              if (user.is_active === 0) return null

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
})
