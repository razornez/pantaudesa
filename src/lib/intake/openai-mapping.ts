import {
  sanitizeMappingFields,
  type AiMappingFields,
} from "@/lib/admin-claim/ai-mapping";
import { buildDetailFieldRegistryPrompt } from "@/lib/intake/detail-field-coverage";
import type {
  DetectedDetailField,
  IntakeConfidence,
  IntakeDocumentType,
  OpenAIResult,
  OpenAIStatus,
  UnknownUsefulField,
} from "@/lib/intake/types";

const MAX_TEXT_INPUT = 20_000;
const TEXT_IMAGE_MODEL = "gpt-5.4-mini";
const FILE_INPUT_MODEL = "gpt-5";

const JSON_SCHEMA = {
  type: "object",
  additionalProperties: false,
  properties: {
    documentType: {
      type: "string",
      enum: [
        "profil_desa",
        "anggaran",
        "perangkat_desa",
        "fasilitas",
        "potensi",
        "kontak",
        "dokumen_publik",
        "unknown",
      ],
    },
    confidence: {
      type: "string",
      enum: ["low", "medium", "high"],
    },
    knownPublishableFields: {
      type: "object",
      additionalProperties: false,
      properties: {
        websiteUrl: { type: ["string", "null"] },
        kategori: { type: ["string", "null"] },
        tahunData: { type: ["number", "null"] },
        jumlahPenduduk: { type: ["number", "null"] },
        kecamatan: { type: ["string", "null"] },
        kabupaten: { type: ["string", "null"] },
        provinsi: { type: ["string", "null"] },
      },
      required: [],
    },
    knownFieldEvidence: {
      type: "array",
      items: {
        type: "object",
        additionalProperties: false,
        properties: {
          field: {
            type: "string",
            enum: [
              "websiteUrl",
              "kategori",
              "tahunData",
              "jumlahPenduduk",
              "kecamatan",
              "kabupaten",
              "provinsi",
            ],
          },
          evidenceSnippet: { type: "string" },
          sourceReference: { type: "string" },
        },
        required: ["field"],
      },
    },
    detectedButNotPublishable: {
      type: "array",
      items: {
        type: "object",
        additionalProperties: false,
        properties: {
          sectionKey: { type: "string" },
          sectionLabel: { type: "string" },
          fieldKey: { type: "string" },
          fieldLabel: { type: "string" },
          value: { type: "string" },
          reason: { type: "string" },
          sourceRequirement: { type: "string" },
          validationRequirement: { type: "string" },
          evidenceSnippet: { type: "string" },
          sourceReference: { type: "string" },
        },
        required: [
          "sectionKey",
          "sectionLabel",
          "fieldKey",
          "fieldLabel",
          "value",
          "reason",
          "sourceRequirement",
          "validationRequirement",
        ],
      },
    },
    unknownUsefulFields: {
      type: "array",
      items: {
        type: "object",
        additionalProperties: false,
        properties: {
          label: { type: "string" },
          value: { type: "string" },
          possibleCategory: { type: "string" },
          evidenceSnippet: { type: "string" },
        },
        required: ["label", "value", "possibleCategory"],
      },
    },
    warnings: {
      type: "array",
      items: { type: "string" },
    },
  },
  required: [
    "documentType",
    "confidence",
    "knownPublishableFields",
    "knownFieldEvidence",
    "detectedButNotPublishable",
    "unknownUsefulFields",
    "warnings",
  ],
} as const;

function emptyResult(input: {
  attempted: boolean;
  status: OpenAIStatus;
  usedInputMode: "text" | "image" | "file";
  reason: string;
  message: string;
  model?: string | null;
  confidence?: IntakeConfidence;
}): OpenAIResult {
  return {
    attempted: input.attempted,
    status: input.status,
    usedInputMode: input.usedInputMode,
    reason: input.reason,
    message: input.message,
    model: input.model ?? null,
    documentType: "unknown",
    confidence: input.confidence ?? "low",
    knownPublishableFields: {},
    knownFieldEvidence: [],
    detectedButNotPublishable: [],
    unknownUsefulFields: [],
    warnings: [],
  };
}

function trimSnippet(value: unknown, max = 120): string | undefined {
  if (typeof value !== "string") return undefined;
  const clean = value.replace(/\s+/g, " ").trim();
  if (!clean) return undefined;
  return clean.length <= max ? clean : `${clean.slice(0, max - 1)}...`;
}

function normalizeDocumentType(value: unknown): IntakeDocumentType {
  switch (value) {
    case "profil_desa":
    case "anggaran":
    case "perangkat_desa":
    case "fasilitas":
    case "potensi":
    case "kontak":
    case "dokumen_publik":
      return value;
    default:
      return "unknown";
  }
}

function normalizeConfidence(value: unknown): IntakeConfidence {
  if (value === "medium" || value === "high") return value;
  return "low";
}

function normalizeDetectedField(value: unknown): DetectedDetailField | null {
  if (typeof value !== "object" || value === null) return null;
  const item = value as Record<string, unknown>;
  const requiredStrings = [
    "sectionKey",
    "sectionLabel",
    "fieldKey",
    "fieldLabel",
    "value",
    "reason",
    "sourceRequirement",
    "validationRequirement",
  ] as const;

  for (const key of requiredStrings) {
    if (typeof item[key] !== "string" || !item[key]) {
      return null;
    }
  }

  return {
    sectionKey: String(item.sectionKey).slice(0, 80),
    sectionLabel: String(item.sectionLabel).slice(0, 80),
    fieldKey: String(item.fieldKey).slice(0, 80),
    fieldLabel: String(item.fieldLabel).slice(0, 120),
    value: String(item.value).slice(0, 300),
    reason: String(item.reason).slice(0, 240),
    sourceRequirement: String(item.sourceRequirement).slice(0, 180),
    validationRequirement: String(item.validationRequirement).slice(0, 180),
    ...(trimSnippet(item.evidenceSnippet) ? { evidenceSnippet: trimSnippet(item.evidenceSnippet) } : {}),
    ...(trimSnippet(item.sourceReference, 80) ? { sourceReference: trimSnippet(item.sourceReference, 80) } : {}),
  };
}

function normalizeUnknownField(value: unknown): UnknownUsefulField | null {
  if (typeof value !== "object" || value === null) return null;
  const item = value as Record<string, unknown>;

  if (
    typeof item.label !== "string" ||
    typeof item.value !== "string" ||
    typeof item.possibleCategory !== "string"
  ) {
    return null;
  }

  return {
    label: item.label.slice(0, 120),
    value: item.value.slice(0, 300),
    possibleCategory: item.possibleCategory.slice(0, 80),
    ...(trimSnippet(item.evidenceSnippet) ? { evidenceSnippet: trimSnippet(item.evidenceSnippet) } : {}),
  };
}

function extractStructuredText(payload: unknown): string | null {
  if (typeof payload !== "object" || payload === null) return null;
  const root = payload as Record<string, unknown>;

  if (typeof root.output_text === "string" && root.output_text.trim()) {
    return root.output_text.trim();
  }

  if (!Array.isArray(root.output)) return null;

  for (const item of root.output) {
    if (typeof item !== "object" || item === null) continue;
    const content = (item as { content?: unknown }).content;
    if (!Array.isArray(content)) continue;

    for (const part of content) {
      if (typeof part !== "object" || part === null) continue;
      const text = (part as { text?: unknown }).text;
      if (typeof text === "string" && text.trim()) {
        return text.trim();
      }
    }
  }

  return null;
}

function getResponseErrorMessage(payload: unknown): string | null {
  if (typeof payload !== "object" || payload === null) return null;
  const error = (payload as { error?: unknown }).error;
  if (typeof error !== "object" || error === null) return null;
  const message = (error as { message?: unknown }).message;
  return typeof message === "string" ? message : null;
}

function normalizeStructuredResult(
  parsed: unknown,
  model: string,
  usedInputMode: "text" | "image" | "file",
): OpenAIResult {
  const raw = typeof parsed === "object" && parsed !== null ? (parsed as Record<string, unknown>) : {};
  const knownPublishableFields = sanitizeMappingFields(raw.knownPublishableFields);
  const knownFieldEvidence = Array.isArray(raw.knownFieldEvidence)
    ? raw.knownFieldEvidence
        .map((item) => {
          if (typeof item !== "object" || item === null) return null;
          const record = item as Record<string, unknown>;
          const field = record.field;
          if (
            field !== "websiteUrl" &&
            field !== "kategori" &&
            field !== "tahunData" &&
            field !== "jumlahPenduduk" &&
            field !== "kecamatan" &&
            field !== "kabupaten" &&
            field !== "provinsi"
          ) {
            return null;
          }

          return {
            field: field as
              | "websiteUrl"
              | "kategori"
              | "tahunData"
              | "jumlahPenduduk"
              | "kecamatan"
              | "kabupaten"
              | "provinsi",
            ...(trimSnippet(record.evidenceSnippet) ? { evidenceSnippet: trimSnippet(record.evidenceSnippet) } : {}),
            ...(trimSnippet(record.sourceReference, 80) ? { sourceReference: trimSnippet(record.sourceReference, 80) } : {}),
          };
        })
        .filter((item): item is NonNullable<typeof item> => Boolean(item))
    : [];

  const detectedButNotPublishable = Array.isArray(raw.detectedButNotPublishable)
    ? raw.detectedButNotPublishable
        .map(normalizeDetectedField)
        .filter((item): item is DetectedDetailField => Boolean(item))
    : [];

  const unknownUsefulFields = Array.isArray(raw.unknownUsefulFields)
    ? raw.unknownUsefulFields
        .map(normalizeUnknownField)
        .filter((item): item is UnknownUsefulField => Boolean(item))
    : [];

  const warnings = Array.isArray(raw.warnings)
    ? raw.warnings
        .filter((item): item is string => typeof item === "string" && item.trim().length > 0)
        .map((item) => item.trim().slice(0, 240))
    : [];

  return {
    attempted: true,
    status: "success",
    usedInputMode,
    reason: "OpenAI membantu membaca isi dokumen.",
    message: "AI mapping berhasil dijalankan sebagai draft review.",
    model,
    documentType: normalizeDocumentType(raw.documentType),
    confidence: normalizeConfidence(raw.confidence),
    knownPublishableFields,
    knownFieldEvidence,
    detectedButNotPublishable,
    unknownUsefulFields,
    warnings,
  };
}

function shouldUseImageInput(mimeType?: string, fileName?: string): boolean {
  const lowerMime = (mimeType ?? "").toLowerCase();
  const lowerName = (fileName ?? "").toLowerCase();
  return lowerMime.startsWith("image/") || /\.(png|jpg|jpeg|webp|gif|bmp|tiff)$/.test(lowerName);
}

function shouldUseFileInput(mimeType?: string, fileName?: string): boolean {
  const lowerMime = (mimeType ?? "").toLowerCase();
  const lowerName = (fileName ?? "").toLowerCase();

  return (
    lowerMime === "application/pdf" ||
    lowerMime.includes("officedocument.wordprocessingml") ||
    lowerMime.includes("officedocument.spreadsheetml") ||
    lowerMime === "application/vnd.ms-excel" ||
    lowerMime === "text/plain" ||
    lowerMime === "text/csv" ||
    /\.(pdf|docx|xlsx|csv|txt)$/i.test(lowerName)
  );
}

function dataUriForFile(input: { buffer: Buffer; mimeType: string }): string {
  return `data:${input.mimeType};base64,${input.buffer.toString("base64")}`;
}

export function mergeKnownFields(
  localFields: AiMappingFields,
  openaiFields: AiMappingFields,
): AiMappingFields {
  return {
    ...localFields,
    ...openaiFields,
  };
}

export async function maybeMapWithOpenAI(input: {
  extractedText: string;
  fileName?: string;
  mimeType?: string;
  fileBuffer?: Buffer;
  explicitRequest?: boolean;
  heuristicConfidenceLow?: boolean;
  localExtractFailed?: boolean;
}): Promise<OpenAIResult> {
  const hasImageInput = shouldUseImageInput(input.mimeType, input.fileName) && Boolean(input.fileBuffer);
  const hasFileInput = !hasImageInput && shouldUseFileInput(input.mimeType, input.fileName) && Boolean(input.fileBuffer);
  const weakText = input.extractedText.trim().length > 0 && input.extractedText.trim().length < 250;
  const attemptedBecause = [
    input.explicitRequest ? "user_explicit_request" : null,
    hasImageInput ? "image_or_photo" : null,
    input.localExtractFailed ? "local_extract_failed" : null,
    input.heuristicConfidenceLow ? "heuristic_confidence_low" : null,
    weakText ? "local_text_weak" : null,
  ].filter((item): item is string => Boolean(item));

  const shouldAttempt = attemptedBecause.length > 0 && (hasImageInput || hasFileInput || input.extractedText.trim().length > 0);
  const usedInputMode: "text" | "image" | "file" = hasImageInput ? "image" : hasFileInput ? "file" : "text";

  if (!shouldAttempt) {
    return emptyResult({
      attempted: false,
      status: "skipped",
      usedInputMode,
      reason: "Parser lokal sudah cukup untuk preview awal.",
      message: "AI mapping dilewati karena parser lokal dianggap cukup.",
    });
  }

  const apiKey = process.env.OPENAI_API_KEY?.trim();
  if (!apiKey) {
    return emptyResult({
      attempted: true,
      status: "missing_key",
      usedInputMode,
      reason: "OPENAI_API_KEY tidak tersedia di environment ini.",
      message: "AI mapping belum bisa dipakai di environment ini. Parser lokal/manual paste tetap bisa digunakan.",
    });
  }

  const model = hasFileInput ? FILE_INPUT_MODEL : TEXT_IMAGE_MODEL;
  const content: Array<Record<string, unknown>> = [
    {
      type: "input_text",
      text: [
        "Anda membantu internal admin PantauDesa membuat draft mapping desa.",
        "Jangan mengarang, jangan mengisi field jika tidak cukup yakin, dan jangan keluarkan prose di luar JSON schema.",
        "Pisahkan temuan menjadi knownPublishableFields, detectedButNotPublishable, dan unknownUsefulFields.",
        "Field registry saat ini:",
        buildDetailFieldRegistryPrompt(),
      ].join("\n\n"),
    },
  ];

  if (input.extractedText.trim()) {
    content.push({
      type: "input_text",
      text: `Teks hasil pembacaan lokal (potong, draft-only):\n${input.extractedText.slice(0, MAX_TEXT_INPUT)}`,
    });
  }

  if (hasImageInput && input.fileBuffer && input.mimeType) {
    content.push({
      type: "input_image",
      image_url: dataUriForFile({ buffer: input.fileBuffer, mimeType: input.mimeType }),
    });
  } else if (hasFileInput && input.fileBuffer && input.mimeType) {
    content.push({
      type: "input_file",
      filename: input.fileName ?? "dokumen-intake",
      file_data: dataUriForFile({ buffer: input.fileBuffer, mimeType: input.mimeType }),
    });
  }

  const response = await fetch("https://api.openai.com/v1/responses", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model,
      input: [
        {
          role: "user",
          content,
        },
      ],
      text: {
        format: {
          type: "json_schema",
          name: "pantau_desa_intake_mapping",
          strict: true,
          schema: JSON_SCHEMA,
        },
      },
    }),
  });

  const payload = (await response.json().catch(() => null)) as unknown;

  if (!response.ok) {
    const message = getResponseErrorMessage(payload) ?? "OpenAI mapping gagal dijalankan.";
    const lowerMessage = message.toLowerCase();
    const status: OpenAIStatus =
      response.status === 429 && lowerMessage.includes("quota")
        ? "quota_limited"
        : response.status === 429
        ? "rate_limited"
        : "error";

    return emptyResult({
      attempted: true,
      status,
      usedInputMode,
      reason: attemptedBecause.join(", "),
      message:
        status === "quota_limited"
          ? "Kuota OpenAI sedang habis. Parser lokal/manual paste tetap bisa dipakai."
          : status === "rate_limited"
          ? "OpenAI sedang rate limited. Coba lagi beberapa saat atau lanjutkan dengan parser lokal."
          : "OpenAI belum bisa membantu membaca dokumen ini. Parser lokal/manual paste tetap tersedia.",
      model,
    });
  }

  const structuredText = extractStructuredText(payload);
  if (!structuredText) {
    return emptyResult({
      attempted: true,
      status: "invalid_json",
      usedInputMode,
      reason: attemptedBecause.join(", "),
      message: "OpenAI merespons tanpa JSON terstruktur yang bisa dipakai. Parser lokal tetap digunakan.",
      model,
    });
  }

  try {
    const parsed = JSON.parse(structuredText) as unknown;
    const normalized = normalizeStructuredResult(parsed, model, usedInputMode);
    if (
      Object.keys(normalized.knownPublishableFields).length === 0 &&
      normalized.detectedButNotPublishable.length === 0 &&
      normalized.unknownUsefulFields.length === 0
    ) {
      return {
        ...normalized,
        message: "AI mapping berjalan, tetapi belum menemukan field yang cukup yakin untuk dipakai.",
        warnings: [...normalized.warnings, "AI belum menemukan field yang cukup yakin."],
      };
    }

    return normalized;
  } catch {
    return emptyResult({
      attempted: true,
      status: "invalid_json",
      usedInputMode,
      reason: attemptedBecause.join(", "),
      message: "OpenAI mengembalikan format yang tidak bisa dipakai. Parser lokal tetap digunakan.",
      model,
    });
  }
}
