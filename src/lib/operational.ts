import { createHash } from 'node:crypto'
import { execute } from '@/lib/postgres'

export function identityHash(value: string) {
  return createHash('sha256').update(value).digest('hex')
}

export async function auditEvent(input: { actorEmail?: string | null; action: string; targetType?: string; targetId?: string; metadata?: Record<string, unknown>; ipHash?: string }) {
  await execute('INSERT INTO audit_logs(actor_email, action, target_type, target_id, metadata, ip_hash) VALUES ($1,$2,$3,$4,$5::jsonb,$6)', [input.actorEmail || null, input.action, input.targetType || null, input.targetId || null, JSON.stringify(input.metadata || {}), input.ipHash || null])
}
