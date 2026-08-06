export async function publishDuePosts(db: any) {
  await db.prepare(
    `UPDATE posts
     SET status = 'published', published_at = COALESCE(published_at, scheduled_at, datetime('now')),
         scheduled_at = NULL, updated_at = datetime('now')
     WHERE status = 'draft' AND scheduled_at IS NOT NULL AND scheduled_at <= datetime('now')`
  ).run()
}

export function scheduledAt(value: unknown) {
  if (!value) return null
  const date = new Date(String(value))
  return Number.isNaN(date.getTime()) ? null : date.toISOString()
}
