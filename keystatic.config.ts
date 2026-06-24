import { config, fields, collection } from '@keystatic/core'

// Keystatic schema for the Word tutorial chapters.
// This mirrors the Chapter/Section structure currently defined inline in
// src/app/tutorials/word/page.tsx. It does NOT change the rendered page;
// it provides a CMS schema + content skeletons that can later be wired in.

export default config({
  storage: {
    kind: 'local',
  },
  collections: {
    wordChapters: collection({
      label: 'Word 教程章节',
      slugField: 'title',
      path: 'content/word-tutorial/*',
      format: { contentField: undefined },
      schema: {
        // ---- Chapter-level fields (mirror of type Chapter) ----
        id: fields.text({ label: 'ID', description: '章节唯一标识，如 ch1' }),
        num: fields.text({ label: '章序号', description: '如 第一章' }),
        title: fields.slug({ name: { label: '标题', description: '章节标题' } }),
        icon: fields.text({ label: '图标 (emoji)' }),
        level: fields.select({
          label: '难度',
          options: [
            { label: '入门', value: '入门' },
            { label: '基础', value: '基础' },
            { label: '进阶', value: '进阶' },
            { label: '精通', value: '精通' },
          ],
          defaultValue: '入门',
        }),
        iconBg: fields.text({ label: '图标背景色', description: '如 #dcfce7' }),
        levelBg: fields.text({ label: '难度标签背景色' }),
        levelColor: fields.text({ label: '难度标签文字色' }),
        // ---- Sections (mirror of type Section[]) ----
        sections: fields.array(
          fields.object({
            title: fields.text({ label: '小节标题', description: '如 1.1 Word 界面总览' }),
            content: fields.text({ label: '正文', multiline: true }),
            tip: fields.text({ label: '提示 (可选)', multiline: true }),
            warn: fields.text({ label: '警告 (可选)', multiline: true }),
          }),
          {
            label: '小节',
            itemLabel: (props) => props.fields.title.value || '未命名小节',
          }
        ),
      },
    }),
  },
})
