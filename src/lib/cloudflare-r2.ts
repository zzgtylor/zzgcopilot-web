import { getCloudflareContext } from '@opennextjs/cloudflare'

export async function getR2(): Promise<R2Bucket | undefined> {
  const legacyR2 = (globalThis as any).__env__?.R2 as R2Bucket | undefined
  if (legacyR2) return legacyR2

  try {
    const context = await getCloudflareContext({ async: true })
    return (context.env as any).R2 as R2Bucket | undefined
  } catch {
    try {
      return (getCloudflareContext().env as any).R2 as R2Bucket | undefined
    } catch {
      return undefined
    }
  }
}

export async function getR2PublicUrl(): Promise<string> {
  const legacyUrl = (globalThis as any).__env__?.R2_PUBLIC_URL as string | undefined
  if (legacyUrl) return legacyUrl.replace(/\/$/, '')

  try {
    const context = await getCloudflareContext({ async: true })
    const url = (context.env as any).R2_PUBLIC_URL as string | undefined
    if (url) return url.replace(/\/$/, '')
  } catch {}

  return (process.env.R2_PUBLIC_URL || '').replace(/\/$/, '')
}
