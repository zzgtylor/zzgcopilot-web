import type { Metadata } from 'next'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import { auth } from '@/auth'
import { getDb } from '@/lib/cloudflare-db'

export const dynamic = 'force-dynamic'
type CmsPage = { title: string; content: string; excerpt: string; status: string; meta_title?: string; meta_description?: string; created_at: string; updated_at: string }
async function getPage(slug: string, preview = false) { const db = await getDb(); if (!db) return null; return db.prepare(`SELECT * FROM pages WHERE slug=? AND ${preview ? "status <> 'archived'" : "status = 'published'"}`).bind(slug).first<CmsPage>() }
export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> { const { slug } = await params; const page = await getPage(slug); return page ? { title: page.meta_title || page.title, description: page.meta_description || page.excerpt } : { title: '页面未找到' } }
export default async function PublicPage({ params }: { params: Promise<{ slug: string }> }) { const { slug } = await params; const session = await auth(); const page = await getPage(slug, Boolean(session?.user)); if (!page) notFound(); return <main className="min-h-screen bg-white"><div className="mx-auto max-w-3xl px-6 py-12">{page.status !== 'published' && <p className="mb-5 rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800">草稿预览：发布后访客才能看到。</p>}<Link href="/" className="text-sm text-gray-400 hover:text-gray-600">← 返回首页</Link><header className="mb-8 mt-6"><h1 className="text-3xl font-bold text-gray-900 sm:text-4xl">{page.title}</h1>{page.excerpt && <p className="mt-4 text-lg text-gray-500">{page.excerpt}</p>}</header><article className="prose prose-gray max-w-none prose-a:text-blue-600 prose-img:rounded-xl"><ReactMarkdown remarkPlugins={[remarkGfm]}>{page.content}</ReactMarkdown></article></div></main> }
