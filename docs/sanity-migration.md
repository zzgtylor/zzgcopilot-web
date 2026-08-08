# Sanity 渐进迁移说明

此仓库的公开前端不变。首页、文章页、独立页面、公开文章 API、分类 API 和站点地图均只读取 Sanity 中 `status = published` 的内容。

## 创建后需要填写的值

1. 在 `sanity-studio/` 中复制 `.env.example` 为 `.env`，填写项目 ID。
2. 在 Cloudflare Pages 的生产环境变量中填写 `.env.sanity.example` 的三个 `SANITY_*` 值。
3. 安装并发布 Studio：`cd sanity-studio && npm install && npx sanity deploy`。
4. 在 Sanity 创建文章，状态选择“已发布”，并填写发布时间；网站会在最多约一分钟后读取新内容。

## Sanity 唯一内容后台

- 不批量删除 D1 数据，也不改变公开链接；D1 仅保留为登录、历史数据、备份和回退层。
- 原 Cloudflare `/admin`、`/login` 和 `/register` 会跳转到 Sanity Studio；`/api/admin/*` 返回停用状态，避免再写入旧内容库。
- 在 Sanity 创建文章或独立页面时，填写 `status = published` 后会在最多约一分钟内被网站读取；草稿不会公开。
- 站点设置和导航菜单也在 Sanity 中管理。初始导航与原网站保持一致。
- Sanity 文章暂不接入 D1 评论与阅读量统计；当前网站没有公开评论，因此页面视觉不受影响。

## 备份与自动部署

- GitHub `main` 分支每次推送会自动构建并部署到 Cloudflare Pages；部署前会运行 OpenNext 构建。
- 每月 1 日 UTC 03:00 的 GitHub Actions 备份会把 D1、受管 R2 媒体和 Sanity 的已发布文档打成同一个校验过的恢复包，上传到私有 `zzgcopilot-backups` R2 桶。
- 当前 Sanity 文章使用 R2 图片 URL，不使用 Sanity Asset。以后若开始上传 Sanity Asset，应额外启用 Sanity 的完整资产导出，避免只备份文档引用。
