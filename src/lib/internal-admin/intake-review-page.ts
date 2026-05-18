import { db } from "@/lib/db";
import {
  getDatabaseUnavailableMessage,
  isDatabaseConnectivityError,
} from "@/lib/db-connectivity";
import { type IntakePipelineResult } from "@/lib/intake/pipeline";
import { normalizePersistedPipelineSnapshot } from "@/lib/intake/pipeline-snapshot";
import { buildDocumentPipelineSnapshotFromStorage } from "@/lib/internal-admin/document-pipeline-snapshot";
import type { InternalDocumentStatus } from "@/lib/internal-admin/page-params";

export interface IntakeReviewDocument {
  id: string;
  title: string;
  category: string;
  storageKey: string;
  fileName: string;
  fileType: string;
  fileSize: number;
  status: InternalDocumentStatus;
  aiMappingStatus: string | null;
  aiMappingResult: IntakePipelineResult | null;
  createdAt: string;
  updatedAt: string;
  publishedAt: string | null;
  failedReason: string | null;
}

export interface IntakeReviewDesa {
  id: string;
  nama: string;
  slug: string;
  kecamatan: string;
  kabupaten: string;
  provinsi: string;
}

export interface IntakeReviewPageData {
  document: IntakeReviewDocument;
  desa: IntakeReviewDesa;
}

async function ensurePipelineSnapshot(
  document: {
    id: string;
    desaId: string;
    storageKey: string;
    fileName: string;
    fileType: string;
    fileSize: number;
    aiMappingResult: unknown;
  },
): Promise<IntakePipelineResult | null> {
  const existingSnapshot = normalizePersistedPipelineSnapshot(document.aiMappingResult);
  if (existingSnapshot) {
    return existingSnapshot;
  }

  const { pipelineJson } = await buildDocumentPipelineSnapshotFromStorage({
    desaId: document.desaId,
    storageKey: document.storageKey,
    fileName: document.fileName,
    fileType: document.fileType,
    fileSize: document.fileSize,
    existingAiMappingResult: document.aiMappingResult,
  });

  await db?.adminDesaDocument.update({
    where: { id: document.id },
    data: {
      aiMappingStatus: "DRAFT_READY_REVIEW",
      aiMappingResult: pipelineJson,
      updatedAt: new Date(),
    },
  });

  return normalizePersistedPipelineSnapshot(pipelineJson);
}

export async function loadIntakeReviewPageData(
  documentId: string,
): Promise<
  | { kind: "data"; data: IntakeReviewPageData }
  | { kind: "not_found" }
  | { kind: "unavailable"; message: string }
> {
  if (!db) {
    return { kind: "unavailable", message: getDatabaseUnavailableMessage() };
  }

  try {
    const document = await db.adminDesaDocument.findUnique({
      where: { id: documentId },
      select: {
        id: true,
        title: true,
        category: true,
        desaId: true,
        storageKey: true,
        fileName: true,
        fileType: true,
        fileSize: true,
        status: true,
        aiMappingStatus: true,
        aiMappingResult: true,
        createdAt: true,
        updatedAt: true,
        publishedAt: true,
        failedReason: true,
        desa: {
          select: {
            id: true,
            nama: true,
            slug: true,
            kecamatan: true,
            kabupaten: true,
            provinsi: true,
          },
        },
      },
    });

    if (!document) return { kind: "not_found" };
    const aiMappingResult = await ensurePipelineSnapshot(document);

    return {
      kind: "data",
      data: {
        document: {
          id: document.id,
          title: document.title,
          category: document.category,
          storageKey: document.storageKey,
          fileName: document.fileName,
          fileType: document.fileType,
          fileSize: document.fileSize,
          status: document.status,
          aiMappingStatus: document.aiMappingStatus,
          aiMappingResult,
          createdAt: document.createdAt.toISOString(),
          updatedAt: document.updatedAt.toISOString(),
          publishedAt: document.publishedAt?.toISOString() ?? null,
          failedReason: document.failedReason,
        },
        desa: document.desa,
      },
    };
  } catch (error) {
    if (isDatabaseConnectivityError(error)) {
      return { kind: "unavailable", message: getDatabaseUnavailableMessage() };
    }
    throw error;
  }
}
