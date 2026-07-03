import Link from 'next/link'
import { BookOpen, CheckCircle2, FileText, ListChecks, Monitor, PenTool, Search, Sparkles, Table2 } from 'lucide-react'

const chapters = [
  { href: '/tutorials/word/ch1', title: '初识 Word 与工作环境', desc: '认识版本差异、功能区、状态栏、视图模式与常用设置。', icon: Monitor },
  { href: '/tutorials/word/ch2', title: '文字输入与编辑技巧', desc: '掌握选择、复制粘贴、查找替换、撤销恢复等高频操作。', icon: PenTool },
  { href: '/tutorials/word/ch3', title: '字体格式精讲', desc: '系统理解字体、字号、颜色、间距、上标下标与清除格式。', icon: Sparkles },
  { href: '/tutorials/word/ch4', title: '样式、主题与目录', desc: '用样式管理长文档，自动生成目录、题注与交叉引用。', icon: ListChecks },
  { href: '/tutorials/word/ch5', title: '段落格式精讲', desc: '设置对齐、缩进、行距、编号、多级列表和制表位。', icon: FileText },
  { href: '/tutorials/word/ch6', title: '表格制作与数据呈现', desc: '创建规范表格，处理合并、边框、底纹、排序与公式。', icon: Table2 },
]

const outcomes = [
  '从零认识 Word 界面，不再到处找按钮',
  '把合同、报告、论文排成统一的专业版式',
  '用样式、目录和编号维护长文档',
  '处理图片、表格、页眉页脚与页码难题',
  '掌握批注、修订、版本和对外发布前检查',
]

export default function HomePage() {
  return (
    <main className="min-h-screen bg-[#f5f7fb] text-slate-950">
      <header className="sticky top-0 z-20 border-b border-slate-200 bg-white/95 backdrop-blur">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-4">
          <Link href="/" className="flex items-center gap-2 text-lg font-bold">
            <BookOpen className="h-5 w-5 text-blue-700" />
            ZZGCopilot Word 教程
          </Link>
          <nav className="flex items-center gap-4 text-sm text-slate-600">
            <Link href="/tutorials/word" className="hover:text-blue-700">目录</Link>
            <Link href="/tutorials/word/ch1" className="hidden hover:text-blue-700 sm:inline">开始学习</Link>
            <Link href="/login" className="hidden hover:text-blue-700 sm:inline">登录</Link>
          </nav>
        </div>
      </header>

      <section className="border-b border-slate-200 bg-white">
        <div className="mx-auto grid max-w-6xl gap-10 px-4 py-12 lg:grid-cols-[1.05fr_0.95fr] lg:items-center lg:py-16">
          <div>
            <p className="mb-4 inline-flex items-center gap-2 rounded-full border border-blue-200 bg-blue-50 px-3 py-1 text-sm font-medium text-blue-800">
              <Sparkles className="h-4 w-4" />
              Microsoft Word 从入门到精通
            </p>
            <h1 className="max-w-3xl text-4xl font-black leading-tight tracking-normal text-slate-950 sm:text-5xl">
              一套真正能照着做的 Word 使用教程
            </h1>
            <p className="mt-5 max-w-2xl text-lg leading-8 text-slate-600">
              面向办公、论文、报告、合同和日常文档排版，按“概念解释、操作步骤、实战案例、常见错误”组织内容。打开 Word 跟着做，就能把零散功能变成稳定能力。
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Link href="/tutorials/word/ch1" className="inline-flex items-center gap-2 rounded-lg bg-blue-700 px-5 py-3 text-sm font-bold text-white shadow-sm transition hover:bg-blue-800">
                <BookOpen className="h-4 w-4" />
                从第 1 章开始
              </Link>
              <Link href="/tutorials/word" className="inline-flex items-center gap-2 rounded-lg border border-slate-300 bg-white px-5 py-3 text-sm font-bold text-slate-800 transition hover:border-blue-300 hover:text-blue-700">
                <Search className="h-4 w-4" />
                查看完整目录
              </Link>
            </div>
          </div>

          <div className="rounded-lg border border-slate-200 bg-slate-50 p-5">
            <div className="rounded-md bg-white p-5 shadow-sm">
              <div className="mb-4 flex items-center justify-between border-b border-slate-200 pb-3">
                <span className="text-sm font-bold text-slate-500">课程结构</span>
                <span className="rounded bg-blue-50 px-2 py-1 text-xs font-bold text-blue-700">8 章 / 37 个知识点</span>
              </div>
              <div className="space-y-3">
                {['基础入门', '文字编辑', '格式排版', '长文档', '表格图片', '协作发布'].map((item, index) => (
                  <div key={item} className="flex items-center gap-3">
                    <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded bg-slate-100 text-sm font-bold text-slate-700">{index + 1}</span>
                    <div className="h-2 flex-1 rounded bg-slate-100">
                      <div className="h-2 rounded bg-blue-600" style={{ width: `${86 - index * 8}%` }} />
                    </div>
                    <span className="w-20 text-sm font-medium text-slate-700">{item}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-4 py-12">
        <h2 className="text-2xl font-black text-slate-950">学习路径</h2>
        <p className="mt-2 text-slate-600">按章节推进，也可以直接进入你当前最需要解决的问题。</p>
        <div className="mt-6 grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {chapters.map((chapter) => {
            const Icon = chapter.icon
            return (
              <Link key={chapter.title} href={chapter.href} className="group rounded-lg border border-slate-200 bg-white p-5 transition hover:border-blue-300 hover:shadow-md">
                <Icon className="mb-4 h-6 w-6 text-blue-700" />
                <h3 className="text-base font-bold text-slate-950 group-hover:text-blue-700">{chapter.title}</h3>
                <p className="mt-2 text-sm leading-6 text-slate-600">{chapter.desc}</p>
              </Link>
            )
          })}
        </div>
      </section>

      <section className="border-y border-slate-200 bg-white">
        <div className="mx-auto grid max-w-6xl gap-8 px-4 py-12 md:grid-cols-[0.8fr_1.2fr] md:items-center">
          <div>
            <h2 className="text-2xl font-black">学完能解决什么</h2>
            <p className="mt-3 leading-7 text-slate-600">这不是按钮清单，而是围绕真实文档任务整理的教程：写得出、排得齐、改得快、交付稳。</p>
          </div>
          <div className="grid gap-3 sm:grid-cols-2">
            {outcomes.map((item) => (
              <div key={item} className="flex gap-3 rounded-md bg-slate-50 p-4">
                <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0 text-emerald-600" />
                <span className="text-sm leading-6 text-slate-700">{item}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      <footer className="mx-auto max-w-6xl px-4 py-8 text-sm text-slate-500">
        © {new Date().getFullYear()} ZZGCopilot · Word 使用教程
      </footer>
    </main>
  )
}
