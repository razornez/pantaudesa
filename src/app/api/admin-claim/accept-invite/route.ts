import { NextRequest, NextResponse } from "next/server";
import { createHash, randomBytes } from "crypto";
import { db } from "@/lib/db";
import { handleApiError } from "@/lib/api-error";
import { verifyTokenHash, isTokenExpired } from "@/lib/admin-claim/token";
import { writeAuditEvent } from "@/lib/admin-claim/audit";
import { AUDIT_EVENT } from "@/lib/admin-claim/audit-events";

// tokenHash is non-nullable in schema — overwrite with a random burned value
// so the original token can never be replayed even if someone intercepts it.
function burnedTokenHash(): string {
  return createHash("sha256").update(randomBytes(32)).digest("hex");
}

// Accept invite via magic link — no auth required on GET (magic link click)
export async function GET(req: NextRequest) {
  try {
    if (!db) {
      return NextResponse.redirect(new URL("/profil/klaim-admin-desa?error=service_unavailable", req.url));
    }

    const { searchParams } = req.nextUrl;
    const rawToken = searchParams.get("token");
    const inviteId = searchParams.get("inviteId");

    if (!rawToken || !inviteId) {
      return NextResponse.redirect(new URL("/profil/klaim-admin-desa?error=invalid_invite_link", req.url));
    }

    const invite = await db.desaAdminInvite.findUnique({
      where: { id: inviteId },
      select: {
        id: true,
        desaId: true,
        email: true,
        tokenHash: true,
        status: true,
        expiresAt: true,
        invitedById: true,
      },
    });

    if (!invite || !invite.tokenHash) {
      return NextResponse.redirect(new URL("/profil/klaim-admin-desa?error=invalid_invite", req.url));
    }

    if (invite.status !== "PENDING") {
      return NextResponse.redirect(new URL("/profil/klaim-admin-desa?error=invite_used", req.url));
    }

    if (isTokenExpired(invite.expiresAt)) {
      await db.desaAdminInvite.update({ where: { id: inviteId }, data: { status: "EXPIRED" } });
      await writeAuditEvent({
        eventType: AUDIT_EVENT.INVITE_EXPIRED,
        desaId: invite.desaId,
        metadata: { inviteId, email: invite.email },
      });
      return NextResponse.redirect(new URL("/profil/klaim-admin-desa?error=invite_expired", req.url));
    }

    if (!verifyTokenHash(rawToken, invite.tokenHash)) {
      return NextResponse.redirect(new URL("/profil/klaim-admin-desa?error=invalid_invite_token", req.url));
    }

    // Find user by invite email
    const user = await db.user.findUnique({
      where: { email: invite.email },
      select: { id: true },
    });

    if (!user) {
      // User not registered yet — redirect to register with invite context
      return NextResponse.redirect(
        new URL(`/daftar?invite=${inviteId}&email=${encodeURIComponent(invite.email)}`, req.url),
      );
    }

    // Accept: create LIMITED membership
    await db.desaAdminMember.upsert({
      where: { desaId_userId: { desaId: invite.desaId, userId: user.id } },
      create: {
        desaId: invite.desaId,
        userId: user.id,
        role: "LIMITED",
        status: "LIMITED",
        invitedById: invite.invitedById,
      },
      update: { status: "LIMITED", updatedAt: new Date() },
    });

    // Mark invite accepted — overwrite tokenHash with burned value (non-nullable field).
    // Using undefined would leave the original token intact; burned hash ensures no replay.
    await db.desaAdminInvite.update({
      where: { id: inviteId },
      data: { status: "ACCEPTED", acceptedAt: new Date(), tokenHash: burnedTokenHash() },
    });

    await writeAuditEvent({
      eventType: AUDIT_EVENT.INVITE_ACCEPTED,
      desaId: invite.desaId,
      actorUserId: user.id,
      targetUserId: invite.invitedById,
      nextStatus: "LIMITED",
      metadata: { inviteId, email: invite.email },
    });

    return NextResponse.redirect(new URL("/profil/klaim-admin-desa?invite=accepted", req.url));
  } catch (err) {
    return handleApiError(err, "GET /api/admin-claim/accept-invite");
  }
}
