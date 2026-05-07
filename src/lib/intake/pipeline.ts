import type { Prisma } from "@/generated/prisma";
import {
  AI_MAPPABLE_DESA_FIELDS,
  type AiMappableDesaField,
  type AiMappingFieldValue,
} from "@/lib/admin-claim/ai-mapping";
import type { IntakeExtractResult } from "@/lib/intake/extractors";
import { autoMapFromText } from "@/lib/intake/auto-mapping";
import { diffFields, type DiffResult } from "@/lib/intake/diff-engine";
import { validateFields, type ValidationResult } from "@/lib/intake/validation";
import {
  buildVillageVersionCandidateForDesa,
  getDesaVersionSnapshot,
  toVillageVersionCandidateJson,
  type VillageDataVersionCandidate,
} from "@/lib/versioning/desa-versioning";
import type { OpenAIResult } from "@/lib/intake/openai-mapping";

export type IntakeInputSource = "file" | "paste";

export interface IntakePipelineResult {
  ok: true;
  inputSource: IntakeInputSource;
  extract: IntakeExtractResult["meta"];
  mapping: ReturnType<typeof autoMapFromText>;
  validation: ValidationResult;
  diff: DiffResult | null;
  versionCandidate: VillageDataVersionCandidate | null;
  guardrailNote: string;
  /** OpenAI enhanced mapping result (if attempted and available) */
  openai?: OpenAIResult;
}

export const INTAKE_GUARDRAIL_NOTE =
  "Preview ini tidak mengubah data. Publish harus dilakukan melalui alur review resmi.";

function toJsonFieldObject(
  fields: Partial<Record<AiMappableDesaField, AiMappingFieldValue>>,
): Prisma.InputJsonObject {
  const out: Record<string, Prisma.InputJsonValue | null> = {};

  for (const field of AI_MAPPABLE_DESA_FIELDS) {
    const value = fields[field];
    if (value !== undefined) {
      out[field] = value;
    }
  }

  return out;
}

export async function buildIntakePipelineResult(input: {
  inputSource: IntakeInputSource;
  extractedText: string;
  extractMeta: IntakeExtractResult["meta"];
  desaId?: string;
}): Promise<IntakePipelineResult> {
  const mapping = autoMapFromText(input.extractedText);
  const validation = validateFields(mapping.fields);

  let diff: DiffResult | null = null;
  let versionCandidate: VillageDataVersionCandidate | null = null;
  if (input.desaId) {
    const desaSnapshot = await getDesaVersionSnapshot(input.desaId);
    if (desaSnapshot) {
      diff = diffFields(desaSnapshot, mapping.fields);
      versionCandidate = await buildVillageVersionCandidateForDesa({
        desaId: input.desaId,
        mappedFields: mapping.fields,
        createdAt: mapping.generatedAt,
      });
    }
  }

  return {
    ok: true,
    inputSource: input.inputSource,
    extract: input.extractMeta,
    mapping,
    validation,
    diff,
    versionCandidate,
    guardrailNote: INTAKE_GUARDRAIL_NOTE,
  };
}

export function toIntakeReviewJson(result: IntakePipelineResult): Prisma.InputJsonObject {
  return {
    inputSource: result.inputSource,
    extract: {
      parser: result.extract.parser,
      durationMs: result.extract.durationMs,
      ...(result.extract.fileName ? { fileName: result.extract.fileName } : {}),
      ...(result.extract.mimeType ? { mimeType: result.extract.mimeType } : {}),
      ...(result.extract.size !== undefined ? { size: result.extract.size } : {}),
      ...(result.extract.pages !== undefined ? { pages: result.extract.pages } : {}),
      ...(result.extract.sheets ? { sheets: [...result.extract.sheets] } : {}),
      ...(result.extract.truncated !== undefined ? { truncated: result.extract.truncated } : {}),
    },
    mapping: {
      fields: toJsonFieldObject(result.mapping.fields),
      evidence: result.mapping.evidence.map((item) => ({
        field: item.field,
        matchedText: item.matchedText,
        rule: item.rule,
      })),
      unmatched: [...result.mapping.unmatched],
      source: result.mapping.source,
      generatedAt: result.mapping.generatedAt,
    },
    validation: {
      ok: result.validation.ok,
      issues: result.validation.issues.map((issue) => ({
        field: issue.field,
        message: issue.message,
        severity: issue.severity,
      })),
      checkedAt: result.validation.checkedAt,
    },
    diff: result.diff
      ? {
          entries: result.diff.entries.map((entry) => ({
            field: entry.field,
            deltaType: entry.deltaType,
            ...(entry.previous !== undefined ? { previous: entry.previous } : {}),
            ...(entry.next !== undefined ? { next: entry.next } : {}),
            ...(entry.changed ? { changed: entry.changed } : {}),
          })),
          hasChanges: result.diff.hasChanges,
          addedCount: result.diff.addedCount,
          updatedCount: result.diff.updatedCount,
          removedCount: result.diff.removedCount,
          generatedAt: result.diff.generatedAt,
        }
      : null,
    versionCandidate: result.versionCandidate
      ? toVillageVersionCandidateJson(result.versionCandidate)
      : null,
    guardrailNote: result.guardrailNote,
  };
}
