import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import Image from 'next/image'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import { getSanityPost, getSanityRelatedPosts, getSanitySiteSettings } from '@/lib/sanity-content'
import { PortableContent } from '@/components/PortableContent'
import { ArticleEnhancements } from '@/components/ArticleEnhancements'
import { CustomFieldDisplay } from '@/components/CustomFieldDisplay'
import { TylerFooter, TylerHeader } from '@/components/TylerSiteChrome'
import type { SanityCustomField } from '@/lib/sanity-content'
import { getTutorialCover } from '@/lib/tutorial-covers'

export const dynamic = 'force-dynamic'

type Post = {
  id: string
  title: string
  slug: string
  excerpt: string
  content: string
  body: Array<Record<string, unknown>>
  cover_image: string
  status: string
  created_at: string
  published_at: string | null
  author_name?: string
  category_name?: string
  category_slug?: string
  tags?: string[]
  meta_title?: string
  meta_description?: string
  og_image?: string
  canonical_url?: string | null
  no_index?: boolean
  schema_type?: string
  custom_fields: SanityCustomField[]
}
async function getPost(slug: string): Promise<Post | null> {
  return getSanityPost(slug)
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params
  const post = await getPost(slug)
  if (!post) return { title: '文章未找到' }

  const settings = await getSanitySiteSettings()
  const title = post.meta_title || post.title
  const description = post.meta_description || post.excerpt || settings.seoDefaultDescription
  const ogImage = post.og_image || getTutorialCover(post.slug, post.cover_image) || settings.seoDefaultOgImage || undefined

  return {
    title: title + ' - ' + settings.siteName,
    description,
    openGraph: {
      title,
      description,
      images: ogImage ? [ogImage] : undefined,
      type: 'article',
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
      images: ogImage ? [ogImage] : undefined,
    },
    alternates: { canonical: post.canonical_url || `/tutorials/${post.slug}` },
    robots: post.no_index ? { index: false, follow: false } : undefined,
  }
}

function formatDate(iso: string | null) {
  if (!iso) return ''
  try {
    return new Date(iso).toLocaleDateString('zh-CN', { year: 'numeric', month: 'long', day: 'numeric' })
  } catch {
    return iso.split('T')[0]
  }
}

export default async function PostPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  const post = await getPost(slug)
  if (!post) notFound()
  const settings = await getSanitySiteSettings()
  const coverImage = getTutorialCover(post.slug, post.cover_image)
  const relatedPosts = settings.relatedPostsEnabled
    ? await getSanityRelatedPosts(post, 3)
    : []
  const structuredData = { '@context': 'https://schema.org', '@type': post.schema_type || 'Article', headline: post.title, description: post.excerpt, datePublished: post.published_at || post.created_at, dateModified: post.published_at || post.created_at, image: post.og_image || coverImage || undefined, articleSection: post.category_name || undefined, keywords: post.tags?.join(', ') || undefined, author: { '@type': 'Person', name: post.author_name || settings.organizationName }, publisher: { '@type': 'Organization', name: settings.organizationName }, mainEntityOfPage: `${settings.canonicalBaseUrl}/tutorials/${post.slug}` }

  return (
    <div className="min-h-screen bg-[#faf8f3] text-[#182533]">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData).replace(/</g, '\\u003c') }} />
      <TylerHeader settings={settings} />
      <main className="mx-auto px-5 py-10 sm:px-6 sm:py-14" style={{ maxWidth: 'var(--site-content-width)' }}>
        {settings.breadcrumbsEnabled ? <Link href="/" className="text-sm text-gray-400 hover:text-gray-600">← 返回首页</Link> : null}

        <header className="mb-9 mt-6 border-b border-[#e3ddd3] pb-8">
          {post.category_name && (
            <Link href={`/?category=${post.category_slug}`} className="text-xs font-medium text-blue-600">
              {post.category_name}
            </Link>
          )}
          <h1 className="tyler-wordmark mt-3 text-4xl font-semibold leading-tight tracking-[-0.035em] text-[#182533] sm:text-5xl">{post.title}</h1>
          {post.excerpt ? <p className="mt-5 max-w-2xl text-base leading-8 text-[#66717b]">{post.excerpt}</p> : null}
          <div className="mt-4 flex flex-wrap items-center gap-3 text-sm text-gray-400">
            {post.author_name && <span>{post.author_name}</span>}
            <span>{formatDate(post.published_at || post.created_at)}</span>
          </div>
        </header>

        {coverImage && (
          <Image src={coverImage} alt={post.title} width={1600} height={900} className="mb-10 h-auto w-full rounded-2xl object-cover" />
        )}

        <CustomFieldDisplay fields={post.custom_fields} placement="beforeContent" />

        <article className="tutorial-prose max-w-none">
          {post.body.length > 0 ? <PortableContent value={post.body} /> : <ReactMarkdown remarkPlugins={[remarkGfm]}>{post.content}</ReactMarkdown>}
        </article>
        <CustomFieldDisplay fields={post.custom_fields} placement="afterContent" />
        <ArticleEnhancements title={post.title} readingProgress={settings.readingProgressEnabled} shareButtons={settings.shareButtonsEnabled} backToTop={settings.backToTopEnabled} />
        {settings.authorBoxEnabled ? <section className="mt-10 rounded-xl border border-gray-200 bg-gray-50 p-6"><p className="text-xs font-semibold uppercase tracking-wider text-[var(--site-primary)]">作者</p><h2 className="mt-2 text-lg font-bold text-gray-900">{post.author_name || settings.organizationName}</h2><p className="mt-2 text-sm leading-6 text-gray-600">由 {post.author_name || settings.organizationName} 整理和维护本站教程内容。</p></section> : null}
        {settings.newsletterEnabled && settings.newsletterHref ? <section className="mt-10 rounded-2xl bg-[var(--site-secondary)] p-7 text-white"><h2 className="text-xl font-bold">{settings.newsletterTitle}</h2><p className="mt-2 text-sm leading-6 text-white/80">{settings.newsletterText}</p><a href={settings.newsletterHref} className="mt-5 inline-flex rounded bg-white px-5 py-2.5 text-sm font-semibold text-[var(--site-secondary)] no-underline">{settings.newsletterButtonLabel}</a></section> : null}
        {relatedPosts.length ? <section className="mt-12"><h2 className="text-xl font-bold text-gray-900">相关文章</h2><div className="mt-5 grid gap-4 sm:grid-cols-3">{relatedPosts.map(item => <Link key={item.id} href={`/tutorials/${item.slug}`} className="site-card block p-4"><span className="line-clamp-2 font-semibold text-gray-900">{item.title}</span>{item.category_name ? <span className="mt-3 block text-xs text-[var(--site-primary)]">{item.category_name}</span> : null}</Link>)}</div></section> : null}
      </main>
      {settings.showFooter ? <TylerFooter settings={settings} /> : null}
    </div>
  )
}
