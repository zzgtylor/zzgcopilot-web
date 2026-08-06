'use client'

import { useEffect, useState } from 'react'
import { signOut } from 'next-auth/react'

type SecurityInfo = {
  user?: { name?: string; email?: string; two_factor_enabled?: number; last_login_at?: string }
  recent?: { action: string; summary: string; ip_address?: string; created_at: string }[]
}
type SecurityResponse = SecurityInfo & { error?: string; success?: boolean; signOut?: boolean; secret?: string; recoveryCodes?: string[] }

export default function SecurityPage() {
  const [info, setInfo] = useState<SecurityInfo>({})
  const [error, setError] = useState('')
  const [message, setMessage] = useState('')
  const [currentPassword, setCurrentPassword] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [secret, setSecret] = useState('')
  const [code, setCode] = useState('')
  const [recoveryCodes, setRecoveryCodes] = useState<string[]>([])

  function load() {
    fetch('/api/admin/security', { cache: 'no-store' }).then(async response => {
      const data = await response.json() as SecurityResponse; if (!response.ok) throw new Error(data.error || '加载失败'); setInfo(data)
    }).catch(reason => setError(reason.message))
  }
  useEffect(load, [])

  async function run(payload: Record<string, string>) {
    setError(''); setMessage('')
    const response = await fetch('/api/admin/security', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) })
    const data = await response.json().catch(() => ({})) as SecurityResponse
    if (!response.ok) { setError(data.error || '操作失败'); return data }
    if (data.recoveryCodes) setRecoveryCodes(data.recoveryCodes)
    if (data.secret) setSecret(data.secret)
    setMessage(data.signOut ? '操作成功，即将重新登录。' : '操作成功。')
    if (data.signOut) setTimeout(() => void signOut({ callbackUrl: '/login' }), 1200)
    else load()
    return data
  }

  return <div className="mx-auto max-w-5xl p-5 sm:p-8">
    <div className="mb-7"><h1 className="text-2xl font-bold text-gray-900">账号安全</h1><p className="mt-1 text-sm text-gray-500">管理本人密码、两步验证和登录会话</p></div>
    {error && <p className="mb-5 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">{error}</p>}
    {message && <p className="mb-5 rounded-lg border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-700">{message}</p>}
    <div className="grid gap-6 lg:grid-cols-2">
      <section className="rounded-2xl border bg-white p-6"><h2 className="font-semibold text-gray-900">修改密码</h2><p className="mt-1 text-xs text-gray-500">修改后全部设备需要重新登录。</p><div className="mt-5 space-y-3"><input type="password" value={currentPassword} onChange={event => setCurrentPassword(event.target.value)} placeholder="当前密码" className="w-full rounded-lg border px-3 py-2.5 text-sm"/><input type="password" value={newPassword} onChange={event => setNewPassword(event.target.value)} placeholder="新密码（至少12位，含大小写字母和数字）" className="w-full rounded-lg border px-3 py-2.5 text-sm"/><button onClick={() => run({ action: 'changePassword', currentPassword, newPassword })} className="rounded-lg bg-blue-600 px-4 py-2.5 text-sm font-medium text-white">修改密码</button></div></section>
      <section className="rounded-2xl border bg-white p-6"><h2 className="font-semibold text-gray-900">两步验证</h2><p className="mt-1 text-sm text-gray-600">当前状态：<span className={info.user?.two_factor_enabled ? 'text-green-700' : 'text-amber-700'}>{info.user?.two_factor_enabled ? '已启用' : '未启用'}</span></p>{!info.user?.two_factor_enabled ? <div className="mt-5 space-y-3">{!secret ? <button onClick={async () => { const data = await run({ action: 'begin2fa' }); if (data?.secret) setSecret(data.secret) }} className="rounded-lg border px-4 py-2.5 text-sm font-medium text-gray-700">开始设置</button> : <><div className="rounded-lg bg-gray-50 p-4 text-sm"><p>在 Google Authenticator、Microsoft Authenticator 等应用中手动输入：</p><code className="mt-2 block break-all font-mono font-semibold text-blue-700">{secret}</code></div><input inputMode="numeric" value={code} onChange={event => setCode(event.target.value)} placeholder="输入应用显示的 6 位验证码" className="w-full rounded-lg border px-3 py-2.5 text-sm"/><button onClick={() => run({ action: 'enable2fa', code })} className="rounded-lg bg-blue-600 px-4 py-2.5 text-sm font-medium text-white">验证并启用</button></>}</div> : <div className="mt-5 space-y-3"><input type="password" value={currentPassword} onChange={event => setCurrentPassword(event.target.value)} placeholder="当前密码" className="w-full rounded-lg border px-3 py-2.5 text-sm"/><input inputMode="numeric" value={code} onChange={event => setCode(event.target.value)} placeholder="6 位验证码" className="w-full rounded-lg border px-3 py-2.5 text-sm"/><button onClick={() => run({ action: 'disable2fa', currentPassword, code })} className="rounded-lg border border-red-200 px-4 py-2.5 text-sm font-medium text-red-700">关闭两步验证</button></div>}</section>
      {recoveryCodes.length > 0 && <section className="rounded-2xl border border-amber-200 bg-amber-50 p-6 lg:col-span-2"><h2 className="font-semibold text-amber-900">请立即保存恢复码</h2><p className="mt-1 text-sm text-amber-800">每个恢复码只能使用一次，关闭窗口后不会再次显示。</p><div className="mt-4 grid grid-cols-2 gap-2 sm:grid-cols-4">{recoveryCodes.map(item => <code key={item} className="rounded bg-white px-3 py-2 text-center font-mono text-sm">{item}</code>)}</div></section>}
      <section className="rounded-2xl border bg-white p-6"><h2 className="font-semibold text-gray-900">登录会话</h2><p className="mt-1 text-sm text-gray-600">最近登录：{info.user?.last_login_at ? String(info.user.last_login_at).replace('T', ' ').slice(0, 16) : '暂无记录'}</p><button onClick={() => { if (confirm('确定退出所有设备上的登录吗？')) void run({ action: 'revokeSessions' }) }} className="mt-5 rounded-lg border px-4 py-2.5 text-sm font-medium text-gray-700">退出所有设备</button></section>
      <section className="rounded-2xl border bg-white p-6"><h2 className="font-semibold text-gray-900">最近安全记录</h2><div className="mt-4 divide-y">{(info.recent || []).map((item, index) => <div key={`${item.created_at}-${index}`} className="py-3 text-sm"><p className="text-gray-700">{item.summary}</p><p className="mt-1 text-xs text-gray-400">{String(item.created_at).replace('T', ' ').slice(0, 16)}{item.ip_address ? ` · ${item.ip_address}` : ''}</p></div>)}</div></section>
    </div>
  </div>
}
