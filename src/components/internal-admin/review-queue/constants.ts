import { AI_MAPPABLE_DESA_FIELDS } from "@/lib/admin-claim/ai-mapping";
import type { DocStatus, FieldLabelMap } from "./types";

export const STATUS_META: Record<
  DocStatus,
  { label: string; pill: string; note: string }
> = {
  WAITING_VERIFIED_APPROVAL: {
    label: "Belum masuk review",
    pill: "pill-warn",
    note: "Dokumen masih menunggu persetujuan admin utama desa sebelum bisa direview internal.",
  },
  PROCESSING: {
    label: "Perlu review internal",
    pill: "pill-info",
    note: "Dokumen siap dicek, dilengkapi, lalu diputuskan untuk dipublish atau tidak.",
  },
  PUBLISHED: {
    label: "Sudah dipublikasikan",
    pill: "pill-ok",
    note: "Data dari dokumen ini sudah diterapkan ke halaman desa dan tidak perlu aksi lanjut.",
  },
  FAILED: {
    label: "Perlu unggahan ulang",
    pill: "pill-danger",
    note: "Dokumen tidak bisa dipakai dan pengunggah perlu menerima alasan yang jelas.",
  },
};

export const STATUS_TABS = [
  { value: "", label: "Semua" },
  { value: "WAITING_VERIFIED_APPROVAL", label: "Menunggu" },
  { value: "PROCESSING", label: "Diproses" },
  { value: "PUBLISHED", label: "Sudah tayang" },
  { value: "FAILED", label: "Gagal" },
] as const;

export const FIELD_LABELS: FieldLabelMap = {
  websiteUrl: "Website resmi",
  kategori: "Kategori desa",
  tahunData: "Tahun data",
  jumlahPenduduk: "Jumlah penduduk",
  kecamatan: "Kecamatan",
  kabupaten: "Kabupaten/Kota",
  provinsi: "Provinsi",
};

export const REVIEW_FIELDS = [...AI_MAPPABLE_DESA_FIELDS];
