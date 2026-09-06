#!/usr/bin/env node

import { createReadStream } from 'node:fs'
import { stat } from 'node:fs/promises'
import { basename } from 'node:path'
import { put } from '@vercel/blob'

const [, , archivePath, pathname] = process.argv

if (!archivePath || !pathname) {
  throw new Error('Usage: node scripts/upload-backup-to-vercel-blob.mjs <archive-path> <blob-pathname>')
}

if (!process.env.BLOB_READ_WRITE_TOKEN) {
  throw new Error('BLOB_READ_WRITE_TOKEN is required. Retrieve the project environment locally with Vercel before running a backup.')
}

const archiveName = basename(archivePath)
if (archiveName !== basename(pathname) || !/^backups\/(sanity|neon)\/.+\.tar\.gz$/.test(pathname)) {
  throw new Error('Backup pathname must be backups/sanity/<archive-name>.tar.gz or backups/neon/<archive-name>.tar.gz')
}

const metadata = await stat(archivePath)
if (metadata.size === 0) {
  throw new Error('Backup archive is empty')
}

const blob = await put(pathname, createReadStream(archivePath), {
  access: 'private',
  addRandomSuffix: false,
  allowOverwrite: false,
  contentType: 'application/gzip',
  multipart: true,
})

console.log(`Stored private Vercel Blob backup: ${blob.pathname} (${metadata.size} bytes)`)
