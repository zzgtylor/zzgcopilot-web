import Link from 'next/link'
import { PortableContent } from './PortableContent'

type Section = Record<string, unknown>

const text = (value: unknown) => typeof value === 'string' ? value : ''
const list = (value: unknown): Section[] => Array.isArray(value) ? value.filter((item): item is Section => Boolean(item) && typeof item === 'object') : []
const linkClass = 'inline-flex items-center justify-center rounded-sm bg-[var(--site-primary)] px-5 py-3 text-sm font-semibold text-white no-underline transition hover:bg-[var(--site-secondary)]'

function ActionLink({ label, href }: { label: unknown; href: unknown }) {
  const value = text(href)
  const title = text(label)
  if (!value || !title) return null
  return value.startsWith('/') ? <Link href={value} className={linkClass}>{title}</Link> : <a href={value} className={linkClass} target="_blank" rel="noreferrer">{title}</a>
}

export function VisualSections({ sections, className = '' }: { sections: Section[]; className?: string }) {
  if (!sections.length) return null

  return <div className={`space-y-12 ${className}`}>
    {sections.map((section, index) => {
      const type = text(section._type)
      const key = text(section._key) || `${type}-${index}`

      if (type === 'hero') {
        const imageUrl = text(section.imageUrl)
        return <section key={key} className="overflow-hidden rounded-2xl bg-[var(--site-secondary)] text-white">
          <div className="grid items-center gap-8 p-7 sm:p-10 lg:grid-cols-2 lg:p-12">
            <div>
              {text(section.eyebrow) ? <p className="mb-3 text-xs font-bold uppercase tracking-[0.18em] text-[#9fd8ef]">{text(section.eyebrow)}</p> : null}
              <h2 className="font-serif text-3xl font-bold leading-tight sm:text-4xl">{text(section.title)}</h2>
              {text(section.text) ? <p className="mt-4 max-w-xl whitespace-pre-wrap text-[15px] leading-7 text-white/80">{text(section.text)}</p> : null}
              <div className="mt-6"><ActionLink label={section.label} href={section.href} /></div>
            </div>
            {imageUrl ? <img src={imageUrl} alt="" className="h-56 w-full rounded-xl object-cover sm:h-72" /> : null}
          </div>
        </section>
      }

      if (type === 'richTextSection') {
        const body = list(section.body)
        return <section key={key} className="mx-auto max-w-3xl">
          {text(section.title) ? <h2 className="mb-6 font-serif text-3xl font-bold text-[#1a160f]">{text(section.title)}</h2> : null}
          {body.length ? <article className="prose prose-gray max-w-none prose-a:text-[var(--site-primary)] prose-img:rounded-xl"><PortableContent value={body} /></article> : null}
        </section>
      }

      if (type === 'splitContent') {
        const imageUrl = text(section.imageUrl)
        const reverse = Boolean(section.reverse)
        return <section key={key} className="grid items-center gap-8 rounded-2xl border border-[#211e19]/10 bg-white p-6 sm:p-9 lg:grid-cols-2">
          <div className={reverse ? 'lg:order-2' : ''}>
            <h2 className="font-serif text-3xl font-bold text-[#1a160f]">{text(section.title)}</h2>
            {text(section.text) ? <p className="mt-4 whitespace-pre-wrap leading-7 text-[#5b554b]">{text(section.text)}</p> : null}
            <div className="mt-6"><ActionLink label={section.label} href={section.href} /></div>
          </div>
          {imageUrl ? <img src={imageUrl} alt={text(section.imageAlt)} className={`h-64 w-full rounded-xl object-cover sm:h-80 ${reverse ? 'lg:order-1' : ''}`} /> : null}
        </section>
      }

      if (type === 'cta') {
        return <section key={key} className="rounded-2xl bg-[#eef6fb] px-7 py-10 text-center sm:px-12">
          {text(section.eyebrow) ? <p className="text-xs font-bold uppercase tracking-[0.18em] text-[var(--site-primary)]">{text(section.eyebrow)}</p> : null}
          <h2 className="mt-2 font-serif text-3xl font-bold text-[#1a160f]">{text(section.title)}</h2>
          {text(section.text) ? <p className="mx-auto mt-4 max-w-2xl whitespace-pre-wrap leading-7 text-[#5b554b]">{text(section.text)}</p> : null}
          <div className="mt-6"><ActionLink label={section.label} href={section.href} /></div>
        </section>
      }

      if (type === 'faq') {
        return <section key={key} className="mx-auto max-w-3xl">
          <h2 className="mb-6 font-serif text-3xl font-bold text-[#1a160f]">{text(section.title) || '常见问题'}</h2>
          <div className="space-y-3">{list(section.items).map((item, itemIndex) => <details key={text(item._key) || itemIndex} className="rounded-xl border border-[#211e19]/10 bg-white px-5 py-4"><summary className="cursor-pointer font-semibold text-[#1a160f]">{text(item.question)}</summary><p className="mb-0 mt-3 whitespace-pre-wrap leading-7 text-[#5b554b]">{text(item.answer)}</p></details>)}</div>
        </section>
      }

      if (type === 'resourceGrid') {
        const items = list(section.items)
        const columns = Number(section.columns) === 2 ? 'md:grid-cols-2' : 'md:grid-cols-2 lg:grid-cols-3'
        return <section key={key}>
          {text(section.title) ? <h2 className="mb-6 font-serif text-3xl font-bold text-[#1a160f]">{text(section.title)}</h2> : null}
          <div className={`grid gap-5 ${columns}`}>{items.map((item, itemIndex) => <article key={text(item._key) || itemIndex} className="site-card">
            {text(item.imageUrl) ? <img src={text(item.imageUrl)} alt="" className="h-40 w-full object-cover" loading="lazy" /> : null}
            <div className="p-5"><h3 className="font-serif text-lg font-bold text-[#1a160f]">{text(item.title)}</h3>{text(item.text) ? <p className="mt-2 text-sm leading-6 text-[#5b554b]">{text(item.text)}</p> : null}<div className="mt-4"><ActionLink label={item.label} href={item.href} /></div></div>
          </article>)}</div>
        </section>
      }

      return null
    })}
  </div>
}
