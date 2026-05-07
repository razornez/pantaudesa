"use client";

import Link from "next/link";
import { useCallback, useEffect, useRef, useState } from "react";
import {
  AlertTriangle,
  CheckCircle2,
  ChevronDown,
  ChevronUp,
  FileText,
  Info,
  MapPin,
  Search,
  Sparkles,
  Upload,
} from "lucide-react";
import {
  AI_MAPPABLE_DESA_FIELDS,
  type AiMappableDesaField,
} from "@/lib/admin-claim/ai-mapping";

interface ExtractMeta {
  fileName?: string;
  mimeType?: string;
  size?: number;
  pages?: number;
  sheets?: string[];
  parser: string;
  durationMs: number;
  truncated?: boolean;
}

interface MappingEvidence {
  field: AiMappableDesaField;
  matchedText: string;
  rule: string;
}

interface ValidationIssue {
  field: AiMappableDesaField;
  message: string;
  severity: "error" | "warning";
}

interface DiffEntry {
  field: AiMappableDesaField;
  deltaType: "added" | "removed" | "updated" | "unchanged";
  previous?: string | number | null;
  next?: string | number | null;
  changed?: string;
}

interface DiffResult {
  entries: DiffEntry[];
  hasChanges: boolean;
  addedCount: number;
  updatedCount: number;
  removedCount: number;
  generatedAt: string;
}

interface MappingResult {
  fields: Partial<Record<AiMappableDesaField, string | number | null>>;
  evidence: MappingEvidence[];
  unmatched: AiMappableDesaField[];
  source: string;
  generatedAt: string;
}

interface ValidationResult {
  ok: boolean;
  issues: ValidationIssue[];
  checkedAt: string;
}

interface VersionCandidate {
  schemaVersion: 1;
  status: "REVIEW_READY" | "PUBLISHED";
  desaId: string;
  createdAt: string;
  changedFields: AiMappableDesaField[];
  baseSnapshot: Partial<Record<AiMappableDesaField, string | number | null>>;
  proposedSnapshot: Partial<Record<AiMappableDesaField, string | number | null>>;
}

interface KnownFieldEvidence {
  field: AiMappableDesaField;
  evidenceSnippet?: string;
  sourceReference?: string;
}

interface DetectedDetailField {
  sectionKey: string;
  sectionLabel: string;
  fieldKey: string;
  fieldLabel: string;
  value: string;
  reason: string;
  sourceRequirement: string;
  validationRequirement: string;
  evidenceSnippet?: string;
  sourceReference?: string;
}

interface UnknownUsefulField {
  label: string;
  value: string;
  possibleCategory: string;
  evidenceSnippet?: string;
}

interface OpenAIResult {
  attempted: boolean;
  status:
    | "success"
    | "skipped"
    | "missing_key"
    | "rate_limited"
    | "quota_limited"
    | "error"
    | "invalid_json";
  usedInputMode: "text" | "image" | "file";
  reason: string;
  message: string;
  model: string | null;
  documentType:
    | "profil_desa"
    | "anggaran"
    | "perangkat_desa"
    | "fasilitas"
    | "potensi"
    | "kontak"
    | "dokumen_publik"
    | "unknown";
  confidence: "low" | "medium" | "high";
  knownPublishableFields: Partial<Record<AiMappableDesaField, string | number | null>>;
  knownFieldEvidence: KnownFieldEvidence[];
  detectedButNotPublishable: DetectedDetailField[];
  unknownUsefulFields: UnknownUsefulField[];
  warnings: string[];
}

interface DetailFieldCoverageEntry {
  sectionKey: string;
  sectionLabel: string;
  fieldKey: string;
  fieldLabel: string;
  currentModelSource: string;
  currentValueStatus: "filled" | "empty";
  currentValuePreview: string;
  currentlyMappable: boolean;
  aiDetectable: boolean;
  publishableNow: boolean;
  shouldBeMappableInSprint05: boolean;
  deferredReason: string | null;
  sourceRequirement: string;
  validationRequirement: string;
  uploadedCoverageStatus: "covered" | "missing" | "detected_not_publishable";
  uploadedValuePreview: string | null;
}

interface DetailFieldCoverageSummary {
  entries: DetailFieldCoverageEntry[];
  filledCount: number;
  emptyCount: number;
  coveredCount: number;
  detectedNotPublishableCount: number;
  publishableNowCount: number;
  detectedButNotPublishable: DetectedDetailField[];
  unknownUsefulFields: UnknownUsefulField[];
}

interface PipelineResult {
  ok: boolean;
  inputSource: string;
  extract: ExtractMeta;
  mapping: MappingResult;
  validation: ValidationResult;
  diff: DiffResult | null;
  fieldCoverage: DetailFieldCoverageSummary | null;
  versionCandidate?: VersionCandidate | null;
  guardrailNote: string;
  openai: OpenAIResult;
}

interface PipelineError {
  error: string;
  meta?: Record<string, unknown>;
}

interface SubmitReviewSuccess {
  ok: boolean;
  documentId: string;
  title: string;
  newStatus: string;
  queuedAt: string;
  queueUrl: string;
}

interface DesaOption {
  id: string;
  nama: string;
  slug: string;
  kecamatan: string;
  kabupaten: string;
  provinsi: string;
}

interface DesaOptionsResponse {
  desa: DesaOption[];
}

interface IntakeHistorySubmission {
  id: string;
  title: string;
  status: string;
  aiMappingStatus: string | null;
  fileName: string;
  fileType: string;
  fileSize: number;
  failedReason: string | null;
  publishedAt: string | null;
  createdAt: string;
  updatedAt: string;
  desa: { id: string; nama: string; kabupaten: string };
}

interface IntakeHistoryActivity {
  id: string;
  documentId: string | null;
  title: string;
  desaName: string;
  eventType: string;
  label: string;
  nextStatus: string | null;
  reasonText: string | null;
  createdAt: string;
}

interface StorageModeState {
  mode: "dedicated" | "audit_fallback";
  dedicatedTableActive: boolean;
  note: string;
}

interface IntakeHistoryResponse {
  storage: StorageModeState;
  submissions: IntakeHistorySubmission[];
  activity: IntakeHistoryActivity[];
}

interface DesaVersionEntry {
  id: string;
  documentId: string | null;
  versionNumber: number;
  reasonText: string | null;
  createdAt: string;
  changedFields: AiMappableDesaField[];
  beforeSnapshot: Partial<Record<AiMappableDesaField, string | number | null>>;
  afterSnapshot: Partial<Record<AiMappableDesaField, string | number | null>>;
  title: string;
}

interface DesaVersionHistoryResponse {
  storage: StorageModeState;
  desa: {
    id: string;
    nama: string;
    kabupaten: string;
    dataPublishedAt: string | null;
    dataSourceLabel: string | null;
  };
  versions: DesaVersionEntry[];
}

function getPayloadError(payload: unknown, fallback: string): string {
  if (
    typeof payload === "object" &&
    payload !== null &&
    "error" in payload &&
    typeof (payload as { error?: unknown }).error === "string"
  ) {
    return (payload as { error: string }).error;
  }

  return fallback;
}

async function readJsonLikeResponse<T>(res: Response): Promise<T | PipelineError> {
  const contentType = res.headers.get("content-type") ?? "";

  if (contentType.includes("application/json")) {
    return (await res.json()) as T | PipelineError;
  }

  const raw = await res.text();
  if (raw.trim().startsWith("<!DOCTYPE") || raw.trim().startsWith("<html")) {
    return {
      error:
        res.status === 401 || res.status === 403
          ? "Sesi login berakhir atau akses internal admin ditolak. Silakan masuk ulang."
          : "Server mengembalikan halaman HTML, bukan JSON. Coba muat ulang lalu login ulang.",
    };
  }

  return {
    error: raw.trim() || "Respons server tidak valid.",
  };
}

const FIELD_LABELS: Record<AiMappableDesaField, string> = {
  websiteUrl: "Website resmi",
  kategori: "Kategori desa",
  tahunData: "Tahun data",
  jumlahPenduduk: "Jumlah penduduk",
  kecamatan: "Kecamatan",
  kabupaten: "Kabupaten/Kota",
  provinsi: "Provinsi",
};

const DELTA_ICONS: Record<string, string> = {
  added: "Added",
  removed: "Removed",
  updated: "Updated",
  unchanged: "Same",
};

const SAMPLE_VALID_TEXT = `Website: https://contoh-desa.go.id
Jumlah Penduduk: 2450 jiwa
Tahun Data: 2024
Kategori Desa: Mandiri
Kecamatan: Cibungbulang
Kabupaten: Bogor
Provinsi: Jawa Barat`;

const SAMPLE_COMPLEX_TEXT = `BERITA ACARA PEMBARUAN DATA DESA

Nama Desa: Baros
Tanggal Penyusunan: 6 Mei 2026
Website: https://baros-arjasari.desa.id
Jumlah Penduduk: 3786 jiwa
Tahun Data: 2025
Kategori Desa: Maju
Kecamatan: Arjasari
Kabupaten: Bandung
Provinsi: Jawa Barat

RINGKASAN PERUBAHAN
- Website resmi diperbarui dari domain lama ke domain desa.id.
- Jumlah penduduk disesuaikan berdasarkan rekap pelayanan semester II 2025.
- Kategori desa diperbarui menjadi Maju.
- Metadata wilayah diverifikasi ulang oleh tim administrasi desa.

CATATAN REVIEW INTERNAL
Dokumen ini dipakai sebagai contoh uji intake.
Data ini belum boleh dipublikasikan otomatis dan tetap harus melalui review internal.`;

function buildSampleDiffText(selectedDesa: DesaOption | null): string {
  const slug = selectedDesa?.slug ?? "desa-contoh-maju";
  const kecamatan = selectedDesa?.kecamatan ?? "Cibungbulang";
  const kabupaten = selectedDesa?.kabupaten ?? "Bogor";
  const provinsi = selectedDesa?.provinsi ?? "Jawa Barat";

  return `Website: https://${slug}.desa.id
Jumlah Penduduk: 3210 jiwa
Tahun Data: 2025
Kategori Desa: Maju
Kecamatan: ${kecamatan}
Kabupaten: ${kabupaten}
  Provinsi: ${provinsi}`;
}

function buildSuggestedReviewTitle(input: {
  mode: "upload" | "paste";
  selectedFile: File | null;
  selectedDesa: DesaOption | null;
}) {
  if (input.mode === "upload" && input.selectedFile?.name) {
    return input.selectedFile.name.replace(/\.[^.]+$/, "");
  }

  if (input.selectedDesa) {
    return `Intake ${input.selectedDesa.nama}`;
  }

  return "Intake review internal";
}

function formatBytes(bytes?: number) {
  if (!bytes) return "-";
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

function formatDateTime(value: string) {
  return new Date(value).toLocaleString("id-ID", {
    dateStyle: "medium",
    timeStyle: "short",
  });
}

function buildQueueFocusHref(input: { status: string; documentId: string }) {
  const params = new URLSearchParams();
  if (input.status) params.set("status", input.status);
  params.set("focus", input.documentId);
  return `/internal-admin/documents?${params.toString()}`;
}

function formatReviewStatusLabel(status: string | null) {
  if (!status) return null;
  if (status === "DRAFT_READY_REVIEW" || status === "DRAFT_PENDING_REVIEW") {
    return "Siap direview";
  }
  if (status === "DONE") return "Selesai";
  if (status === "FAILED") return "Gagal";
  if (status === "PENDING") return "Menunggu review";
  return status;
}

function formatDesaSearchValue(option: DesaOption) {
  return `${option.nama} - ${option.kecamatan}, ${option.kabupaten}`;
}

function formatDiffValue(value: string | number | null | undefined) {
  if (value === null || value === undefined || value === "") {
    return "Belum ada nilai";
  }

  return String(value);
}

function diffBadgeClasses(deltaType: DiffEntry["deltaType"]) {
  switch (deltaType) {
    case "added":
      return "bg-emerald-50 text-emerald-700 ring-1 ring-emerald-100";
    case "removed":
      return "bg-rose-50 text-rose-700 ring-1 ring-rose-100";
    case "updated":
      return "bg-amber-50 text-amber-700 ring-1 ring-amber-100";
    default:
      return "bg-slate-100 text-slate-600 ring-1 ring-slate-200";
  }
}

function getMappingStatus(result: PipelineResult) {
  if (result.mapping.evidence.length === 0) {
    return {
      label: "Perlu dicek",
      note: "Belum ada field yang berhasil terbaca otomatis.",
      className: "bg-amber-50 text-amber-700 ring-1 ring-amber-100",
    };
  }

  if (result.mapping.unmatched.length > 0) {
    return {
      label: "Sebagian terbaca",
      note: "Masih ada field yang belum terdeteksi otomatis.",
      className: "bg-sky-50 text-sky-700 ring-1 ring-sky-100",
    };
  }

  return {
    label: "Sudah terbaca",
    note: "Field utama berhasil dibaca dari dokumen atau teks.",
    className: "bg-emerald-50 text-emerald-700 ring-1 ring-emerald-100",
  };
}

function getValidationStatus(result: PipelineResult) {
  const hasErrors = result.validation.issues.some((issue) => issue.severity === "error");
  const hasWarnings = result.validation.issues.some((issue) => issue.severity === "warning");

  if (hasErrors) {
    return {
      label: "Perlu diperbaiki",
      note: "Masih ada data yang belum valid dan perlu dibetulkan dulu.",
      className: "bg-rose-50 text-rose-700 ring-1 ring-rose-100",
    };
  }

  if (hasWarnings) {
    return {
      label: "Perlu dicek",
      note: "Tidak ada error fatal, tapi masih ada warning yang sebaiknya ditinjau.",
      className: "bg-amber-50 text-amber-700 ring-1 ring-amber-100",
    };
  }

  return {
    label: "Sudah benar",
    note: "Validasi dasar lolos tanpa error maupun warning.",
    className: "bg-emerald-50 text-emerald-700 ring-1 ring-emerald-100",
  };
}

function getReviewStatus(result: PipelineResult) {
  const hasErrors = result.validation.issues.some((issue) => issue.severity === "error");
  const hasReviewableContent = getReviewableContentCount(result) > 0;

  if (hasErrors) {
    return {
      label: "Belum siap direview",
      note: "Selesaikan error validasi dulu sebelum dibawa ke review internal.",
      className: "bg-rose-50 text-rose-700 ring-1 ring-rose-100",
    };
  }

  if (result.diff?.hasChanges) {
    return {
      label: "Siap direview",
      note: "Perubahan sudah terlihat dan bisa dibahas oleh internal admin.",
      className: "bg-sky-50 text-sky-700 ring-1 ring-sky-100",
    };
  }

  if (!hasReviewableContent) {
    return {
      label: "Belum cukup terbaca",
      note: "Belum ada hasil yang cukup kuat untuk dibawa ke review internal.",
      className: "bg-amber-50 text-amber-700 ring-1 ring-amber-100",
    };
  }

  return {
    label: "Siap dicek ulang",
    note: "Preview aman dicek, tapi belum ada perubahan yang terlihat dibanding data saat ini.",
    className: "bg-slate-100 text-slate-700 ring-1 ring-slate-200",
  };
}

function getMappedFieldEntries(result: PipelineResult) {
  return AI_MAPPABLE_DESA_FIELDS.filter((field) => result.mapping.fields[field] !== undefined).map(
    (field) => ({
      field,
      value: result.mapping.fields[field],
    }),
  );
}

function getChangedFieldList(result: PipelineResult) {
  if (result.versionCandidate && result.versionCandidate.changedFields.length > 0) {
    return result.versionCandidate.changedFields;
  }

  if (result.diff) {
    return result.diff.entries
      .filter((entry) => entry.deltaType !== "unchanged")
      .map((entry) => entry.field);
  }

  return [];
}

function getReviewableContentCount(result: PipelineResult) {
  return (
    getMappedFieldEntries(result).length +
    (result.fieldCoverage?.detectedButNotPublishable.length ?? 0) +
    (result.fieldCoverage?.unknownUsefulFields.length ?? 0)
  );
}

function getOpenAiStatus(result: PipelineResult) {
  switch (result.openai.status) {
    case "success":
      return {
        label: "AI membantu",
        note: result.openai.message,
        className: "bg-emerald-50 text-emerald-700 ring-1 ring-emerald-100",
      };
    case "missing_key":
      return {
        label: "AI belum tersedia",
        note: result.openai.message,
        className: "bg-amber-50 text-amber-700 ring-1 ring-amber-100",
      };
    case "rate_limited":
    case "quota_limited":
    case "error":
    case "invalid_json":
      return {
        label: "AI fallback",
        note: result.openai.message,
        className: "bg-amber-50 text-amber-700 ring-1 ring-amber-100",
      };
    default:
      return {
        label: "Parser lokal",
        note: result.openai.message,
        className: "bg-slate-100 text-slate-700 ring-1 ring-slate-200",
      };
  }
}

function IntakeAiStatusPanel({
  result,
  embedded = false,
}: {
  result: PipelineResult;
  embedded?: boolean;
}) {
  const status = getOpenAiStatus(result);
  const hasAiFindings =
    Object.keys(result.openai.knownPublishableFields).length > 0 ||
    result.openai.detectedButNotPublishable.length > 0 ||
    result.openai.unknownUsefulFields.length > 0;

  return (
    <div className={embedded ? "space-y-3" : "rounded-[1.5rem] border border-slate-200 bg-white p-4 sm:p-5"}>
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-500">
            Pembacaan AI
          </p>
          <h3 className="mt-1 text-sm font-semibold text-slate-900 sm:text-base">
            Jujur tentang kapan AI dipakai dan apa hasilnya
          </h3>
        </div>
        <span
          className={`inline-flex rounded-full px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.16em] ${status.className}`}
        >
          {status.label}
        </span>
      </div>

      <p className="mt-3 text-xs leading-relaxed text-slate-600">{status.note}</p>

      <div className="mt-3 grid gap-3 sm:grid-cols-3">
        <div className="rounded-xl border border-slate-100 bg-slate-50 px-3 py-3 text-xs">
          <p className="text-[10px] uppercase tracking-[0.14em] text-slate-500">Mode input</p>
          <p className="mt-1 font-semibold text-slate-900">{result.openai.usedInputMode}</p>
        </div>
        <div className="rounded-xl border border-slate-100 bg-slate-50 px-3 py-3 text-xs">
          <p className="text-[10px] uppercase tracking-[0.14em] text-slate-500">Confidence</p>
          <p className="mt-1 font-semibold text-slate-900">{result.openai.confidence}</p>
        </div>
        <div className="rounded-xl border border-slate-100 bg-slate-50 px-3 py-3 text-xs">
          <p className="text-[10px] uppercase tracking-[0.14em] text-slate-500">Tipe dokumen</p>
          <p className="mt-1 font-semibold text-slate-900">{result.openai.documentType}</p>
        </div>
      </div>

      {!hasAiFindings && result.openai.status !== "success" ? (
        <p className="mt-3 text-[11px] text-slate-500">
          Tidak ada temuan AI yang dipakai di draft ini. Preview tetap dibangun dari parser lokal
          atau dari input manual yang tersedia.
        </p>
      ) : null}

      {result.openai.warnings.length > 0 ? (
        <div className="mt-3 space-y-1">
          {result.openai.warnings.map((warning, index) => (
            <div
              key={`${warning}-${index}`}
              className="rounded-xl border border-amber-200 bg-amber-50 px-3 py-2 text-[11px] text-amber-800"
            >
              {warning}
            </div>
          ))}
        </div>
      ) : null}
    </div>
  );
}

function IntakeFieldCoveragePanel({
  result,
  selectedDesa,
}: {
  result: PipelineResult;
  selectedDesa: DesaOption | null;
}) {
  const coverage = result.fieldCoverage;
  const [showDetails, setShowDetails] = useState(false);

  if (!coverage) return null;

  const sectionOrder = Array.from(
    new Map(coverage.entries.map((entry) => [entry.sectionKey, entry.sectionLabel])).entries(),
  );

  return (
    <div className="rounded-[1.5rem] border border-slate-200 bg-white p-4 sm:p-5">
      <div className="space-y-1">
        <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-500">
          Cakupan field detail
        </p>
        <h3 className="text-sm font-semibold text-slate-900 sm:text-base">
          Bandingkan isi upload dengan field yang memang dipakai halaman detail desa
        </h3>
        <p className="text-xs leading-relaxed text-slate-600">
          {selectedDesa
            ? "Di sini Anda bisa lihat field publik yang sudah terisi, yang masih kosong, yang tertutup oleh upload ini, dan yang terdeteksi tetapi belum aman dipublish."
            : "Pilih desa jika ingin melihat mana field publik yang sudah terisi dan mana yang masih kosong. Tanpa desa, bagian ini tetap menunjukkan field yang tertutup oleh upload."}
        </p>
      </div>

      <div className="mt-4 grid gap-3 sm:grid-cols-2 xl:grid-cols-5">
        {[
          ["Sudah terisi", `${coverage.filledCount} field`, "border-emerald-200 bg-emerald-50 text-emerald-900"],
          ["Masih kosong", `${coverage.emptyCount} field`, "border-slate-200 bg-slate-50 text-slate-900"],
          ["Tercakup upload", `${coverage.coveredCount} field`, "border-sky-200 bg-sky-50 text-sky-900"],
          [
            "Terdeteksi tapi belum publishable",
            `${coverage.detectedNotPublishableCount} field`,
            "border-amber-200 bg-amber-50 text-amber-900",
          ],
          [
            "Publishable sekarang",
            `${coverage.publishableNowCount} field`,
            "border-indigo-200 bg-indigo-50 text-indigo-900",
          ],
        ].map(([label, value, className]) => (
          <div key={label} className={`rounded-xl border px-3 py-3 text-xs ${className}`}>
            <p className="text-[10px] uppercase tracking-[0.14em] text-current/70">{label}</p>
            <p className="mt-1 font-semibold text-current">{value}</p>
          </div>
        ))}
      </div>

      <div className="mt-4 space-y-3">
        <button
          type="button"
          onClick={() => setShowDetails((current) => !current)}
          className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-100"
        >
          {showDetails ? <ChevronUp size={13} aria-hidden /> : <ChevronDown size={13} aria-hidden />}
          {showDetails ? "Sembunyikan detail field" : "Lihat detail field coverage"}
        </button>

        {showDetails ? (
          <div className="space-y-4">
            {sectionOrder.map(([sectionKey, sectionLabel]) => {
              const sectionEntries = coverage.entries.filter((entry) => entry.sectionKey === sectionKey);
              return (
                <div key={sectionKey} className="rounded-2xl border border-slate-100 bg-slate-50/70 p-3">
                  <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-slate-500">
                    {sectionLabel}
                  </p>
                  <div className="mt-3 space-y-2">
                    {sectionEntries.map((entry) => (
                      <div
                        key={`${sectionKey}-${entry.fieldKey}`}
                        className="rounded-xl border border-slate-100 bg-white px-3 py-3 text-xs"
                      >
                        <div className="flex flex-wrap items-start justify-between gap-2">
                          <div>
                            <p className="font-semibold text-slate-900">{entry.fieldLabel}</p>
                            <p className="mt-0.5 text-[11px] text-slate-500">
                              {entry.currentModelSource}
                            </p>
                          </div>
                          <div className="flex flex-wrap gap-1.5">
                            <span
                              className={`rounded-full px-2 py-0.5 text-[10px] font-semibold ${
                                entry.currentValueStatus === "filled"
                                  ? "bg-emerald-50 text-emerald-700"
                                  : "bg-slate-100 text-slate-600"
                              }`}
                            >
                              {entry.currentValueStatus === "filled" ? "Sudah terisi" : "Masih kosong"}
                            </span>
                            <span
                              className={`rounded-full px-2 py-0.5 text-[10px] font-semibold ${
                                entry.uploadedCoverageStatus === "covered"
                                  ? "bg-sky-50 text-sky-700"
                                  : entry.uploadedCoverageStatus === "detected_not_publishable"
                                  ? "bg-amber-50 text-amber-700"
                                  : "bg-slate-100 text-slate-500"
                              }`}
                            >
                              {entry.uploadedCoverageStatus === "covered"
                                ? "Tercakup upload"
                                : entry.uploadedCoverageStatus === "detected_not_publishable"
                                ? "Terdeteksi tapi belum publishable"
                                : "Belum tertutup upload"}
                            </span>
                          </div>
                        </div>

                        <div className="mt-3 grid gap-2 sm:grid-cols-2">
                          <div className="rounded-xl border border-slate-100 bg-slate-50 px-3 py-2">
                            <p className="text-[10px] uppercase tracking-[0.14em] text-slate-500">
                              Nilai publik saat ini
                            </p>
                            <p className="mt-1 text-[11px] text-slate-700">{entry.currentValuePreview}</p>
                          </div>
                          <div className="rounded-xl border border-slate-100 bg-slate-50 px-3 py-2">
                            <p className="text-[10px] uppercase tracking-[0.14em] text-slate-500">
                              Hasil upload
                            </p>
                            <p className="mt-1 text-[11px] text-slate-700">
                              {entry.uploadedValuePreview ?? "Belum ada temuan yang cukup kuat"}
                            </p>
                          </div>
                        </div>

                        <div className="mt-2 grid gap-2 sm:grid-cols-2">
                          <p className="text-[11px] text-slate-500">
                            <span className="font-semibold text-slate-700">Sumber:</span>{" "}
                            {entry.sourceRequirement}
                          </p>
                          <p className="text-[11px] text-slate-500">
                            <span className="font-semibold text-slate-700">Validasi:</span>{" "}
                            {entry.validationRequirement}
                          </p>
                        </div>

                        {!entry.publishableNow && entry.deferredReason ? (
                          <p className="mt-2 text-[11px] text-amber-700">
                            <span className="font-semibold">Belum publishable:</span>{" "}
                            {entry.deferredReason}
                          </p>
                        ) : null}
                      </div>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        ) : null}

        {coverage.detectedButNotPublishable.length > 0 ? (
          <div className="rounded-2xl border border-amber-200 bg-amber-50/70 p-3">
            <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-amber-700">
              Terdeteksi tetapi belum aman dipublish
            </p>
            <div className="mt-2 space-y-2">
              {coverage.detectedButNotPublishable.slice(0, 6).map((item, index) => (
                <div key={`${item.fieldKey}-${index}`} className="rounded-xl border border-amber-100 bg-white px-3 py-2 text-xs">
                  <p className="font-semibold text-slate-900">
                    {item.fieldLabel} <span className="text-slate-400">({item.sectionLabel})</span>
                  </p>
                  <p className="mt-1 text-slate-700">{item.value}</p>
                  <p className="mt-1 text-[11px] text-amber-700">{item.reason}</p>
                </div>
              ))}
            </div>
          </div>
        ) : null}

        {coverage.unknownUsefulFields.length > 0 ? (
          <div className="rounded-2xl border border-slate-200 bg-slate-50/70 p-3">
            <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-slate-500">
              Temuan lain yang mungkin berguna
            </p>
            <div className="mt-2 space-y-2">
              {coverage.unknownUsefulFields.slice(0, 6).map((item, index) => (
                <div key={`${item.label}-${index}`} className="rounded-xl border border-slate-100 bg-white px-3 py-2 text-xs">
                  <p className="font-semibold text-slate-900">{item.label}</p>
                  <p className="mt-1 text-slate-700">{item.value}</p>
                  <p className="mt-1 text-[11px] text-slate-500">
                    Kandidat kategori: {item.possibleCategory}
                  </p>
                </div>
              ))}
            </div>
          </div>
        ) : null}
      </div>
    </div>
  );
}

function SectionCard({
  title,
  children,
  defaultOpen = true,
}: {
  title: string;
  children: React.ReactNode;
  defaultOpen?: boolean;
}) {
  const [open, setOpen] = useState(defaultOpen);

  return (
    <div className="lux-card space-y-3 p-4 sm:p-5">
      <button
        type="button"
        onClick={() => setOpen((current) => !current)}
        className="flex w-full items-center justify-between text-left"
      >
        <h3 className="text-[13px] font-semibold text-slate-900 sm:text-[14px]">{title}</h3>
        {open ? (
          <ChevronUp size={14} className="text-slate-400" aria-hidden />
        ) : (
          <ChevronDown size={14} className="text-slate-400" aria-hidden />
        )}
      </button>
      {open && children}
    </div>
  );
}

function StorageModeNotice({
  storage,
  dedicatedLabel,
  fallbackLabel,
}: {
  storage: StorageModeState;
  dedicatedLabel: string;
  fallbackLabel: string;
}) {
  const isDedicated = storage.mode === "dedicated";

  return (
    <div
      className={`rounded-xl border px-3 py-2.5 text-[11px] ${
        isDedicated
          ? "border-emerald-200 bg-emerald-50 text-emerald-800"
          : "border-amber-200 bg-amber-50 text-amber-900"
      }`}
    >
      <div className="flex flex-wrap items-center gap-2">
        <span className="font-semibold">
          {isDedicated ? dedicatedLabel : fallbackLabel}
        </span>
        <span
          className={`rounded-full px-2 py-0.5 text-[10px] font-semibold ${
            isDedicated ? "bg-emerald-100 text-emerald-700" : "bg-amber-100 text-amber-800"
          }`}
        >
          {isDedicated ? "Dedicated aktif" : "Fallback audit aktif"}
        </span>
      </div>
      <p className="mt-1 leading-relaxed">{storage.note}</p>
    </div>
  );
}

function WorkflowGuide({
  step,
  submittedReview,
}: {
  step: "input" | "result";
  submittedReview: SubmitReviewSuccess | null;
}) {
  const currentStep = submittedReview ? 4 : step === "result" ? 2 : 1;
  const items = [
    {
      label: "1. Siapkan bahan",
      note: "Upload file atau tempel teks, lalu pilih desa bila ingin diarahkan ke review.",
    },
    {
      label: "2. Cek hasil otomatis",
      note: "Lihat ringkasan, validasi, perubahan utama, lalu pastikan hasilnya masuk akal.",
    },
    {
      label: "3. Kirim ke antrean review",
      note: "Simpan hasil preview ke antrean internal. Langkah ini belum mengubah data publik.",
    },
    {
      label: "4. Review lalu publish",
      note: "Di antrean review, admin melengkapi data lalu memutuskan publish final.",
    },
  ];

  return (
    <div className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-4">
      <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-500">
        Alur singkat
      </p>
      <div className="mt-3 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        {items.map((item, index) => {
          const order = index + 1;
          const isCurrent = order === currentStep;
          const isDone = order < currentStep;

          return (
            <div
              key={item.label}
              className={`rounded-xl border px-3 py-3 text-xs ${
                isCurrent
                  ? "border-sky-200 bg-sky-50 text-sky-900"
                  : isDone
                  ? "border-emerald-200 bg-emerald-50 text-emerald-900"
                  : "border-slate-200 bg-white text-slate-700"
              }`}
            >
              <p className="font-semibold">{item.label}</p>
              <p className="mt-1 leading-relaxed">{item.note}</p>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function IntakeDecisionSummary({
  result,
  selectedDesa,
  submittedReview,
}: {
  result: PipelineResult;
  selectedDesa: DesaOption | null;
  submittedReview: SubmitReviewSuccess | null;
}) {
  const mappedFields = getMappedFieldEntries(result);
  const changedFields = getChangedFieldList(result);
  const canSubmit =
    Boolean(selectedDesa) &&
    result.validation.ok &&
    !submittedReview &&
    getReviewableContentCount(result) > 0;

  const cards = [
    {
      label: "Target review",
      value: selectedDesa ? selectedDesa.nama : "Belum dipilih",
      note: selectedDesa
        ? `${selectedDesa.kecamatan}, ${selectedDesa.kabupaten}`
        : "Pilih desa dulu agar hasil ini punya tujuan review yang jelas.",
      className: selectedDesa
        ? "border-slate-200 bg-white text-slate-900"
        : "border-amber-200 bg-amber-50 text-amber-900",
    },
    {
      label: "Perubahan utama",
      value: changedFields.length > 0 ? `${changedFields.length} field` : "Belum terlihat",
      note:
        changedFields.length > 0
          ? changedFields
              .slice(0, 3)
              .map((field) => FIELD_LABELS[field])
              .join(", ")
          : selectedDesa
          ? "Belum ada perubahan dibanding data desa saat ini."
          : "Diff baru terasa setelah desa target dipilih.",
      className:
        changedFields.length > 0
          ? "border-emerald-200 bg-emerald-50 text-emerald-900"
          : "border-slate-200 bg-white text-slate-900",
    },
    {
      label: "Field terbaca",
      value: `${mappedFields.length} field`,
      note:
        mappedFields.length > 0
          ? mappedFields
              .slice(0, 3)
              .map((item) => FIELD_LABELS[item.field])
              .join(", ")
          : "Belum ada field yang berhasil dibaca otomatis.",
      className:
        mappedFields.length > 0
          ? "border-sky-200 bg-sky-50 text-sky-900"
          : "border-amber-200 bg-amber-50 text-amber-900",
    },
    {
      label: "Bisa kirim sekarang?",
      value: submittedReview ? "Sudah dikirim" : canSubmit ? "Ya, bisa" : "Belum bisa",
      note: submittedReview
        ? "Item review sudah dibuat dan tinggal dilanjutkan di antrean review."
        : !selectedDesa
        ? "Pilih desa target dulu."
        : !result.validation.ok
        ? "Masih ada error validasi yang harus dibereskan."
        : getReviewableContentCount(result) === 0
        ? "Belum ada hasil yang cukup kuat untuk dibawa ke review."
        : "Hasil ini sudah cukup aman untuk dikirim ke antrean review.",
      className: submittedReview
        ? "border-emerald-200 bg-emerald-50 text-emerald-900"
        : canSubmit
        ? "border-emerald-200 bg-emerald-50 text-emerald-900"
        : "border-rose-200 bg-rose-50 text-rose-900",
    },
  ];

  return (
    <div className="rounded-[1.5rem] border border-slate-200 bg-slate-50/80 p-4 sm:p-5">
      <div className="space-y-1">
        <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-500">
          Ringkasan keputusan
        </p>
        <h3 className="text-sm font-semibold text-slate-900 sm:text-base">
          Jawaban cepat sebelum Anda lanjut
        </h3>
        <p className="text-xs leading-relaxed text-slate-600">
          Gunakan blok ini untuk melihat apa yang terbaca, apa yang berubah, dan apakah hasil ini
          sudah siap dikirim ke review internal.
        </p>
      </div>

      <div className="mt-4 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        {cards.map((card) => (
          <div key={card.label} className={`rounded-xl border px-3 py-3 text-xs ${card.className}`}>
            <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-current/70">
              {card.label}
            </p>
            <p className="mt-2 text-sm font-semibold text-current">{card.value}</p>
            <p className="mt-1 leading-relaxed text-current/80">{card.note}</p>
          </div>
        ))}
      </div>

      <div className="mt-3 rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs text-slate-600">
        Yang belum terjadi di layar ini: belum submit otomatis, belum publish otomatis, dan belum
        ada perubahan ke data publik sampai admin menyelesaikan review di antrean.
      </div>
    </div>
  );
}

function IntakeMappedSummary({
  result,
}: {
  result: PipelineResult;
}) {
  const mappedFields = getMappedFieldEntries(result);

  return (
    <SectionCard title="Apa Yang Terbaca Utama">
      {mappedFields.length === 0 ? (
        <p className="text-xs italic text-slate-500">
          Belum ada field utama yang berhasil dibaca otomatis dari dokumen atau teks ini.
        </p>
      ) : (
        <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
          {mappedFields.map((item) => (
            <div
              key={item.field}
              className="rounded-xl border border-slate-200 bg-slate-50/70 px-3 py-3 text-xs"
            >
              <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-slate-500">
                {FIELD_LABELS[item.field]}
              </p>
              <p className="mt-2 break-words text-sm font-semibold text-slate-900">
                {formatDiffValue(item.value)}
              </p>
            </div>
          ))}
        </div>
      )}

      {result.mapping.unmatched.length > 0 ? (
        <div className="mt-3 rounded-xl border border-amber-200 bg-amber-50 px-3 py-2 text-xs text-amber-800">
          <span className="font-semibold">Masih belum terbaca:</span>{" "}
          {result.mapping.unmatched.map((field) => FIELD_LABELS[field]).join(", ")}
        </div>
      ) : null}
    </SectionCard>
  );
}

function IntakeHistoryPanel({
  history,
  loading,
  error,
}: {
  history: IntakeHistoryResponse | null;
  loading: boolean;
  error: string | null;
}) {
  return (
    <SectionCard title="Riwayat Intake & Aktivitas" defaultOpen={false}>
      {history ? (
        <StorageModeNotice
          storage={history.storage}
          dedicatedLabel="Mode audit dedicated aktif"
          fallbackLabel="Mode fallback audit"
        />
      ) : null}
      {loading ? (
        <p className="text-xs text-slate-500">Memuat riwayat intake terbaru...</p>
      ) : error ? (
        <p className="text-xs text-rose-600">{error}</p>
      ) : !history || (history.submissions.length === 0 && history.activity.length === 0) ? (
        <p className="text-xs text-slate-500">
          Belum ada intake workbench yang tersimpan ke review internal.
        </p>
      ) : (
        <div className="space-y-4">
          <div className="space-y-2">
            <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-slate-500">
              Submission terbaru
            </p>
            <p className="text-[11px] text-slate-500">
              Klik card untuk membuka dokumen yang sama di antrean review.
            </p>
            <div className="space-y-2">
              {history.submissions.map((item) => (
                <Link
                  key={item.id}
                  href={buildQueueFocusHref({ status: item.status, documentId: item.id })}
                  prefetch={false}
                  className="group block rounded-xl border border-slate-100 bg-white px-3 py-2.5 text-xs transition-all duration-300 hover:-translate-y-0.5 hover:border-emerald-200 hover:bg-emerald-50/50 hover:shadow-sm"
                >
                  <div className="flex flex-wrap items-start justify-between gap-2">
                    <div className="min-w-0">
                      <p className="truncate font-semibold text-slate-900 group-hover:text-emerald-900">
                        {item.title}
                      </p>
                      <p className="truncate text-[11px] text-slate-500">
                        {item.desa.nama}, {item.desa.kabupaten}
                      </p>
                    </div>
                    <div className="flex flex-wrap gap-1.5">
                      <span className="rounded-full bg-slate-100 px-2 py-0.5 text-[10px] font-semibold text-slate-600">
                        {item.status}
                      </span>
                      {formatReviewStatusLabel(item.aiMappingStatus) ? (
                        <span className="rounded-full bg-sky-50 px-2 py-0.5 text-[10px] font-semibold text-sky-700">
                          {formatReviewStatusLabel(item.aiMappingStatus)}
                        </span>
                      ) : null}
                    </div>
                  </div>
                  <div className="mt-2 flex flex-wrap gap-x-3 gap-y-1 text-[11px] text-slate-500">
                    <span>{item.fileType}</span>
                    <span>{formatBytes(item.fileSize)}</span>
                    <span>Diperbarui {formatDateTime(item.updatedAt)}</span>
                  </div>
                  <p className="mt-2 text-[11px] font-medium text-emerald-700 opacity-0 transition-opacity duration-300 group-hover:opacity-100">
                    Buka di antrean review
                  </p>
                  {item.failedReason ? (
                    <p className="mt-2 text-[11px] text-rose-600">Alasan gagal: {item.failedReason}</p>
                  ) : null}
                </Link>
              ))}
            </div>
          </div>

          <div className="space-y-2">
            <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-slate-500">
              Aktivitas audit terbaru
            </p>
            <div className="space-y-2">
              {history.activity.map((item) => (
                <div
                  key={item.id}
                  className="rounded-xl border border-slate-100 bg-slate-50 px-3 py-2.5 text-xs"
                >
                  <div className="flex flex-wrap items-start justify-between gap-2">
                    <div>
                      <p className="font-semibold text-slate-900">{item.label}</p>
                      <p className="text-[11px] text-slate-500">
                        {item.title} · {item.desaName}
                      </p>
                    </div>
                    <span className="text-[11px] text-slate-500">
                      {formatDateTime(item.createdAt)}
                    </span>
                  </div>
                  {item.reasonText ? (
                    <p className="mt-2 text-[11px] text-slate-600">{item.reasonText}</p>
                  ) : null}
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </SectionCard>
  );
}

function DesaVersionHistoryPanel({
  versionHistory,
  loading,
  error,
  selectedDesa,
}: {
  versionHistory: DesaVersionHistoryResponse | null;
  loading: boolean;
  error: string | null;
  selectedDesa: DesaOption | null;
}) {
  if (!selectedDesa) {
    return (
      <SectionCard title="Riwayat Versi Desa" defaultOpen={false}>
        <p className="text-xs text-slate-500">
          Pilih desa dulu untuk melihat jejak versi publik internal desa tersebut.
        </p>
      </SectionCard>
    );
  }

  return (
    <SectionCard title="Riwayat Versi Desa" defaultOpen={false}>
      {versionHistory ? (
        <StorageModeNotice
          storage={versionHistory.storage}
          dedicatedLabel="Mode versioning dedicated aktif"
          fallbackLabel="Mode fallback versioning"
        />
      ) : null}
      {loading ? (
        <p className="text-xs text-slate-500">Memuat riwayat versi desa...</p>
      ) : error ? (
        <p className="text-xs text-rose-600">{error}</p>
      ) : !versionHistory || versionHistory.versions.length === 0 ? (
        <p className="text-xs text-slate-500">
          Belum ada versi publik yang tercatat untuk {selectedDesa.nama}.
        </p>
      ) : (
        <div className="space-y-4">
          <div className="rounded-xl border border-slate-100 bg-slate-50 px-3 py-2.5 text-xs">
            <p className="font-semibold text-slate-900">
              {versionHistory.desa.nama}, {versionHistory.desa.kabupaten}
            </p>
            <p className="mt-1 text-[11px] text-slate-500">
              Latest public tetap berasal dari data `Desa`. Riwayat di bawah bersifat internal/audit.
            </p>
            {versionHistory.desa.dataPublishedAt ? (
              <p className="mt-1 text-[11px] text-slate-500">
                Terakhir dipublikasikan {formatDateTime(versionHistory.desa.dataPublishedAt)}
              </p>
            ) : null}
          </div>

          <div className="space-y-2">
            {versionHistory.versions.map((version) => (
              <div
                key={version.id}
                className="rounded-xl border border-slate-100 bg-white px-3 py-3 text-xs"
              >
                <div className="flex flex-wrap items-start justify-between gap-2">
                  <div>
                    <p className="font-semibold text-slate-900">
                      Versi {version.versionNumber}
                    </p>
                    <p className="text-[11px] text-slate-500">{version.title}</p>
                  </div>
                  <span className="text-[11px] text-slate-500">
                    {formatDateTime(version.createdAt)}
                  </span>
                </div>

                <div className="mt-2 flex flex-wrap gap-1.5">
                  {version.changedFields.map((field) => (
                    <span
                      key={field}
                      className="rounded-full bg-sky-50 px-2 py-0.5 text-[10px] font-semibold text-sky-700"
                    >
                      {FIELD_LABELS[field]}
                    </span>
                  ))}
                </div>

                {version.reasonText ? (
                  <p className="mt-2 text-[11px] text-slate-600">{version.reasonText}</p>
                ) : null}

                <div className="mt-3 space-y-2">
                  {version.changedFields.map((field) => (
                    <div
                      key={`${version.id}-${field}`}
                      className="grid gap-2 rounded-lg border border-slate-100 bg-slate-50 px-2.5 py-2 sm:grid-cols-2"
                    >
                      <div>
                        <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-slate-500">
                          Sebelum
                        </p>
                        <p className="mt-1 text-[11px] text-slate-700">
                          {formatDiffValue(version.beforeSnapshot[field])}
                        </p>
                      </div>
                      <div>
                        <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-slate-500">
                          Sesudah
                        </p>
                        <p className="mt-1 text-[11px] font-medium text-slate-900">
                          {formatDiffValue(version.afterSnapshot[field])}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </SectionCard>
  );
}

export default function IntakeWorkbench() {
  const [step, setStep] = useState<"input" | "result">("input");
  const [mode, setMode] = useState<"upload" | "paste">("upload");
  const [useAiMapping, setUseAiMapping] = useState(false);
  const [textValue, setTextValue] = useState("");
  const [desaSearch, setDesaSearch] = useState("");
  const [desaIdValue, setDesaIdValue] = useState("");
  const [selectedDesa, setSelectedDesa] = useState<DesaOption | null>(null);
  const [desaOptions, setDesaOptions] = useState<DesaOption[]>([]);
  const [isDesaPickerOpen, setIsDesaPickerOpen] = useState(true);
  const [desaLoading, setDesaLoading] = useState(false);
  const [desaLoadError, setDesaLoadError] = useState<string | null>(null);
  const [result, setResult] = useState<PipelineResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [reviewTitle, setReviewTitle] = useState("");
  const [submittingReview, setSubmittingReview] = useState(false);
  const [submittedReview, setSubmittedReview] = useState<SubmitReviewSuccess | null>(null);
  const [history, setHistory] = useState<IntakeHistoryResponse | null>(null);
  const [historyLoading, setHistoryLoading] = useState(true);
  const [historyError, setHistoryError] = useState<string | null>(null);
  const [versionHistory, setVersionHistory] = useState<DesaVersionHistoryResponse | null>(null);
  const [versionHistoryLoading, setVersionHistoryLoading] = useState(false);
  const [versionHistoryError, setVersionHistoryError] = useState<string | null>(null);
  const selectedDesaId = selectedDesa?.id ?? null;

  const requestHistory = useCallback(async () => {
    const res = await fetch("/api/internal-admin/intake/history", {
      headers: { Accept: "application/json" },
    });
    const payload = await readJsonLikeResponse<IntakeHistoryResponse>(res);

    if (!res.ok || "error" in payload) {
      throw new Error(getPayloadError(payload, "Gagal memuat riwayat intake."));
    }

    return payload;
  }, []);

  const fetchHistory = useCallback(async () => {
    setHistoryLoading(true);
    setHistoryError(null);

    try {
      const payload = await requestHistory();
      setHistory(payload);
    } catch (err) {
      setHistoryError(err instanceof Error ? err.message : "Gagal memuat riwayat intake.");
    } finally {
      setHistoryLoading(false);
    }
  }, [requestHistory]);

  useEffect(() => {
    let cancelled = false;

    const loadInitialHistory = async () => {
      try {
        const payload = await requestHistory();
        if (!cancelled) {
          setHistory(payload);
          setHistoryError(null);
        }
      } catch (err) {
        if (!cancelled) {
          setHistoryError(err instanceof Error ? err.message : "Gagal memuat riwayat intake.");
        }
      } finally {
        if (!cancelled) {
          setHistoryLoading(false);
        }
      }
    };

    void loadInitialHistory();

    return () => {
      cancelled = true;
    };
  }, [requestHistory]);

  useEffect(() => {
    if (!selectedDesaId) return;
    let cancelled = false;

    const loadVersionHistory = async () => {
      try {
        const res = await fetch(
          `/api/internal-admin/desa-version-history?desaId=${encodeURIComponent(selectedDesaId)}`,
          {
            headers: { Accept: "application/json" },
          },
        );
        const payload = await readJsonLikeResponse<DesaVersionHistoryResponse>(res);

        if (!res.ok || "error" in payload) {
          throw new Error(getPayloadError(payload, "Gagal memuat riwayat versi desa."));
        }

        if (!cancelled) {
          setVersionHistory(payload);
        }
      } catch (err) {
        if (!cancelled) {
          setVersionHistoryError(
            err instanceof Error ? err.message : "Gagal memuat riwayat versi desa.",
          );
        }
      } finally {
        if (!cancelled) {
          setVersionHistoryLoading(false);
        }
      }
    };

    void loadVersionHistory();

    return () => {
      cancelled = true;
    };
  }, [selectedDesaId]);

  useEffect(() => {
    let cancelled = false;

    const timeoutId = window.setTimeout(async () => {
      setDesaLoading(true);
      setDesaLoadError(null);

      try {
        const query = desaSearch.trim();
        const suffix = query ? `?q=${encodeURIComponent(query)}` : "";
        const res = await fetch(`/api/internal-admin/desa-options${suffix}`, {
          headers: { Accept: "application/json" },
        });
        const payload = await readJsonLikeResponse<DesaOptionsResponse>(res);

        if (!res.ok || "error" in payload) {
          throw new Error(getPayloadError(payload, "Gagal memuat daftar desa."));
        }

        if (!cancelled) {
          setDesaOptions(payload.desa);
          if (selectedDesa) {
            const nextSelection = payload.desa.find((item) => item.id === selectedDesa.id);
            if (nextSelection) {
              setSelectedDesa(nextSelection);
            }
          }
        }
      } catch (err) {
        if (!cancelled) {
          setDesaLoadError(err instanceof Error ? err.message : "Gagal memuat daftar desa.");
        }
      } finally {
        if (!cancelled) {
          setDesaLoading(false);
        }
      }
    }, 250);

    return () => {
      cancelled = true;
      window.clearTimeout(timeoutId);
    };
  }, [desaSearch, selectedDesa]);

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0] ?? null;
    setSelectedFile(file);
  }

  function selectDesa(option: DesaOption) {
    setSelectedDesa(option);
    setDesaIdValue(option.id);
    setDesaSearch(formatDesaSearchValue(option));
    setIsDesaPickerOpen(false);
    setVersionHistory(null);
    setVersionHistoryError(null);
    setVersionHistoryLoading(true);
  }

  function clearSelectedDesa() {
    setSelectedDesa(null);
    setDesaIdValue("");
    setDesaSearch("");
    setIsDesaPickerOpen(true);
    setVersionHistory(null);
    setVersionHistoryError(null);
    setVersionHistoryLoading(false);
  }

  const runPipeline = useCallback(async () => {
    setLoading(true);
    setError(null);
    setResult(null);
    setSubmittedReview(null);

    try {
      let data: PipelineResult;

      if (mode === "upload") {
        if (!selectedFile) {
          setError("Pilih file terlebih dahulu.");
          return;
        }

        const formData = new FormData();
        formData.append("file", selectedFile);
        if (desaIdValue.trim()) formData.append("desaId", desaIdValue.trim());
        if (useAiMapping) formData.append("useAiMapping", "true");

        const res = await fetch("/api/internal-admin/intake", {
          method: "POST",
          headers: { Accept: "application/json" },
          body: formData,
        });
        const payload = await readJsonLikeResponse<PipelineResult>(res);

        if (!res.ok || "error" in payload) {
          setError(getPayloadError(payload, "Pipeline gagal."));
          return;
        }

        data = payload;
      } else {
        if (!textValue.trim()) {
          setError("Teks wajib diisi.");
          return;
        }

        const res = await fetch("/api/internal-admin/intake", {
          method: "POST",
          headers: {
            Accept: "application/json",
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            text: textValue,
            ...(desaIdValue.trim() ? { desaId: desaIdValue.trim() } : {}),
            ...(useAiMapping ? { useAiMapping: true } : {}),
          }),
        });
        const payload = await readJsonLikeResponse<PipelineResult>(res);

        if (!res.ok || "error" in payload) {
          setError(getPayloadError(payload, "Pipeline gagal."));
          return;
        }

        data = payload;
      }

      setResult(data);
      setStep("result");
    } catch {
      setError("Koneksi bermasalah. Coba lagi.");
    } finally {
      setLoading(false);
    }
  }, [desaIdValue, mode, selectedFile, textValue, useAiMapping]);

  const submitToReview = useCallback(async () => {
    if (!selectedDesa || !desaIdValue.trim()) {
      setError("Pilih desa target dulu sebelum submit ke review internal.");
      return;
    }

    if (result && !result.validation.ok) {
      setError("Masih ada error validasi. Perbaiki dulu sebelum submit ke review.");
      return;
    }

    setSubmittingReview(true);
    setError(null);

    try {
      let payload: SubmitReviewSuccess;

      if (mode === "upload") {
        if (!selectedFile) {
          setError("File asli tidak ditemukan lagi. Pilih ulang file lalu jalankan pipeline.");
          return;
        }

        const formData = new FormData();
        formData.append("file", selectedFile);
        formData.append("desaId", desaIdValue.trim());
        if (useAiMapping) formData.append("useAiMapping", "true");
        if (reviewTitle.trim()) {
          formData.append("title", reviewTitle.trim());
        }

        const res = await fetch("/api/internal-admin/intake/submit-review", {
          method: "POST",
          headers: { Accept: "application/json" },
          body: formData,
        });
        const responsePayload = await readJsonLikeResponse<SubmitReviewSuccess>(res);

        if (!res.ok || "error" in responsePayload) {
          setError(getPayloadError(responsePayload, "Submit ke review gagal."));
          return;
        }

        payload = responsePayload;
      } else {
        if (!textValue.trim()) {
          setError("Teks wajib diisi.");
          return;
        }

        const res = await fetch("/api/internal-admin/intake/submit-review", {
          method: "POST",
          headers: {
            Accept: "application/json",
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            text: textValue,
            desaId: desaIdValue.trim(),
            ...(useAiMapping ? { useAiMapping: true } : {}),
            ...(reviewTitle.trim() ? { title: reviewTitle.trim() } : {}),
          }),
        });
        const responsePayload = await readJsonLikeResponse<SubmitReviewSuccess>(res);

        if (!res.ok || "error" in responsePayload) {
          setError(getPayloadError(responsePayload, "Submit ke review gagal."));
          return;
        }

        payload = responsePayload;
      }

      setSubmittedReview(payload);
      void fetchHistory();
    } catch {
      setError("Koneksi bermasalah. Coba lagi.");
    } finally {
      setSubmittingReview(false);
    }
  }, [
    desaIdValue,
    fetchHistory,
    mode,
    result,
    reviewTitle,
    selectedDesa,
    selectedFile,
    textValue,
    useAiMapping,
  ]);

  return (
    <div className="space-y-5">
      <div className="notice-card notice-info flex items-start gap-2 text-xs">
        <Info size={14} className="mt-0.5 shrink-0" aria-hidden />
        <span>
          <strong>Halaman ini untuk menyiapkan bahan review</strong>. Di sini Anda cukup membuat
          preview dan mengirimkannya ke antrean review. Publish final tetap dilakukan nanti dari
          halaman review data, bukan dari halaman intake ini.
        </span>
      </div>

      <WorkflowGuide step={step} submittedReview={submittedReview} />

      {step === "input" && (
        <div className="lux-panel space-y-5 p-5 sm:p-6">
          <div className="space-y-1">
            <p className="eyebrow text-[10px]">Langkah 1 · Siapkan bahan</p>
            <h2 className="text-[18px] font-semibold tracking-tight text-slate-900 sm:text-[20px]">
              Input dokumen / teks
            </h2>
            <p className="text-xs text-slate-500">
              Unggah file atau tempel teks. Sistem akan menyiapkan preview otomatis agar Anda bisa
              cek dulu sebelum mengirimnya ke antrean review.
            </p>
          </div>

          <div className="inline-flex rounded-[1.2rem] bg-slate-100 p-1">
            <button
              type="button"
              onClick={() => setMode("upload")}
              className={`inline-flex items-center gap-1.5 rounded-[1rem] px-4 py-2 text-xs font-semibold transition-all ${
                mode === "upload"
                  ? "bg-white text-slate-900 shadow"
                  : "text-slate-500 hover:text-slate-700"
              }`}
            >
              <Upload size={13} aria-hidden /> Upload file
            </button>
            <button
              type="button"
              onClick={() => setMode("paste")}
              className={`inline-flex items-center gap-1.5 rounded-[1rem] px-4 py-2 text-xs font-semibold transition-all ${
                mode === "paste"
                  ? "bg-white text-slate-900 shadow"
                  : "text-slate-500 hover:text-slate-700"
              }`}
            >
              <FileText size={13} aria-hidden /> Tempel teks
            </button>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-slate-50/80 p-4">
            <div className="flex items-start justify-between gap-3">
              <div className="space-y-1">
                <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-500">
                  Bantuan AI (opsional)
                </p>
                <p className="text-sm font-semibold text-slate-900">
                  Pakai AI untuk foto, scan, atau dokumen yang sulit dibaca parser lokal
                </p>
                <p className="text-xs leading-relaxed text-slate-600">
                  Parser lokal tetap dicoba lebih dulu. Jika AI gagal, limit, atau key tidak ada,
                  sistem tetap jujur dan mengarahkan Anda kembali ke parser lokal atau paste teks.
                </p>
              </div>
              <label className="inline-flex shrink-0 cursor-pointer items-center gap-2 rounded-full border border-slate-200 bg-white px-3 py-2 text-xs font-semibold text-slate-700">
                <input
                  type="checkbox"
                  checked={useAiMapping}
                  onChange={(e) => setUseAiMapping(e.target.checked)}
                  className="h-4 w-4 rounded border-slate-300 text-indigo-600 focus:ring-indigo-500"
                />
                Coba AI
              </label>
            </div>
          </div>

          {mode === "upload" && (
            <div className="space-y-2">
              <label className="field-label text-xs">
                File (DOCX, XLSX, PDF, TXT, CSV, JPG, PNG - maks 10 MB)
              </label>
              <input
                ref={fileRef}
                type="file"
                accept=".docx,.xlsx,.pdf,.txt,.csv,.jpg,.jpeg,.png,.webp,application/pdf,application/vnd.openxmlformats-officedocument.wordprocessingml.document,application/vnd.ms-excel,text/plain,text/csv,image/jpeg,image/png,image/webp"
                onChange={handleFileChange}
                className="field-lux text-sm"
              />
              {selectedFile && (
                <p className="text-xs text-slate-500">
                  Dipilih:{" "}
                  <span className="font-medium text-slate-700">{selectedFile.name}</span>{" "}
                  ({formatBytes(selectedFile.size)})
                </p>
              )}
              <p className="text-[11px] text-slate-400">
                Contoh file uji upload tersedia di `public/testing/intake/`, termasuk
                `contoh-perubahan-lengkap.docx` dan `contoh-perubahan-lengkap.pdf`.
              </p>
              <p className="text-[11px] text-slate-500">
                Untuk foto atau scan, aktifkan `Coba AI` agar sistem mencoba pembacaan visual.
              </p>
            </div>
          )}

          {mode === "paste" && (
            <div className="space-y-2">
              <label className="field-label text-xs">Teks yang akan diproses</label>
              <textarea
                value={textValue}
                onChange={(e) => setTextValue(e.target.value)}
                rows={8}
                maxLength={50000}
                className="textarea-lux text-sm font-mono"
                placeholder={"Salin teks dari dokumen di sini...\n\nContoh yang bisa dipetakan:\nWebsite: https://desaku.go.id\nJumlah Penduduk: 2.500 jiwa\nTahun Data: 2024\nKategori Desa: Mandiri"}
              />
              <p className="text-right text-[11px] text-slate-400">{textValue.length} / 50.000</p>
              <div className="flex flex-wrap gap-2">
                <button
                  type="button"
                  onClick={() => setTextValue(SAMPLE_VALID_TEXT)}
                  className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-[11px] font-semibold text-slate-600 hover:bg-slate-50"
                >
                  Isi contoh valid
                </button>
                <button
                  type="button"
                  onClick={() => setTextValue(SAMPLE_COMPLEX_TEXT)}
                  className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-[11px] font-semibold text-slate-600 hover:bg-slate-50"
                >
                  Isi contoh lengkap
                </button>
                <button
                  type="button"
                  onClick={() => setTextValue(buildSampleDiffText(selectedDesa))}
                  className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-[11px] font-semibold text-slate-600 hover:bg-slate-50"
                >
                  Isi contoh diff
                </button>
              </div>
              <p className="text-[11px] text-slate-400">
                `Isi contoh diff` paling berguna setelah desa dipilih, supaya hasil intake bisa langsung dibandingkan.
              </p>
            </div>
          )}

          <div className="space-y-2">
            <label className="field-label text-xs">Pilih desa (opsional - untuk diff)</label>
            {(!selectedDesa || isDesaPickerOpen) && (
              <div className="relative">
                <Search
                  size={14}
                  className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"
                />
                <input
                  type="text"
                  value={desaSearch}
                  onFocus={() => setIsDesaPickerOpen(true)}
                  onChange={(e) => {
                    const nextValue = e.target.value;
                    setDesaSearch(nextValue);
                    setIsDesaPickerOpen(true);
                    if (
                      selectedDesa &&
                      nextValue !== formatDesaSearchValue(selectedDesa)
                    ) {
                      setSelectedDesa(null);
                      setDesaIdValue("");
                    }
                  }}
                  className="field-lux pl-12 pr-4 text-sm"
                  placeholder="Ketik nama desa, kecamatan, atau kabupaten"
                />
              </div>
            )}
            <p className="text-[11px] text-slate-400">
              Admin tidak perlu hafal ID desa. Cukup pilih dari daftar hasil pencarian.
            </p>
            <p className="text-[11px] text-slate-500">
              Jika desa belum dipilih, hasil intake hanya menjadi preview lepas dan tidak
              terhubung ke data desa mana pun.
            </p>

            {selectedDesa ? (
              <div className="flex items-center justify-between gap-3 rounded-2xl border border-slate-100 bg-slate-50 px-4 py-3">
                <div className="min-w-0">
                  <p className="text-[11px] font-semibold uppercase tracking-wide text-slate-500">
                    Desa terpilih
                  </p>
                  <p className="truncate text-sm font-semibold text-slate-900">
                    {selectedDesa.nama}
                  </p>
                  <p className="truncate text-[11px] text-slate-500">
                    {selectedDesa.kecamatan}, {selectedDesa.kabupaten}, {selectedDesa.provinsi}
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    setDesaSearch("");
                    setIsDesaPickerOpen(true);
                  }}
                  className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-[11px] font-semibold text-slate-600 hover:bg-slate-50"
                >
                  Ganti
                </button>
              </div>
            ) : null}

            {isDesaPickerOpen && (
              <div className="rounded-2xl border border-slate-100 bg-white">
                {desaLoading ? (
                  <div className="px-4 py-3 text-xs text-slate-500">Memuat daftar desa...</div>
                ) : desaLoadError ? (
                  <div className="px-4 py-3 text-xs text-rose-600">{desaLoadError}</div>
                ) : desaOptions.length === 0 ? (
                  <div className="px-4 py-3 text-xs text-slate-500">Tidak ada desa yang cocok.</div>
                ) : (
                  <div className="max-h-60 overflow-y-auto p-2">
                    {desaOptions.map((option) => (
                      <button
                        key={option.id}
                        type="button"
                        onClick={() => selectDesa(option)}
                        className={`flex w-full items-start gap-3 rounded-xl px-3 py-2.5 text-left transition ${
                          option.id === desaIdValue
                            ? "bg-indigo-50 text-indigo-900"
                            : "text-slate-700 hover:bg-slate-50"
                        }`}
                      >
                        <span className="mt-0.5 inline-flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-slate-100 text-slate-500">
                          <MapPin size={13} aria-hidden />
                        </span>
                        <span className="min-w-0">
                          <span className="block truncate text-sm font-semibold">{option.nama}</span>
                          <span className="block truncate text-[11px] text-slate-500">
                            {option.kecamatan}, {option.kabupaten}, {option.provinsi}
                          </span>
                        </span>
                      </button>
                    ))}
                  </div>
                )}
              </div>
            )}

            {selectedDesa && !isDesaPickerOpen ? (
              <button
                type="button"
                onClick={clearSelectedDesa}
                className="text-left text-[11px] font-semibold text-indigo-600 hover:text-indigo-700"
              >
                Hapus pilihan desa dan lanjutkan tanpa diff
              </button>
            ) : null}
          </div>

          {error && (
            <div className="notice-card notice-danger flex items-start gap-2 text-sm">
              <AlertTriangle size={14} className="mt-0.5 shrink-0" aria-hidden />
              {error}
            </div>
          )}

          <button
            type="button"
            onClick={runPipeline}
            disabled={loading}
            className="btn-lux btn-lux-primary flex w-full items-center gap-2 text-sm sm:w-auto"
          >
            {loading ? (
              <>
                <span className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                Memproses...
              </>
            ) : (
              <>
                <Sparkles size={14} aria-hidden />
                Jalankan pipeline
              </>
            )}
          </button>
        </div>
      )}

      {step === "result" && result && (
        <div className="space-y-4">
          {(() => {
            const mappingStatus = getMappingStatus(result);
            const validationStatus = getValidationStatus(result);
            const reviewStatus = getReviewStatus(result);
            const openAiStatus = getOpenAiStatus(result);

            return (
              <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
                <div className="rounded-2xl border border-slate-100 bg-white p-4">
                  <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-slate-500">
                    Mapping
                  </p>
                  <span
                    className={`mt-2 inline-flex rounded-full px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.16em] ${mappingStatus.className}`}
                  >
                    {mappingStatus.label}
                  </span>
                  <p className="mt-2 text-xs leading-relaxed text-slate-600">{mappingStatus.note}</p>
                </div>
                <div className="rounded-2xl border border-slate-100 bg-white p-4">
                  <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-slate-500">
                    Validasi
                  </p>
                  <span
                    className={`mt-2 inline-flex rounded-full px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.16em] ${validationStatus.className}`}
                  >
                    {validationStatus.label}
                  </span>
                  <p className="mt-2 text-xs leading-relaxed text-slate-600">{validationStatus.note}</p>
                </div>
                <div className="rounded-2xl border border-slate-100 bg-white p-4">
                  <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-slate-500">
                    Status Akhir
                  </p>
                  <span
                    className={`mt-2 inline-flex rounded-full px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.16em] ${reviewStatus.className}`}
                  >
                    {reviewStatus.label}
                  </span>
                  <p className="mt-2 text-xs leading-relaxed text-slate-600">{reviewStatus.note}</p>
                  <p className="mt-2 text-[11px] font-semibold text-slate-500">
                    Belum bisa dipublish dari layar ini.
                  </p>
                </div>
                <div className="rounded-2xl border border-slate-100 bg-white p-4">
                  <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-slate-500">
                    Bantuan AI
                  </p>
                  <span
                    className={`mt-2 inline-flex rounded-full px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.16em] ${openAiStatus.className}`}
                  >
                    {openAiStatus.label}
                  </span>
                  <p className="mt-2 text-xs leading-relaxed text-slate-600">{openAiStatus.note}</p>
                </div>
              </div>
            );
          })()}

          <IntakeDecisionSummary
            result={result}
            selectedDesa={selectedDesa}
            submittedReview={submittedReview}
          />

          <IntakeFieldCoveragePanel result={result} selectedDesa={selectedDesa} />
          <IntakeMappedSummary result={result} />

          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={() => {
                setError(null);
                setStep("input");
              }}
              className="btn-lux btn-lux-secondary text-xs"
            >
              Kembali ke input
            </button>
            <button
              type="button"
              onClick={runPipeline}
              disabled={loading}
              className="btn-lux btn-lux-ghost text-xs"
            >
              <Sparkles size={12} aria-hidden /> Ulangi
            </button>
          </div>

          <div className="notice-card notice-info text-xs">
            <span className="font-semibold">Catatan:</span> {result.guardrailNote}
          </div>

          {error && (
            <div className="notice-card notice-danger flex items-start gap-2 text-sm">
              <AlertTriangle size={14} className="mt-0.5 shrink-0" aria-hidden />
              {error}
            </div>
          )}

          <div className="rounded-[1.5rem] border border-amber-200 bg-amber-50/70 p-4 sm:p-5">
            <div className="space-y-1">
              <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-amber-700">
                Langkah 2 · Cek lalu kirim ke review
              </p>
              <h3 className="text-sm font-semibold text-slate-900 sm:text-base">
                Fokus halaman ini: pastikan hasil otomatisnya masuk akal
              </h3>
              <p className="text-xs leading-relaxed text-slate-600">
                Cek ringkasan, validasi, dan perubahan utama. Jika sudah cukup baik, kirim hasil
                ini ke antrean review. Data publik tetap belum berubah pada tahap ini.
              </p>
            </div>

            <div className="mt-4 grid gap-3 sm:grid-cols-2">
              <div className="rounded-xl border border-sky-200 bg-white p-3">
                <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-sky-700">
                  Yang dicek sekarang
                </p>
                <ul className="mt-2 space-y-1 text-xs leading-relaxed text-slate-700">
                  <li>1. Apakah desa target sudah benar?</li>
                  <li>2. Apakah hasil validasi aman?</li>
                  <li>3. Apakah perubahan utamanya sudah sesuai ekspektasi?</li>
                </ul>
              </div>
              <div className="rounded-xl border border-emerald-200 bg-white p-3">
                <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-emerald-700">
                  Kalau sudah oke
                </p>
                {submittedReview ? (
                  <div className="mt-2 space-y-3 text-xs leading-relaxed text-slate-700">
                    <p>
                      Hasil intake ini sudah masuk ke antrean review sebagai item `PROCESSING`.
                    </p>
                    <div className="rounded-xl border border-emerald-100 bg-emerald-50/70 px-3 py-2">
                      <p className="font-semibold text-emerald-800">{submittedReview.title}</p>
                      <p className="mt-1 text-[11px] text-emerald-700">
                        Dokumen ID: {submittedReview.documentId}
                      </p>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      <Link
                        href={submittedReview.queueUrl}
                        className="btn-lux btn-lux-success text-xs"
                      >
                        Lanjut ke review data
                      </Link>
                      <button
                        type="button"
                        onClick={() => {
                          setError(null);
                          setStep("input");
                        }}
                        className="btn-lux btn-lux-secondary text-xs"
                      >
                        Siapkan intake baru
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="mt-2 space-y-3 text-xs leading-relaxed text-slate-700">
                    <div className="rounded-xl border border-slate-200 bg-slate-50 px-3 py-2">
                      <p className="font-semibold text-slate-800">
                        {selectedDesa ? selectedDesa.nama : "Belum ada desa target"}
                      </p>
                      <p className="mt-1 text-[11px] text-slate-500">
                        {selectedDesa
                          ? "Langkah ini hanya mengirim hasil ke antrean review. Belum publish."
                          : "Pilih desa dulu agar hasil ini punya target review yang jelas."}
                      </p>
                    </div>

                    <div className="space-y-1.5">
                      <label className="field-label text-[11px]">Judul item review (opsional)</label>
                      <input
                        type="text"
                        value={reviewTitle}
                        onChange={(e) => setReviewTitle(e.target.value.slice(0, 200))}
                        placeholder={buildSuggestedReviewTitle({
                          mode,
                          selectedFile,
                          selectedDesa,
                        })}
                        className="field-lux text-sm"
                      />
                    </div>

                    {!selectedDesa ? (
                      <div className="rounded-xl border border-amber-200 bg-amber-50 px-3 py-2 text-[11px] text-amber-700">
                        Tombol kirim review baru aktif setelah desa target dipilih.
                      </div>
                    ) : null}

                    {!result.validation.ok ? (
                      <div className="rounded-xl border border-rose-200 bg-rose-50 px-3 py-2 text-[11px] text-rose-700">
                        Masih ada error validasi. Perbaiki dulu lalu jalankan pipeline lagi sebelum
                        submit ke review.
                      </div>
                    ) : null}

                    {getReviewableContentCount(result) === 0 ? (
                      <div className="rounded-xl border border-amber-200 bg-amber-50 px-3 py-2 text-[11px] text-amber-700">
                        Belum ada hasil yang cukup kuat untuk disimpan ke review. Coba aktifkan AI,
                        pilih file lain, atau tempel teks yang lebih jelas.
                      </div>
                    ) : null}

                    <button
                      type="button"
                      onClick={submitToReview}
                      disabled={
                        !selectedDesa ||
                        !result.validation.ok ||
                        submittingReview ||
                        getReviewableContentCount(result) === 0
                      }
                      className="btn-lux btn-lux-success flex w-full items-center justify-center gap-2 text-xs sm:w-auto"
                    >
                      {submittingReview ? (
                        <>
                          <span className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                          Menyimpan ke review...
                        </>
                      ) : (
                        <>Kirim ke antrean review</>
                      )}
                    </button>
                  </div>
                )}
              </div>
            </div>

            <div className="mt-3 rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs text-slate-600">
              Publish final tidak terjadi di layar ini. Setelah item masuk ke antrean, admin akan
              membuka `Review data`, lalu memilih simpan dulu atau publish final.
            </div>
          </div>

          <SectionCard title="Validasi">
            {result.validation.ok && result.validation.issues.length === 0 ? (
              <div className="flex items-center gap-2 text-sm text-green-700">
                <CheckCircle2 size={14} aria-hidden /> Semua field valid.
              </div>
            ) : (
              <div className="space-y-1.5">
                {result.validation.issues.map((issue, index) => (
                  <div
                    key={index}
                    className={`notice-card flex items-start gap-2 text-xs ${
                      issue.severity === "error" ? "notice-danger" : "notice-warn"
                    }`}
                  >
                    <AlertTriangle size={12} className="mt-0.5 shrink-0" aria-hidden />
                    <div>
                      <span className="font-semibold">{FIELD_LABELS[issue.field]}</span>:{" "}
                      {issue.message}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </SectionCard>

          <SectionCard title={`Bukti Mapping Detail (${result.mapping.source})`} defaultOpen={false}>
            {result.mapping.evidence.length === 0 ? (
              <p className="text-xs italic text-slate-500">
                Tidak ada field yang terdeteksi otomatis.
              </p>
            ) : (
              <div className="space-y-2">
                {result.mapping.evidence.map((evidence, index) => (
                  <div key={index} className="space-y-0.5 rounded-lg border border-slate-100 p-2.5">
                    <div className="flex items-center gap-2">
                      <span className="rounded-full bg-indigo-50 px-2 py-0.5 text-[11px] font-semibold text-indigo-700">
                        {FIELD_LABELS[evidence.field]}
                      </span>
                      <span className="text-[10px] italic text-slate-400">{evidence.rule}</span>
                    </div>
                    <p className="font-mono text-xs text-slate-700">
                      {String(result.mapping.fields[evidence.field] ?? "-")}
                    </p>
                    <p className="truncate text-[10px] italic text-slate-400" title={evidence.matchedText}>
                      Bukti: &ldquo;{evidence.matchedText}&rdquo;
                    </p>
                  </div>
                ))}
              </div>
            )}
            {result.mapping.unmatched.length > 0 ? (
              <div className="mt-2 text-xs text-slate-500">
                <span className="font-medium">Belum terdeteksi:</span>{" "}
                {result.mapping.unmatched.map((field) => FIELD_LABELS[field]).join(", ")}
              </div>
            ) : null}
          </SectionCard>

          {result.versionCandidate ? (
            <SectionCard title="Calon Versi Publik">
              <div className="space-y-3 text-xs text-slate-700">
                <div className="rounded-xl border border-sky-100 bg-sky-50/70 px-3 py-2.5">
                  <p className="font-semibold text-sky-900">
                    Snapshot ini siap dibawa ke review internal, belum menjadi data publik.
                  </p>
                  <p className="mt-1 text-[11px] text-sky-800">
                    Jika nanti dipublikasikan, calon versi ini akan menjadi dasar versi publik baru
                    untuk desa terpilih.
                  </p>
                </div>

                <div className="grid gap-3 sm:grid-cols-3">
                  <div className="rounded-xl border border-slate-200 bg-slate-50 px-3 py-2">
                    <p className="text-[10px] uppercase tracking-[0.14em] text-slate-500">
                      Status
                    </p>
                    <p className="mt-1 font-semibold text-slate-900">
                      {result.versionCandidate.status === "PUBLISHED"
                        ? "Sudah dipublish"
                        : "Siap review"}
                    </p>
                  </div>
                  <div className="rounded-xl border border-slate-200 bg-slate-50 px-3 py-2">
                    <p className="text-[10px] uppercase tracking-[0.14em] text-slate-500">
                      Field berubah
                    </p>
                    <p className="mt-1 font-semibold text-slate-900">
                      {result.versionCandidate.changedFields.length} field
                    </p>
                  </div>
                  <div className="rounded-xl border border-slate-200 bg-slate-50 px-3 py-2">
                    <p className="text-[10px] uppercase tracking-[0.14em] text-slate-500">
                      Dibentuk
                    </p>
                    <p className="mt-1 font-semibold text-slate-900">
                      {formatDateTime(result.versionCandidate.createdAt)}
                    </p>
                  </div>
                </div>

                <div className="space-y-2">
                  {result.versionCandidate.changedFields.map((field) => (
                    <div
                      key={field}
                      className="grid gap-2 rounded-xl border border-slate-100 bg-white px-3 py-2.5 sm:grid-cols-2"
                    >
                      <div>
                        <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-slate-500">
                          Sebelum
                        </p>
                        <p className="mt-1 text-[11px] text-slate-700">
                          {formatDiffValue(result.versionCandidate?.baseSnapshot[field])}
                        </p>
                      </div>
                      <div>
                        <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-slate-500">
                          Sesudah
                        </p>
                        <p className="mt-1 text-[11px] font-medium text-slate-900">
                          {formatDiffValue(result.versionCandidate?.proposedSnapshot[field])}
                        </p>
                      </div>
                      <div className="sm:col-span-2">
                        <span className="rounded-full bg-sky-50 px-2 py-0.5 text-[10px] font-semibold text-sky-700">
                          {FIELD_LABELS[field]}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </SectionCard>
          ) : null}

          {result.diff ? (
            <SectionCard
              title={`Diff (${result.diff.addedCount + result.diff.updatedCount + result.diff.removedCount} perubahan)`}
            >
              {!result.diff.hasChanges ? (
                <p className="text-xs italic text-slate-500">
                  Tidak ada perubahan dari data saat ini.
                </p>
              ) : (
                <div className="space-y-3">
                  {result.diff.entries
                    .filter((entry) => entry.deltaType !== "unchanged")
                    .map((entry, index) => (
                      <div key={index} className="rounded-2xl border border-slate-100 bg-white p-3 sm:p-4">
                        <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
                          <div>
                            <p className="text-sm font-semibold text-slate-900">
                              {FIELD_LABELS[entry.field]}
                            </p>
                            <p className="text-[11px] text-slate-500">
                              Bandingkan nilai saat ini dengan hasil intake terbaru.
                            </p>
                          </div>
                          <span
                            className={`rounded-full px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.16em] ${diffBadgeClasses(entry.deltaType)}`}
                          >
                            {DELTA_ICONS[entry.deltaType]}
                          </span>
                        </div>
                        <div className="grid gap-3 sm:grid-cols-[1fr_auto_1fr] sm:items-stretch">
                          <div className="rounded-xl border border-rose-100 bg-rose-50/60 p-3">
                            <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-rose-700">
                              Sebelum
                            </p>
                            <p
                              className="mt-1 break-words text-sm text-slate-700"
                              title={formatDiffValue(entry.previous)}
                            >
                              {formatDiffValue(entry.previous)}
                            </p>
                          </div>
                          <div className="flex items-center justify-center text-xs font-semibold text-slate-400">
                            Menjadi
                          </div>
                          <div className="rounded-xl border border-emerald-100 bg-emerald-50/60 p-3">
                            <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-emerald-700">
                              Sesudah
                            </p>
                            <p
                              className="mt-1 break-words text-sm font-medium text-slate-900"
                              title={formatDiffValue(entry.next)}
                            >
                              {formatDiffValue(entry.next)}
                            </p>
                          </div>
                        </div>
                        {entry.changed ? (
                          <p className="mt-3 text-[11px] text-slate-500">{entry.changed}</p>
                        ) : null}
                      </div>
                    ))}
                </div>
              )}
            </SectionCard>
          ) : (
            <SectionCard title="Diff">
              <p className="text-xs italic text-slate-400">
                Belum ada desa target. Pilih desa dari daftar jika ingin membandingkan hasil intake
                ini dengan data desa yang sudah ada.
              </p>
              <p className="mt-2 text-xs text-slate-500">
                Tanpa desa terpilih, preview ini tidak akan mengganti, membandingkan, atau
                mengarahkan perubahan ke desa mana pun.
              </p>
            </SectionCard>
          )}

          <SectionCard title="Detail parser lokal & AI" defaultOpen={false}>
            <IntakeAiStatusPanel result={result} embedded />

            <div className="rounded-2xl border border-slate-100 bg-slate-50/70 p-3">
              <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-slate-500">
                Metadata ekstraksi
              </p>
              <dl className="mt-3 grid grid-cols-2 gap-x-4 gap-y-2 text-xs sm:grid-cols-3">
                <div>
                  <dt className="text-slate-500">Parser</dt>
                  <dd className="font-medium text-slate-900">{result.extract.parser}</dd>
                </div>
                {result.extract.fileName ? (
                  <>
                    <div>
                      <dt className="text-slate-500">File</dt>
                      <dd className="font-medium text-slate-900">{result.extract.fileName}</dd>
                    </div>
                    <div>
                      <dt className="text-slate-500">Size</dt>
                      <dd className="font-medium text-slate-900">
                        {formatBytes(result.extract.size)}
                      </dd>
                    </div>
                  </>
                ) : null}
                {result.extract.pages ? (
                  <div>
                    <dt className="text-slate-500">Pages</dt>
                    <dd className="font-medium text-slate-900">{result.extract.pages}</dd>
                  </div>
                ) : null}
                {result.extract.sheets ? (
                  <div>
                    <dt className="text-slate-500">Sheets</dt>
                    <dd className="font-medium text-slate-900">
                      {result.extract.sheets.join(", ")}
                    </dd>
                  </div>
                ) : null}
                <div>
                  <dt className="text-slate-500">Durasi</dt>
                  <dd className="font-medium text-slate-900">{result.extract.durationMs} ms</dd>
                </div>
                {result.extract.truncated ? (
                  <div className="col-span-full">
                    <dt className="text-slate-500">Info</dt>
                    <dd className="font-medium text-slate-600">
                      Teks dipotong ({result.extract.parser})
                    </dd>
                  </div>
                ) : null}
              </dl>
            </div>
          </SectionCard>
        </div>
      )}

      <DesaVersionHistoryPanel
        versionHistory={versionHistory}
        loading={versionHistoryLoading}
        error={versionHistoryError}
        selectedDesa={selectedDesa}
      />
      <IntakeHistoryPanel history={history} loading={historyLoading} error={historyError} />
    </div>
  );
}
