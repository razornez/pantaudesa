import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { handleApiError } from "@/lib/api-error";
import { generateRawToken, hashToken, tokenExpiresAt } from "@/lib/admin-claim/token";
import { sendAdminInviteEmail } from "@/lib/email/admin-claim-email";
import { writeAuditEvent } from "@/lib/admin-claim/audit";
import { AUDIT_EVENT } from "@/lib/admin-claim/audit-events";

const MAX_ADMINS_PER_DESA = 5;
const INVITE_TTL_MS = 7 * 24 * 60 * 60 * 1000; // 7 days

export async function POST(req: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    const inviterId = session.user.id;

    if (!db) {
      return NextResponse.json({ error: "Service unavailable" }, { status: 503 });
    }

    let body: { desaId: string; email: string };
    try {
      body = await req.json();
    } catch {
      return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
    }

    const { desaId, email } = body;
    if (!desaId || !email) {
      return NextResponse.json({ error: "desaId and email are required" }, { status: 400 });
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return NextResponse.json({ error: "Invalid email format" }, { status: 400 });
    }

    // Verify inviter is a VERIFIED_ADMIN for this desa
    const inviterMember = await db.desaAdminMember.findFirst({
      where: { desaId, userId: inviterId, role: "VERIFIED_ADMIN", status: "VERIFIED" },
      select: { id: true },
    });
    if (!inviterMember) {
      return NextResponse.json({ error: "Only verified desa admins can invite" }, { status: 403 });
    }

    // Enforce max 5 admins per desa
    const currentCount = await db.desaAdminMember.count({
      where: { desaId, status: { in: ["LIMITED", "VERIFIED"] } },
    });
    if (currentCount >= MAX_ADMINS_PER_DESA) {
      return NextResponse.json({
        error: `Max ${MAX_ADMINS_PER_DESA} admins per desa reached`,
      }, { status: 422 });
    }

    const desa = await db.desa.findUnique({ where: { id: desaId }, select: { nama: true } });
    if (!desa) {
      return NextResponse.json({ error: "Desa not found" }, { status: 404 });
    }

    // Generate invite token — hash only
    const rawToken = generateRawToken();
    const tokenHash = hashToken(rawToken);
    const expiresAt = tokenExpiresAt(INVITE_TTL_MS);

    const invite = await db.desaAdminInvite.create({
      data: {
        desaId,
        email,
        tokenHash,
        invitedById: inviterId,
        status: "PENDING",
        expiresAt,
      },
      select: { id: true },
    });

    const emailResult = await sendAdminInviteEmail({
      toEmail: email,
      desaName: desa.nama,
      rawToken,
      inviteId: invite.id,
    });

    await writeAuditEvent({
      eventType: AUDIT_EVENT.INVITE_CREATED,
      desaId,
      actorUserId: inviterId,
      metadata: {
        inviteId: invite.id,
        toEmail: email,
        emailSent: emailResult.ok,
        emailError: emailResult.ok ? undefined : emailResult.code,
        expiresAt: expiresAt.toISOString(),
      },
      ipAddress: req.headers.get("x-forwarded-for") ?? undefined,
      userAgent: req.headers.get("user-agent") ?? undefined,
    });

    return NextResponse.json({
      ok: true,
      inviteId: invite.id,
      expiresAt: expiresAt.toISOString(),
      emailSent: emailResult.ok,
      ...(process.env.NODE_ENV === "development" && !emailResult.ok
        ? { devToken: rawToken }
        : {}),
    });
  } catch (err) {
    return handleApiError(err, "POST /api/admin-claim/invite");
  }
}
