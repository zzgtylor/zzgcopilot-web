#!/usr/bin/env node

import { createHash } from 'node:crypto'
import { readdir, readFile } from 'node:fs/promises'
import { join } from 'node:path'
import pg from 'pg'

const connectionString = process.env.DATABASE_URL || process.env.POSTGRES_URL || process.env.DATABASE_URL_UNPOOLED
if (!connectionString) throw new Error('DATABASE_URL, POSTGRES_URL, or DATABASE_URL_UNPOOLED is required')

const migrationDirectory = join(process.cwd(), 'migrations', 'postgres')
const files = (await readdir(migrationDirectory)).filter(file => /^\d+_.+\.sql$/.test(file)).sort()
const pool = new pg.Pool({ connectionString, max: 1, ssl: { rejectUnauthorized: false } })
const client = await pool.connect()

try {
  await client.query('CREATE TABLE IF NOT EXISTS schema_migrations (version TEXT PRIMARY KEY, checksum TEXT NOT NULL, applied_at TIMESTAMPTZ NOT NULL DEFAULT NOW())')
  for (const file of files) {
    const sql = await readFile(join(migrationDirectory, file), 'utf8')
    const checksum = createHash('sha256').update(sql).digest('hex')
    const existing = await client.query('SELECT checksum FROM schema_migrations WHERE version = $1', [file])
    if (existing.rowCount) {
      if (existing.rows[0].checksum !== checksum) throw new Error(`Migration checksum changed: ${file}`)
      console.log(`Skipped ${file}`)
      continue
    }
    await client.query('BEGIN')
    try {
      await client.query(sql)
      await client.query('INSERT INTO schema_migrations(version, checksum) VALUES ($1, $2)', [file, checksum])
      await client.query('COMMIT')
      console.log(`Applied ${file}`)
    } catch (error) {
      await client.query('ROLLBACK')
      throw error
    }
  }
} finally {
  client.release()
  await pool.end()
}
