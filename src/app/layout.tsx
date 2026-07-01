import type { Metadata } from 'next'
import './globals.css'
import { getSiteSettings } from '@/lib/site-settings'

export async function generateMetadata(): Promise<Metadata> {
  const settings = await getSiteSettings()
  return {
    metadataBase: new URL('https://zzgcopilot.com'),
    title: settings.seoDefaultTitle,
    description: settings.seoDefaultDescription,
    openGraph: {
      title: settings.seoDefaultTitle,
      description: settings.seoDefaultDescription,
      images: settings.seoDefaultOgImage ? [settings.seoDefaultOgImage] : undefined,
      siteName: settings.siteName,
    },
    twitter: {
      card: 'summary_large_image',
      title: settings.seoDefaultTitle,
      description: settings.seoDefaultDescription,
      images: settings.seoDefaultOgImage ? [settings.seoDefaultOgImage] : undefined,
    },
  }
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="zh-CN">
      <body>{children}</body>
    </html>
  )
}
