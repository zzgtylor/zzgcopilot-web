'use client'

import { ArrowUp, Check, Copy, Share2 } from 'lucide-react'
import { useEffect, useState } from 'react'

export function ArticleEnhancements({ title, readingProgress, shareButtons, backToTop }: { title: string; readingProgress: boolean; shareButtons: boolean; backToTop: boolean }) {
  const [progress, setProgress] = useState(0)
  const [copied, setCopied] = useState(false)
  const [showTop, setShowTop] = useState(false)

  useEffect(() => {
    if (!readingProgress && !backToTop) return
    const update = () => {
      const available = document.documentElement.scrollHeight - window.innerHeight
      setProgress(available > 0 ? Math.min(100, Math.max(0, window.scrollY / available * 100)) : 0)
      setShowTop(window.scrollY > 560)
    }
    update()
    window.addEventListener('scroll', update, { passive: true })
    window.addEventListener('resize', update)
    return () => { window.removeEventListener('scroll', update); window.removeEventListener('resize', update) }
  }, [backToTop, readingProgress])

  async function share() {
    const data = { title, url: window.location.href }
    if (navigator.share) {
      try { await navigator.share(data); return } catch { /* The visitor cancelled or sharing is unavailable. */ }
    }
    await navigator.clipboard.writeText(data.url)
    setCopied(true)
    window.setTimeout(() => setCopied(false), 1800)
  }

  return <>
    {readingProgress ? <div className="fixed inset-x-0 top-0 z-[70] h-1 bg-black/5" aria-hidden="true"><div className="h-full bg-[var(--site-primary)] transition-[width] duration-100" style={{ width: `${progress}%` }} /></div> : null}
    {shareButtons ? <button type="button" onClick={share} className="mt-8 inline-flex items-center gap-2 rounded-full border border-gray-200 bg-white px-4 py-2 text-sm font-medium text-gray-700 shadow-sm transition hover:border-[var(--site-primary)] hover:text-[var(--site-primary)]" aria-label="分享文章">{copied ? <Check className="h-4 w-4" /> : navigatorCanShare() ? <Share2 className="h-4 w-4" /> : <Copy className="h-4 w-4" />}{copied ? '链接已复制' : '分享文章'}</button> : null}
    {backToTop && showTop ? <button type="button" onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })} className="fixed bottom-6 right-6 z-50 inline-flex h-11 w-11 items-center justify-center rounded-full bg-[var(--site-primary)] text-white shadow-lg transition hover:bg-[var(--site-secondary)]" aria-label="返回顶部"><ArrowUp className="h-5 w-5" /></button> : null}
  </>
}

function navigatorCanShare() {
  return typeof navigator !== 'undefined' && typeof navigator.share === 'function'
}
