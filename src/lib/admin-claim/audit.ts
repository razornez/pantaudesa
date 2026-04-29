import { db } from "@/lib/db";
import type { AuditEventType } from "@/lib/admin-claim/audit-events";

export interface AuditPayload {
  eventType: AuditEventType;
  desaId?: string;
  actorUserId?: string;
  targetUserId?: string;
  claimId?: string;
  method?: string;
  previousStatus?: string;
  nextStatus?: string;
  evidenceType?: string;
  evidenceUrl?: string;
  evidenceHash?: string;
  ipAddress?: string;
  userAgent?: string;
  metadata?: Record<string, unknown>;
}

export async function writeAuditEvent(payload: AuditPayload): Promise<void> {
  if (!db) {
    console.warn("[audit] DB unavailable — audit event not written:", payload.eventType);
    return;
  }
  try {
    await db.adminClaimAudit.create({
      data: {
        eventType:      payload.eventType,
        desaId:         payload.desaId,
        actorUserId:    payload.actorUserId,
        targetUserId:   payload.targetUserId,
        claimId:        payload.claimId,
        method:         payload.method,
        previousStatus: payload.previousStatus,
        nextStatus:     payload.nextStatus,
        evidenceType:   payload.evidenceType,
        evidenceUrl:    payload.evidenceUrl,
        evidenceHash:   payload.evidenceHash,
        ipAddress:      payload.ipAddress,
        userAgent:      payload.userAgent,
        metadata:       payload.metadata ? JSON.parse(JSON.stringify(payload.metadata)) : undefined,
      },
    });
  } catch (err) {
    // Audit failure must never crash the main flow
    console.error("[audit] Failed to write audit event:", payload.eventType, err);
  }
}
