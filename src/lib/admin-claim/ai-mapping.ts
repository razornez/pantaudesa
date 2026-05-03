// AI mapping MVP scope (BMAD 04-008.0):
// Allowed initial fields:
//   - profil desa
//   - kontak resmi
//   - perangkat desa
//   - website/email/sosial resmi
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
  generatedAt: string;       // ISO timestamp
  generator: string;         // "stub" until owner picks AI provider
  fields: Partial<Record<AiMappableDesaField, string | number | null>>;
  notes?: string;
}

/**
 * Stub draft generator. Returns an empty mapping with admin notes.
 * When an AI provider is configured by the owner, this function should be
 * replaced (or wrapped) by a real provider call. The shape is stable so the
 * UI does not need to change.
 */
export function generateStubMappingDraft(): AiMappingDraft {
  return {
    generatedAt: new Date().toISOString(),
    generator: "stub",
    fields: {},
    notes:
      "AI provider belum dikonfigurasi. Edit field di bawah secara manual berdasarkan dokumen. " +
      "Semua perubahan tetap perlu review internal admin sebelum dipublish.",
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
