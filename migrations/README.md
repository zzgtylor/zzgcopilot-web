# PostgreSQL migrations

生产数据库是 Neon PostgreSQL。应用运行时只从 `DATABASE_URL`、`POSTGRES_URL` 或 `DATABASE_URL_UNPOOLED` 读取连接串，并通过 `pg` 连接池访问数据库；不存在 D1 binding 或 Cloudflare 数据库回退路径。

## 迁移流程

1. 在 Neon 创建独立的 migration 分支。
2. 使用 `scripts/migrate-d1-to-postgres.mjs` 只对经过审计的历史导出生成候选 SQL：

   ```bash
   node scripts/migrate-d1-to-postgres.mjs <审计过的导出.sql> /tmp/zzgcopilot-postgres.sql
   ```

3. 在 Neon SQL Editor 或受控 `psql` 会话中先执行候选 SQL，检查表、索引和行数。
4. 通过 `pg_dump` 验证可恢复性，再将连接串配置到 Vercel Production/Preview。
5. 迁移完成后，禁止再运行旧 D1/Wrangler 命令；历史脚本仅保留作审计记录。

## 安全要求

- 不把连接串提交到仓库、日志或聊天。
- 生产迁移前先执行独立 Neon 备份：`npm run backup:neon`。
- 迁移脚本必须可重复执行，新增表和索引使用 `IF NOT EXISTS`。
- 结构变更应以新的有序 SQL 文件提交，并在 Preview 环境验证后再应用到 Production。
