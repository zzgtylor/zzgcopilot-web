#!/usr/bin/env node
/**
   * Password migration script: bcrypt  ->  PBKDF2 (Web Crypto compatible)
   * ---------------------------------------------------------------------
   * Why this exists:
   *   The app moved from `bcryptjs` to PBKDF2 (Web Crypto) so that password
   *   verification works in the Cloudflare Edge Runtime. bcrypt hashes are
   *   one-way, so we CANNOT convert an existing bcrypt hash into a PBKDF2
   *   hash. Instead, this script resets every legacy-hashed user to a fresh,
   *   random temporary password stored in the new PBKDF2 format, and prints a
   *   list of (email, tempPassword) pairs so you can notify those users.
   *
   * What it does:
   *   1. Finds all users whose password_hash starts with "$2" (bcrypt).
   *   2. Generates a random temp password for each.
   *   3. Hashes it with PBKDF2 (same format as src/auth.ts: pbkdf2:iter:salt:hash).
   *   4. Generates a single SQL file you run against D1 with wrangler.
   *   5. Prints the temp passwords so you can email them to users.
   *
   * Usage:
   *   # 1) Export current users from D1 to a JSON file:
   *   npx wrangler d1 execute zzgcopilot-db --remote \
   *     --command "SELECT id, email, password_hash FROM users" --json > users.json
   *
   *   # 2) Run this script to produce migrate.sql and a credentials list:
   *   node scripts/migrate-passwords.mjs users.json
   *
   *   # 3) Apply the generated SQL to D1:
   *   npx wrangler d1 execute zzgcopilot-db --remote --file ./migrate.sql
   *
   * NOTE: requires Node 18+ (uses the global Web Crypto `crypto.subtle`).
   */

import { webcrypto as crypto } from 'node:crypto'
import { readFileSync, writeFileSync } from 'node:fs'

const PBKDF2_ITERATIONS = 310000

function bufferToHex(buffer) {
    return Array.from(new Uint8Array(buffer))
      .map((b) => b.toString(16).padStart(2, '0'))
      .join('')
}

async function hashPassword(password) {
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

function randomPassword(length = 16) {
    const alphabet =
          'ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz23456789'
    const bytes = crypto.getRandomValues(new Uint8Array(length))
    let out = ''
    for (let i = 0; i < length; i++) out += alphabet[bytes[i] % alphabet.length]
    return out
}

function sqlEscape(value) {
    return String(value).replace(/'/g, "''")
}

async function main() {
    const inputPath = process.argv[2]
    if (!inputPath) {
          console.error('Usage: node scripts/migrate-passwords.mjs <users.json>')
          process.exit(1)
    }

  // wrangler --json output is an array of result-sets; normalize it.
  const raw = JSON.parse(readFileSync(inputPath, 'utf8'))
    const rows = Array.isArray(raw)
      ? (raw[0]?.results ?? raw)
          : (raw.results ?? [])

  const legacyUsers = rows.filter(
        (u) => typeof u.password_hash === 'string' && u.password_hash.startsWith('$2')
      )

  if (legacyUsers.length === 0) {
        console.log('No legacy bcrypt users found. Nothing to migrate.')
        return
  }

  const sqlLines = []
      const credentials = []

          for (const user of legacyUsers) {
                const tempPassword = randomPassword()
                const newHash = await hashPassword(tempPassword)
                sqlLines.push(
                        `UPDATE users SET password_hash = '${sqlEscape(newHash)}', ` +
                          `updated_at = datetime('now') WHERE id = '${sqlEscape(user.id)}';`
                      )
                credentials.push({ email: user.email, tempPassword })
          }

  writeFileSync('migrate.sql', sqlLines.join('\n') + '\n', 'utf8')
    writeFileSync('temp-credentials.json', JSON.stringify(credentials, null, 2), 'utf8')

  console.log(`Migrated ${legacyUsers.length} user(s).`)
    console.log('Wrote: migrate.sql  (apply with wrangler d1 execute ... --file ./migrate.sql)')
    console.log('Wrote: temp-credentials.json  (email these temp passwords to users)')
    console.log('\n--- Temporary credentials ---')
    for (const c of credentials) console.log(`${c.email}\t${c.tempPassword}`)
    console.log(
          '\nReminder: ask each user to log in with the temp password and change it immediately.'
        )
}

main().catch((err) => {
    console.error(err)
    process.exit(1)
})
