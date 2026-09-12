import assert from 'node:assert/strict'
import { readFile } from 'node:fs/promises'
import test from 'node:test'

const read = (pathname) => readFile(new URL(`../${pathname}`, import.meta.url), 'utf8')

test('Sanity backups target private Vercel Blob instead of Cloudflare R2', async () => {
  const [backupScript, uploader, legacyScript] = await Promise.all([
    read('scripts/backup-sanity.sh'),
    read('scripts/upload-backup-to-vercel-blob.mjs'),
    read('scripts/backup-cloudflare.sh'),
  ])

  assert.match(backupScript, /upload-backup-to-vercel-blob\.mjs/)
  assert.doesNotMatch(backupScript, /wrangler\s+r2/)
  assert.match(backupScript, /tar -xzf/)
  assert.match(backupScript, /shasum -a 256 -c SHA256SUMS/)
  assert.match(uploader, /from '@vercel\/blob'/)
  assert.match(uploader, /access: 'private'/)
  assert.match(uploader, /BLOB_READ_WRITE_TOKEN/)
  assert.doesNotMatch(legacyScript, /wrangler|zzgcopilot-db|zzgcopilot-assets/)
  assert.match(legacyScript, /backup-sanity\.sh/)
})
