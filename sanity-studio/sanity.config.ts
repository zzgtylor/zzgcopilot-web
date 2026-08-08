import { defineConfig } from 'sanity'
import { structureTool } from 'sanity/structure'
import { visionTool } from '@sanity/vision'
import { media } from 'sanity-plugin-media'
import { schemaTypes } from './schemaTypes'
import { defaultDocumentNode, structure } from './structure'

export default defineConfig({
  name: 'zzgcopilot',
  title: 'ZZGCopilot 内容后台',
  projectId: process.env.SANITY_STUDIO_PROJECT_ID || 'o9d9rhdt',
  dataset: process.env.SANITY_STUDIO_DATASET || 'production',
  plugins: [
    structureTool({ structure, defaultDocumentNode }),
    media({ maximumUploadSize: 25_000_000, creditLine: { enabled: true } }),
    visionTool(),
  ],
  schema: { types: schemaTypes },
})
