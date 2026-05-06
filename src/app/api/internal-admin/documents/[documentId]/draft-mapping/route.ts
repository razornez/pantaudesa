import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { handleApiError } from "@/lib/api-error";
import { requireInternalAdminSession } from "@/lib/auth/internal-admin";
import { writeAuditEvent } from "@/lib/admin-claim/audit";
import { AUDIT_EVENT } from "@/lib/admin-claim/audit-events";
import {
  createAiMappingDraft,
  generateManualMappingDraft,
  readAiMappingDraft,
  toAiMappingDraftJson,
} from "@/lib/admin-claim/ai-mapping";
import { buildVillageVersionCandidateForDesa } from "@/lib/versioning/desa-versioning";
import {
  syncReviewReadyVillageVersion,
  writeDesaDataAuditEvent,
} from "@/lib/versioning/village-data-persistence";

async function findProcessingDocument(documentId: string) {
  if (!db) return null;

  const doc = await db.adminDesaDocument.findUnique({
    where: { id: documentId },
    select: {
      id: true,
      desaId: true,
      status: true,
      title: true,
      aiMappingStatus: true,
      aiMappingResult: true,
    },
  });

  return doc;
}

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

    const doc = await findProcessingDocument(documentId);
    if (!doc) return NextResponse.json({ error: "Document not found" }, { status: 404 });
    if (doc.status !== "PROCESSING") {
      return NextResponse.json({
        error: `AI mapping hanya berlaku untuk dokumen PROCESSING. Status saat ini: ${doc.status}.`,
      }, { status: 422 });
    }

    const existingDraft = readAiMappingDraft(doc.aiMappingResult);
    if (existingDraft) {
      return NextResponse.json({
        ok: true,
        reused: true,
        aiMappingStatus: doc.aiMappingStatus ?? "DRAFT_READY_REVIEW",
        draft: existingDraft,
      });
    }

    const draft = generateManualMappingDraft();

    await db.adminDesaDocument.update({
      where: { id: documentId },
      data: {
        aiMappingStatus: "DRAFT_PENDING_REVIEW",
        aiMappingResult: toAiMappingDraftJson(draft),
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

    return NextResponse.json({
      ok: true,
      reused: false,
      aiMappingStatus: "DRAFT_PENDING_REVIEW",
      draft,
    });
  } catch (err) {
    return handleApiError(err, `POST /api/internal-admin/documents/${documentId}/draft-mapping`);
  }
}

// PATCH /api/internal-admin/documents/:documentId/draft-mapping
// Saves the internal review draft without publishing anything.
export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ documentId: string }> },
) {
  const { documentId } = await params;
  try {
    const session = await requireInternalAdminSession();
    if (session instanceof NextResponse) return session;
    if (!db) return NextResponse.json({ error: "Service unavailable" }, { status: 503 });

    const doc = await findProcessingDocument(documentId);
    if (!doc) return NextResponse.json({ error: "Document not found" }, { status: 404 });
    if (doc.status !== "PROCESSING") {
      return NextResponse.json({
        error: `Draft review hanya berlaku untuk dokumen PROCESSING. Status saat ini: ${doc.status}.`,
      }, { status: 422 });
    }

    const body = (await req.json().catch(() => ({}))) as {
      fields?: unknown;
      notes?: unknown;
    };

    const existingDraft = readAiMappingDraft(doc.aiMappingResult) ?? generateManualMappingDraft();
    const nextDraft = createAiMappingDraft({
      generatedAt: existingDraft.generatedAt,
      generator: existingDraft.generator,
      fields: body.fields ?? existingDraft.fields,
      notes:
        typeof body.notes === "string"
          ? body.notes
          : existingDraft.notes,
    });

    await db.adminDesaDocument.update({
      where: { id: documentId },
      data: {
        aiMappingStatus: "DRAFT_READY_REVIEW",
        aiMappingResult: toAiMappingDraftJson(nextDraft),
        updatedAt: new Date(),
      },
    });

    const draftVersionCandidate = await buildVillageVersionCandidateForDesa({
      desaId: doc.desaId,
      mappedFields: nextDraft.fields,
      createdAt: nextDraft.generatedAt,
    });
    const reviewReadyVersion = draftVersionCandidate
      ? await syncReviewReadyVillageVersion({
          desaId: doc.desaId,
          sourceDocumentId: documentId,
          title: doc.title,
          sourceLabel: "Draft review internal",
          reviewNote: nextDraft.notes ?? null,
          changedFields: draftVersionCandidate.changedFields,
          proposedSnapshot: draftVersionCandidate.proposedSnapshot,
          beforeSnapshot: draftVersionCandidate.baseSnapshot,
          createdByUserId: session.userId,
        })
      : { persisted: false as const };

    await writeAuditEvent({
      eventType: AUDIT_EVENT.INTERNAL_DOCUMENT_REVIEWED,
      desaId: doc.desaId,
      actorUserId: session.userId,
      actorRole: "INTERNAL_ADMIN",
      entityType: "AdminDesaDocument",
      entityId: documentId,
      metadata: {
        title: doc.title,
        action: "draft_saved",
        fieldCount: Object.keys(nextDraft.fields).length,
        versionNumber: reviewReadyVersion.versionNumber ?? null,
      },
      ipAddress: req.headers.get("x-forwarded-for") ?? undefined,
      userAgent: req.headers.get("user-agent") ?? undefined,
    });

    await writeDesaDataAuditEvent({
      desaId: doc.desaId,
      sourceDocumentId: documentId,
      villageDataVersionId: reviewReadyVersion.id ?? null,
      actorUserId: session.userId,
      actorRole: "INTERNAL_ADMIN",
      eventType: AUDIT_EVENT.INTERNAL_DOCUMENT_REVIEWED,
      eventLabel: "Draft review disimpan",
      previousStatus: doc.status,
      nextStatus: doc.status,
      note: nextDraft.notes ?? null,
      metadata: {
        title: doc.title,
        action: "draft_saved",
        fieldCount: Object.keys(nextDraft.fields).length,
        versionNumber: reviewReadyVersion.versionNumber ?? null,
      },
    });

    return NextResponse.json({
      ok: true,
      reused: true,
      aiMappingStatus: "DRAFT_READY_REVIEW",
      draft: nextDraft,
    });
  } catch (err) {
    return handleApiError(err, `PATCH /api/internal-admin/documents/${documentId}/draft-mapping`);
  }
}
