import { defineConfig } from 'sanity'
import { structureTool } from 'sanity/structure'
import { visionTool } from '@sanity/vision'
import { schemaTypes } from './schemaTypes'

export default defineConfig({
  name: 'zzgcopilot',
  title: 'ZZGCopilot 内容后台',
  projectId: process.env.SANITY_STUDIO_PROJECT_ID || 'o9d9rhdt',
  dataset: process.env.SANITY_STUDIO_DATASET || 'production',
  plugins: [structureTool(), visionTool()],
  schema: { types: schemaTypes },
})
