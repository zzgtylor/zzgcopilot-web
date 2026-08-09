import { getCloudflareContext } from '@opennextjs/cloudflare'

export function platformEnv(): Record<string, unknown> {
  try { return getCloudflareContext().env as Record<string, unknown> } catch { return process.env }
}

export function platformValue(key: string): string {
  const value = process.env[key] || platformEnv()[key]
  return typeof value === 'string' ? value : ''
}

export function platformDb(): D1Database | null {
  const value = platformEnv().DB
  return value && typeof value === 'object' ? value as D1Database : null
}

export async function sha256(value: string): Promise<string> {
  const bytes = new TextEncoder().encode(value)
  const hash = await crypto.subtle.digest('SHA-256', bytes)
  return Array.from(new Uint8Array(hash)).map(byte => byte.toString(16).padStart(2, '0')).join('')
}

export async function validateTurnstile(token: string, remoteIp?: string): Promise<boolean> {
  const secret = platformValue('TURNSTILE_SECRET_KEY')
  if (!secret) return false
  const form = new FormData()
  form.set('secret', secret)
  form.set('response', token)
  if (remoteIp) form.set('remoteip', remoteIp)
  const response = await fetch('https://challenges.cloudflare.com/turnstile/v0/siteverify', { method: 'POST', body: form })
  if (!response.ok) return false
  return Boolean((await response.json() as { success?: boolean }).success)
}

export function requestIp(request: Request): string {
  return request.headers.get('cf-connecting-ip') || request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() || ''
}
