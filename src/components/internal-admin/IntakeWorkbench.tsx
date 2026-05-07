"use client";

import Link from "next/link";
import { useCallback, useState } from "react";
import { AlertTriangle, CheckCircle2, Info, Sparkles } from "lucide-react";

import type { PipelineResult, SubmitReviewSuccess, IntakeStep, IntakeMode, DesaOption } from "./intake/types";

import { INTAKE_COPY, FIELD_LABELS, buildSuggestedReviewTitle } from "./intake/constants";
import { formatBytes, formatDiffValue, formatDateTime } from "./intake/utils";

import { IntakeSection } from "./intake/IntakeSection";
import { IntakeStatusCards } from "./intake/IntakeStatusCards";
import { IntakeCoveragePanel } from "./intake/IntakeCoveragePanel";
import { IntakeDiffPanel } from "./intake/IntakeDiffPanel";
import { IntakeAiStatusPanel } from "./intake/IntakeAiStatusPanel";

import {
  getMappingStatus,
  getValidationStatus,
  getReviewStatus,
  getOpenAiStatus,
  getMappedFieldEntries,
  getReviewableContentCount,
} from "./intake/IntakeStatusHelpers";

// ============================================================================
// Re-export original component for backward compatibility
// ============================================================================

// Re-export from intake folder for backward compatibility
export {
  IntakeSection as CollapsibleSection,
  IntakeStatusCards as StatusCardRow,
} from "./intake";

// ============================================================================
// Main Component - Refactored Compact Version
// ============================================================================

export default function IntakeWorkbench() {
  // Step state
  const [step, setStep] = useState<IntakeStep>("input");

  // Input state
  const [mode, setMode] = useState<IntakeMode>("upload");
  const [textValue, setTextValue] = useState("");
  const [useAiMapping, setUseAiMapping] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [selectedDesa, setSelectedDesa] = useState<DesaOption | null>(null);
  const [desaSearch, setDesaSearch] = useState("");

  // Result state
  const [result, setResult] = useState<PipelineResult | null>(null);
  const [reviewTitle, setReviewTitle] = useState("");
  const [submittedReview, setSubmittedReview] = useState<SubmitReviewSuccess | null>(null);

  // Loading/error state
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Village options (simplified)
  const [desaOptions, setDesaOptions] = useState<DesaOption[]>([]);
  const [desaLoading, setDesaLoading] = useState(false);

  // ============================================================================
  // Handlers
  // ============================================================================

  const handleSearchDesa = useCallback(async (query: string) => {
    setDesaLoading(true);
    try {
      const suffix = query ? `?q=${encodeURIComponent(query)}` : "";
      const res = await fetch(`/api/internal-admin/desa-options${suffix}`);
      const data = await res.json();
      if (data.desa) setDesaOptions(data.desa);
    } catch {
      // ignore
    } finally {
      setDesaLoading(false);
    }
  }, []);

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
        if (!selectedFile) { setError("Pilih file terlebih dahulu"); return; }
        body = new FormData();
        body.append("file", selectedFile);
        if (selectedDesa) body.append("desaId", selectedDesa.id);
        if (useAiMapping) body.append("useAiMapping", "true");
      } else {
        if (!textValue.trim()) { setError("Teks wajib diisi"); return; }
        headers = { Accept: "application/json", "Content-Type": "application/json" };
        body = JSON.stringify({
          text: textValue,
          ...(selectedDesa ? { desaId: selectedDesa.id } : {}),
          ...(useAiMapping ? { useAiMapping: true } : {}),
        });
      }

      const res = await fetch("/api/internal-admin/intake", { method: "POST", headers, body });
      const data = await res.json();

      if (data.error) { setError(data.error); return; }
      setResult(data);
      setStep("result");
    } catch {
      setError("Koneksi bermasalah");
    } finally {
      setLoading(false);
    }
  }, [mode, selectedFile, textValue, selectedDesa, useAiMapping]);

  const handleSubmitReview = useCallback(async () => {
    if (!selectedDesa || !result) return;
    if (!result.validation.ok) { setError("Validasi belum lolos"); return; }

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

      const res = await fetch("/api/internal-admin/intake/submit-review", { method: "POST", headers, body });
      const data = await res.json();

      if (data.error) { setError(data.error); return; }
      setSubmittedReview(data);
    } catch {
      setError("Submit gagal");
    } finally {
      setLoading(false);
    }
  }, [mode, selectedFile, textValue, selectedDesa, useAiMapping, reviewTitle, result]);

  // ============================================================================
  // Computed
  // ============================================================================

  const canSubmit = Boolean(selectedDesa && result?.validation.ok && !submittedReview && getReviewableContentCount(result) > 0);

  // ============================================================================
  // Render
  // ============================================================================

  return (
    <div className="space-y-4">
      {/* Info Notice */}
      <div className="notice-card notice-info flex items-start gap-2 text-xs">
        <Info size={14} className="mt-0.5 shrink-0" />
        <span>
          <strong>{INTAKE_COPY.info.title}</strong>. {INTAKE_COPY.info.body}
        </span>
      </div>

      {/* Workflow Guide */}
      <WorkflowGuide step={step} submittedReview={submittedReview} />

      {/* INPUT STEP */}
      {step === "input" && (
        <div className="rounded-2xl border border-slate-200 bg-white p-4 sm:p-5">
          <p className="eyebrow text-[10px]">Langkah 1 · Siapkan bahan</p>
          <h2 className="mt-1 text-lg font-semibold text-slate-900">Input dokumen / teks</h2>

          {/* Mode Toggle */}
          <div className="mt-4 inline-flex rounded-xl bg-slate-100 p-1">
            <button onClick={() => setMode("upload")} className={`rounded-lg px-4 py-2 text-xs font-semibold ${mode === "upload" ? "bg-white text-slate-900 shadow" : "text-slate-500"}`}>
              Upload file
            </button>
            <button onClick={() => setMode("paste")} className={`rounded-lg px-4 py-2 text-xs font-semibold ${mode === "paste" ? "bg-white text-slate-900 shadow" : "text-slate-500"}`}>
              Tempel teks
            </button>
          </div>

          {/* AI Toggle */}
          <div className="mt-4 flex items-center justify-between rounded-xl border border-slate-100 bg-slate-50 p-3">
            <div>
              <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-slate-500">{INTAKE_COPY.aiOption.label}</p>
              <p className="mt-1 text-sm font-medium text-slate-900">{INTAKE_COPY.aiOption.checkboxLabel}</p>
            </div>
            <label className="inline-flex cursor-pointer items-center gap-2 rounded-full border border-slate-200 bg-white px-3 py-1.5 text-xs font-semibold text-slate-700">
              <input type="checkbox" checked={useAiMapping} onChange={(e) => setUseAiMapping(e.target.checked)} className="h-4 w-4 rounded border-slate-300" />
              Aktif
            </label>
          </div>

          {/* File Input */}
          {mode === "upload" && (
            <div className="mt-4 space-y-2">
              <label className="field-label text-xs">File (DOCX, XLSX, PDF, TXT, CSV, JPG, PNG - maks 10 MB)</label>
              <input type="file" accept=".docx,.xlsx,.pdf,.txt,.csv,.jpg,.jpeg,.png,.webp" onChange={(e) => setSelectedFile(e.target.files?.[0] ?? null)} className="field-lux text-sm" />
              {selectedFile && <p className="text-xs text-slate-500">Dipilih: <span className="font-medium text-slate-700">{selectedFile.name}</span> ({formatBytes(selectedFile.size)})</p>}
            </div>
          )}

          {/* Text Input */}
          {mode === "paste" && (
            <div className="mt-4 space-y-2">
              <label className="field-label text-xs">Teks yang akan diproses</label>
              <textarea value={textValue} onChange={(e) => setTextValue(e.target.value)} rows={6} maxLength={50000} className="textarea-lux text-sm" placeholder="Salin teks dari dokumen di sini..." />
            </div>
          )}

          {/* Village Picker */}
          <div className="mt-4 space-y-2">
            <label className="field-label text-xs">Pilih desa (opsional)</label>
            <input type="text" value={desaSearch} onChange={(e) => { setDesaSearch(e.target.value); handleSearchDesa(e.target.value); }} className="field-lux text-sm" placeholder="Ketik nama desa..." />
            {desaOptions.length > 0 && !selectedDesa && (
              <div className="max-h-40 overflow-y-auto rounded-xl border border-slate-100 bg-white">
                {desaOptions.map((d) => (
                  <button key={d.id} onClick={() => handleSelectDesa(d)} className="flex w-full items-center gap-2 px-4 py-2 text-left text-xs hover:bg-slate-50">
                    <span className="font-semibold text-slate-900">{d.nama}</span>
                    <span className="text-slate-500">{d.kecamatan}, {d.kabupaten}</span>
                  </button>
                ))}
              </div>
            )}
            {selectedDesa && (
              <div className="rounded-xl border border-slate-200 bg-white px-4 py-2 text-xs">
                <span className="font-semibold text-slate-900">{selectedDesa.nama}</span>
                <span className="ml-2 text-slate-500">{selectedDesa.kecamatan}, {selectedDesa.kabupaten}</span>
                <button onClick={() => setSelectedDesa(null)} className="ml-4 font-semibold text-indigo-600 hover:underline">Hapus</button>
              </div>
            )}
          </div>

          {/* Error */}
          {error && <div className="notice-card notice-danger mt-4">{error}</div>}

          {/* Run Button */}
          <button onClick={handleRunPipeline} disabled={loading} className="btn-lux btn-lux-primary mt-4 flex w-full items-center justify-center gap-2 sm:w-auto">
            {loading ? <><span className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />Memproses...</> : <><Sparkles size={14} />Jalankan pipeline</>}
          </button>
        </div>
      )}

      {/* RESULT STEP */}
      {step === "result" && result && (
        <div className="space-y-4">
          {/* Status Cards */}
          <IntakeStatusCards
            mappingStatus={getMappingStatus(result)}
            validationStatus={getValidationStatus(result)}
            reviewStatus={getReviewStatus(result)}
            aiStatus={getOpenAiStatus(result)}
          />

          {/* Coverage Panel */}
          <IntakeCoveragePanel result={result} />

          {/* Mapped Fields */}
          <IntakeSection title={`Yang Terbaca Utama (${getMappedFieldEntries(result).length} field)`}>
            <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
              {getMappedFieldEntries(result).map((item) => (
                <div key={item.field} className="rounded-lg border border-slate-100 bg-slate-50 px-3 py-2">
                  <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-slate-500">{FIELD_LABELS[item.field]}</p>
                  <p className="mt-1 text-sm font-semibold text-slate-900">{formatDiffValue(item.value)}</p>
                </div>
              ))}
            </div>
          </IntakeSection>

          {/* Actions */}
          <div className="flex flex-wrap gap-2">
            <button onClick={() => { setStep("input"); setResult(null); }} className="btn-lux btn-lux-secondary text-xs">Kembali ke input</button>
            <button onClick={handleRunPipeline} disabled={loading} className="btn-lux btn-lux-ghost text-xs"><Sparkles size={12} /> Ulangi</button>
          </div>

          {/* Guardrail Note */}
          <div className="notice-card notice-info text-xs">
            <span className="font-semibold">Catatan:</span> {result.guardrailNote}
          </div>

          {/* Review Action */}
          <div className="rounded-2xl border border-amber-200 bg-amber-50/50 p-4">
            <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-amber-700">Langkah 2 · Cek lalu kirim ke review</p>
            <p className="mt-1 text-sm font-semibold text-slate-900">
              {submittedReview ? (
                <>Item sudah dikirim. <Link href={submittedReview.queueUrl} className="text-emerald-600 hover:underline">Lanjut ke review data →</Link></>
              ) : "Pastikan hasil otomatis masuk akal, lalu kirim ke review internal."}
            </p>

            {!submittedReview && (
              <div className="mt-4 space-y-3">
                {!selectedDesa && <div className="rounded-lg border border-amber-200 bg-amber-50 px-3 py-2 text-xs text-amber-700">Pilih desa target dulu.</div>}
                {!result.validation.ok && <div className="rounded-lg border border-rose-200 bg-rose-50 px-3 py-2 text-xs text-rose-700">Perbaiki error validasi dulu.</div>}
                {getReviewableContentCount(result) === 0 && <div className="rounded-lg border border-amber-200 bg-amber-50 px-3 py-2 text-xs text-amber-700">Belum ada hasil yang cukup kuat untuk review.</div>}
                <input type="text" value={reviewTitle} onChange={(e) => setReviewTitle(e.target.value.slice(0, 200))} placeholder={buildSuggestedReviewTitle({ mode, selectedFile, selectedDesa })} className="field-lux text-sm" />
                {error && <div className="notice-card notice-danger text-sm">{error}</div>}
                <button onClick={handleSubmitReview} disabled={!canSubmit || loading} className="btn-lux btn-lux-success w-full sm:w-auto">
                  {loading ? "Menyimpan..." : "Kirim ke antrean review"}
                </button>
              </div>
            )}
            <p className="mt-3 text-xs text-slate-500">Publish final tidak terjadi di layar ini.</p>
          </div>

          {/* Collapsed Technical Details */}
          <IntakeSection title="Detail parser lokal & AI" defaultOpen={false}>
            <IntakeAiStatusPanel result={result} embedded />
          </IntakeSection>

          {/* Validation Details */}
          <IntakeSection title="Validasi" defaultOpen={false}>
            {result.validation.ok && result.validation.issues.length === 0 ? (
              <div className="flex items-center gap-2 text-sm text-green-700"><CheckCircle2 size={14} /> Semua field valid.</div>
            ) : (
              <div className="space-y-1.5">
                {result.validation.issues.map((issue, i) => (
                  <div key={i} className={`notice-card flex items-start gap-2 text-xs ${issue.severity === "error" ? "notice-danger" : "notice-warn"}`}>
                    <AlertTriangle size={12} className="mt-0.5 shrink-0" />
                    <span className="font-semibold">{FIELD_LABELS[issue.field]}</span>: {issue.message}
                  </div>
                ))}
              </div>
            )}
          </IntakeSection>

          {/* Diff */}
          <IntakeDiffPanel result={result} />
        </div>
      )}

      {/* History Section */}
      <IntakeSection title="Riwayat Intake" defaultOpen={false}>
        <p className="text-xs text-slate-500">Riwayat akan dimuat dari API saat integrated.</p>
      </IntakeSection>

      {/* Version History */}
      <IntakeSection title="Riwayat Versi Desa" defaultOpen={false}>
        {!selectedDesa && <p className="text-xs text-slate-500">Pilih desa dulu.</p>}
        {selectedDesa && <p className="text-xs text-slate-500">Riwayat versi untuk {selectedDesa.nama} akan dimuat dari API saat integrated.</p>}
      </IntakeSection>
    </div>
  );
}

// ============================================================================
// Sub-components
// ============================================================================

function WorkflowGuide({ step, submittedReview }: { step: IntakeStep; submittedReview: SubmitReviewSuccess | null }) {
  const currentStep = submittedReview ? 4 : step === "result" ? 2 : 1;

  const steps = ["1. Siapkan bahan", "2. Cek hasil", "3. Kirim ke review", "4. Review lalu publish"];

  return (
    <div className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3">
      <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-slate-500">Alur singkat</p>
      <div className="mt-2 flex flex-wrap gap-2">
        {steps.map((label, i) => {
          const num = i + 1;
          const isCurrent = num === currentStep;
          const isDone = num < currentStep;
          return (
            <span key={label} className={`rounded-lg px-3 py-1 text-xs font-medium ${isCurrent ? "bg-sky-100 text-sky-700" : isDone ? "bg-emerald-100 text-emerald-700" : "bg-slate-100 text-slate-500"}`}>
              {label}
            </span>
          );
        })}
      </div>
    </div>
  );
}
