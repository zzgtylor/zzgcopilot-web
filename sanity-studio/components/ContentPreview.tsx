import { PortableText, type PortableTextComponents } from '@portabletext/react'
import imageUrlBuilder from '@sanity/image-url'
import { useClient } from 'sanity'
import type { UserViewComponent } from 'sanity/structure'

type PreviewDocument = {
  _type?: string
  title?: string
  excerpt?: string
  content?: string
  body?: Array<Record<string, unknown>>
  coverImage?: Record<string, unknown>
  publishedAt?: string
  status?: string
  editorialStage?: string
}

function PreviewImage({ value }: { value: Record<string, unknown> }) {
  const client = useClient({ apiVersion: '2026-08-07' })
  const url = imageUrlBuilder(client).image(value).width(1100).fit('max').url()
  return (
    <figure style={{ margin: '28px 0' }}>
      <img src={url} alt={String(value.alt || '')} style={{ display: 'block', width: '100%', borderRadius: 12 }} />
      {value.caption ? <figcaption style={{ marginTop: 8, color: '#797266', textAlign: 'center', fontSize: 13 }}>{String(value.caption)}</figcaption> : null}
    </figure>
  )
}

const components: PortableTextComponents = {
  types: {
    image: ({ value }) => <PreviewImage value={value} />,
    callout: ({ value }) => <aside style={{ margin: '22px 0', borderLeft: '4px solid #11567f', borderRadius: 8, background: '#eef6fb', padding: 16 }}><strong>{value.title || '提示'}</strong><div style={{ marginTop: 6, whiteSpace: 'pre-wrap' }}>{value.text}</div></aside>,
    tutorialStep: ({ value }) => <section style={{ margin: '22px 0', border: '1px solid #d9e3ea', borderRadius: 10, padding: 18 }}><strong style={{ color: '#11567f' }}>第 {value.stepNumber} 步 · {value.title}</strong><div style={{ marginTop: 8, whiteSpace: 'pre-wrap' }}>{value.text}</div></section>,
    table: ({ value }) => <div style={{ margin: '24px 0', overflowX: 'auto' }}>{value.caption ? <strong>{value.caption}</strong> : null}<table style={{ marginTop: 8, width: '100%', borderCollapse: 'collapse' }}><tbody>{value.rows?.map((row: { _key?: string; cells?: string[] }, rowIndex: number) => <tr key={row._key || rowIndex}>{row.cells?.map((cell, cellIndex) => <td key={cellIndex} style={{ border: '1px solid #d9d9d9', padding: 10 }}>{cell}</td>)}</tr>)}</tbody></table></div>,
    download: ({ value }) => <span style={{ display: 'inline-block', borderRadius: 4, background: '#11567f', color: 'white', padding: '10px 16px' }}>{value.label || '下载文件'}</span>,
  },
  marks: {
    link: ({ children, value }) => <a href={value?.href} target={value?.openNewTab ? '_blank' : undefined} rel={value?.openNewTab ? 'noreferrer' : undefined}>{children}</a>,
  },
}

export const ContentPreview: UserViewComponent = (props) => {
  const document = props.document.displayed as PreviewDocument
  const client = useClient({ apiVersion: '2026-08-07' })
  const coverUrl = document.coverImage ? imageUrlBuilder(client).image(document.coverImage).width(1100).height(580).fit('crop').url() : ''

  return (
    <div style={{ minHeight: '100%', background: '#f8f9fa', padding: 24, color: '#211e19' }}>
      <div style={{ margin: '0 auto', maxWidth: 820, overflow: 'hidden', border: '1px solid rgba(33,30,25,.08)', borderRadius: 12, background: 'white', boxShadow: '0 12px 30px rgba(33,30,25,.08)' }}>
        {coverUrl ? <img src={coverUrl} alt={document.title || ''} style={{ display: 'block', width: '100%', maxHeight: 430, objectFit: 'cover' }} /> : null}
        <article style={{ padding: '34px 40px 48px', fontFamily: 'system-ui, sans-serif', lineHeight: 1.75 }}>
          <div style={{ marginBottom: 12, color: '#797266', fontSize: 13 }}>状态：{document.status || '草稿'} · 审核：{document.editorialStage || '撰写中'}</div>
          <h1 style={{ margin: '0 0 16px', fontFamily: 'Georgia, serif', fontSize: 36, lineHeight: 1.2 }}>{document.title || '未命名内容'}</h1>
          {document.excerpt ? <p style={{ color: '#6f685d', fontSize: 18 }}>{document.excerpt}</p> : null}
          {Array.isArray(document.body) && document.body.length > 0
            ? <PortableText value={document.body} components={components} />
            : <div style={{ whiteSpace: 'pre-wrap' }}>{document.content || '在“编辑”页签中添加正文后，这里会实时显示预览。'}</div>}
        </article>
      </div>
    </div>
  )
}
