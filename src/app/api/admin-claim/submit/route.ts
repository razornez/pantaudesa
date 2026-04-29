import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { handleApiError } from "@/lib/api-error";
import { writeAuditEvent } from "@/lib/admin-claim/audit";
import { AUDIT_EVENT } from "@/lib/admin-claim/audit-events";

type ClaimMethod = "OFFICIAL_EMAIL" | "WEBSITE_TOKEN" | "SUPPORT_REVIEW";

interface SubmitBody {
  desaId: string;
  method: ClaimMethod;
  officialEmail?: string;
  websiteUrl?: string;
}

const ALLOWED_METHODS: ClaimMethod[] = ["OFFICIAL_EMAIL", "WEBSITE_TOKEN", "SUPPORT_REVIEW"];

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

    let body: SubmitBody;
    try {
      body = await req.json();
    } catch {
      return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
    }

    const { desaId, method, officialEmail, websiteUrl } = body;

    if (!desaId || typeof desaId !== "string") {
      return NextResponse.json({ error: "desaId is required" }, { status: 400 });
    }
    if (!method || !ALLOWED_METHODS.includes(method)) {
      return NextResponse.json({ error: "Invalid method" }, { status: 400 });
    }
    if (method === "OFFICIAL_EMAIL" && officialEmail) {
      const emailOk = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(officialEmail);
      if (!emailOk) {
        return NextResponse.json({ error: "Invalid officialEmail format" }, { status: 400 });
      }
    }

    // Verify desa exists
    const desa = await db.desa.findUnique({ where: { id: desaId }, select: { id: true, nama: true } });
    if (!desa) {
      return NextResponse.json({ error: "Desa not found" }, { status: 404 });
    }

    // Upsert claim — prevent noisy duplicates
    const existing = await db.desaAdminClaim.findFirst({
      where: { userId, desaId },
      select: { id: true, status: true, method: true },
    });

    let claim;
    let eventType: typeof AUDIT_EVENT[keyof typeof AUDIT_EVENT];

    if (existing) {
      // Reuse/update existing claim
      claim = await db.desaAdminClaim.update({
        where: { id: existing.id },
        data: {
          method,
          officialEmail: officialEmail ?? null,
          websiteUrl: websiteUrl ?? null,
          updatedAt: new Date(),
        },
        select: { id: true, status: true, method: true },
      });
      eventType = existing.method !== method ? AUDIT_EVENT.CLAIM_METHOD_UPDATED : AUDIT_EVENT.CLAIM_REUSED;
    } else {
      claim = await db.desaAdminClaim.create({
        data: {
          userId,
          desaId,
          method,
          status: "PENDING",
          officialEmail: officialEmail ?? null,
          websiteUrl: websiteUrl ?? null,
        },
        select: { id: true, status: true, method: true },
      });
      eventType = AUDIT_EVENT.CLAIM_STARTED;
    }

    await writeAuditEvent({
      eventType,
      desaId,
      actorUserId: userId,
      claimId: claim.id,
      method,
      nextStatus: claim.status,
      ipAddress: req.headers.get("x-forwarded-for") ?? undefined,
      userAgent: req.headers.get("user-agent") ?? undefined,
      metadata: { desaName: desa.nama, isNew: !existing },
    });

    return NextResponse.json({
      ok: true,
      claimId: claim.id,
      status: claim.status,
      method: claim.method,
      isNew: !existing,
    });
  } catch (err) {
    return handleApiError(err, "POST /api/admin-claim/submit");
  }
}
