// Manual mapping draft scope (BMAD 04-008.0):
// AI provider NOT yet configured. Internal admin fills mapping fields manually by reading the document.
// Allowed safe fields only:
//   - profil desa
//   - kontak resmi
//   - website/sosial resmi
//   - alamat/kecamatan/kabupaten metadata
// Out of scope: APBDes/budget extraction, sensitive demographic, personal/private docs, auto-publish.

export const AI_MAPPABLE_DESA_FIELDS = [
  "websiteUrl",
  "kategori",
  "tahunData",
  "jumlahPenduduk",
  "kecamatan",
  "kabupaten",
  "provinsi",
] as const;

export type AiMappableDesaField = typeof AI_MAPPABLE_DESA_FIELDS[number];

export interface AiMappingDraft {
  generatedAt: string;
  generator: "manual" | "ai";   // "manual" until AI provider is configured
  fields: Partial<Record<AiMappableDesaField, string | number | null>>;
  notes?: string;
}

/**
 * Returns an empty manual-mapping draft. The internal admin reads the document
 * and fills the fields manually in the publish modal.
 *
 * When an AI provider is configured (e.g. Claude API), replace this function's
 * body with the provider call while keeping the AiMappingDraft return shape stable.
 */
export function generateManualMappingDraft(): AiMappingDraft {
  return {
    generatedAt: new Date().toISOString(),
    generator: "manual",
    fields: {},
    notes:
      "AI provider belum dikonfigurasi — lakukan mapping manual. " +
      "Baca dokumen dan isi field yang relevan di bawah. " +
      "Semua perubahan harus direview sebelum dipublish.",
  };
}

/**
 * Validates that the mapping result only contains keys we explicitly allow.
 * Returns the sanitized fields object.
 */
export function sanitizeMappingFields(input: unknown): Partial<Record<AiMappableDesaField, string | number | null>> {
  if (!input || typeof input !== "object") return {};
  const out: Partial<Record<AiMappableDesaField, string | number | null>> = {};
  for (const key of AI_MAPPABLE_DESA_FIELDS) {
    const v = (input as Record<string, unknown>)[key];
    if (v === undefined) continue;
    if (v === null) {
      out[key] = null;
    } else if (typeof v === "string" || typeof v === "number") {
      out[key] = v;
    }
    // Reject other types silently to prevent injection.
  }
  return out;
}
