/**
 * Sprint 05 Batch 3 - Structured Value Diff / Conflict Engine
 *
 * Compares the incoming mapped fields against current published village data
 * and produces human-readable diff entries for the review workbench.
 *
 * Library: jsondiffpatch — selected for:
 *   - small bundle, no external dependencies,
 *   - structured delta format (add/remove/update),
 *   - well-typed TypeScript types,
 *   - active maintenance (as of 2025).
 *
 * Guardrails:
 *  - pure function, no DB access, no side effects,
 *  - diff output is preview only — never auto-applies anything.
 */

import { diff } from "jsondiffpatch";
import type { AiMappableDesaField, AiMappingFields } from "@/lib/admin-claim/ai-mapping";

export type DiffDeltaType = "added" | "removed" | "updated" | "unchanged";

export interface DiffEntry {
  field: AiMappableDesaField;
  deltaType: DiffDeltaType;
  previous?: string | number | null;
  next?: string | number | null;
  changed?: string;   // human-readable change label
}

export interface DiffResult {
  entries: DiffEntry[];
  hasChanges: boolean;
  addedCount: number;
  updatedCount: number;
  removedCount: number;
  generatedAt: string;
}

// Map field label for display
const FIELD_LABELS: Record<AiMappableDesaField, string> = {
  websiteUrl: "Website resmi",
  kategori: "Kategori desa",
  tahunData: "Tahun data",
  jumlahPenduduk: "Jumlah penduduk",
  kecamatan: "Kecamatan",
  kabupaten: "Kabupaten/Kota",
  provinsi: "Provinsi",
};

function fmt(v: string | number | null | undefined): string {
  if (v === null || v === undefined) return "(kosong)";
  return String(v);
}

export function diffFields(
  current: Partial<Record<AiMappableDesaField, string | number | null>>,
  incoming: AiMappingFields,
): DiffResult {
  const entries: DiffEntry[] = [];
  let addedCount = 0;
  let updatedCount = 0;
  let removedCount = 0;

  for (const field of Object.keys(incoming) as AiMappableDesaField[]) {
    const next = incoming[field] ?? null;
    const prev = current[field] ?? null;

    // jsondiffpatch expects plain objects
    const d = diff(
      prev === null ? undefined : { v: prev },
      next === null ? undefined : { v: next },
    );

    let deltaType: DiffDeltaType = "unchanged";
    if (!d) {
      deltaType = "unchanged";
    } else if (d[0] === undefined && d[1] !== undefined) {
      deltaType = "added";
      addedCount++;
    } else if (d[0] !== undefined && d[1] === undefined) {
      deltaType = "removed";
      removedCount++;
    } else if (d[0] !== undefined && d[1] !== undefined) {
      deltaType = "updated";
      updatedCount++;
    }

    const changedLabel = (() => {
      if (deltaType === "unchanged") return undefined;
      if (deltaType === "added") return `${FIELD_LABELS[field]}: menambahkan "${fmt(next)}"`;
      if (deltaType === "removed") return `${FIELD_LABELS[field]}: menghapus "${fmt(prev)}"`;
      return `${FIELD_LABELS[field]}: "${fmt(prev)}" → "${fmt(next)}"`;
    })();

    entries.push({
      field,
      deltaType,
      previous: prev,
      next,
      changed: changedLabel,
    });
  }

  return {
    entries,
    hasChanges: addedCount + updatedCount + removedCount > 0,
    addedCount,
    updatedCount,
    removedCount,
    generatedAt: new Date().toISOString(),
  };
}
