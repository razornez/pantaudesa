import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { handleApiError } from "@/lib/api-error";
import { writeAuditEvent } from "@/lib/admin-claim/audit";
import { AUDIT_EVENT } from "@/lib/admin-claim/audit-events";
import { createNotification, NOTIF_TYPE } from "@/lib/notifications/create-notification";
import { isVerifiedAdminMember } from "@/lib/admin-desa/policy";

// POST /api/admin-claim/documents/:documentId/approve
// VERIFIED admin approves a LIMITED-uploaded document:
//   AdminDesaDocument.status WAITING_VERIFIED_APPROVAL → PROCESSING
export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ documentId: string }> },
) {
  const { documentId } = await params;
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    const userId = session.user.id;

    if (!db) {
      return NextResponse.json({ error: "Service unavailable" }, { status: 503 });
    }

    const doc = await db.adminDesaDocument.findUnique({
      where: { id: documentId },
      select: {
        id: true,
        desaId: true,
        status: true,
        title: true,
        uploadedById: true,
      },
    });
    if (!doc) {
      return NextResponse.json({ error: "Document not found" }, { status: 404 });
    }

    if (doc.status !== "WAITING_VERIFIED_APPROVAL") {
      return NextResponse.json({
        error: `Hanya dokumen dengan status WAITING_VERIFIED_APPROVAL yang dapat disetujui. Saat ini: ${doc.status}.`,
      }, { status: 422 });
    }

    // Caller must be VERIFIED admin in the same desa.
    const actor = await db.desaAdminMember.findFirst({
      where: {
        desaId: doc.desaId,
        userId,
      },
      select: { id: true, status: true, role: true },
    });
    if (!actor || !isVerifiedAdminMember(actor.status, actor.role)) {
      return NextResponse.json({
        error: "Hanya Admin Desa VERIFIED yang dapat menyetujui dokumen.",
      }, { status: 403 });
    }

    const now = new Date();
    await db.adminDesaDocument.update({
      where: { id: documentId },
      data: {
        status: "PROCESSING",
        approvedById: userId,
        approvedAt: now,
        updatedAt: now,
      },
    });

    await writeAuditEvent({
      eventType: AUDIT_EVENT.DOCUMENT_APPROVED_BY_VERIFIED,
      desaId: doc.desaId,
      actorUserId: userId,
      actorRole: "VERIFIED_ADMIN",
      targetUserId: doc.uploadedById ?? undefined,
      entityType: "AdminDesaDocument",
      entityId: doc.id,
      previousStatus: "WAITING_VERIFIED_APPROVAL",
      nextStatus: "PROCESSING",
      metadata: {
        title: doc.title,
        action: "approved-by-verified",
      },
      ipAddress: req.headers.get("x-forwarded-for") ?? undefined,
      userAgent: req.headers.get("user-agent") ?? undefined,
    });

    // Notify uploader their document was approved.
    if (doc.uploadedById) {
      await createNotification({
        userId: doc.uploadedById,
        type: NOTIF_TYPE.DOCUMENT_APPROVED,
        title: "Dokumen kamu disetujui",
        body: `"${doc.title}" telah disetujui oleh Admin VERIFIED dan sekarang sedang diproses oleh tim PantauDesa.`,
        desaId: doc.desaId,
        metadata: { documentId },
      });
    }

    return NextResponse.json({
      ok: true,
      documentId,
      newStatus: "PROCESSING",
    });
  } catch (err) {
    return handleApiError(err, `POST /api/admin-claim/documents/${documentId}/approve`);
  }
}
