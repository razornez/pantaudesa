import type { Prisma } from "@/generated/prisma";
import {
  readAiMappingDraft,
  type AiMappingDraft,
} from "@/lib/admin-claim/ai-mapping";
import { autoMapFromText, type AutoMappingResult } from "@/lib/intake/auto-mapping";
import { extractFromFile } from "@/lib/intake/extractors";
import {
  buildIntakePipelineResult,
  toIntakeReviewJson,
  type IntakePipelineResult,
} from "@/lib/intake/pipeline";
import { normalizePersistedPipelineSnapshot } from "@/lib/intake/pipeline-snapshot";
import type { OpenAIResult } from "@/lib/intake/types";
import { downloadDocumentBuffer } from "@/lib/storage/supabase-storage";

function buildSkippedOpenAiResult(): OpenAIResult {
  return {
    attempted: false,
    status: "skipped",
    usedInputMode: "text",
    reason: "Snapshot review dibangun dengan parser lokal tanpa pemanggilan AI otomatis.",
    message: "AI mapping dilewati. Parser lokal dipakai agar tidak memicu biaya otomatis.",
    model: null,
    documentType: "unknown",
    confidence: "low",
    knownPublishableFields: {},
    knownFieldEvidence: [],
    detectedButNotPublishable: [],
    unknownUsefulFields: [],
    warnings: [],
  };
}

function buildDraftMapping(draft: AiMappingDraft): AutoMappingResult {
  const fields = draft.fields;
  const matchedFields = Object.keys(fields);

  return {
    fields,
    evidence: matchedFields.map((field) => ({
      field: field as keyof typeof fields,
      matchedText: "Nilai berasal dari draft review yang sudah tersimpan sebelumnya.",
      rule: `saved ${draft.generator} review draft`,
    })),
    unmatched: [],
    source: `saved-${draft.generator}-review-draft`,
    generatedAt: draft.generatedAt,
  } as AutoMappingResult;
}

async function extractDocumentPayload(input: {
  buffer: Buffer;
  fileName: string;
  fileType: string;
  fileSize: number;
}) {
  try {
    const extraction = await extractFromFile({
      buffer: input.buffer,
      fileName: input.fileName,
      mimeType: input.fileType,
      size: input.fileSize,
    });

    return {
      text: extraction.text,
      meta: extraction.meta,
    };
  } catch {
    return {
      text: "",
      meta: {
        fileName: input.fileName,
        mimeType: input.fileType,
        size: input.fileSize,
        parser: "local extraction unavailable",
        durationMs: 0,
      },
    };
  }
}

async function buildPipelineSnapshotFromExtractedPayload(input: {
  desaId: string;
  extractedText: string;
  extractMeta: {
    fileName?: string;
    mimeType?: string;
    size?: number;
    parser: string;
    durationMs: number;
    pages?: number;
    sheets?: string[];
    truncated?: boolean;
  };
  existingAiMappingResult?: unknown;
}) {
  const existingDraft = readAiMappingDraft(input.existingAiMappingResult);
  const pipeline = await buildIntakePipelineResult({
    inputSource: "file",
    extractedText: input.extractedText,
    extractMeta: input.extractMeta,
    desaId: input.desaId,
    localMapping: existingDraft
      ? buildDraftMapping(existingDraft)
      : autoMapFromText(input.extractedText),
    openaiResult: buildSkippedOpenAiResult(),
  });
  const pipelineJson = {
    ...toIntakeReviewJson(pipeline),
    ...(existingDraft?.notes ? { notes: existingDraft.notes } : {}),
  } satisfies Prisma.InputJsonObject;

  return {
    pipeline,
    pipelineJson,
    aiMappingStatus: "DRAFT_READY_REVIEW" as const,
  };
}

export async function buildDocumentPipelineSnapshotFromBuffer(input: {
  desaId: string;
  fileName: string;
  fileType: string;
  fileSize: number;
  buffer: Buffer;
  existingAiMappingResult?: unknown;
}): Promise<{
  pipeline: IntakePipelineResult;
  pipelineJson: Prisma.InputJsonObject;
  aiMappingStatus: "DRAFT_READY_REVIEW";
}> {
  const existingSnapshot = normalizePersistedPipelineSnapshot(input.existingAiMappingResult);
  if (existingSnapshot) {
    return {
      pipeline: existingSnapshot,
      pipelineJson: toIntakeReviewJson(existingSnapshot),
      aiMappingStatus: "DRAFT_READY_REVIEW",
    };
  }

  const extraction = await extractDocumentPayload(input);
  return buildPipelineSnapshotFromExtractedPayload({
    desaId: input.desaId,
    extractedText: extraction.text,
    extractMeta: extraction.meta,
    existingAiMappingResult: input.existingAiMappingResult,
  });
}

export async function buildDocumentPipelineSnapshotFromStorage(input: {
  desaId: string;
  storageKey: string;
  fileName: string;
  fileType: string;
  fileSize: number;
  existingAiMappingResult?: unknown;
}) {
  const existingSnapshot = normalizePersistedPipelineSnapshot(input.existingAiMappingResult);
  if (existingSnapshot) {
    return {
      pipeline: existingSnapshot,
      pipelineJson: toIntakeReviewJson(existingSnapshot),
      aiMappingStatus: "DRAFT_READY_REVIEW" as const,
    };
  }

  try {
    const buffer = await downloadDocumentBuffer(input.storageKey);
    return buildDocumentPipelineSnapshotFromBuffer({
      desaId: input.desaId,
      fileName: input.fileName,
      fileType: input.fileType,
      fileSize: input.fileSize,
      buffer,
      existingAiMappingResult: input.existingAiMappingResult,
    });
  } catch {
    return buildPipelineSnapshotFromExtractedPayload({
      desaId: input.desaId,
      extractedText: "",
      extractMeta: {
        fileName: input.fileName,
        mimeType: input.fileType,
        size: input.fileSize,
        parser: "storage download unavailable",
        durationMs: 0,
      },
      existingAiMappingResult: input.existingAiMappingResult,
    });
  }
}
