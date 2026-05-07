"use client";

import type { PipelineResult, DiffEntry } from "./types";
import { DELTA_LABELS, FIELD_LABELS } from "./constants";
import { formatDiffValue } from "./utils";
import { IntakeSection } from "./IntakeSection";

interface IntakeDiffPanelProps {
  result: PipelineResult;
}

export function IntakeDiffPanel({ result }: IntakeDiffPanelProps) {
  const diff = result.diff;

  if (!diff) {
    return (
      <IntakeSection title="Diff" defaultOpen={false}>
        <p className="text-xs italic text-slate-400">
          Belum ada desa target. Pilih desa dari daftar jika ingin membandingkan hasil intake ini dengan data desa yang sudah ada.
        </p>
        <p className="mt-2 text-xs text-slate-500">
          Tanpa desa terpilih, preview ini tidak akan mengganti, membandingkan, atau mengarahkan perubahan ke desa mana pun.
        </p>
      </IntakeSection>
    );
  }

  const changedEntries = diff.entries.filter((e) => e.deltaType !== "unchanged");
  const changeCount = diff.addedCount + diff.updatedCount + diff.removedCount;

  return (
    <IntakeSection
      title={`Diff (${changeCount} perubahan)`}
      defaultOpen={true}
      badge={changeCount > 0 ? String(changeCount) : undefined}
      badgeClassName="bg-sky-50 text-sky-700"
    >
      {!diff.hasChanges ? (
        <p className="text-xs italic text-slate-500">
          Tidak ada perubahan dari data saat ini.
        </p>
      ) : (
        <div className="space-y-3">
          {changedEntries.map((entry, index) => (
            <DiffEntryCard key={index} entry={entry} />
          ))}
        </div>
      )}
    </IntakeSection>
  );
}

interface DiffEntryCardProps {
  entry: DiffEntry;
}

function DiffEntryCard({ entry }: DiffEntryCardProps) {
  const badgeClass = getDiffBadgeClass(entry.deltaType);

  return (
    <div className="rounded-xl border border-slate-100 bg-white p-3">
      <div className="mb-2 flex flex-wrap items-center justify-between gap-2">
        <p className="font-semibold text-slate-900">{FIELD_LABELS[entry.field]}</p>
        <span className={`rounded-full px-2 py-0.5 text-[10px] font-semibold ${badgeClass}`}>
          {DELTA_LABELS[entry.deltaType]}
        </span>
      </div>

      <div className="grid gap-2 sm:grid-cols-[1fr_auto_1fr]">
        <div className="rounded-lg border border-rose-100 bg-rose-50/50 p-2">
          <p className="text-[10px] font-semibold uppercase tracking-[0.12em] text-rose-700">
            Sebelum
          </p>
          <p className="mt-1 text-xs text-slate-700">
            {formatDiffValue(entry.previous)}
          </p>
        </div>

        <div className="flex items-center justify-center text-[10px] font-medium text-slate-400">
          ↓
        </div>

        <div className="rounded-lg border border-emerald-100 bg-emerald-50/50 p-2">
          <p className="text-[10px] font-semibold uppercase tracking-[0.12em] text-emerald-700">
            Sesudah
          </p>
          <p className="mt-1 text-xs font-medium text-slate-900">
            {formatDiffValue(entry.next)}
          </p>
        </div>
      </div>

      {entry.changed && (
        <p className="mt-2 text-[11px] text-slate-500">{entry.changed}</p>
      )}
    </div>
  );
}

function getDiffBadgeClass(deltaType: DiffEntry["deltaType"]) {
  switch (deltaType) {
    case "added":
      return "bg-emerald-50 text-emerald-700";
    case "removed":
      return "bg-rose-50 text-rose-700";
    case "updated":
      return "bg-amber-50 text-amber-700";
    default:
      return "bg-slate-100 text-slate-600";
  }
}
