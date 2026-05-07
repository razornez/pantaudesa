import { randomBytes } from "node:crypto";
import { NextRequest, NextResponse } from "next/server";
import { AUDIT_EVENT } from "@/lib/admin-claim/audit-events";
import { writeAuditEvent } from "@/lib/admin-claim/audit";
import { handleApiError } from "@/lib/api-error";
import { requireInternalAdminSession } from "@/lib/auth/internal-admin";
import { db } from "@/lib/db";
import { autoMapFromText } from "@/lib/intake/auto-mapping";
import { extractFromFile, extractFromText } from "@/lib/intake/extractors";
import { maybeMapWithOpenAI } from "@/lib/intake/openai-mapping";
import { buildIntakePipelineResult, toIntakeReviewJson } from "@/lib/intake/pipeline";
import { perfLog, perfStart } from "@/lib/perf";
import {
  buildDocumentStoragePath,
  deleteDocumentObject,
  getStorageConfigurationErrorMessage,
  getStorageConfigurationStatus,
  uploadDocumentBuffer,
} from "@/lib/storage/supabase-storage";
import {
  syncReviewReadyVillageVersion,
  writeDesaDataAuditEvent,
} from "@/lib/versioning/village-data-persistence";

const MAX_FILE_SIZE = 10 * 1024 * 1024;
const MAX_TITLE_LENGTH = 200;
const PROCESSING_QUEUE_URL = "/internal-admin/documents?status=PROCESSING";
const SCANNED_PDF_MIME = "application/pdf";
const AI_OFF_BINARY_MESSAGE =
  "Gambar belum bisa dibaca tanpa AI. Aktifkan Coba AI, atau gunakan dokumen teks/PDF teks/DOCX/XLSX/CSV/TXT.";

type ParsedSubmission =
  | {
      inputSource: "file";
      buffer: Buffer;
      fileName: string;
      fileType: string;
      fileSize: number;
      desaId: string;
      title?: string;
      requestAiMapping: boolean;
      extractedText: string;
      extractMeta: Awaited<ReturnType<typeof extractFromFile>>["meta"];
      extractFailed: boolean;
      extractError?: string;
    }
  | {
      inputSource: "paste";
      buffer: Buffer;
      fileName: string;
      fileType: string;
      fileSize: number;
      desaId: string;
      title?: string;
      requestAiMapping: boolean;
      extractedText: string;
      extractMeta: ReturnType<typeof extractFromText>["meta"];
      extractFailed: boolean;
      extractError?: string;
    };

function trimOptionalText(input: unknown, maxLength: number): string | undefined {
  if (typeof input !== "string") return undefined;
  const value = input.trim().slice(0, maxLength);
  return value ? value : undefined;
}

function buildPasteFileName(desaName: string): string {
  const slug = desaName
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 40);

  const stamp = new Date().toISOString().slice(0, 10);
  return `${slug || "desa"}-intake-${stamp}.txt`;
}

function buildFallbackTitle(input: {
  fileName: string;
  inputSource: ParsedSubmission["inputSource"];
  desaName: string;
}): string {
  const withoutExtension = input.fileName.replace(/\.[^.]+$/, "").trim();
  if (withoutExtension) {
    return withoutExtension.slice(0, MAX_TITLE_LENGTH);
  }

  if (input.inputSource === "paste") {
    return `Intake manual ${input.desaName}`.slice(0, MAX_TITLE_LENGTH);
  }

  return `Intake ${input.desaName}`.slice(0, MAX_TITLE_LENGTH);
}

async function parseSubmission(req: NextRequest): Promise<ParsedSubmission | NextResponse> {
  const contentType = req.headers.get("content-type") ?? "";

  if (contentType.includes("multipart/form-data")) {
    const formData = await req.formData();
    const file = formData.get("file");
    const desaId = trimOptionalText(formData.get("desaId"), 200);
    const title = trimOptionalText(formData.get("title"), MAX_TITLE_LENGTH);
    const requestAiMapping = formData.get("useAiMapping") === "true";

    if (!desaId) {
      return NextResponse.json(
        { error: "Pilih desa target sebelum submit ke review internal." },
        { status: 400 },
      );
    }

    if (!(file instanceof File)) {
      return NextResponse.json({ error: "File tidak ditemukan." }, { status: 400 });
    }
    if (file.size > MAX_FILE_SIZE) {
      return NextResponse.json({ error: "File terlalu besar (maks 10 MB)." }, { status: 400 });
    }

    const buffer = Buffer.from(await file.arrayBuffer());
    const extracted = await extractFromFile({
      buffer,
      fileName: file.name,
      mimeType: file.type,
      size: file.size,
    });

    return {
      inputSource: "file",
      buffer,
      fileName: file.name,
      fileType: file.type || "application/octet-stream",
      fileSize: file.size,
      desaId,
      title,
      requestAiMapping,
      extractedText: extracted.ok ? extracted.text : "",
      extractMeta: extracted.meta,
      extractFailed: !extracted.ok,
      ...(extracted.ok ? {} : { extractError: extracted.error ?? "Gagal membaca file." }),
    };
  }

  if (contentType.includes("application/json")) {
    const body = (await req.json()) as {
      text?: unknown;
      desaId?: unknown;
      title?: unknown;
      useAiMapping?: unknown;
    };
    const text = typeof body.text === "string" ? body.text.trim() : "";
    const desaId = trimOptionalText(body.desaId, 200);
    const title = trimOptionalText(body.title, MAX_TITLE_LENGTH);
    const requestAiMapping = body.useAiMapping === true;

    if (!desaId) {
      return NextResponse.json(
        { error: "Pilih desa target sebelum submit ke review internal." },
        { status: 400 },
      );
    }
    if (!text) {
      return NextResponse.json({ error: "Teks wajib diisi." }, { status: 400 });
    }

    const extracted = extractFromText(text);
    const buffer = Buffer.from(text, "utf-8");

    return {
      inputSource: "paste",
      buffer,
      fileName: "intake-manual.txt",
      fileType: "text/plain",
      fileSize: buffer.byteLength,
      desaId,
      title,
      requestAiMapping,
      extractedText: extracted.text,
      extractMeta: extracted.meta,
      extractFailed: false,
    };
  }

  return NextResponse.json(
    {
      error: "Content-Type tidak didukung. Gunakan multipart/form-data atau application/json.",
    },
    { status: 415 },
  );
}

function canContinueWithAiFallback(parsed: ParsedSubmission): boolean {
  // Hanya boleh lanjut ke AI fallback ketika user secara eksplisit mengaktifkan
  // toggle "Coba AI". Image/scanned PDF tanpa AI ditangani lewat pesan ramah.
  return parsed.requestAiMapping;
}

function isBinaryNeedingAi(parsed: ParsedSubmission): boolean {
  const lower = parsed.fileType.toLowerCase();
  return lower.startsWith("image/") || lower === SCANNED_PDF_MIME;
}

function hasDraftContent(input: {
  mappedFieldCount: number;
  detectedCount: number;
  unknownCount: number;
}): boolean {
  return input.mappedFieldCount > 0 || input.detectedCount > 0 || input.unknownCount > 0;
}

export async function POST(req: NextRequest) {
  try {
    const session = await requireInternalAdminSession();
    if (session instanceof NextResponse) return session;
    if (!db) return NextResponse.json({ error: "Service unavailable" }, { status: 503 });

    const storageStatus = getStorageConfigurationStatus();
    if (!storageStatus.configured) {
      return NextResponse.json(
        {
          error: getStorageConfigurationErrorMessage(storageStatus),
          code: "STORAGE_NOT_CONFIGURED",
          bucket: storageStatus.bucket,
          missingEnvVars: storageStatus.missingEnvVars,
          invalidEnvVars: storageStatus.invalidEnvVars,
        },
        { status: 503 },
      );
    }

    const parsed = await parseSubmission(req);
    if (parsed instanceof NextResponse) return parsed;

    if (parsed.extractFailed && !canContinueWithAiFallback(parsed)) {
      if (isBinaryNeedingAi(parsed)) {
        return NextResponse.json(
          {
            error: AI_OFF_BINARY_MESSAGE,
            meta: {
              ...parsed.extractMeta,
              aiOffForBinary: true,
              openaiStatus: "skipped",
            },
          },
          { status: 422 },
        );
      }
      return NextResponse.json(
        { error: parsed.extractError ?? "Gagal membaca file.", meta: parsed.extractMeta },
        { status: 422 },
      );
    }

    const desa = await db.desa.findUnique({
      where: { id: parsed.desaId },
      select: { id: true, nama: true },
    });

    if (!desa) {
      return NextResponse.json({ error: "Desa target tidak ditemukan." }, { status: 404 });
    }

    const t = perfStart();
    const fileName =
      parsed.inputSource === "paste" ? buildPasteFileName(desa.nama) : parsed.fileName;
    const localMapping = autoMapFromText(parsed.extractedText);
    const heuristicConfidenceLow =
      localMapping.evidence.length < 2 && parsed.extractedText.trim().length > 0;
    const openaiResult = await maybeMapWithOpenAI({
      extractedText: parsed.extractedText,
      fileName,
      mimeType: parsed.fileType,
      fileBuffer: parsed.inputSource === "file" ? parsed.buffer : undefined,
      explicitRequest: parsed.requestAiMapping,
      heuristicConfidenceLow,
      localExtractFailed: parsed.extractFailed,
    });

    const pipeline = await buildIntakePipelineResult({
      inputSource: parsed.inputSource,
      extractedText: parsed.extractedText,
      extractMeta: {
        ...parsed.extractMeta,
        ...(parsed.inputSource === "paste" ? { fileName, mimeType: parsed.fileType } : {}),
      },
      desaId: parsed.desaId,
      localMapping,
      openaiResult,
    });
    perfLog("internal-admin.intake.submit-review", "pipeline", t);

    if (
      !parsed.extractedText.trim() &&
      !hasDraftContent({
        mappedFieldCount: Object.keys(pipeline.mapping.fields).length,
        detectedCount: pipeline.fieldCoverage?.detectedButNotPublishable.length ?? 0,
        unknownCount: pipeline.fieldCoverage?.unknownUsefulFields.length ?? 0,
      })
    ) {
      return NextResponse.json(
        {
          error:
            openaiResult.status === "missing_key"
              ? "Dokumen ini butuh bantuan AI untuk dibaca, tetapi OPENAI_API_KEY tidak tersedia. Coba tempel teks manual atau gunakan dokumen teks."
              : openaiResult.message || parsed.extractError || "Dokumen belum bisa dibaca.",
          meta: {
            parser: pipeline.extract.parser,
            ...(parsed.extractError ? { extractError: parsed.extractError } : {}),
            openaiStatus: openaiResult.status,
            ...(openaiResult.proof ? { openaiProof: openaiResult.proof } : {}),
          },
        },
        { status: 422 },
      );
    }

    if (!pipeline.validation.ok) {
      return NextResponse.json(
        {
          error:
            "Hasil intake belum siap disubmit ke review. Perbaiki error validasi lalu jalankan lagi.",
          validation: pipeline.validation,
        },
        { status: 422 },
      );
    }

    const documentId = `intake_${randomBytes(12).toString("hex")}`;
    const finalTitle =
      parsed.title ??
      buildFallbackTitle({ fileName, inputSource: parsed.inputSource, desaName: desa.nama });
    const storageKey = buildDocumentStoragePath(parsed.desaId, documentId, fileName);

    let uploaded = false;

    try {
      await uploadDocumentBuffer(storageKey, parsed.buffer, parsed.fileType);
      uploaded = true;

      const document = await db.adminDesaDocument.create({
        data: {
          id: documentId,
          desaId: parsed.desaId,
          uploadedById: session.userId,
          title: finalTitle,
          category: "intake_workbench",
          storageKey,
          fileName: fileName.slice(0, 200),
          fileType: parsed.fileType.slice(0, 120),
          fileSize: parsed.fileSize,
          status: "PROCESSING",
          aiMappingStatus: "DRAFT_READY_REVIEW",
          aiMappingResult: toIntakeReviewJson(pipeline),
        },
        select: {
          id: true,
          title: true,
          status: true,
          createdAt: true,
        },
      });

      const reviewReadyVersion = pipeline.versionCandidate
        ? await syncReviewReadyVillageVersion({
            desaId: parsed.desaId,
            sourceDocumentId: document.id,
            title: document.title,
            sourceLabel: "Intake workbench",
            reviewNote: pipeline.guardrailNote,
            changedFields: pipeline.versionCandidate.changedFields,
            proposedSnapshot: pipeline.versionCandidate.proposedSnapshot,
            beforeSnapshot: pipeline.versionCandidate.baseSnapshot,
            createdByUserId: session.userId,
          })
        : { persisted: false as const };

      await writeAuditEvent({
        eventType: AUDIT_EVENT.INTERNAL_INTAKE_SUBMITTED,
        desaId: parsed.desaId,
        actorUserId: session.userId,
        actorRole: "INTERNAL_ADMIN",
        entityType: "AdminDesaDocument",
        entityId: document.id,
        nextStatus: document.status,
        metadata: {
          inputSource: parsed.inputSource,
          parser: pipeline.extract.parser,
          fileType: parsed.fileType,
          fileSize: parsed.fileSize,
          hasDiff: pipeline.diff?.hasChanges ?? false,
          validationIssueCount: pipeline.validation.issues.length,
          openaiStatus: pipeline.openai.status,
          title: document.title,
          versionNumber: reviewReadyVersion.versionNumber ?? null,
        },
        ipAddress: req.headers.get("x-forwarded-for") ?? undefined,
        userAgent: req.headers.get("user-agent") ?? undefined,
      });

      await writeDesaDataAuditEvent({
        desaId: parsed.desaId,
        sourceDocumentId: document.id,
        villageDataVersionId: reviewReadyVersion.id ?? null,
        actorUserId: session.userId,
        actorRole: "INTERNAL_ADMIN",
        eventType: AUDIT_EVENT.INTERNAL_INTAKE_SUBMITTED,
        eventLabel: "Disubmit ke review internal",
        nextStatus: document.status,
        note: pipeline.guardrailNote,
        metadata: {
          inputSource: parsed.inputSource,
          parser: pipeline.extract.parser,
          openaiStatus: pipeline.openai.status,
          title: document.title,
          versionNumber: reviewReadyVersion.versionNumber ?? null,
        },
      });

      return NextResponse.json({
        ok: true,
        documentId: document.id,
        title: document.title,
        newStatus: document.status,
        queuedAt: document.createdAt.toISOString(),
        queueUrl: PROCESSING_QUEUE_URL,
      });
    } catch (error) {
      if (uploaded) {
        await deleteDocumentObject(storageKey).catch(() => undefined);
      }
      throw error;
    }
  } catch (err) {
    return handleApiError(err, "POST /api/internal-admin/intake/submit-review");
  }
}

export const runtime = "nodejs";
export const maxDuration = 30;
