'use client'
import { useState } from 'react'
import { signIn } from 'next-auth/react'
import { useRouter, useSearchParams } from 'next/navigation'
import Link from 'next/link'

export default function LoginPage() {
    const router = useRouter()
    const searchParams = useSearchParams()
    const callbackUrl = searchParams.get('callbackUrl') || '/'
    const [email, setEmail] = useState('')
    const [password, setPassword] = useState('')
    const [error, setError] = useState('')
    const [loading, setLoading] = useState(false)

  async function handleSubmit(e: React.FormEvent) {
        e.preventDefault()
        setError('')
        setLoading(true)
        try {
                const result = await signIn('credentials', {
                          email,
                          password,
                          redirect: false,
                })
                if (result?.error) {
                          setError('邮箱或密码错误，请重试')
                } else {
                          router.push(callbackUrl)
                          router.refresh()
                }
        } catch {
                setError('登录失败，请稍后重试')
        } finally {
                setLoading(false)
        }
  }

  return (
        <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
              <div className="w-full max-w-md">
                      <div className="text-center mb-8">
                                <Link href="/" className="text-2xl font-bold text-gray-900">ZZGCopilot</Link>Link>
                                <p className="text-gray-500 mt-2">登录你的账号</p>p>
                      </div>div>
                      <div className="bg-white rounded-2xl shadow-sm border p-8">
                                <form onSubmit={handleSubmit} className="space-y-5">
                                  {error && (
                        <div className="bg-red-50 border border-red-200 text-red-700 text-sm px-4 py-3 rounded-lg">
                          {error}
                        </div>div>
                                            )}
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
                                                                            placeholder="输入密码"
                                                                            className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                                                                          />
                                            </div>div>
                                            <button
                                                            type="submit"
                                                            disabled={loading}
                                                            className="w-full py-2.5 px-4 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition text-sm"
                                                          >
                                              {loading ? '登录中...' : '登录'}
                                            </button>button>
                                </form>form>
                                <p className="text-center text-sm text-gray-500 mt-6">
                                            还没有账号？{' '}
                                            <Link href="/register" className="text-blue-600 hover:underline font-medium">免费注册</Link>Link>
                                </p>p>
                      </div>div>
              </div>div>
        </div>div>
      )
}</div>
