import type { Metadata } from 'next'
import { ChapterView } from '../chapter-view'

export const metadata: Metadata = {
  title: '第7章 图片、图形与可视化 - Word 从入门到精通',
  description: '学习 Word 图片插入、裁剪、颜色处理、文字环绕、定位、SmartArt 与图表。',
}

const data = {
  meta: { n: 7, prev: 'ch6', next: 'ch8', part: '第三篇 · 对象排版', title: '图片、图形与可视化', subtitle: '让图片、图形和图表稳定地服务文档表达，而不是把版式弄乱。' },
  sections: [
    { title: '图片的插入与基本操作', blocks: [
      { type: 'concept', text: '图片可以从本地文件、剪贴板、截图或在线图片插入。插入后通过角部控制点等比缩放，通过“图片格式 → 裁剪”调整可见区域。正式文档建议控制图片分辨率和尺寸，避免页面体积过大或图片比例失真。' },
      { type: 'steps', title: '插入并规范一张截图', steps: ['点击“插入 → 图片 → 此设备”选择截图。', '拖动角部控制点调整大小，保持比例。', '进入“图片格式 → 裁剪”，去掉无关边缘。', '为图片添加题注，方便后续自动生成图表目录。'] },
    ] },
    { title: '图片颜色处理与艺术效果', blocks: [
      { type: 'concept', text: '“图片格式”提供亮度、对比度、锐化、颜色饱和度、重新着色和艺术效果。办公文档通常只需要轻度校正，目标是看清内容并统一风格，不建议使用强烈艺术滤镜。' },
      { type: 'tip', text: '对外发送前可使用“压缩图片”减小文件体积。屏幕阅读一般 150ppi 足够，打印材料再选择更高分辨率。' },
    ] },
    { title: '图片环绕方式与精确定位', blocks: [
      { type: 'concept', text: '图片默认“嵌入型”，像一个大字符一样随文字流动，最稳定；“四周型”和“紧密型”适合图文混排；“衬于文字下方”适合水印或背景。若图片经常乱跑，优先检查环绕方式和锚点。' },
      { type: 'pitfall', text: '不要随意使用“浮于文字上方”遮盖正文。它看似自由，打印、分页或多人编辑时最容易出现遮挡和错位。' },
      { type: 'case', title: '案例：报告里图片总是跑到下一页', text: '把图片改为“嵌入型”或“四周型”，并取消不必要的绝对定位；如果图片必须跟随某段说明文字，确保图片锚点在该段附近。' },
    ] },
    { title: 'SmartArt 图形与图表', blocks: [
      { type: 'concept', text: 'SmartArt 适合表达流程、层级、循环和关系；图表适合表达数据对比、趋势和占比。插入后可在设计选项卡更换布局、配色和样式。文档中所有图形应尽量使用同一套颜色和线条风格。' },
      { type: 'steps', title: '制作流程说明', steps: ['点击“插入 → SmartArt”，选择“流程”类型。', '在文本窗格输入每一步内容。', '使用 Tab 和 Shift+Tab 调整层级。', '选择简洁配色，避免三维效果影响阅读。'] },
    ] },
  ],
}

export default function Page() {
  return <ChapterView data={data} />
}
