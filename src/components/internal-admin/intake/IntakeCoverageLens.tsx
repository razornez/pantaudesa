"use client";

import type { PipelineResult } from "./types";

interface IntakeCoverageLensProps {
  result: PipelineResult;
}

function DonutChart({ publishable, detected, missing, total }: {
  publishable: number;
  detected: number;
  missing: number;
  total: number;
}) {
  const size = 120;
  const r = 48;
  const C = 2 * Math.PI * r;

  const pctPublishable = total > 0 ? publishable / total : 0;
  const pctDetected   = total > 0 ? detected / total : 0;
  const pctMissing    = total > 0 ? missing / total : 0;

  const dasharrayP = C * pctPublishable;
  const dasharrayD = C * pctDetected;
  const dasharrayM = C * pctMissing;

  const overallPct = total > 0 ? Math.round((publishable / total) * 100) : 0;

  return (
    <div className="relative flex flex-col items-center gap-2">
      <div className="relative" style={{ width: size, height: size }}
        role="img"
        aria-label={`Cakupan field: ${overallPct}% terbaca (${publishable} publishable, ${detected} terdeteksi belum aman, ${missing} tidak terbaca)`}>
        <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} aria-hidden style={{ transform: "rotate(-90deg)" }}>
          {/* Track */}
          <circle cx={size/2} cy={size/2} r={r} fill="none" stroke="rgba(15,23,42,0.05)" strokeWidth={16} />
          {/* Publishable (green) */}
          {pctPublishable > 0 && (
            <circle cx={size/2} cy={size/2} r={r} fill="none" stroke="#10B981" strokeWidth={16}
              strokeDasharray={`${dasharrayP} ${C}`} strokeDashoffset={0} strokeLinecap="butt" />
          )}
          {/* Detected-not-publishable (amber) */}
          {pctDetected > 0 && (
            <circle cx={size/2} cy={size/2} r={r} fill="none" stroke="#D97706" strokeWidth={16}
              strokeDasharray={`${dasharrayD} ${C}`} strokeDashoffset={-dasharrayP} strokeLinecap="butt" />
          )}
          {/* Missing (slate) */}
          {pctMissing > 0 && (
            <circle cx={size/2} cy={size/2} r={r} fill="none" stroke="#CBD5E1" strokeWidth={16}
              strokeDasharray={`${dasharrayM} ${C}`} strokeDashoffset={-(dasharrayP + dasharrayD)} strokeLinecap="butt" />
          )}
        </svg>
        <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center">
          <span className="text-[34px] font-semibold leading-none text-slate-900" style={{ letterSpacing: "-0.028em" }}>
            {overallPct}<span className="text-[18px] text-slate-400">%</span>
          </span>
          <span className="text-[10px] uppercase tracking-[0.18em] text-slate-500 mt-1.5">terbaca</span>
        </div>
      </div>
      <p className="text-center text-[11px] text-slate-500 tabular-nums">
        <span className="font-semibold text-slate-900">{publishable}</span>{" "}
        <span className="text-slate-400">/</span>{" "}
        <span>{total} field detail</span>
      </p>
    </div>
  );
}

export function IntakeCoverageLens({ result }: IntakeCoverageLensProps) {
  const coverage = result.fieldCoverage;
  if (!coverage) return null;

  const total = coverage.entries.length;
  const publishable = coverage.publishableNowCount;
  const detected = coverage.detectedNotPublishableCount;
  const missing = Math.max(0, total - publishable - detected);

  // Group entries by section
  const sectionMap = new Map<string, { covered: number; detected: number; total: number }>();
  for (const entry of coverage.entries) {
    const key = entry.sectionLabel || entry.sectionKey;
    if (!sectionMap.has(key)) sectionMap.set(key, { covered: 0, detected: 0, total: 0 });
    const s = sectionMap.get(key)!;
    s.total++;
    if (entry.uploadedCoverageStatus === "covered") s.covered++;
    else if (entry.uploadedCoverageStatus === "detected_not_publishable") s.detected++;
  }

  return (
    <section className="rounded-3xl bg-white p-7"
      style={{ boxShadow: "inset 0 0 0 1px rgba(15,23,42,0.06), 0 1px 1px rgba(15,23,42,0.03), 0 2px 4px rgba(15,23,42,0.04), 0 8px 20px -8px rgba(15,23,42,0.06)" }}>
      <div className="flex items-start justify-between mb-5">
        <div>
          <p className="eyebrow mb-1.5">Coverage · apa yang dibaca dari file</p>
          <h3 className="text-[18px] font-semibold text-slate-900 leading-tight">
            {total} field detail desa, terbaca dengan tingkat keyakinan berbeda
          </h3>
        </div>
      </div>

      <div className="flex flex-col items-center gap-5 sm:grid sm:grid-cols-[180px_1fr] sm:gap-7 sm:items-center">
        <DonutChart publishable={publishable} detected={detected} missing={missing} total={total} />

        {/* Legend */}
        <div className="space-y-3 w-full">
          <LegendRow color="#10B981" label="Aman dipublish" count={publishable}
            note="Lewat semua aturan validasi · siap masuk halaman desa" />
          <LegendRow color="#D97706" label="Terdeteksi, belum aman" count={detected}
            note="Ditemukan tapi format atau sumbernya belum memenuhi syarat publish" />
          <LegendRow color="#CBD5E1" label="Tidak terbaca" count={missing}
            note="Tidak ada di file ini · tetap pakai data lama" />
        </div>
      </div>

      {/* Per-section breakdown */}
      {sectionMap.size > 0 && (
        <div className="mt-6 pt-5 border-t border-slate-100">
          <p className="text-[11px] uppercase tracking-[0.16em] font-semibold text-slate-500 mb-3">Per seksi halaman desa</p>
          <div>
            {[...sectionMap.entries()].map(([sectionName, counts]) => {
              const pctCov = counts.total > 0 ? (counts.covered / counts.total) * 100 : 0;
              const pctDet = counts.total > 0 ? (counts.detected / counts.total) * 100 : 0;
              return (
                <div key={sectionName} className="py-[9px] border-t border-slate-100 first:border-t-0 space-y-1.5">
                  <div className="flex items-center justify-between gap-2">
                    <div className="text-[12.5px] font-medium text-slate-900 truncate">{sectionName}</div>
                    <div className="text-[11px] text-slate-500 tabular-nums flex-shrink-0">
                      {counts.covered} / {counts.total}
                    </div>
                  </div>
                  <div className="h-[6px] bg-slate-100 rounded-full overflow-hidden flex">
                    <div className="bg-emerald-500" style={{ width: `${pctCov}%` }} />
                    <div className="bg-amber-500" style={{ width: `${pctDet}%` }} />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </section>
  );
}

function LegendRow({ color, label, count, note }: { color: string; label: string; count: number; note: string }) {
  return (
    <div className="flex items-center gap-3">
      <span className="w-2.5 h-2.5 rounded-sm flex-shrink-0" style={{ background: color }} />
      <div className="flex-1">
        <div className="flex items-baseline justify-between">
          <span className="text-[13px] font-medium text-slate-900">{label}</span>
          <span className="text-[13px] font-semibold text-slate-900 tabular-nums">{count}</span>
        </div>
        <p className="text-[11px] text-slate-500 mt-0.5">{note}</p>
      </div>
    </div>
  );
}
