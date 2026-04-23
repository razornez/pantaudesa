export function formatRupiah(value: number): string {
  if (value >= 1_000_000_000) {
    return `Rp ${(value / 1_000_000_000).toFixed(1)} M`;
  }
  if (value >= 1_000_000) {
    return `Rp ${(value / 1_000_000).toFixed(0)} Jt`;
  }
  return `Rp ${value.toLocaleString("id-ID")}`;
}

export function formatRupiahFull(value: number): string {
  return `Rp ${value.toLocaleString("id-ID")}`;
}

export function getStatusColor(status: string): string {
  switch (status) {
    case "baik": return "bg-emerald-100 text-emerald-700 border-emerald-200";
    case "sedang": return "bg-amber-100 text-amber-700 border-amber-200";
    case "rendah": return "bg-rose-100 text-rose-700 border-rose-200";
    default: return "bg-slate-100 text-slate-700 border-slate-200";
  }
}

export function getStatusLabel(status: string): string {
  switch (status) {
    case "baik": return "Baik";
    case "sedang": return "Sedang";
    case "rendah": return "Rendah";
    default: return status;
  }
}

export function getSerapanColor(persen: number): string {
  if (persen >= 85) return "bg-emerald-500";
  if (persen >= 60) return "bg-amber-500";
  return "bg-rose-500";
}
