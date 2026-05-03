import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { handleApiError } from "@/lib/api-error";
import { requireInternalAdminSession } from "@/lib/auth/internal-admin";
import { writeAuditEvent } from "@/lib/admin-claim/audit";
import { AUDIT_EVENT } from "@/lib/admin-claim/audit-events";

// POST /api/internal-admin/documents/:documentId/mark-failed
// Body: { reason: string }
// Marks PROCESSING (or WAITING_VERIFIED_APPROVAL) document as FAILED with user-safe reason.
export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ documentId: string }> },
) {
  const { documentId } = await params;
  try {
    const session = await requireInternalAdminSession();
    if (session instanceof NextResponse) return session;
    if (!db) return NextResponse.json({ error: "Service unavailable" }, { status: 503 });

    let body: { reason?: string } = {};
    try { body = await req.json(); } catch { /* required below */ }
    const reason = body.reason?.trim();
    if (!reason) {
      return NextResponse.json({ error: "reason is required" }, { status: 400 });
    }
    if (reason.length > 1000) {
      return NextResponse.json({ error: "reason too long (max 1000 chars)" }, { status: 400 });
    }

    const doc = await db.adminDesaDocument.findUnique({
      where: { id: documentId },
      select: { id: true, desaId: true, status: true, title: true },
    });
    if (!doc) return NextResponse.json({ error: "Document not found" }, { status: 404 });
    if (doc.status === "PUBLISHED" || doc.status === "FAILED") {
      return NextResponse.json({
        error: `Dokumen sudah dalam status final: ${doc.status}.`,
      }, { status: 422 });
    }

    const now = new Date();
    await db.adminDesaDocument.update({
      where: { id: documentId },
      data: {
        status: "FAILED",
        failedReason: reason,
        aiMappingStatus: "FAILED",
        updatedAt: now,
      },
    });

    await writeAuditEvent({
      eventType: AUDIT_EVENT.INTERNAL_DOCUMENT_FAILED,
      desaId: doc.desaId,
      actorUserId: session.userId,
      actorRole: "INTERNAL_ADMIN",
      entityType: "AdminDesaDocument",
      entityId: documentId,
      previousStatus: doc.status,
      nextStatus: "FAILED",
      reasonText: reason,
      metadata: { title: doc.title },
      ipAddress: req.headers.get("x-forwarded-for") ?? undefined,
      userAgent: req.headers.get("user-agent") ?? undefined,
    });

    return NextResponse.json({ ok: true, documentId, newStatus: "FAILED" });
  } catch (err) {
    return handleApiError(err, `POST /api/internal-admin/documents/${documentId}/mark-failed`);
  }
}
