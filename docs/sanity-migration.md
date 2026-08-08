# Sanity 渐进迁移说明

此仓库的公开前端不变。接入后，首页与 `/tutorials/[slug]` 会优先读取 Sanity 中 `status = published` 的文章；当 Sanity 未配置、接口不可用或没有已发布文章时，自动继续读取现有 D1 数据。

## 创建后需要填写的值

1. 在 `sanity-studio/` 中复制 `.env.example` 为 `.env`，填写项目 ID。
2. 在 Cloudflare Pages 的生产环境变量中填写 `.env.sanity.example` 的三个 `SANITY_*` 值。
3. 安装并发布 Studio：`cd sanity-studio && npm install && npx sanity deploy`。
4. 在 Sanity 创建文章，状态选择“已发布”，并填写发布时间；网站会在最多约一分钟后读取新内容。

## 逐步迁移规则

- 不批量删除 D1 文章，也不改变旧链接。
- 每次先复制一篇文章到 Sanity，确认 `/tutorials/原-slug` 正确后，再继续下一篇。
- 同一 slug 在 Sanity 发布后由 Sanity 版本优先显示；未迁移文章继续由 D1 显示。
- D1 草稿、评论、阅读量和原有后台在迁移期间继续保留。Sanity 文章暂不接入 D1 评论与阅读量统计。

## 备份与自动部署

- GitHub `main` 分支每次推送会自动构建并部署到 Cloudflare Pages；部署前会运行 OpenNext 构建。
- 每月 1 日 UTC 03:00 的 GitHub Actions 备份会把 D1、受管 R2 媒体和 Sanity 的已发布文档打成同一个校验过的恢复包，上传到私有 `zzgcopilot-backups` R2 桶。
- 当前 Sanity 文章使用 R2 图片 URL，不使用 Sanity Asset。以后若开始上传 Sanity Asset，应额外启用 Sanity 的完整资产导出，避免只备份文档引用。
