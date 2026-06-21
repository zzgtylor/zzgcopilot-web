// @ts-nocheck
import Link from 'next/link'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Word 从入门到精通 - ZZGCopilot',
  description: '系统学习 Microsoft Word，掌握文档排版、样式设计、表格图片处理等核心技能，从零基础到高效办公。',
}

const s = {
  page: { minHeight: '100vh', background: '#f0f4f8', fontFamily: "'PingFang SC','Microsoft YaHei','Segoe UI',sans-serif" },
  header: { background: 'linear-gradient(135deg,#1a56db 0%,#1e429f 100%)', color: '#fff', padding: '0', boxShadow: '0 2px 12px rgba(0,0,0,0.15)', position: 'sticky', top: 0, zIndex: 100 },
  headerInner: { maxWidth: 1200, margin: '0 auto', padding: '16px 24px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' },
  logo: { color: '#fff', textDecoration: 'none', fontWeight: 700, fontSize: 20, letterSpacing: 1 },
  breadcrumb: { display: 'flex', alignItems: 'center', gap: 8, fontSize: 14 },
  breadLink: { color: 'rgba(255,255,255,0.75)', textDecoration: 'none' },
  breadSep: { color: 'rgba(255,255,255,0.4)' },
  breadCurrent: { color: '#fff', fontWeight: 500 },
  backBtn: { color: '#fff', textDecoration: 'none', background: 'rgba(255,255,255,0.15)', padding: '6px 16px', borderRadius: 20, fontSize: 13, transition: 'background 0.2s' },
  hero: { background: 'linear-gradient(135deg,#1a56db 0%,#6366f1 100%)', color: '#fff', padding: '48px 24px 56px' },
  heroInner: { maxWidth: 1200, margin: '0 auto' },
  heroTitle: { fontSize: 42, fontWeight: 800, margin: '16px 0 12px', letterSpacing: -1, lineHeight: 1.2 },
  heroDesc: { fontSize: 18, opacity: 0.9, maxWidth: 680, lineHeight: 1.7, margin: '0 0 32px' },
  heroTags: { display: 'flex', gap: 10, flexWrap: 'wrap', marginBottom: 32 },
  tag: { background: 'rgba(255,255,255,0.2)', color: '#fff', padding: '4px 14px', borderRadius: 20, fontSize: 13, fontWeight: 500 },
  statsRow: { display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 16, maxWidth: 640 },
  statBox: { background: 'rgba(255,255,255,0.15)', borderRadius: 16, padding: '20px 16px', textAlign: 'center', backdropFilter: 'blur(8px)' },
  statNum: { fontSize: 30, fontWeight: 800, display: 'block', lineHeight: 1 },
  statLabel: { fontSize: 12, opacity: 0.8, marginTop: 6 },
  content: { maxWidth: 1200, margin: '0 auto', padding: '32px 24px', display: 'grid', gridTemplateColumns: '260px 1fr', gap: 32 },
  sidebar: { position: 'sticky', top: 88, alignSelf: 'start', height: 'fit-content' },
  sideCard: { background: '#fff', borderRadius: 16, padding: 20, boxShadow: '0 2px 12px rgba(0,0,0,0.07)', marginBottom: 16 },
  sideTitle: { fontSize: 11, fontWeight: 700, color: '#9ca3af', textTransform: 'uppercase', letterSpacing: 1, marginBottom: 12 },
  sideNav: { listStyle: 'none', padding: 0, margin: 0 },
  sideNavItem: { marginBottom: 4 },
  sideNavLink: { display: 'flex', alignItems: 'center', gap: 8, padding: '8px 12px', borderRadius: 10, textDecoration: 'none', color: '#374151', fontSize: 13, transition: 'all 0.15s' },
  tipCard: { background: 'linear-gradient(135deg,#eff6ff,#e0e7ff)', borderRadius: 16, padding: 20 },
  tipTitle: { fontSize: 13, fontWeight: 700, color: '#3730a3', marginBottom: 8 },
  tipText: { fontSize: 12, color: '#4b5563', lineHeight: 1.6 },
  main: { minWidth: 0 },
  chapterCard: { background: '#fff', borderRadius: 20, overflow: 'hidden', boxShadow: '0 2px 12px rgba(0,0,0,0.06)', marginBottom: 28 },
  chapterHeader: { padding: '24px 32px', borderBottom: '1px solid #f3f4f6', display: 'flex', alignItems: 'center', justifyContent: 'space-between' },
  chapterTitleRow: { display: 'flex', alignItems: 'center', gap: 14 },
  chapterIcon: { width: 52, height: 52, borderRadius: 14, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 26 },
  chapterTitle: { fontSize: 20, fontWeight: 700, color: '#111827', marginBottom: 2 },
  chapterNum: { fontSize: 12, color: '#9ca3af' },
  levelBadge: { padding: '4px 14px', borderRadius: 20, fontSize: 12, fontWeight: 700 },
  sectionDiv: { padding: '24px 32px', borderBottom: '1px solid #f9fafb' },
  sectionTitle: { fontSize: 15, fontWeight: 700, color: '#1f2937', marginBottom: 10, display: 'flex', alignItems: 'center', gap: 10 },
  sectionNum: { width: 26, height: 26, borderRadius: '50%', background: '#f3f4f6', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', fontSize: 12, fontWeight: 700, color: '#6b7280', flexShrink: 0 },
  sectionContent: { fontSize: 14, color: '#374151', lineHeight: 1.9, margin: 0 },
  tipBox: { background: '#f0fdf4', border: '1px solid #bbf7d0', borderRadius: 10, padding: '12px 16px', marginTop: 14, fontSize: 13, color: '#166534' },
  warnBox: { background: '#fffbeb', border: '1px solid #fde68a', borderRadius: 10, padding: '12px 16px', marginTop: 14, fontSize: 13, color: '#92400e' },
  kbdInline: { display: 'inline-flex', gap: 4, flexWrap: 'wrap' },
  kbd: { background: '#f3f4f6', border: '1px solid #d1d5db', borderRadius: 5, padding: '2px 8px', fontSize: 12, fontFamily: 'monospace', color: '#374151', boxShadow: '0 1px 2px rgba(0,0,0,0.1)' },
  cta: { background: 'linear-gradient(135deg,#1a56db,#6366f1)', borderRadius: 20, padding: '48px 40px', textAlign: 'center', color: '#fff', marginTop: 32 },
  ctaTitle: { fontSize: 28, fontWeight: 800, marginBottom: 12 },
  ctaDesc: { fontSize: 16, opacity: 0.85, marginBottom: 28, lineHeight: 1.6 },
  ctaBtns: { display: 'flex', gap: 16, justifyContent: 'center', flexWrap: 'wrap' },
  ctaBtn1: { padding: '12px 28px', background: '#fff', color: '#1a56db', borderRadius: 12, textDecoration: 'none', fontWeight: 700, fontSize: 15 },
  ctaBtn2: { padding: '12px 28px', background: 'rgba(255,255,255,0.2)', color: '#fff', borderRadius: 12, textDecoration: 'none', fontWeight: 700, fontSize: 15, border: '2px solid rgba(255,255,255,0.4)' },
  footer: { borderTop: '1px solid #e5e7eb', background: '#fff', padding: '24px', textAlign: 'center', color: '#9ca3af', fontSize: 13 },
}

const chapters = [
  {
    id: 'ch1', num: '第一章', title: '认识 Word 界面', icon: '🖥️', level: '入门',
    iconBg: '#dcfce7', levelBg: '#dcfce7', levelColor: '#166534',
    sections: [
      {
        title: '1.1 Word 界面总览',
        content: 'Microsoft Word 的界面由若干核心区域构成：【标题栏】位于窗口最顶部，显示当前文件名和程序名，右侧有最小化、还原和关闭按钮。【功能区（Ribbon）】是最重要的操作区域，以选项卡形式组织，包含"开始""插入""绘图""设计""布局""引用""邮件""审阅""视图"等选项卡。每个选项卡内部又分为若干"组"，每组包含相关功能按钮。【文档编辑区】占据窗口主体，是输入和编辑内容的核心区域，有标尺可帮助对齐。【状态栏】位于底部，实时显示页码（如"第1页/共3页"）、字数、语言、拼写检查状态等信息。【视图切换按钮】在状态栏右侧，可在"阅读视图""页面视图""Web版式视图"之间快速切换；缩放滑块可调整文档显示比例。',
        tip: '💡 提示：双击功能区任意选项卡可将功能区折叠/展开，节省编辑区域。按 Ctrl+F1 也可切换功能区显示状态。',
      },
      {
        title: '1.2 功能区各选项卡详解',
        content: '掌握每个选项卡的核心功能至关重要：【开始】是使用频率最高的选项卡，包含"剪贴板"（剪切/复制/粘贴/格式刷）、"字体"（字体名称/字号/加粗/斜体/下划线/颜色等）、"段落"（对齐方式/行距/缩进/项目符号/编号）、"样式"（快速应用预设格式集合）四大功能组。【插入】用于添加各类非文字元素：表格、图片（本地/在线）、形状、图标、3D模型、SmartArt、图表、屏幕截图、超链接、书签、页眉/页脚/页码、文本框、方程式、符号等。【布局】控制文档的整体布局：页边距、纸张方向（纵向/横向）、纸张大小、分栏、分隔符、行号、文字方向、段落间距和缩进。【引用】用于长文档写作：目录生成/更新、脚注与尾注、引文与书目（参考文献）、题注（图表自动编号）、索引、法律文书目录。【邮件】提供邮件合并功能，批量生成个性化文档。【审阅】包含拼写和语法检查、同义词库、字数统计、翻译、批注管理、修订（Track Changes）、文档比较、文档保护等。【视图】切换视图模式（页面/阅读/Web/草稿/大纲）、显示/隐藏标尺和网格线、管理多窗口（并排比较/拆分）、宏操作。',
      },
      {
        title: '1.3 快速访问工具栏与自定义',
        content: '快速访问工具栏（QAT）位于标题栏左侧（或可移至功能区下方），默认仅有"保存""撤销""重做"三个按钮，但可以高度自定义。添加常用按钮的方法：在功能区中找到目标按钮→右键点击→选择"添加到快速访问工具栏"。推荐添加：新建（Ctrl+N 之外的图形入口）、打开最近文件、打印预览和打印、格式刷、插入表格、全部接受修订。自定义选项：点击 QAT 最右侧的下拉箭头→"其他命令"→可从所有 Word 命令中挑选、设置顺序、导入/导出配置。将 QAT 设置导出为文件后可在其他电脑导入，保持一致的工作环境。',
        tip: '💡 小技巧：给常用的宏分配 QAT 按钮或键盘快捷键，可将重复性排版工作从数分钟缩短为数秒。',
      },
      {
        title: '1.4 文档的创建、保存与格式',
        content: '新建文档：Ctrl+N 创建空白文档；在"文件→新建"中可选用各类模板（简历、报告、传单等），大量模板可直接在线下载使用。保存文档：首次保存按 Ctrl+S（或 F12 打开"另存为"对话框），选择保存位置和文件名。文档格式选择：.docx 是默认格式（XML压缩包，兼容性好，体积小）；.doc 是旧版格式（兼容Word 97-2003，某些老系统需要）；.pdf 用于最终分发，打印效果稳定、不可随意编辑；.odt 是开放文档格式（LibreOffice等可打开）；.txt 纯文本，丢失所有格式。自动保存与恢复：在"文件→选项→保存"中勾选"自动保存AutoRecover信息"，建议设置为5分钟。意外关闭时重启Word会弹出"文档恢复"窗格，可找回未保存内容。',
      },
    ],
  },
  {
    id: 'ch2', num: '第二章', title: '文字输入与编辑技巧', icon: '✏️', level: '入门',
    iconBg: '#dbeafe', levelBg: '#dbeafe', levelColor: '#1e40af',
    sections: [
      {
        title: '2.1 文本输入与光标操作',
        content: '点击文档任意位置即可将光标定位并开始输入。光标移动快捷键（极大提升效率）：Home/End 跳至行首/行尾；Ctrl+Home/End 跳至文档开头/结尾；Ctrl+←/→ 按词跳转；Page Up/Down 上下翻页。插入与改写模式：默认为"插入"模式（新输入内容插入光标位置，后方文字后移）；按 Insert 键切换为"改写"模式（新内容覆盖光标后的文字），状态栏会显示"改写"标识。中文输入法技巧：使用简拼、词组联想；善用符号面板输入特殊符号；在"插入→符号"中可插入各类特殊字符和数学符号（也可使用 Alt+数字小键盘 输入Unicode字符）。',
      },
      {
        title: '2.2 文本选择的全套方法',
        content: '高效选择文本是快速编辑的基础：【鼠标操作】单击定位光标；双击选中一个词语；三击选中整个段落；在行首（鼠标变为向右箭头时）单击选中整行，双击选整段，三击选全文。【键盘操作】Shift+点击：选中当前光标到点击位置间的所有内容；Shift+方向键：逐字/行扩展选区；Shift+Ctrl+方向键：逐词/段扩展选区；Shift+Home/End：从光标选到行首/行尾；Shift+Ctrl+Home/End：从光标选到文档开头/结尾；Ctrl+A 全选文档。【不连续选择】按住 Ctrl 键，用鼠标拖动或点击，可同时选中文档中多处不相邻的内容，然后统一设置格式。【选择相似格式的文本】右键→"选择所有格式类似的文本"，可一次性选中文档中所有格式相同的段落，批量修改。',
        tip: '💡 技巧：按 Ctrl+Shift+F8 激活"列选择"模式（竖向选择），再配合方向键可选取矩形文本块，非常适合处理有规律的表格式纯文本。',
      },
      {
        title: '2.3 查找与替换的高级用法',
        content: '基础功能：Ctrl+F 打开"查找"导航窗格（高亮所有匹配项）；Ctrl+H 打开"查找和替换"对话框（功能更全面）。进阶技巧：点击对话框左下角"更多"展开高级选项：区分大小写（英文搜索时常用）；全字匹配（防止搜"the"时匹配到"there"）；使用通配符（? 匹配任意单字符，* 匹配任意多字符，[a-z] 匹配范围内字符，^p 匹配段落标记，^t 匹配制表符）。替换格式：在"替换为"框中，点击"格式"按钮，可将找到的文字替换为具有特定格式（加粗/颜色/字号等）的文字，而不仅仅是替换文字内容。实用场景：全文去除多余空行（查找 ^p^p，替换为 ^p，多次执行直到不再减少）；批量将引号从直引号改为弯引号；清除所有手动换行符（^l 替换为 ^p）。',
        warn: '⚠️ 注意：使用"全部替换"前建议先点"查找下一处"预览效果，避免误替换。使用通配符时正则逻辑与标准正则略有不同，请仔细测试。',
      },
      {
        title: '2.4 剪贴板与粘贴选项',
        content: '基础操作：Ctrl+X 剪切，Ctrl+C 复制，Ctrl+V 粘贴。粘贴选项（极为重要）：每次粘贴后，内容右下角会出现"粘贴选项"按钮（或按 Ctrl 键调出），提供三种模式：①"保留源格式"：保留原文档的字体/颜色/大小等，可能破坏目标文档的格式统一性；②"合并格式"：保留加粗/斜体等基本格式，字体和颜色使用目标文档的当前格式；③"仅保留文本"（最常用于正式文档写作）：去除所有格式，以目标位置的当前样式粘贴，确保全文格式一致。Office剪贴板：在"开始→剪贴板→对话框启动器"中打开，可查看最近24条复制/剪切历史，选择性粘贴任意一条，比系统剪贴板强大得多。',
      },
    ],
  },
  {
    id: 'ch3', num: '第三章', title: '字体与段落格式精讲', icon: '🎨', level: '基础',
    iconBg: '#f3e8ff', levelBg: '#f3e8ff', levelColor: '#7e22ce',
    sections: [
      {
        title: '3.1 字体格式全面解析',
        content: '选中文字后，在"开始→字体"组或按 Ctrl+D 打开字体对话框进行详细设置。中西文字体搭配原则：中文正文推荐"宋体"（传统正式）或"微软雅黑"（现代清晰）；英文/数字推荐"Times New Roman"（衬线，正式）或"Calibri"/"Arial"（无衬线，现代）；标题可用"黑体""华文中宋"等更粗重的字体。字号参考：正文用5号字（10.5pt）或小四（12pt）；小标题用四号（14pt）或三号（16pt）；大标题用一号（26pt）或小初（36pt）。字形效果：加粗 Ctrl+B（强调重点），倾斜 Ctrl+I（术语/外来词），下划线 Ctrl+U（可选样式：直线/波浪线/双线），删除线（表示废弃内容），上标 Ctrl+Shift+= （数学指数x²），下标 Ctrl+= （化学式H₂O）。文字效果：字体颜色（点击下拉箭头选主题色/标准色/自定义色）；文字突出显示（模拟荧光笔效果）；在字体对话框→"文字效果"中可设置发光、阴影、映像、三维等高级视觉效果。字符间距：在字体对话框→"高级"选项卡，可调整字符间距（加宽/紧缩）和垂直位置（提升/降低），标题可适当加宽字间距（1-3pt）增加视觉张力。',
      },
      {
        title: '3.2 段落格式深度指南',
        content: '段落是Word排版的基本单位，每个段落末尾都有一个不可见的段落标记（¶）。对齐方式：左对齐（Ctrl+L）—正文标准，适合大段内容；右对齐（Ctrl+R）—适用于日期、签名、金额等；居中对齐（Ctrl+E）—标题、标语、诗句；两端对齐（Ctrl+J）—正式文档正文，使左右边界整齐；分散对齐—文字均匀分布至整行宽度（适合单行较短的标题）。行距设置：在段落对话框（Ctrl+1/2/5 快速设置1/2/1.5倍）→"行距"下拉选择，还可用"固定值"（如16pt固定行高，不随字号变化，适合表格）或"最小值"（至少保留指定值，可随更大字号自动扩展）。段前/段后间距：标题段落通常设置段前12pt、段后6pt，无需手动按回车空行。缩进：悬挂缩进（第一行不缩，其余行缩进）用于参考文献列表；首行缩进2字符是中文段落规范（在段落对话框设置，而非用空格）；左/右缩进可缩小段落宽度（适合引用块）。',
        tip: '💡 最佳实践：永远不要用多个空格来对齐文字，也不要用多个回车来控制段落间距。应使用段落格式中的缩进和间距设置，这样在字体/纸张改变时格式也不会乱。',
      },
      {
        title: '3.3 项目符号与编号列表',
        content: '插入项目符号：在"开始→段落"组点击"项目符号"按钮（下拉可选不同样式）；也可先输入"*"或"-"后按空格，Word会自动识别并创建列表。插入编号列表：点击"编号"按钮（下拉可选 1.2.3. / a.b.c. / i.ii.iii. / 一、二、三、等）。多级列表（提纲结构）：点击"多级列表"按钮，选择多级样式；在列表中按 Tab 键降一级，Shift+Tab 升一级；也可在"开始→多级列表→定义新的多级列表"中深度自定义各级的编号样式、缩进量和与标题样式的绑定关系（这是自动生成目录的前提）。调整列表格式：右键点击列表中的编号→"调整列表缩进"，可精确设置编号后的缩进距离；选中整个列表→右键"更改列表级别"可整体提升/降低。',
      },
      {
        title: '3.4 格式刷与清除格式',
        content: '格式刷是Word中效率最高的格式工具之一。使用方法：先将一处文字设置好目标格式→将光标定位在该处（无需选中）→单击格式刷（只能刷一次）或双击格式刷（可连续刷多处）→点击或拖选要应用格式的文字→按 Esc 退出。键盘快捷键：Ctrl+Shift+C 复制格式，Ctrl+Shift+V 粘贴格式（配合选区使用）。清除格式：Ctrl+Space 清除字符格式（恢复为当前段落的默认字体），Ctrl+Q 清除段落格式（恢复段落默认设置）；在"开始→样式"组点击"清除格式"按钮（橡皮擦图标）可同时清除字符和段落格式，恢复为"正文"样式。',
      },
    ],
  },
  {
    id: 'ch4', num: '第四章', title: '样式、主题与目录', icon: '🎭', level: '进阶',
    iconBg: '#fef3c7', levelBg: '#fef3c7', levelColor: '#92400e',
    sections: [
      {
        title: '4.1 样式系统的核心价值',
        content: '样式（Style）是Word最强大、最被忽视的功能之一。样式是"一组格式设置的命名集合"，包含字体、字号、颜色、段落间距、缩进、对齐等所有格式属性。使用样式的核心优势：①全局一键修改：修改某个样式的定义，文档中所有使用了该样式的段落会立即同步更新，无需逐一手动修改；②自动生成目录：目录是基于标题样式（标题1/2/3）自动生成的，不用样式就无法用自动目录功能；③导航窗格：基于标题样式，可在"视图→导航窗格"中快速跳转各章节；④格式一致性：确保全文字体/间距绝对统一，专业度大幅提升；⑤主题联动：更换文档主题时，基于主题颜色/字体的样式会自动更新，一秒换装。快速应用样式：在"开始→样式"组点击样式名称；或使用快捷键 Ctrl+Alt+1/2/3 应用标题1/2/3。',
      },
      {
        title: '4.2 修改样式与创建自定义样式',
        content: '修改内置样式：在样式窗格（Ctrl+Alt+Shift+S 打开完整样式窗格）中右键点击要修改的样式→"修改"→在对话框中调整格式参数。推荐的"正文"样式修改：中文字体"宋体"、西文字体"Times New Roman"、字号12pt、行距1.5倍、段前0pt、段后6pt、首行缩进2字符。推荐的"标题1"修改：中文字体"黑体"、字号22pt、加粗、段前24pt、段后12pt、段后分页（让每章从新页开始）。创建新样式：在样式窗格底部点"新建样式"：设置名称（如"图注""表注""代码"）；选择"样式类型"（段落/字符/链接）；选择"基于哪个样式"（继承其格式）；设置"后续段落样式"（回车后自动切换到的样式，如标题后接正文）。勾选"添加到样式库"使其出现在功能区快速访问。',
      },
      {
        title: '4.3 主题、配色与文档外观',
        content: '主题是颜色方案+字体组合+效果的综合预设，在"设计"选项卡管理。更改主题：点击"主题"按钮，从预设列表选择（如"环保""基础型""积分"等），整个文档的基色和字体立即更换。注意：主题颜色只影响使用了主题色的元素（样式中定义的颜色、图形填充色等），直接用RGB值手动设置的颜色不受主题影响，这也是为什么要尽量使用主题色而非固定颜色。自定义配色方案：在"设计→颜色"下拉→"自定义颜色"，可设置12个主题颜色槽位（深色1/2、浅色1/2、强调色1-6、超链接/已访问超链接），保存后可在所有文档中使用。页面背景：在"设计"选项卡还可设置页面颜色、水印（"机密""草稿"等文字水印或图片水印）、页面边框（实线/艺术型边框）。',
      },
      {
        title: '4.4 自动目录的生成与维护',
        content: '前提：文档中各级标题必须使用"标题1""标题2""标题3"等标题样式（或在目录设置中手动指定其他样式）。插入目录：将光标置于希望插入目录的位置（通常在文档开头、封面后）→"引用→目录"→选择"自动目录1"或"自动目录2"，目录立即生成，包含各级标题和对应页码。目录格式设置：点击"引用→目录→自定义目录"，可配置：显示页码（是/否）；页码右对齐（是/否）；制表符前导符（小圆点、实线、虚线等，专业报告推荐用小圆点）；显示级别（通常设1-3级）；格式模板（来自模板/古典/正式/精致等）。更新目录：修改正文内容或标题后，右键点击目录区域→"更新域"→选择"只更新页码"（快速，仅修正页码）或"更新整个目录"（完整更新，包含新增/删除/改名的标题）。',
        tip: '💡 提示：在"视图→导航窗格"中点击任意标题即可在文档中快速跳转，这比滚动鼠标或手动查目录高效得多，长文档写作必备。',
      },
    ],
  },
  {
    id: 'ch5', num: '第五章', title: '页面布局与专业排版', icon: '📐', level: '进阶',
    iconBg: '#fee2e2', levelBg: '#fee2e2', levelColor: '#991b1b',
    sections: [
      {
        title: '5.1 页面设置详解',
        content: '在"布局→页面设置"组进行配置。纸张大小：A4（210×297mm）是中国办公最常用；A3（297×420mm）适合宽幅图表和海报；B5（176×250mm）适合教材；Letter（216×279mm）用于美国标准文档；自定义尺寸适合特殊印刷需求。页边距预设：普通（上下2.54cm，左右3.18cm）是Word默认值，适合一般文档；窄（上下1.27cm，左右1.27cm）适合内容紧凑的技术手册；宽（左右5.08cm）适合旁注空间需求的文档。中国公文规范页边距：上3.7cm、下3.5cm、左2.8cm、右2.6cm。纸张方向：纵向（Portrait）为默认；横向（Landscape）适合宽表格、流程图、数据看板类文档。分栏排版：在"布局→栏"中选择一栏/两栏/三栏/偏左/偏右，或"更多栏"进行精确配置（含分割线、各栏宽度和间距）。分栏排版广泛用于杂志、报纸、产品手册等场景。',
      },
      {
        title: '5.2 分页符、分节符的正确使用',
        content: '分页符（Ctrl+Enter）：强制在光标处另起一页，常用于章节之间和封面后。注意：不要用多个回车来实现换页，这在后续编辑中极难维护。分节符（在"布局→分隔符"中插入）比分页符更强大，允许同一文档中的不同部分使用不同的页面格式。分节符类型：①"下一页"—新节从下一页开始，可设置不同页边距、纸张方向（如文档中夹入横向页面）、独立的页眉页脚；②"连续"—在同一页内开始新节，主要用于该页局部需要不同栏数的情况；③"奇数页/偶数页"—确保新节从奇数页/偶数页开始，书籍装订排版常用此功能。查看分隔符：按 Ctrl+Shift+8（或点击"开始→显示/隐藏¶"）可看到文档中所有隐藏的格式符号，包括段落标记、空格、分页符、分节符，排版错误时必开此模式排查。',
      },
      {
        title: '5.3 页眉、页脚与页码的专业配置',
        content: '进入编辑：双击页面顶部/底部的页眉/页脚区域，或在"插入→页眉/页脚"中选择预设样式。基本设置：在"页眉和页脚"选项卡中勾选"首页不同"（使封面页不显示页眉页脚）；"奇偶页不同"（书籍常用：奇数页右侧显示章节名，偶数页左侧显示书名）。插入页码：在"插入→页码"选择位置（页面顶部/底部/页边距/当前位置）和样式；右键页码→"设置页码格式"：选择编号格式（阿拉伯数字/罗马数字/英文字母）；可设置"起始页码"（如封面和目录使用 i/ii/iii 罗马数字，正文从第1页开始需要此设置）；多节文档中取消"与上一节相同"链接后，各节可独立设置不同的页眉内容和页码起始值。在页眉中插入自动域：Insert→Quick Parts→Field，如 StyleRef（自动显示当前章节的标题1内容）、FileName（文件名）、Date（日期，可选是否自动更新）。',
        tip: '💡 技巧：在首页（封面）插入"下一页"分节符，然后在第二节取消"链接到前一节"，就可以为封面（第一节）设置无页眉，而目录和正文（第二节及后续）有各自的页眉，且页码从1开始计数。',
      },
      {
        title: '5.4 高级排版：水印、边框与装订线',
        content: '水印：在"设计→水印"中选择预设（"机密""草稿""紧急"等）或"自定义水印"（文字水印：可设字体/颜色/大小/旋转角度/半透明；图片水印：插入公司Logo等，建议勾选"冲蚀"效果避免遮盖正文）。页面颜色：默认为无（白色），在"设计→页面颜色"中可设置纯色背景（打印时颜色可能不同，需在打印设置中开启"背景色和图像"）。页面边框：在"设计→页面边框"中为整个文档或指定节添加边框（可设置样式/颜色/宽度，以及到页边的距离）；艺术型边框包含各种图案花边，适合节日贺卡、邀请函等。装订线：在"布局→页边距→自定义边距"中设置装订线大小（通常左侧0.5-1cm）和装订线位置（左/上），用于双面打印后装订成册的文档，避免内容被装订处遮挡。',
      },
    ],
  },
  {
    id: 'ch6', num: '第六章', title: '表格制作与数据呈现', icon: '📊', level: '进阶',
    iconBg: '#ccfbf1', levelBg: '#ccfbf1', levelColor: '#065f46',
    sections: [
      {
        title: '6.1 创建与编辑表格',
        content: '创建方式：①拖动网格：在"插入→表格"的方格区拖动鼠标选择行列数（最多10×8），快速直观；②精确插入：点击"插入表格"输入行数和列数，还可设置"固定列宽""根据内容自动调整""根据窗口自动调整"；③绘制表格：点击"绘制表格"，鼠标变为笔形，可绘制任意形状的不规则表格（适合特殊设计）；④文本转换为表格：先用制表符或逗号等统一分隔符整理好文本，然后全选文本→"插入→表格→文本转换成表格"。编辑操作：在单元格内点击定位；Tab键跳至下一个单元格（在最后一个单元格按Tab会自动在末行后添加新行）；选中整行：鼠标移到行左侧（变为箭头）单击；选中整列：移到列顶部（变为向下箭头）单击。插入/删除行列：选中行或列后右键→插入（上方/下方行，左侧/右侧列）或删除（行/列/单元格）。',
      },
      {
        title: '6.2 合并单元格与精确调整尺寸',
        content: '合并单元格：选中要合并的多个单元格→右键→"合并单元格"，或在"布局"选项卡点击"合并单元格"。常用于制作复杂表头（如跨列的大标题行）。拆分单元格：右键→"拆分单元格"→指定拆分为几行几列。精确设置尺寸：选中整个表格→右键→"表格属性"：表格选项卡：设置整体宽度（固定/百分比）；行选项卡：设置行高（"指定高度"，选"固定值"使所有行等高，选"最小值"允许内容多时自动扩展）；列选项卡：精确设置每列宽度；单元格选项卡：设置单元格内边距（文字与单元格边框的间距）。快速调整：将鼠标悬停于列边框，拖动可调整列宽；按住 Alt 键拖动可显示精确的数值刻度。自动调整：选中整个表格→右键→"自动调整"→"根据内容自动调整"（列宽适应内容）或"根据窗口自动调整"（铺满页面宽度）。标题行重复：对于跨页长表格，选中标题行→"布局→重复标题行"，每页都会自动显示标题行，便于阅读。',
      },
      {
        title: '6.3 表格样式与美化',
        content: '快速应用样式：点击表格→在"表格设计"选项卡的"表格样式"库中点选预设（鼠标悬停可实时预览）。推荐场景：商务报告用带色条纹的"网格表4—着色2"；学术文档用简洁的"网格表1浅色"；极简风格用"表格网格"仅保留基本边框线。表格样式选项（"表格设计"左侧的复选框）：标题行（突出第一行）、汇总行（突出最后行）、镶边行（奇偶行交替底色）、首列/末列突出、镶边列。自定义边框：在"表格设计→边框"下拉中选择样式；用"边框刷"（画笔图标）可对特定边框应用选定的样式/颜色/粗细，精确控制哪条线变粗/变色；"无框线"样式可隐藏边框（但单元格区域仍存在）。底纹填充：选中特定单元格→"表格设计→底纹"选择颜色，可为表头行或特殊数据行着色高亮。表格内文字对齐：选中单元格→"布局→对齐方式"中9个方位按钮，设置水平（左/中/右）和垂直（上/中/下）对齐的组合。',
      },
      {
        title: '6.4 表格公式与排序',
        content: '表格内计算：光标定位在需要显示结果的单元格→"布局→公式"打开公式对话框。内置函数：SUM()求和（ABOVE=上方所有数字，LEFT=左侧，RIGHT=右侧，BELOW=下方）；AVERAGE()平均值；COUNT()计数；MAX()/MIN()最大/最小值；IF(条件,真值,假值)条件判断；ROUND(数值,小数位数)四舍五入。单元格引用：A1表示第1列第1行（A=列，1=行），可用A1:A5表示范围，类似Excel。注意：Word表格公式不会自动更新，修改数据后需右键公式→"更新域"，或全选后按F9批量更新。数字格式：在公式对话框的"数字格式"中可设置货币符号、小数位数（如"#,##0.00"格式化为带千位分隔符和两位小数的数字）。表格排序：选中表格→"布局→排序"，可按指定列的文本/数字/日期升序/降序排列，支持多级排序（主要关键字/次要关键字/第三关键字）。',
        tip: '💡 提示：对于需要复杂计算和图表的数据，建议直接在Word中插入Excel表格对象（"插入→表格→Excel电子表格"），可直接使用Excel的全部功能，完成后点击Word空白处即可嵌入文档。',
      },
    ],
  },
  {
    id: 'ch7', num: '第七章', title: '图片、图形与可视化', icon: '🖼️', level: '进阶',
    iconBg: '#fce7f3', levelBg: '#fce7f3', levelColor: '#831843',
    sections: [
      {
        title: '7.1 图片的插入与基本操作',
        content: '插入图片方式：①"插入→图片→此设备"选择本地文件（支持jpg/png/gif/svg/webp等主流格式）；②"插入→图片→在线图片"搜索并插入互联网图片；③从文件夹或浏览器直接拖拽到文档中；④粘贴截图（Ctrl+V，Windows截图工具：Win+Shift+S）。调整大小：选中图片后出现8个控制点，拖动角部控制点等比例缩放（按住 Shift 确保等比）；在"图片格式→大小"输入精确的高度/宽度数值（默认锁定纵横比，取消锁定可不等比缩放）。裁剪图片：点击"图片格式→裁剪"，黑色裁剪框出现，拖动裁剪边框后在框外任意处单击确认；"裁剪为形状"可将图片裁为圆形、三角形、五星形等多种形状；"裁剪为纵横比"固定比例裁剪（如1:1方形、16:9宽屏）。图片样式：在"图片格式→图片样式"中选择预设效果（阴影/发光/映像/柔化边缘/棱台/三维旋转等）。',
      },
      {
        title: '7.2 图片的颜色处理与艺术效果',
        content: '在"图片格式"选项卡中有丰富的图像处理工具。更正（亮度/对比度/锐化）：在"更正"下拉预览网格中选择亮度和对比度的组合预设；点击"图片更正选项"可精确输入百分比值。颜色调整：饱和度（0%=灰度，100%=正常，更高=饱和鲜艳）；色调（冷色调/暖色调，用于统一文档配色风格）；"重新着色"可将图片变为单色效果（灰度/棕褐色/蓝色调等），适合简约报告风格；"设置透明色"点击图片某颜色将其变为透明（适合白底Logo的抠图）。艺术效果：模糊、铅笔素描、图案涂抹、玻璃、纹理等20余种效果，点击即可应用，适合用于背景装饰图片或杂志封面排版。压缩图片：在"图片格式→压缩图片"中，可对全文档所有图片或单张图片进行压缩，选择分辨率（打印320ppi/屏幕150ppi/电子邮件96ppi），可大幅减小文件体积。',
      },
      {
        title: '7.3 图片环绕方式与精确定位',
        content: '环绕方式是图片排版的关键。选中图片→"图片格式→排列→自动换行"或点击图片右上角的布局按钮选择：①嵌入型（默认）：图片被视为文字的一个字符，随文字流动，对齐最精确，适合需要严格格式控制的正式文档；②四周型：文字环绕图片的矩形边界框（不管图片形状如何），最常用；③紧密型：文字紧贴图片的实际轮廓（对于非矩形图片效果更好）；④上下型：图片独占一行，文字在上方和下方，适合插图配文字的排版；⑤穿越型：文字穿越图片内部的透明区域；⑥浮于文字上方：图片覆盖在文字之上；⑦衬于文字下方：图片在文字下方作为背景。固定位置：在"布局"对话框（点击图片右上角布局→"查看更多"）的"位置"选项卡，可将图片固定在页面的绝对坐标位置（不随文字流动）。对齐与分布：同时选中多张图片→"图片格式→对齐"，可左对齐/居中/右对齐/上对齐/垂直居中等，以及"横向分布"/"纵向分布"使图片等间距排列，制作整齐的图片网格。',
      },
      {
        title: '7.4 SmartArt图形与图表',
        content: 'SmartArt：在"插入→SmartArt"选择类型：列表（无序条目）、流程（操作步骤/流程图）、循环（周期性过程）、层次结构（组织架构图）、关系（韦恩图/对比）、矩阵（2×2策略矩阵）、棱锥图（层级关系）、图片（图文混排列表）。在文本窗格中输入各节点文字（Tab降级，Shift+Tab升级）；在"SmartArt设计"→"更改颜色"选择配色方案；在"SmartArt样式"选择平面/三维立体效果。插入图表：在"插入→图表"选择图表类型（柱形图用于比较，折线图用于趋势，饼图/环形图用于占比，条形图用于横向比较，散点图/气泡图用于相关性分析，面积图/股价图/雷达图等）。选择后在弹出的Excel窗口中填写数据，图表实时更新。美化图表：在"图表设计"选项卡选择图表样式（预设配色）；在"格式"选项卡精细调整各元素；右键图表区域→"设置图表区格式"可调整背景、边框、阴影等。插入题注：选中图片/图表→"引用→插入题注"，输入"图1：数据对比"等文字，Word自动编号，且可在目录中生成"图表目录"。',
      },
    ],
  },
  {
    id: 'ch8', num: '第八章', title: '高级技巧与效率精通', icon: '🚀', level: '精通',
    iconBg: '#e0e7ff', levelBg: '#e0e7ff', levelColor: '#3730a3',
    sections: [
      {
        title: '8.1 邮件合并：批量个性化文档',
        content: '邮件合并可批量生成数百份各不相同的个性化文档（合同、邀请函、工资单、成绩单、快递标签等），将重复工作从数小时缩短为数分钟。标准流程：①准备数据源：在Excel中整理好数据，第一行为字段名（姓名/单位/金额/日期等），每行为一条记录，保存为.xlsx文件。②创建主文档：在Word中写好文档模板，将个性化内容的位置留空，通过"邮件→开始邮件合并"选择文档类型（信函/电子邮件/信封/标签/目录）。③连接数据源：点击"选择收件人→使用现有列表"，选择Excel文件，确认工作表。④插入合并域：将光标定位到需要插入变量的位置，点击"插入合并域"，从下拉列表选择对应字段（如《姓名》《金额》），文档中显示为带尖括号的字段名。⑤规则和条件：在"规则"中可使用IF…THEN…ELSE根据字段值插入不同内容（如不同称谓）；"填充名字"处理特殊字符。⑥预览并完成：点击"预览结果"切换查看各记录效果；确认无误后"完成并合并→编辑单个文档"生成全部合并后的文档（每条记录一页），或"打印文档"直接打印。',
      },
      {
        title: '8.2 修订、批注与协作审阅',
        content: '修订模式（Track Changes）：按 Ctrl+Shift+E 开启，此后所有编辑操作都会被记录并以颜色标记（插入内容显示下划线，删除内容显示删除线），不同审阅者用不同颜色区分。适合多人协同审稿场景。"显示标记"按钮可切换是否显示批注和修订（"最终版本"临时隐藏修订以预览最终效果）。批注：选中文字→"审阅→新批注"（或 Ctrl+Alt+M）添加评论气泡；在批注气泡中可回复批注（形成讨论线程）；点击"解决"将批注标记为已解决（仍保留但灰显）。接受/拒绝修订：在"审阅→更改"组可逐一查看、接受或拒绝每处修订；"接受所有修订"一键清除所有标记；"拒绝所有修订"恢复到修改前状态。比较文档：在"审阅→比较→比较"，选择原始文档和修改后文档，Word自动生成两者差异的修订视图，非常适合对比不同版本。',
        tip: '💡 协作建议：发送文档给他人审阅前，建议先用"检查文档"功能（文件→信息→检查文档）清除个人信息、批注、隐藏文本等敏感元数据，保护隐私。',
      },
      {
        title: '8.3 宏与VBA自动化',
        content: '宏是一系列操作的录制与回放。录制宏：在"视图→宏→录制宏"，输入宏名称，可选择将宏分配到按钮或键盘快捷键（建议设置快捷键），选择保存位置（"所有文档(Normal.dotm)"使宏在所有文档可用），然后执行目标操作序列，完成后点"停止录制"。运行宏：按分配的快捷键；或在"视图→宏→查看宏"中选择并运行；或点击QAT上分配的按钮。编辑宏（VBA）：在"查看宏"对话框点"编辑"打开VBA编辑器（也可按 Alt+F11 直接打开）。VBA基础：Sub宏名()...End Sub 定义宏；ActiveDocument 引用当前文档；Selection 引用当前选中内容；With语句批量设置属性。实用宏示例：批量给图片添加题注、检查并统一全文字体、自动生成特定格式的章节标题、批量导出每页为PDF。注意：宏文件扩展名为.docm，分发文档时如无需宏可另存为.docx（宏会被清除）；收到来源不明的含宏文档时要谨慎，在"信任中心"管理宏安全设置。',
      },
      {
        title: '8.4 域代码与自动化字段',
        content: 'Word中有大量"域"（Field）可以自动显示动态内容。常用域：DATE（当前日期，可选是否随打开文件自动更新）；TIME（当前时间）；PAGE（当前页码）；NUMPAGES（总页数，如 PAGE/NUMPAGES 实现"1/5"格式）；FILENAME（文件名）；AUTHOR（文档作者）；TITLE（文档标题，来自"文件→属性"中的标题字段）；TOC（目录）；REF（书签引用）；IF（条件显示不同内容）；SEQ（自动编号序列，如图1、图2）。插入域：在"插入→文档部件→域"打开完整的域对话框，分类浏览并配置；也可直接按 Ctrl+F9 插入空域括号 { }，手动输入域代码（如 { DATE \@ "yyyy年M月d日" } 格式化日期显示）。切换域显示：选中域代码→按 Alt+F9 在"域代码"和"域结果"间切换显示，便于调试。更新域：选中后按F9更新单个域；Ctrl+A全选后按F9更新全文所有域（打印前建议执行）。',
      },
      {
        title: '8.5 文档保护与安全',
        content: '限制编辑：在"审阅→保护文档→限制编辑"中，可设置：①格式设置限制—仅允许使用指定的样式列表，防止他人破坏格式体系；②编辑限制—仅允许修订（强制Track Changes）/批注（可添加批注但不能直接修改）/填写窗体（只能在窗体字段中输入，适合调查问卷/合同模板）/不允许任何更改（只读）；为不同用户/节设置不同的编辑权限（需要例外区域设置）；③启动强制保护—可设置密码，他人无法取消限制。密码加密：在"文件→信息→保护文档→用密码进行加密"，设置打开密码（加密文件内容，忘记密码则无法恢复）。数字签名：在"文件→信息→保护文档→添加数字签名"，为文档添加可验证真实性的数字签名（需要数字证书）。标记为最终状态：在"文件→信息→保护文档→标记为最终状态"，文档变为只读模式（提醒他人这是最终版，但非强制，可关闭此状态）。',
        warn: '⚠️ 重要提示：文档打开密码（加密密码）一旦忘记将无法恢复文档内容，请务必将密码记录在安全位置。编辑限制密码较易被专业工具绕过，不适合高度机密文档。',
      },
    ],
  },
]

export default function WordTutorialPage() {
  return (
    <div style={s.page}>
      <header style={s.header}>
        <div style={s.headerInner}>
          <div style={s.breadcrumb}>
            <Link href="/" style={s.breadLink}>ZZGCopilot</Link>
            <span style={s.breadSep}>/</span>
            <Link href="/tutorials" style={s.breadLink}>教程</Link>
            <span style={s.breadSep}>/</span>
            <span style={s.breadCurrent}>Word 从入门到精通</span>
          </div>
          <Link href="/" style={s.backBtn}>← 返回首页</Link>
        </div>
      </header>

      <div style={s.hero}>
        <div style={s.heroInner}>
          <div style={s.heroTags}>
            <span style={s.tag}>📘 入门级</span>
            <span style={s.tag}>📙 进阶级</span>
            <span style={s.tag}>📕 精通级</span>
            <span style={s.tag}>✅ 全平台适用</span>
          </div>
          <h1 style={s.heroTitle}>Word 从入门到精通</h1>
          <p style={s.heroDesc}>系统掌握 Microsoft Word 全部核心功能——从界面认识、文字格式，到专业排版、样式与目录，再到邮件合并、宏自动化和协作审阅。8大章节 · 37个知识点，助你从零基础到办公高手。</p>
          <div style={s.statsRow}>
            {[{v:'8',l:'章节数',i:'📖'},{v:'37',l:'知识点',i:'💡'},{v:'适中',l:'难度',i:'📈'},{v:'全体',l:'适合人群',i:'👥'}].map(x=>(
              <div key={x.l} style={s.statBox}>
                <span style={{fontSize:24}}>{x.i}</span>
                <span style={s.statNum}>{x.v}</span>
                <span style={s.statLabel}>{x.l}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div style={s.content}>
        <aside style={s.sidebar}>
          <div style={s.sideCard}>
            <div style={s.sideTitle}>目录导航</div>
            <ul style={s.sideNav}>
              {chapters.map(ch=>(
                <li key={ch.id} style={s.sideNavItem}>
                  <a href={"#"+ch.id} style={s.sideNavLink}>
                    <span style={{fontSize:16}}>{ch.icon}</span>
                    <span style={{flex:1}}>{ch.num}</span>
                  </a>
                </li>
              ))}
            </ul>
          </div>
          <div style={s.tipCard}>
            <div style={s.tipTitle}>📚 学习建议</div>
            <p style={s.tipText}>建议按章节顺序学习，每章学完后打开 Word 动手实践，效果更佳。遇到快捷键多练习几遍，形成肌肉记忆。</p>
          </div>
          <div style={{...s.tipCard, background:'linear-gradient(135deg,#fff7ed,#ffedd5)', marginTop:12}}>
            <div style={{...s.tipTitle, color:'#c2410c'}}>⌨️ 核心快捷键</div>
            <div style={{fontSize:12, color:'#4b5563', lineHeight:2}}>
              Ctrl+S 保存 · Ctrl+Z 撤销<br/>
              Ctrl+B 加粗 · Ctrl+I 斜体<br/>
              Ctrl+H 替换 · Ctrl+F 查找<br/>
              Ctrl+Enter 换页 · F12 另存为<br/>
              Ctrl+Alt+1/2/3 应用标题样式
            </div>
          </div>
        </aside>

        <main style={s.main}>
          {chapters.map((chapter, ci) => (
            <section key={chapter.id} id={chapter.id} style={s.chapterCard}>
              <div style={s.chapterHeader}>
                <div style={s.chapterTitleRow}>
                  <div style={{...s.chapterIcon, background:chapter.iconBg}}>
                    {chapter.icon}
                  </div>
                  <div>
                    <div style={s.chapterNum}>{chapter.num}</div>
                    <h2 style={s.chapterTitle}>{chapter.title}</h2>
                  </div>
                </div>
                <span style={{...s.levelBadge, background:chapter.levelBg, color:chapter.levelColor}}>
                  {chapter.level}
                </span>
              </div>
              <div>
                {chapter.sections.map((sec, si) => (
                  <div key={si} style={{...s.sectionDiv, borderBottom: si < chapter.sections.length-1 ? '1px solid #f3f4f6' : 'none'}}>
                    <h3 style={s.sectionTitle}>
                      <span style={s.sectionNum}>{si+1}</span>
                      {sec.title}
                    </h3>
                    <p style={s.sectionContent}>{sec.content}</p>
                    {sec.tip && <div style={s.tipBox}>{sec.tip}</div>}
                    {sec.warn && <div style={s.warnBox}>{sec.warn}</div>}
                  </div>
                ))}
              </div>
            </section>
          ))}

          <div style={s.cta}>
            <h2 style={s.ctaTitle}>🎉 恭喜完成全部学习！</h2>
            <p style={s.ctaDesc}>你已系统掌握 Word 从入门到精通的所有核心技能。现在打开 Word，动手实践这些技巧，你会发现工作效率大幅提升！</p>
            <div style={s.ctaBtns}>
              <Link href="/" style={s.ctaBtn1}>浏览更多教程</Link>
              <a href="#ch1" style={s.ctaBtn2}>重新阅读</a>
            </div>
          </div>
        </main>
      </div>

      <footer style={s.footer}>
        <p>© {new Date().getFullYear()} ZZGCopilot · Word 从入门到精通完整教程 · 共 8 章 37 知识点</p>
      </footer>
    </div>
  )
}
