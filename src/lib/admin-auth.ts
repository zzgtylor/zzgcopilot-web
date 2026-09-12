import { platformValue } from './platform'

export const ADMIN_SESSION_COOKIE = 'zzg_admin'

function cookieValue(requestHeaders: Headers, name: string): string {
  return requestHeaders.get('cookie')?.split(';').map(value => value.trim()).find(value => value.startsWith(`${name}=`))?.slice(name.length + 1) || ''
}

function allowedEmails() {
  return platformValue('ADMIN_ALLOWED_EMAILS').split(',').map(value => value.trim().toLowerCase()).filter(Boolean)
}

function encode(value: string) { return new TextEncoder().encode(value) }
function base64url(value: Uint8Array) { return Buffer.from(value).toString('base64url') }
function decode(value: string) { return new Uint8Array(Buffer.from(value, 'base64url')) }

async function signingKey() {
  const configuredToken = platformValue('ADMIN_ACCESS_TOKEN')
  return configuredToken ? crypto.subtle.importKey('raw', encode(configuredToken), { name: 'HMAC', hash: 'SHA-256' }, false, ['sign', 'verify']) : null
}

export async function createAdminSession(email: string) {
  const key = await signingKey()
  if (!key) return null
  const payload = base64url(encode(JSON.stringify({ email, exp: Date.now() + 8 * 60 * 60 * 1000, nonce: crypto.randomUUID() })))
  const signature = base64url(new Uint8Array(await crypto.subtle.sign('HMAC', key, encode(payload))))
  return `${payload}.${signature}`
}

async function sessionEmail(value: string) {
  const [payload, signature] = value.split('.')
  const key = await signingKey()
  if (!payload || !signature || !key || !await crypto.subtle.verify('HMAC', key, decode(signature), encode(payload))) return null
  try {
    const parsed = JSON.parse(new TextDecoder().decode(decode(payload))) as { email?: string; exp?: number }
    const email = parsed.email?.toLowerCase()
    return email && typeof parsed.exp === 'number' && parsed.exp > Date.now() && allowedEmails().includes(email) ? email : null
  } catch { return null }
}

export async function adminEmail(requestHeaders: Headers): Promise<string | null> {
  const token = requestHeaders.get('authorization')?.replace(/^Bearer\s+/i, '').trim() || ''
  const configuredToken = platformValue('ADMIN_ACCESS_TOKEN')
  if (!configuredToken || !allowedEmails().length) return null
  if (token === configuredToken) return allowedEmails()[0]
  return sessionEmail(cookieValue(requestHeaders, ADMIN_SESSION_COOKIE))
}

export function isAllowedAdminEmail(email: string) { return allowedEmails().includes(email.trim().toLowerCase()) }
