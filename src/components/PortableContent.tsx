import { PortableText, type PortableTextComponents } from '@portabletext/react'

type PortableContentValue = Array<Record<string, unknown>>

const components: PortableTextComponents = {
  types: {
    image: ({ value }) => value.url ? (
      <figure className="my-8">
        <img src={value.url} alt={value.alt || ''} className="w-full rounded-xl" loading="lazy" />
        {value.caption ? <figcaption className="mt-2 text-center text-sm text-gray-500">{value.caption}</figcaption> : null}
      </figure>
    ) : null,
    callout: ({ value }) => {
      const toneClass = value.tone === 'warning'
        ? 'border-amber-500 bg-amber-50 text-amber-950'
        : value.tone === 'important'
          ? 'border-rose-500 bg-rose-50 text-rose-950'
          : 'border-[#11567f] bg-[#eef6fb] text-[#17394e]'
      return <aside className={`my-7 rounded-r-xl border-l-4 p-5 ${toneClass}`}><strong className="block">{value.title || '提示'}</strong><p className="mb-0 mt-2 whitespace-pre-wrap">{value.text}</p></aside>
    },
    tutorialStep: ({ value }) => <section className="my-7 rounded-xl border border-gray-200 bg-white p-5 shadow-sm"><strong className="text-[#11567f]">第 {value.stepNumber} 步 · {value.title}</strong><p className="mb-0 mt-2 whitespace-pre-wrap text-gray-700">{value.text}</p></section>,
    table: ({ value }) => <div className="my-8 overflow-x-auto">{value.caption ? <strong className="mb-2 block">{value.caption}</strong> : null}<table className="w-full border-collapse text-sm"><tbody>{value.rows?.map((row: { _key?: string; cells?: string[] }, rowIndex: number) => <tr key={row._key || rowIndex}>{row.cells?.map((cell, cellIndex) => <td key={cellIndex} className="border border-gray-200 px-3 py-2 align-top">{cell}</td>)}</tr>)}</tbody></table></div>,
    download: ({ value }) => {
      const href = value.fileUrl || value.externalUrl
      return href ? <p className="my-7"><a href={href} className="inline-flex rounded bg-[#11567f] px-5 py-3 font-medium text-white no-underline hover:bg-[#142844]" download={Boolean(value.fileUrl)}>{value.label || '下载文件'}</a></p> : null
    },
  },
  marks: {
    link: ({ children, value }) => <a href={value?.href} target={value?.openNewTab ? '_blank' : undefined} rel={value?.openNewTab ? 'noreferrer' : undefined}>{children}</a>,
  },
}

export function PortableContent({ value }: { value: PortableContentValue }) {
  return <PortableText value={value} components={components} />
}
