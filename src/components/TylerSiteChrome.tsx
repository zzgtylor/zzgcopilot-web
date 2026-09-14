import Link from 'next/link'
import { Menu, Search, User } from 'lucide-react'
import type { PublicSiteSettings, SanityNavigationItem } from '@/lib/sanity-content'

function navigationHref(href: string) {
  return href === '__latest_tutorial__' ? '/#latest-tutorials' : href
}

export function TylerHeader({ query = '', navigation, settings }: { query?: string; navigation?: SanityNavigationItem[]; settings?: PublicSiteSettings }) {
  const items = navigation?.filter(item => item.is_visible).slice(0, 5) || [
    { id: 'home', label: '首页', href: '/', is_visible: 1, open_new_tab: 0 },
    { id: 'tutorials', label: '教程', href: '/#latest-tutorials', is_visible: 1, open_new_tab: 0 },
    { id: 'about', label: '关于', href: '/#site-footer', is_visible: 1, open_new_tab: 0 },
  ]
  return (
    <header className="tyler-header border-b border-[#e1e4ec] bg-white">
      <div className="tyler-shell relative mx-auto flex h-20 items-center justify-between px-5 sm:px-8 lg:px-0">
        <Link href="/" aria-label="Tyler博客首页" className="flex shrink-0 items-center gap-2 text-[#16233f]">
          <span aria-hidden="true" className="flex h-7 w-7 items-center justify-center rounded-[4px] border border-[#16233f] bg-[#16233f] text-[11px] font-bold leading-none text-white">T</span>
          <span className="tyler-wordmark text-[26px] font-bold leading-none">{(settings?.homepageBrandName || 'Tyler博客').replace(/博客$/, '')}</span>
          <span className="tyler-wordmark text-lg font-medium">博客</span>
          <span aria-hidden="true" className="h-1.5 w-1.5 rounded-full bg-[#e8a33d]" />
        </Link>

        <nav aria-label="主导航" className="absolute left-1/2 hidden -translate-x-1/2 items-center gap-[38px] text-sm font-medium text-[#16233f] md:flex">
          {items.map(item => <Link href={navigationHref(item.href)} key={item.id} target={item.open_new_tab ? '_blank' : undefined} className="border-b-2 border-transparent pb-1 transition hover:border-[#e8a33d]">{item.label}</Link>)}
        </nav>

        <div className="hidden items-center gap-3 sm:flex">
          <form action="/" method="get" className={`relative ${settings?.showHeaderSearch === false ? 'hidden' : ''}`}>
            <Search aria-hidden="true" className="pointer-events-none absolute left-4 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-[#6f7782]" />
            <input type="search" name="q" defaultValue={query} aria-label="搜索教程" placeholder={settings?.homepageSearchPlaceholder || '搜索教程'} className="h-10 w-[156px] rounded-full border border-[#e1e4ec] bg-white pl-10 pr-4 text-[13px] text-[#16233f] outline-none transition focus:border-[#16233f]" />
          </form>
          <Link href="/account" className="flex h-10 items-center gap-1.5 rounded-full border border-[#e1e4ec] px-4 text-[13px] font-medium text-[#16233f] transition hover:border-[#16233f] hover:bg-[#16233f] hover:text-white">
            <User aria-hidden="true" className="h-3.5 w-3.5" />
            登录
          </Link>
        </div>

        <details className="group relative sm:hidden">
          <summary aria-label="打开导航菜单" className="flex h-10 w-10 cursor-pointer list-none items-center justify-center rounded-xl border border-[#e1e4ec] bg-white text-[#16233f] [&::-webkit-details-marker]:hidden"><Menu className="h-5 w-5" /></summary>
          <nav aria-label="手机导航" className="absolute right-0 top-12 z-50 flex w-40 flex-col overflow-hidden rounded-xl border border-[#e1e4ec] bg-white py-2 text-sm shadow-xl">
            {items.map(item => <Link href={navigationHref(item.href)} key={item.id} className="px-4 py-2.5 hover:bg-[#f5f6fa]">{item.label}</Link>)}
            <Link href="/account" className="border-t border-[#e1e4ec] px-4 py-2.5 font-medium text-[#16233f] hover:bg-[#f5f6fa]">登录 / 会员</Link>
          </nav>
        </details>
      </div>
    </header>
  )
}

export function TylerFooter({ settings }: { settings?: PublicSiteSettings } = {}) {
  return (
    <footer id="site-footer" className="border-t border-[#0f1830] bg-[#16233f]">
      <div className="tyler-shell mx-auto grid gap-10 px-5 py-14 sm:px-8 md:grid-cols-[1.6fr_repeat(3,1fr)] lg:px-0 lg:py-16">
        <div><p className="tyler-wordmark text-2xl font-bold text-white">{settings?.homepageFooterBrand || 'Tyler博客'}</p><p className="mt-4 max-w-xs text-sm leading-7 text-[#aeb6cc]">{settings?.homepageFooterNote || '记录技术，也记录生活。'}</p></div>
        <FooterColumn title="学习" links={[["最新教程", "/#latest-tutorials"], ["全部教程", "/tutorials"], ["返回首页", "/"]]} />
        <FooterColumn title="资源" links={[["Excel 教程", "/tutorials/excel"], ["Word 教程", "/?q=Word"], ["搜索教程", "/?q=教程"]]} />
        <FooterColumn title="关于" links={[["关于本站", "/#site-footer"], ["联系反馈", "/pages/contact"], ["站点地图", "/sitemap.xml"]]} />
      </div>
      <div className="tyler-shell mx-auto flex flex-wrap justify-between gap-3 border-t border-[#28365a] px-5 py-6 text-xs text-[#8993ad] sm:px-8 lg:px-0"><span>© 2026 Tyler博客</span><span>内容独立整理，非相关软件官方文档</span></div>
    </footer>
  )
}

function FooterColumn({ title, links }: { title: string; links: Array<[string, string]> }) {
  return <div><p className="text-sm font-bold text-white">{title}</p><div className="mt-4 flex flex-col gap-3 text-[13px] text-[#aeb6cc]">{links.map(([label, href]) => <Link key={`${label}-${href}`} href={href} className="hover:text-[#e8a33d]">{label}</Link>)}</div></div>
}
