import { readdirSync, statSync, writeFileSync, unlinkSync } from 'node:fs'
import { join } from 'node:path'
import { spawnSync } from 'node:child_process'
import { tmpdir } from 'node:os'

const uploadsDir = join(process.cwd(), 'public', 'uploads')
const files = readdirSync(uploadsDir).filter((name) => /\.(jpe?g|png|webp|gif)$/i.test(name))
const mime = (name) => name.toLowerCase().endsWith('.png') ? 'image/png' : name.toLowerCase().endsWith('.webp') ? 'image/webp' : name.toLowerCase().endsWith('.gif') ? 'image/gif' : 'image/jpeg'
const quote = (value) => `'${String(value).replaceAll("'", "''")}'`
const statements = files.map((name) => {
  const url = `/uploads/${name}`
  const key = `static:${url}`
  const size = statSync(join(uploadsDir, name)).size
  return `INSERT OR IGNORE INTO media (id, filename, original_name, r2_key, mime_type, size, alt_text, uploaded_by, source_url) SELECT lower(hex(randomblob(16))), ${quote(name)}, ${quote(name)}, ${quote(key)}, ${quote(mime(name))}, ${size}, '', id, ${quote(url)} FROM users WHERE role = 'admin' AND is_active = 1 ORDER BY created_at LIMIT 1;`
})

if (!statements.length) process.exit(0)
const sqlPath = join(tmpdir(), `zzgcopilot-static-media-${Date.now()}.sql`)
writeFileSync(sqlPath, statements.join('\n') + '\n')
const result = spawnSync('npx', ['wrangler', 'd1', 'execute', 'zzgcopilot-db', '--remote', '--file', sqlPath, '--yes'], { stdio: 'inherit' })
unlinkSync(sqlPath)
process.exit(result.status ?? 1)

