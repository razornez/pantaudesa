// Centralized constants and validation for Admin Desa document uploads.

export const DEFAULT_MAX_FILE_SIZE_MB = 10;
export const DEFAULT_MAX_FILES_PER_UPLOAD = 5;
export const DEFAULT_ALLOWED_MIME_TYPES = [
  "application/pdf",
  "image/jpeg",
  "image/png",
  "image/webp",
] as const;

export const DOCUMENT_CATEGORIES = [
  { value: "PROFIL_DESA",          label: "Profil Desa" },
  { value: "STRUKTUR_PERANGKAT",   label: "Struktur Perangkat" },
  { value: "KONTAK_RESMI",         label: "Kontak Resmi" },
  { value: "REGULASI_PERDES",      label: "Regulasi/Perdes" },
  { value: "LAPORAN_PUBLIKASI",    label: "Laporan/Publikasi" },
  { value: "LAINNYA",              label: "Lainnya" },
] as const;

export type DocumentCategory = typeof DOCUMENT_CATEGORIES[number]["value"];

export function getMaxFileSizeBytes(): number {
  const raw = process.env.ADMIN_DESA_DOCUMENT_MAX_FILE_SIZE_MB;
  const mb = raw ? parseInt(raw, 10) : DEFAULT_MAX_FILE_SIZE_MB;
  return (Number.isFinite(mb) && mb > 0 ? mb : DEFAULT_MAX_FILE_SIZE_MB) * 1024 * 1024;
}

export function getMaxFilesPerUpload(): number {
  const raw = process.env.ADMIN_DESA_DOCUMENT_MAX_FILES_PER_UPLOAD;
  const n = raw ? parseInt(raw, 10) : DEFAULT_MAX_FILES_PER_UPLOAD;
  return Number.isFinite(n) && n > 0 ? n : DEFAULT_MAX_FILES_PER_UPLOAD;
}

export function getAllowedMimeTypes(): string[] {
  const raw = process.env.ADMIN_DESA_DOCUMENT_ALLOWED_MIME_TYPES;
  if (!raw) return [...DEFAULT_ALLOWED_MIME_TYPES];
  return raw.split(",").map((s) => s.trim()).filter(Boolean);
}

export function isValidCategory(category: string): category is DocumentCategory {
  return DOCUMENT_CATEGORIES.some((c) => c.value === category);
}

export type UploadValidationResult =
  | { ok: true }
  | { ok: false; code: "FILE_TOO_LARGE" | "MIME_NOT_ALLOWED" | "EMPTY_FILE"; message: string };

export function validateUpload(file: { size: number; type: string }): UploadValidationResult {
  if (file.size <= 0) {
    return { ok: false, code: "EMPTY_FILE", message: "File kosong tidak dapat diunggah." };
  }
  const maxBytes = getMaxFileSizeBytes();
  if (file.size > maxBytes) {
    const mb = Math.round(maxBytes / (1024 * 1024));
    return { ok: false, code: "FILE_TOO_LARGE", message: `Ukuran file melebihi batas ${mb} MB.` };
  }
  const allowed = getAllowedMimeTypes();
  if (!allowed.includes(file.type)) {
    return { ok: false, code: "MIME_NOT_ALLOWED", message: `Tipe file ${file.type} tidak diizinkan. Tipe yang diizinkan: ${allowed.join(", ")}.` };
  }
  return { ok: true };
}
