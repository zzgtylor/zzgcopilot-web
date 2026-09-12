#!/usr/bin/env node
import fs from 'node:fs'

const [, , input, output = 'neon-migration.sql'] = process.argv
if (!input) throw new Error('Usage: node scripts/migrate-d1-to-postgres.mjs <d1-export.sql> [output.sql]')
const source = fs.readFileSync(input, 'utf8')

function convert(sql) {
  return sql
    .replace(/INSERT\s+OR\s+IGNORE\s+INTO/gi, 'INSERT INTO')
    .replace(/datetime\(['"]now['"]\)/gi, 'NOW()')
    .replace(/date\(['"]now['"]\)/gi, 'CURRENT_DATE')
    .replace(/datetime\(['"]now['"]\s*,\s*['"]([+-]\d+)\s+(minutes?|hours?|days?)['"]\)/gi, (_, n, unit) => `NOW() ${Number(n) >= 0 ? '+' : '-'} INTERVAL '${Math.abs(Number(n))} ${unit}'`)
    .replace(/date\(['"]now['"]\s*,\s*['"]([+-]\d+)\s+days['"]\)/gi, (_, n) => `CURRENT_DATE ${Number(n) >= 0 ? '+' : '-'} INTERVAL '${Math.abs(Number(n))} days'`)
    .replace(/INTEGER\s+PRIMARY\s+KEY\s+AUTOINCREMENT/gi, 'BIGSERIAL PRIMARY KEY')
    .replace(/\bDATETIME\b/gi, 'TIMESTAMPTZ')
    .replace(/DEFAULT\s*\(lower\(hex\(randomblob\(16\)\)\)\)/gi, 'DEFAULT gen_random_uuid()::text')
}

const statements = source.match(/(?:CREATE TABLE|INSERT INTO|PRAGMA|BEGIN TRANSACTION|COMMIT|CREATE INDEX|ANALYZE)[\s\S]*?;(?=\n|$)/gi) || []
const filtered = statements.filter((statement) => !/sqlite_(?:sequence|stat1)|d1_migrations|^PRAGMA|^BEGIN|^COMMIT|^ANALYZE/i.test(statement.trim()))
const result = ['CREATE EXTENSION IF NOT EXISTS pgcrypto;', 'BEGIN;']
for (const statement of filtered) {
  const converted = convert(statement.trim())
  // SQLite's quoted identifiers and literal data are valid PostgreSQL syntax.
  result.push(converted.endsWith(';') ? converted : `${converted};`)
}
result.push('COMMIT;', '')
fs.writeFileSync(output, result.join('\n\n'))
console.log(`Generated ${output}: ${filtered.length} statements`)
