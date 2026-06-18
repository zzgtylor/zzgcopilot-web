# ZZGCopilot - AI 编程教程网站

> **全栈动态教程网站** - Next.js 14 + Cloudflare Pages + D1 数据库 + R2 存储

## 🚀 技术栈

| 层级 | 技术 | 说明 |
|------|------|------|
| 前端框架 | Next.js 14 (App Router) | React 服务端组件 + 客户端组件 |
| 部署平台 | Cloudflare Pages | 全球 CDN + Edge Functions |
| 数据库 | Cloudflare D1 (SQLite) | 用户、文章、评论、收藏数据 |
| 文件存储 | Cloudflare R2 | 教程插图、演示视频 |
| 认证 | NextAuth.js | 邮箱/密码登录 + JWT Session |
| UI 样式 | Tailwind CSS + Lucide Icons | 响应式设计 |
| 内容格式 | Markdown (react-markdown) | 教程内容渲染 |

## ✨ 功能特性

- **用户系统**: 注册、登录、个人资料管理
- **教程浏览**: 分类筛选、搜索、标签
- **互动功能**: 评论（支持回复嵌套）、收藏、点赞
- **媒体管理**: 图片/视频上传到 R2，自动生成 URL
- **后台管理系统**: 类似 WordPress 的管理界面（/admin）
  - 文章 CRUD（Markdown 编辑器）
  - 评论管理与审核
  - 用户管理与权限分配
  - 媒体库管理

## 📁 项目结构

```
zzgcopilot-web/
├── src/
│   ├── app/
│   │   ├── api/
│   │   │   ├── auth/[...nextauth]/route.ts  # NextAuth 认证
│   │   │   ├── register/route.ts            # 用户注册
│   │   │   ├── posts/route.ts               # 教程 API
│   │   │   ├── comments/route.ts            # 评论 API
│   │   │   ├── bookmarks/route.ts           # 收藏 API
│   │   │   ├── upload/route.ts              # R2 文件上传
│   │   │   └── admin/                       # 后台管理 API
│   │   ├── admin/page.tsx                   # 后台管理界面
│   │   ├── tutorials/                       # 教程页面
│   │   ├── login/page.tsx                   # 登录页
│   │   ├── register/page.tsx                # 注册页
│   │   ├── globals.css                      # 全局样式
│   │   ├── layout.tsx                       # 根布局
│   │   └── page.tsx                         # 首页
│   ├── components/
│   │   ├── layout/Navbar.tsx                # 导航栏
│   │   ├── layout/Footer.tsx                # 底部
│   │   ├── providers/AuthProvider.tsx       # Session 提供者
│   │   └── tutorial/                        # 教程相关组件
│   ├── lib/
│   │   ├── db.ts                            # D1 数据库操作层
│   │   └── auth.ts                          # NextAuth 配置
│   └── middleware.ts                        # 路由保护
├── schema.sql                               # D1 数据库结构
├── wrangler.toml                            # Cloudflare 配置
├── next.config.js                           # Next.js 配置
└── package.json                             # 依赖管理
```

## 🔧 部署步骤

### 1. 已完成 ✅
- [x] GitHub 仓库创建: `zzgtylor/zzgcopilot-web`
- [x] D1 数据库创建: `zzgcopilot-db` (ID: f51cd6bd-fcb0-47ce-90ca-32209552c7bf)
- [x] 数据库表结构初始化（users, posts, categories, comments, bookmarks, likes, media）
- [x] R2 存储桶创建: `zzgcopilot-assets`
- [x] 完整项目代码提交

### 2. 需要手动完成

#### A. 连接 Cloudflare Pages 到 GitHub
1. 前往 [Cloudflare Dashboard > Workers & Pages > Create](https://dash.cloudflare.com/686b555829b94ccd904bd26e51b8b1c6/pages/new)
2. 选择 "Pages" > "Connect to Git"
3. 选择 GitHub 账户 `zzgtylor`，选择仓库 `zzgcopilot-web`
4. 构建配置:
   - **构建命令**: `npm run pages:build`
   - **输出目录**: `.vercel/output/static`
   - **Node.js 版本**: 20

#### B. 配置环境变量（在 Cloudflare Pages 设置中）
```
NEXTAUTH_URL=https://zzgcopilot.com
NEXTAUTH_SECRET=<生成一个32位以上的随机密钥>
R2_PUBLIC_URL=https://assets.zzgcopilot.com
```

生成密钥方法:
```bash
openssl rand -base64 32
```

#### C. 绑定 D1 和 R2 到 Pages（在 Pages 设置 > 绑定中）
- **D1 数据库绑定**:
  - 变量名: `DB`
  - 数据库: `zzgcopilot-db`
- **R2 存储桶绑定**:
  - 变量名: `R2`
  - 存储桶: `zzgcopilot-assets`

#### D. 配置自定义域名
1. 在 Cloudflare Pages 设置 > 自定义域
2. 添加 `zzgcopilot.com`（您的 AWS 域名需要将 DNS 指向 Cloudflare）

#### E. 初次部署后修改管理员密码
默认管理员账号:
- 邮箱: `admin@zzgcopilot.com`
- 密码: `Admin@123456`

**⚠️ 请立即修改默认密码！**

### 3. R2 公开访问配置（可选）
如需图片公开访问，在 R2 存储桶 Settings > Public Access 中启用公开访问并绑定自定义域 `assets.zzgcopilot.com`。

## 🔑 管理员功能
访问 `https://zzgcopilot.com/admin` 即可进入后台管理系统：
- 创建/编辑/删除文章（Markdown 格式）
- 管理分类和标签
- 审核和删除评论
- 查看和管理用户
- 上传图片和视频到 R2

## 📝 发布新教程
1. 登录后台 `/admin`
2. 点击"新建文章"
3. 输入标题（自动生成 URL Slug）
4. 使用 Markdown 格式编写内容
5. 选择分类和标签
6. 点击"发布"即可

## 📜 License
MIT
