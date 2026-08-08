import type { Metadata } from 'next'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import { getSanityPage } from '@/lib/sanity-content'

export const dynamic = 'force-dynamic'
async function getPage(slug: string) { return getSanityPage(slug) }
export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> { const { slug } = await params; const page = await getPage(slug); return page ? { title: page.meta_title || page.title, description: page.meta_description || page.excerpt } : { title: '页面未找到' } }
export default async function PublicPage({ params }: { params: Promise<{ slug: string }> }) { const { slug } = await params; const page = await getPage(slug); if (!page) notFound(); return <main className="min-h-screen bg-white"><div className="mx-auto max-w-3xl px-6 py-12"><Link href="/" className="text-sm text-gray-400 hover:text-gray-600">← 返回首页</Link><header className="mb-8 mt-6"><h1 className="text-3xl font-bold text-gray-900 sm:text-4xl">{page.title}</h1>{page.excerpt && <p className="mt-4 text-lg text-gray-500">{page.excerpt}</p>}</header><article className="prose prose-gray max-w-none prose-a:text-blue-600 prose-img:rounded-xl"><ReactMarkdown remarkPlugins={[remarkGfm]}>{page.content}</ReactMarkdown></article></div></main> }
