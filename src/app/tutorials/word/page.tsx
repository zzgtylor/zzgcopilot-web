// @ts-nocheck
import Link from 'next/link'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Word 从入门到精通 - ZZGCopilot',
  description: '系统学习 Microsoft Word，掌握文档排版、样式设计、表格图片处理等核心技能，从零基础到高效办公。',
}

const chapters = [
  {
    id: 'intro',
    title: '第一章：认识 Word 界面',
    icon: '🖥️',
    level: '入门',
    color: 'bg-green-50 border-green-200',
    badge: 'bg-green-100 text-green-700',
    sections: [
      {
        title: '1.1 Word 界面总览',
        content: 'Microsoft Word 的界面由以下几个核心区域组成：标题栏显示文件名和程序名；功能区（Ribbon）是最重要的操作区域，包含"开始""插入""布局""引用"等选项卡；文档编辑区是输入和编辑内容的主要区域；状态栏位于底部，显示页码、字数、语言等信息；视图切换按钮可在阅读视图、页面视图、Web 版式视图之间切换。',
      },
      {
        title: '1.2 功能区详解',
        content: '功能区按功能分组：【开始】选项卡包含字体、段落、样式、剪贴板等最常用工具。【插入】选项卡用于添加表格、图片、图表、超链接、页眉页脚等元素。【布局】选项卡控制页面大小、页边距、分栏、段落间距。【引用】选项卡用于插入目录、脚注、尾注、参考文献。【邮件】选项卡提供邮件合并功能。【审阅】选项卡包含拼写检查、修订、批注、比较文档等。【视图】选项卡切换视图模式和窗口排列。',
      },
      {
        title: '1.3 快速访问工具栏',
        content: '快速访问工具栏位于标题栏左侧，默认包含"保存""撤销""重做"按钮。右键点击功能区中任意按钮，选择"添加到快速访问工具栏"，可将常用功能固定在此处，提高操作效率。建议将"新建""打印预览""格式刷"等添加至此。',
      },
    ],
  },
  {
    id: 'basic',
    title: '第二章：文字输入与编辑',
    icon: '✏️',
    level: '入门',
    color: 'bg-blue-50 border-blue-200',
    badge: 'bg-blue-100 text-blue-700',
    sections: [
      {
        title: '2.1 输入与选择文本',
        content: '点击文档任意位置即可开始输入。选择文本的常用方法：单击定位光标；双击选中一个词；三击选中一段；Ctrl+A 全选；按住 Shift + 方向键扩展选择；按住 Ctrl 可同时选中不连续的多处文本。Insert 键切换"插入/改写"模式，改写模式下输入会替换光标后的文字。',
      },
      {
        title: '2.2 查找与替换',
        content: '按 Ctrl+H 打开"查找和替换"对话框。在"查找内容"输入要找的文字，在"替换为"输入新文字，点"全部替换"批量修改。点击"更多"展开高级选项，可勾选"区分大小写""全字匹配""使用通配符"。通配符示例：? 匹配任意单字符，* 匹配任意多字符，[abc] 匹配括号内任意字符。替换格式：可将查找到的文字替换为特定格式（如加粗、变色）。',
      },
      {
        title: '2.3 撤销与恢复',
        content: 'Ctrl+Z 撤销最近操作，可多次撤销；Ctrl+Y 恢复被撤销的操作。Word 默认保留 100 步撤销历史，在"文件→选项→高级"中可修改。自动保存功能：在"文件→选项→保存"中设置自动保存间隔（建议 5 分钟）。文档恢复：意外关闭时，重新打开 Word 会提示恢复未保存的文档。',
      },
    ],
  },
  {
    id: 'format',
    title: '第三章：字体与段落格式',
    icon: '🎨',
    level: '基础',
    color: 'bg-purple-50 border-purple-200',
    badge: 'bg-purple-100 text-purple-700',
    sections: [
      {
        title: '3.1 字体格式设置',
        content: '选中文字后，在"开始"选项卡的"字体"组中设置：字体（宋体、微软雅黑、Times New Roman 等）；字号（磅值，常用 12pt/五号用于正文，16pt 用于小标题，22pt 用于大标题）；字形（加粗 Ctrl+B、倾斜 Ctrl+I、下划线 Ctrl+U）；字体颜色和文字突出显示颜色；上标（x²）和下标（H₂O）；删除线、字符间距。建议正文使用"中文字体：宋体，西文字体：Times New Roman，12pt"的搭配。',
      },
      {
        title: '3.2 段落格式设置',
        content: '段落格式决定文档的可读性。对齐方式：左对齐（Ctrl+L）适用于正文；居中（Ctrl+E）适用于标题；右对齐（Ctrl+R）适用于日期签名；两端对齐（Ctrl+J）适用于正式文档正文。行距：1.0 倍为紧凑，1.5 倍为标准，2.0 倍为双倍行距（常用于草稿审阅）。段前/段后间距：标题一般设置段前 12pt，段后 6pt。缩进：首行缩进 2 字符是中文段落规范，可在"段落"对话框精确设置。',
      },
      {
        title: '3.3 格式刷的使用',
        content: '格式刷是提高效率的利器。单击格式刷（或按 Ctrl+Shift+C）：复制一次格式后自动取消。双击格式刷：持续复制格式，可多次应用，按 Esc 或再次点击格式刷取消。批量格式化技巧：先将一处标题格式化好，双击格式刷，然后逐一刷过其他标题，效率极高。注意：格式刷同时复制字体格式和段落格式。',
      },
    ],
  },
  {
    id: 'styles',
    title: '第四章：样式与主题',
    icon: '🎭',
    level: '进阶',
    color: 'bg-amber-50 border-amber-200',
    badge: 'bg-amber-100 text-amber-700',
    sections: [
      {
        title: '4.1 内置样式的使用',
        content: '样式是格式的集合，是专业排版的核心。在"开始"选项卡的"样式"组中可看到内置样式：标题 1、标题 2、标题 3 用于各级标题；正文用于普通段落；引用用于块引用；列表段落用于项目列表。使用样式的好处：一键修改全文中所有使用该样式的文字；自动生成目录；在导航窗格中快速跳转；确保格式一致性。快捷键：Ctrl+Alt+1/2/3 分别应用标题1/2/3样式。',
      },
      {
        title: '4.2 修改和创建样式',
        content: '右键点击样式名称，选择"修改"可编辑样式：修改字体、段落等格式；勾选"自动更新"后，修改一处自动更新全文同类样式。创建新样式：点击样式窗格底部的"新建样式"，设置名称、基于哪个样式、后续段落样式。主题：在"设计"选项卡选择主题，可一键改变整个文档的配色方案和字体组合。推荐工作场景：公司报告用"丝状"主题，学术论文用"波形"主题，简历用"基础型"主题。',
      },
      {
        title: '4.3 目录的自动生成',
        content: '使用标题样式后，可在"引用"选项卡点击"目录"自动插入目录。目录类型：自动目录 1/2 会根据标题样式自动生成并格式化；手动目录需手动填写内容。更新目录：修改文档内容后，右键目录选择"更新域"，选择"更新整个目录"或"只更新页码"。目录格式自定义：点击"自定义目录"，可修改显示级别、制表符前导符（虚线/实线）、是否显示页码。',
      },
    ],
  },
  {
    id: 'layout',
    title: '第五章：页面布局与排版',
    icon: '📐',
    level: '进阶',
    color: 'bg-red-50 border-red-200',
    badge: 'bg-red-100 text-red-700',
    sections: [
      {
        title: '5.1 页面设置',
        content: '在"布局"选项卡→"页面设置"组：纸张大小：A4（210×297mm）是最常用的办公纸张；A3 用于海报；Letter 用于美式文档。页边距：上下 2.54cm、左右 3.18cm 是 Word 默认值；正式公文用上 3.7cm 下 3.5cm 左 2.8cm 右 2.6cm。纸张方向：纵向（Portrait）为默认，横向（Landscape）适合宽表格。分栏：在"栏"中设置双栏或三栏排版，适合杂志、新闻风格的文档。',
      },
      {
        title: '5.2 分页与分节',
        content: '分页符（Ctrl+Enter）：强制从下一页开始，常用于章节之间。分节符：比分页符更强大，可以在同一文档中设置不同的页面格式。"下一页"分节符：新节从新页开始，可设置不同页边距、纸张方向、页眉页脚。"连续"分节符：在同一页内分节，常用于实现部分内容分栏。"奇数页/偶数页"分节符：确保新节从奇数/偶数页开始，用于书籍排版。显示隐藏符号（Ctrl+*）：可看到分页符、分节符等格式标记。',
      },
      {
        title: '5.3 页眉、页脚与页码',
        content: '双击页眉/页脚区域进入编辑状态，或在"插入"→"页眉"/"页脚"中选择样式。首页不同：勾选"首页不同"使封面页没有页眉页脚。奇偶页不同：书籍排版中奇数页页眉显示章节名，偶数页显示书名。页码插入：在"插入"→"页码"选择位置和样式。页码格式：右键页码→"设置页码格式"，可从指定数字开始，或用罗马数字（目录页常用 i、ii、iii）。多节文档的页眉：默认"与上一节相同"，取消链接后可各节独立设置。',
      },
    ],
  },
  {
    id: 'table',
    title: '第六章：表格制作与美化',
    icon: '📊',
    level: '进阶',
    color: 'bg-teal-50 border-teal-200',
    badge: 'bg-teal-100 text-teal-700',
    sections: [
      {
        title: '6.1 创建和编辑表格',
        content: '插入表格的方法：在"插入"→"表格"中拖动选择行列数；点击"插入表格"精确指定行列；使用"绘制表格"徒手绘制不规则表格；从文本转换为表格（先用制表符或逗号分隔数据）。表格编辑：选中行/列后可右键插入或删除；拖动边框调整列宽；Alt+鼠标拖动可精确调整。合并单元格：选中要合并的单元格，右键选择"合并单元格"，常用于制作表格标题行。拆分单元格：右键选择"拆分单元格"，指定行列数。',
      },
      {
        title: '6.2 表格排版技巧',
        content: '列宽设置：右键表格→"表格属性"→"列"，精确设置宽度。自动调整：右键→"自动调整"→根据内容/窗口自动调整。标题行重复：对于跨页的长表格，选中标题行，在"布局"→"重复标题行"，使每页都显示标题。表格对齐：在"表格属性"→"表格"选项卡设置左对齐、居中或右对齐。文字环绕：选择"环绕"使文字绕排在表格周围。单元格对齐：在"布局"选项卡的对齐方式中，可设置文字在单元格内的水平和垂直对齐。',
      },
      {
        title: '6.3 表格样式与美化',
        content: '点击表格，在"表格设计"选项卡中选择预设样式，快速美化表格。推荐样式：商务报告用"网格表 4 - 着色 2"；简约风格用"浅色底纹 1"；学术文档用"网格表 1 浅色"。自定义边框：在"表格设计"→"边框"中，选择边框样式、粗细和颜色，使用"边框刷"单独给特定边框上色。底纹：选中单元格，在"底纹"中选择填充色，可突出显示重要数据行。表格公式：在"布局"→"公式"中可对表格内数据进行求和（=SUM(ABOVE)）等计算。',
      },
    ],
  },
  {
    id: 'image',
    title: '第七章：图片与图形处理',
    icon: '🖼️',
    level: '进阶',
    color: 'bg-pink-50 border-pink-200',
    badge: 'bg-pink-100 text-pink-700',
    sections: [
      {
        title: '7.1 插入与调整图片',
        content: '插入图片：在"插入"→"图片"→"此设备"选择本地图片；或直接从文件夹拖入文档。调整尺寸：拖动角部控制点等比例缩放（按住 Shift 精确等比）；在"图片格式"→"大小"中精确输入尺寸。裁剪：点击"裁剪"按钮，拖动裁剪框，再次点击确认。图片旋转：拖动顶部旋转控制点，或在"大小"中输入旋转角度。图片亮度/对比度：在"图片格式"→"更正"中调整；在"颜色"中设置饱和度和色调；在"艺术效果"中添加特效。',
      },
      {
        title: '7.2 文字环绕与图片布局',
        content: '选中图片后，在"图片格式"→"排列"→"自动换行"中设置：嵌入型（默认）：图片作为文字的一部分，随文字流动，对齐最严格。四周型：文字环绕图片四周矩形框。紧密型：文字紧贴图片轮廓环绕，适合不规则图形。上下型：图片独占一行，文字在其上下。穿越型：文字穿越图片白色区域（需设置图片透明区域）。浮于文字上方/下方：图片浮层，可盖住或被文字遮住。固定位置：图片固定在页面某位置，不随文字移动。',
      },
      {
        title: '7.3 SmartArt 与图表',
        content: 'SmartArt：在"插入"→"SmartArt"中选择图形类型（列表、流程、循环、层次结构、矩阵、棱锥图等），在文本窗格中输入内容，快速创建专业信息图。修改颜色：在"SmartArt 设计"→"更改颜色"中选择配色；在"SmartArt 样式"中选择立体/平面效果。图表：在"插入"→"图表"中选择类型（柱形、折线、饼图、条形、散点等），在弹出的 Excel 表格中输入数据，图表会自动更新。右键图表→"编辑数据"可随时修改数据；在"图表设计"和"格式"选项卡中美化图表。',
      },
    ],
  },
  {
    id: 'advanced',
    title: '第八章：高级技巧精通',
    icon: '🚀',
    level: '精通',
    color: 'bg-indigo-50 border-indigo-200',
    badge: 'bg-indigo-100 text-indigo-700',
    sections: [
      {
        title: '8.1 邮件合并',
        content: '邮件合并可批量生成个性化文档（邀请函、工资条、证书等）。步骤：1）准备数据源：Excel 表格，第一行为字段名（姓名、地址、金额等）。2）打开主文档：在"邮件"→"开始邮件合并"选择文档类型（信函/标签/目录等）。3）选择收件人：点击"选择收件人"→"使用现有列表"，选择 Excel 文件。4）插入合并域：将光标放在需要插入数据的位置，点击"插入合并域"选择字段。5）预览结果：点击"预览结果"检查。6）完成合并：点击"完成并合并"→"编辑单个文档"生成所有文档，或"打印文档"直接打印。',
      },
      {
        title: '8.2 宏与自动化',
        content: '宏可录制一系列操作并重复执行。录制宏：在"视图"→"宏"→"录制宏"，指定宏名称和快捷键，执行一系列操作，再点击"停止录制"。运行宏：按分配的快捷键，或在"宏"对话框中选择并运行。常用宏场景：批量修改格式、自动添加页眉信息、标准化文档结构。宏编辑：在"宏"→"编辑"中打开 VBA 编辑器，可直接编写 VBA 代码实现更复杂的自动化。注意：宏可能被防病毒软件拦截，需在"信任中心"中设置宏安全性。',
      },
      {
        title: '8.3 协作与修订',
        content: '修订模式（Track Changes）：按 Ctrl+Shift+E 开启，此后所有修改都会被标记（插入的文字带下划线，删除的文字带删除线，不同审阅者用不同颜色）。批注：选中文字→"插入"→"批注"（Ctrl+Alt+M）添加批注框，常用于审阅反馈。接受/拒绝修订：在"审阅"→"修订"中可逐一或全部接受/拒绝修订。比较文档：在"审阅"→"比较"→"比较"，选择两个版本文档，Word 会显示差异。保护文档：在"审阅"→"保护文档"→"限制编辑"，设置只允许批注或填写窗体，防止他人修改格式或内容。',
      },
    ],
  },
];

export default function WordTutorialPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white border-b sticky top-0 z-20 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Link href="/" className="text-gray-500 hover:text-gray-700 text-sm">ZZGCopilot</Link>
            <span className="text-gray-300">/</span>
            <Link href="/tutorials" className="text-gray-500 hover:text-gray-700 text-sm">教程</Link>
            <span className="text-gray-300">/</span>
            <span className="text-gray-900 font-medium text-sm">Word 从入门到精通</span>
          </div>
          <Link href="/" className="text-sm text-blue-600 hover:underline">返回首页</Link>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 py-8 flex gap-8">
        <aside className="hidden lg:block w-64 flex-shrink-0">
          <div className="sticky top-20">
            <div className="bg-white rounded-2xl border p-4 shadow-sm">
              <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3">目录导航</h3>
              <nav className="space-y-1">
                {chapters.map((ch) => (
                  <a
                    key={ch.id}
                    href={"#" + ch.id}
                    className="flex items-center gap-2 px-3 py-2 rounded-lg text-sm text-gray-600 hover:bg-gray-50 hover:text-gray-900 transition group"
                  >
                    <span className="text-base">{ch.icon}</span>
                    <span className="group-hover:translate-x-0.5 transition-transform">{ch.title.split('：')[0]}</span>
                  </a>
                ))}
              </nav>
            </div>
            <div className="mt-4 bg-blue-50 rounded-2xl border border-blue-100 p-4">
              <p className="text-xs text-blue-600 font-medium mb-1">📚 学习建议</p>
              <p className="text-xs text-gray-500 leading-relaxed">建议按章节顺序学习，每章完成后动手练习，效果更佳。</p>
            </div>
          </div>
        </aside>

        <main className="flex-1 min-w-0">
          <div className="bg-white rounded-2xl border p-8 mb-8 shadow-sm">
            <div className="flex items-start gap-4">
              <div className="text-5xl">📝</div>
              <div className="flex-1">
                <div className="flex flex-wrap gap-2 mb-3">
                  <span className="px-2 py-1 bg-green-100 text-green-700 text-xs font-medium rounded-full">入门</span>
                  <span className="px-2 py-1 bg-amber-100 text-amber-700 text-xs font-medium rounded-full">进阶</span>
                  <span className="px-2 py-1 bg-indigo-100 text-indigo-700 text-xs font-medium rounded-full">精通</span>
                  <span className="px-2 py-1 bg-gray-100 text-gray-600 text-xs font-medium rounded-full">8 章节 · 24 节课</span>
                </div>
                <h1 className="text-3xl font-bold text-gray-900 mb-3">Word 从入门到精通</h1>
                <p className="text-gray-500 leading-relaxed">系统学习 Microsoft Word 的核心功能，从界面认识、文字格式，到样式排版、表格图片处理，再到邮件合并和宏自动化。无论你是零基础新手还是希望提升效率的职场人士，本教程都能帮你快速掌握 Word 的精髓。</p>
              </div>
            </div>
            <div className="mt-6 grid grid-cols-2 md:grid-cols-4 gap-4">
              {[
                { label: '章节数', value: '8', icon: '📖' },
                { label: '知识点', value: '24', icon: '💡' },
                { label: '难度', value: '适中', icon: '📈' },
                { label: '适合人群', value: '全体', icon: '👥' },
              ].map((stat) => (
                <div key={stat.label} className="bg-gray-50 rounded-xl p-4 text-center">
                  <div className="text-2xl mb-1">{stat.icon}</div>
                  <div className="text-xl font-bold text-gray-900">{stat.value}</div>
                  <div className="text-xs text-gray-400">{stat.label}</div>
                </div>
              ))}
            </div>
          </div>

          <div className="space-y-8">
            {chapters.map((chapter, ci) => (
              <section key={chapter.id} id={chapter.id} className={"rounded-2xl border-2 overflow-hidden shadow-sm " + chapter.color}>
                <div className="px-8 py-5 border-b border-inherit">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <span className="text-3xl">{chapter.icon}</span>
                      <div>
                        <h2 className="text-xl font-bold text-gray-900">{chapter.title}</h2>
                      </div>
                    </div>
                    <span className={"px-3 py-1 rounded-full text-xs font-semibold " + chapter.badge}>{chapter.level}</span>
                  </div>
                </div>
                <div className="divide-y divide-inherit">
                  {chapter.sections.map((sec, si) => (
                    <div key={si} className="px-8 py-6">
                      <h3 className="text-base font-semibold text-gray-800 mb-3 flex items-center gap-2">
                        <span className="w-6 h-6 bg-white rounded-full flex items-center justify-center text-xs font-bold text-gray-500 shadow-sm border">{si + 1}</span>
                        {sec.title}
                      </h3>
                      <p className="text-gray-600 leading-relaxed text-sm">{sec.content}</p>
                    </div>
                  ))}
                </div>
              </section>
            ))}
          </div>

          <div className="mt-10 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-2xl p-8 text-center text-white">
            <h2 className="text-2xl font-bold mb-3">🎉 恭喜完成学习！</h2>
            <p className="text-blue-100 mb-6">你已经掌握了 Word 从入门到精通的核心知识，现在动手实践，打开 Word 练习吧！</p>
            <div className="flex flex-wrap gap-4 justify-center">
              <Link href="/" className="px-6 py-3 bg-white text-blue-600 rounded-xl font-medium hover:bg-blue-50 transition">浏览更多教程</Link>
              <a href="#intro" className="px-6 py-3 bg-blue-500 text-white rounded-xl font-medium hover:bg-blue-400 transition">重新阅读</a>
            </div>
          </div>
        </main>
      </div>

      <footer className="border-t mt-16 py-8 bg-white">
        <div className="max-w-7xl mx-auto px-4 text-center text-sm text-gray-400">
          <p>© {new Date().getFullYear()} ZZGCopilot - Word 从入门到精通教程</p>
        </div>
      </footer>
    </div>
  );
}
