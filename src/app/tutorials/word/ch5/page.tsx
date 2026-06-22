// @ts-nocheck
import Link from 'next/link'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: "第5章 段落格式精讲 - Word 从入门到精通",
  description: "段落是 Word 排版的基本单位。掌握对齐、缩进、行距段距、项目符号与编号、多级列表、制表位、段落边框底纹，让版面规整专业。",
}

const data = {"meta":{"n":5,"prev":"ch4","next":"ch6","part":"第二篇 · 排版核心","title":"段落格式精讲","subtitle":"段落是 Word 排版的基本单位。掌握对齐、缩进、行距段距、项目符号与编号、多级列表、制表位、段落边框底纹，让版面规整专业。"},"sections":[{"title":"对齐方式与段落标记","blocks":[{"type":"concept","text":"每个段落末尾都有一个不可见的段落标记（¶），它存储着该段的全部段落格式。按 Ctrl+Shift+8 可显示/隐藏所有格式标记，排版排查时务必打开。\n五种对齐：左对齐 Ctrl+L（正文标准）；居中 Ctrl+E（标题、标语）；右对齐 Ctrl+R（日期、签名、金额）；两端对齐 Ctrl+J（正式文档正文，使左右边界整齐）；分散对齐（文字均匀铺满整行，适合较短的单行标题）。"},{"type":"pitfall","text":"删除段落标记（¶）会把两段合并并使后段继承前段格式，常导致格式突变。看不见标记就误删是常见事故，养成开启\"显示格式标记\"的习惯能避免大量莫名其妙的格式问题。"}]},{"title":"缩进的正确设置","blocks":[{"type":"concept","text":"缩进控制段落相对页边距的水平位置。【首行缩进】首行向内缩（中文正文规范为首行缩进 2 字符）；【悬挂缩进】首行不缩、其余行缩进（用于参考文献、词条释义）；【左/右缩进】整段两侧内移（用于引用块）。在\"段落\"对话框（\"开始 → 段落\"组右下角箭头）中精确设置。"},{"type":"steps","title":"为中文正文设置规范的首行缩进 2 字符","steps":["选中正文段落，点击\"开始 → 段落\"组右下角的小箭头打开段落对话框。","在\"缩进\"区找到\"特殊格式\"下拉，选择\"首行缩进\"。","右侧\"缩进值\"选择\"2 字符\"。","点击确定。此后该段首行自动内缩两个汉字宽度，无需手动敲空格。"]},{"type":"pitfall","text":"绝对不要用空格或 Tab 来做首行缩进！一旦更换字体、字号或纸张，空格缩进就会错位，全文歪歪扭扭。务必用\"段落 → 首行缩进\"，它以\"字符\"为单位自适应。"}]},{"title":"行距与段落间距","blocks":[{"type":"concept","text":"【行距】段内行与行的垂直距离，Ctrl+1/Ctrl+2/Ctrl+5 快速设为单倍/двойной/1.5 倍；在段落对话框还可选\"固定值\"（不随字号变化，适合表格对齐）或\"最小值\"（可随更大字号自动撑开）。【段前/段后间距】段落之间的留白，标题常设段前 12pt、段后 6pt。"},{"type":"tip","text":"控制段落之间的空隙，应使用\"段后间距\"而非敲多个回车。用空段落撑间距在增删内容后极易错乱，而段后间距是段落属性，永远精确、可一键全局调整（配合样式更佳）。"}]},{"title":"项目符号与编号","blocks":[{"type":"concept","text":"【项目符号】无序要点，\"开始 → 段落\"组的项目符号按钮，下拉可选圆点、方块、自定义图片符号；输入\"*\"或\"-\"后空格也会自动转为列表。【编号】有序步骤，可选 1.2.3./ a.b.c./ i.ii.iii./ 一、二、三、等；Word 会自动连续编号，中间增删项会自动重排。"},{"type":"pitfall","text":"自动编号有时会\"接续上一个列表\"或\"重新从 1 开始\"出乎意料。此时在编号上右键，选\"重新开始编号\"或\"继续编号\"即可纠正，不要靠手动输入数字（手动数字不会自动更新）。"}]},{"title":"多级列表","blocks":[{"type":"concept","text":"多级列表用于提纲式结构（如 1 → 1.1 → 1.1.1）。点击\"开始 → 段落 → 多级列表\"选择样式后，在列表中按 Tab 降一级、Shift+Tab 升一级。在\"定义新的多级列表\"中可深度自定义每级的编号格式、缩进，并把各级与\"标题1/2/3\"样式绑定——这正是实现\"标题自动编号 + 自动目录\"的关键基础。"},{"type":"case","title":"案例：让章节标题自动带上\"第X章 / X.Y\"编号","text":"希望全文标题自动编号，新增章节时编号自动顺延。\n做法：\"开始 → 多级列表 → 定义新的多级列表\"，在对话框点\"更多\"，把级别 1 链接到\"标题 1\"样式、级别 2 链接到\"标题 2\"，并设定各级编号格式（如级别 1 为\"第 1 章\"、级别 2 为\"1.1\"）。绑定后，凡套用标题样式的段落都会自动获得正确编号，增删章节时全文编号一键重排。"},{"type":"tip","text":"多级列表与标题样式绑定是 Word 长文档的\"内功心法\"。一旦建立，章节编号、自动目录、交叉引用就能全部联动自动化，这也是区分 Word 新手与高手的分水岭。"}]},{"title":"制表位与段落边框底纹","blocks":[{"type":"concept","text":"【制表位（Tab 停靠点）】按 Tab 键时光标跳到的预设位置，可在标尺上单击设置，或在\"段落 → 制表位\"对话框中精确定义类型（左/右/居中/小数点对齐）和前导符（如目录里的小圆点）。适合制作不用表格的对齐排版（如名册、目录行）。\n【段落边框与底纹】\"开始 → 段落 → 边框\"下拉 →\"边框和底纹\"，应用于\"段落\"时可给整段加框或底色，制作提示框、引用块。"},{"type":"tip","text":"制作\"左侧姓名、右侧分数\"这类两端对齐的名单时，设置一个\"右对齐制表位\"并配小数点对齐，比拉表格或敲空格优雅得多，且打印对齐严丝合缝。"}]}]}


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
