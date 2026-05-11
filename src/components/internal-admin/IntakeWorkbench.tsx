"use client";

import Link from "next/link";
import { useCallback, useEffect, useRef, useState } from "react";
import { AlertTriangle, ArrowLeft, ChevronRight, Info, RotateCw, Send, Sparkles } from "lucide-react";

import type {
  PipelineResult,
  SubmitReviewSuccess,
  IntakeStep,
  IntakeMode,
  DesaOption,
  IntakeHistorySubmission,
  DesaVersionEntry,
} from "./intake/types";

import {
  INTAKE_COPY,
  buildSuggestedReviewTitle,
  buildQueueFocusHref,
} from "./intake/constants";
import { formatBytes, formatDateTime } from "./intake/utils";

import { IntakeSection } from "./intake/IntakeSection";
import { useIntakeHistory, useVersionHistory } from "./intake/hooks";

import {
  getMappingStatus,
  getReviewStatus,
  getOpenAiStatus,
  getReviewableContentCount,
} from "./intake/IntakeStatusHelpers";

// New v2 result components
import { IntakeSourceRibbon }    from "./intake/IntakeSourceRibbon";
import { IntakeDiffTheatre }     from "./intake/IntakeDiffTheatre";
import { IntakeCoverageLens }    from "./intake/IntakeCoverageLens";
import { IntakeValidationPanel } from "./intake/IntakeValidationPanel";
import { IntakeDetectedGallery } from "./intake/IntakeDetectedGallery";
import { IntakeInfoStrip }       from "./intake/IntakeInfoStrip";
import { IntakeInspectorDrawer } from "./intake/IntakeInspectorDrawer";

// ============================================================================
// Error tone helpers
// ============================================================================

type ErrorTone = "info" | "warn" | "danger";

interface ErrorState {
  message: string;
  tone: ErrorTone;
}

function classifyApiError(payload: {
  error?: string;
  meta?: { aiOffForBinary?: boolean; openaiStatus?: string };
}): ErrorState {
  const meta = payload.meta ?? {};
  if (meta.aiOffForBinary) {
    return { message: payload.error ?? "Gambar belum bisa dibaca tanpa AI.", tone: "info" };
  }
  if (meta.openaiStatus === "quota_limited" || meta.openaiStatus === "rate_limited") {
    return {
      message: payload.error ?? "Layanan AI sedang sibuk. Coba lagi atau pakai parser lokal.",
      tone: "warn",
    };
  }
  return { message: payload.error ?? "Terjadi kesalahan.", tone: "danger" };
}

function noticeClassForTone(tone: ErrorTone): string {
  if (tone === "info") return "notice-card notice-info";
  if (tone === "warn") return "notice-card notice-warn";
  return "notice-card notice-danger";
}

function formatSubmissionStatus(status: string) {
  switch (status) {
    case "WAITING_VERIFIED_APPROVAL": return "Menunggu persetujuan";
    case "PROCESSING":  return "Perlu review internal";
    case "PUBLISHED":   return "Sudah dipublikasikan";
    case "FAILED":      return "Perlu unggah ulang";
    default:            return status;
  }
}

// ============================================================================
// Main Component
// ============================================================================

export default function IntakeWorkbench() {
  const [step, setStep] = useState<IntakeStep>("input");
  const [mode, setMode] = useState<IntakeMode>("upload");
  const [textValue, setTextValue] = useState("");
  const [useAiMapping, setUseAiMapping] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [selectedDesa, setSelectedDesa] = useState<DesaOption | null>(null);
  const [desaSearch, setDesaSearch] = useState("");
  const [result, setResult] = useState<PipelineResult | null>(null);
  const [reviewTitle, setReviewTitle] = useState("");
  const [submittedReview, setSubmittedReview] = useState<SubmitReviewSuccess | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<ErrorState | null>(null);
  const [desaOptions, setDesaOptions] = useState<DesaOption[]>([]);
  const [desaLoading, setDesaLoading] = useState(false);
  const [desaFocused, setDesaFocused] = useState(false);
  const [inspectorOpen, setInspectorOpen] = useState(false);
  const desaAbortRef    = useRef<AbortController | null>(null);
  const desaDebounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const intakeHistory  = useIntakeHistory();
  const versionHistory = useVersionHistory(selectedDesa?.id ?? null);
  const reviewSectionRef = useRef<HTMLDivElement>(null);

  // ── Handlers ────────────────────────────────────────────────────────────────

  const fetchDesaOptions = useCallback(async (query: string) => {
    desaAbortRef.current?.abort();
    const ctrl = new AbortController();
    desaAbortRef.current = ctrl;
    setDesaLoading(true);
    try {
      const suffix = query ? `?q=${encodeURIComponent(query)}` : "";
      const res = await fetch(`/api/internal-admin/desa-options${suffix}`, { signal: ctrl.signal });
      const data = await res.json();
      if (data.desa) setDesaOptions(data.desa);
    } catch (err) {
      if ((err as Error)?.name === "AbortError") return;
    } finally {
      setDesaLoading(false);
    }
  }, []);

  const handleSearchDesa = useCallback((query: string) => {
    if (desaDebounceRef.current) clearTimeout(desaDebounceRef.current);
    desaDebounceRef.current = setTimeout(() => void fetchDesaOptions(query), 300);
  }, [fetchDesaOptions]);

  // Warm DB connection on mount so first interaction is instant
  // eslint-disable-next-line react-hooks/set-state-in-effect
  useEffect(() => { void fetchDesaOptions(""); }, [fetchDesaOptions]);

  const handleSelectDesa = useCallback((desa: DesaOption) => {
    setSelectedDesa(desa);
    setDesaSearch(`${desa.nama} - ${desa.kecamatan}, ${desa.kabupaten}`);
  }, []);

  const handleRunPipeline = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      let body: BodyInit;
      let headers: HeadersInit = { Accept: "application/json" };

      if (mode === "upload") {
        if (!selectedFile) { setError({ message: "Pilih file terlebih dahulu", tone: "danger" }); return; }
        body = new FormData();
        body.append("file", selectedFile);
        if (selectedDesa) body.append("desaId", selectedDesa.id);
        if (useAiMapping) body.append("useAiMapping", "true");
      } else {
        if (!textValue.trim()) { setError({ message: "Teks wajib diisi", tone: "danger" }); return; }
        headers = { Accept: "application/json", "Content-Type": "application/json" };
        body = JSON.stringify({
          text: textValue,
          ...(selectedDesa ? { desaId: selectedDesa.id } : {}),
          ...(useAiMapping ? { useAiMapping: true } : {}),
        });
      }

      const res  = await fetch("/api/internal-admin/intake", { method: "POST", headers, body });
      const data = await res.json();
      if (data.error) { setError(classifyApiError(data)); return; }
      setResult(data);
      setStep("result");
      void intakeHistory.refetch();
    } catch {
      setError({ message: "Koneksi bermasalah", tone: "danger" });
    } finally {
      setLoading(false);
    }
  }, [mode, selectedFile, textValue, selectedDesa, useAiMapping, intakeHistory]);

  const handleSubmitReview = useCallback(async () => {
    if (!selectedDesa || !result) return;
    if (!result.validation.ok) { setError({ message: "Validasi belum lolos", tone: "danger" }); return; }
    setLoading(true);
    setError(null);
    try {
      let body: BodyInit;
      let headers: HeadersInit = { Accept: "application/json" };
      if (mode === "upload" && selectedFile) {
        body = new FormData();
        body.append("file", selectedFile);
        body.append("desaId", selectedDesa.id);
        if (useAiMapping) body.append("useAiMapping", "true");
        if (reviewTitle.trim()) body.append("title", reviewTitle.trim());
      } else {
        headers = { Accept: "application/json", "Content-Type": "application/json" };
        body = JSON.stringify({
          text: textValue,
          desaId: selectedDesa.id,
          ...(useAiMapping ? { useAiMapping: true } : {}),
          ...(reviewTitle.trim() ? { title: reviewTitle.trim() } : {}),
        });
      }
      const res  = await fetch("/api/internal-admin/intake/submit-review", { method: "POST", headers, body });
      const data = await res.json();
      if (data.error) { setError(classifyApiError(data)); return; }
      setSubmittedReview(data);
      void intakeHistory.refetch();
    } catch {
      setError({ message: "Submit gagal", tone: "danger" });
    } finally {
      setLoading(false);
    }
  }, [mode, selectedFile, textValue, selectedDesa, useAiMapping, reviewTitle, result, intakeHistory]);

  const handleContinueReview = useCallback(() => {
    reviewSectionRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
  }, []);

  const handleBackToInput = useCallback(() => {
    setStep("input");
    setResult(null);
    setError(null);
    setSubmittedReview(null);
    setInspectorOpen(false);
  }, []);

  // ── Computed ─────────────────────────────────────────────────────────────────

  const canSubmit = Boolean(
    selectedDesa && result?.validation.ok && !submittedReview && result && getReviewableContentCount(result) > 0
  );

  // ── Render ───────────────────────────────────────────────────────────────────

  return (
    <>
      {/* ── Sticky action header (result step only) ─────────────────────────── */}
      {step === "result" && result && (
        <header className="sticky top-0 z-40 glass" style={{ borderRadius: 0 }}>
          <div className="max-w-[1240px] mx-auto px-4 sm:px-6 py-3 flex items-center gap-3 sm:gap-4">
            {/* Breadcrumb */}
            <div className="hidden sm:flex items-center gap-2 text-[12px] text-slate-500 min-w-0">
              <span className="font-semibold text-slate-900">PantauDesa</span>
              <ChevronRight size={10} aria-hidden />
              <span>Admin</span>
              <ChevronRight size={10} aria-hidden />
              <span className="text-slate-900 font-medium truncate">Intake workbench</span>
            </div>

            {/* Workflow dots */}
            <div className="hidden lg:flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white/60 text-[11px] text-slate-500"
              style={{ boxShadow: "inset 0 0 0 1px rgba(15,23,42,0.06)" }}>
              <span className="w-1.5 h-1.5 rounded-full bg-[#1E1B4B]" />
              <span className="w-1.5 h-1.5 rounded-full bg-[#1E1B4B]" />
              <span className="w-1.5 h-1.5 rounded-full bg-slate-200" />
              <span className="w-1.5 h-1.5 rounded-full bg-slate-200" />
              <span className="ml-1">Langkah <span className="font-semibold text-slate-900">2</span> · Cek hasil</span>
            </div>

            <div className="flex-1" />

            {/* Actions */}
            <button
              type="button"
              onClick={handleBackToInput}
              className="btn-lux btn-lux-ghost text-xs inline-flex items-center gap-1.5"
            >
              <ArrowLeft size={13} aria-hidden /> <span className="hidden sm:inline">Kembali ke input</span><span className="sm:hidden">Kembali</span>
            </button>
            <button
              type="button"
              onClick={handleRunPipeline}
              disabled={loading}
              className="btn-lux btn-lux-secondary text-xs inline-flex items-center gap-1.5"
            >
              <RotateCw size={13} aria-hidden /> <span className="hidden sm:inline">Ulangi pipeline</span><span className="sm:hidden">Ulangi</span>
            </button>
            <button
              type="button"
              onClick={handleContinueReview}
              disabled={!canSubmit || loading}
              className="btn-lux btn-lux-primary text-xs inline-flex items-center gap-1.5"
            >
              <Send size={13} aria-hidden />
              <span className="hidden sm:inline">Kirim ke review</span>
              <span className="sm:hidden">Review</span>
            </button>
          </div>
        </header>
      )}

      <div className="space-y-4">
        {/* Info notice — input step only */}
        {step === "input" && (
          <div className="notice-card notice-info flex items-start gap-2 text-xs">
            <Info size={14} className="mt-0.5 shrink-0" />
            <span>
              <strong>{INTAKE_COPY.info.title}</strong>. {INTAKE_COPY.info.body}
            </span>
          </div>
        )}

        {/* ── INPUT STEP ─────────────────────────────────────────────────────── */}
        {step === "input" && (
          <div className="rounded-2xl border border-slate-200 bg-white p-4 sm:p-5">
            <p className="eyebrow text-[10px]">Langkah 1 · Siapkan bahan</p>
            <h2 className="mt-1 text-lg font-semibold text-slate-900">Input dokumen / teks</h2>

            {/* Mode toggle */}
            <div className="mt-4 inline-flex rounded-xl bg-slate-100 p-1">
              <button type="button" onClick={() => setMode("upload")}
                className={`rounded-lg px-4 py-2 text-xs font-semibold ${mode === "upload" ? "bg-white text-slate-900 shadow" : "text-slate-500"}`}>
                Upload file
              </button>
              <button type="button" onClick={() => setMode("paste")}
                className={`rounded-lg px-4 py-2 text-xs font-semibold ${mode === "paste" ? "bg-white text-slate-900 shadow" : "text-slate-500"}`}>
                Tempel teks
              </button>
            </div>

            {/* AI toggle */}
            <div className="mt-4 flex items-center justify-between rounded-xl border border-slate-100 bg-slate-50 p-3">
              <div>
                <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-slate-500">{INTAKE_COPY.aiOption.label}</p>
                <p className="mt-1 text-sm font-medium text-slate-900">{INTAKE_COPY.aiOption.checkboxLabel}</p>
              </div>
              <label className="inline-flex cursor-pointer items-center gap-2 rounded-full border border-slate-200 bg-white px-3 py-1.5 text-xs font-semibold text-slate-700">
                <input type="checkbox" checked={useAiMapping} onChange={e => setUseAiMapping(e.target.checked)} className="h-4 w-4 rounded border-slate-300" />
                Aktif
              </label>
            </div>

            {/* File input */}
            {mode === "upload" && (
              <div className="mt-4 space-y-2">
                <label className="field-label text-xs">File (DOCX, XLSX, PDF, TXT, CSV, JPG, PNG · maks 10 MB)</label>
                <input type="file" accept=".docx,.xlsx,.pdf,.txt,.csv,.jpg,.jpeg,.png,.webp"
                  onChange={e => setSelectedFile(e.target.files?.[0] ?? null)} className="field-lux text-sm" />
                {selectedFile && (
                  <p className="text-xs text-slate-500">
                    Dipilih: <span className="font-medium text-slate-700">{selectedFile.name}</span> ({formatBytes(selectedFile.size)})
                  </p>
                )}
              </div>
            )}

            {/* Text input */}
            {mode === "paste" && (
              <div className="mt-4 space-y-2">
                <label className="field-label text-xs">Teks yang akan diproses</label>
                <textarea value={textValue} onChange={e => setTextValue(e.target.value)}
                  rows={6} maxLength={50000} className="textarea-lux text-sm"
                  placeholder="Salin teks dari dokumen di sini..." />
              </div>
            )}

            {/* Desa picker */}
            <div className="mt-4 space-y-2">
              <label className="field-label text-xs">Pilih desa (opsional)</label>
              <div className="relative">
                <input type="text" value={desaSearch}
                  onChange={e => { setDesaSearch(e.target.value); handleSearchDesa(e.target.value); }}
                  onFocus={() => {
                    setDesaFocused(true);
                    if (desaOptions.length === 0 && !desaLoading) void fetchDesaOptions(desaSearch);
                  }}
                  onBlur={() => setTimeout(() => setDesaFocused(false), 150)}
                  className="field-lux text-sm pr-8" placeholder="Ketik nama desa..." />
                {desaLoading && (
                  <span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2">
                    <span className="block h-3.5 w-3.5 animate-spin rounded-full border-2 border-slate-200 border-t-indigo-500" />
                  </span>
                )}
              </div>
              {desaFocused && desaOptions.length > 0 && !selectedDesa && (
                <div className="max-h-48 overflow-y-auto rounded-xl border border-slate-100 bg-white shadow-lux-1">
                  {desaOptions.map(d => (
                    <button key={d.id} type="button" onClick={() => handleSelectDesa(d)}
                      className="flex w-full items-center gap-2 px-4 py-2.5 text-left text-xs hover:bg-slate-50 transition-colors border-b border-slate-50 last:border-b-0">
                      <span className="font-semibold text-slate-900">{d.nama}</span>
                      <span className="text-slate-500">{d.kecamatan}, {d.kabupaten}</span>
                    </button>
                  ))}
                </div>
              )}
              {selectedDesa && (
                <div className="rounded-xl border border-slate-200 bg-white px-4 py-2 text-xs flex items-center">
                  <span className="font-semibold text-slate-900">{selectedDesa.nama}</span>
                  <span className="ml-2 text-slate-500">{selectedDesa.kecamatan}, {selectedDesa.kabupaten}</span>
                  <button type="button" onClick={() => { setSelectedDesa(null); setDesaSearch(""); }}
                    className="ml-4 font-semibold text-indigo-600 hover:underline">Hapus</button>
                </div>
              )}
            </div>

            {/* Error */}
            {error && (
              <div className={`${noticeClassForTone(error.tone)} mt-4 flex items-start gap-2 text-xs`}>
                <AlertTriangle size={14} className="mt-0.5 shrink-0" />
                <span>{error.message}</span>
              </div>
            )}

            {/* Run button */}
            <button type="button" onClick={handleRunPipeline} disabled={loading}
              className="btn-lux btn-lux-primary mt-4 flex w-full items-center justify-center gap-2 sm:w-auto">
              {loading
                ? <><span className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />Memproses...</>
                : <><Sparkles size={14} />Jalankan pipeline</>}
            </button>
          </div>
        )}

        {/* ── RESULT STEP — v2 layout ─────────────────────────────────────────── */}
        {step === "result" && result && (
          <div className="space-y-6">

            {/* 1. Source ribbon */}
            <IntakeSourceRibbon
              result={result}
              selectedDesa={selectedDesa}
              onChangeDesa={() => { setSelectedDesa(null); setDesaSearch(""); }}
            />

            {/* 2. Diff Theatre */}
            <IntakeDiffTheatre result={result} />

            {/* 3. Coverage + Validation (side by side) */}
            {result.fieldCoverage && (
              <div className="grid grid-cols-1 lg:grid-cols-[1.05fr_1fr] gap-5">
                <IntakeCoverageLens result={result} />
                <IntakeValidationPanel
                  result={result}
                  mappingStatus={getMappingStatus(result)}
                  aiStatus={getOpenAiStatus(result)}
                  reviewStatus={getReviewStatus(result)}
                  selectedDesa={selectedDesa}
                />
              </div>
            )}

            {/* 4. Detected-not-publishable gallery */}
            <IntakeDetectedGallery result={result} />

            {/* 5. Compact info strip */}
            <IntakeInfoStrip result={result} onToggleInspector={() => setInspectorOpen(v => !v)} />

            {/* 6. Review submit block (scroll target) */}
            <div ref={reviewSectionRef}
              className="rounded-2xl border border-amber-200 bg-amber-50/50 p-4 sm:p-5">
              <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-amber-700">
                Langkah 2 · Cek lalu kirim ke review
              </p>
              <p className="mt-1 text-sm font-semibold text-slate-900">
                {submittedReview ? (
                  <>Item sudah dikirim. <Link href={submittedReview.queueUrl} className="text-emerald-600 hover:underline">Lanjut ke review data →</Link></>
                ) : (
                  "Pastikan hasil otomatis masuk akal, lalu kirim ke review internal."
                )}
              </p>

              {!submittedReview && (
                <div className="mt-4 space-y-3">
                  {!selectedDesa && (
                    <div className="rounded-lg border border-amber-200 bg-amber-50 px-3 py-2 text-xs text-amber-700">
                      Pilih desa target dulu.
                    </div>
                  )}
                  {result.validation.issues.some(i => i.severity === "error") && (
                    <div className="rounded-lg border border-rose-200 bg-rose-50 px-3 py-2 text-xs text-rose-700">
                      Perbaiki error validasi dulu.
                    </div>
                  )}
                  {getReviewableContentCount(result) === 0 && (
                    <div className="rounded-lg border border-amber-200 bg-amber-50 px-3 py-2 text-xs text-amber-700">
                      Belum ada hasil yang cukup kuat untuk review.
                    </div>
                  )}
                  <input type="text" value={reviewTitle}
                    onChange={e => setReviewTitle(e.target.value.slice(0, 200))}
                    placeholder={buildSuggestedReviewTitle({ mode, selectedFile, selectedDesa })}
                    className="field-lux text-sm" />
                  {error && <div className={`${noticeClassForTone(error.tone)} text-sm`}>{error.message}</div>}
                  <button type="button" onClick={handleSubmitReview} disabled={!canSubmit || loading}
                    className="btn-lux btn-lux-success w-full sm:w-auto">
                    {loading ? "Menyimpan..." : "Kirim ke antrean review"}
                  </button>
                </div>
              )}
              <p className="mt-3 text-xs text-slate-500">Publish final tidak terjadi di layar ini.</p>
            </div>
          </div>
        )}

        {/* ── History + Version History ────────────────────────────────────────── */}
        <IntakeSection title="Riwayat Intake" defaultOpen={false}>
          <IntakeHistoryList
            loading={intakeHistory.loading}
            error={intakeHistory.error}
            submissions={intakeHistory.history?.submissions ?? []}
            storageNote={intakeHistory.history?.storage.note ?? null}
          />
        </IntakeSection>

        <IntakeSection title="Riwayat Versi Desa" defaultOpen={false}>
          <DesaVersionHistoryList
            desaName={selectedDesa?.nama ?? null}
            loading={versionHistory.loading}
            error={versionHistory.error}
            versions={versionHistory.versionHistory?.versions ?? []}
            storageNote={versionHistory.versionHistory?.storage.note ?? null}
          />
        </IntakeSection>
      </div>

      {/* ── Inspector Drawer (fixed bottom, result step only) ────────────────── */}
      {step === "result" && result && (
        <IntakeInspectorDrawer result={result} open={inspectorOpen} onToggle={() => setInspectorOpen(v => !v)} />
      )}
    </>
  );
}

// ============================================================================
// Sub-components (history lists)
// ============================================================================

function IntakeHistoryList({ loading, error, submissions, storageNote }: {
  loading: boolean;
  error: string | null;
  submissions: IntakeHistorySubmission[];
  storageNote: string | null;
}) {
  if (loading) return <p className="text-xs text-slate-500">Memuat riwayat intake...</p>;
  if (error) return <p className="text-xs text-slate-500">Belum bisa memuat riwayat: {error}</p>;
  if (submissions.length === 0) return <p className="text-xs text-slate-500">Belum ada submission intake yang tercatat.</p>;

  return (
    <div className="space-y-3">
      {storageNote && <p className="text-[11px] text-slate-500">{storageNote}</p>}
      <div className="flex items-center justify-between gap-3">
        <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-slate-500">Shortcut terbaru</p>
        <Link href="/internal-admin/documents" className="text-[11px] font-semibold text-sky-700 hover:underline">
          Buka antrean review
        </Link>
      </div>
      <ul className="space-y-2">
        {submissions.slice(0, 5).map(item => (
          <li key={item.id}>
            <Link
              href={buildQueueFocusHref({ status: item.status, documentId: item.id })}
              className="group block rounded-xl border border-slate-200 bg-white px-3 py-3 transition hover:border-emerald-200 hover:bg-emerald-50/40"
            >
              <div className="flex flex-wrap items-start justify-between gap-2">
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-semibold text-slate-900">{item.title}</p>
                  <p className="mt-0.5 text-[11px] text-slate-500">{item.desa.nama} · {formatDateTime(item.updatedAt)}</p>
                </div>
                <span className="rounded-full bg-slate-100 px-2 py-0.5 text-[10px] font-semibold text-slate-700">
                  {formatSubmissionStatus(item.status)}
                </span>
              </div>
              <p className="mt-1.5 text-[11px] text-slate-500">Klik untuk membuka kartu ini di antrean review.</p>
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}

function DesaVersionHistoryList({ desaName, loading, error, versions, storageNote }: {
  desaName: string | null;
  loading: boolean;
  error: string | null;
  versions: DesaVersionEntry[];
  storageNote: string | null;
}) {
  if (!desaName) return <p className="text-xs text-slate-500">Pilih desa di langkah 1 untuk melihat riwayat versi.</p>;
  if (loading) return <p className="text-xs text-slate-500">Memuat riwayat versi {desaName}...</p>;
  if (error) return <p className="text-xs text-slate-500">Belum bisa memuat riwayat versi: {error}</p>;
  if (versions.length === 0) return <p className="text-xs text-slate-500">Belum ada riwayat versi untuk {desaName}.</p>;

  return (
    <div className="space-y-2">
      {storageNote && <p className="text-[11px] text-slate-500">{storageNote}</p>}
      <ul className="space-y-1.5">
        {versions.slice(0, 5).map(v => (
          <li key={v.id} className="rounded-lg border border-slate-100 bg-slate-50 px-3 py-2 text-xs">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <span className="font-semibold text-slate-900">v{v.versionNumber} · {v.title}</span>
              <span className="text-[11px] text-slate-500">{formatDateTime(v.createdAt)}</span>
            </div>
            {v.changedFields.length > 0 && (
              <p className="mt-0.5 text-[11px] text-slate-500">Field berubah: {v.changedFields.join(", ")}</p>
            )}
          </li>
        ))}
      </ul>
    </div>
  );
}
