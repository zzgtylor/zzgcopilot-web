import { defineConfig } from 'sanity'
import { structureTool } from 'sanity/structure'
import { visionTool } from '@sanity/vision'
import { media } from 'sanity-plugin-media'
import { presentationTool } from 'sanity/presentation'
import { colorInput } from '@sanity/color-input'
import { schemaTypes } from './schemaTypes'
import { defaultDocumentNode, structure } from './structure'
import { ApproveAction, ReturnToWritingAction, SubmitForReviewAction } from './actions/editorialActions'
import { FeatureCenter } from './components/FeatureCenter'
import { ThemeTemplateCenter } from './components/ThemeTemplateCenter'
import { AnalyticsCenter } from './components/AnalyticsCenter'
import { ContentModelCenter } from './components/ContentModelCenter'
import { PageDesignerCenter } from './components/PageDesignerCenter'
import { TemplateComparisonCenter } from './components/TemplateComparisonCenter'

export default defineConfig({
  name: 'zzgcopilot',
  title: 'ZZGCopilot 内容后台',
  projectId: process.env.SANITY_STUDIO_PROJECT_ID || 'o9d9rhdt',
  dataset: process.env.SANITY_STUDIO_DATASET || 'production',
  plugins: [
    structureTool({ structure, defaultDocumentNode }),
    presentationTool({
      title: '网站预览',
      previewUrl: {
        initial: 'https://zzgcopilot.com',
        previewMode: { enable: '/api/draft-mode/enable', shareAccess: false },
      },
      allowOrigins: ['https://zzgcopilot.com'],
      resolve: {
        locations: {
          post: {
            select: { title: 'title', slug: 'slug.current' },
            resolve: value => value?.slug
              ? { locations: [{ title: value.title || '文章预览', href: `/tutorials/${value.slug}` }] }
              : { message: '请先填写并保存文章链接 Slug', tone: 'caution' },
          },
          page: {
            select: { title: 'title', slug: 'slug.current' },
            resolve: value => value?.slug
              ? { locations: [{ title: value.title || '页面预览', href: `/pages/${value.slug}` }] }
              : { message: '请先填写并保存页面链接 Slug', tone: 'caution' },
          },
          siteSettings: { locations: [{ title: '网站首页', href: '/' }] },
        },
      },
    }),
    media({ maximumUploadSize: 25_000_000, creditLine: { enabled: true } }),
    colorInput(),
    visionTool(),
  ],
  schema: {
    types: schemaTypes,
    templates: previous => previous.filter(template => template.schemaType !== 'siteSettings'),
  },
  document: {
    actions: (previous, context) => context.schemaType === 'post' || context.schemaType === 'page'
      ? [...previous, SubmitForReviewAction, ApproveAction, ReturnToWritingAction]
      : previous,
  },
  tools: previous => [
    { name: 'designer', title: '页面设计器', component: PageDesignerCenter },
    { name: 'compare', title: '模板对比', component: TemplateComparisonCenter },
    { name: 'analytics', title: '数据报表', component: AnalyticsCenter },
    { name: 'themes', title: '主题与模板', component: ThemeTemplateCenter },
    { name: 'features', title: '功能中心', component: FeatureCenter },
    { name: 'models', title: '内容模型', component: ContentModelCenter },
    ...previous,
  ],
})
