export function platformValue(key: string): string {
  return process.env[key] || ''
}

/** @deprecated Use src/lib/postgres.ts for new code. */
export function platformDb(): AppDatabase | null {
  const connectionString = platformValue('DATABASE_URL') || platformValue('POSTGRES_URL') || platformValue('DATABASE_URL_UNPOOLED')
  if (!connectionString) return null
  legacyPool ??= new Pool({ connectionString, max: 5, idleTimeoutMillis: 10_000, ssl: { rejectUnauthorized: false } })
  return new PostgresDatabase(legacyPool)
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
  return request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() || request.headers.get('x-real-ip') || ''
}
import { Pool, PoolClient } from 'pg'

type PgRow = Record<string, unknown>
export type DbResult<T> = { results: T[]; success: boolean; meta: Record<string, unknown> }
export type DbPrepared = { bind(...values: unknown[]): DbPrepared; first<T = unknown>(column?: string): Promise<T | null>; all<T = unknown>(): Promise<DbResult<T>>; run(): Promise<DbResult<unknown>>; raw<T = unknown[]>(): Promise<T> }
export type AppDatabase = { prepare(sql: string): DbPrepared; batch<T = unknown>(statements: DbPrepared[]): Promise<DbResult<T>[]> }

function postgresSql(sql: string) {
  let position = 0
  return sql.replace(/\?/g, () => `$${++position}`)
    .replace(/datetime\(['"]now['"]\)/gi, 'NOW()')
    .replace(/datetime\(['"]now['"]\s*,\s*['"]([+-]\d+)\s+(minutes?|hours?|days?)['"]\)/gi, (_, value, unit) => `NOW() ${Number(value) >= 0 ? '+' : '-'} INTERVAL '${Math.abs(Number(value))} ${unit}'`)
    .replace(/date\(['"]now['"]\)/gi, 'CURRENT_DATE')
    .replace(/date\(['"]now['"]\s*,\s*['"]([+-]\d+)\s+days['"]\)/gi, (_, value) => `CURRENT_DATE ${Number(value) >= 0 ? '+' : '-'} INTERVAL '${Math.abs(Number(value))} days'`)
    .replace(/INSERT\s+OR\s+IGNORE\s+INTO/gi, 'INSERT INTO')
}

class PostgresPrepared {
  constructor(private readonly client: Pool | PoolClient, private readonly text: string, private readonly values: unknown[] = []) {}
  bind(...values: unknown[]) { return new PostgresPrepared(this.client, this.text, values) }
  async first<T = unknown>(column?: string): Promise<T | null> { const row = (await this.client.query(postgresSql(this.text), this.values)).rows[0] as PgRow | undefined; return (column ? row?.[column] : row) as T || null }
  async all<T = unknown>(): Promise<DbResult<T>> { const result = await this.client.query(postgresSql(this.text), this.values); return { results: result.rows as T[], success: true, meta: {} } }
  async run(): Promise<DbResult<unknown>> { await this.client.query(postgresSql(this.text), this.values); return { results: [], success: true, meta: {} } }
  async raw<T = unknown[]>(): Promise<T> { return (await this.client.query(postgresSql(this.text), this.values)).rows as T }
}

class PostgresDatabase {
  constructor(private readonly pool: Pool) {}
  prepare(text: string): DbPrepared { return new PostgresPrepared(this.pool, text) }
  async batch<T = unknown>(statements: DbPrepared[]): Promise<DbResult<T>[]> {
    const client = await this.pool.connect()
    try { await client.query('BEGIN'); const results: DbResult<T>[] = []; for (const statement of statements) { const query = statement as PostgresPrepared; const result = await client.query(postgresSql((query as any).text), (query as any).values); results.push({ results: result.rows as T[], success: true, meta: {} }) } await client.query('COMMIT'); return results } catch (error) { await client.query('ROLLBACK'); throw error } finally { client.release() }
  }
}

let legacyPool: Pool | undefined
