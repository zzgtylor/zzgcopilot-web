import { platformValue, sha256 } from './platform'

export const ADMIN_SESSION_COOKIE = 'zzg_admin'

function cookieValue(requestHeaders: Headers, name: string): string {
  return requestHeaders.get('cookie')?.split(';').map(value => value.trim()).find(value => value.startsWith(`${name}=`))?.slice(name.length + 1) || ''
}

export async function adminEmail(requestHeaders: Headers): Promise<string | null> {
  const token = requestHeaders.get('authorization')?.replace(/^Bearer\s+/i, '').trim() || ''
  const configuredToken = platformValue('ADMIN_ACCESS_TOKEN')
  const allowed = platformValue('ADMIN_ALLOWED_EMAILS').split(',').map(value => value.trim().toLowerCase()).filter(Boolean)
  if (!configuredToken || !allowed.length) return null
  const expectedSession = await sha256(configuredToken)
  if (token !== configuredToken && cookieValue(requestHeaders, ADMIN_SESSION_COOKIE) !== expectedSession) return null
  return allowed[0]
}
