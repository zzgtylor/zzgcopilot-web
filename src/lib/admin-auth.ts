import { platformValue } from './platform'

export function adminEmail(requestHeaders: Headers): string | null {
  const email = requestHeaders.get('cf-access-authenticated-user-email')?.trim().toLowerCase() || ''
  const allowed = platformValue('ADMIN_ALLOWED_EMAILS').split(',').map(value => value.trim().toLowerCase()).filter(Boolean)
  return email && allowed.includes(email) ? email : null
}
