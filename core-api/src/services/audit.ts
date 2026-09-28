import { pool } from '../db';
import { AuthUser } from '../types';

/** Fire-and-forget audit log insert. Never throws. */
export async function writeAuditEvent(
  actor: AuthUser | null,
  action: string,
  entityType?: string,
  entityId?: string,
  meta?: Record<string, unknown>,
  ip?: string,
): Promise<void> {
  try {
    await pool.query(
      `INSERT INTO audit_events(actor_id, action, entity_type, entity_id, meta, ip)
       VALUES($1,$2,$3,$4,$5::jsonb,$6::inet)`,
      [
        actor?.id ?? null,
        action,
        entityType ?? null,
        entityId ?? null,
        meta ? JSON.stringify(meta) : null,
        ip ?? null,
      ],
    );
  } catch {
    // Audit failures must never break the main request
  }
}
