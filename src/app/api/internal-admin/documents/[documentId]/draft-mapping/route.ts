import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { handleApiError } from "@/lib/api-error";
import { requireInternalAdminSession } from "@/lib/auth/internal-admin";
import { writeAuditEvent } from "@/lib/admin-claim/audit";
import { AUDIT_EVENT } from "@/lib/admin-claim/audit-events";
import { generateManualMappingDraft } from "@/lib/admin-claim/ai-mapping";

// POST /api/internal-admin/documents/:documentId/draft-mapping
// Generates an empty manual mapping draft for a PROCESSING document.
// Internal admin reads the document and fills the fields in the publish modal.
// AI provider not yet configured — mapping is manual until owner integrates one.
export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ documentId: string }> },
) {
  const { documentId } = await params;
  try {
    const session = await requireInternalAdminSession();
    if (session instanceof NextResponse) return session;
    if (!db) return NextResponse.json({ error: "Service unavailable" }, { status: 503 });

    const doc = await db.adminDesaDocument.findUnique({
      where: { id: documentId },
      select: { id: true, desaId: true, status: true, title: true },
    });
    if (!doc) return NextResponse.json({ error: "Document not found" }, { status: 404 });
    if (doc.status !== "PROCESSING") {
      return NextResponse.json({
        error: `AI mapping hanya berlaku untuk dokumen PROCESSING. Status saat ini: ${doc.status}.`,
      }, { status: 422 });
    }

    const draft = generateManualMappingDraft();

    await db.adminDesaDocument.update({
      where: { id: documentId },
      data: {
        aiMappingStatus: "DRAFT_PENDING_REVIEW",
        aiMappingResult: JSON.parse(JSON.stringify(draft)),
        updatedAt: new Date(),
      },
    });

    await writeAuditEvent({
      eventType: AUDIT_EVENT.INTERNAL_AI_MAPPING_RUN,
      desaId: doc.desaId,
      actorUserId: session.userId,
      actorRole: "INTERNAL_ADMIN",
      entityType: "AdminDesaDocument",
      entityId: documentId,
      metadata: {
        title: doc.title,
        generator: draft.generator,
      },
      ipAddress: req.headers.get("x-forwarded-for") ?? undefined,
      userAgent: req.headers.get("user-agent") ?? undefined,
    });

    return NextResponse.json({ ok: true, draft });
  } catch (err) {
    return handleApiError(err, `POST /api/internal-admin/documents/${documentId}/draft-mapping`);
  }
}
