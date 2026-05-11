"use client";

import type { PipelineResult } from "./types";

interface IntakeCoverageLensProps {
  result: PipelineResult;
}

function DonutChart({ publishable, detected, missing, total }: {
  publishable: number; detected: number; missing: number; total: number;
}) {
  const size = 120; const r = 48; const C = 2 * Math.PI * r;
  const pctP = total > 0 ? publishable / total : 0;
  const pctD = total > 0 ? detected / total   : 0;
  const pctM = total > 0 ? missing / total     : 0;
  const pct  = total > 0 ? Math.round((publishable / total) * 100) : 0;

  return (
    <div className="relative flex flex-col items-center gap-2">
      <div className="relative" style={{ width: size, height: size }}
        role="img"
        aria-label={`Cakupan field: ${pct}% terbaca (${publishable} siap direview, ${detected} terdeteksi, ${missing} tidak terbaca)`}>
        <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} aria-hidden style={{ transform: "rotate(-90deg)" }}>
          <circle cx={size/2} cy={size/2} r={r} fill="none" stroke="rgba(15,23,42,0.05)" strokeWidth={16} />
          {pctP > 0 && <circle cx={size/2} cy={size/2} r={r} fill="none" stroke="#10B981" strokeWidth={16} strokeDasharray={`${C*pctP} ${C}`} strokeDashoffset={0} strokeLinecap="butt" />}
          {pctD > 0 && <circle cx={size/2} cy={size/2} r={r} fill="none" stroke="#D97706" strokeWidth={16} strokeDasharray={`${C*pctD} ${C}`} strokeDashoffset={-C*pctP} strokeLinecap="butt" />}
          {pctM > 0 && <circle cx={size/2} cy={size/2} r={r} fill="none" stroke="#CBD5E1" strokeWidth={16} strokeDasharray={`${C*pctM} ${C}`} strokeDashoffset={-(C*pctP + C*pctD)} strokeLinecap="butt" />}
        </svg>
        <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center">
          <span className="text-[34px] font-semibold leading-none text-slate-900" style={{ letterSpacing: "-0.028em" }}>
            {pct}<span className="text-[18px] text-slate-400">%</span>
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

  const templateInfo = coverage.templateInfo;

  // Count by status (exclude component_hidden + outside_template from donut totals)
  const activeEntries = coverage.entries.filter(
    e => e.uploadedCoverageStatus !== "component_hidden" && e.uploadedCoverageStatus !== "outside_template"
  );
  const total      = activeEntries.length;
  const publishable = activeEntries.filter(e => e.uploadedCoverageStatus === "covered").length;
  const detected   = activeEntries.filter(e => e.uploadedCoverageStatus === "detected_not_publishable").length;
  const missing    = Math.max(0, total - publishable - detected);

  const hiddenCount  = coverage.entries.filter(e => e.uploadedCoverageStatus === "component_hidden").length;
  const outsideCount = coverage.entries.filter(e => e.uploadedCoverageStatus === "outside_template").length;

  // Group active entries by section/component
  const sectionMap = new Map<string, { covered: number; detected: number; total: number }>();
  for (const entry of activeEntries) {
    const key = entry.sectionLabel || entry.sectionKey;
    if (!sectionMap.has(key)) sectionMap.set(key, { covered: 0, detected: 0, total: 0 });
    const s = sectionMap.get(key)!;
    s.total++;
    if (entry.uploadedCoverageStatus === "covered") s.covered++;
    else if (entry.uploadedCoverageStatus === "detected_not_publishable") s.detected++;
  }

  // Outside-template detected fields
  const outsideEntries = coverage.entries.filter(e => e.uploadedCoverageStatus === "outside_template");
  // Component-hidden entries grouped by component — with individual field list
  const hiddenByComponent = new Map<string, { label: string; fields: { fieldKey: string; fieldLabel: string }[] }>();
  for (const entry of coverage.entries.filter(e => e.uploadedCoverageStatus === "component_hidden")) {
    const key = entry.sectionKey;
    if (!hiddenByComponent.has(key)) hiddenByComponent.set(key, { label: entry.sectionLabel, fields: [] });
    hiddenByComponent.get(key)!.fields.push({ fieldKey: entry.fieldKey, fieldLabel: entry.fieldLabel });
  }
  // Detected-not-publishable fields grouped by section for per-component detail
  const detectedBySection = new Map<string, { fields: { fieldKey: string; fieldLabel: string }[] }>();
  for (const entry of activeEntries.filter(e => e.uploadedCoverageStatus === "detected_not_publishable")) {
    const key = entry.sectionLabel || entry.sectionKey;
    if (!detectedBySection.has(key)) detectedBySection.set(key, { fields: [] });
    detectedBySection.get(key)!.fields.push({ fieldKey: entry.fieldKey, fieldLabel: entry.fieldLabel });
  }

  return (
    <section className="rounded-3xl bg-white overflow-hidden"
      style={{ boxShadow: "inset 0 0 0 1px rgba(15,23,42,0.06), 0 1px 1px rgba(15,23,42,0.03), 0 2px 4px rgba(15,23,42,0.04), 0 8px 20px -8px rgba(15,23,42,0.06)" }}>

      {/* ── Template info ribbon (Fix 4) ──────────────────────────────────────── */}
      {templateInfo && (
        <div className="flex flex-wrap items-center gap-x-4 gap-y-1 px-6 py-3 border-b border-slate-100 bg-slate-50/60">
          <div className="flex items-center gap-2 min-w-0">
            <span className="text-[10px] uppercase tracking-widest font-semibold text-slate-400">Template</span>
            <span className="text-[12px] font-semibold text-slate-800 truncate">{templateInfo.templateName}</span>
          </div>
          <span className="text-[10.5px] font-mono text-slate-400">{templateInfo.templateKey}</span>
          <span className={`text-[10.5px] font-semibold px-2 py-0.5 rounded-full ${
            templateInfo.source === "db"
              ? "bg-emerald-50 text-emerald-700"
              : "bg-amber-50 text-amber-700"
          }`}>
            {templateInfo.source === "db" ? "DB template" : "Fallback standar"}
          </span>
          {templateInfo.visibleComponentCount > 0 && (
            <span className="text-[10.5px] text-slate-500">{templateInfo.visibleComponentCount} komponen aktif</span>
          )}
          {templateInfo.hiddenComponentCount > 0 && (
            <span className="text-[10.5px] text-rose-500">{templateInfo.hiddenComponentCount} komponen hidden</span>
          )}
        </div>
      )}
      {templateInfo?.source === "fallback" && (
        <div className="notice-card notice-warn text-[11px] mx-6 mt-3">
          Menggunakan fallback standar karena template DB belum tersedia. Struktur komponen mungkin berbeda dari tampilan di Data Desa.
        </div>
      )}

      <div className="p-7">
        <div className="flex items-start justify-between mb-5">
          <div>
            <p className="eyebrow mb-1.5">Coverage · apa yang dibaca dari file</p>
            <h3 className="text-[18px] font-semibold text-slate-900 leading-tight">
              {total} field template aktif, terbaca dengan tingkat keyakinan berbeda
            </h3>
          </div>
        </div>

        <div className="flex flex-col items-center gap-5 sm:grid sm:grid-cols-[180px_1fr] sm:gap-7 sm:items-center">
          <DonutChart publishable={publishable} detected={detected} missing={missing} total={total} />

          {/* Legend (Fix 8 — renamed labels) */}
          <div className="space-y-3 w-full">
            <LegendRow color="#10B981" label="Siap direview" count={publishable}
              note="Terbaca dari dokumen · perlu verifikasi sumber sebelum diterbitkan" />
            <LegendRow color="#D97706" label="Terdeteksi, perlu cek sumber" count={detected}
              note="Ditemukan tapi format atau sumber belum memenuhi syarat" />
            <LegendRow color="#CBD5E1" label="Tidak terbaca" count={missing}
              note="Tidak ada di file ini · data lama tetap dipakai" />
            {hiddenCount > 0 && (
              <LegendRow color="#F43F5E" label="Terdeteksi, komponen hidden" count={hiddenCount}
                note="Komponen sedang disembunyikan untuk desa ini — tidak akan diterbitkan" />
            )}
            {outsideCount > 0 && (
              <LegendRow color="#94A3B8" label="Terdeteksi di luar template" count={outsideCount}
                note="Field ini tidak ada di template aktif — tidak akan dicatat sebagai perubahan" />
            )}
          </div>
        </div>

        {/* Per-section breakdown */}
        {sectionMap.size > 0 && (
          <div className="mt-6 pt-5 border-t border-slate-100">
            <p className="text-[11px] uppercase tracking-[0.16em] font-semibold text-slate-500 mb-3">
              Per komponen · {templateInfo?.source === "db" ? "dari template aktif" : "fallback standar"}
            </p>
            <div>
              {[...sectionMap.entries()].map(([name, counts]) => {
                const pctC = counts.total > 0 ? (counts.covered / counts.total) * 100 : 0;
                const pctD = counts.total > 0 ? (counts.detected / counts.total) * 100 : 0;
                const detectedFields = detectedBySection.get(name)?.fields ?? [];
                return (
                  <div key={name} className="py-[9px] border-t border-slate-100 first:border-t-0 space-y-1.5">
                    <div className="flex items-center justify-between gap-2">
                      <div className="text-[12.5px] font-medium text-slate-900 truncate">{name}</div>
                      <div className="text-[11px] text-slate-500 tabular-nums flex-shrink-0">{counts.covered} / {counts.total}</div>
                    </div>
                    <div className="h-[6px] bg-slate-100 rounded-full overflow-hidden flex">
                      <div className="bg-emerald-500" style={{ width: `${pctC}%` }} />
                      <div className="bg-amber-500" style={{ width: `${pctD}%` }} />
                    </div>
                    {detectedFields.length > 0 && (
                      <div className="flex flex-wrap gap-1 pt-0.5">
                        {detectedFields.map(f => (
                          <span key={f.fieldKey} className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded-md text-[10px] bg-amber-50 text-amber-800"
                            style={{ boxShadow: "inset 0 0 0 1px rgba(146,64,14,0.14)" }}>
                            {f.fieldLabel}
                            <span className="font-mono opacity-60">{f.fieldKey}</span>
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Hidden component section (Fix 6) */}
        {hiddenByComponent.size > 0 && (
          <div className="mt-5 pt-5 border-t border-rose-100">
            <p className="text-[11px] uppercase tracking-[0.16em] font-semibold text-rose-400 mb-2">Terdeteksi — komponen hidden</p>
            <div className="space-y-2">
              {[...hiddenByComponent.entries()].map(([key, info]) => (
                <div key={key} className="rounded-xl px-3 py-2.5 bg-rose-50/60"
                  style={{ boxShadow: "inset 0 0 0 1px rgba(244,63,94,0.10)" }}>
                  <div className="flex items-start gap-2.5">
                    <span className="w-2 h-2 rounded-full bg-rose-400 flex-shrink-0 mt-1" />
                    <div className="flex-1 min-w-0">
                      <p className="text-[12px] font-semibold text-slate-800">{info.label}</p>
                      <p className="text-[11px] text-slate-500 mt-0.5">
                        {info.fields.length} field terdeteksi, tapi komponen ini sedang disembunyikan untuk desa ini. Data tidak akan diterbitkan.
                      </p>
                      <div className="flex flex-wrap gap-1 mt-1.5">
                        {info.fields.map(f => (
                          <span key={f.fieldKey} className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded-md text-[10px] bg-rose-100/70 text-rose-800"
                            style={{ boxShadow: "inset 0 0 0 1px rgba(244,63,94,0.12)" }}>
                            {f.fieldLabel}
                            <span className="font-mono opacity-60">{f.fieldKey}</span>
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Outside-template section (Fix 5, 6) */}
        {outsideEntries.length > 0 && (
          <div className="mt-5 pt-5 border-t border-slate-200">
            <p className="text-[11px] uppercase tracking-[0.16em] font-semibold text-slate-400 mb-2">Terdeteksi di luar template</p>
            <div className="space-y-2">
              {outsideEntries.map(entry => (
                <div key={entry.fieldKey} className="flex items-start gap-2.5 rounded-xl px-3 py-2.5 bg-slate-50"
                  style={{ boxShadow: "inset 0 0 0 1px rgba(15,23,42,0.06)" }}>
                  <span className="w-2 h-2 rounded-full bg-slate-300 flex-shrink-0 mt-1" />
                  <div className="min-w-0 flex-1">
                    {entry.sectionLabel && (
                      <p className="text-[10px] uppercase tracking-[0.12em] font-semibold text-slate-400 mb-0.5">{entry.sectionLabel}</p>
                    )}
                    <p className="text-[12px] font-medium text-slate-700">{entry.fieldLabel}
                      <span className="ml-2 text-[10px] font-mono text-slate-400">{entry.fieldKey}</span>
                    </p>
                    {entry.uploadedValuePreview && (
                      <p className="text-[11px] text-slate-500 mt-0.5">Nilai terdeteksi: <span className="font-medium">{entry.uploadedValuePreview}</span></p>
                    )}
                    <p className="text-[11px] text-slate-400 mt-0.5">
                      Data ini terbaca dari dokumen, tetapi tidak dicatat sebagai perubahan karena field tersebut belum ada di template desa ini.
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
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
