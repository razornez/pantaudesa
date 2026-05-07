"use client";

import { useState } from "react";
import { ChevronDown, ChevronUp } from "lucide-react";
import type { PipelineResult, DetailFieldCoverageSummary } from "./types";
import { INTAKE_COPY } from "./constants";

interface IntakeCoveragePanelProps {
  result: PipelineResult;
}

export function IntakeCoveragePanel({ result }: IntakeCoveragePanelProps) {
  const coverage = result.fieldCoverage;
  const [showDetails, setShowDetails] = useState(false);

  if (!coverage) return null;

  const sectionOrder = Array.from(
    new Map(coverage.entries.map((entry) => [entry.sectionKey, entry.sectionLabel])).entries()
  );

  return (
    <div className="rounded-2xl border border-slate-200 bg-white">
      {/* Header */}
      <div className="px-4 py-3 sm:px-5">
        <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-500">
          {INTAKE_COPY.coverage.title}
        </p>
        <p className="mt-1 text-xs text-slate-600 line-clamp-1">
          {INTAKE_COPY.coverage.subtitle}
        </p>
      </div>

      {/* Summary Stats */}
      <div className="grid grid-cols-3 gap-2 border-t border-slate-100 px-4 py-3 sm:grid-cols-5 sm:px-5">
        <StatBox
          label={INTAKE_COPY.coverage.filled}
          value={`${coverage.filledCount}`}
          variant="success"
        />
        <StatBox
          label={INTAKE_COPY.coverage.empty}
          value={`${coverage.emptyCount}`}
          variant="neutral"
        />
        <StatBox
          label={INTAKE_COPY.coverage.covered}
          value={`${coverage.coveredCount}`}
          variant="info"
        />
        <StatBox
          label={INTAKE_COPY.coverage.detectedNotPublishable}
          value={`${coverage.detectedNotPublishableCount}`}
          variant="warning"
        />
        <StatBox
          label={INTAKE_COPY.coverage.publishableNow}
          value={`${coverage.publishableNowCount}`}
          variant="primary"
        />
      </div>

      {/* Toggle Details */}
      <div className="border-t border-slate-100 px-4 py-2 sm:px-5">
        <button
          type="button"
          onClick={() => setShowDetails((v) => !v)}
          className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 bg-slate-50 px-3 py-1.5 text-xs font-medium text-slate-700 hover:bg-slate-100"
        >
          {showDetails ? (
            <ChevronUp size={12} aria-hidden />
          ) : (
            <ChevronDown size={12} aria-hidden />
          )}
          {showDetails
            ? INTAKE_COPY.coverage.hideDetails
            : INTAKE_COPY.coverage.showDetails}
        </button>
      </div>

      {/* Details Section */}
      {showDetails && (
        <div className="border-t border-slate-100 px-4 pb-4 sm:px-5">
          {/* Section by section */}
          {sectionOrder.map(([sectionKey, sectionLabel]) => {
            const sectionEntries = coverage.entries.filter(
              (e) => e.sectionKey === sectionKey
            );
            return (
              <div key={sectionKey} className="mt-4 first:mt-0">
                <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-slate-500">
                  {sectionLabel}
                </p>
                <div className="mt-2 space-y-2">
                  {sectionEntries.map((entry) => (
                    <CoverageEntry key={`${sectionKey}-${entry.fieldKey}`} entry={entry} />
                  ))}
                </div>
              </div>
            );
          })}

          {/* Detected but not publishable */}
          {coverage.detectedButNotPublishable.length > 0 && (
            <div className="mt-4 rounded-xl border border-amber-200 bg-amber-50/50 p-3">
              <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-amber-700">
                Terdeteksi tetapi belum aman dipublish
              </p>
              <div className="mt-2 space-y-2">
                {coverage.detectedButNotPublishable.slice(0, 6).map((item, idx) => (
                  <div
                    key={`${item.fieldKey}-${idx}`}
                    className="rounded-lg border border-amber-100 bg-white px-3 py-2 text-xs"
                  >
                    <p className="font-semibold text-slate-900">
                      {item.fieldLabel}{" "}
                      <span className="text-slate-400">({item.sectionLabel})</span>
                    </p>
                    <p className="mt-1 text-slate-700">{item.value}</p>
                    <p className="mt-1 text-[11px] text-amber-700">{item.reason}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Unknown useful fields */}
          {coverage.unknownUsefulFields.length > 0 && (
            <div className="mt-4 rounded-xl border border-slate-200 bg-slate-50/50 p-3">
              <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-slate-500">
                Temuan lain yang mungkin berguna
              </p>
              <div className="mt-2 space-y-2">
                {coverage.unknownUsefulFields.slice(0, 6).map((item, idx) => (
                  <div
                    key={`${item.label}-${idx}`}
                    className="rounded-lg border border-slate-100 bg-white px-3 py-2 text-xs"
                  >
                    <p className="font-semibold text-slate-900">{item.label}</p>
                    <p className="mt-1 text-slate-700">{item.value}</p>
                    <p className="mt-1 text-[11px] text-slate-500">
                      Kandidat kategori: {item.possibleCategory}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

// ============================================================================
// Helper Components
// ============================================================================

interface StatBoxProps {
  label: string;
  value: string;
  variant?: "success" | "neutral" | "info" | "warning" | "primary";
}

function StatBox({ label, value, variant = "neutral" }: StatBoxProps) {
  const classes = {
    success: "border-emerald-200 bg-emerald-50 text-emerald-900",
    neutral: "border-slate-200 bg-slate-50 text-slate-900",
    info: "border-sky-200 bg-sky-50 text-sky-900",
    warning: "border-amber-200 bg-amber-50 text-amber-900",
    primary: "border-indigo-200 bg-indigo-50 text-indigo-900",
  };

  return (
    <div className={`rounded-lg border px-2 py-1.5 text-center ${classes[variant]}`}>
      <p className="text-[10px] font-medium uppercase tracking-[0.12em] text-current/70">
        {label}
      </p>
      <p className="mt-0.5 text-sm font-bold text-current">{value}</p>
    </div>
  );
}

interface CoverageEntryProps {
  entry: DetailFieldCoverageSummary["entries"][number];
}

function CoverageEntry({ entry }: CoverageEntryProps) {
  return (
    <div className="rounded-lg border border-slate-100 bg-white px-3 py-2.5 text-xs">
      <div className="flex items-start justify-between gap-2">
        <div>
          <p className="font-semibold text-slate-900">{entry.fieldLabel}</p>
          <p className="mt-0.5 text-[11px] text-slate-500">{entry.currentModelSource}</p>
        </div>
        <div className="flex flex-col items-end gap-1">
          <span
            className={`rounded-full px-2 py-0.5 text-[10px] font-semibold ${
              entry.currentValueStatus === "filled"
                ? "bg-emerald-50 text-emerald-700"
                : "bg-slate-100 text-slate-600"
            }`}
          >
            {entry.currentValueStatus === "filled" ? "Terisi" : "Kosong"}
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
              ? "Tercakup"
              : entry.uploadedCoverageStatus === "detected_not_publishable"
              ? "Terdeka belum aman"
              : "Belum"}
          </span>
        </div>
      </div>
    </div>
  );
}
