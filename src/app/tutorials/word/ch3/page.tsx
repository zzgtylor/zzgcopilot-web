// @ts-nocheck
import Link from 'next/link'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: "第3章 文本录入与基础编辑 - Word 从入门到精通",
  description: "从光标操作、插入与改写、撤销重做，到文本选择的全套方法、剪贴板与粘贴选项，再到查找替换与通配符，打牢日常编辑的核心功底。",
}

const data = {"meta":{"n":3,"prev":"ch2","next":"ch4","part":"第一篇 · 基础入门","title":"文本录入与基础编辑","subtitle":"从光标操作、插入与改写、撤销重做，到文本选择的全套方法、剪贴板与粘贴选项，再到查找替换与通配符，打牢日常编辑的核心功底。"},"sections":[{"title":"文本输入与光标操作","blocks":[{"type":"concept","text":"点击文档任意位置即可定位光标并开始输入。熟练的光标移动几乎全靠键盘完成，能极大提升编辑速度。\n常用光标移动键：Home/End 跳到行首/行尾；Ctrl+Home/Ctrl+End 跳到文档开头/结尾；Ctrl+←/→ 按词左右跳转；Page Up/Page Down 上下翻页。\n输入中文时可借助输入法的简拼、词组联想；特殊符号通过\"插入 → 符号\"调出，也可用输入法自带的符号面板。"},{"type":"steps","title":"高效定位与跳转","steps":["把光标放到段落中间，按 End 观察光标跳到行尾，按 Home 跳回行首。","按住 Ctrl 不放，连续按 → ，感受光标\"按词\"而非\"按字\"跳跃。","按 Ctrl+End 直达文档末尾，再按 Ctrl+Home 一键返回开头——长文档导航尤其有用。"]},{"type":"tip","text":"记不清某段在哪？按 Ctrl+F 打开导航窗格搜索关键词，或用\"视图 → 导航窗格\"按标题跳转，比滚动鼠标快得多。"}]},{"title":"插入模式与改写模式","blocks":[{"type":"concept","text":"Word 默认处于\"插入\"模式：新输入的文字会插入到光标处，后方文字依次后移。按 Insert 键可切换到\"改写\"模式：新输入的内容会逐字覆盖光标右侧已有的文字。改写模式在多数情况下是误触造成的麻烦来源。"},{"type":"pitfall","text":"如果你发现\"打字时后面的字莫名其妙被吃掉/替换了\"，几乎可以肯定是误按 Insert 进入了改写模式。再按一次 Insert 切回插入模式即可。可在\"文件 → 选项 → 高级\"中取消\"用 Insert 键控制改写模式\"，彻底杜绝误触。"}]},{"title":"撤销、重做与重复","blocks":[{"type":"concept","text":"Ctrl+Z 撤销上一步操作，可连续按多次逐级回退；Ctrl+Y 重做（恢复被撤销的操作）；此外 Ctrl+Y 在没有可重做内容时会执行\"重复上一操作\"（如刚设置了某段加粗，选中另一段按 Ctrl+Y 即可重复加粗）。快速访问工具栏上的撤销按钮旁有下拉箭头，可一次性撤销到指定的某一步。"},{"type":"tip","text":"F4 是\"重复上一操作\"的专用键，配合选区使用极为高效：例如给一处文字设好\"小四号+蓝色+加粗\"后，选中其他文字连续按 F4，即可逐一套用同样的设置。"}]},{"title":"文本选择的全套方法","blocks":[{"type":"concept","text":"选择是编辑的前提，掌握全套选择技巧能省下大量时间。\n【鼠标】单击定位；双击选中一个词；三击选中整段；在行首空白区（鼠标变为右向箭头）单击选整行、双击选整段、三击选全文。\n【键盘】Shift+方向键逐字/行扩展；Shift+Ctrl+方向键逐词/段扩展；Shift+Home/End 选到行首/行尾；Shift+Ctrl+Home/End 选到文档头/尾；Ctrl+A 全选。\n【不连续选择】按住 Ctrl 用鼠标分别拖选多处不相邻内容，可统一设置格式。\n【相似格式】右键 →\"选择所有格式类似的文本\"，一次选中全文同格式段落。"},{"type":"case","title":"案例：一次性把全文所有\"图注\"统一改大一号","text":"文档里散落着几十处图片下方的图注，格式相同但当前偏小。\n做法：先选中其中一处图注文字，右键 →\"选择格式类似的文本\"，Word 立即选中全文所有同格式的图注；此时统一调整字号、颜色即可一步到位，无需逐个查找。"},{"type":"tip","text":"按 Ctrl+Shift+F8 进入\"列选择（块选择）\"模式，再用方向键可竖向选取矩形文本块，非常适合处理对齐的编号、代码或表格式纯文本。"}]},{"title":"剪贴板与粘贴选项","blocks":[{"type":"concept","text":"Ctrl+X 剪切、Ctrl+C 复制、Ctrl+V 粘贴是基础。真正的关键在\"粘贴选项\"——粘贴后内容右下角会出现一个按钮（或按 Ctrl 调出），提供三种模式：\n①保留源格式：原样保留来源的字体、颜色、字号，可能破坏目标文档的统一性；\n②合并格式：保留加粗/斜体等基本强调，字体颜色随目标文档；\n③仅保留文本：去除一切格式，按目标位置当前样式呈现，正式文档写作最常用。\nOffice 剪贴板（\"开始 → 剪贴板\"组的对话框启动器）可保存最近 24 次复制内容，按需选择性粘贴。"},{"type":"steps","title":"从网页/其他文档干净地粘贴文字","steps":["复制来源文字（Ctrl+C）。","在 Word 中定位光标，点击\"开始 → 粘贴\"下方的小箭头。","在弹出的粘贴选项中选择\"仅保留文本\"（图标为带字母 A 的剪贴板）。","文字即以目标文档当前样式干净地插入，不会带入网页的杂乱字体和底色。"]},{"type":"pitfall","text":"直接 Ctrl+V 从网页粘贴，常把网页的字体、字号、背景色甚至超链接一并带入，导致文档格式混乱、体积变大。正式写作时养成\"选择性粘贴 → 仅保留文本\"的习惯，可在\"文件 → 选项 → 高级\"把跨文档粘贴默认设为\"仅保留文本\"。"}]},{"title":"查找与替换、通配符","blocks":[{"type":"concept","text":"Ctrl+F 打开导航窗格的\"查找\"，高亮所有匹配项；Ctrl+H 打开功能更全的\"查找和替换\"对话框。点对话框左下角\"更多\"可展开高级选项：区分大小写、全字匹配、使用通配符等。\n常用通配符与特殊字符：? 匹配任意单个字符，* 匹配任意多个字符，[a-z] 匹配范围，^p 段落标记，^t 制表符，^l 手动换行符。还可点\"格式\"按钮，把找到的文字替换为带特定格式（加粗/颜色/字号）的文字。"},{"type":"case","title":"案例：批量删除全文多余的空行","text":"从别处粘来的长文档里夹杂大量空行，手动删很慢。\n做法：Ctrl+H 打开替换，\"查找内容\"输入 ^p^p（两个连续段落标记），\"替换为\"输入 ^p（一个段落标记），点\"全部替换\"。重复执行几次，直到提示替换 0 处为止，多余空行即被压缩干净。处理手动换行符则用 ^l 替换为 ^p。"},{"type":"pitfall","text":"点\"全部替换\"前，强烈建议先用\"查找下一处\"逐个预览，确认匹配范围无误，避免一次误替换波及全文。使用通配符时其语法与标准正则略有差异，务必小范围测试后再全局执行。"},{"type":"tip","text":"替换框支持\"替换为格式\"：例如把全文所有\"注意：\"二字一次性替换为红色加粗的\"注意：\"，只需在\"替换为\"中输入文字后点\"格式 → 字体\"设定颜色与字形即可，实现内容与格式的批量统一。"}]}]}

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
