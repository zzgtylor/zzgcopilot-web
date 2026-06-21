'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

export default function RegisterPage() {
    const router = useRouter()
    const [name, setName] = useState('')
    const [email, setEmail] = useState('')
    const [password, setPassword] = useState('')
    const [confirm, setConfirm] = useState('')
    const [error, setError] = useState('')
    const [loading, setLoading] = useState(false)

  async function handleSubmit(e: React.FormEvent) {
        e.preventDefault()
        setError('')
        if (password !== confirm) {
                setError('两次输入的密码不一致')
                return
        }
        if (password.length < 8) {
                setError('密码至少需要8位字符')
                return
        }
        setLoading(true)
        try {
                const res = await fetch('/api/register', {
                          method: 'POST',
                          headers: { 'Content-Type': 'application/json' },
                          body: JSON.stringify({ name, email, password }),
                })
                const data = await res.json()
                if (!res.ok) {
                          setError(data.error || '注册失败，请稍后重试')
                } else {
                          router.push('/login?registered=1')
                }
        } catch {
                setError('注册失败，请稍后重试')
        } finally {
                setLoading(false)
        }
  }

  return (
        <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
              <div className="w-full max-w-md">
                      <div className="text-center mb-8">
                                <Link href="/" className="text-2xl font-bold text-gray-900">ZZGCopilot</Link>Link>
                                <p className="text-gray-500 mt-2">创建你的免费账号</p>p>
                      </div>div>
                      <div className="bg-white rounded-2xl shadow-sm border p-8">
                                <form onSubmit={handleSubmit} className="space-y-5">
                                  {error && (
                        <div className="bg-red-50 border border-red-200 text-red-700 text-sm px-4 py-3 rounded-lg">
                          {error}
                        </div>div>
                                            )}
                                            <div>
                                                          <label className="block text-sm font-medium text-gray-700 mb-1.5">昵称</label>label>
                                                          <input
                                                                            type="text"
                                                                            required
                                                                            value={name}
                                                                            onChange={e => setName(e.target.value)}
                                                                            placeholder="你的昵称"
                                                                            className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                                                                          />
                                            </div>div>
                                            <div>
                                                          <label className="block text-sm font-medium text-gray-700 mb-1.5">邮箱</label>label>
                                                          <input
                                                                            type="email"
                                                                            required
                                                                            value={email}
                                                                            onChange={e => setEmail(e.target.value)}
                                                                            placeholder="you@example.com"
                                                                            className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                                                                          />
                                            </div>div>
                                            <div>
                                                          <label className="block text-sm font-medium text-gray-700 mb-1.5">密码</label>label>
                                                          <input
                                                                            type="password"
                                                                            required
                                                                            value={password}
                                                                            onChange={e => setPassword(e.target.value)}
                                                                            placeholder="至少8位字符"
                                                                            className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                                                                          />
                                            </div>div>
                                            <div>
                                                          <label className="block text-sm font-medium text-gray-700 mb-1.5">确认密码</label>label>
                                                          <input
                                                                            type="password"
                                                                            required
                                                                            value={confirm}
                                                                            onChange={e => setConfirm(e.target.value)}
                                                                            placeholder="再次输入密码"
                                                                            className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                                                                          />
                                            </div>div>
                                            <button
                                                            type="submit"
                                                            disabled={loading}
                                                            className="w-full py-2.5 px-4 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition text-sm"
                                                          >
                                              {loading ? '注册中...' : '免费注册'}
                                            </button>button>
                                </form>form>
                                <p className="text-center text-sm text-gray-500 mt-6">
                                            已有账号？{' '}
                                            <Link href="/login" className="text-blue-600 hover:underline font-medium">立即登录</Link>Link>
                                </p>p>
                      </div>div>
              </div>div>
        </div>div>
      )
}</div>
