// @ts-nocheck
import Link from 'next/link'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Excel 从入门到大神 - ZZGCopilot',
  description: '系统学习 Microsoft Excel，从单元格基础、公式函数到数据透视表、Power Query 与 VBA 自动化，图文精讲，助你从零基础进阶为表格大神。',
}

const s = {
  page: { minHeight: '100vh', background: '#f0f7f2', fontFamily: "'PingFang SC','Microsoft YaHei','Segoe UI',sans-serif" },
  header: { background: 'linear-gradient(135deg,#107c41 0%,#0b5c30 100%)', color: '#fff', padding: '0', boxShadow: '0 2px 12px rgba(0,0,0,0.15)', position: 'sticky', top: 0, zIndex: 100 },
  headerInner: { maxWidth: 1200, margin: '0 auto', padding: '16px 24px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' },
  logo: { color: '#fff', textDecoration: 'none', fontWeight: 700, fontSize: 20, letterSpacing: 1 },
  breadcrumb: { display: 'flex', alignItems: 'center', gap: 8, fontSize: 14 },
  breadLink: { color: 'rgba(255,255,255,0.75)', textDecoration: 'none' },
  breadSep: { color: 'rgba(255,255,255,0.4)' },
  breadCurrent: { color: '#fff', fontWeight: 500 },
  backBtn: { color: '#fff', textDecoration: 'none', background: 'rgba(255,255,255,0.15)', padding: '6px 16px', borderRadius: 20, fontSize: 13, transition: 'background 0.2s' },
  hero: { background: 'linear-gradient(135deg,#107c41 0%,#21a366 100%)', color: '#fff', padding: '48px 24px 56px' },
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
  tipCard: { background: 'linear-gradient(135deg,#ecfdf5,#d1fae5)', borderRadius: 16, padding: 20 },
  tipTitle: { fontSize: 13, fontWeight: 700, color: '#065f46', marginBottom: 8 },
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
  cta: { background: 'linear-gradient(135deg,#107c41,#21a366)', borderRadius: 20, padding: '48px 40px', textAlign: 'center', color: '#fff', marginTop: 32 },
  ctaTitle: { fontSize: 28, fontWeight: 800, marginBottom: 12 },
  ctaDesc: { fontSize: 16, opacity: 0.85, marginBottom: 28, lineHeight: 1.6 },
  ctaBtns: { display: 'flex', gap: 16, justifyContent: 'center', flexWrap: 'wrap' },
  ctaBtn1: { padding: '12px 28px', background: '#fff', color: '#107c41', borderRadius: 12, textDecoration: 'none', fontWeight: 700, fontSize: 15 },
  ctaBtn2: { padding: '12px 28px', background: 'rgba(255,255,255,0.2)', color: '#fff', borderRadius: 12, textDecoration: 'none', fontWeight: 700, fontSize: 15, border: '2px solid rgba(255,255,255,0.4)' },
  footer: { borderTop: '1px solid #e5e7eb', background: '#fff', padding: '24px', textAlign: 'center', color: '#9ca3af', fontSize: 13 },
}

const chapters = [
  {
    id: 'ch1', num: '第一章', title: '认识 Excel 与工作表基础', icon: '🟢', level: '入门',
    iconBg: '#dcfce7', levelBg: '#dcfce7', levelColor: '#166534',
    sections: [
      {
        title: '1.1 Excel 界面与核心概念',
        content: 'Microsoft Excel 是电子表格软件，核心是用“行列网格”管理数据。界面构成：【功能区（Ribbon）】顶部选项卡含“开始”“插入”“页面布局”“公式”“数据”“审阅”“视图”等，每个选项卡分为若干组。【名称框】位于编辑栏左侧，显示当前单元格地址（如 A1），也可输入地址快速跳转或定义名称。【编辑栏（fx）】显示并编辑当前单元格的真实内容（公式或原始值）。【工作表网格】由列（字母 A、B、C…）和行（数字 1、2、3…）交叉构成，交叉处即“单元格”，地址用“列号+行号”表示（如 C5）。【工作表标签】底部 Sheet1、Sheet2… 可右键重命名、改色、移动、复制、隐藏。【状态栏】底部右侧选中数字区域时自动显示求和、平均值、计数等统计。一个 Excel 文件称为“工作簿”（Workbook），包含多张“工作表”（Worksheet）。',
        tip: '💡 提示：按 Ctrl+方向键 可快速跳到数据区域边缘；按 Ctrl+Home 回到 A1。在名称框输入地址（如 G100）回车可瞬间跳转到该单元格。',
      },
      {
        title: '1.2 数据录入与单元格内容类型',
        content: '单击单元格直接输入，回车确认并下移，Tab 确认并右移。Excel 自动识别四类内容：①数值（右对齐，可计算，如 100、3.14、-50）；②文本（左对齐，不参与计算，如“姓名”“北京”）；③日期/时间（本质是数值，可格式化，如 2025/1/1）；④公式（以 = 开头，返回计算结果）。强制文本：在数字前加一个英文单引号，可保留前导零（如编号 001），适合电话、身份证等。换行：单元格内按 Alt+Enter 强制换行。批量填充同值：选中区域，输入内容后按 Ctrl+Enter 一次性填满所有选中单元格。常见陷阱：长数字（超过 15 位，如身份证、银行卡号）会被自动转为科学计数并丢失精度，必须先把单元格设为“文本”格式再录入。',
        warn: '⚠️ 注意：身份证号、银行卡号、超长订单号等务必先将单元格格式设为“文本”再输入，否则 Excel 会四舍五入或显示为 1.23E+17，造成数据永久损坏。',
      },
      {
        title: '1.3 单元格选择、移动与填充柄',
        content: '选择技巧：单击选单个；拖动选连续区域；Shift+单击选两点之间的矩形区域；Ctrl+单击/拖动选不连续的多个区域；单击列标/行号选整列/整行；Ctrl+A 选当前数据区（再按一次选全表）。填充柄（单元格右下角的小黑方块）是 Excel 效率核心：选中后拖动可复制内容或按规律填充——输入 1、2 后选中两格下拉自动生成 3、4、5…；输入“一月”下拉自动生成“二月”“三月”；输入日期下拉按天/月/年递增。双击填充柄可沿左侧已有数据的长度自动向下填充到底，处理长表格极快。快速填充（Ctrl+E）：Excel 根据你输入的示例智能推断规律，自动完成拆分姓名、合并字段、提取数字等操作。',
        tip: '💡 技巧：Ctrl+E（快速填充）是神器。例如 A 列是“张三-销售部”，在 B 列先手动输入“张三”，再按 Ctrl+E，Excel 会自动提取整列所有姓名，无需任何公式。',
      },
      {
        title: '1.4 工作簿保存、格式与保护',
        content: '保存：Ctrl+S 保存，F12 另存为。格式选择：.xlsx 是默认格式（基于 XML，体积小、安全、不支持宏）；.xlsm 是启用宏的工作簿（含 VBA 代码时必须用此格式）；.xls 是旧版格式（兼容 Excel 97-2003）；.csv 是纯文本逗号分隔（仅保存当前单张表的值，丢失公式、格式和多表，常用于系统间数据交换）；.pdf 用于最终打印分发。自动恢复：在“文件→选项→保存”中设置自动恢复间隔（建议 5 分钟）。保护：在“审阅→保护工作表”可锁定单元格防止误改（需先在单元格格式中设置哪些单元格锁定/解锁）；“保护工作簿”可防止增删/移动工作表；“文件→信息→保护工作簿→用密码进行加密”可对整个文件设置打开密码。',
        warn: '⚠️ 提示：另存为 CSV 只会保留当前活动工作表的纯数据，所有公式会变成计算结果值、所有格式和其他工作表都会丢失。重要文件请始终保留一份 .xlsx 原件。',
      },
    ],
  },
  {
    id: 'ch2', num: '第二章', title: '单元格格式与数据呈现', icon: '🎨', level: '入门',
    iconBg: '#dbeafe', levelBg: '#dbeafe', levelColor: '#1e40af',
    sections: [
      {
        title: '2.1 数字格式详解',
        content: '数字格式只改变“显示方式”，不改变单元格真实存储的值，这是 Excel 初学者最易混淆的概念。在“开始→数字”组或按 Ctrl+1 打开“设置单元格格式”对话框。常用格式：【常规】默认无特定格式；【数值】可设小数位数和千位分隔符（如 1,234.56）；【货币/会计专用】加货币符号，会计格式让小数点和货币符号对齐；【百分比】将 0.85 显示为 85%（数值乘以 100 加百分号）；【日期/时间】多种显示样式；【文本】把内容当纯文本处理，公式不计算；【特殊】邮政编码、中文大写数字等。自定义格式（最强大）：用占位符编写，如 0.00 强制两位小数、#,##0 千位分隔、0% 百分比、yyyy年m月d日 日期格式、负数显示为红色括号等。',
        tip: '💡 提示：自定义格式用分号可分四段，分别定义“正数;负数;零值;文本”的显示方式，可让负数自动变红、零值显示为横杠，财务报表必备。',
      },
      {
        title: '2.2 对齐、字体与边框',
        content: '对齐方式：在“开始→对齐”组设置水平（左/中/右）和垂直（上/中/下）对齐。【合并居中】合并多个单元格并居中，常用于制作跨列标题（但合并单元格会破坏排序、筛选和公式引用，数据区域慎用，可改用“跨列居中”对齐方式替代）。【自动换行】单元格文字过长时自动折行显示。【缩小字体填充】自动缩小字号使内容不溢出。【文字方向】可设置竖排或倾斜角度（如表头斜排节省宽度）。字体设置与 Word 类似：字体、字号、加粗、颜色等。边框：在“开始→字体→边框”下拉中选择，或 Ctrl+1→边框选项卡精细设置线条样式、颜色、内外框；注意 Excel 网格线默认只是屏幕显示辅助、不会打印，需要打印的表格框线必须手动添加边框。',
        warn: '⚠️ 注意：尽量避免在数据表中使用“合并单元格”，它会导致无法正常排序、筛选、复制粘贴和使用公式引用。如需视觉上的居中标题，请用“跨列居中”对齐替代。',
      },
      {
        title: '2.3 条件格式：让数据自动可视化',
        content: '条件格式根据单元格的值自动改变其外观，是数据分析的可视化利器，在“开始→条件格式”中设置。常用类型：【突出显示单元格规则】大于/小于/介于/等于某值、文本包含、重复值等满足条件时变色（如标记所有大于 1000 的销售额为绿色）；【最前/最后规则】自动高亮前 10 项、高于平均值的项等；【数据条】在单元格内绘制长短不一的色条，直观比较数值大小，类似嵌入式柱状图；【色阶】用颜色渐变（如红-黄-绿）表示数值高低，制作热力图效果；【图标集】用箭头、交通灯、星级等图标分级标注。【新建规则→使用公式】可编写任意逻辑（如 =$D2>$E2 让整行变色）实现高级条件。管理规则：在“条件格式→管理规则”中查看、编辑、调整优先级和删除所有规则。',
        tip: '💡 技巧：用公式条件格式 =MOD(ROW(),2)=0 可自动给偶数行加底色，实现斑马纹效果，且增删行后会自动重算，比手动着色更智能。',
      },
      {
        title: '2.4 表格样式与“超级表”',
        content: '选中数据区域后按 Ctrl+T（或“插入→表格”），即可将普通区域转换为“超级表”（Excel Table），这是被严重低估的强大功能。超级表的优势：①自动套用专业的间隔色样式，可一键切换主题；②自动添加筛选下拉箭头；③输入新行/列时格式和公式自动扩展；④表头在滚动时始终可见（替代冻结窗格）；⑤可使用结构化引用（如 =[@销售额]*[@数量]）代替 A1 式地址，公式更易读；⑥配合数据透视表和图表时，数据源会随表增减自动更新范围。在“表设计”选项卡可改表名、切换样式、添加“汇总行”（自动在底部生成求和/平均等）、转换回普通区域。',
        tip: '💡 提示：养成把数据源转为超级表（Ctrl+T）的习惯。后续做透视表、图表、公式引用时都会随数据增减自动更新范围，从根本上避免“数据加了但图表没更新”的问题。',
      },
    ],
  },
  {
    id: 'ch3', num: '第三章', title: '公式与运算基础', icon: '🧮', level: '基础',
    iconBg: '#f3e8ff', levelBg: '#f3e8ff', levelColor: '#7e22ce',
    sections: [
      {
        title: '3.1 公式入门与运算符',
        content: '公式是 Excel 的灵魂，所有公式都以等号 = 开头。运算符分四类：①算术运算符 +（加）、-（减）、*（乘）、/（除）、^（乘方，如 2^3=8）、%（百分比）；②比较运算符 =、>、<、>=、<=、<>（不等于），返回 TRUE 或 FALSE；③文本连接符 &，把多段文本拼起来（如 =A1&“先生”）；④引用运算符 :（区域，如 A1:A10）、,（联合多个区域）、空格（交集）。运算优先级：先乘方，再乘除，后加减，可用括号 () 改变顺序。在编辑栏直接输入或点击单元格自动填入地址。按 F2 进入单元格编辑模式，按 F9 可把选中的公式片段直接计算为结果值（调试公式利器）。',
        tip: '💡 提示：编辑公式时选中其中一段（如 A1+B1），按 F9 可立即看到这段的计算结果，方便排查复杂公式哪一步出错；按 Esc 退出而不改动原公式。',
      },
      {
        title: '3.2 相对引用、绝对引用与混合引用',
        content: '这是公式正确复制的关键。【相对引用】如 A1，公式向下/向右复制时地址会同步变化（B1 复制到 B2 变成引用 A2），适合批量计算每行数据。【绝对引用】如 $A$1，行列都加 $，复制时地址固定不变，适合引用固定的参数（如统一税率、汇率所在的单元格）。【混合引用】如 $A1（锁列不锁行）或 A$1（锁行不锁列），适合制作乘法表、二维汇总表。切换方法：在编辑公式时把光标放在地址上反复按 F4 键，会在 A1→$A$1→A$1→$A1 之间循环切换。理解引用方式是从“会用公式”迈向“高效用公式”的分水岭，错误的引用方式是公式复制后结果全错的最常见原因。',
        warn: '⚠️ 常见错误：用某个固定单元格（如税率 D1）做计算时，若写成相对引用 D1，向下复制后会变成 D2、D3 引用到空白格导致结果错误。务必按 F4 改为 $D$1 锁定。',
      },
      {
        title: '3.3 常用基础函数',
        content: '函数是预先写好的公式。输入 = 后打函数名，Excel 会提示参数。必会基础函数：SUM(区域) 求和；AVERAGE(区域) 平均值；COUNT(区域) 统计数字个数；COUNTA(区域) 统计非空单元格个数；MAX/MIN 最大/最小值；ROUND(数值,位数) 四舍五入；INT 取整；ABS 绝对值；TODAY() 返回今天日期；NOW() 返回当前日期时间。条件统计：SUMIF(条件区域,条件,求和区域) 按条件求和；COUNTIF(区域,条件) 按条件计数；SUMIFS/COUNTIFS 支持多个条件（如统计“销售部”且“金额>1000”的记录）。快捷键 Alt+=（或“开始→自动求和”）可对选中区域或其下方/右侧自动插入 SUM 公式。',
        tip: '💡 提示：选中一列数字下方的空格，按 Alt+= 即可秒速求和。选中含多行多列的区域再按 Alt+=，会一次性为每行每列末尾都生成求和公式。',
      },
      {
        title: '3.4 错误值诊断与公式审核',
        content: '公式出错时会返回错误值，认识它们才能快速修复：#DIV/0! 除数为 0 或空；#N/A 查找类函数找不到匹配值；#NAME? 函数名拼错或文本没加引号；#VALUE! 参数类型错误（如对文本做数学运算）；#REF! 引用的单元格被删除；#NULL! 区域交集为空；##### 列宽不够（加宽即可，非真错误）。容错处理：用 IFERROR(公式,出错时返回的值) 把错误值替换为 0 或空白或提示文字，让报表更整洁。公式审核工具在“公式”选项卡：“追踪引用单元格/从属单元格”用箭头显示公式的数据来源与去向；“显示公式”把全表公式显示出来而非结果，便于检查；“错误检查”自动定位并提示问题公式。',
        warn: '⚠️ 注意：IFERROR 会隐藏所有类型的错误，可能掩盖真正需要修复的逻辑问题。调试阶段建议先看清错误值类型，确认无误后再用 IFERROR 美化输出。',
      },
    ],
  },
  {
    id: 'ch4', num: '第四章', title: '核心函数实战进阶', icon: '⚡', level: '进阶',
    iconBg: '#fef3c7', levelBg: '#fef3c7', levelColor: '#92400e',
    sections: [
      {
        title: '4.1 逻辑函数：IF 与嵌套判断',
        content: 'IF(条件,真值,假值) 是最重要的逻辑函数，根据条件返回不同结果。例如 =IF(B2>=60,“及格”,“不及格”)。多条件判断可嵌套 IF，但层数多了难读，推荐用 IFS(条件1,值1,条件2,值2,…) 替代多层嵌套（如成绩分等级）。逻辑组合：AND(条件1,条件2,…) 所有条件都成立才为真；OR(条件1,条件2,…) 任一成立即为真；NOT 取反。例如 =IF(AND(B2>=60,C2>=60),“双科通过”,“未通过”)。新版 Excel 的 SWITCH(表达式,值1,结果1,…) 适合把一个值映射到多个固定结果。配合 IFERROR、ISBLANK、ISNUMBER 等信息函数可构建健壮的业务逻辑。',
        tip: '💡 技巧：嵌套 IF 超过 3 层就考虑改用 IFS、SWITCH 或建一张对照表配合 VLOOKUP/XLOOKUP，逻辑更清晰、更易维护，也更不容易写错括号。',
      },
      {
        title: '4.2 查找引用函数：VLOOKUP 与 XLOOKUP',
        content: '查找函数用于从一张表中按关键字调取对应数据，是数据整合的核心。VLOOKUP(查找值,查找区域,返回第几列,匹配方式)：在区域首列查找，返回同行指定列的值；第四参数 FALSE/0 表示精确匹配（最常用），TRUE/1 表示近似匹配（用于分段，如成绩转等级，要求首列升序排列）。VLOOKUP 的局限：只能向右查、列号写死后插入列会错位。XLOOKUP(查找值,查找列,返回列,[找不到时],[匹配模式],[搜索方向]) 是新版的全面升级：可向左查、可双向、可返回整行/整列、找不到时可自定义返回值，强烈推荐优先使用。此外 INDEX(区域,行,列)+MATCH(查找值,区域,0) 组合是经典的万能查找方案，灵活性最高。',
        warn: '⚠️ 注意：VLOOKUP 用 0/FALSE 做精确匹配；查找值与查找列的数据类型必须一致（常见坑：一边是文本数字“001”、一边是真数字 1，会查不到，返回 #N/A）。',
      },
      {
        title: '4.3 文本处理函数',
        content: '清洗与重组文本数据的常用函数：LEFT(文本,n)/RIGHT(文本,n) 取左/右 n 个字符；MID(文本,起始,长度) 取中间字符；LEN 计算字符数；FIND/SEARCH 查找子串位置（FIND 区分大小写，SEARCH 不区分且支持通配符）；TEXT(值,格式代码) 把数字按指定格式转为文本（如转成 yyyy-mm-dd 形式）；TRIM 删除多余空格；CLEAN 删除非打印字符；SUBSTITUTE(文本,旧,新) 替换指定文本；CONCAT/TEXTJOIN 合并多个文本（TEXTJOIN 可指定分隔符并忽略空值）。新版还有 TEXTSPLIT、TEXTBEFORE、TEXTAFTER 按分隔符拆分文本，处理“姓名-部门-工号”这类组合字段非常方便。',
        tip: '💡 技巧：从系统导出的数据常带不可见空格导致 VLOOKUP 匹配失败，套一层 =TRIM(CLEAN(A1)) 清洗后再匹配，能解决大量“看起来一样却查不到”的诡异问题。',
      },
      {
        title: '4.4 日期时间与数学统计函数',
        content: '日期函数：YEAR/MONTH/DAY 提取年月日；DATE(年,月,日) 组合成日期；DATEDIF(起,止,单位) 计算两日期相隔的年/月/天数（算年龄、工龄）；EDATE 计算几个月后的日期；EOMONTH 返回月末日期；WEEKDAY 返回星期几；NETWORKDAYS 计算两日期间的工作日天数（可排除节假日）。统计函数：RANK 排名；LARGE/SMALL 取第 k 大/小值；MEDIAN 中位数；STDEV 标准差；SUMPRODUCT 对应元素相乘再求和（可实现加权平均、多条件统计等高级用途）。新版动态数组函数 FILTER（按条件筛选返回）、SORT（排序）、UNIQUE（去重）、SEQUENCE（生成序列）会自动“溢出”到相邻单元格，极大简化复杂统计。',
        tip: '💡 提示：FILTER+UNIQUE+SORT 三件套可一键生成动态去重排序清单，数据变动时结果自动刷新，无需手动重做，是新版 Excel 最值得掌握的能力之一。',
      },
    ],
  },
  {
    id: 'ch5', num: '第五章', title: '数据管理与清洗', icon: '🧹', level: '进阶',
    iconBg: '#fee2e2', levelBg: '#fee2e2', levelColor: '#991b1b',
    sections: [
      {
        title: '5.1 排序与多级排序',
        content: '基础排序：选中数据区任意单元格→“数据→升序/降序”按当前列排序（Excel 自动识别整个数据区，会带着整行一起排，不会拆散记录）。多级排序：点“数据→排序”打开对话框，添加多个排序条件（主要关键字、次要关键字…），例如先按“部门”升序、部门内再按“销售额”降序。自定义排序：可按单元格颜色、字体颜色、图标排序；也可按自定义序列排序（如按“高/中/低”而非字母顺序，需先在“文件→选项→高级→编辑自定义列表”中定义）。横向排序：在排序选项中可改为“按行排序”。注意：排序前确认没有合并单元格，且数据区上方只有一行标题，否则可能排乱。',
        tip: '💡 提示：排序前先按 Ctrl+T 转为超级表，或确保数据区四周有空行空列隔开其他内容，可避免 Excel 误判数据范围而漏排或错排部分数据。',
      },
      {
        title: '5.2 筛选与高级筛选',
        content: '自动筛选：选中数据→“数据→筛选”（Ctrl+Shift+L），每列标题出现下拉箭头，可勾选要显示的值、按条件筛选（数字筛选如“大于”“前10项”，文本筛选如“包含”“开头是”，日期筛选如“本月”“本季度”），还可按颜色筛选。多列筛选条件是“与”关系（同时满足）。高级筛选：“数据→高级”，用一个独立的“条件区域”定义复杂规则（同行为“与”、不同行为“或”），可把筛选结果复制到其他位置，还能配合“选择不重复记录”实现去重。切片器：把数据转为超级表后，“表设计→插入切片器”可生成可视化的筛选按钮面板，点击即筛选，比下拉箭头更直观，做仪表盘必备。',
        tip: '💡 技巧：Ctrl+Shift+L 一键开关筛选。需要把筛选出的可见行复制出来时，先选区域按 Alt+;（定位可见单元格）再复制，可避免把隐藏行也复制走。',
      },
      {
        title: '5.3 数据验证与去重',
        content: '数据验证（旧称“数据有效性”）在录入端把好质量关，在“数据→数据验证”设置：限制只能输入整数/小数/日期/文本长度的范围；制作下拉列表（“允许→序列”，来源填入选项或引用一段区域），强制从固定选项中选择，避免录入五花八门；设置“输入信息”提示和“出错警告”。圈释无效数据：可框出已存在的不符合规则的数据。去除重复值：选中区域→“数据→删除重复值”，勾选据以判断重复的列，Excel 会保留首次出现、删除其余重复行（此操作直接改原数据，建议先备份）。若只想标记不删除，用条件格式的“重复值”规则更安全。',
        warn: '⚠️ 注意：“删除重复值”会永久删除数据行，执行前务必备份原表或先复制一份到新工作表上操作，以防误删无法恢复。',
      },
      {
        title: '5.4 分列、合并与数据导入',
        content: '分列：选中含分隔符的一列→“数据→分列”，选“分隔符号”（逗号/空格/制表符等）或“固定宽度”，把一列拆成多列（如把“姓名 电话”拆开，或把文本型日期转为真日期）。也可用新版的 TEXTSPLIT 函数或 Ctrl+E 快速填充实现。合并数据：用 & 或 CONCAT/TEXTJOIN 函数把多列拼成一列。外部数据导入：“数据→获取数据”可从 CSV/文本、Excel、网页、数据库等导入；对于反复更新的数据源，建议用 Power Query（见第八章）建立可一键刷新的导入流程，而非每次手动复制粘贴。',
        tip: '💡 提示：把一列文本型数字（左上角有绿色小三角）批量转成真数字，最快的方法是“数据→分列”一路点“完成”，或选中后点旁边的感叹号图标选“转换为数字”。',
      },
    ],
  },
  {
    id: 'ch6', num: '第六章', title: '数据透视表与分析', icon: '📊', level: '进阶',
    iconBg: '#ccfbf1', levelBg: '#ccfbf1', levelColor: '#065f46',
    sections: [
      {
        title: '6.1 数据透视表入门',
        content: '数据透视表（PivotTable）是 Excel 最强大的数据汇总分析工具，能把成千上万行明细瞬间汇总成多维度报表，且无需任何公式。创建：选中数据区（建议先转为超级表）→“插入→数据透视表”→选择放置位置（新工作表）。在右侧“字段列表”中把字段拖入四个区域：【行】决定每行的分类（如“部门”“产品”）；【列】决定列的分类（如“季度”）；【值】要汇总的数字（如“销售额”，默认求和）；【筛选】整体过滤的字段。拖动即出报表，调整字段位置即变换分析角度，几秒钟就能从“按部门”切换到“按月份×产品”的交叉汇总。数据源更新后，右键“刷新”即可同步。',
        tip: '💡 提示：制作透视表前务必把数据源整理成规范的“一维表”——每列一个字段、每行一条记录、无合并单元格、无空行空列、标题唯一。源数据越规范，透视越顺畅。',
      },
      {
        title: '6.2 值汇总方式与计算字段',
        content: '值字段不止能求和。单击“值”区域字段→“值字段设置”可改汇总方式：求和、计数、平均值、最大/最小值、乘积、标准差等。“值显示方式”能把数字转为分析视角：占总和的百分比、占行/列的百分比、父级百分比、差异、累计求和、升降排名等——例如一键算出每个部门销售额占全公司的比重。计算字段/计算项：在“数据透视表分析→字段、项目和集→计算字段”中可基于现有字段创建新指标（如“利润率=利润/销售额”），无需修改源数据。组合：对日期字段右键“组合”可按年/季/月自动归组；对数值字段可按区间分组（如年龄段 0-18、19-35…）。',
        tip: '💡 技巧：把同一字段（如“销售额”）拖入“值”区域两次，一个设为“求和”、另一个设为“占总和的百分比”，就能在同一张透视表里并排看到金额和占比。',
      },
      {
        title: '6.3 透视图、切片器与日程表',
        content: '数据透视图：基于透视表生成的动态图表，在“数据透视表分析→数据透视图”创建，调整透视表字段时图表同步变化，是制作交互式报告的基础。切片器：“插入→切片器”生成按钮式筛选面板，点击按钮即可过滤透视表（和透视图）；一个切片器可同时连接多个透视表（“报表连接”），实现一键联动多张报表，是仪表盘（Dashboard）的核心控件。日程表（Timeline）：针对日期字段的专用切片器，可用滑块按年/季/月/日范围快速筛选时间段。把透视图、切片器、日程表组合在一张工作表上，就构成了一个专业的交互式数据看板。',
        tip: '💡 提示：选中切片器→“切片器→报表连接”，勾选多个透视表，即可用一个切片器同时控制整个看板上的所有图表，点一下全部联动刷新。',
      },
      {
        title: '6.4 模拟分析与规划求解',
        content: 'Excel 内置“假设分析”工具用于预测和决策，在“数据→预测→模拟分析”中：【单变量求解】已知目标结果反推某个输入值（如“要让利润达到 100 万，销量需要是多少”）；【模拟运算表】批量计算一个或两个变量在不同取值下对结果的影响，生成敏感性分析表（如不同利率×不同年限下的月供矩阵）；【方案管理器】保存多组输入参数为不同“方案”（如乐观/中性/悲观），一键切换比较。【规划求解】（需在“文件→选项→加载项”中启用）可在多个约束条件下求最优解，用于资源分配、生产排程、投资组合等运筹优化问题。这些工具让 Excel 从记录数据升级为辅助决策。',
        warn: '⚠️ 提示：规划求解和分析工具库属于加载项，默认未启用。需在“文件→选项→加载项→Excel 加载项→转到”中勾选后才会出现在“数据”选项卡中。',
      },
    ],
  },
  {
    id: 'ch7', num: '第七章', title: '图表与可视化呈现', icon: '📈', level: '进阶',
    iconBg: '#fce7f3', levelBg: '#fce7f3', levelColor: '#831843',
    sections: [
      {
        title: '7.1 图表类型与选择原则',
        content: '选对图表类型是有效传达数据的前提。选中数据→“插入→图表”：【柱形图/条形图】比较不同类别的数值大小（条形图适合类别名称较长时）；【折线图】展示数据随时间的趋势变化；【饼图/圆环图】展示各部分占整体的比例（类别不宜超过 5-6 个）；【散点图】展示两个变量之间的相关性；【面积图】强调累计量或随时间的总量变化；【组合图】把柱形和折线叠加（如销量用柱、增长率用折线并启用次坐标轴）；【瀑布图】展示数值的逐项增减如何累积到最终值；【漏斗图】展示流程各阶段的转化；【树状图/旭日图】展示层级占比。原则：比大小用柱形、看趋势用折线、看占比用饼图、看关系用散点，图表要为信息服务而非堆砌华丽效果。',
        tip: '💡 提示：选中数据后按 Alt+F1 可一键生成默认图表，按 F11 则在新工作表中创建图表，比逐级点菜单更快。',
      },
      {
        title: '7.2 图表元素与美化',
        content: '图表由多个元素组成，点击图表后通过右上角的“+”（图表元素）增删：标题、数据标签、数据表、坐标轴标题、网格线、图例、趋势线、误差线等。设计原则（少即是多）：删除冗余的网格线和边框；给关键数据点直接加数据标签而非让读者去对坐标轴；图例位置合理；用一种主色调突出重点系列、其余系列用灰色弱化。在“图表设计”选项卡可一键套用预设样式和配色；“格式”选项卡精调每个元素的填充、边框、字体。双击任意元素打开右侧“设置格式”窗格做精细控制（如柱子间距、坐标轴最大最小值与刻度单位、数据标签格式）。坐标轴技巧：手动设定纵轴起点与最大值可避免误导性的视觉夸大。',
        warn: '⚠️ 注意：饼图不适合表示超过 6 个类别或类别数值接近的数据；折线图纵轴不从 0 开始时会放大波动、产生误导，正式报告中需谨慎并加以说明。',
      },
      {
        title: '7.3 迷你图与动态图表',
        content: '迷你图（Sparklines）：在单个单元格内绘制的微型图表，在“插入→迷你图”选折线/柱形/盈亏，适合在数据表旁边为每一行（如每个产品的月度趋势）配一个浓缩走势图，一眼看趋势。动态图表：让图表随选择自动变化。实现方式：①基于超级表的图表，数据增减时范围自动扩展；②配合切片器和数据透视图实现点击筛选；③用 FILTER 等动态数组函数构造随条件变化的数据源，图表跟着变；④用下拉列表（数据验证）+ 公式（如 CHOOSE/INDEX）切换显示不同数据系列。动态图表是制作交互式仪表盘的关键，让一张图能回答多个问题。',
        tip: '💡 技巧：先把数据源转成超级表再插入图表，之后每次往表里追加新行，图表会自动把新数据纳入，彻底告别手动拖拽调整数据范围。',
      },
      {
        title: '7.4 仪表盘（Dashboard）设计',
        content: '仪表盘是把多个关键指标、图表和筛选控件整合在一个屏幕上的可视化报告，用于一目了然地监控业务。设计流程：①明确受众和要回答的核心问题，确定 3-6 个关键指标（KPI）；②准备规范的数据源并用数据透视表汇总；③把透视图、KPI 卡片（用大字号数字+迷你图）、切片器、日程表合理布局（重要信息放左上，遵循视觉动线）；④用统一的配色和字体、对齐网格，去除多余装饰；⑤用切片器“报表连接”实现所有图表联动筛选。技巧：隐藏网格线（视图→取消勾选网格线）让画面更干净；把承载图表的辅助计算区放到单独的工作表并隐藏；适当用形状和文本框做分区标题。',
        tip: '💡 提示：仪表盘的灵魂是“联动”。用一个切片器同时连接所有透视表/透视图，用户点一下筛选条件，整个看板的数字和图表全部同步更新，这才是真正好用的动态报告。',
      },
    ],
  },
  {
    id: 'ch8', num: '第八章', title: '自动化与大神级技巧', icon: '🚀', level: '精通',
    iconBg: '#e0e7ff', levelBg: '#e0e7ff', levelColor: '#3730a3',
    sections: [
      {
        title: '8.1 Power Query：数据清洗自动化',
        content: 'Power Query（“数据→获取数据/获取和转换”）是 Excel 内置的强大 ETL 工具，能把繁琐重复的数据清洗整理工作变成一次设置、永久可一键刷新的自动化流程。典型用途：从多个文件/文件夹批量合并数据（如把 12 个月的销售表自动合并成一张）；连接数据库、网页、CSV、Excel 等多种数据源；自动完成去重、拆列、合并列、替换值、改数据类型、透视/逆透视、分组汇总、表间合并（类似数据库 JOIN）等操作。所有步骤被记录在“应用的步骤”中，源数据更新后只需点“刷新”，全部清洗逻辑自动重跑。处理完成后“关闭并上载”到工作表或数据模型。相比手动操作，Power Query 让重复性数据准备工作从每月数小时缩短到一键完成。',
        tip: '💡 提示：凡是每周/每月都要重复做的“导入→清洗→整理”工作，都应该用 Power Query 做一遍并保存。以后新数据进来只需替换源文件再点刷新，整个流程自动完成。',
      },
      {
        title: '8.2 Power Pivot 与数据模型',
        content: '当数据量超出工作表上限（百万行以上）或需要关联多张表分析时，用 Power Pivot 和数据模型。它基于内存压缩引擎，可处理千万级数据。核心能力：把多张表（如“订单表”“产品表”“客户表”）通过共同字段建立“关系”（如订单表的产品 ID 关联产品表），无需 VLOOKUP 反复合表，即可在透视表中跨表分析。DAX 公式语言：用于创建“度量值”（Measure）和“计算列”，如 =CALCULATE(SUM(销售额),筛选条件) 实现复杂的动态聚合、同比环比、累计等高级指标。Power Pivot + Power Query 的组合，使 Excel 具备了接近专业 BI 工具（如 Power BI）的数据建模与分析能力。',
        tip: '💡 提示：当你发现自己在用大量 VLOOKUP 把好几张表拼成一张大表来做透视时，就该改用 Power Pivot 建立表间关系了——更快、更省内存，也更易维护。',
      },
      {
        title: '8.3 宏与 VBA 自动化',
        content: '宏是把一系列操作录制下来反复回放的自动化功能。录制宏：在“视图→宏→录制宏”（或“开发工具”选项卡，需在选项中启用），命名后执行操作序列，再点“停止录制”，Excel 自动生成对应的 VBA 代码。运行宏：分配快捷键、放到快速访问工具栏按钮、或绑定到工作表中的图形按钮上一键触发。VBA 编辑器（Alt+F11）可查看和编写代码：Sub 过程名()…End Sub 定义宏；Range、Cells 引用单元格；用循环（For/Next）和判断（If）处理批量任务；用 Workbooks、Worksheets 操作工作簿和表。实用场景：批量格式化、自动生成报表、按条件拆分工作表为多个文件、批量发邮件等。含宏的文件必须存为 .xlsm 格式。',
        warn: '⚠️ 安全提示：宏可以执行强大操作，也可能被恶意利用。打开来源不明的含宏文件要谨慎，不要随意启用宏；在“信任中心”可管理宏安全级别。自己的宏文件存为 .xlsm 才能保留代码。',
      },
      {
        title: '8.4 打印、协作与效率精通',
        content: '打印设置：在“页面布局”设置纸张方向、页边距、打印区域（选中区域→“打印区域→设置打印区域”）；“打印标题”可让每页都重复表头行；用“分页预览”手动调整分页位置；在打印预览里用“将工作表调整为一页”避免表格被切断。协作：把工作簿存到 OneDrive/SharePoint 可多人“共同创作”实时编辑并看到彼此光标；用“审阅→批注/注释”交流；“修订”可追踪更改。效率精通建议：①善用快捷键（Ctrl+方向键导航、Ctrl+Shift+方向键选区、Ctrl+;插入当天日期、F4 重复上一操作）；②用命名区域让公式可读；③数据与展示分离、源数据规范化；④能用透视表/Power Query 解决的就不手动操作；⑤定期备份重要文件。把这些习惯内化，就完成了从入门到大神的跨越。',
        tip: '💡 终极建议：Excel 高手的核心不是记住多少函数，而是“结构化思维”——让数据源规范、用对工具（公式/透视表/Power Query/VBA 各司其职）、把重复工作自动化。掌握这套方法论，遇到任何新需求都能从容应对。',
      },
    ],
  },
]

export default function ExcelTutorialPage() {
  return (
    <div style={s.page}>
      <header style={s.header}>
        <div style={s.headerInner}>
          <div style={s.breadcrumb}>
            <Link href="/" style={s.breadLink}>ZZGCopilot</Link>
            <span style={s.breadSep}>/</span>
            <Link href="/tutorials" style={s.breadLink}>教程</Link>
            <span style={s.breadSep}>/</span>
            <span style={s.breadCurrent}>Excel 从入门到大神</span>
          </div>
          <Link href="/" style={s.backBtn}>← 返回首页</Link>
        </div>
      </header>

      <div style={s.hero}>
        <div style={s.heroInner}>
          <div style={s.heroTags}>
            <span style={s.tag}>📗 入门级</span>
            <span style={s.tag}>📙 进阶级</span>
            <span style={s.tag}>📕 大神级</span>
            <span style={s.tag}>✅ 全平台适用</span>
          </div>
          <h1 style={s.heroTitle}>Excel 从入门到大神</h1>
          <p style={s.heroDesc}>系统掌握 Microsoft Excel 全部核心能力——从单元格与格式基础、公式函数，到数据透视表、图表可视化，再到 Power Query、Power Pivot 与 VBA 自动化。8 大章节 · 32 个知识点，图文精讲，助你从零基础进阶为表格大神。</p>
          <div style={s.statsRow}>
            {[{v:'8',l:'章节数',i:'📖'},{v:'32',l:'知识点',i:'💡'},{v:'进阶',l:'难度',i:'📈'},{v:'全体',l:'适合人群',i:'👥'}].map(x=>(
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
            <p style={s.tipText}>建议按章节顺序学习，每章学完后打开 Excel 动手实践。先把数据源整理规范，再练公式与透视表，效率提升最快。</p>
          </div>
          <div style={{...s.tipCard, background:'linear-gradient(135deg,#fff7ed,#ffedd5)', marginTop:12}}>
            <div style={{...s.tipTitle, color:'#c2410c'}}>⌨️ 核心快捷键</div>
            <div style={{fontSize:12, color:'#4b5563', lineHeight:2}}>
              Ctrl+S 保存 · Ctrl+Z 撤销<br/>
              Ctrl+方向键 跳到边缘<br/>
              Alt+= 自动求和 · F4 切换引用<br/>
              Ctrl+T 超级表 · Ctrl+E 快速填充<br/>
              Ctrl+Shift+L 筛选 · Alt+F1 建图表
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
            <p style={s.ctaDesc}>你已系统掌握 Excel 从入门到大神的全部核心技能。现在打开 Excel，把这些技巧用到真实数据上，你会真切感受到效率的飞跃！</p>
            <div style={s.ctaBtns}>
              <Link href="/" style={s.ctaBtn1}>浏览更多教程</Link>
              <a href="#ch1" style={s.ctaBtn2}>重新阅读</a>
            </div>
          </div>
        </main>
      </div>

      <footer style={s.footer}>
        <p>© {new Date().getFullYear()} ZZGCopilot · Excel 从入门到大神完整教程 · 共 8 章 32 知识点</p>
      </footer>
    </div>
  )
}
