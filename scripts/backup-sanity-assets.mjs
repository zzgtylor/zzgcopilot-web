#!/usr/bin/env node

import { mkdir, writeFile } from 'node:fs/promises'
import { basename, dirname, resolve } from 'node:path'

const outputDir = process.argv[2]
if (!outputDir) throw new Error('Usage: node scripts/backup-sanity-assets.mjs <output-directory>')

const projectId = process.env.SANITY_PROJECT_ID
const dataset = process.env.SANITY_DATASET || 'production'
const apiVersion = process.env.SANITY_API_VERSION || '2026-08-07'
if (!projectId) throw new Error('SANITY_PROJECT_ID must be set before backing up Sanity assets')

const endpoint = new URL(`https://${projectId}.api.sanity.io/v${apiVersion}/data/query/${dataset}`)

async function query(groq) {
  const response = await fetch(endpoint, {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify({ query: groq }),
  })
  if (!response.ok) throw new Error(`Sanity asset query failed: ${response.status}`)
  const payload = await response.json()
  return Array.isArray(payload.result) ? payload.result : []
}

const [postAssets, settingsAssets] = await Promise.all([
  query('*[_type == "post" && status == "published" && defined(coverImage.asset)] { "documentId": _id, "role": "post-cover", "url": coverImage.asset->url }'),
  query('*[_type == "siteSettings" && defined(defaultCoverImage.asset)] { "documentId": _id, "role": "site-default-cover", "url": defaultCoverImage.asset->url }'),
])

const directory = resolve(outputDir)
await mkdir(directory, { recursive: true })
const entries = []
const seen = new Set()
for (const item of [...postAssets, ...settingsAssets]) {
  if (typeof item.url !== 'string' || seen.has(item.url)) continue
  const url = new URL(item.url)
  if (url.protocol !== 'https:' || url.hostname !== 'cdn.sanity.io') {
    throw new Error(`Unexpected Sanity asset URL: ${url.origin}`)
  }
  const fileName = basename(url.pathname)
  if (!/^[a-zA-Z0-9._-]+$/.test(fileName)) throw new Error(`Unsafe Sanity asset filename: ${fileName}`)
  const response = await fetch(url)
  if (!response.ok) throw new Error(`Sanity asset download failed: ${response.status}`)
  const filePath = resolve(directory, fileName)
  if (!filePath.startsWith(`${directory}/`)) throw new Error('Unsafe Sanity asset destination')
  const bytes = new Uint8Array(await response.arrayBuffer())
  await writeFile(filePath, bytes)
  entries.push({ documentId: item.documentId, role: item.role, sourceUrl: url.toString(), file: fileName, bytes: bytes.byteLength })
  seen.add(item.url)
}

const manifest = { generated_at: new Date().toISOString(), project_id: projectId, dataset, assets: entries }
await writeFile(resolve(directory, 'manifest.json'), `${JSON.stringify(manifest, null, 2)}\n`)
console.log(`Backed up ${entries.length} Sanity asset file(s) to ${directory}`)
