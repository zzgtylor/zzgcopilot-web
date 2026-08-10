import type { Metadata } from 'next'
import './globals.css'
import { getSanitySiteSettings } from '@/lib/sanity-content'
import { AnalyticsBeacon } from '@/components/AnalyticsBeacon'

export async function generateMetadata(): Promise<Metadata> {
  const settings = await getSanitySiteSettings()
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

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  const settings = await getSanitySiteSettings()
  const bodyFont = settings.bodyFont === 'serif' ? 'Georgia, serif' : settings.bodyFont === 'sans' ? 'Arial, sans-serif' : "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif"
  const headingFont = settings.headingFont === 'sans' ? 'Arial, sans-serif' : 'Georgia, serif'
  return (
    <html lang="zh-CN" data-site-theme={settings.themePreset} data-card-style={settings.cardStyle} data-nav-style={settings.navigationStyle} data-card-columns={settings.cardColumns} style={{ '--site-primary': settings.primaryColor, '--site-secondary': settings.secondaryColor, '--site-header-bg': settings.headerBackgroundColor, '--site-surface': settings.surfaceColor, '--site-card-bg': settings.cardBackgroundColor, '--site-content-width': `${settings.contentWidth}px`, '--site-home-width': `${settings.homepageMaxWidth}px`, '--site-card-radius': `${settings.cardRadius}px`, '--site-card-gap': `${settings.cardGap}px`, '--site-card-image-height': `${settings.cardImageHeight}px`, '--site-body-font': bodyFont, '--site-heading-font': headingFont } as React.CSSProperties}>
      <body>{children}{settings.analyticsEnabled ? <AnalyticsBeacon /> : null}</body>
    </html>
  )
}
