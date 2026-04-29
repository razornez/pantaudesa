import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { handleApiError } from "@/lib/api-error";
import { assertTransitionAllowed, type ClaimStatus } from "@/lib/admin-claim/status";
import { writeAuditEvent } from "@/lib/admin-claim/audit";
import { AUDIT_EVENT } from "@/lib/admin-claim/audit-events";

const STATUS_TO_EVENT: Record<ClaimStatus, typeof AUDIT_EVENT[keyof typeof AUDIT_EVENT]> = {
  LIMITED:   AUDIT_EVENT.STATUS_TO_LIMITED,
  VERIFIED:  AUDIT_EVENT.STATUS_TO_VERIFIED,
  REJECTED:  AUDIT_EVENT.STATUS_TO_REJECTED,
  SUSPENDED: AUDIT_EVENT.STATUS_TO_SUSPENDED,
  PENDING:   AUDIT_EVENT.CLAIM_STARTED,
};

export async function POST(req: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    const userId = session.user.id;

    if (!db) {
      return NextResponse.json({ error: "Service unavailable" }, { status: 503 });
    }

    let body: { claimId: string; nextStatus: ClaimStatus; reason?: string };
    try {
      body = await req.json();
    } catch {
      return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
    }

    const { claimId, nextStatus, reason } = body;
    if (!claimId || !nextStatus) {
      return NextResponse.json({ error: "claimId and nextStatus are required" }, { status: 400 });
    }

    const claim = await db.desaAdminClaim.findUnique({
      where: { id: claimId },
      select: { id: true, userId: true, desaId: true, status: true },
    });

    if (!claim) {
      return NextResponse.json({ error: "Claim not found" }, { status: 404 });
    }

    // Only the claim owner can transition their own claim (client-facing transitions)
    if (claim.userId !== userId) {
      return NextResponse.json({ error: "Forbidden — not your claim" }, { status: 403 });
    }

    const currentStatus = claim.status as ClaimStatus;

    try {
      assertTransitionAllowed(currentStatus, nextStatus);
    } catch {
      return NextResponse.json({
        error: `Transition ${currentStatus} → ${nextStatus} is not allowed`,
      }, { status: 422 });
    }

    await db.desaAdminClaim.update({
      where: { id: claimId },
      data: {
        status: nextStatus,
        ...(nextStatus === "VERIFIED" ? { verifiedAt: new Date() } : {}),
        ...(nextStatus === "REJECTED" ? { rejectedAt: new Date(), rejectionReason: reason ?? null } : {}),
      },
    });

    // Keep DesaAdminMember in sync
    if (nextStatus === "VERIFIED") {
      await db.desaAdminMember.upsert({
        where: { desaId_userId: { desaId: claim.desaId, userId: claim.userId } },
        create: { desaId: claim.desaId, userId: claim.userId, role: "VERIFIED_ADMIN", status: "VERIFIED", verifiedById: userId },
        update: { role: "VERIFIED_ADMIN", status: "VERIFIED", verifiedById: userId, updatedAt: new Date() },
      });
    } else if (nextStatus === "SUSPENDED") {
      await db.desaAdminMember.updateMany({
        where: { desaId: claim.desaId, userId: claim.userId },
        data: { status: "SUSPENDED", updatedAt: new Date() },
      });
    }

    await writeAuditEvent({
      eventType: STATUS_TO_EVENT[nextStatus],
      desaId: claim.desaId,
      actorUserId: userId,
      claimId,
      previousStatus: currentStatus,
      nextStatus,
      metadata: reason ? { reason } : undefined,
    });

    return NextResponse.json({ ok: true, claimId, previousStatus: currentStatus, newStatus: nextStatus });
  } catch (err) {
    return handleApiError(err, "POST /api/admin-claim/update-status");
  }
}
