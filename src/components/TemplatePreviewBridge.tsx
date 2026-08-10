'use client'

import { useEffect } from 'react'

const presets: Record<string, Record<string, string>> = {
  classic: { theme: 'classic', primary: '#11567f', secondary: '#142844', header: '#ffffff', surface: '#f8f9fa', card: '#ffffff', body: "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif", heading: 'Georgia, serif', homeWidth: '1480px', contentWidth: '768px', radius: '6px', gap: '24px', imageHeight: '150px', columns: '3', cardStyle: 'elevated', navStyle: 'sticky' },
  minimal: { theme: 'minimal', primary: '#2563eb', secondary: '#111827', header: '#ffffff', surface: '#ffffff', card: '#ffffff', body: 'Arial, sans-serif', heading: 'Arial, sans-serif', homeWidth: '1560px', contentWidth: '800px', radius: '14px', gap: '20px', imageHeight: '170px', columns: '4', cardStyle: 'bordered', navStyle: 'sticky' },
  editorial: { theme: 'editorial', primary: '#9a3412', secondary: '#3f2a1d', header: '#fffdf9', surface: '#fbf7f2', card: '#fffdf9', body: 'Georgia, serif', heading: 'Georgia, serif', homeWidth: '1320px', contentWidth: '720px', radius: '4px', gap: '32px', imageHeight: '240px', columns: '2', cardStyle: 'flat', navStyle: 'static' },
  forest: { theme: 'forest', primary: '#047857', secondary: '#16352d', header: '#ffffff', surface: '#f4f8f5', card: '#ffffff', body: "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif", heading: 'Arial, sans-serif', homeWidth: '1480px', contentWidth: '820px', radius: '10px', gap: '24px', imageHeight: '180px', columns: '3', cardStyle: 'bordered', navStyle: 'sticky' },
}

export function TemplatePreviewBridge() {
  useEffect(() => {
    const preset = presets[new URLSearchParams(window.location.search).get('templatePreview') || '']
    if (!preset) return
    const root = document.documentElement
    root.dataset.siteTheme = preset.theme
    root.dataset.cardStyle = preset.cardStyle
    root.dataset.navStyle = preset.navStyle
    root.dataset.cardColumns = preset.columns
    const values: Record<string, string> = { '--site-primary': preset.primary, '--site-secondary': preset.secondary, '--site-header-bg': preset.header, '--site-surface': preset.surface, '--site-card-bg': preset.card, '--site-body-font': preset.body, '--site-heading-font': preset.heading, '--site-home-width': preset.homeWidth, '--site-content-width': preset.contentWidth, '--site-card-radius': preset.radius, '--site-card-gap': preset.gap, '--site-card-image-height': preset.imageHeight }
    Object.entries(values).forEach(([name, value]) => root.style.setProperty(name, value))
  }, [])
  return null
}
