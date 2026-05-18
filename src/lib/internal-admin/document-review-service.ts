import { db } from "@/lib/db";
import { writeAuditEvent } from "@/lib/admin-claim/audit";
import { AUDIT_EVENT } from "@/lib/admin-claim/audit-events";
import {
  AI_MAPPABLE_DESA_SELECT,
  createAiMappingDraft,
  createDesaMappingUpdateData,
  generateManualMappingDraft,
  getMappingFieldKeys,
  readAiMappingDraft,
  sanitizeMappingFields,
  toAiMappingDraftJson,
  type AiMappingFieldValue,
} from "@/lib/admin-claim/ai-mapping";
import { createNotifications, createNotification, NOTIF_TYPE } from "@/lib/notifications/create-notification";
import {
  getChangedVersionFields,
  readVillageVersionCandidate,
  type DesaVersionSnapshot,
} from "@/lib/versioning/desa-versioning";
import {
  failVillageDataVersionForDocument,
  publishVillageDataVersion,
  syncReviewReadyVillageVersion,
  writeDesaDataAuditEvent,
} from "@/lib/versioning/village-data-persistence";
import {
  findDocumentForReview,
  getRequestActorMeta,
  toDesaVersionSnapshot,
} from "@/lib/internal-admin/document-review";
import {
  validateDraftGenerationStatus,
  validateDraftSaveStatus,
  validateFailStatus,
  validatePublishStatus,
} from "@/lib/internal-admin/document-review-policy";
import type { DraftMappingPatchBody, PublishReviewBody } from "@/lib/internal-admin/document-review-validation";

type DbClient = Exclude<typeof db, null>;

interface ActorContext {
  userId: string;
  requestMeta: ReturnType<typeof getRequestActorMeta>;
}

type ServiceResult<T> =
  | { ok: true; data: T }
  | { ok: false; status: number; body: Record<string, unknown> };

function serviceError(status: number, error: string): ServiceResult<never> {
  return { ok: false, status, body: { error } };
}

function isFallbackReviewStatus(
  status: "WAITING_VERIFIED_APPROVAL" | "PROCESSING" | "PUBLISHED" | "REJECTED" | "FAILED",
) {
  return status === "WAITING_VERIFIED_APPROVAL";
}

export async function createDocumentDraftMapping(params: {
  db: DbClient;
  documentId: string;
  actor: ActorContext;
}): Promise<
  ServiceResult<{
    reused: boolean;
    aiMappingStatus: string;
    draft: ReturnType<typeof generateManualMappingDraft>;
  }>
> {
  const doc = await findDocumentForReview(params.db, params.documentId);
  if (!doc) return serviceError(404, "Document not found");

  const statusError = validateDraftGenerationStatus(doc.status);
  if (statusError) return serviceError(statusError.status, statusError.error);

  const existingDraft = readAiMappingDraft(doc.aiMappingResult);
  if (existingDraft) {
    return {
      ok: true,
      data: {
        reused: true,
        aiMappingStatus: doc.aiMappingStatus ?? "DRAFT_READY_REVIEW",
        draft: existingDraft,
      },
    };
  }

  const draft = generateManualMappingDraft();

  await params.db.adminDesaDocument.update({
    where: { id: params.documentId },
    data: {
      aiMappingStatus: "DRAFT_PENDING_REVIEW",
      aiMappingResult: toAiMappingDraftJson(draft),
      updatedAt: new Date(),
    },
  });

  await writeAuditEvent({
    eventType: AUDIT_EVENT.INTERNAL_AI_MAPPING_RUN,
    desaId: doc.desaId,
    actorUserId: params.actor.userId,
    actorRole: "INTERNAL_ADMIN",
    entityType: "AdminDesaDocument",
    entityId: params.documentId,
    metadata: {
      title: doc.title,
      generator: draft.generator,
    },
    ...params.actor.requestMeta,
  });

  return {
    ok: true,
    data: {
      reused: false,
      aiMappingStatus: "DRAFT_PENDING_REVIEW",
      draft,
    },
  };
}

export async function saveDocumentDraftMapping(params: {
  db: DbClient;
  documentId: string;
  body: DraftMappingPatchBody;
  actor: ActorContext;
}): Promise<
  ServiceResult<{
    reused: boolean;
    aiMappingStatus: string;
    draft: ReturnType<typeof createAiMappingDraft>;
  }>
> {
  const doc = await findDocumentForReview(params.db, params.documentId);
  if (!doc) return serviceError(404, "Document not found");

  const statusError = validateDraftSaveStatus(doc.status);
  if (statusError) return serviceError(statusError.status, statusError.error);

  const existingDraft = readAiMappingDraft(doc.aiMappingResult) ?? generateManualMappingDraft();
  const nextDraft = createAiMappingDraft({
    generatedAt: existingDraft.generatedAt,
    generator: existingDraft.generator,
    fields: params.body.fields ?? existingDraft.fields,
    notes:
      typeof params.body.notes === "string" ? params.body.notes : existingDraft.notes,
  });

  await params.db.adminDesaDocument.update({
    where: { id: params.documentId },
    data: {
      aiMappingStatus: "DRAFT_READY_REVIEW",
      aiMappingResult: toAiMappingDraftJson(nextDraft),
      updatedAt: new Date(),
    },
  });

  const { buildVillageVersionCandidateForDesa } = await import("@/lib/versioning/desa-versioning");
  const draftVersionCandidate = await buildVillageVersionCandidateForDesa({
    desaId: doc.desaId,
    mappedFields: nextDraft.fields,
    createdAt: nextDraft.generatedAt,
  });

  const reviewReadyVersion = draftVersionCandidate
    ? await syncReviewReadyVillageVersion({
        desaId: doc.desaId,
        sourceDocumentId: params.documentId,
        title: doc.title,
        sourceLabel: "Draft review internal",
        reviewNote: nextDraft.notes ?? null,
        changedFields: draftVersionCandidate.changedFields,
        proposedSnapshot: draftVersionCandidate.proposedSnapshot,
        beforeSnapshot: draftVersionCandidate.baseSnapshot,
        createdByUserId: params.actor.userId,
      })
    : { persisted: false as const };

  await writeAuditEvent({
    eventType: AUDIT_EVENT.INTERNAL_DOCUMENT_REVIEWED,
    desaId: doc.desaId,
    actorUserId: params.actor.userId,
    actorRole: "INTERNAL_ADMIN",
    entityType: "AdminDesaDocument",
    entityId: params.documentId,
    metadata: {
      title: doc.title,
      action: "draft_saved",
      fieldCount: Object.keys(nextDraft.fields).length,
      versionNumber: reviewReadyVersion.versionNumber ?? null,
    },
    ...params.actor.requestMeta,
  });

  await writeDesaDataAuditEvent({
    desaId: doc.desaId,
    sourceDocumentId: params.documentId,
    villageDataVersionId: reviewReadyVersion.id ?? null,
    actorUserId: params.actor.userId,
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

  return {
    ok: true,
    data: {
      reused: true,
      aiMappingStatus: "DRAFT_READY_REVIEW",
      draft: nextDraft,
    },
  };
}

export async function publishReviewedDocument(params: {
  db: DbClient;
  documentId: string;
  body: PublishReviewBody;
  actor: ActorContext;
}): Promise<
  ServiceResult<{
    documentId: string;
    newStatus: "PUBLISHED";
    versionNumber: number;
    appliedFields: string[];
  }>
> {
  const requestedFields = sanitizeMappingFields(params.body.fields);
  const note = params.body.note;
  const doc = await findDocumentForReview(params.db, params.documentId);
  if (!doc) return serviceError(404, "Document not found");

  const statusError = validatePublishStatus(doc.status);
  if (statusError) return serviceError(statusError.status, statusError.error);

  const result = await params.db.$transaction(async (tx) => {
    const now = new Date();
    const fallbackVersionNumber = (await tx.adminClaimAudit.count({
      where: {
        desaId: doc.desaId,
        eventType: AUDIT_EVENT.INTERNAL_DATA_PUBLISHED,
      },
    })) + 1;

    let beforeSnapshot: Record<string, string | number | null> | null = null;
    let afterSnapshot: Record<string, string | number | null> | null = null;
    let fullBeforeSnapshot: DesaVersionSnapshot | null = null;
    let publishedSnapshot: DesaVersionSnapshot | null = null;

    const fieldKeys = getMappingFieldKeys(requestedFields);
    const desaBefore = await tx.desa.findUnique({
      where: { id: doc.desaId },
      select: AI_MAPPABLE_DESA_SELECT,
    });

    if (!desaBefore) {
      return { kind: "error" as const, status: 404, body: { error: "Desa not found" } };
    }

    fullBeforeSnapshot = toDesaVersionSnapshot(desaBefore);
    publishedSnapshot = { ...fullBeforeSnapshot };

    if (fieldKeys.length > 0) {
      beforeSnapshot = {};
      afterSnapshot = {};
      for (const key of fieldKeys) {
        const before = desaBefore[key];
        const after = requestedFields[key] ?? null;
        beforeSnapshot[key] =
          before === null || before === undefined
            ? null
            : typeof before === "string" || typeof before === "number"
              ? before
              : String(before);
        afterSnapshot[key] = after;
        publishedSnapshot[key] = after as AiMappingFieldValue;
      }
    }

    const mappingUpdateData = createDesaMappingUpdateData(requestedFields);

    await tx.desa.update({
      where: { id: doc.desaId },
      data: {
        ...(fieldKeys.length > 0 ? mappingUpdateData : {}),
        dataSourceLabel: "Dokumen Admin Desa",
        dataPublishedAt: now,
      },
    });

    await tx.adminDesaDocument.update({
      where: { id: params.documentId },
      data: {
        status: "PUBLISHED",
        publishedAt: now,
        aiMappingStatus: "DONE",
        updatedAt: now,
      },
    });

    const versionCandidate = readVillageVersionCandidate(doc.aiMappingResult);
    const effectivePublishedSnapshot = publishedSnapshot ?? fullBeforeSnapshot;
    const versionResult = effectivePublishedSnapshot
      ? await publishVillageDataVersion(
          {
            desaId: doc.desaId,
            sourceDocumentId: params.documentId,
            title: doc.title,
            sourceLabel: "Dokumen Admin Desa",
            reviewNote: note,
            changedFields: getChangedVersionFields({
              before: fullBeforeSnapshot,
              after: effectivePublishedSnapshot,
            }),
            proposedSnapshot:
              versionCandidate?.proposedSnapshot ?? effectivePublishedSnapshot,
            beforeSnapshot: fullBeforeSnapshot,
            publishedSnapshot: effectivePublishedSnapshot,
            createdByUserId: params.actor.userId,
            publishedByUserId: params.actor.userId,
            publishedAt: now,
          },
          tx,
        )
      : { persisted: false as const };

    return {
      kind: "ok" as const,
      beforeSnapshot,
      afterSnapshot,
      fallbackVersionNumber,
      versionResult,
    };
  });

  if (result.kind === "error") {
    return { ok: false, status: result.status, body: result.body };
  }

  await writeAuditEvent({
    eventType: AUDIT_EVENT.INTERNAL_DATA_PUBLISHED,
    desaId: doc.desaId,
    actorUserId: params.actor.userId,
    actorRole: "INTERNAL_ADMIN",
    entityType: "AdminDesaDocument",
    entityId: params.documentId,
    previousStatus: doc.status,
    nextStatus: "PUBLISHED",
    reasonText: note ?? undefined,
    beforeSnapshotJson: result.beforeSnapshot ?? undefined,
    afterSnapshotJson: result.afterSnapshot ?? undefined,
    metadata: {
      title: doc.title,
      versionNumber: result.versionResult.versionNumber ?? result.fallbackVersionNumber,
      appliedFieldCount: result.beforeSnapshot ? Object.keys(result.beforeSnapshot).length : 0,
      beforeSnapshot: result.beforeSnapshot,
      afterSnapshot: result.afterSnapshot,
      reviewMode: isFallbackReviewStatus(doc.status) ? "internal_admin_fallback" : "standard",
    },
    ...params.actor.requestMeta,
  });

  await writeDesaDataAuditEvent({
    desaId: doc.desaId,
    sourceDocumentId: params.documentId,
    villageDataVersionId: result.versionResult.id ?? null,
    actorUserId: params.actor.userId,
    actorRole: "INTERNAL_ADMIN",
    eventType: AUDIT_EVENT.INTERNAL_DATA_PUBLISHED,
    eventLabel: isFallbackReviewStatus(doc.status)
      ? "Dipublikasikan via fallback admin internal"
      : "Dipublikasikan ke data desa",
    previousStatus: doc.status,
    nextStatus: "PUBLISHED",
    note: note,
    metadata: {
      title: doc.title,
      versionNumber: result.versionResult.versionNumber ?? result.fallbackVersionNumber,
      appliedFieldCount: result.beforeSnapshot ? Object.keys(result.beforeSnapshot).length : 0,
      reviewMode: isFallbackReviewStatus(doc.status) ? "internal_admin_fallback" : "standard",
    },
  });

  const activeAdmins = await params.db.desaAdminMember.findMany({
    where: { desaId: doc.desaId, status: { in: ["LIMITED", "VERIFIED"] } },
    select: { userId: true },
  });
  const recipientIds = new Set(activeAdmins.map((item) => item.userId));
  if (doc.uploadedById) recipientIds.add(doc.uploadedById);

  await createNotifications(
    Array.from(recipientIds).map((uid) => ({
      userId: uid,
      type: NOTIF_TYPE.DOCUMENT_PUBLISHED,
      title: "Dokumen dipublikasikan",
      body: `"${doc.title}" telah ditinjau dan dipublikasikan oleh tim PantauDesa. Data desa diperbarui sesuai isi dokumen.`,
      desaId: doc.desaId,
      metadata: { documentId: params.documentId },
    })),
  );

  return {
    ok: true,
    data: {
      documentId: params.documentId,
      newStatus: "PUBLISHED",
      versionNumber: result.versionResult.versionNumber ?? result.fallbackVersionNumber,
      appliedFields: result.beforeSnapshot ? Object.keys(result.beforeSnapshot) : [],
    },
  };
}

export async function markDocumentReviewFailed(params: {
  db: DbClient;
  documentId: string;
  reason: string;
  actor: ActorContext;
}): Promise<ServiceResult<{ documentId: string; newStatus: "FAILED" }>> {
  const doc = await params.db.adminDesaDocument.findUnique({
    where: { id: params.documentId },
    select: { id: true, desaId: true, status: true, title: true, uploadedById: true },
  });

  if (!doc) return serviceError(404, "Document not found");

  const statusError = validateFailStatus(doc.status);
  if (statusError) return serviceError(statusError.status, statusError.error);

  const now = new Date();
  await params.db.adminDesaDocument.update({
    where: { id: params.documentId },
    data: {
      status: "FAILED",
      failedReason: params.reason,
      aiMappingStatus: "FAILED",
      updatedAt: now,
    },
  });

  await writeAuditEvent({
    eventType: AUDIT_EVENT.INTERNAL_DOCUMENT_FAILED,
    desaId: doc.desaId,
    actorUserId: params.actor.userId,
    actorRole: "INTERNAL_ADMIN",
    entityType: "AdminDesaDocument",
    entityId: params.documentId,
    previousStatus: doc.status,
    nextStatus: "FAILED",
    reasonText: params.reason,
    metadata: { title: doc.title },
    ...params.actor.requestMeta,
  });

  const failedVersion = await failVillageDataVersionForDocument({
    sourceDocumentId: params.documentId,
    reason: params.reason,
  });

  await writeDesaDataAuditEvent({
    desaId: doc.desaId,
    sourceDocumentId: params.documentId,
    villageDataVersionId: failedVersion.id ?? null,
    actorUserId: params.actor.userId,
    actorRole: "INTERNAL_ADMIN",
    eventType: AUDIT_EVENT.INTERNAL_DOCUMENT_FAILED,
    eventLabel: isFallbackReviewStatus(doc.status)
      ? "Ditolak via fallback admin internal"
      : "Ditandai gagal",
    previousStatus: doc.status,
    nextStatus: "FAILED",
    note: params.reason,
    metadata: {
      title: doc.title,
      versionNumber: failedVersion.versionNumber ?? null,
      reviewMode: isFallbackReviewStatus(doc.status) ? "internal_admin_fallback" : "standard",
    },
  });

  if (doc.uploadedById) {
    await createNotification({
      userId: doc.uploadedById,
      type: NOTIF_TYPE.DOCUMENT_FAILED,
      title: "Dokumen ditandai gagal",
      body: `"${doc.title}" tidak dapat diproses. Alasan: ${params.reason}`,
      desaId: doc.desaId,
      metadata: { documentId: params.documentId, reason: params.reason },
    });
  }

  return {
    ok: true,
    data: {
      documentId: params.documentId,
      newStatus: "FAILED",
    },
  };
}
