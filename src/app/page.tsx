import Link from 'next/link'
import { ArrowRight, BookOpen, FileText, Layers, Search, Sparkles } from 'lucide-react'

const featuredPosts = [
  {
    href: '/word-tutorial/',
    title: 'Word 从入门到精通教程',
    desc: '使用你提供的新页面设计，覆盖 Word 基础、排版、论文报告、职场文档和常见问题。',
    category: 'Word 教程',
    meta: '完整教程',
    accent: 'bg-blue-700',
  },
  {
    href: '/tutorials/word',
    title: 'Word 分章节阅读版',
    desc: '按章节查看旧版结构化内容，适合快速跳到某一章继续学习。',
    category: '章节目录',
    meta: '8 章内容',
    accent: 'bg-emerald-600',
  },
  {
    href: '/tutorials/excel',
    title: 'Excel 教程',
    desc: '保留 Excel 教程入口，后续可以继续扩展表格、函数和数据处理文章。',
    category: 'Excel 教程',
    meta: '待扩展',
    accent: 'bg-amber-500',
  },
]

const recentPosts = [
  { href: '/word-tutorial/#basics', title: 'Word 入门基础', tag: '基础' },
  { href: '/word-tutorial/#format', title: 'Word 排版教程', tag: '排版' },
  { href: '/word-tutorial/#thesis', title: '论文与报告排版', tag: '场景' },
  { href: '/word-tutorial/#workplace', title: '职场文档实战', tag: '办公' },
  { href: '/word-tutorial/#faq', title: 'Word 常见问题', tag: '问答' },
]

export default function HomePage() {
  return (
    <main className="min-h-screen bg-[#f6f7f4] text-stone-950">
      <header className="border-b border-stone-200 bg-white">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-4">
          <Link href="/" className="flex items-center gap-2 text-lg font-black">
            <BookOpen className="h-5 w-5 text-blue-700" />
            ZZGCopilot
          </Link>
          <nav className="flex items-center gap-5 text-sm font-medium text-stone-600">
            <Link href="/" className="text-stone-950">文章列表</Link>
            <Link href="/word-tutorial/" className="hover:text-blue-700">Word 教程</Link>
            <Link href="/login" className="hidden hover:text-blue-700 sm:inline">登录</Link>
          </nav>
        </div>
      </header>

      <section className="border-b border-stone-200 bg-[#fffdf7]">
        <div className="mx-auto max-w-6xl px-4 py-10">
          <div className="flex max-w-3xl flex-col gap-4">
            <p className="inline-flex w-fit items-center gap-2 border border-stone-300 bg-white px-3 py-1 text-xs font-bold uppercase tracking-wider text-stone-600">
              <Sparkles className="h-4 w-4 text-blue-700" />
              Tutorials and articles
            </p>
            <h1 className="text-4xl font-black leading-tight tracking-normal sm:text-5xl">
              文章列表
            </h1>
            <p className="text-lg leading-8 text-stone-600">
              首页先展示教程文章入口。你提供的新 Word 教程已经放在列表第一项，点击后进入完整 Word 教程页面。
            </p>
          </div>
        </div>
      </section>

      <section className="mx-auto grid max-w-6xl gap-8 px-4 py-10 lg:grid-cols-[1fr_320px]">
        <div>
          <div className="mb-5 flex items-center justify-between gap-4">
            <div>
              <h2 className="text-2xl font-black">推荐教程</h2>
              <p className="mt-1 text-sm text-stone-600">从这里进入不同文章与教程页面。</p>
            </div>
            <Search className="h-5 w-5 text-stone-400" />
          </div>

          <div className="grid gap-4">
            {featuredPosts.map((post) => (
              <Link
                key={post.href}
                href={post.href}
                className="group grid gap-5 border border-stone-200 bg-white p-5 transition hover:border-blue-300 hover:shadow-md sm:grid-cols-[12px_1fr_auto]"
              >
                <span className={`${post.accent} hidden h-full min-h-28 w-3 sm:block`} />
                <div>
                  <div className="mb-3 flex flex-wrap items-center gap-2">
                    <span className="border border-stone-200 px-2 py-1 text-xs font-bold text-stone-600">
                      {post.category}
                    </span>
                    <span className="text-xs text-stone-500">{post.meta}</span>
                  </div>
                  <h3 className="text-xl font-black group-hover:text-blue-700">{post.title}</h3>
                  <p className="mt-2 max-w-2xl leading-7 text-stone-600">{post.desc}</p>
                </div>
                <div className="flex items-center gap-2 text-sm font-bold text-blue-700">
                  阅读
                  <ArrowRight className="h-4 w-4 transition group-hover:translate-x-1" />
                </div>
              </Link>
            ))}
          </div>
        </div>

        <aside className="space-y-5">
          <div className="border border-stone-200 bg-white p-5">
            <div className="mb-4 flex items-center gap-2">
              <Layers className="h-5 w-5 text-blue-700" />
              <h2 className="font-black">Word 教程目录</h2>
            </div>
            <div className="space-y-2">
              {recentPosts.map((post) => (
                <Link
                  key={post.href}
                  href={post.href}
                  className="flex items-center justify-between border-b border-stone-100 py-3 text-sm last:border-b-0 hover:text-blue-700"
                >
                  <span className="font-medium">{post.title}</span>
                  <span className="text-xs text-stone-500">{post.tag}</span>
                </Link>
              ))}
            </div>
          </div>

          <div className="border border-stone-200 bg-[#1f2937] p-5 text-white">
            <FileText className="mb-4 h-6 w-6 text-sky-300" />
            <h2 className="text-lg font-black">页面结构已调整</h2>
            <p className="mt-2 text-sm leading-6 text-stone-200">
              首页是文章列表页，Word 教程作为列表中的独立页面入口，不再直接占用首页。
            </p>
          </div>
        </aside>
      </section>
    </main>
  )
}
