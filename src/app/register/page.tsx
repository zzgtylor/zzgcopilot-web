'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

export default function RegisterPage() {
  const registrationEnabled = process.env.NEXT_PUBLIC_REGISTRATION_ENABLED === 'true'
  const router = useRouter()
  const [form, setForm] = useState({ name: '', email: '', password: '', confirm: '' })
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const set = (k) => (e) => setForm(f => ({...f, [k]: e.target.value}))

  async function handleSubmit(e) {
    e.preventDefault()
    setError('')
    if (form.password !== form.confirm) return setError('两次输入的密码不一致')
    if (form.password.length < 12 || !/[A-Z]/.test(form.password) || !/[a-z]/.test(form.password) || !/\d/.test(form.password)) return setError('密码至少12位，并包含大小写字母和数字')
    setLoading(true)
    try {
      const res = await fetch('/api/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: form.name, email: form.email, password: form.password }),
      })
      const data: any = await res.json()
      if (!res.ok) setError(data.error || '注册失败，请稍后重试')
      else router.push('/login?registered=1')
    } catch { setError('注册失败，请稍后重试') }
    finally { setLoading(false) }
  }

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <Link href="/" className="text-2xl font-bold text-gray-900">ZZGCopilot</Link>
          <p className="text-gray-500 mt-2">创建你的免费账号</p>
        </div>
        <div className="bg-white rounded-2xl border p-8">
          {!registrationEnabled ? <div className="rounded-xl border border-amber-200 bg-amber-50 px-5 py-6 text-center"><p className="font-medium text-amber-900">公开注册当前已关闭</p><p className="mt-2 text-sm leading-6 text-amber-800">请联系网站管理员创建账号，已有账号可以直接登录。</p><Link href="/login" className="mt-5 inline-flex rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white">前往登录</Link></div> : <form onSubmit={handleSubmit} className="space-y-5">
            {error && <p className="text-red-600 text-sm">{error}</p>}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">昵称</label>
              <input type="text" required value={form.name} onChange={set('name')} placeholder="你的昵称" className="w-full px-4 py-2.5 border rounded-lg text-sm" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">邮箱</label>
              <input type="email" required value={form.email} onChange={set('email')} placeholder="you@example.com" className="w-full px-4 py-2.5 border rounded-lg text-sm" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">密码</label>
              <input type="password" required value={form.password} onChange={set('password')} placeholder="至少12位，包含大小写字母和数字" className="w-full px-4 py-2.5 border rounded-lg text-sm" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">确认密码</label>
              <input type="password" required value={form.confirm} onChange={set('confirm')} placeholder="再次输入密码" className="w-full px-4 py-2.5 border rounded-lg text-sm" />
            </div>
            <button type="submit" disabled={loading} className="w-full py-2.5 bg-blue-600 text-white rounded-lg text-sm disabled:opacity-50">
              {loading ? '注册中...' : '免费注册'}
            </button>
          </form>}
          <p className="text-center text-sm text-gray-500 mt-6">
            已有账号？ <Link href="/login" className="text-blue-600">立即登录</Link>
          </p>
        </div>
      </div>
    </div>
  )
}
