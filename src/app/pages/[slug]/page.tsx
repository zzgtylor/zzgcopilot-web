import type { Metadata } from 'next'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import { getSanityPage } from '@/lib/sanity-content'
import { PortableContent } from '@/components/PortableContent'
import { VisualSections } from '@/components/VisualSections'

export const dynamic = 'force-dynamic'
async function getPage(slug: string) { return getSanityPage(slug) }
export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> { const { slug } = await params; const page = await getPage(slug); return page ? { title: page.meta_title || page.title, description: page.meta_description || page.excerpt } : { title: '页面未找到' } }
export default async function PublicPage({ params }: { params: Promise<{ slug: string }> }) { const { slug } = await params; const page = await getPage(slug); if (!page) notFound(); return <main className="min-h-screen bg-white"><div className={page.sections.length ? 'mx-auto max-w-6xl px-6 py-12' : 'mx-auto max-w-3xl px-6 py-12'}><Link href="/" className="text-sm text-gray-400 hover:text-gray-600">← 返回首页</Link><header className="mb-8 mt-6"><h1 className="text-3xl font-bold text-gray-900 sm:text-4xl">{page.title}</h1>{page.excerpt && <p className="mt-4 text-lg text-gray-500">{page.excerpt}</p>}</header>{page.sections.length > 0 ? <VisualSections sections={page.sections} /> : <article className="prose prose-gray max-w-none prose-a:text-blue-600 prose-img:rounded-xl">{page.body.length > 0 ? <PortableContent value={page.body} /> : <ReactMarkdown remarkPlugins={[remarkGfm]}>{page.content}</ReactMarkdown>}</article>}</div></main> }
