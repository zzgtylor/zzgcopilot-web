# ZZGCopilot

ZZGCopilot 是一个基于 Next.js App Router 的动态教程网站。当前生产架构为：

| 层级 | 当前服务 | 用途 |
|---|---|---|
| Web 与 API | Vercel | 页面、Route Handlers、CDN 与部署 |
| 内容管理 | Sanity | 文章、首页配置、媒体元数据与编辑工作流 |
| 业务数据库 | Neon PostgreSQL | 用户、评论、收藏、统计和业务数据 |
| 文件与备份 | Vercel Blob | 上传文件、Sanity 导出和独立备份 |
| 质量与版本 | GitLab | 源码、Issue、CI 校验和备份留存 |
| 域名与 DNS | Cloudflare Registrar/DNS | 域名注册、DNS 与证书边界；不承载网站运行时 |

## 本地开发

```bash
npm install
npm run dev
```

常用检查：

```bash
npm run typecheck
npm test
npm run build
```

## Vercel 环境变量

生产和预览环境按需配置以下变量：

- `DATABASE_URL` 或 `POSTGRES_URL`：Neon PostgreSQL 连接串
- `BLOB_READ_WRITE_TOKEN`：Vercel Blob 上传和备份
- `NEXT_PUBLIC_SANITY_PROJECT_ID`、`NEXT_PUBLIC_SANITY_DATASET`、`SANITY_API_VERSION`
- `SANITY_API_TOKEN`、`SANITY_REVALIDATE_SECRET`
- `ADMIN_ACCESS_TOKEN`、`ADMIN_ALLOWED_EMAILS`
- `TURNSTILE_SITE_KEY`、`TURNSTILE_SECRET_KEY`（启用反滥用校验时）
- `CRON_SECRET`（保护定时任务）

敏感变量应使用 Vercel Secret 类型，并同时检查 Production、Preview 是否勾选正确。保存后需要重新部署才能让新值进入函数运行时。

## 内容和后台

- 内容编辑入口：Sanity Studio。
- 网站后台报告入口：`/admin`，由 Vercel 环境变量中的管理员令牌和允许邮箱控制。
- 上传接口使用 Vercel Blob；不再使用 Cloudflare R2。
- 登录、评论、统计接口使用 Vercel Functions + Neon PostgreSQL。

## 部署

项目连接 GitLab 后由 Vercel 负责 Preview/Production 部署。生产域名为 `https://zzgcopilot.com`；Cloudflare 只保留域名注册和 DNS，不再配置 Pages、Workers、D1 或 R2 作为活动部署链路。

## 备份

`npm run backup:sanity` 将 Sanity 内容和媒体备份到私有 Vercel Blob。GitLab/GitHub 中的备份工作流可作为独立留存渠道；备份脚本会在缺少凭证时安全失败，不影响网站请求。

仓库中保留的 `scripts/migrate-d1-to-postgres.mjs`、`scripts/migrate-passwords.mjs` 和历史 SQL 仅用于迁移审计或灾难恢复，不属于生产运行时，也不应在新部署中执行。

## 目录概览

```text
src/app/                 页面与 API Route Handlers
src/lib/platform.ts      Vercel/Neon 运行时适配层
sanity-studio/           Sanity 内容编辑器
migrations/              PostgreSQL 迁移脚本
scripts/                 备份与一次性迁移工具
tests/                   静态架构与安全回归测试
```
