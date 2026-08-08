#!/usr/bin/env node

import { mkdir, writeFile } from 'node:fs/promises'
import { dirname, resolve } from 'node:path'

const outputPath = process.argv[2]
if (!outputPath) {
  throw new Error('Usage: node scripts/export-sanity-content.mjs <output-path>')
}

const projectId = process.env.SANITY_PROJECT_ID
const dataset = process.env.SANITY_DATASET || 'production'
const apiVersion = process.env.SANITY_API_VERSION || '2026-08-07'
const batchSize = 500

if (!projectId) {
  throw new Error('SANITY_PROJECT_ID must be set before exporting Sanity content')
}

const endpoint = new URL(`https://${projectId}.api.sanity.io/v${apiVersion}/data/query/${dataset}`)
endpoint.searchParams.set('perspective', 'published')
endpoint.searchParams.set('returnQuery', 'false')
const documents = []
let lastId = ''

for (;;) {
  const response = await fetch(endpoint, {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify({
      query: '*[_id > $lastId] | order(_id)[0...$batchSize]',
      params: { lastId, batchSize },
    }),
  })

  if (!response.ok) {
    throw new Error(`Sanity export request failed: ${response.status} ${await response.text()}`)
  }

  const payload = await response.json()
  const batch = payload.result
  if (!Array.isArray(batch)) throw new Error('Sanity export response did not contain an array result')
  documents.push(...batch)
  if (batch.length < batchSize) break
  lastId = batch.at(-1)?._id
  if (!lastId) throw new Error('Sanity export pagination response had no final _id')
}

const snapshot = {
  format: 'zzgcopilot-sanity-backup/v1',
  exported_at: new Date().toISOString(),
  project_id: projectId,
  dataset,
  document_count: documents.length,
  documents,
}

const absoluteOutputPath = resolve(outputPath)
await mkdir(dirname(absoluteOutputPath), { recursive: true })
await writeFile(absoluteOutputPath, `${JSON.stringify(snapshot, null, 2)}\n`)
console.log(`Exported ${documents.length} published Sanity document(s) to ${absoluteOutputPath}`)
