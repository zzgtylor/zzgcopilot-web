import { perspectiveCookieName } from '@sanity/preview-url-secret/constants'

export const dynamic = 'force-dynamic'

export async function GET() {
  const expired = [
    `${perspectiveCookieName}=`,
    'Path=/',
    'HttpOnly',
    'Secure',
    'SameSite=None',
    'Max-Age=0',
  ]
  const headers = new Headers({ location: '/' })
  headers.append('set-cookie', expired.join('; '))
  headers.append('set-cookie', [...expired, 'Partitioned'].join('; '))
  return new Response(null, { status: 307, headers })
}
