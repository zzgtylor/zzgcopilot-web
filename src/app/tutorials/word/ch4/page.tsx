// @ts-nocheck
import Link from 'next/link'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: "第4章 字符格式精讲 - Word 从入门到精通",
  description: "从字体与中西文搭配、字号字形，到字符间距与缩放、文字效果、突出显示与字符边框底纹，全面掌握\"字\"这一级的精细排版。",
}

const data = {"meta":{"n":4,"prev":"ch3","next":"ch5","part":"第二篇 · 排版核心","title":"字符格式精讲","subtitle":"从字体与中西文搭配、字号字形，到字符间距与缩放、文字效果、突出显示与字符边框底纹，全面掌握\"字\"这一级的精细排版。"},"sections":[{"title":"字体选择与中西文搭配","blocks":[{"type":"concept","text":"选中文字后，在\"开始 → 字体\"组或按 Ctrl+D 打开字体对话框设置。中西文搭配是专业排版的基本功：中文正文推荐\"宋体\"（传统正式）或\"微软雅黑\"（现代清晰）；英文与数字推荐衬线的\"Times New Roman\"（正式）或无衬线的\"Calibri\"\"Arial\"（现代）；标题可用更粗重的\"黑体\"\"华文中宋\"。\nWord 的字体对话框可分别指定\"中文字体\"和\"西文字体\"，从而让同一段中英混排时各用最合适的字体。"},{"type":"steps","title":"为正文设置中西文分离字体","steps":["选中正文，按 Ctrl+D 打开字体对话框。","在\"中文字体\"下拉中选择\"宋体\"。","在\"西文字体\"下拉中选择\"Times New Roman\"。","点击\"设为默认值\"，可让本设置应用到当前文档或基于的模板，后续输入自动遵循。"]},{"type":"tip","text":"与其每篇手动调字体，不如把中西文字体设定写进\"正文\"样式（见第6章），全文一处修改、处处更新，远比逐段设置高效且不易出错。"}]},{"title":"字号、字形与基础强调","blocks":[{"type":"concept","text":"字号参考：正文常用 5 号（10.5pt）或小四（12pt）；小标题用四号（14pt）或三号（16pt）；大标题用一号（26pt）或小初（36pt）。\n字形与强调快捷键：加粗 Ctrl+B（强调重点）、倾斜 Ctrl+I（术语/外来词）、下划线 Ctrl+U（可选直线/波浪/双线）、删除线（标记废弃内容）、上标 Ctrl+Shift+=（数学指数 x²）、下标 Ctrl+=（化学式 H₂O）。"},{"type":"pitfall","text":"强调要克制：满篇加粗、彩色、下划线齐上反而让人抓不到重点。专业文档通常只用一两种强调方式，且下划线在数字时代易与超链接混淆，正文中应慎用。"}]},{"title":"字符间距与缩放","blocks":[{"type":"concept","text":"在字体对话框的\"高级\"选项卡，可调整：【缩放】横向拉伸或压缩字符宽度（如 80%、120%）；【间距】加宽或紧缩字符之间的水平距离；【位置】把字符整体提升或降低（不同于上下标，不改变字号）。这些用于微调标题视觉张力或解决文字溢出。"},{"type":"case","title":"案例：让封面主标题更有气势","text":"封面主标题\"年度工作报告\"显得局促。\n做法：选中标题，Ctrl+D →\"高级\"→把\"间距\"设为\"加宽\"、磅值 2-3pt，字与字之间留出呼吸感；必要时再把\"缩放\"略微调整。加宽字间距是海报、封面标题常用的提气手法，但正文切勿加宽，否则影响阅读连贯性。"}]},{"title":"文字效果与艺术字","blocks":[{"type":"concept","text":"在\"开始 → 字体\"组的\"文本效果和版式\"（A 字带光晕的图标）或字体对话框的\"文字效果\"中，可为文字添加发光、阴影、映像、轮廓、填充渐变、三维等视觉效果，相当于把普通文字变为\"艺术字\"。适合封面、海报、宣传单的标题，正式公文正文则不宜使用。"},{"type":"tip","text":"文字效果虽炫，但用在正文会严重影响可读性和打印效果。把它限定在封面与标题，且同一文档保持风格统一，专业感才不会打折。"}]},{"title":"突出显示与字符边框底纹","blocks":[{"type":"concept","text":"【突出显示】\"开始 → 字体\"组的荧光笔图标，给文字加上类似马克笔的背景色，用于审阅时标记重点（屏幕醒目，但打印彩色才可见）。\n【字符边框/底纹】\"开始 → 字体\"组的\"字符边框（A 带方框）\"和\"字符底纹\"给选中文字加框或灰底，常用于强调短词。\n更精细的边框与底纹可在\"开始 → 段落 → 边框\"下拉 →\"边框和底纹\"对话框中设置，注意区分\"应用于：文字\"还是\"段落\"。"},{"type":"pitfall","text":"突出显示（荧光笔）属于\"审阅标记\"性质，正式定稿前应清除——选中全文后点突出显示下拉里的\"无颜色\"即可一次性去掉，避免把审阅痕迹随定稿一起发出去。"},{"type":"tip","text":"若要给一整块文字加底色或边框做\"提示框\"效果，应使用\"段落\"级的边框和底纹（应用于\"段落\"），这样边框会随段落宽度自适应，比逐字加底纹整齐得多。"}]}]}


const s = {
  page: { minHeight: '100vh', background: '#f0f4f8', fontFamily: "'PingFang SC','Microsoft YaHei','Segoe UI',sans-serif" },
  header: { background: 'linear-gradient(135deg,#1a56db 0%,#1e429f 100%)', color: '#fff', boxShadow: '0 2px 12px rgba(0,0,0,0.15)', position: 'sticky', top: 0, zIndex: 100 },
  headerInner: { maxWidth: 880, margin: '0 auto', padding: '14px 24px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' },
  breadcrumb: { display: 'flex', alignItems: 'center', gap: 8, fontSize: 13, flexWrap: 'wrap' },
  breadLink: { color: 'rgba(255,255,255,0.75)', textDecoration: 'none' },
  breadSep: { color: 'rgba(255,255,255,0.4)' },
  breadCurrent: { color: '#fff', fontWeight: 500 },
  backBtn: { color: '#fff', textDecoration: 'none', background: 'rgba(255,255,255,0.15)', padding: '6px 16px', borderRadius: 20, fontSize: 13, whiteSpace: 'nowrap' },
  hero: { background: 'linear-gradient(135deg,#1a56db 0%,#6366f1 100%)', color: '#fff', padding: '40px 24px 48px' },
  heroInner: { maxWidth: 880, margin: '0 auto' },
  heroPart: { fontSize: 13, opacity: 0.85, marginBottom: 8 },
  heroTitle: { fontSize: 34, fontWeight: 800, margin: '0 0 12px', letterSpacing: -0.5, lineHeight: 1.25 },
  heroDesc: { fontSize: 16, opacity: 0.92, lineHeight: 1.8, margin: 0 },
  content: { maxWidth: 880, margin: '0 auto', padding: '36px 24px 24px' },
  sectionCard: { background: '#fff', borderRadius: 18, boxShadow: '0 2px 12px rgba(0,0,0,0.06)', marginBottom: 28, overflow: 'hidden' },
  sectionHead: { padding: '20px 28px', borderBottom: '1px solid #f3f4f6', display: 'flex', alignItems: 'center', gap: 12 },
  sectionNum: { width: 32, height: 32, borderRadius: 9, background: '#1a56db', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 14, fontWeight: 800, flexShrink: 0 },
  sectionTitle: { fontSize: 18, fontWeight: 700, color: '#111827' },
  sectionBody: { padding: '8px 28px 24px' },
  blockConcept: { marginTop: 18 },
  blockLabel: { display: 'inline-block', fontSize: 12, fontWeight: 700, padding: '3px 12px', borderRadius: 20, marginBottom: 8 },
  para: { fontSize: 14.5, color: '#374151', lineHeight: 1.95, margin: '0 0 6px' },
  stepList: { margin: '6px 0 0', padding: 0, listStyle: 'none' },
  stepItem: { position: 'relative', paddingLeft: 38, marginBottom: 12, fontSize: 14.5, color: '#374151', lineHeight: 1.85 },
  stepNum: { position: 'absolute', left: 0, top: 1, width: 26, height: 26, borderRadius: '50%', background: '#dbeafe', color: '#1e40af', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 13, fontWeight: 800 },
  caseBox: { background: '#eff6ff', border: '1px solid #bfdbfe', borderRadius: 12, padding: '14px 18px', marginTop: 6 },
  caseTitle: { fontSize: 13, fontWeight: 700, color: '#1e40af', marginBottom: 6 },
  tipBox: { background: '#f0fdf4', border: '1px solid #bbf7d0', borderRadius: 12, padding: '14px 18px', marginTop: 6, fontSize: 14, color: '#166534', lineHeight: 1.85 },
  warnBox: { background: '#fffbeb', border: '1px solid #fde68a', borderRadius: 12, padding: '14px 18px', marginTop: 6, fontSize: 14, color: '#92400e', lineHeight: 1.85 },
  nav: { maxWidth: 880, margin: '0 auto', padding: '12px 24px 60px', display: 'flex', justifyContent: 'space-between', gap: 12, flexWrap: 'wrap' },
  navBtn: { flex: '1 1 30%', minWidth: 140, padding: '14px 18px', background: '#fff', borderRadius: 14, boxShadow: '0 2px 8px rgba(0,0,0,0.06)', textDecoration: 'none', color: '#1a56db', fontWeight: 600, fontSize: 14, textAlign: 'center', border: '1px solid #e5e7eb' },
  navBtnMid: { flex: '1 1 30%', minWidth: 140, padding: '14px 18px', background: '#1a56db', borderRadius: 14, textDecoration: 'none', color: '#fff', fontWeight: 700, fontSize: 14, textAlign: 'center' },
  footer: { borderTop: '1px solid #e5e7eb', background: '#fff', padding: '24px', textAlign: 'center', color: '#9ca3af', fontSize: 13 },
}

const labelStyle = {
  concept: { background: '#ede9fe', color: '#6d28d9' },
  steps: { background: '#dbeafe', color: '#1e40af' },
  case: { background: '#cffafe', color: '#0e7490' },
  pitfall: { background: '#fee2e2', color: '#b91c1c' },
  tip: { background: '#dcfce7', color: '#166534' },
}
const labelText = { concept: '概念原理', steps: '操作步骤', case: '实战案例', pitfall: '常见错误与避坑', tip: '进阶技巧' }

function Block({ b }) {
  if (b.type === 'steps') {
    return (
      <div style={s.blockConcept}>
        <span style={{...s.blockLabel, ...labelStyle.steps}}>{labelText.steps}{b.title ? '：' + b.title : ''}</span>
        <ol style={s.stepList}>
          {b.steps.map((st, i) => (
            <li key={i} style={s.stepItem}><span style={s.stepNum}>{i + 1}</span>{st}</li>
          ))}
        </ol>
      </div>
    )
  }
  if (b.type === 'case') {
    return (
      <div style={s.blockConcept}>
        <span style={{...s.blockLabel, ...labelStyle.case}}>{labelText.case}</span>
        <div style={s.caseBox}>
          {b.title && <div style={s.caseTitle}>{b.title}</div>}
          {b.text.split('\n').map((p, i) => <p key={i} style={{...s.para, margin: i ? '8px 0 0' : 0}}>{p}</p>)}
        </div>
      </div>
    )
  }
  if (b.type === 'pitfall') {
    return (
      <div style={s.blockConcept}>
        <span style={{...s.blockLabel, ...labelStyle.pitfall}}>{labelText.pitfall}</span>
        <div style={s.warnBox}>{b.text}</div>
      </div>
    )
  }
  if (b.type === 'tip') {
    return (
      <div style={s.blockConcept}>
        <span style={{...s.blockLabel, ...labelStyle.tip}}>{labelText.tip}</span>
        <div style={s.tipBox}>{b.text}</div>
      </div>
    )
  }
  return (
    <div style={s.blockConcept}>
      <span style={{...s.blockLabel, ...labelStyle.concept}}>{labelText.concept}</span>
      {b.text.split('\n').map((p, i) => <p key={i} style={s.para}>{p}</p>)}
    </div>
  )
}

export default function ChapterPage() {
  const m = data.meta
  return (
    <div style={s.page}>
      <header style={s.header}>
        <div style={s.headerInner}>
          <div style={s.breadcrumb}>
            <Link href="/" style={s.breadLink}>ZZGCopilot</Link>
            <span style={s.breadSep}>/</span>
            <Link href="/tutorials/word" style={s.breadLink}>Word 教程</Link>
            <span style={s.breadSep}>/</span>
            <span style={s.breadCurrent}>第{m.n}章</span>
          </div>
          <Link href="/tutorials/word" style={s.backBtn}>≡ 返回目录</Link>
        </div>
      </header>

      <div style={s.hero}>
        <div style={s.heroInner}>
          <div style={s.heroPart}>{m.part}</div>
          <h1 style={s.heroTitle}>第{m.n}章　{m.title}</h1>
          <p style={s.heroDesc}>{m.subtitle}</p>
        </div>
      </div>

      <div style={s.content}>
        {data.sections.map((sec, si) => (
          <section key={si} style={s.sectionCard}>
            <div style={s.sectionHead}>
              <div style={s.sectionNum}>{m.n}.{si + 1}</div>
              <div style={s.sectionTitle}>{sec.title}</div>
            </div>
            <div style={s.sectionBody}>
              {sec.blocks.map((b, bi) => <Block key={bi} b={b} />)}
            </div>
          </section>
        ))}
      </div>

      <nav style={s.nav}>
        {m.prev ? <Link href={"/tutorials/word/" + m.prev} style={s.navBtn}>← 上一章</Link> : <span style={{...s.navBtn, color:'#cbd5e1'}}>已是第一章</span>}
        <Link href="/tutorials/word" style={s.navBtnMid}>返回目录</Link>
        {m.next ? <Link href={"/tutorials/word/" + m.next} style={s.navBtn}>下一章 →</Link> : <span style={{...s.navBtn, color:'#cbd5e1'}}>已是最后一章</span>}
      </nav>

      <footer style={s.footer}>
        <p>© {new Date().getFullYear()} ZZGCopilot · Word 从入门到精通（完整版）· 第{m.n}章</p>
      </footer>
    </div>
  )
}
