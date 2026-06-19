import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'ZZGCopilot - 教程网站',
  description: '分享编程教程、技术文章和实用指南',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="zh-CN">
      <body>{children}</body>
    </html>
  )
}
