import { defineField, defineType } from 'sanity'
import { pageSectionsField } from './pageSections'

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
    defineField({ name: 'homepageBrandName', title: '首页品牌名称', type: 'string', validation: rule => rule.max(80) }),
    defineField({ name: 'homepageSectionTitle', title: '首页文章区标题', type: 'string', validation: rule => rule.max(80) }),
    defineField({ name: 'homepageSearchPlaceholder', title: '首页搜索框提示文字', type: 'string', validation: rule => rule.max(80) }),
    defineField({ name: 'homepageCtaLabel', title: '首页主按钮文字', type: 'string', validation: rule => rule.max(80) }),
    defineField({ name: 'homepageFooterBrand', title: '首页页脚品牌名称', type: 'string', validation: rule => rule.max(80) }),
    defineField({ name: 'homepageFooterNote', title: '首页页脚说明', type: 'string', validation: rule => rule.max(200) }),
    defineField({ name: 'showDefaultLatestPosts', title: '显示默认“最新教程”卡片区', description: '默认开启，关闭后首页只显示下方添加的可视化首页区块。', type: 'boolean', initialValue: true }),
    pageSectionsField('homepageSections', '首页可视化区块'),
  ],
  preview: { select: { title: 'siteName', subtitle: 'seoDefaultTitle' } },
})
