import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export type AuditAction =
  | 'USER_ROLE_CHANGED'
  | 'USER_TOGGLED_ACTIVE'
  | 'TOURNAMENT_CREATED'
  | 'TOURNAMENT_STARTED'
  | 'TOURNAMENT_CANCELLED'
  | 'PLAYER_ADDED_TO_TOURNAMENT'
  | 'PLAYER_REMOVED_FROM_TOURNAMENT'
  | 'KNOCKOUT_GENERATED'
  | 'FIXTURE_OVERRIDDEN'
  | 'FIXTURE_EXCLUDED'
  | 'FIXTURE_INCLUDED'
  | 'MATCHDAY_SCORED'
  | 'MATCHDAY_RESULTS_UPDATED'
  | 'LEAGUES_SYNCED'
  | 'TEAMS_SYNCED'
  | 'FIXTURES_SYNCED'
  | 'SETTINGS_CHANGED'
  | 'BROADCAST_SENT';

interface AuditEntry {
  adminId: string;
  action: AuditAction;
  targetType?: string;  // e.g. 'user', 'tournament', 'fixture'
  targetId?: string;
  details?: Record<string, any>;
  ip?: string;
}

/**
 * Log an admin action for audit trail.
 * Stored in admin_audit_log table.
 * Non-blocking — failures are logged but don't break the request.
 */
export async function logAuditEvent(entry: AuditEntry): Promise<void> {
  try {
    await prisma.adminAuditLog.create({
      data: {
        adminId: entry.adminId,
        action: entry.action,
        targetType: entry.targetType || null,
        targetId: entry.targetId || null,
        details: entry.details ? JSON.stringify(entry.details) : null,
        ip: entry.ip || null,
        createdAt: new Date(),
      },
    });
  } catch (error) {
    // Never let audit logging break the request
    console.error('[AUDIT] Failed to log event:', error);
  }
}

/**
 * Get recent audit log entries.
 */
export async function getAuditLog(limit = 50, offset = 0) {
  return prisma.adminAuditLog.findMany({
    include: {
      admin: { select: { id: true, username: true, role: true } },
    },
    orderBy: { createdAt: 'desc' },
    take: limit,
    skip: offset,
  });
}
