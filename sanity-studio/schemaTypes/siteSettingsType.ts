import { defineField, defineType } from 'sanity'

export const siteSettingsType = defineType({
  name: 'siteSettings',
  title: '站点设置',
  type: 'document',
  fields: [
    defineField({ name: 'siteName', title: '站点名称', type: 'string', validation: rule => rule.required().max(120) }),
    defineField({ name: 'seoDefaultTitle', title: '默认 SEO 标题', type: 'string', validation: rule => rule.required().max(120) }),
    defineField({ name: 'seoDefaultDescription', title: '默认 SEO 描述', type: 'text', rows: 3, validation: rule => rule.required().max(180) }),
    defineField({ name: 'seoDefaultOgImage', title: '默认社交分享图片 URL', type: 'url' }),
    defineField({ name: 'defaultCoverImage', title: '默认文章封面', type: 'image', options: { hotspot: true } }),
  ],
  preview: { select: { title: 'siteName', subtitle: 'seoDefaultTitle' } },
})
