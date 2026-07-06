import Link from 'next/link'
import { ArrowRight, BookOpen, Search } from 'lucide-react'

export default function HomePage() {
  return (
    <main className="min-h-screen bg-[#f8f9fa] text-[#211e19]">
      <nav className="sticky top-0 z-50 border-b border-[#211e19]/10 bg-white">
        <div className="mx-auto flex max-w-[1480px] flex-wrap items-center justify-between gap-4 px-6 py-4 sm:px-8">
          <Link
            href="/"
            className="font-serif text-[28px] font-black leading-none text-[#211e19] sm:text-[30px]"
          >
            Tyler博客
          </Link>

          <div className="flex flex-wrap items-center gap-x-6 gap-y-3 text-sm font-medium text-[#4a443b]">
            <Link href="/" className="font-bold text-[#11567f]">
              首页
            </Link>
            <Link href="/word-tutorial/" className="hover:text-[#11567f]">
              教程
            </Link>
            <Link href="/word-tutorial/" className="hover:text-[#11567f]">
              模板下载
            </Link>
            <Link href="/word-tutorial/" className="hover:text-[#11567f]">
              关于我们
            </Link>
          </div>

          <div className="hidden items-center gap-3 lg:flex">
            <div className="relative">
              <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#a39a8a]" />
              <input
                aria-label="搜索教程"
                className="h-10 w-48 rounded-full border border-[#211e19]/15 bg-white pl-9 pr-4 text-sm outline-none transition focus:border-[#11567f]"
                placeholder="搜索教程..."
                type="search"
              />
            </div>
            <Link
              href="/word-tutorial/"
              className="inline-flex h-10 items-center gap-2 rounded-sm bg-[#11567f] px-5 text-sm font-medium text-white transition hover:bg-[#0d2a45]"
            >
              从零开始学习
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </div>
      </nav>

      <div className="mx-auto grid max-w-[1480px] gap-10 px-6 py-10 sm:px-10 lg:grid-cols-[1fr_320px] lg:gap-12 lg:py-11">
        <section>
          <div className="mb-6 flex items-end justify-between gap-4">
            <h1 className="font-serif text-[26px] font-black text-[#1a160f]">
              最新教程
            </h1>
            <span className="hidden font-mono text-xs text-[#a39a8a] sm:inline">
              2026-07-03
            </span>
          </div>

          <Link
            href="/word-tutorial/"
            className="group grid overflow-hidden rounded-md border border-[#211e19]/10 bg-white shadow-[0_1px_3px_rgba(26,22,15,0.05)] transition hover:-translate-y-1 hover:shadow-[0_20px_40px_-22px_rgba(26,22,15,0.45)] md:grid-cols-[minmax(280px,420px)_1fr]"
          >
            <div className="relative min-h-[230px] overflow-hidden bg-[#f5f5f7] md:min-h-[310px]">
              <img
                src="/uploads/tmp-final-base.jpg"
                alt="Microsoft Word 教程封面"
                className="h-full w-full object-cover transition duration-500 group-hover:scale-[1.03]"
              />
              <div className="absolute left-4 top-4 rounded-full bg-white/20 px-3 py-1 font-mono text-[11px] uppercase text-white backdrop-blur">
                Word
              </div>
            </div>

            <div className="flex min-h-[300px] flex-col justify-between gap-8 p-6 sm:p-8 lg:p-10">
              <div>
                <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-[#11567f]/15 bg-[#11567f]/5 px-3 py-1 text-xs font-bold text-[#11567f]">
                  <BookOpen className="h-4 w-4" />
                  入门基础 · 完整教程
                </div>

                <h2 className="max-w-3xl font-serif text-3xl font-black leading-tight text-[#1a160f] sm:text-4xl">
                  Word 软件使用全攻略教程
                </h2>

                <p className="mt-5 max-w-2xl text-base leading-8 text-[#4a443b]">
                  从基础编辑、格式排版、样式目录到邮件合并、论文报告和职场文档，把 Word
                  常用功能按真实使用流程讲清楚。
                </p>
              </div>

              <div className="flex flex-wrap items-center justify-between gap-4 border-t border-[#211e19]/10 pt-5">
                <div className="flex flex-wrap gap-2 text-xs font-medium text-[#4a443b]">
                  <span className="rounded-full bg-[#f5f5f7] px-3 py-1">排版教程</span>
                  <span className="rounded-full bg-[#f5f5f7] px-3 py-1">论文报告</span>
                  <span className="rounded-full bg-[#f5f5f7] px-3 py-1">职场文档</span>
                </div>
                <span className="inline-flex items-center gap-2 text-sm font-bold text-[#11567f]">
                  阅读全文
                  <ArrowRight className="h-4 w-4 transition group-hover:translate-x-1" />
                </span>
              </div>
            </div>
          </Link>
        </section>

        <aside className="space-y-7 lg:sticky lg:top-24">
          <section className="border border-[#211e19]/10 bg-white p-6">
            <h2 className="font-serif text-lg font-black text-[#1a160f]">
              教程目录
            </h2>
            <div className="mt-5 space-y-3 text-sm text-[#4a443b]">
              {['入门基础', '排版教程', '论文与报告', '职场文档', '宏与自动化', '常见问题'].map(
                (item) => (
                  <Link
                    href="/word-tutorial/"
                    key={item}
                    className="flex items-center justify-between border-b border-[#211e19]/10 pb-3 transition last:border-b-0 last:pb-0 hover:text-[#11567f]"
                  >
                    <span>{item}</span>
                    <ArrowRight className="h-4 w-4" />
                  </Link>
                )
              )}
            </div>
          </section>

          <section className="bg-[#0d2a45] p-6 text-white">
            <p className="font-mono text-xs text-[#29b5e8]">TYLER BLOG</p>
            <h2 className="mt-3 font-serif text-xl font-black">
              Word 教程专题
            </h2>
            <p className="mt-3 text-sm leading-7 text-white/75">
              首页保留一个明确入口，点击封面卡片进入完整教程正文。
            </p>
          </section>
        </aside>
      </div>

      <footer className="border-t border-[#211e19]/10 bg-white px-6 py-8 text-sm text-[#797266] sm:px-10">
        <div className="mx-auto flex max-w-[1480px] flex-wrap items-center justify-between gap-4">
          <span>Tyler博客</span>
          <span className="font-mono text-xs">本站内容独立编写整理，非 Microsoft 官方文档</span>
        </div>
      </footer>
    </main>
  )
}
