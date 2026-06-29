import { getCloudflareContext } from '@opennextjs/cloudflare'

export async function getDb(): Promise<D1Database | undefined> {
  const legacyDb = (globalThis as any).__env__?.DB as D1Database | undefined
  if (legacyDb) return legacyDb

  try {
    const context = await getCloudflareContext({ async: true })
    return (context.env as any).DB as D1Database | undefined
  } catch {
    try {
      return (getCloudflareContext().env as any).DB as D1Database | undefined
    } catch {
      return undefined
    }
  }
}
