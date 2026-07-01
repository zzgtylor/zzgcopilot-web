'use client'

import { useEffect, useMemo, useState } from 'react'
import { Eye, LayoutPanelTop, LinkIcon, Palette, RotateCcw, Save, Search, Type } from 'lucide-react'
import HomeBlocksEditor from '@/components/admin/HomeBlocksEditor'

const DEFAULT_FORM = {
  siteName: 'ZZGCopilot',
  navTutorialsLabel: '教程',
  navLoginLabel: '登录',
  navRegisterLabel: '注册',
  heroTitle: '学习编程，从这里开始',
  heroSubtitle: '高质量的编程教程、技术文章和实用指南',
  primaryCtaLabel: '浏览教程',
  primaryCtaHref: '/tutorials',
  secondaryCtaLabel: '免费注册',
  secondaryCtaHref: '/register',
  latestTitle: '最新教程',
  emptyTitle: '暂无教程',
  emptyActionLabel: '管理员发布第一篇文章',
  footerText: 'ZZGCopilot. 保留所有权利。',
  themeColor: '#2563eb',
  heroTone: 'blue',
  showRegisterCta: 'true',
  showLatestTutorials: 'true',
  seoDefaultTitle: 'ZZGCopilot - 教程网站',
  seoDefaultDescription: '分享编程教程、技术文章和实用指南',
  seoDefaultOgImage: '',
}

const heroTones = [
  { value: 'blue', label: '清爽蓝', className: 'bg-blue-50' },
  { value: 'emerald', label: '学习绿', className: 'bg-emerald-50' },
  { value: 'slate', label: '专业灰', className: 'bg-slate-100' },
  { value: 'rose', label: '柔和红', className: 'bg-rose-50' },
]

const themeColors = ['#2563eb', '#059669', '#475569', '#e11d48', '#7c3aed', '#ea580c']

export default function SiteSettingsPage() {
  const [form, setForm] = useState(DEFAULT_FORM)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [message, setMessage] = useState('')
  const [error, setError] = useState('')

  useEffect(() => {
    fetch('/api/admin/site-settings')
      .then((r) => (r.ok ? r.json() : null))
      .then((data: any) => {
        if (data?.settings) setForm({ ...DEFAULT_FORM, ...data.settings })
      })
      .catch(() => setError('设置加载失败'))
      .finally(() => setLoading(false))
  }, [])

  const activeTone = useMemo(
    () => heroTones.find((tone) => tone.value === form.heroTone) || heroTones[0],
    [form.heroTone]
  )

  function update(key: string, value: string) {
    setMessage('')
    setError('')
    setForm((current) => ({ ...current, [key]: value }))
  }

  async function save() {
    setSaving(true)
    setMessage('')
    setError('')

    const response = await fetch('/api/admin/site-settings', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ settings: form }),
    }).catch(() => null)

    const data: any = response ? await response.json().catch(() => ({})) : {}

    if (!response || !response.ok) {
      setError(data.error || '保存失败')
    } else {
      setForm({ ...DEFAULT_FORM, ...data.settings })
      setMessage('已保存')
    }

    setSaving(false)
  }

  return (
    <div className="px-8 py-7">
      <div className="mb-6 flex items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">站点设置</h1>
          <p className="mt-1 text-sm text-gray-500">编辑首页文案、按钮、导航和基础视觉风格</p>
        </div>
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => setForm(DEFAULT_FORM)}
            className="inline-flex items-center gap-2 rounded-lg border px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
          >
            <RotateCcw className="h-4 w-4" />
            恢复默认
          </button>
          <button
            type="button"
            onClick={save}
            disabled={saving || loading}
            className="inline-flex items-center gap-2 rounded-lg bg-gray-900 px-4 py-2 text-sm font-medium text-white disabled:opacity-50"
          >
            <Save className="h-4 w-4" />
            {saving ? '保存中' : '保存'}
          </button>
        </div>
      </div>

      {message && <div className="mb-5 rounded-lg border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-700">{message}</div>}
      {error && <div className="mb-5 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">{error}</div>}

      <div className="grid grid-cols-[minmax(0,1fr)_380px] gap-6">
        <div className="space-y-5">
          <SettingsSection icon={<Type className="h-4 w-4" />} title="品牌和导航">
            <Field label="站点名称" value={form.siteName} onChange={(value) => update('siteName', value)} />
            <div className="grid grid-cols-3 gap-4">
              <Field label="教程入口" value={form.navTutorialsLabel} onChange={(value) => update('navTutorialsLabel', value)} />
              <Field label="登录入口" value={form.navLoginLabel} onChange={(value) => update('navLoginLabel', value)} />
              <Field label="注册入口" value={form.navRegisterLabel} onChange={(value) => update('navRegisterLabel', value)} />
            </div>
          </SettingsSection>

          <SettingsSection icon={<LayoutPanelTop className="h-4 w-4" />} title="首页首屏">
            <Field label="主标题" value={form.heroTitle} onChange={(value) => update('heroTitle', value)} />
            <Field label="副标题" value={form.heroSubtitle} onChange={(value) => update('heroSubtitle', value)} multiline />
            <div className="grid grid-cols-2 gap-4">
              <Field label="主按钮文字" value={form.primaryCtaLabel} onChange={(value) => update('primaryCtaLabel', value)} />
              <Field label="主按钮链接" value={form.primaryCtaHref} onChange={(value) => update('primaryCtaHref', value)} icon={<LinkIcon className="h-4 w-4" />} />
              <Field label="次按钮文字" value={form.secondaryCtaLabel} onChange={(value) => update('secondaryCtaLabel', value)} />
              <Field label="次按钮链接" value={form.secondaryCtaHref} onChange={(value) => update('secondaryCtaHref', value)} icon={<LinkIcon className="h-4 w-4" />} />
            </div>
          </SettingsSection>

          <SettingsSection icon={<Palette className="h-4 w-4" />} title="视觉风格">
            <div>
              <label className="mb-2 block text-sm font-medium text-gray-700">主题色</label>
              <div className="flex flex-wrap gap-2">
                {themeColors.map((color) => (
                  <button
                    key={color}
                    type="button"
                    onClick={() => update('themeColor', color)}
                    className={`h-9 w-9 rounded-full border-2 ${form.themeColor === color ? 'border-gray-900' : 'border-white'} shadow-sm`}
                    style={{ backgroundColor: color }}
                    aria-label={color}
                  />
                ))}
                <input
                  type="text"
                  value={form.themeColor}
                  onChange={(event) => update('themeColor', event.target.value)}
                  className="h-9 w-28 rounded-lg border px-3 text-sm font-mono"
                />
              </div>
            </div>
            <div>
              <label className="mb-2 block text-sm font-medium text-gray-700">首页背景</label>
              <div className="grid grid-cols-4 gap-3">
                {heroTones.map((tone) => (
                  <button
                    key={tone.value}
                    type="button"
                    onClick={() => update('heroTone', tone.value)}
                    className={`rounded-lg border p-3 text-left text-sm ${form.heroTone === tone.value ? 'border-gray-900' : 'border-gray-200'}`}
                  >
                    <span className={`mb-2 block h-10 rounded ${tone.className}`} />
                    {tone.label}
                  </button>
                ))}
              </div>
            </div>
          </SettingsSection>

          <SettingsSection icon={<Eye className="h-4 w-4" />} title="内容区和页脚">
            <div className="grid grid-cols-2 gap-4">
              <Toggle label="显示注册按钮" checked={form.showRegisterCta === 'true'} onChange={(checked) => update('showRegisterCta', checked ? 'true' : 'false')} />
              <Toggle label="显示最新教程" checked={form.showLatestTutorials === 'true'} onChange={(checked) => update('showLatestTutorials', checked ? 'true' : 'false')} />
            </div>
            <Field label="教程区标题" value={form.latestTitle} onChange={(value) => update('latestTitle', value)} />
            <div className="grid grid-cols-2 gap-4">
              <Field label="空内容提示" value={form.emptyTitle} onChange={(value) => update('emptyTitle', value)} />
              <Field label="空内容按钮" value={form.emptyActionLabel} onChange={(value) => update('emptyActionLabel', value)} />
            </div>
            <Field label="页脚文字" value={form.footerText} onChange={(value) => update('footerText', value)} />
          </SettingsSection>
        </div>

        <aside className="sticky top-6 h-fit rounded-lg border bg-white p-4">
          <div className="mb-3 flex items-center justify-between">
            <h2 className="font-semibold text-gray-900">实时预览</h2>
            <span className="text-xs text-gray-400">首页首屏</span>
          </div>
          <div className="overflow-hidden rounded-lg border">
            <div className="flex items-center justify-between border-b bg-white px-4 py-3">
              <span className="text-sm font-bold text-gray-900">{form.siteName}</span>
              <div className="flex items-center gap-3 text-xs text-gray-500">
                <span>{form.navTutorialsLabel}</span>
                <span>{form.navLoginLabel}</span>
                {form.showRegisterCta === 'true' && (
                  <span className="rounded px-2 py-1 text-white" style={{ backgroundColor: form.themeColor }}>
                    {form.navRegisterLabel}
                  </span>
                )}
              </div>
            </div>
            <div className={`${activeTone.className} px-6 py-12 text-center`}>
              <h3 className="text-2xl font-bold leading-tight text-gray-900">{form.heroTitle}</h3>
              <p className="mx-auto mt-4 max-w-xs text-sm leading-6 text-gray-600">{form.heroSubtitle}</p>
              <div className="mt-6 flex justify-center gap-3">
                <span className="rounded-lg px-4 py-2 text-xs font-medium text-white" style={{ backgroundColor: form.themeColor }}>
                  {form.primaryCtaLabel}
                </span>
                {form.showRegisterCta === 'true' && (
                  <span className="rounded-lg border border-gray-300 px-4 py-2 text-xs font-medium text-gray-700">
                    {form.secondaryCtaLabel}
                  </span>
                )}
              </div>
            </div>
            {form.showLatestTutorials === 'true' && (
              <div className="bg-white px-6 py-5">
                <h4 className="text-sm font-semibold text-gray-900">{form.latestTitle}</h4>
                <p className="mt-4 text-center text-xs text-gray-400">{form.emptyTitle}</p>
              </div>
            )}
          </div>
        </aside>
      </div>
    </div>
  )
}

function SettingsSection({ children, icon, title }: { children: React.ReactNode; icon: React.ReactNode; title: string }) {
  return (
    <section className="rounded-lg border bg-white p-5">
      <div className="mb-5 flex items-center gap-2">
        <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-gray-100 text-gray-700">{icon}</span>
        <h2 className="font-semibold text-gray-900">{title}</h2>
      </div>
      <div className="space-y-4">{children}</div>
    </section>
  )
}

function Field({
  icon,
  label,
  multiline,
  onChange,
  value,
}: {
  icon?: React.ReactNode
  label: string
  multiline?: boolean
  onChange: (value: string) => void
  value: string
}) {
  return (
    <label className="block">
      <span className="mb-1.5 block text-sm font-medium text-gray-700">{label}</span>
      <span className="relative block">
        {icon && <span className="pointer-events-none absolute left-3 top-2.5 text-gray-400">{icon}</span>}
        {multiline ? (
          <textarea
            value={value}
            onChange={(event) => onChange(event.target.value)}
            rows={3}
            className="w-full resize-none rounded-lg border px-3 py-2 text-sm leading-6 outline-none focus:border-gray-900"
          />
        ) : (
          <input
            type="text"
            value={value}
            onChange={(event) => onChange(event.target.value)}
            className={`w-full rounded-lg border py-2 text-sm outline-none focus:border-gray-900 ${icon ? 'pl-9 pr-3' : 'px-3'}`}
          />
        )}
      </span>
    </label>
  )
}

function Toggle({ checked, label, onChange }: { checked: boolean; label: string; onChange: (checked: boolean) => void }) {
  return (
    <button
      type="button"
      onClick={() => onChange(!checked)}
      className="flex items-center justify-between rounded-lg border px-4 py-3 text-left text-sm"
    >
      <span className="font-medium text-gray-700">{label}</span>
      <span className={`flex h-6 w-11 items-center rounded-full p-1 transition ${checked ? 'bg-gray-900' : 'bg-gray-200'}`}>
        <span className={`h-4 w-4 rounded-full bg-white transition ${checked ? 'translate-x-5' : ''}`} />
      </span>
    </button>
  )
}
