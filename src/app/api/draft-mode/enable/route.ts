import { createClient } from '@sanity/client'
import { validatePreviewUrl } from '@sanity/preview-url-secret'
import { perspectiveCookieName } from '@sanity/preview-url-secret/constants'
import { withoutSecretSearchParams } from '@sanity/preview-url-secret/without-secret-search-params'
import { getSanityConfig } from '@/lib/sanity-content'

export const dynamic = 'force-dynamic'

export async function GET(request: Request) {
  const config = getSanityConfig()
  if (!config?.token) return new Response('Draft preview is not configured', { status: 503 })

  const client = createClient({
    projectId: config.projectId,
    dataset: config.dataset,
    apiVersion: config.apiVersion,
    useCdn: false,
    token: config.token,
  })
  const { isValid, redirectTo, studioPreviewPerspective } = await validatePreviewUrl(client, request.url)
  if (!isValid) return new Response('Invalid or expired preview secret', { status: 401 })

  const target = redirectTo ? withoutSecretSearchParams(new URL(redirectTo, request.url)) : new URL('/', request.url)
  const location = `${target.pathname}${target.search}${target.hash}`
  const perspective = studioPreviewPerspective || 'drafts'
  const attributes = [
    `${perspectiveCookieName}=${encodeURIComponent(perspective)}`,
    'Path=/',
    'HttpOnly',
    'Secure',
    'SameSite=None',
    'Max-Age=3600',
  ]
  if (request.headers.get('sec-fetch-dest') === 'iframe' && request.headers.get('sec-fetch-site') === 'cross-site') {
    attributes.push('Partitioned')
  }

  return new Response(null, {
    status: 307,
    headers: { location, 'set-cookie': attributes.join('; ') },
  })
}
