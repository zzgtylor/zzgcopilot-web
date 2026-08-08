import { createReadStream } from 'node:fs'
import { basename, resolve } from 'node:path'
import { getCliClient } from 'sanity/cli'

const inputPath = process.argv[2]
if (!inputPath) throw new Error('Usage: sanity exec scripts/migrate-cover-to-sanity.mjs --with-user-token -- <image-path>')

const client = getCliClient({ apiVersion: '2026-08-07' })
const imagePath = resolve(inputPath)
const filename = basename(imagePath)
const existing = await client.fetch('*[_type == "sanity.imageAsset" && originalFilename == $filename][0]{_id, url}', { filename })
const asset = existing || await client.assets.upload('image', createReadStream(imagePath), { filename, extract: ['palette', 'blurhash'] })
const imageReference = { _type: 'image', asset: { _type: 'reference', _ref: asset._id } }

await client.transaction()
  .patch('post-word-software-complete-guide', patch => patch.set({ coverImage: imageReference }).unset(['coverImageUrl']))
  .patch('site-settings', patch => patch.set({ defaultCoverImage: imageReference }))
  .commit()

console.log(JSON.stringify({ assetId: asset._id, url: asset.url, reused: Boolean(existing) }))
