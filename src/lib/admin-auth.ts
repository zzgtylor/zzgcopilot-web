import { platformValue } from './platform'

export function adminEmail(requestHeaders: Headers): string | null {
  const email = requestHeaders.get('x-admin-email')?.trim().toLowerCase() || ''
  const token = requestHeaders.get('authorization')?.replace(/^Bearer\s+/i, '').trim() || ''
  const configuredToken = platformValue('ADMIN_ACCESS_TOKEN')
  const allowed = platformValue('ADMIN_ALLOWED_EMAILS').split(',').map(value => value.trim().toLowerCase()).filter(Boolean)
  if (!configuredToken || token !== configuredToken) return null
  return email && allowed.includes(email) ? email : (allowed[0] || null)
}
