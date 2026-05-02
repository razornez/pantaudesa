import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { handleApiError } from "@/lib/api-error";
import { verifyTokenHash, isTokenExpired } from "@/lib/admin-claim/token";
import { checkWebsiteForToken } from "@/lib/admin-claim/website-token";
import { writeAuditEvent } from "@/lib/admin-claim/audit";
import { AUDIT_EVENT } from "@/lib/admin-claim/audit-events";

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

    let body: { claimId: string; rawToken: string };
    try {
      body = await req.json();
    } catch {
      return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
    }

    const { claimId, rawToken } = body;
    if (!claimId || !rawToken) {
      return NextResponse.json({ error: "claimId and rawToken are required" }, { status: 400 });
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
        websiteUrl: true,
      },
    });

    if (!claim || claim.userId !== userId) {
      return NextResponse.json({ error: "Claim not found" }, { status: 404 });
    }
    if (!claim.tokenHash || !claim.websiteUrl) {
      return NextResponse.json({ error: "No website token generated for this claim" }, { status: 400 });
    }

    if (isTokenExpired(claim.tokenExpiresAt)) {
      await writeAuditEvent({
        eventType: AUDIT_EVENT.WEBSITE_TOKEN_EXPIRED,
        desaId: claim.desaId,
        actorUserId: userId,
        claimId,
        method: "WEBSITE_TOKEN",
      });
      return NextResponse.json({ ok: false, found: false, reason: "token_expired" });
    }

    // Verify rawToken matches stored hash (prevents token substitution)
    if (!verifyTokenHash(rawToken, claim.tokenHash)) {
      return NextResponse.json({ ok: false, found: false, reason: "token_mismatch" });
    }

    const result = await checkWebsiteForToken(claim.websiteUrl, rawToken);

    if (result.blocked) {
      await writeAuditEvent({
        eventType: AUDIT_EVENT.WEBSITE_CHECK_BLOCKED,
        desaId: claim.desaId,
        actorUserId: userId,
        claimId,
        method: "WEBSITE_TOKEN",
        evidenceUrl: claim.websiteUrl,
        metadata: { reason: result.reason },
      });
      return NextResponse.json({ ok: false, found: false, blocked: true, reason: result.reason });
    }

    if (!result.found) {
      await writeAuditEvent({
        eventType: AUDIT_EVENT.WEBSITE_TOKEN_NOT_FOUND,
        desaId: claim.desaId,
        actorUserId: userId,
        claimId,
        method: "WEBSITE_TOKEN",
        evidenceUrl: claim.websiteUrl,
        metadata: { reason: result.reason },
      });
      return NextResponse.json({ ok: true, found: false, reason: result.reason });
    }

    // Token found on website — PENDING → IN_REVIEW, member upserted as LIMITED
    await db.desaAdminClaim.update({
      where: { id: claimId },
      data: {
        status: "IN_REVIEW",
        tokenHash: null,      // single-use: clear after successful verification
        tokenExpiresAt: null,
        verifiedAt: new Date(),
      },
    });

    await db.desaAdminMember.upsert({
      where: { desaId_userId: { desaId: claim.desaId, userId: claim.userId } },
      create: {
        desaId: claim.desaId,
        userId: claim.userId,
        role: "LIMITED_ADMIN",
        status: "LIMITED",
        invitedAt: new Date(),
        acceptedAt: new Date(),
      },
      update: { status: "LIMITED", acceptedAt: new Date(), updatedAt: new Date() },
    });

    await writeAuditEvent({
      eventType: AUDIT_EVENT.WEBSITE_TOKEN_FOUND,
      desaId: claim.desaId,
      actorUserId: userId,
      claimId,
      method: "WEBSITE_TOKEN",
      previousStatus: claim.status,
      nextStatus: "IN_REVIEW",
      evidenceUrl: claim.websiteUrl,
    });

    return NextResponse.json({ ok: true, found: true, newStatus: "IN_REVIEW" });
  } catch (err) {
    return handleApiError(err, "POST /api/admin-claim/check-website-token");
  }
}
