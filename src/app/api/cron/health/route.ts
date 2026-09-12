import { postgresConfigured, sql, sqlOne } from '@/lib/postgres'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

async function checkPostgres() {
  if (!postgresConfigured()) return { ok: false, state: 'not_configured' as const }
  try {
    await sql('SELECT 1 AS ok')
    return { ok: true, state: 'ready' as const }
  } catch {
    return { ok: false, state: 'unavailable' as const }
  }
}

export async function GET(request: Request) {
  const cronSecret = process.env.CRON_SECRET
  if (!cronSecret || request.headers.get('authorization') !== `Bearer ${cronSecret}`) {
    return Response.json({ ok: false }, { status: 401, headers: { 'Cache-Control': 'no-store' } })
  }

  const postgres = await checkPostgres()
  const backup = postgres.ok ? await sqlOne<{ status: string; created_at: string }>("SELECT status, created_at FROM backup_runs WHERE kind='neon' ORDER BY created_at DESC LIMIT 1").catch(() => null) : null
  const backupFresh = Boolean(backup && backup.status === 'success' && Date.now() - new Date(backup.created_at).getTime() < 8 * 24 * 60 * 60 * 1000)
  const dependencies = {
    postgres,
    backup: { ok: backupFresh, state: backup ? `${backup.status}:${backup.created_at}` : 'not_recorded' },
    sanity: { ok: Boolean(process.env.NEXT_PUBLIC_SANITY_PROJECT_ID || process.env.SANITY_PROJECT_ID), state: (process.env.NEXT_PUBLIC_SANITY_PROJECT_ID || process.env.SANITY_PROJECT_ID) ? 'configured' : 'not_configured' },
    blob: { ok: Boolean(process.env.BLOB_READ_WRITE_TOKEN), state: process.env.BLOB_READ_WRITE_TOKEN ? 'configured' : 'not_configured' },
  }
  const ok = Object.values(dependencies).every(dependency => dependency.ok)
  return Response.json({
    ok,
    service: 'zzgcopilot',
    timestamp: new Date().toISOString(),
    dependencies,
  }, { status: ok ? 200 : 503, headers: { 'Cache-Control': 'no-store' } })
}
