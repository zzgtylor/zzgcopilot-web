// @ts-nocheck
import Link from 'next/link'

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
        <span style={{ ...s.blockLabel, ...labelStyle.steps }}>{labelText.steps}{b.title ? '：' + b.title : ''}</span>
        <ol style={s.stepList}>
          {b.steps.map((st, i) => <li key={i} style={s.stepItem}><span style={s.stepNum}>{i + 1}</span>{st}</li>)}
        </ol>
      </div>
    )
  }
  if (b.type === 'case') {
    return (
      <div style={s.blockConcept}>
        <span style={{ ...s.blockLabel, ...labelStyle.case }}>{labelText.case}</span>
        <div style={s.caseBox}>
          {b.title && <div style={s.caseTitle}>{b.title}</div>}
          {b.text.split('\n').map((p, i) => <p key={i} style={{ ...s.para, margin: i ? '8px 0 0' : 0 }}>{p}</p>)}
        </div>
      </div>
    )
  }
  if (b.type === 'pitfall') return <div style={s.blockConcept}><span style={{ ...s.blockLabel, ...labelStyle.pitfall }}>{labelText.pitfall}</span><div style={s.warnBox}>{b.text}</div></div>
  if (b.type === 'tip') return <div style={s.blockConcept}><span style={{ ...s.blockLabel, ...labelStyle.tip }}>{labelText.tip}</span><div style={s.tipBox}>{b.text}</div></div>
  return (
    <div style={s.blockConcept}>
      <span style={{ ...s.blockLabel, ...labelStyle.concept }}>{labelText.concept}</span>
      {b.text.split('\n').map((p, i) => <p key={i} style={s.para}>{p}</p>)}
    </div>
  )
}

export function ChapterView({ data }) {
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
          <Link href="/tutorials/word" style={s.backBtn}>返回目录</Link>
        </div>
      </header>
      <div style={s.hero}>
        <div style={s.heroInner}>
          <div style={s.heroPart}>{m.part}</div>
          <h1 style={s.heroTitle}>第{m.n}章 {m.title}</h1>
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
            <div style={s.sectionBody}>{sec.blocks.map((b, bi) => <Block key={bi} b={b} />)}</div>
          </section>
        ))}
      </div>
      <nav style={s.nav}>
        {m.prev ? <Link href={'/tutorials/word/' + m.prev} style={s.navBtn}>上一章</Link> : <span style={{ ...s.navBtn, color: '#cbd5e1' }}>已是第一章</span>}
        <Link href="/tutorials/word" style={s.navBtnMid}>返回目录</Link>
        {m.next ? <Link href={'/tutorials/word/' + m.next} style={s.navBtn}>下一章</Link> : <span style={{ ...s.navBtn, color: '#cbd5e1' }}>已是最后一章</span>}
      </nav>
      <footer style={s.footer}>
        <p>© {new Date().getFullYear()} ZZGCopilot · Word 从入门到精通（完整版）· 第{m.n}章</p>
      </footer>
    </div>
  )
}
