import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { handleApiError } from "@/lib/api-error";
import { requireInternalAdminSession } from "@/lib/auth/internal-admin";
import { writeAuditEvent } from "@/lib/admin-claim/audit";
import { AUDIT_EVENT } from "@/lib/admin-claim/audit-events";
import { sanitizeMappingFields, AI_MAPPABLE_DESA_FIELDS } from "@/lib/admin-claim/ai-mapping";

// POST /api/internal-admin/documents/:documentId/publish
// Internal admin publishes a PROCESSING document. Optional body.fields applies
// allowed field updates to the Desa record (versioning via audit before/after).
//
// Body: { fields?: Record<AiMappableDesaField, string|number|null>, note?: string }
export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ documentId: string }> },
) {
  const { documentId } = await params;
  try {
    const session = await requireInternalAdminSession();
    if (session instanceof NextResponse) return session;
    if (!db) return NextResponse.json({ error: "Service unavailable" }, { status: 503 });

    let body: { fields?: unknown; note?: string } = {};
    try { body = await req.json(); } catch { /* optional */ }

    const requestedFields = sanitizeMappingFields(body.fields);
    const note = typeof body.note === "string" ? body.note.trim().slice(0, 500) : null;

    const doc = await db.adminDesaDocument.findUnique({
      where: { id: documentId },
      select: { id: true, desaId: true, status: true, title: true, aiMappingResult: true },
    });
    if (!doc) return NextResponse.json({ error: "Document not found" }, { status: 404 });
    if (doc.status !== "PROCESSING") {
      return NextResponse.json({
        error: `Hanya dokumen PROCESSING yang dapat dipublikasikan. Status saat ini: ${doc.status}.`,
      }, { status: 422 });
    }

    const dbClient = db;
    const result = await dbClient.$transaction(async (tx) => {
      const now = new Date();

      let beforeSnapshot: Record<string, string | number | null> | null = null;
      let afterSnapshot: Record<string, string | number | null> | null = null;

      // Apply field updates to Desa if any field was provided.
      const fieldKeys = Object.keys(requestedFields) as Array<keyof typeof requestedFields>;
      if (fieldKeys.length > 0) {
        const desaBefore = await tx.desa.findUnique({
          where: { id: doc.desaId },
          select: AI_MAPPABLE_DESA_FIELDS.reduce(
            (acc, k) => { acc[k] = true; return acc; },
            {} as Record<string, true>,
          ),
        });
        if (!desaBefore) {
          return { kind: "error" as const, status: 404, body: { error: "Desa not found" } };
        }
        beforeSnapshot = {};
        afterSnapshot = {};
        for (const key of fieldKeys) {
          const before = (desaBefore as Record<string, unknown>)[key];
          const after = requestedFields[key] ?? null;
          beforeSnapshot[key as string] =
            before === null || before === undefined
              ? null
              : typeof before === "string" || typeof before === "number"
              ? before
              : String(before);
          afterSnapshot[key as string] = after;
        }

        await tx.desa.update({
          where: { id: doc.desaId },
          data: requestedFields as Parameters<typeof tx.desa.update>[0]["data"],
        });
      }

      await tx.adminDesaDocument.update({
        where: { id: documentId },
        data: {
          status: "PUBLISHED",
          publishedAt: now,
          aiMappingStatus: "DONE",
          updatedAt: now,
        },
      });

      return { kind: "ok" as const, beforeSnapshot, afterSnapshot, now };
    });

    if (result.kind === "error") {
      return NextResponse.json(result.body, { status: result.status });
    }

    await writeAuditEvent({
      eventType: AUDIT_EVENT.INTERNAL_DATA_PUBLISHED,
      desaId: doc.desaId,
      actorUserId: session.userId,
      actorRole: "INTERNAL_ADMIN",
      entityType: "AdminDesaDocument",
      entityId: documentId,
      previousStatus: "PROCESSING",
      nextStatus: "PUBLISHED",
      reasonText: note ?? undefined,
      metadata: {
        title: doc.title,
        appliedFieldCount: result.beforeSnapshot ? Object.keys(result.beforeSnapshot).length : 0,
        beforeSnapshot: result.beforeSnapshot,
        afterSnapshot: result.afterSnapshot,
      },
      ipAddress: req.headers.get("x-forwarded-for") ?? undefined,
      userAgent: req.headers.get("user-agent") ?? undefined,
    });

    return NextResponse.json({
      ok: true,
      documentId,
      newStatus: "PUBLISHED",
      appliedFields: result.beforeSnapshot ? Object.keys(result.beforeSnapshot) : [],
    });
  } catch (err) {
    return handleApiError(err, `POST /api/internal-admin/documents/${documentId}/publish`);
  }
}
