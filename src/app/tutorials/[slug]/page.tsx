import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import { getSanityPost, getSanityPublishedPosts, getSanitySiteSettings } from '@/lib/sanity-content'
import { PortableContent } from '@/components/PortableContent'
import { Comments } from '@/components/Comments'
import { CheckoutButton } from '@/components/CheckoutButton'
import { currentMember } from '@/lib/member-auth'
import { platformDb } from '@/lib/platform'
import { ArticleEnhancements } from '@/components/ArticleEnhancements'
import { CustomFieldDisplay } from '@/components/CustomFieldDisplay'
import type { SanityCustomField } from '@/lib/sanity-content'

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
  meta_title?: string
  meta_description?: string
  og_image?: string
  canonical_url?: string | null
  no_index?: boolean
  schema_type?: string
  comments_enabled?: boolean
  access_level?: 'public' | 'member' | 'paid'
  teaser?: string
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
  const ogImage = post.og_image || post.cover_image || settings.seoDefaultOgImage || undefined

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
  const relatedPosts = settings.relatedPostsEnabled
    ? (await getSanityPublishedPosts({ limit: 4 })).filter(item => item.slug !== post.slug).slice(0, 3)
    : []
  const restricted = post.access_level && post.access_level !== 'public'
  const member = restricted ? await currentMember() : null
  let canRead = !restricted || (post.access_level === 'member' && Boolean(member))
  if (post.access_level === 'paid' && member) {
    const subscription = await platformDb()?.prepare("SELECT id FROM member_subscriptions WHERE member_id=? AND status IN ('active','trialing') AND (current_period_end IS NULL OR current_period_end>datetime('now'))").bind(member.id).first()
    canRead = Boolean(subscription)
  }
  const structuredData = { '@context': 'https://schema.org', '@type': post.schema_type || 'Article', headline: post.title, description: post.excerpt, datePublished: post.published_at || post.created_at, author: { '@type': 'Person', name: post.author_name || settings.organizationName }, mainEntityOfPage: `${settings.canonicalBaseUrl}/tutorials/${post.slug}` }

  return (
    <main className="min-h-screen bg-white">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData).replace(/</g, '\\u003c') }} />
      <div className="mx-auto px-6 py-12" style={{ maxWidth: 'var(--site-content-width)' }}>
        {settings.breadcrumbsEnabled ? <Link href="/" className="text-sm text-gray-400 hover:text-gray-600">← 返回首页</Link> : null}

        <header className="mt-6 mb-8">
          {post.category_name && (
            <Link href={`/?category=${post.category_slug}`} className="text-xs font-medium text-blue-600">
              {post.category_name}
            </Link>
          )}
          <h1 className="mt-2 text-3xl font-bold leading-tight text-gray-900 sm:text-4xl">{post.title}</h1>
          <div className="mt-4 flex flex-wrap items-center gap-3 text-sm text-gray-400">
            {post.author_name && <span>{post.author_name}</span>}
            <span>{formatDate(post.published_at || post.created_at)}</span>
          </div>
        </header>

        {post.cover_image && (
          <img src={post.cover_image} alt={post.title} className="mb-10 w-full rounded-2xl object-cover" />
        )}

        <CustomFieldDisplay fields={post.custom_fields} placement="beforeContent" />

        <article className="prose prose-gray max-w-none prose-headings:font-bold prose-a:text-[var(--site-primary)] prose-img:rounded-xl">
          {!canRead ? <div className="rounded-xl border border-gray-200 bg-gray-50 p-8 text-center"><h2 className="text-xl font-bold">{post.access_level === 'paid' ? '付费会员内容' : '会员内容'}</h2><p className="mt-3 text-gray-600">{post.teaser || '此内容需要会员权限。'}</p>{!member ? <Link href="/account" className="mt-5 inline-block rounded bg-[var(--site-primary)] px-5 py-2.5 text-white no-underline">登录会员账户</Link> : post.access_level === 'paid' && settings.paidContentEnabled ? <CheckoutButton slug={post.slug}/> : null}</div> : post.body.length > 0 ? <PortableContent value={post.body} /> : <ReactMarkdown remarkPlugins={[remarkGfm]}>{post.content}</ReactMarkdown>}
        </article>
        <CustomFieldDisplay fields={post.custom_fields} placement="afterContent" />
        {canRead ? <ArticleEnhancements title={post.title} readingProgress={settings.readingProgressEnabled} shareButtons={settings.shareButtonsEnabled} backToTop={settings.backToTopEnabled} /> : null}
        {canRead && settings.authorBoxEnabled ? <section className="mt-10 rounded-xl border border-gray-200 bg-gray-50 p-6"><p className="text-xs font-semibold uppercase tracking-wider text-[var(--site-primary)]">作者</p><h2 className="mt-2 text-lg font-bold text-gray-900">{post.author_name || settings.organizationName}</h2><p className="mt-2 text-sm leading-6 text-gray-600">由 {post.author_name || settings.organizationName} 整理和维护本站教程内容。</p></section> : null}
        {canRead && settings.newsletterEnabled && settings.newsletterHref ? <section className="mt-10 rounded-2xl bg-[var(--site-secondary)] p-7 text-white"><h2 className="text-xl font-bold">{settings.newsletterTitle}</h2><p className="mt-2 text-sm leading-6 text-white/80">{settings.newsletterText}</p><a href={settings.newsletterHref} className="mt-5 inline-flex rounded bg-white px-5 py-2.5 text-sm font-semibold text-[var(--site-secondary)] no-underline">{settings.newsletterButtonLabel}</a></section> : null}
        {canRead && relatedPosts.length ? <section className="mt-12"><h2 className="text-xl font-bold text-gray-900">相关文章</h2><div className="mt-5 grid gap-4 sm:grid-cols-3">{relatedPosts.map(item => <Link key={item.id} href={`/tutorials/${item.slug}`} className="site-card block p-4"><span className="line-clamp-2 font-semibold text-gray-900">{item.title}</span>{item.category_name ? <span className="mt-3 block text-xs text-[var(--site-primary)]">{item.category_name}</span> : null}</Link>)}</div></section> : null}
        {canRead && settings.commentsEnabled && post.comments_enabled ? <Comments contentId={post.id} slug={post.slug} siteKey={settings.turnstileSiteKey} /> : null}
      </div>
    </main>
  )
}
