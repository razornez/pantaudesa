"use client";

import { useState } from "react";
import { ChevronDown, ChevronUp } from "lucide-react";
import type { PipelineResult, DiffEntry } from "./types";
import { FIELD_LABELS, FIELD_SECTION_MAP, FIELD_SECTION_ORDER } from "./constants";
import { formatDiffValue } from "./utils";
import type { AiMappableDesaField } from "@/lib/admin-claim/ai-mapping";

// ─── Types ─────────────────────────────────────────────────────────────────

type DiffFilter = "all" | "added" | "updated" | "removed" | "unchanged";

// ─── Pill ──────────────────────────────────────────────────────────────────

function DeltaPill({ type }: { type: DiffEntry["deltaType"] }) {
  if (type === "unchanged") return null;
  const styles: Record<string, string> = {
    added:   "bg-emerald-50 text-emerald-900 shadow-[inset_0_0_0_1px_rgba(5,95,70,0.12)]",
    updated: "bg-indigo-50 text-[#1E1B4B] shadow-[inset_0_0_0_1px_rgba(67,56,202,0.15)]",
    removed: "bg-rose-50 text-rose-900 shadow-[inset_0_0_0_1px_rgba(159,18,57,0.15)]",
  };
  const labels: Record<string, string> = { added: "baru", updated: "+", removed: "hapus" };
  return (
    <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold ml-1 ${styles[type] ?? ""}`}>
      {labels[type] ?? type}
    </span>
  );
}

// ─── Diff row ───────────────────────────────────────────────────────────────

function DiffRow({ entry }: { entry: DiffEntry }) {
  const stripColor: Record<DiffEntry["deltaType"], string> = {
    added:     "bg-emerald-500",
    updated:   "bg-indigo-500",
    removed:   "bg-rose-500",
    unchanged: "bg-slate-200",
  };
  const rowBg: Record<DiffEntry["deltaType"], string> = {
    added:     "bg-emerald-50/60 hover:bg-emerald-50/90",
    updated:   "bg-indigo-50/20 hover:bg-indigo-50/40",
    removed:   "bg-rose-50/50 hover:bg-rose-50/80",
    unchanged: "bg-transparent hover:bg-slate-50/60",
  };
  const afterColor: Record<DiffEntry["deltaType"], string> = {
    added:     "text-emerald-700 font-semibold",
    updated:   "text-slate-900 font-medium",
    removed:   "text-rose-600 line-through decoration-rose-300",
    unchanged: "text-slate-500",
  };
  const label = FIELD_LABELS[entry.field as AiMappableDesaField] ?? entry.field;
  const isAdded    = entry.deltaType === "added";
  const isRemoved  = entry.deltaType === "removed";
  const isChanged  = entry.deltaType !== "unchanged";
  const beforeColor = isChanged ? "text-slate-400" : "text-slate-600";

  const beforeNode = isAdded
    ? <span className="italic text-slate-400">— belum diisi</span>
    : <span className={beforeColor + " tabular-nums"}>{formatDiffValue(entry.previous)}</span>;
  const afterNode = isRemoved
    ? <span className="italic">— dihapus</span>
    : <span>{formatDiffValue(entry.next)}</span>;

  const bg = rowBg[entry.deltaType];

  return (
    <>
      {/* ── Mobile card (< sm) ─────────────────────────────────────────── */}
      <div className={`sm:hidden rounded-xl px-3 py-2.5 transition-colors duration-150 ${bg}`}>
        <div className="flex items-center gap-2 mb-1.5">
          <div className={`w-1 h-3 rounded-sm flex-shrink-0 ${stripColor[entry.deltaType]}`} />
          <span className="text-[11px] text-slate-500 uppercase tracking-[0.04em] font-medium flex-1 truncate">{label}</span>
          <DeltaPill type={entry.deltaType} />
        </div>
        <div className="pl-3 flex items-baseline gap-2 flex-wrap text-[12.5px]">
          {beforeNode}
          {isChanged && <span className="text-slate-400 text-[11px]">→</span>}
          {isChanged && (
            <span className={`tabular-nums ${afterColor[entry.deltaType]}`}>{afterNode}</span>
          )}
        </div>
      </div>

      {/* ── Desktop grid row (sm+) ──────────────────────────────────────── */}
      <div
        className={`hidden sm:grid rounded-2xl transition-colors duration-150 ${bg}`}
        style={{ gridTemplateColumns: "4px 180px 1fr 24px 1fr", gap: "16px", alignItems: "center", padding: "12px 18px" }}
      >
        <div className={`self-stretch rounded-sm ${stripColor[entry.deltaType]}`} style={{ minHeight: 20 }} />
        <div className="text-[11px] text-slate-500 uppercase tracking-[0.04em] font-medium truncate">{label}</div>
        <div className="min-w-0 truncate">{beforeNode}</div>
        <div className="text-center text-slate-400 font-medium text-sm">{isChanged ? "→" : "·"}</div>
        <div className={`text-[13.5px] tabular-nums min-w-0 flex items-baseline flex-wrap gap-1 ${afterColor[entry.deltaType]}`}>
          {afterNode}
          <DeltaPill type={entry.deltaType} />
        </div>
      </div>
    </>
  );
}

// ─── Filter tab ─────────────────────────────────────────────────────────────

function FilterTab({ label, count, active, onClick }: { label: string; count: number; active: boolean; onClick: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`px-3 py-1.5 rounded-xl text-[12px] font-medium transition-all duration-150 ${
        active ? "bg-[#1E1B4B] text-white" : "text-slate-500 hover:bg-slate-100 hover:text-slate-900"
      }`}
    >
      {label}
      <span className={`ml-1 text-[10px] ${active ? "opacity-70" : "opacity-60"}`}>{count}</span>
    </button>
  );
}

// ─── Main ───────────────────────────────────────────────────────────────────

export function IntakeDiffTheatre({ result }: { result: PipelineResult }) {
  const [filter, setFilter] = useState<DiffFilter>("all");
  const [showUnchanged, setShowUnchanged] = useState(false);

  const diff = result.diff;

  if (!diff) {
    return (
      <section className="rounded-3xl bg-white p-7"
        style={{ boxShadow: "inset 0 0 0 1px rgba(15,23,42,0.06), 0 1px 1px rgba(15,23,42,0.03), 0 2px 4px rgba(15,23,42,0.04), 0 8px 20px -8px rgba(15,23,42,0.06)" }}>
        <p className="eyebrow text-indigo-600 mb-1.5">Diff · ujung tombak review</p>
        <p className="text-slate-500 text-sm">Pilih desa target untuk membandingkan hasil dengan data yang ada.</p>
      </section>
    );
  }

  const { entries, addedCount, updatedCount, removedCount } = diff;
  const unchangedEntries = entries.filter(e => e.deltaType === "unchanged");
  const changedEntries = entries.filter(e => e.deltaType !== "unchanged");
  const changeCount = addedCount + updatedCount + removedCount;

  // Apply filter
  const filteredEntries = (() => {
    const base = filter === "all"
      ? (showUnchanged ? entries : changedEntries)
      : entries.filter(e => {
          if (filter === "added") return e.deltaType === "added";
          if (filter === "updated") return e.deltaType === "updated";
          if (filter === "removed") return e.deltaType === "removed";
          if (filter === "unchanged") return e.deltaType === "unchanged";
          return true;
        });
    return base;
  })();

  // Group by section
  const sections = FIELD_SECTION_ORDER;
  const grouped = new Map<string, DiffEntry[]>();
  const otherKey = "Lainnya";

  for (const entry of filteredEntries) {
    const sec = FIELD_SECTION_MAP[entry.field as AiMappableDesaField] ?? otherKey;
    if (!grouped.has(sec)) grouped.set(sec, []);
    grouped.get(sec)!.push(entry);
  }

  // Keep section order
  const orderedSections: Array<[string, DiffEntry[]]> = [];
  for (const sec of [...sections, otherKey]) {
    if (grouped.has(sec)) orderedSections.push([sec, grouped.get(sec)!]);
  }

  return (
    <section className="rounded-3xl bg-white overflow-hidden"
      style={{ boxShadow: "inset 0 0 0 1px rgba(15,23,42,0.06), 0 1px 2px rgba(15,23,42,0.04), 0 4px 10px -2px rgba(15,23,42,0.06), 0 16px 36px -12px rgba(15,23,42,0.10)" }}>

      {/* Header */}
      <div className="px-4 sm:px-7 pt-6 pb-4 flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="eyebrow text-indigo-600 mb-1.5">Diff · ujung tombak review</p>
          <h2 className="text-[22px] sm:text-[28px] font-semibold leading-tight text-slate-900" style={{ letterSpacing: "-0.028em" }}>
            {changeCount > 0
              ? <>{changeCount} <span className="text-slate-400 font-normal">field akan berubah di halaman desa</span></>
              : <span className="text-slate-400 font-normal">Tidak ada perubahan dari data saat ini</span>}
          </h2>
          <p className="text-[12px] text-slate-500 mt-1.5">
            Hijau = baru · ungu = diperbarui · merah = hapus · abu = sama
          </p>
        </div>

        {/* Filter tabs */}
        <div className="flex items-center flex-wrap gap-1 p-1 rounded-xl bg-slate-50"
          style={{ boxShadow: "inset 0 0 0 1px rgba(15,23,42,0.06)" }}>
          <FilterTab label="Semua" count={entries.length} active={filter === "all"} onClick={() => setFilter("all")} />
          {addedCount > 0 && <FilterTab label="Baru" count={addedCount} active={filter === "added"} onClick={() => setFilter("added")} />}
          {updatedCount > 0 && <FilterTab label="Update" count={updatedCount} active={filter === "updated"} onClick={() => setFilter("updated")} />}
          {removedCount > 0 && <FilterTab label="Hapus" count={removedCount} active={filter === "removed"} onClick={() => setFilter("removed")} />}
          {unchangedEntries.length > 0 && (
            <FilterTab label="Sama" count={unchangedEntries.length} active={filter === "unchanged"} onClick={() => setFilter("unchanged")} />
          )}
        </div>
      </div>

      {/* Column header — desktop only */}
      <div className="hidden sm:grid px-7 pb-2"
        style={{ gridTemplateColumns: "4px 180px 1fr 24px 1fr", gap: "16px", alignItems: "center" }}>
        <div />
        <div />
        <div className="text-[10.5px] uppercase tracking-[0.18em] font-semibold text-slate-500 flex items-center gap-2">
          <span className="w-1.5 h-1.5 rounded-full bg-slate-300" />
          Saat ini
        </div>
        <div />
        <div className="text-[10.5px] uppercase tracking-[0.18em] font-semibold text-indigo-600 flex items-center gap-2">
          <span className="w-1.5 h-1.5 rounded-full bg-indigo-500" />
          Setelah publish · draft
        </div>
      </div>

      {/* Sections */}
      {filteredEntries.length === 0 ? (
        <div className="px-7 pb-6 text-sm italic text-slate-400">Tidak ada perubahan untuk filter ini.</div>
      ) : (
        orderedSections.map(([sectionName, sectionEntries]) => {
          const sectionChangedCount = sectionEntries.filter(e => e.deltaType !== "unchanged").length;
          return (
            <div key={sectionName} className="px-3 pb-2 border-t border-slate-100 first:border-t-0">
              <div className="px-5 pt-4 pb-1.5 flex items-center justify-between">
                <p className="text-[11px] uppercase tracking-[0.16em] font-semibold text-slate-700">
                  {sectionName}
                  <span className="text-slate-400 font-normal ml-1">· {sectionEntries.length} field</span>
                </p>
                {sectionChangedCount > 0 && (
                  <span className="text-[10.5px] text-slate-500 tabular-nums">{sectionChangedCount} berubah</span>
                )}
              </div>
              {sectionEntries.map((entry, i) => (
                <DiffRow key={`${entry.field}-${i}`} entry={entry} />
              ))}
            </div>
          );
        })
      )}

      {/* Footer */}
      <div className="px-7 py-4 bg-slate-50/60 border-t border-slate-100 flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3 text-[12px] text-slate-500">
          {filter === "all" && unchangedEntries.length > 0 && (
            <button
              type="button"
              onClick={() => setShowUnchanged(v => !v)}
              className="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl text-[11.5px] font-medium text-slate-600 hover:bg-slate-100 transition-colors"
            >
              {showUnchanged ? <ChevronUp size={11} /> : <ChevronDown size={11} />}
              {showUnchanged ? "Sembunyikan" : "Tampilkan"} {unchangedEntries.length} field tidak berubah
            </button>
          )}
          <span className="text-[11px]">
            Catatan: <span className="text-slate-700">guardrail aktif — publish final tetap di antrean review</span>
          </span>
        </div>
        <div className="flex items-center gap-2">
          {addedCount > 0 && (
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-50 text-emerald-900"
              style={{ boxShadow: "inset 0 0 0 1px rgba(5,95,70,0.12)" }}>
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />{addedCount} baru
            </span>
          )}
          {updatedCount > 0 && (
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-indigo-50 text-[#1E1B4B]"
              style={{ boxShadow: "inset 0 0 0 1px rgba(67,56,202,0.15)" }}>
              <span className="w-1.5 h-1.5 rounded-full bg-indigo-500" />{updatedCount} update
            </span>
          )}
          {removedCount > 0 && (
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-rose-50 text-rose-900"
              style={{ boxShadow: "inset 0 0 0 1px rgba(159,18,57,0.15)" }}>
              <span className="w-1.5 h-1.5 rounded-full bg-rose-500" />{removedCount} hapus
            </span>
          )}
        </div>
      </div>
    </section>
  );
}
