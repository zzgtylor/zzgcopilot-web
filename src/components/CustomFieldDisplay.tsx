import type { SanityCustomField } from '@/lib/sanity-content'

function safeHref(value: string) {
  return value.startsWith('/') || value.startsWith('https://') || value.startsWith('http://') || value.startsWith('mailto:') ? value : ''
}

function displayValue(field: SanityCustomField) {
  if (field.type === 'boolean') return field.value ? '是' : '否'
  if (field.type === 'url' || field.type === 'reference') {
    const href = safeHref(String(field.value))
    return href ? <a href={href} className="text-[var(--site-primary)] underline" target={href.startsWith('/') ? undefined : '_blank'} rel={href.startsWith('/') ? undefined : 'noreferrer'}>{String(field.value)}</a> : String(field.value)
  }
  if (field.type === 'media') {
    const href = safeHref(String(field.value))
    if (!href) return String(field.value)
    return /\.(?:avif|gif|jpe?g|png|webp)(?:\?|$)/i.test(href) ? <a href={href} target="_blank" rel="noreferrer"><img src={href} alt={field.label} className="mt-2 max-h-72 rounded-lg object-cover" /></a> : <a href={href} className="text-[var(--site-primary)] underline" target="_blank" rel="noreferrer">打开文件</a>
  }
  return String(field.value)
}

export function CustomFieldDisplay({ fields, placement }: { fields: SanityCustomField[]; placement: 'beforeContent' | 'afterContent' }) {
  const visible = fields.filter(field => field.displayOnPage && field.placement === placement && field.value !== '')
  if (!visible.length) return null
  return <dl className="my-8 grid gap-4 rounded-xl border border-gray-200 bg-gray-50 p-5 sm:grid-cols-2">{visible.map(field => <div key={field.key}><dt className="text-xs font-semibold uppercase tracking-wide text-gray-500">{field.label}</dt><dd className="mt-1 whitespace-pre-wrap text-sm leading-6 text-gray-800">{displayValue(field)}</dd></div>)}</dl>
}
