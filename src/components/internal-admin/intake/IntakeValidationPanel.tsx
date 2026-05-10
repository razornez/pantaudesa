"use client";

import { AlertTriangle, CheckCircle2, ShieldCheck } from "lucide-react";
import type { PipelineResult, StatusBadgeInfo, DesaOption } from "./types";
import { FIELD_LABELS } from "./constants";

interface IntakeValidationPanelProps {
  result: PipelineResult;
  mappingStatus: StatusBadgeInfo;
  aiStatus: StatusBadgeInfo;
  reviewStatus: StatusBadgeInfo;
  selectedDesa: DesaOption | null;
}

export function IntakeValidationPanel({
  result,
  mappingStatus,
  aiStatus,
  reviewStatus,
  selectedDesa,
}: IntakeValidationPanelProps) {
  const { validation, fieldCoverage } = result;
  const totalOk = fieldCoverage
    ? fieldCoverage.entries.filter(e => e.uploadedCoverageStatus === "covered" || e.currentValueStatus === "filled").length
    : 0;
  const totalFields = fieldCoverage?.entries.length ?? 0;
  const hasErrors = validation.issues.some(i => i.severity === "error");
  const warnings = validation.issues.filter(i => i.severity === "warning");
  const errors = validation.issues.filter(i => i.severity === "error");

  return (
    <section className="rounded-3xl bg-white p-7"
      style={{ boxShadow: "inset 0 0 0 1px rgba(15,23,42,0.06), 0 1px 1px rgba(15,23,42,0.03), 0 2px 4px rgba(15,23,42,0.04), 0 8px 20px -8px rgba(15,23,42,0.06)" }}>

      {/* Header */}
      <div className="flex items-start justify-between mb-5">
        <div className="min-w-0 flex-1">
          <p className="eyebrow mb-1.5">Validasi · langsung kelihatan</p>
          <h3 className="text-[18px] font-semibold text-slate-900 leading-tight">
            {hasErrors ? "Ada error yang perlu diperbaiki" : "Aman untuk dikirim ke review"}
          </h3>
          <p className="text-[12.5px] text-slate-500 mt-1.5">
            {hasErrors
              ? `${errors.length} error validasi perlu diperbaiki sebelum submit.`
              : warnings.length > 0
              ? `Semua field utama lolos. Ada ${warnings.length} catatan ringan yang tidak menghalangi submit.`
              : "Semua field valid dan siap direview."}
          </p>
        </div>
        <div className="flex flex-col items-end gap-1 ml-4 flex-shrink-0">
          <span className={`inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl text-[11.5px] font-medium ${
            hasErrors
              ? "bg-rose-50 text-rose-900 shadow-[inset_0_0_0_1px_rgba(159,18,57,0.18)]"
              : "bg-emerald-50 text-emerald-900 shadow-[inset_0_0_0_1px_rgba(5,95,70,0.12)]"
          }`}>
            {hasErrors
              ? <AlertTriangle size={13} aria-hidden />
              : <CheckCircle2 size={13} aria-hidden />}
            {hasErrors ? "Perlu diperbaiki" : "Lolos"}
          </span>
          {totalFields > 0 && (
            <span className="text-[10.5px] text-slate-500 tabular-nums">{totalOk}/{totalFields} ok</span>
          )}
        </div>
      </div>

      {/* 2×2 status mini cards */}
      <div className="grid grid-cols-2 gap-2 mb-5">
        <MiniCard label="Mapping" value={mappingStatus.label} tone={mappingStatus.className} />
        <MiniCard label="AI mapping" value={aiStatus.label} tone={aiStatus.className} />
        <MiniCard label="Review status" value={reviewStatus.label} tone={reviewStatus.className} />
        <MiniCard label="Guardrail" value="Aktif" tone="text-slate-900" />
      </div>

      {/* Issues */}
      {(errors.length > 0 || warnings.length > 0) && (
        <>
          <p className="text-[11px] uppercase tracking-[0.16em] font-semibold text-slate-500 mb-2">
            {errors.length > 0 ? `${errors.length} error` : `${warnings.length} catatan`}
          </p>
          <div className="space-y-2">
            {[...errors, ...warnings].map((issue, i) => (
              <div key={i}
                className={`rounded-xl p-3 flex items-start gap-3 ${
                  issue.severity === "error" ? "bg-rose-50/40" : "bg-amber-50/40"
                }`}
                style={{ boxShadow: "inset 0 0 0 1px rgba(15,23,42,0.06)" }}>
                <AlertTriangle size={14}
                  className={`mt-0.5 flex-shrink-0 ${issue.severity === "error" ? "text-rose-700" : "text-amber-700"}`}
                  aria-hidden />
                <div className="min-w-0 flex-1">
                  <p className="text-[12.5px] font-medium text-slate-900">
                    {FIELD_LABELS[issue.field]}{" "}
                    <span className="font-normal text-slate-500">· {issue.severity === "error" ? "error" : "peringatan"}</span>
                  </p>
                  <p className="text-[11.5px] text-slate-500 mt-0.5">{issue.message}</p>
                </div>
              </div>
            ))}
          </div>
        </>
      )}

      {/* Reviewer hint */}
      <div className="mt-5 pt-4 border-t border-slate-100">
        <div className="flex items-start gap-3">
          <div className="w-8 h-8 rounded-full bg-gradient-to-br from-indigo-100 to-emerald-100 flex items-center justify-center flex-shrink-0"
            style={{ boxShadow: "inset 0 0 0 1px rgba(15,23,42,0.06)" }}>
            <ShieldCheck size={14} className="text-[#1E1B4B]" aria-hidden />
          </div>
          <div className="min-w-0 flex-1">
            <p className="text-[12px] text-slate-700">
              {selectedDesa
                ? <><span className="font-semibold text-slate-900">Desa: {selectedDesa.nama}</span> · Publish tetap manual oleh editor setelah review.</>
                : <span className="text-slate-500">Pilih desa target untuk menghubungkan hasil ini ke data publik.</span>}
            </p>
            <p className="text-[11px] text-slate-400 mt-0.5">
              Publish final tidak terjadi di layar ini. Setelah dikirim, item masuk ke antrean review.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}

function MiniCard({ label, value, tone }: { label: string; value: string; tone: string }) {
  return (
    <div className="rounded-xl px-3 py-2.5 bg-slate-50/40"
      style={{ boxShadow: "inset 0 0 0 1px rgba(15,23,42,0.05)" }}>
      <p className="text-[10px] uppercase tracking-[0.12em] text-slate-500 font-semibold">{label}</p>
      <p className={`text-[12.5px] font-semibold mt-0.5 truncate ${tone.includes("emerald") ? "text-emerald-700" : tone.includes("rose") ? "text-rose-700" : tone.includes("amber") ? "text-amber-700" : tone.includes("sky") ? "text-sky-700" : "text-slate-900"}`}>
        {value}
      </p>
    </div>
  );
}
