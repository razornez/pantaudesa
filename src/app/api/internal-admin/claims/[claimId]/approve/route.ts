import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { handleApiError } from "@/lib/api-error";
import { requireInternalAdminSession } from "@/lib/auth/internal-admin";
import { writeAuditEvent } from "@/lib/admin-claim/audit";
import { AUDIT_EVENT } from "@/lib/admin-claim/audit-events";

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ claimId: string }> },
) {
  try {
    const adminSession = await requireInternalAdminSession();
    if (adminSession instanceof NextResponse) return adminSession;

    if (!db) {
      return NextResponse.json({ error: "Service unavailable" }, { status: 503 });
    }

    const { claimId } = await params;

    const claim = await db.desaAdminClaim.findUnique({
      where: { id: claimId },
      select: {
        id: true,
        userId: true,
        desaId: true,
        status: true,
        desa: { select: { nama: true } },
        user: { select: { email: true, nama: true } },
      },
    });

    if (!claim) {
      return NextResponse.json({ error: "Claim not found" }, { status: 404 });
    }
    if (claim.status !== "IN_REVIEW") {
      return NextResponse.json({
        error: `Only IN_REVIEW claims can be approved. Current status: ${claim.status}`,
      }, { status: 422 });
    }

    // Enforce one VERIFIED per desa
    const existingVerified = await db.desaAdminMember.findFirst({
      where: { desaId: claim.desaId, status: "VERIFIED" },
      select: { id: true, user: { select: { email: true } } },
    });
    if (existingVerified) {
      return NextResponse.json({
        error: `Desa ini sudah memiliki Admin Desa VERIFIED (${existingVerified.user.email}). Revoke akses tersebut sebelum menyetujui klaim baru.`,
        code: "DESA_ALREADY_HAS_VERIFIED",
      }, { status: 409 });
    }

    const now = new Date();

    // Approve: claim → APPROVED; membership → VERIFIED
    await db.desaAdminClaim.update({
      where: { id: claimId },
      data: {
        status: "APPROVED",
        verifiedAt: now,
        rejectCategory: null,
        rejectReason: null,
        rejectInstructions: null,
        rejectedAt: null,
        rejectionReason: null,
      },
    });

    await db.desaAdminMember.upsert({
      where: { desaId_userId: { desaId: claim.desaId, userId: claim.userId } },
      create: {
        desaId: claim.desaId,
        userId: claim.userId,
        role: "VERIFIED_ADMIN",
        status: "VERIFIED",
        verifiedById: adminSession.userId,
        invitedAt: now,
        acceptedAt: now,
      },
      update: {
        role: "VERIFIED_ADMIN",
        status: "VERIFIED",
        verifiedById: adminSession.userId,
        revokedAt: null,
        revokedReason: null,
        updatedAt: now,
      },
    });

    await writeAuditEvent({
      eventType: AUDIT_EVENT.INTERNAL_CLAIM_APPROVED,
      desaId: claim.desaId,
      actorUserId: adminSession.userId,
      actorRole: "INTERNAL_ADMIN",
      targetUserId: claim.userId,
      claimId,
      entityType: "DesaAdminClaim",
      entityId: claimId,
      previousStatus: "IN_REVIEW",
      nextStatus: "APPROVED",
      metadata: {
        desaName: claim.desa.nama,
        userEmail: claim.user.email,
      },
      ipAddress: req.headers.get("x-forwarded-for") ?? undefined,
      userAgent: req.headers.get("user-agent") ?? undefined,
    });

    await writeAuditEvent({
      eventType: AUDIT_EVENT.MEMBER_VERIFIED,
      desaId: claim.desaId,
      actorUserId: adminSession.userId,
      actorRole: "INTERNAL_ADMIN",
      targetUserId: claim.userId,
      claimId,
      entityType: "DesaAdminMember",
      previousStatus: "LIMITED",
      nextStatus: "VERIFIED",
      metadata: { desaName: claim.desa.nama, userEmail: claim.user.email },
    });

    return NextResponse.json({
      ok: true,
      claimId,
      newClaimStatus: "APPROVED",
      newMemberStatus: "VERIFIED",
    });
  } catch (err) {
    return handleApiError(err, `POST /api/internal-admin/claims/${(await params).claimId}/approve`);
  }
}
