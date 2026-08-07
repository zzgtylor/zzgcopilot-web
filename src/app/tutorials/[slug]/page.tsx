import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import { getDb } from '@/lib/cloudflare-db'
import { getSiteSettings } from '@/lib/site-settings'
import { auth } from '@/auth'
import { publishDuePosts } from '@/lib/post-scheduling'
import { headers } from 'next/headers'

export const dynamic = 'force-dynamic'

type Post = {
  id: string
  title: string
  slug: string
  excerpt: string
  content: string
  cover_image: string
  status: string
  view_count: number
  created_at: string
  published_at: string | null
  author_name?: string
  category_name?: string
  category_slug?: string
  meta_title?: string
  meta_description?: string
  og_image?: string
  comments_enabled?: number
}
type Comment = { id: string; content: string; created_at: string; author_name: string }

async function getPost(slug: string, includeUnpublished = false): Promise<Post | null> {
  const db = await getDb()
  if (!db) return null
  await publishDuePosts(db)
  const post = await db
    .prepare(
      `SELECT p.*, u.name as author_name, c.name as category_name, c.slug as category_slug FROM posts p LEFT JOIN users u ON p.author_id = u.id LEFT JOIN categories c ON p.category_id = c.id WHERE p.slug = ? ${includeUnpublished ? "AND p.status != 'archived'" : "AND p.status = 'published'"}`
    )
    .bind(slug)
    .first<Post>()
  return post || null
}

async function incrementViewCount(id: string) {
  const db = await getDb()
  if (!db) return
  await db.batch([
    db.prepare('UPDATE posts SET view_count = view_count + 1 WHERE id = ?').bind(id),
    db.prepare("INSERT INTO post_daily_views (post_id, view_date, views) VALUES (?, date('now'), 1) ON CONFLICT(post_id, view_date) DO UPDATE SET views = views + 1").bind(id),
  ]).catch(() => {})
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params
  const post = await getPost(slug)
  if (!post) return { title: '文章未找到' }

  const settings = await getSiteSettings()
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
  const session = await auth()
  const requestHeaders = await headers()
  const post = await getPost(slug, Boolean(session?.user))
  if (!post) notFound()

  const userAgent = requestHeaders.get('user-agent') || ''
  const isLikelyBot = /bot|crawler|spider|slurp|preview|facebookexternalhit|whatsapp|telegram/i.test(userAgent)
  if (post.status === 'published' && !session?.user && !isLikelyBot) await incrementViewCount(post.id)
  const db = await getDb()
  const comments = post.comments_enabled && db ? (await db.prepare('SELECT c.id, c.content, c.created_at, u.name AS author_name FROM comments c JOIN users u ON c.author_id=u.id WHERE c.post_id=? AND c.is_approved=1 ORDER BY c.created_at ASC LIMIT 100').bind(post.id).all<Comment>()).results || [] : []

  return (
    <main className="min-h-screen bg-white">
      <div className="mx-auto max-w-3xl px-6 py-12">
        {post.status !== 'published' && <p className="mb-5 rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800">草稿预览：只有已登录后台的管理员能看到，发布后才会显示在首页。</p>}
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
            <span>{post.view_count || 0} 次阅读</span>
          </div>
        </header>

        {post.cover_image && (
          <img src={post.cover_image} alt={post.title} className="mb-10 w-full rounded-2xl object-cover" />
        )}

        <article className="prose prose-gray max-w-none prose-headings:font-bold prose-a:text-blue-600 prose-img:rounded-xl">
          <ReactMarkdown remarkPlugins={[remarkGfm]}>{post.content}</ReactMarkdown>
        </article>
        {post.comments_enabled ? <section className="mt-12 border-t pt-8"><h2 className="text-xl font-bold text-gray-900">评论</h2>{comments.length ? <div className="mt-5 space-y-4">{comments.map(comment => <article key={comment.id} className="rounded-xl bg-gray-50 p-4"><div className="flex justify-between text-sm"><strong>{comment.author_name}</strong><time className="text-gray-400">{formatDate(comment.created_at)}</time></div><p className="mt-2 whitespace-pre-wrap text-sm leading-6 text-gray-700">{comment.content}</p></article>)}</div> : <p className="mt-3 text-sm text-gray-400">暂无已审核评论。</p>}</section> : null}
      </div>
    </main>
  )
}
