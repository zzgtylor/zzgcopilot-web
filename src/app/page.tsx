import Link from 'next/link'
import { ArrowDown, ArrowRight, BookOpen, Search, Sparkles } from 'lucide-react'
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
  const settings = await getSanitySiteSettings()
  const pageSize = settings.postsPerPage
  const totalPosts = await getSanityPublishedPostCount({ search: query })
  const totalPages = Math.max(1, Math.ceil(totalPosts / pageSize))
  const currentPage = Math.min(Math.max(Number.isFinite(requestedPage) ? Math.floor(requestedPage) : 1, 1), totalPages)
  const [posts, navigation] = await Promise.all([
    getSanityPublishedPosts({ limit: pageSize, offset: (currentPage - 1) * pageSize, search: query }),
    getNavigation(),
  ])
  const tutorialHref = posts[0] ? `/tutorials/${posts[0].slug}` : legacyTutorial.href
  const ctaHref = !settings.homepageCtaHref || settings.homepageCtaHref === '__latest_tutorial__' ? tutorialHref : settings.homepageCtaHref
  const heroPrimaryHref = settings.homepageHeroPrimaryHref === '__latest_tutorial__' ? tutorialHref : settings.homepageHeroPrimaryHref
  const heroSecondaryHref = settings.homepageHeroSecondaryHref === '__latest_tutorial__' ? tutorialHref : settings.homepageHeroSecondaryHref
  const navItems = navigation.length ? navigation : DEFAULT_NAVIGATION

  return (
    <div className="site-home min-h-screen overflow-x-hidden text-[#211e19]">
      {/* NAV */}
      <nav className="site-nav z-50 flex flex-wrap items-center justify-between gap-y-3 gap-x-6 border-b border-[#211e19]/10 px-5 py-4 sm:px-8">
        <Link href="/" className="shrink-0 whitespace-nowrap font-serif text-2xl font-bold text-[#211e19] sm:text-3xl">
          {settings.homepageBrandName}
        </Link>

        <div className="hidden flex-wrap items-center gap-x-6 gap-y-2 whitespace-nowrap text-[13.5px] font-medium text-[#4a443b] md:flex">
          {navItems.map(item => {
            const href = item.href === '__latest_tutorial__' ? tutorialHref : item.href
            return <Link key={item.id} href={href} target={item.open_new_tab ? '_blank' : undefined} rel={item.open_new_tab ? 'noreferrer' : undefined} className={href === '/' ? 'font-bold text-[var(--site-primary)]' : 'hover:text-[var(--site-primary)]'}>{item.label}</Link>
          })}
        </div>

        <div className="flex shrink-0 items-center gap-3.5">
          {settings.showHeaderSearch ? <form action="/" method="get" className="relative hidden sm:block">
            <input
              type="search"
              name="q"
              defaultValue={query}
              aria-label="搜索教程"
              placeholder={settings.homepageSearchPlaceholder}
              className="h-[38px] w-[180px] rounded-full border border-[#211e19]/15 bg-white pl-[34px] pr-3.5 text-[13px] outline-none transition focus:border-[var(--site-primary)]"
            />
            <Search className="pointer-events-none absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-[#a39a8a]" />
          </form> : null}

          {settings.showHeaderCta ? <Link
            href={ctaHref}
            data-analytics-event="cta"
            data-analytics-label={settings.homepageCtaLabel}
            className="inline-flex items-center gap-1.5 whitespace-nowrap rounded-sm bg-[var(--site-primary)] px-[18px] py-2.5 text-[13.5px] font-medium text-white transition hover:bg-[var(--site-secondary)]"
          >
            {settings.homepageCtaLabel}
          </Link> : null}
        </div>
      </nav>

      {settings.showHomepageHero && !query ? <section className="site-hero relative isolate overflow-hidden border-b border-[#211e19]/10">
        <div className="site-hero-orb site-hero-orb-one" />
        <div className="site-hero-orb site-hero-orb-two" />
        <div className="site-shell relative z-10 mx-auto grid min-h-[590px] items-center gap-12 px-5 py-16 sm:px-8 lg:grid-cols-[1.02fr_.98fr] lg:px-10 lg:py-20">
          <div className="site-hero-copy max-w-2xl">
            <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-[var(--site-primary)]/20 bg-white/75 px-3.5 py-2 text-[11px] font-bold tracking-[0.18em] text-[var(--site-primary)] shadow-sm backdrop-blur">
              <Sparkles className="h-3.5 w-3.5" />
              {settings.homepageHeroEyebrow}
            </div>
            <h1 className="whitespace-pre-line font-serif text-[clamp(2.75rem,6vw,5.8rem)] font-bold leading-[.98] tracking-[-0.045em] text-[#172b43]">
              {settings.homepageHeroTitle}
            </h1>
            <p className="mt-7 max-w-xl text-base leading-8 text-[#5d6670] sm:text-lg">
              {settings.homepageHeroDescription}
            </p>
            <div className="mt-9 flex flex-wrap items-center gap-3">
              <Link href={heroPrimaryHref} className="inline-flex min-h-12 items-center gap-2 rounded-full bg-[var(--site-primary)] px-6 py-3 text-sm font-bold text-white shadow-[0_16px_35px_-18px_var(--site-primary)] transition hover:-translate-y-0.5 hover:bg-[var(--site-secondary)]">
                {settings.homepageHeroPrimaryLabel}
                <ArrowRight className="h-4 w-4" />
              </Link>
              <Link href={heroSecondaryHref} className="inline-flex min-h-12 items-center gap-2 rounded-full border border-[#172b43]/15 bg-white/70 px-6 py-3 text-sm font-bold text-[#172b43] backdrop-blur transition hover:border-[var(--site-primary)] hover:text-[var(--site-primary)]">
                {settings.homepageHeroSecondaryLabel}
                <ArrowDown className="h-4 w-4" />
              </Link>
            </div>
            <div className="mt-10 flex flex-wrap gap-x-8 gap-y-3 text-sm text-[#69727b]">
              <span><strong className="mr-1 text-xl text-[#172b43]">{totalPosts}</strong> 篇动态教程</span>
              <span className="inline-flex items-center gap-2"><span className="h-2 w-2 rounded-full bg-emerald-500" />Sanity 后台发布即更新</span>
            </div>
          </div>

          <div className="site-hero-visual relative mx-auto w-full max-w-[620px]">
            <div className="site-hero-window overflow-hidden rounded-[28px] border border-white/70 bg-white/80 p-3 shadow-[0_40px_100px_-48px_rgba(17,86,127,.55)] backdrop-blur-xl sm:p-4">
              <div className="mb-3 flex items-center gap-1.5 px-2 py-1">
                <span className="h-2.5 w-2.5 rounded-full bg-[#ff7a6b]" />
                <span className="h-2.5 w-2.5 rounded-full bg-[#ffcc5c]" />
                <span className="h-2.5 w-2.5 rounded-full bg-[#63c98b]" />
                <span className="ml-auto rounded-full bg-[#eef5f8] px-3 py-1 text-[10px] font-bold tracking-wider text-[var(--site-primary)]">TYLER · WORD 教程</span>
              </div>
              {settings.homepageHeroImageUrl ? <img src={settings.homepageHeroImageUrl} alt={settings.homepageHeroTitle.replace(/\n/g, ' ')} className="aspect-[4/3] w-full rounded-[20px] object-cover" loading="eager" /> : <div className="site-hero-demo aspect-[4/3] rounded-[20px] p-5 sm:p-7">
                <div className="flex items-center justify-between">
                  <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[var(--site-primary)] text-white shadow-lg"><BookOpen className="h-6 w-6" /></div>
                  <span className="text-xs font-bold tracking-[0.18em] text-[#7990a0]">学习路线</span>
                </div>
                <div className="mt-8 space-y-3">
                  {(posts.length ? posts.slice(0, 3) : [{ id: 'legacy', title: legacyTutorial.title }]).map((post, index) => <div key={post.id} className="site-hero-demo-row flex items-center gap-4 rounded-2xl border border-white/80 bg-white/80 p-4 shadow-sm backdrop-blur">
                    <span className="font-mono text-xs font-bold text-[var(--site-primary)]">0{index + 1}</span>
                    <span className="line-clamp-1 flex-1 font-serif text-sm font-bold text-[#24384c] sm:text-base">{post.title}</span>
                    <ArrowRight className="h-4 w-4 text-[#8da0ad]" />
                  </div>)}
                </div>
              </div>}
            </div>
            <div className="site-hero-chip absolute -bottom-5 -left-3 rounded-2xl border border-white/80 bg-white/90 px-4 py-3 text-xs font-bold text-[#31485a] shadow-xl backdrop-blur sm:-left-8">发布文章 → 自动生成卡片</div>
          </div>
        </div>
      </section> : null}

      {/* 动态教程卡片：内容全部来自 Sanity，发布后自动进入网格。 */}
      {settings.showDefaultLatestPosts ? <div id="latest-tutorials" className="site-shell mx-auto px-5 py-14 sm:px-8 lg:px-10 lg:py-20">
        <main>
          <div className="mb-[26px] flex flex-wrap items-baseline justify-between gap-2.5">
            <h1 className="font-serif text-2xl font-bold text-[#1a160f]">{settings.homepageSectionTitle}</h1>
            {settings.homepageIntroText ? <p className="w-full max-w-3xl text-sm leading-6 text-[#797266]">{settings.homepageIntroText}</p> : null}
          </div>

          <div className="site-card-grid grid grid-cols-1 sm:grid-cols-2">
            {posts.length > 0
              ? posts.map((post, index) => (
                  <Link
                    key={post.id}
                    href={`/tutorials/${post.slug}`}
                    className="site-card site-card-reveal flex flex-col"
                    style={{ animationDelay: `${Math.min(index, 8) * 70}ms` }}
                  >
                    <div className="site-card-image relative bg-[#f5f5f7]">
                      <img
                        src={post.cover_image || settings.defaultCoverImageUrl || legacyTutorial.coverImage}
                        alt={post.title}
                        className="h-full w-full object-cover"
                        loading="eager"
                      />
                      {settings.showCardCategory ? <span className="absolute left-3 top-3 rounded-full bg-white/90 px-2.5 py-1 text-[11px] font-bold text-[var(--site-primary)] shadow-sm">
                        {post.category_name || legacyTutorial.category}
                      </span> : null}
                    </div>

                    <div className="flex flex-1 flex-col gap-2.5 p-[18px] pb-5">
                      <h3 className="line-clamp-2 font-serif text-[16.5px] font-bold leading-normal text-[#1a160f]">{post.title}</h3>
                      {post.excerpt ? <p className="line-clamp-2 text-[13px] leading-5 text-[#797266]">{post.excerpt}</p> : null}
                      {settings.showCardDate || settings.showCardReadingTime ? <div className="mt-auto flex items-center justify-between gap-2 text-xs text-[#a39a8a]">
                        {settings.showCardDate ? <span className="whitespace-nowrap font-mono">{formatCardDate(post.published_at || post.created_at)}</span> : null}
                        {settings.showCardReadingTime ? <span className="whitespace-nowrap">{post.reading_time || legacyTutorial.readingTime} 分钟</span> : null}
                      </div> : null}
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
                    className="site-card flex flex-col"
                  >
                    <div className="site-card-image relative bg-[#f5f5f7]">
                      {settings.defaultCoverImageUrl ? <img src={settings.defaultCoverImageUrl} alt={legacyTutorial.title} className="h-full w-full object-cover" loading="eager" /> : null}
                      {settings.showCardCategory ? <span className="absolute left-3 top-3 rounded-full bg-white/90 px-2.5 py-1 text-[11px] font-bold text-[var(--site-primary)] shadow-sm">
                        {legacyTutorial.category}
                      </span> : null}
                    </div>

                    <div className="flex flex-1 flex-col gap-2.5 p-[18px] pb-5">
                      <h3 className="line-clamp-2 font-serif text-[16.5px] font-bold leading-normal text-[#1a160f]">{legacyTutorial.title}</h3>
                      {settings.showCardDate || settings.showCardReadingTime ? <div className="mt-auto flex items-center justify-between gap-2 text-xs text-[#a39a8a]">
                        {settings.showCardDate ? <span className="whitespace-nowrap font-mono">{legacyTutorial.date}</span> : null}
                        {settings.showCardReadingTime ? <span className="whitespace-nowrap">{legacyTutorial.readingTime} 分钟</span> : null}
                      </div> : null}
                    </div>
                  </Link>
                )}
          </div>

          {totalPosts > 0 ? (
            <nav aria-label="教程分页" className="mt-12 flex flex-wrap items-center justify-center gap-2 font-mono text-[13px]">
              {currentPage > 1
                ? <Link href={pageHref(currentPage - 1, query)} className="rounded border border-[#211e19]/[0.12] px-3.5 py-2 text-[#4a443b] hover:border-[var(--site-primary)] hover:text-[var(--site-primary)]">← 上一页</Link>
                : <span className="cursor-default select-none rounded border border-[#211e19]/[0.12] px-3.5 py-2 text-[#a39a8a]">← 上一页</span>}
              {Array.from({ length: totalPages }, (_, index) => index + 1).map(page => page === currentPage
                ? <span key={page} aria-current="page" className="cursor-default select-none rounded border border-[var(--site-primary)] bg-[var(--site-primary)] px-3.5 py-2 text-white">{page}</span>
                : <Link key={page} href={pageHref(page, query)} className="rounded border border-[#211e19]/[0.12] px-3.5 py-2 text-[#4a443b] hover:border-[var(--site-primary)] hover:text-[var(--site-primary)]">{page}</Link>)}
              {currentPage < totalPages
                ? <Link href={pageHref(currentPage + 1, query)} className="rounded border border-[#211e19]/[0.12] px-3.5 py-2 text-[#4a443b] hover:border-[var(--site-primary)] hover:text-[var(--site-primary)]">下一页 →</Link>
                : <span className="cursor-default select-none rounded border border-[#211e19]/[0.12] px-3.5 py-2 text-[#a39a8a]">下一页 →</span>}
            </nav>
          ) : null}
        </main>
      </div> : null}

      {settings.homepageSections.length > 0 ? <VisualSections sections={settings.homepageSections} className="site-shell mx-auto px-5 py-11 sm:px-8 lg:px-10 lg:py-[44px]" /> : null}
      {/* FOOTER */}
      {settings.showFooter ? <footer className="site-footer border-t border-[#211e19]/10 px-5 py-8 text-[#1a160f] sm:px-10 sm:py-9">
        <div className="site-shell mx-auto flex flex-wrap items-center justify-between gap-4">
          <span className="text-[13px] text-[#797266]">{settings.homepageFooterBrand}</span>
          <span className="font-mono text-xs text-[#a39a8a]">{settings.homepageFooterNote}</span>
        </div>
      </footer> : null}
    </div>
  )
}
