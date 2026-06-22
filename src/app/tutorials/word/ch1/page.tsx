// @ts-nocheck
import Link from 'next/link'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: "第1章 初识 Word 与工作环境 - Word 从入门到精通",
  description: "认识 Word 的定位与版本，全面解剖工作界面，掌握功能区、快速访问工具栏、视图模式与个性化设置，为高效使用打下地基。",
}

const data = {"meta":{"n":1,"prev":null,"next":"ch2","part":"第一篇 · 基础入门","title":"初识 Word 与工作环境","subtitle":"认识 Word 的定位与版本，全面解剖工作界面，掌握功能区、快速访问工具栏、视图模式与个性化设置，为高效使用打下地基。"},"sections":[{"title":"Word 的定位与版本演进","blocks":[{"type":"concept","text":"Microsoft Word 是全球使用最广泛的文字处理软件，核心任务是\"创建、编辑、排版和分发以文字为主的文档\"，如报告、论文、合同、简历、书籍等。它与 Excel（电子表格，处理数据计算）、PowerPoint（演示文稿，处理幻灯片）共同构成 Office 套件的三大基石，各有分工。\nWord 的版本主要分两条线：一是随 Office 套件发布的桌面版（如 Word 2016/2019/2021，以及订阅制的 Microsoft 365，后者会持续获得新功能）；二是网页版 Word（Word for the web，浏览器中免费使用，功能较精简但便于协作）与移动版（手机/平板）。\n不同版本界面与功能略有差异，但\"功能区 + 文档区 + 状态栏\"的基本框架长期保持一致，因此掌握一个版本后切换其他版本几乎无障碍。本教程以桌面版（Microsoft 365 / 2021）为基准讲解，并在差异处特别说明。"},{"type":"tip","text":"如果你只是偶尔使用、或需要多人实时协作，网页版 Word 完全免费且自动保存到 OneDrive；若需要邮件合并、宏、复杂排版等高级功能，则必须使用桌面版。"}]},{"title":"工作界面全解剖","blocks":[{"type":"concept","text":"打开 Word 后，界面从上到下可分为若干功能区域，理解每一块的职责是高效操作的前提。\n【标题栏】窗口最顶部，居中显示当前文档名与程序名，最右侧是最小化、最大化/还原、关闭按钮。\n【快速访问工具栏（QAT）】标题栏左侧的一排小图标，默认有\"保存、撤销、重做\"，可自定义添加常用命令。\n【功能区（Ribbon）】最重要的操作区，以\"开始、插入、设计、布局、引用、邮件、审阅、视图\"等选项卡分类组织命令，每个选项卡内又分若干\"组\"。\n【文档编辑区】窗口主体的白色页面，是输入和排版内容的核心区域，配有水平/垂直标尺辅助对齐。\n【状态栏】窗口底部，实时显示页码、字数、语言、拼写检查状态等。\n【视图与缩放】状态栏右侧有视图切换按钮（阅读/页面/Web 版式）和缩放滑块。"},{"type":"steps","title":"快速熟悉界面","steps":["打开 Word，新建一个空白文档，先不要输入内容，整体浏览一遍各区域的位置。","把鼠标悬停在功能区任意按钮上停留 1 秒，会弹出\"屏幕提示\"说明该按钮的名称和作用——这是自学命令的最佳方式。","依次点击\"开始、插入、布局\"等选项卡，观察每个选项卡下的命令分组发生了什么变化。","在状态栏上单击右键，可勾选要显示的信息项（如\"字数统计\"\"行号\"），按需自定义状态栏。"]},{"type":"pitfall","text":"初学者常把\"功能区被折叠了\"误以为软件出故障。若发现选项卡下方的命令都消失了，多半是误触了折叠。双击任意选项卡名称，或按 Ctrl+F1 即可重新展开功能区。"}]},{"title":"功能区与快速访问工具栏","blocks":[{"type":"concept","text":"功能区采用\"选项卡 → 组 → 命令\"三级结构。常用选项卡职责：【开始】使用频率最高，含剪贴板、字体、段落、样式四大组；【插入】添加表格、图片、形状、页眉页脚、符号等非文字元素；【布局】控制页边距、纸张方向与大小、分栏、分隔符；【引用】用于长文档，含目录、脚注、题注、交叉引用；【邮件】邮件合并；【审阅】拼写检查、批注、修订、保护；【视图】切换视图、显示标尺网格、多窗口管理。\n此外还有\"上下文选项卡\"：当你选中图片、表格等对象时，功能区会自动多出对应的格式选项卡（如\"图片格式\"\"表设计\"），不选中时则隐藏。"},{"type":"steps","title":"把常用命令固定到快速访问工具栏","steps":["在功能区中找到你常用的命令按钮（例如\"格式刷\"）。","在该按钮上单击右键，选择\"添加到快速访问工具栏\"。","该命令的图标随即出现在标题栏左侧，之后无论在哪个选项卡都能一键点击。","若想批量管理，点击 QAT 最右侧的下拉箭头 →\"其他命令\"，可从全部 Word 命令中挑选、排序，并能导出/导入配置文件，在多台电脑间保持一致。"]},{"type":"tip","text":"把\"打印预览和打印\"\"仅保留文本粘贴\"\"全部接受修订\"等高频命令加入 QAT，并配合 Alt 数字键（按 Alt 后 QAT 上每个按钮会显示一个数字，按对应数字即可触发），能大幅减少在选项卡间来回切换的时间。"}]},{"title":"视图模式详解","blocks":[{"type":"concept","text":"Word 提供多种视图以适应不同工作场景，在\"视图\"选项卡或状态栏右下角切换：\n【页面视图】默认视图，所见即所得，完整显示页边距、页眉页脚、图片位置，排版时最常用。\n【阅读视图】把文档以分栏卡片形式铺满屏幕，隐藏编辑工具，适合纯阅读与审阅。\n【Web 版式视图】模拟网页效果，不分页，适合编辑将发布到网页的内容。\n【大纲视图】按标题层级折叠/展开显示，适合搭建长文档结构、调整章节顺序。\n【草稿视图】简化显示，不渲染图片与复杂版式，在低配电脑上编辑超长文档更流畅。"},{"type":"case","title":"案例：用大纲视图快速重排一篇报告的章节顺序","text":"假设你写了一篇含\"前言、现状、问题、对策、结论\"五个一级标题的报告，现需把\"对策\"调到\"问题\"之前。\n切换到\"视图 → 大纲\"，文档以标题列表呈现；将光标定位到\"对策\"标题行，点击大纲工具栏的\"上移\"按钮（或按 Alt+Shift+↑），整节内容（含其下所有正文与子标题）会作为一个整体一起移动，几秒即可完成原本需要反复剪切粘贴的工作。"}]},{"title":"选项设置与个性化","blocks":[{"type":"concept","text":"\"文件 → 选项\"是 Word 的总控制台，几乎所有默认行为都能在此调整。重点项：【常规】设置用户名（影响批注署名）、界面主题色、启动时的默认行为；【显示】控制是否显示段落标记、空格等格式符号、打印选项；【校对】自动更正、拼写语法检查规则；【保存】默认保存格式、自动恢复时间间隔与文件位置（强烈建议设为 5 分钟）；【高级】编辑、剪切粘贴、显示等数十项细粒度行为；【自定义功能区/快速访问工具栏】重新组织命令布局。"},{"type":"steps","title":"三项必做的初始设置","steps":["打开\"文件 → 选项 → 保存\"，把\"保存自动恢复信息时间间隔\"改为 5 分钟，并勾选\"如果我没保存就关闭，请保留上次自动保留的版本\"。","进入\"常规\"，在\"用户名\"和\"缩写\"中填写你的真实姓名，确保日后批注、修订能正确署名。","进入\"校对 → 自动更正选项\"，根据习惯关闭可能误改内容的项（如把英文直引号自动改为弯引号、首字母自动大写），避免录入专有名词时被意外改动。"]},{"type":"pitfall","text":"切勿因为\"嫌烦\"而关闭自动恢复功能。Word 崩溃或断电时，自动恢复是找回未保存内容的最后防线；但它不能替代主动保存（Ctrl+S），重要节点务必手动保存。"},{"type":"tip","text":"养成进入新电脑或重装 Office 后第一时间完成上述设置的习惯；并把 QAT 配置导出为文件随身携带，几分钟就能把任意一台电脑的 Word 调成你最顺手的状态。"}]}]}

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
  stepList: { margin: '6px 0 0', padding: 0, listStyle: 'none', counterReset: 'step' },
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
