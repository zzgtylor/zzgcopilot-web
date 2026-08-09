import { defineField } from 'sanity'

export const seoFields = [
  defineField({ name: 'focusKeyword', title: 'SEO 关键词', type: 'string', group: 'seo', validation: rule => rule.max(80) }),
  defineField({ name: 'metaTitle', title: 'SEO 标题', description: '建议 30–60 个字符。留空时使用内容标题。', type: 'string', group: 'seo', validation: rule => rule.max(120) }),
  defineField({ name: 'metaDescription', title: 'SEO 描述', description: '建议 80–160 个字符。', type: 'text', rows: 3, group: 'seo', validation: rule => rule.max(180) }),
  defineField({ name: 'canonicalUrl', title: '规范网址 Canonical（可选）', type: 'url', group: 'seo' }),
  defineField({ name: 'ogImage', title: '社交分享图片 URL', type: 'url', group: 'seo' }),
  defineField({ name: 'noIndex', title: '禁止搜索引擎收录', type: 'boolean', initialValue: false, group: 'seo' }),
  defineField({ name: 'schemaType', title: '结构化数据类型', type: 'string', initialValue: 'Article', group: 'seo', options: { list: [
    { title: '文章 Article', value: 'Article' },
    { title: '教程 HowTo', value: 'HowTo' },
    { title: '常见问题 FAQPage', value: 'FAQPage' },
    { title: '网页 WebPage', value: 'WebPage' },
  ] } }),
]
