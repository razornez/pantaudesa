import { VerdictTone } from "./verdicts";
import { STATUS_LABELS } from "./copy";

// ─── Format angka ─────────────────────────────────────────────────────────────

export function formatRupiah(value: number): string {
  if (value >= 1_000_000_000) return `Rp ${(value / 1_000_000_000).toFixed(1)} M`;
  if (value >= 1_000_000)     return `Rp ${(value / 1_000_000).toFixed(0)} Jt`;
  return `Rp ${value.toLocaleString("id-ID")}`;
}

export function formatRupiahFull(value: number): string {
  return `Rp ${value.toLocaleString("id-ID")}`;
}

export function formatRupiahMock(value: number): string {
  return `${formatRupiah(value)} (mock)`;
}

export function formatRupiahFullMock(value: number): string {
  return `${formatRupiahFull(value)} (mock)`;
}

// ─── Status desa ──────────────────────────────────────────────────────────────

/** Label ramah warga berdasarkan status kinerja. Sumber kebenaran ada di copy.ts. */
export function getStatusLabel(status: string): string {
  return STATUS_LABELS[status] ?? status;
}

export function getStatusColor(status: string): string {
  switch (status) {
    case "baik":   return "bg-emerald-100 text-emerald-700 border-emerald-200";
    case "sedang": return "bg-amber-100 text-amber-700 border-amber-200";
    case "rendah": return "bg-rose-100 text-rose-700 border-rose-200";
    default:       return "bg-slate-100 text-slate-700 border-slate-200";
  }
}

export function getSerapanColor(persen: number): string {
  if (persen >= 85) return "bg-emerald-500";
  if (persen >= 60) return "bg-amber-500";
  return "bg-rose-500";
}

// ─── Verdict tone → Tailwind classes ─────────────────────────────────────────

/**
 * Mengkonversi tone verdict ke Tailwind color classes.
 * Dipisahkan dari verdicts.ts agar logika UI tidak masuk ke layer domain.
 */
export function getVerdictColors(tone: VerdictTone): {
  text: string;
  bg: string;
  border: string;
  icon: string;
} {
  switch (tone) {
    case "positive":
      return { text: "text-emerald-700", bg: "bg-emerald-50", border: "border-emerald-200", icon: "text-emerald-500" };
    case "warning":
      return { text: "text-amber-700",   bg: "bg-amber-50",   border: "border-amber-200",   icon: "text-amber-500" };
    case "danger":
      return { text: "text-rose-700",    bg: "bg-rose-50",    border: "border-rose-200",    icon: "text-rose-500" };
    default:
      return { text: "text-slate-600",   bg: "bg-slate-50",   border: "border-slate-200",   icon: "text-slate-400" };
  }
}
