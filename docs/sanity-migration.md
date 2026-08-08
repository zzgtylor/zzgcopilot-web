# Sanity 渐进迁移说明

此仓库的公开前端不变。首页、文章页、独立页面、公开文章 API、分类 API 和站点地图均只读取 Sanity 中 `status = published` 的内容。

## 创建后需要填写的值

1. 在 `sanity-studio/` 中复制 `.env.example` 为 `.env`，填写项目 ID。
2. 在 Cloudflare Pages 的生产环境变量中填写 `.env.sanity.example` 的三个 `SANITY_*` 值。
3. 安装并发布 Studio：`cd sanity-studio && npm install && npx sanity deploy`。
4. 在 Sanity 创建文章，状态选择“已发布”，并填写发布时间；网站会在最多约一分钟后读取新内容。

## Sanity 唯一内容后台

- 不批量删除 D1/R2 资源，也不改变公开链接；它们只保留为离线恢复档案，不再承担网站内容、媒体、登录或运行时读取。
- 原 Cloudflare `/admin`、`/login` 和 `/register` 会跳转到 Sanity Studio；`/api/admin/*` 返回停用状态。旧登录、评论、阅读量、定时发布和上传 API 已下线。
- 在 Sanity 创建文章或独立页面时，填写 `status = published` 后会在最多约一分钟内被网站读取；草稿不会公开。
- 站点设置和导航菜单也在 Sanity 中管理。初始导航与原网站保持一致。
- 文章封面和默认封面使用 Sanity Asset。旧的静态上传目录不再对外提供内容。

## WordPress 风格编辑流程

- “可视化正文”支持标题、项目符号、编号、链接、正文图片、提示框、操作步骤、表格和下载按钮；旧 Markdown 字段只作为迁移回退。
- Studio 顶部的“Media”是统一媒体库，可批量上传、搜索、复用、标记和维护图片替代文字。
- 每篇文章和独立页面都有“编辑”和“实时预览”页签，草稿内容可在发布前查看。
- 审核阶段依次为“撰写中 → 待审核 → 已批准”；未批准的内容不能设置为“已发布”或“计划发布”。成员访问权限继续由 Sanity 项目角色管理。
- 定时发布不再依赖 Cloudflare Worker。选择“计划发布”、填写未来发布时间并发布文档后，网站会在到点后自动公开，最长受一分钟内容缓存影响。

## 备份与自动部署

- GitHub `main` 分支每次推送会自动构建并部署到 Cloudflare Pages；部署前会运行 OpenNext 构建。
- 每月 1 日 UTC 03:00 的 GitHub Actions 备份会把 D1、受管 R2 历史媒体、Sanity 已发布文档和当前 Sanity 图片文件打成同一个校验过的恢复包，上传到私有 `zzgcopilot-backups` R2 桶。
