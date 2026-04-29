import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { handleApiError } from "@/lib/api-error";
import { verifyTokenHash, isTokenExpired } from "@/lib/admin-claim/token";
import { writeAuditEvent } from "@/lib/admin-claim/audit";
import { AUDIT_EVENT } from "@/lib/admin-claim/audit-events";

// Email token verification callback — no auth required (magic link)
export async function GET(req: NextRequest) {
  try {
    if (!db) {
      return NextResponse.redirect(new URL("/profil/klaim-admin-desa?error=service_unavailable", req.url));
    }

    const { searchParams } = req.nextUrl;
    const rawToken = searchParams.get("token");
    const claimId = searchParams.get("claimId");

    if (!rawToken || !claimId) {
      return NextResponse.redirect(new URL("/profil/klaim-admin-desa?error=invalid_link", req.url));
    }

    const claim = await db.desaAdminClaim.findUnique({
      where: { id: claimId },
      select: {
        id: true,
        userId: true,
        desaId: true,
        status: true,
        tokenHash: true,
        tokenExpiresAt: true,
        method: true,
      },
    });

    if (!claim || !claim.tokenHash) {
      return NextResponse.redirect(new URL("/profil/klaim-admin-desa?error=invalid_token", req.url));
    }

    if (isTokenExpired(claim.tokenExpiresAt)) {
      await writeAuditEvent({
        eventType: AUDIT_EVENT.EMAIL_TOKEN_EXPIRED,
        desaId: claim.desaId,
        actorUserId: claim.userId,
        claimId,
        method: "OFFICIAL_EMAIL",
      });
      return NextResponse.redirect(new URL("/profil/klaim-admin-desa?error=token_expired", req.url));
    }

    if (!verifyTokenHash(rawToken, claim.tokenHash)) {
      await writeAuditEvent({
        eventType: AUDIT_EVENT.EMAIL_TOKEN_INVALID,
        desaId: claim.desaId,
        actorUserId: claim.userId,
        claimId,
        method: "OFFICIAL_EMAIL",
      });
      return NextResponse.redirect(new URL("/profil/klaim-admin-desa?error=invalid_token", req.url));
    }

    // Transition: PENDING → LIMITED on email verification
    await db.desaAdminClaim.update({
      where: { id: claimId },
      data: {
        status: "LIMITED",
        tokenHash: null,      // single-use: clear token after use
        tokenExpiresAt: null,
        verifiedAt: new Date(),
      },
    });

    // Upsert DesaAdminMember as LIMITED
    await db.desaAdminMember.upsert({
      where: { desaId_userId: { desaId: claim.desaId, userId: claim.userId } },
      create: {
        desaId: claim.desaId,
        userId: claim.userId,
        role: "LIMITED",
        status: "LIMITED",
      },
      update: {
        status: "LIMITED",
        updatedAt: new Date(),
      },
    });

    await writeAuditEvent({
      eventType: AUDIT_EVENT.EMAIL_TOKEN_VERIFIED,
      desaId: claim.desaId,
      actorUserId: claim.userId,
      claimId,
      method: "OFFICIAL_EMAIL",
      previousStatus: claim.status,
      nextStatus: "LIMITED",
    });

    return NextResponse.redirect(new URL("/profil/klaim-admin-desa?verified=email", req.url));
  } catch (err) {
    return handleApiError(err, "GET /api/admin-claim/verify-email");
  }
}
