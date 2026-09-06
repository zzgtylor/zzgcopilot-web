import { Pool, type PoolClient, type QueryResultRow } from 'pg'

let pool: Pool | undefined

function connectionString() {
  return process.env.DATABASE_URL || process.env.POSTGRES_URL || process.env.DATABASE_URL_UNPOOLED || ''
}

function clientPool() {
  const url = connectionString()
  if (!url) return null
  pool ??= new Pool({ connectionString: url, max: 5, idleTimeoutMillis: 10_000, ssl: { rejectUnauthorized: false } })
  return pool
}

export function postgresConfigured() {
  return Boolean(connectionString())
}

export async function sql<T extends QueryResultRow = QueryResultRow>(text: string, values: unknown[] = []): Promise<T[]> {
  const activePool = clientPool()
  if (!activePool) throw new Error('PostgreSQL is not configured')
  return (await activePool.query<T>(text, values)).rows
}

export async function sqlOne<T extends QueryResultRow = QueryResultRow>(text: string, values: unknown[] = []): Promise<T | null> {
  return (await sql<T>(text, values))[0] || null
}

export async function execute(text: string, values: unknown[] = []) {
  const activePool = clientPool()
  if (!activePool) throw new Error('PostgreSQL is not configured')
  return activePool.query(text, values)
}

export async function transaction<T>(work: (client: PoolClient) => Promise<T>): Promise<T> {
  const activePool = clientPool()
  if (!activePool) throw new Error('PostgreSQL is not configured')
  const client = await activePool.connect()
  try {
    await client.query('BEGIN')
    const result = await work(client)
    await client.query('COMMIT')
    return result
  } catch (error) {
    await client.query('ROLLBACK')
    throw error
  } finally {
    client.release()
  }
}
