import type { NextRequest } from 'next/server'

type AuditInput = {
  userId?: string | null
  action: string
  targetType: string
  targetId?: string | null
  summary: string
  metadata?: Record<string, unknown>
  request?: NextRequest | Request
}

export async function writeAuditLog(db: D1Database, input: AuditInput) {
  const forwarded = input.request?.headers.get('cf-connecting-ip') || input.request?.headers.get('x-forwarded-for') || ''
  const ipAddress = forwarded.split(',')[0].trim().slice(0, 80) || null
  await db.prepare(
    `INSERT INTO audit_logs (user_id, action, target_type, target_id, summary, metadata, ip_address)
     VALUES (?, ?, ?, ?, ?, ?, ?)`
  ).bind(
    input.userId || null,
    input.action.slice(0, 80),
    input.targetType.slice(0, 80),
    input.targetId || null,
    input.summary.slice(0, 240),
    JSON.stringify(input.metadata || {}),
    ipAddress,
  ).run()
}
