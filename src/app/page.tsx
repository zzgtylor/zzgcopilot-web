import Link from 'next/link'
import { Search } from 'lucide-react'
import { VisualSections } from '@/components/VisualSections'
import { DEFAULT_NAVIGATION, getSanityNavigation, getSanityPublishedPostCount, getSanityPublishedPosts, getSanitySiteSettings, type SanityNavigationItem } from '@/lib/sanity-content'

export const dynamic = 'force-dynamic'

type PostCard = {
  id: string
  title: string
  slug: string
  cover_image: string | null
  reading_time: number | null
  created_at: string
  published_at: string | null
  category_name: string | null
}
type NavigationItem = SanityNavigationItem

const legacyTutorial = {
  title: 'Word软件使用全攻略教程',
  href: '/word-tutorial/',
  coverImage: '',
  category: '入门基础',
  date: '2026-07-03',
  readingTime: 20,
}

async function getNavigation(): Promise<NavigationItem[]> {
  return getSanityNavigation()
}

function formatCardDate(value: string | null) {
  if (!value) return ''
  return value.slice(0, 10)
}

function pageHref(page: number, query: string) {
  const params = new URLSearchParams()
  if (query) params.set('q', query)
  if (page > 1) params.set('page', String(page))
  const suffix = params.toString()
  return suffix ? `/?${suffix}` : '/'
}

export default async function HomePage({ searchParams }: { searchParams?: Promise<Record<string, string | string[] | undefined>> }) {
  const resolvedSearchParams = await searchParams
  const query = (Array.isArray(resolvedSearchParams?.q) ? resolvedSearchParams?.q[0] : resolvedSearchParams?.q || '').trim().slice(0, 80)
  const requestedPage = Number(Array.isArray(resolvedSearchParams?.page) ? resolvedSearchParams?.page[0] : resolvedSearchParams?.page || '1')
  const pageSize = 9
  const totalPosts = await getSanityPublishedPostCount({ search: query })
  const totalPages = Math.max(1, Math.ceil(totalPosts / pageSize))
  const currentPage = Math.min(Math.max(Number.isFinite(requestedPage) ? Math.floor(requestedPage) : 1, 1), totalPages)
  const [posts, navigation, settings] = await Promise.all([
    getSanityPublishedPosts({ limit: pageSize, offset: (currentPage - 1) * pageSize, search: query }),
    getNavigation(),
    getSanitySiteSettings(),
  ])
  const tutorialHref = posts[0] ? `/tutorials/${posts[0].slug}` : legacyTutorial.href
  const navItems = navigation.length ? navigation : DEFAULT_NAVIGATION

  return (
    <div className="min-h-screen overflow-x-hidden bg-[#f8f9fa] text-[#211e19]">
      {/* NAV */}
      <nav className="sticky top-0 z-50 flex flex-wrap items-center justify-between gap-y-3 gap-x-6 border-b border-[#211e19]/10 bg-white px-5 py-4 sm:px-8">
        <Link href="/" className="shrink-0 whitespace-nowrap font-serif text-2xl font-bold text-[#211e19] sm:text-3xl">
          {settings.homepageBrandName}
        </Link>

        <div className="hidden flex-wrap items-center gap-x-6 gap-y-2 whitespace-nowrap text-[13.5px] font-medium text-[#4a443b] md:flex">
          {navItems.map(item => {
            const href = item.href === '__latest_tutorial__' ? tutorialHref : item.href
            return <Link key={item.id} href={href} target={item.open_new_tab ? '_blank' : undefined} rel={item.open_new_tab ? 'noreferrer' : undefined} className={href === '/' ? 'font-bold text-[#11567f]' : 'hover:text-[#11567f]'}>{item.label}</Link>
          })}
        </div>

        <div className="flex shrink-0 items-center gap-3.5">
          <form action="/" method="get" className="relative hidden sm:block">
            <input
              type="search"
              name="q"
              defaultValue={query}
              aria-label="搜索教程"
              placeholder={settings.homepageSearchPlaceholder}
              className="h-[38px] w-[180px] rounded-full border border-[#211e19]/15 bg-white pl-[34px] pr-3.5 text-[13px] outline-none transition focus:border-[#11567f]"
            />
            <Search className="pointer-events-none absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-[#a39a8a]" />
          </form>

          <Link
            href={tutorialHref}
            className="inline-flex items-center gap-1.5 whitespace-nowrap rounded-sm bg-[#11567f] px-[18px] py-2.5 text-[13.5px] font-medium text-white transition hover:bg-[#142844]"
          >
            {settings.homepageCtaLabel}
          </Link>
        </div>
      </nav>

      {/* 主体：网格 + 侧边栏。默认保持现有首页，只有手动关闭时才隐藏。 */}
      {settings.showDefaultLatestPosts ? <div className="mx-auto grid max-w-[1480px] items-start gap-12 px-5 py-11 sm:px-8 lg:grid-cols-[1fr_320px] lg:px-10 lg:py-[44px]">
        {/* 左：主内容区 */}
        <main>
          <div className="mb-[26px] flex flex-wrap items-baseline justify-between gap-2.5">
            <h1 className="font-serif text-2xl font-bold text-[#1a160f]">{settings.homepageSectionTitle}</h1>
          </div>

          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {posts.length > 0
              ? posts.map((post) => (
                  <Link
                    key={post.id}
                    href={`/tutorials/${post.slug}`}
                    className="flex flex-col overflow-hidden rounded-md border border-[#211e19]/[0.07] bg-white shadow-[0_1px_3px_rgba(26,22,15,0.05)] transition hover:-translate-y-[3px] hover:shadow-[0_16px_32px_-16px_rgba(26,22,15,0.28)]"
                  >
                    <div className="relative h-[150px] bg-[#f5f5f7]">
                      <img
                        src={post.cover_image || settings.defaultCoverImageUrl || legacyTutorial.coverImage}
                        alt={post.title}
                        className="h-full w-full object-cover"
                        loading="eager"
                      />
                      <span className="absolute left-3 top-3 rounded-full bg-white/90 px-2.5 py-1 text-[11px] font-bold text-[#11567f] shadow-sm">
                        {post.category_name || legacyTutorial.category}
                      </span>
                    </div>

                    <div className="flex flex-1 flex-col gap-2.5 p-[18px] pb-5">
                      <h3 className="line-clamp-2 font-serif text-[16.5px] font-bold leading-normal text-[#1a160f]">{post.title}</h3>
                      <div className="mt-auto flex items-center justify-between gap-2 text-xs text-[#a39a8a]">
                        <span className="whitespace-nowrap font-mono">{formatCardDate(post.published_at || post.created_at)}</span>
                        <span className="whitespace-nowrap">{post.reading_time || legacyTutorial.readingTime} 分钟</span>
                      </div>
                    </div>
                  </Link>
                ))
              : query ? (
                  <div className="col-span-full rounded-md border border-[#211e19]/[0.07] bg-white px-6 py-12 text-center text-sm text-[#797266]">
                    没有找到与“{query}”相关的教程
                  </div>
                ) : (
                  <Link
                    href={legacyTutorial.href}
                    className="flex flex-col overflow-hidden rounded-md border border-[#211e19]/[0.07] bg-white shadow-[0_1px_3px_rgba(26,22,15,0.05)] transition hover:-translate-y-[3px] hover:shadow-[0_16px_32px_-16px_rgba(26,22,15,0.28)]"
                  >
                    <div className="relative h-[150px] bg-[#f5f5f7]">
                      {settings.defaultCoverImageUrl ? <img src={settings.defaultCoverImageUrl} alt={legacyTutorial.title} className="h-full w-full object-cover" loading="eager" /> : null}
                      <span className="absolute left-3 top-3 rounded-full bg-white/90 px-2.5 py-1 text-[11px] font-bold text-[#11567f] shadow-sm">
                        {legacyTutorial.category}
                      </span>
                    </div>

                    <div className="flex flex-1 flex-col gap-2.5 p-[18px] pb-5">
                      <h3 className="line-clamp-2 font-serif text-[16.5px] font-bold leading-normal text-[#1a160f]">{legacyTutorial.title}</h3>
                      <div className="mt-auto flex items-center justify-between gap-2 text-xs text-[#a39a8a]">
                        <span className="whitespace-nowrap font-mono">{legacyTutorial.date}</span>
                        <span className="whitespace-nowrap">{legacyTutorial.readingTime} 分钟</span>
                      </div>
                    </div>
                  </Link>
                )}
          </div>

          {totalPosts > 0 ? (
            <nav aria-label="教程分页" className="mt-12 flex flex-wrap items-center justify-center gap-2 font-mono text-[13px]">
              {currentPage > 1
                ? <Link href={pageHref(currentPage - 1, query)} className="rounded border border-[#211e19]/[0.12] px-3.5 py-2 text-[#4a443b] hover:border-[#11567f] hover:text-[#11567f]">← 上一页</Link>
                : <span className="cursor-default select-none rounded border border-[#211e19]/[0.12] px-3.5 py-2 text-[#a39a8a]">← 上一页</span>}
              {Array.from({ length: totalPages }, (_, index) => index + 1).map(page => page === currentPage
                ? <span key={page} aria-current="page" className="cursor-default select-none rounded border border-[#11567f] bg-[#11567f] px-3.5 py-2 text-white">{page}</span>
                : <Link key={page} href={pageHref(page, query)} className="rounded border border-[#211e19]/[0.12] px-3.5 py-2 text-[#4a443b] hover:border-[#11567f] hover:text-[#11567f]">{page}</Link>)}
              {currentPage < totalPages
                ? <Link href={pageHref(currentPage + 1, query)} className="rounded border border-[#211e19]/[0.12] px-3.5 py-2 text-[#4a443b] hover:border-[#11567f] hover:text-[#11567f]">下一页 →</Link>
                : <span className="cursor-default select-none rounded border border-[#211e19]/[0.12] px-3.5 py-2 text-[#a39a8a]">下一页 →</span>}
            </nav>
          ) : null}
        </main>

        {/* 右：侧边栏（预留位，暂无内容） */}
        <aside className="sticky top-[88px] hidden flex-col gap-7 lg:flex" />
      </div> : null}

      {settings.homepageSections.length > 0 ? <VisualSections sections={settings.homepageSections} className="mx-auto max-w-[1480px] px-5 py-11 sm:px-8 lg:px-10 lg:py-[44px]" /> : null}

      {/* FOOTER */}
      <footer className="border-t border-[#211e19]/10 bg-white px-5 py-8 text-[#1a160f] sm:px-10 sm:py-9">
        <div className="mx-auto flex max-w-[1480px] flex-wrap items-center justify-between gap-4">
          <span className="text-[13px] text-[#797266]">{settings.homepageFooterBrand}</span>
          <span className="font-mono text-xs text-[#a39a8a]">{settings.homepageFooterNote}</span>
        </div>
      </footer>
    </div>
  )
}
