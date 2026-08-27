import { getCloudflareContext } from '@opennextjs/cloudflare'
import { Pool, PoolClient } from 'pg'

type PgRow = Record<string, unknown>

function postgresSql(sql: string): string {
  let i = 0
  return sql.replace(/\?/g, () => `$${++i}`)
    .replace(/datetime\(['"]now['"]\)/gi, 'NOW()')
    .replace(/datetime\(['"]now['"]\s*,\s*['"]([+-]\d+)\s+(minutes?|hours?|days?)['"]\)/gi, (_, n, unit) => `NOW() ${Number(n) >= 0 ? '+' : '-'} INTERVAL '${Math.abs(Number(n))} ${unit}'`)
    .replace(/date\(['"]now['"]\)/gi, 'CURRENT_DATE')
    .replace(/date\(['"]now['"]\s*,\s*['"]([+-]\d+)\s+days['"]\)/gi, (_, n) => `CURRENT_DATE ${Number(n) >= 0 ? '+' : '-'} INTERVAL '${Math.abs(Number(n))} days'`)
    .replace(/INSERT\s+OR\s+IGNORE\s+INTO/gi, 'INSERT INTO')
    .replace(/excluded\./gi, 'EXCLUDED.')
}

class PgPrepared {
  constructor(private readonly client: Pool | PoolClient, private readonly sql: string, private readonly values: unknown[] = []) {}
  bind(...values: unknown[]): any { return new PgPrepared(this.client, this.sql, values) }
  async first<T = unknown>(column?: string): Promise<T | null> {
    const row = (await this.client.query(postgresSql(this.sql), this.values)).rows[0] as PgRow | undefined
    return (column ? row?.[column] : row) as T || null
  }
  async all<T = unknown>(): Promise<D1Result<T>> {
    const result = await this.client.query(postgresSql(this.sql), this.values)
    return { results: result.rows as T[], success: true, meta: { changes: result.rowCount || 0, duration: 0, last_row_id: 0, rows_read: result.rowCount || 0, rows_written: 0 } as any }
  }
  async run(): Promise<D1Result<unknown>> {
    const result = await this.client.query(postgresSql(this.sql), this.values)
    return { results: [], success: true, meta: { changes: result.rowCount || 0, duration: 0, last_row_id: 0, rows_read: 0, rows_written: result.rowCount || 0 } as any }
  }
  async raw<T = unknown[]>(): Promise<T> { const result = await this.client.query(postgresSql(this.sql), this.values); return result.rows as T }
}

class PgCompat {
  constructor(private readonly pool: Pool) {}
  prepare(sql: string): any { return new PgPrepared(this.pool, sql) }
  async batch<T = unknown>(statements: any[]): Promise<D1Result<T>[]> {
    const client = await this.pool.connect()
    try { await client.query('BEGIN'); const results: D1Result<T>[] = []; for (const statement of statements) { const s = statement as PgPrepared; const result = await client.query(postgresSql((s as any).sql), (s as any).values); results.push({ results: result.rows as T[], success: true, meta: { changes: result.rowCount || 0, duration: 0, last_row_id: 0, rows_read: result.rowCount || 0, rows_written: result.rowCount || 0 } as any }) } await client.query('COMMIT'); return results } catch (error) { await client.query('ROLLBACK'); throw error } finally { client.release() }
  }
}

let postgresPool: Pool | null = null

export function platformEnv(): Record<string, unknown> {
  try { return getCloudflareContext().env as Record<string, unknown> } catch { return process.env }
}

export function platformValue(key: string): string {
  const value = process.env[key] || platformEnv()[key]
  return typeof value === 'string' ? value : ''
}

export function platformDb(): D1Database | null {
  const value = platformEnv().DB
  if (value && typeof value === 'object') return value as D1Database
  const url = platformValue('DATABASE_URL') || platformValue('POSTGRES_URL') || platformValue('DATABASE_URL_UNPOOLED')
  if (!url) return null
  postgresPool ||= new Pool({ connectionString: url, max: 5, idleTimeoutMillis: 10_000, ssl: { rejectUnauthorized: false } })
  return new PgCompat(postgresPool) as unknown as D1Database
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
