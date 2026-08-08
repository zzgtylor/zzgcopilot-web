import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import { getSanityPost, getSanitySiteSettings } from '@/lib/sanity-content'

export const dynamic = 'force-dynamic'

type Post = {
  id: string
  title: string
  slug: string
  excerpt: string
  content: string
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

  return (
    <main className="min-h-screen bg-white">
      <div className="mx-auto max-w-3xl px-6 py-12">
        <Link href="/" className="text-sm text-gray-400 hover:text-gray-600">← 返回首页</Link>

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

        <article className="prose prose-gray max-w-none prose-headings:font-bold prose-a:text-blue-600 prose-img:rounded-xl">
          <ReactMarkdown remarkPlugins={[remarkGfm]}>{post.content}</ReactMarkdown>
        </article>
      </div>
    </main>
  )
}
