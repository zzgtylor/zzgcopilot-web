'use client'

import { useState, useEffect, useCallback } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { 
  LayoutDashboard, FileText, MessageSquare, Users, Image, 
  Plus, Edit, Trash2, Eye, EyeOff, Save, X, Upload, 
  BarChart3, Settings, LogOut, ChevronDown, ChevronUp, Loader2
} from 'lucide-react'

export const runtime = 'edge'

interface Post {
  id: string
  title: string
  slug: string
  status: 'draft' | 'published' | 'archived'
  author_name: string
  category_name?: string
  view_count: number
  created_at: string
}

interface Stats {
  posts: number
  users: number
  comments: number
}

type AdminTab = 'dashboard' | 'posts' | 'new-post' | 'edit-post' | 'media' | 'comments' | 'users'

export default function AdminPage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [activeTab, setActiveTab] = useState<AdminTab>('dashboard')
  const [posts, setPosts] = useState<Post[]>([])
  const [stats, setStats] = useState<Stats>({ posts: 0, users: 0, comments: 0 })
  const [loading, setLoading] = useState(true)
  const [editingPost, setEditingPost] = useState<any>(null)
  const [categories, setCategories] = useState<any[]>([])
  
  // Post editor state
  const [postForm, setPostForm] = useState({
    title: '', slug: '', excerpt: '', content: '', 
    cover_image: '', category_id: '', status: 'draft', tags: ''
  })
  const [saving, setSaving] = useState(false)
  const [saveMsg, setSaveMsg] = useState('')
  
  // Auth check
  useEffect(() => {
    if (status === 'loading') return
    if (!session || (session.user.role !== 'admin' && session.user.role !== 'editor')) {
      router.push('/login')
    }
  }, [session, status, router])

  const fetchData = useCallback(async () => {
    try {
      const [postsRes, statsRes, catsRes] = await Promise.all([
        fetch('/api/admin/posts'),
        fetch('/api/admin/stats'),
        fetch('/api/posts?limit=0'),
      ])
      
      if (postsRes.ok) {
        const d = await postsRes.json()
        setPosts(d.posts || [])
      }
      if (statsRes.ok) {
        const d = await statsRes.json()
        setStats(d)
      }
      if (catsRes.ok) {
        const d = await catsRes.json()
        setCategories(d.categories || [])
      }
    } catch (err) {
      console.error('Error fetching admin data:', err)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    if (session?.user.role === 'admin' || session?.user.role === 'editor') {
      fetchData()
    }
  }, [session, fetchData])

  function startNewPost() {
    setEditingPost(null)
    setPostForm({ title: '', slug: '', excerpt: '', content: '', cover_image: '', category_id: '', status: 'draft', tags: '' })
    setActiveTab('new-post')
  }

  function startEditPost(post: any) {
    setEditingPost(post)
    setPostForm({
      title: post.title || '',
      slug: post.slug || '',
      excerpt: post.excerpt || '',
      content: post.content || '',
      cover_image: post.cover_image || '',
      category_id: post.category_id || '',
      status: post.status || 'draft',
      tags: Array.isArray(post.tags) ? post.tags.join(', ') : (typeof post.tags === 'string' ? JSON.parse(post.tags || '[]').join(', ') : '')
    })
    setActiveTab('edit-post')
  }

  async function savePost() {
    setSaving(true)
    setSaveMsg('')
    try {
      const payload = {
        ...postForm,
        tags: postForm.tags.split(',').map(t => t.trim()).filter(Boolean),
        ...(editingPost ? { id: editingPost.id } : {})
      }
      
      const res = await fetch('/api/admin/posts', {
        method: editingPost ? 'PUT' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      })
      
      if (res.ok) {
        setSaveMsg('保存成功！')
        fetchData()
        setTimeout(() => {
          setActiveTab('posts')
          setSaveMsg('')
        }, 1500)
      } else {
        const d = await res.json()
        setSaveMsg(d.error || '保存失败')
      }
    } catch {
      setSaveMsg('保存失败，请重试')
    } finally {
      setSaving(false)
    }
  }

  async function deletePost(id: string) {
    if (!confirm('确定删除这篇文章？此操作不可撤销。')) return
    const res = await fetch(`/api/admin/posts?id=${id}`, { method: 'DELETE' })
    if (res.ok) {
      setPosts(prev => prev.filter(p => p.id !== id))
    }
  }

  function autoSlug(title: string) {
    const slug = title.toLowerCase().replace(/[\u4e00-\u9fff]/g, '').replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '') || Date.now().toString()
    setPostForm(prev => ({ ...prev, title, slug }))
  }

  if (status === 'loading' || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
      </div>
    )
  }

  const navItems = [
    { id: 'dashboard', label: '仪表板', icon: LayoutDashboard },
    { id: 'posts', label: '文章管理', icon: FileText },
    { id: 'media', label: '媒体库', icon: Image },
    { id: 'comments', label: '评论管理', icon: MessageSquare },
    ...(session?.user.role === 'admin' ? [{ id: 'users', label: '用户管理', icon: Users }] : []),
  ]

  return (
    <div className="min-h-screen bg-gray-100 flex">
      {/* Sidebar */}
      <aside className="w-64 bg-gray-900 text-white flex-shrink-0 flex flex-col">
        <div className="p-6 border-b border-gray-700">
          <h1 className="text-xl font-bold">ZZGCopilot</h1>
          <p className="text-gray-400 text-sm mt-1">后台管理系统</p>
        </div>
        
        <nav className="flex-1 p-4">
          <div className="space-y-1">
            {navItems.map(item => (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id as AdminTab)}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm transition ${
                  activeTab === item.id || (activeTab === 'new-post' && item.id === 'posts') || (activeTab === 'edit-post' && item.id === 'posts')
                    ? 'bg-blue-600 text-white' 
                    : 'text-gray-300 hover:bg-gray-800'
                }`}
              >
                <item.icon className="w-5 h-5" />
                {item.label}
              </button>
            ))}
          </div>
        </nav>
        
        <div className="p-4 border-t border-gray-700">
          <div className="flex items-center gap-3 mb-4 px-2">
            <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center text-sm font-bold">
              {session?.user.name?.[0]?.toUpperCase()}
            </div>
            <div>
              <div className="text-sm font-medium">{session?.user.name}</div>
              <div className="text-xs text-gray-400">{session?.user.role}</div>
            </div>
          </div>
          <a href="/" className="w-full flex items-center gap-2 px-4 py-2 text-gray-300 hover:text-white text-sm">
            <Eye className="w-4 h-4" /> 查看网站
          </a>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-auto">
        {/* Header */}
        <header className="bg-white border-b px-8 py-4 flex items-center justify-between">
          <h2 className="text-xl font-semibold">
            {activeTab === 'dashboard' && '仪表板'}
            {activeTab === 'posts' && '文章管理'}
            {activeTab === 'new-post' && '新建文章'}
            {activeTab === 'edit-post' && '编辑文章'}
            {activeTab === 'media' && '媒体库'}
            {activeTab === 'comments' && '评论管理'}
            {activeTab === 'users' && '用户管理'}
          </h2>
          {(activeTab === 'posts') && (
            <button onClick={startNewPost} className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition text-sm">
              <Plus className="w-4 h-4" /> 新建文章
            </button>
          )}
        </header>

        <div className="p-8">
          {/* Dashboard */}
          {activeTab === 'dashboard' && (
            <div>
              <div className="grid grid-cols-3 gap-6 mb-8">
                {[
                  { label: '文章总数', value: stats.posts, icon: FileText, color: 'blue' },
                  { label: '注册用户', value: stats.users, icon: Users, color: 'green' },
                  { label: '评论总数', value: stats.comments, icon: MessageSquare, color: 'purple' },
                ].map(stat => (
                  <div key={stat.label} className="bg-white rounded-2xl p-6 border">
                    <div className={`w-12 h-12 bg-${stat.color}-100 rounded-xl flex items-center justify-center mb-4`}>
                      <stat.icon className={`w-6 h-6 text-${stat.color}-600`} />
                    </div>
                    <div className="text-3xl font-bold mb-1">{stat.value}</div>
                    <div className="text-gray-500 text-sm">{stat.label}</div>
                  </div>
                ))}
              </div>
              
              <div className="bg-white rounded-2xl border p-6">
                <h3 className="font-semibold mb-4">最近文章</h3>
                <div className="space-y-3">
                  {posts.slice(0, 5).map(post => (
                    <div key={post.id} className="flex items-center justify-between py-2 border-b last:border-0">
                      <div>
                        <div className="font-medium text-sm">{post.title}</div>
                        <div className="text-xs text-gray-400">{post.author_name} · {post.view_count} 浏览</div>
                      </div>
                      <span className={`text-xs px-2 py-1 rounded-full ${
                        post.status === 'published' ? 'bg-green-100 text-green-700' : 
                        post.status === 'draft' ? 'bg-yellow-100 text-yellow-700' : 'bg-gray-100 text-gray-600'
                      }`}>
                        {post.status === 'published' ? '已发布' : post.status === 'draft' ? '草稿' : '归档'}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Posts List */}
          {activeTab === 'posts' && (
            <div className="bg-white rounded-2xl border overflow-hidden">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="text-left px-6 py-4 text-sm font-medium text-gray-600">标题</th>
                    <th className="text-left px-6 py-4 text-sm font-medium text-gray-600">状态</th>
                    <th className="text-left px-6 py-4 text-sm font-medium text-gray-600">分类</th>
                    <th className="text-left px-6 py-4 text-sm font-medium text-gray-600">浏览</th>
                    <th className="text-left px-6 py-4 text-sm font-medium text-gray-600">操作</th>
                  </tr>
                </thead>
                <tbody className="divide-y">
                  {posts.map(post => (
                    <tr key={post.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4">
                        <div className="font-medium text-sm">{post.title}</div>
                        <div className="text-xs text-gray-400">/{post.slug}</div>
                      </td>
                      <td className="px-6 py-4">
                        <span className={`text-xs px-2 py-1 rounded-full ${
                          post.status === 'published' ? 'bg-green-100 text-green-700' : 
                          post.status === 'draft' ? 'bg-yellow-100 text-yellow-700' : 'bg-gray-100 text-gray-600'
                        }`}>
                          {post.status === 'published' ? '已发布' : post.status === 'draft' ? '草稿' : '归档'}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-600">{post.category_name || '—'}</td>
                      <td className="px-6 py-4 text-sm text-gray-600">{post.view_count}</td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          <button onClick={() => startEditPost(post)} className="p-1.5 hover:bg-gray-100 rounded-lg">
                            <Edit className="w-4 h-4 text-gray-600" />
                          </button>
                          <a href={`/tutorials/${post.slug}`} target="_blank" className="p-1.5 hover:bg-gray-100 rounded-lg">
                            <Eye className="w-4 h-4 text-gray-600" />
                          </a>
                          {session?.user.role === 'admin' && (
                            <button onClick={() => deletePost(post.id)} className="p-1.5 hover:bg-red-50 rounded-lg">
                              <Trash2 className="w-4 h-4 text-red-500" />
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                  {posts.length === 0 && (
                    <tr><td colSpan={5} className="px-6 py-12 text-center text-gray-400">暂无文章，点击右上角新建</td></tr>
                  )}
                </tbody>
              </table>
            </div>
          )}

          {/* Post Editor */}
          {(activeTab === 'new-post' || activeTab === 'edit-post') && (
            <div className="max-w-4xl">
              {saveMsg && (
                <div className={`mb-4 p-3 rounded-xl text-sm ${saveMsg.includes('成功') ? 'bg-green-50 text-green-700 border border-green-200' : 'bg-red-50 text-red-700 border border-red-200'}`}>
                  {saveMsg}
                </div>
              )}
              
              <div className="grid grid-cols-3 gap-6">
                {/* Main content */}
                <div className="col-span-2 space-y-4">
                  <div className="bg-white rounded-2xl border p-6">
                    <label className="block text-sm font-medium text-gray-700 mb-2">标题 *</label>
                    <input
                      type="text"
                      value={postForm.title}
                      onChange={(e) => autoSlug(e.target.value)}
                      placeholder="文章标题"
                      className="w-full border rounded-xl px-4 py-3 text-lg font-medium focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                    
                    <label className="block text-sm font-medium text-gray-700 mt-4 mb-2">URL Slug</label>
                    <input
                      type="text"
                      value={postForm.slug}
                      onChange={(e) => setPostForm(prev => ({ ...prev, slug: e.target.value }))}
                      placeholder="url-slug"
                      className="w-full border rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                    
                    <label className="block text-sm font-medium text-gray-700 mt-4 mb-2">摘要</label>
                    <textarea
                      value={postForm.excerpt}
                      onChange={(e) => setPostForm(prev => ({ ...prev, excerpt: e.target.value }))}
                      placeholder="文章摘要（可选）"
                      rows={2}
                      className="w-full border rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                    />
                  </div>
                  
                  <div className="bg-white rounded-2xl border p-6">
                    <label className="block text-sm font-medium text-gray-700 mb-2">正文内容（Markdown）*</label>
                    <textarea
                      value={postForm.content}
                      onChange={(e) => setPostForm(prev => ({ ...prev, content: e.target.value }))}
                      placeholder="# 文章标题

## 章节标题

正文内容，支持 **Markdown** 格式..."
                      rows={20}
                      className="w-full border rounded-xl px-4 py-3 text-sm font-mono focus:outline-none focus:ring-2 focus:ring-blue-500 resize-y"
                    />
                    <p className="text-xs text-gray-400 mt-1">支持 Markdown 语法，包括代码块、表格、图片等</p>
                  </div>
                </div>
                
                {/* Sidebar */}
                <div className="space-y-4">
                  <div className="bg-white rounded-2xl border p-5">
                    <h3 className="font-medium mb-4">发布设置</h3>
                    <div className="space-y-3">
                      <div>
                        <label className="block text-xs text-gray-500 mb-1">状态</label>
                        <select
                          value={postForm.status}
                          onChange={(e) => setPostForm(prev => ({ ...prev, status: e.target.value }))}
                          className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                        >
                          <option value="draft">草稿</option>
                          <option value="published">立即发布</option>
                          <option value="archived">归档</option>
                        </select>
                      </div>
                      
                      <div>
                        <label className="block text-xs text-gray-500 mb-1">分类</label>
                        <select
                          value={postForm.category_id}
                          onChange={(e) => setPostForm(prev => ({ ...prev, category_id: e.target.value }))}
                          className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                        >
                          <option value="">选择分类</option>
                          {categories.map((cat: any) => (
                            <option key={cat.id} value={cat.id}>{cat.name}</option>
                          ))}
                        </select>
                      </div>
                      
                      <div>
                        <label className="block text-xs text-gray-500 mb-1">标签（逗号分隔）</label>
                        <input
                          type="text"
                          value={postForm.tags}
                          onChange={(e) => setPostForm(prev => ({ ...prev, tags: e.target.value }))}
                          placeholder="AI, 编程, 教程"
                          className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                      </div>
                      
                      <div>
                        <label className="block text-xs text-gray-500 mb-1">封面图片 URL</label>
                        <input
                          type="url"
                          value={postForm.cover_image}
                          onChange={(e) => setPostForm(prev => ({ ...prev, cover_image: e.target.value }))}
                          placeholder="https://..."
                          className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                      </div>
                    </div>
                    
                    <div className="flex gap-2 mt-5">
                      <button
                        onClick={savePost}
                        disabled={saving || !postForm.title || !postForm.content}
                        className="flex-1 flex items-center justify-center gap-2 py-2.5 bg-blue-600 text-white rounded-xl hover:bg-blue-700 disabled:opacity-50 transition text-sm"
                      >
                        {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                        {saving ? '保存中...' : '保存'}
                      </button>
                      <button
                        onClick={() => setActiveTab('posts')}
                        className="px-4 py-2.5 border rounded-xl hover:bg-gray-50 text-sm"
                      >
                        取消
                      </button>
                    </div>
                  </div>
                  
                  {/* Preview */}
                  {postForm.cover_image && (
                    <div className="bg-white rounded-2xl border p-4">
                      <p className="text-xs text-gray-500 mb-2">封面预览</p>
                      <img src={postForm.cover_image} alt="封面" className="w-full rounded-xl aspect-video object-cover" />
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Media Tab */}
          {activeTab === 'media' && (
            <div>
              <div className="bg-white rounded-2xl border p-6 mb-6">
                <h3 className="font-medium mb-4">上传文件</h3>
                <MediaUploader />
              </div>
              <MediaGallery />
            </div>
          )}

          {activeTab === 'comments' && <CommentsManager />}
          {activeTab === 'users' && session?.user.role === 'admin' && <UsersManager />}
        </div>
      </main>
    </div>
  )
}

function MediaUploader() {
  const [uploading, setUploading] = useState(false)
  const [msg, setMsg] = useState('')
  
  async function handleUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    setUploading(true)
    setMsg('')
    const formData = new FormData()
    formData.append('file', file)
    try {
      const res = await fetch('/api/upload', { method: 'POST', body: formData })
      const data = await res.json()
      if (res.ok) {
        setMsg(`上传成功！URL: ${data.url}`)
      } else {
        setMsg(data.error || '上传失败')
      }
    } catch {
      setMsg('上传失败')
    } finally {
      setUploading(false)
    }
  }
  
  return (
    <div>
      <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed rounded-xl cursor-pointer hover:bg-gray-50 transition">
        {uploading ? <Loader2 className="w-8 h-8 text-blue-600 animate-spin" /> : (
          <>
            <Upload className="w-8 h-8 text-gray-400 mb-2" />
            <span className="text-sm text-gray-500">点击或拖拽上传图片/视频</span>
            <span className="text-xs text-gray-400 mt-1">支持 JPG、PNG、GIF、WebP、MP4（最大50MB）</span>
          </>
        )}
        <input type="file" className="hidden" onChange={handleUpload} accept="image/*,video/*" />
      </label>
      {msg && <p className={`mt-2 text-sm ${msg.includes('成功') ? 'text-green-600' : 'text-red-600'}`}>{msg}</p>}
    </div>
  )
}

function MediaGallery() {
  const [media, setMedia] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  
  useEffect(() => {
    fetch('/api/upload').then(r => r.json()).then(d => {
      setMedia(d.media || [])
      setLoading(false)
    })
  }, [])
  
  if (loading) return <div className="text-center py-8"><Loader2 className="w-6 h-6 animate-spin text-blue-600 mx-auto" /></div>
  
  return (
    <div className="grid grid-cols-4 gap-4">
      {media.map((m: any) => (
        <div key={m.id} className="bg-white rounded-xl border overflow-hidden">
          {m.mime_type.startsWith('image/') ? (
            <img src={m.url} alt={m.original_name} className="w-full aspect-video object-cover" />
          ) : (
            <div className="aspect-video bg-gray-100 flex items-center justify-center">
              <span className="text-xs text-gray-400">视频</span>
            </div>
          )}
          <div className="p-2">
            <p className="text-xs text-gray-600 truncate">{m.original_name}</p>
            <button
              onClick={() => navigator.clipboard.writeText(m.url)}
              className="text-xs text-blue-600 hover:underline mt-1"
            >
              复制链接
            </button>
          </div>
        </div>
      ))}
    </div>
  )
}

function CommentsManager() {
  const [comments, setComments] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  
  useEffect(() => {
    // Fetch all comments via admin API
    fetch('/api/admin/comments').then(r => r.json()).then(d => {
      setComments(d.comments || [])
      setLoading(false)
    }).catch(() => setLoading(false))
  }, [])
  
  async function deleteComment(id: string) {
    if (!confirm('确定删除？')) return
    await fetch(`/api/comments?id=${id}`, { method: 'DELETE' })
    setComments(prev => prev.filter(c => c.id !== id))
  }
  
  return (
    <div className="bg-white rounded-2xl border overflow-hidden">
      <table className="w-full">
        <thead className="bg-gray-50">
          <tr>
            <th className="text-left px-6 py-4 text-sm font-medium text-gray-600">评论内容</th>
            <th className="text-left px-6 py-4 text-sm font-medium text-gray-600">作者</th>
            <th className="text-left px-6 py-4 text-sm font-medium text-gray-600">文章</th>
            <th className="text-left px-6 py-4 text-sm font-medium text-gray-600">时间</th>
            <th className="text-left px-6 py-4 text-sm font-medium text-gray-600">操作</th>
          </tr>
        </thead>
        <tbody className="divide-y">
          {loading ? (
            <tr><td colSpan={5} className="text-center py-8"><Loader2 className="w-5 h-5 animate-spin text-blue-600 mx-auto" /></td></tr>
          ) : comments.length === 0 ? (
            <tr><td colSpan={5} className="text-center py-8 text-gray-400">暂无评论</td></tr>
          ) : comments.map((c: any) => (
            <tr key={c.id} className="hover:bg-gray-50">
              <td className="px-6 py-4 text-sm max-w-xs"><p className="truncate">{c.content}</p></td>
              <td className="px-6 py-4 text-sm text-gray-600">{c.author_name}</td>
              <td className="px-6 py-4 text-sm text-gray-600">{c.post_title || c.post_id}</td>
              <td className="px-6 py-4 text-xs text-gray-400">{new Date(c.created_at).toLocaleDateString('zh-CN')}</td>
              <td className="px-6 py-4">
                <button onClick={() => deleteComment(c.id)} className="p-1.5 hover:bg-red-50 rounded-lg">
                  <Trash2 className="w-4 h-4 text-red-500" />
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

function UsersManager() {
  const [users, setUsers] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  
  useEffect(() => {
    fetch('/api/admin/users').then(r => r.json()).then(d => {
      setUsers(d.users || [])
      setLoading(false)
    }).catch(() => setLoading(false))
  }, [])
  
  return (
    <div className="bg-white rounded-2xl border overflow-hidden">
      <table className="w-full">
        <thead className="bg-gray-50">
          <tr>
            <th className="text-left px-6 py-4 text-sm font-medium text-gray-600">用户</th>
            <th className="text-left px-6 py-4 text-sm font-medium text-gray-600">邮箱</th>
            <th className="text-left px-6 py-4 text-sm font-medium text-gray-600">角色</th>
            <th className="text-left px-6 py-4 text-sm font-medium text-gray-600">注册时间</th>
          </tr>
        </thead>
        <tbody className="divide-y">
          {loading ? (
            <tr><td colSpan={4} className="text-center py-8"><Loader2 className="w-5 h-5 animate-spin text-blue-600 mx-auto" /></td></tr>
          ) : users.map((u: any) => (
            <tr key={u.id} className="hover:bg-gray-50">
              <td className="px-6 py-4 text-sm font-medium">{u.name}</td>
              <td className="px-6 py-4 text-sm text-gray-600">{u.email}</td>
              <td className="px-6 py-4">
                <span className={`text-xs px-2 py-1 rounded-full ${u.role === 'admin' ? 'bg-red-100 text-red-700' : u.role === 'editor' ? 'bg-blue-100 text-blue-700' : 'bg-gray-100 text-gray-600'}`}>
                  {u.role === 'admin' ? '管理员' : u.role === 'editor' ? '编辑' : '普通用户'}
                </span>
              </td>
              <td className="px-6 py-4 text-xs text-gray-400">{new Date(u.created_at).toLocaleDateString('zh-CN')}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
