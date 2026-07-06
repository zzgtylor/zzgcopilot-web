import Link from 'next/link'
import { ArrowRight, BookOpen, Search } from 'lucide-react'

const topics = ['排版基础', '论文报告', '目录页码', '职场文档']

export default function HomePage() {
  return (
    <main className="min-h-screen bg-[#f8f9fa] text-[#211e19]">
      <header className="border-b border-[#211e19]/10 bg-white">
        <div className="mx-auto flex max-w-[1180px] items-center justify-between gap-5 px-5 py-4 sm:px-8">
          <Link href="/" className="font-serif text-3xl font-black leading-none text-[#211e19]">
            Tyler博客
          </Link>

          <nav className="hidden items-center gap-7 text-sm font-medium text-[#5f584f] md:flex">
            <Link href="/" className="text-[#11567f]">
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
          </nav>

          <Link
            href="/word-tutorial/"
            className="hidden h-10 items-center gap-2 rounded-sm bg-[#11567f] px-4 text-sm font-semibold text-white transition hover:bg-[#0d2a45] sm:inline-flex"
          >
            <BookOpen className="h-4 w-4" />
            Word 教程
          </Link>
        </div>
      </header>

      <section className="mx-auto grid max-w-[1180px] gap-9 px-5 py-8 sm:px-8 lg:grid-cols-[1fr_300px] lg:py-10">
        <div>
          <div className="mb-5 flex items-end justify-between gap-4">
            <div>
              <p className="mb-2 font-mono text-xs font-semibold uppercase tracking-[0.14em] text-[#11567f]">
                Tyler Blog
              </p>
              <h1 className="font-serif text-3xl font-black leading-tight text-[#1a160f] sm:text-4xl">
                最新教程
              </h1>
            </div>
            <span className="hidden text-sm text-[#8a8174] sm:block">Word 专题更新</span>
          </div>

          <Link
            href="/word-tutorial/"
            className="group grid overflow-hidden rounded-md border border-[#211e19]/10 bg-white shadow-[0_10px_35px_rgba(25,22,17,0.08)] transition hover:-translate-y-0.5 hover:shadow-[0_18px_45px_rgba(25,22,17,0.14)] md:grid-cols-[minmax(260px,390px)_1fr]"
          >
            <div className="relative min-h-[230px] bg-[#eef2f4] md:min-h-[330px]">
              <img
                src="/uploads/tmp-final-base.jpg"
                alt="Word 教程封面"
                className="h-full w-full object-cover"
                loading="eager"
              />
              <span className="absolute left-4 top-4 rounded-full bg-white/90 px-3 py-1 text-xs font-bold text-[#11567f] shadow-sm">
                Word
              </span>
            </div>

            <article className="flex min-h-[300px] flex-col justify-between gap-8 p-6 sm:p-8">
              <div>
                <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-[#11567f]/20 bg-[#11567f]/5 px-3 py-1 text-xs font-bold text-[#11567f]">
                  <BookOpen className="h-4 w-4" />
                  入门基础 · 完整教程
                </div>
                <h2 className="max-w-2xl font-serif text-3xl font-black leading-tight text-[#1a160f] sm:text-4xl">
                  Word 软件使用全攻略教程
                </h2>
                <p className="mt-5 max-w-2xl text-base leading-8 text-[#4a443b]">
                  从基础编辑、格式排版、样式目录到页眉页脚、目录页码和职场文档，一次把
                  Word 常用流程讲清楚。
                </p>
              </div>

              <div className="flex flex-wrap items-center justify-between gap-4 border-t border-[#211e19]/10 pt-5">
                <div className="flex flex-wrap gap-2">
                  {topics.map((topic) => (
                    <span
                      className="rounded-full bg-[#f1f3f4] px-3 py-1 text-xs font-medium text-[#5f584f]"
                      key={topic}
                    >
                      {topic}
                    </span>
                  ))}
                </div>
                <span className="inline-flex items-center gap-2 text-sm font-bold text-[#11567f]">
                  阅读全文
                  <ArrowRight className="h-4 w-4 transition group-hover:translate-x-1" />
                </span>
              </div>
            </article>
          </Link>
        </div>

        <aside className="space-y-6">
          <div className="border border-[#211e19]/10 bg-white p-5">
            <label className="relative block">
              <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#9a9185]" />
              <input
                aria-label="搜索教程"
                className="h-10 w-full rounded-sm border border-[#211e19]/15 bg-white pl-9 pr-3 text-sm outline-none transition focus:border-[#11567f]"
                placeholder="搜索教程..."
                type="search"
              />
            </label>
          </div>

          <div className="border border-[#211e19]/10 bg-white p-6">
            <h2 className="font-serif text-xl font-black text-[#1a160f]">教程目录</h2>
            <div className="mt-5 space-y-3 text-sm text-[#4a443b]">
              {['Word 入门', '页面设置', '样式与目录', '页眉页脚', '图片表格', '打印导出'].map(
                (item) => (
                  <Link
                    href="/word-tutorial/"
                    className="flex items-center justify-between border-b border-[#211e19]/10 pb-3 transition last:border-b-0 last:pb-0 hover:text-[#11567f]"
                    key={item}
                  >
                    <span>{item}</span>
                    <ArrowRight className="h-4 w-4" />
                  </Link>
                )
              )}
            </div>
          </div>
        </aside>
      </section>
    </main>
  )
}
