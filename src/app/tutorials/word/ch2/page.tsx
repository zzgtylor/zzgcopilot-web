// @ts-nocheck
import Link from 'next/link'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: "第2章 文档的创建、保存与管理 - Word 从入门到精通",
  description: "掌握新建与模板、各种保存格式的差异与取舍、自动保存与恢复机制、版本历史，以及文件属性与元数据的管理，让文档从诞生到归档全程可控。",
}

const data = {"meta":{"n":2,"prev":"ch1","next":"ch3","part":"第一篇 · 基础入门","title":"文档的创建、保存与管理","subtitle":"掌握新建与模板、各种保存格式的差异与取舍、自动保存与恢复机制、版本历史，以及文件属性与元数据的管理，让文档从诞生到归档全程可控。"},"sections":[{"title":"新建文档与使用模板","blocks":[{"type":"concept","text":"新建文档有两种思路：从\"空白文档\"白手起家，或基于\"模板\"快速套用现成版式。模板（.dotx）预置了字体、样式、页面设置乃至占位内容，适合简历、报告、传单、信函等有固定结构的文档。Word 内置大量联机模板，也支持自定义模板。\n理解模板的价值：它把\"排版\"与\"内容\"分离——你专注填内容，版式由模板保证统一美观，尤其适合需要批量产出同类文档的场景。"},{"type":"steps","title":"基于模板新建文档","steps":["点击\"文件 → 新建\"，进入模板库。","在顶部搜索框输入关键词（如\"简历\"\"报告\"\"日历\"），或浏览推荐分类。","单击心仪的模板查看预览，点击\"创建\"即可下载并基于它生成新文档。","替换模板中的占位文字与图片为你的实际内容，注意尽量沿用模板已定义的样式以保持一致性。"]},{"type":"tip","text":"若你经常写格式固定的文档，可把排好版的文档\"另存为 Word 模板（.dotx）\"，以后\"文件 → 新建 → 个人\"即可一键调用，避免每次重复设置页边距、字体和样式。"}]},{"title":"保存格式详解","blocks":[{"type":"concept","text":"保存格式决定了文档的兼容性、体积与用途，选错可能导致格式丢失或无法打开。常见格式：\n【.docx】默认格式，本质是 XML 压缩包，体积小、稳定、支持全部新功能，日常首选。\n【.doc】Word 97-2003 旧格式，仅在需要兼容很老的系统时使用，会丢失部分新特性。\n【.pdf】用于最终分发与打印，版式固定、跨平台一致、不易被随意编辑，但再编辑较麻烦。\n【.odt】开放文档格式，供 LibreOffice 等开源软件使用。\n【.txt】纯文本，丢弃所有格式、图片与样式，仅保留文字。\n【.dotx】模板格式（见上一节）。\n【.docm】启用宏的文档，含 VBA 代码时必须用此格式。"},{"type":"steps","title":"另存为指定格式","steps":["按 F12 打开\"另存为\"对话框（或点击\"文件 → 另存为\"）。","选择保存位置并输入文件名。","点击\"保存类型\"下拉框，选择目标格式（如 PDF）。","对于 PDF，可点击\"选项\"设置是否包含书签、是否仅导出选定页等，再点\"保存\"。"]},{"type":"case","title":"案例：把投标书定稿为不可随意改动的 PDF","text":"投标书定稿后需提交给甲方，既要保证对方打开时版式分毫不差，又不希望被误改。\n做法：先用 Ctrl+S 保存好 .docx 原件（便于自己日后修订），再按 F12 →\"保存类型\"选\"PDF\"→在\"优化\"中选\"标准（联机发布和打印）\"→保存。这样得到一份版式锁定的 PDF 用于提交，同时保留 .docx 母版用于后续修改。"},{"type":"pitfall","text":"切勿把唯一的母版直接存成 PDF 或 TXT 后删掉 .docx。PDF 再转回 Word 常导致排版错乱，TXT 则彻底丢失格式。任何重要文档都应长期保留一份 .docx 原件。"}]},{"title":"自动保存与恢复","blocks":[{"type":"concept","text":"断电、崩溃、误关闭随时可能发生，Word 提供两道防线：\n【自动恢复（AutoRecover）】桌面版按设定间隔在后台静默保存副本，崩溃后重启 Word 会弹出\"文档恢复\"窗格供你找回。它是保险，不是替代手动保存。\n【自动保存（AutoSave）】仅当文档存放在 OneDrive/SharePoint 时可用，开启后改动实时云端保存，配合版本历史可随时回退。"},{"type":"steps","title":"配置自动恢复","steps":["打开\"文件 → 选项 → 保存\"。","勾选\"保存自动恢复信息时间间隔\"，建议设为 5 分钟。","勾选\"如果我没保存就关闭，请保留上次自动保留的版本\"。","记下或自定义\"自动恢复文件位置\"，以便必要时手动去该文件夹找回 .asd 恢复文件。"]},{"type":"tip","text":"把工作文档直接保存到 OneDrive 文件夹，即可启用顶部的\"自动保存\"开关，从此几乎不用再担心忘记按 Ctrl+S，且能借助版本历史回到任意历史时点。"}]},{"title":"版本历史与协作留痕","blocks":[{"type":"concept","text":"当文档存于 OneDrive/SharePoint 时，Word 会自动记录\"版本历史\"：每次重要保存都生成一个可追溯的快照。你可以查看任意历史版本、对比差异、还原到某个版本，这在多人协作或反复修改时极为重要——再也不用手动命名\"终稿、终稿2、真的终稿\"。"},{"type":"steps","title":"查看与还原历史版本","steps":["打开存于 OneDrive 的文档，点击标题栏中的文件名，或进入\"文件 → 信息 → 版本历史记录\"。","在右侧版本列表中点击某个时间点的版本，它会以只读方式打开预览。","确认无误后点击\"还原\"，即可把文档回退到该版本；或选择\"另存副本\"保留当前版与历史版两份。"]},{"type":"pitfall","text":"版本历史依赖云端存储。若文档只存在本地硬盘，则没有版本历史可用，此时务必靠规范的手动备份（如按日期命名副本）来保留关键节点。"}]},{"title":"文件属性与元数据","blocks":[{"type":"concept","text":"每个 Word 文档都附带\"元数据\"——标题、作者、公司、关键词、备注，以及创建/修改时间、编辑总时长等。这些信息便于检索归档，但也可能在对外分发时泄露隐私（如作者真实姓名、内部修订痕迹）。在\"文件 → 信息\"右侧可查看与编辑属性。"},{"type":"steps","title":"分发前清理敏感元数据","steps":["点击\"文件 → 信息 → 检查问题 → 检查文档\"。","在\"文档检查器\"中勾选要检查的项目（批注与修订、文档属性和个人信息、隐藏文字等）。","点击\"检查\"，对查出的敏感项点击\"全部删除\"。","另存为一份对外版本（保留原件），确保对外文件不含个人信息与隐藏痕迹。"]},{"type":"tip","text":"对外正式文件分发前养成\"先检查文档、再另存对外版\"的习惯；可把\"检查文档\"加入快速访问工具栏，一键调用。同时在\"文件 → 选项 → 信任中心\"可设置保存时自动提醒移除个人信息。"}]}]}

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
