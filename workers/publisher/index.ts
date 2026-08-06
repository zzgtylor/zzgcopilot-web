export default {
  async scheduled(controller, env) {
    const startedAt = new Date(controller.scheduledTime).toISOString()
    try {
      const result = await env.DB.prepare(
        `UPDATE posts
         SET status = 'published', published_at = COALESCE(published_at, scheduled_at, datetime('now')),
             scheduled_at = NULL, updated_at = datetime('now')
         WHERE status = 'draft' AND scheduled_at IS NOT NULL AND scheduled_at <= datetime('now')`
      ).run()
      const published = Number(result.meta.changes || 0)
      await env.DB.prepare(
        "INSERT INTO system_events (event_type, status, details) VALUES ('scheduled_publish', 'success', ?)"
      ).bind(JSON.stringify({ published, scheduledTime: startedAt })).run()
      console.log(JSON.stringify({ message: 'scheduled publish completed', published, scheduledTime: startedAt }))
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error)
      console.error(JSON.stringify({ message: 'scheduled publish failed', error: message, scheduledTime: startedAt }))
      await env.DB.prepare(
        "INSERT INTO system_events (event_type, status, details) VALUES ('scheduled_publish', 'failed', ?)"
      ).bind(JSON.stringify({ error: message, scheduledTime: startedAt })).run()
      throw error
    }
  },
} satisfies ExportedHandler<Env>

