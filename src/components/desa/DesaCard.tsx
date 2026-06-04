import Link from "next/link";
import { CalendarClock, FileText, MapPin } from "lucide-react";
import { Desa } from "@/lib/types";
import { formatRupiah, getStatusColor, getStatusLabel } from "@/lib/utils";
import { DataStatusBadge, type DataStatusKind } from "@/components/ui/DataStatusBadge";

interface Props {
  desa: Desa & {
    dataOrigin?: "database";
    identityStatus?: DataStatusKind;
    budgetStatus?: "demo";
    sourceSummary?: string;
  };
}

export default function DesaCard({ desa }: Props) {
  const identityStatus = desa.identityStatus ?? "demo";
  const sourceSummary = desa.sourceSummary ?? desa.ringkasanSumber ?? "Sumber publik belum tercatat.";

  return (
    <Link
      href={`/desa/${desa.id}`}
      className="group block rounded-2xl focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 focus-visible:ring-offset-2"
      aria-label={`Lihat detail ${desa.nama}, ${desa.kecamatan}, ${desa.kabupaten}`}
    >
      <div className="h-full rounded-2xl border border-slate-100 bg-white p-4 shadow-sm transition-all hover:border-indigo-100 hover:shadow-md sm:p-5">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0 flex-1 pr-2">
            <h3 className="truncate text-base font-bold text-slate-800 transition-colors group-hover:text-indigo-600 sm:text-sm">
              {desa.nama}
            </h3>
          </div>
          {desa.totalAnggaran > 0 ? (
            <span className={`flex-shrink-0 rounded-full border px-2.5 py-1 text-xs font-semibold ${getStatusColor(desa.status)}`}>
              {getStatusLabel(desa.status)}
            </span>
          ) : (
            <span className="flex-shrink-0 rounded-full border border-slate-200 px-2.5 py-1 text-xs font-medium text-slate-400">
              Belum ada data
            </span>
          )}
        </div>

        <div className="mt-2 flex flex-wrap items-center gap-1.5">
          <DataStatusBadge status={identityStatus} size="xs" />
          {desa.jumlahDokumenPendukung !== undefined && (
            <span className="inline-flex items-center gap-1 rounded-full border border-slate-200 bg-slate-50 px-2 py-0.5 text-[10px] font-bold text-slate-600">
              <FileText size={10} aria-hidden />
              {desa.jumlahDokumenPendukung} dokumen
            </span>
          )}
        </div>
        <p className="mt-1.5 text-[11px] leading-relaxed text-slate-500">
          {sourceSummary}
        </p>
        {desa.terakhirDiperbaruiLabel && (
          <p className="mt-1 inline-flex items-center gap-1 text-[10px] font-semibold text-slate-400">
            <CalendarClock size={10} aria-hidden />
            {desa.terakhirDiperbaruiLabel}
          </p>
        )}

        <div className="mt-2.5 flex items-start gap-1.5 text-slate-500">
          <MapPin size={13} className="mt-0.5 flex-shrink-0" aria-hidden />
          <span className="line-clamp-2 text-sm leading-relaxed sm:text-xs">
            {desa.kecamatan} / {desa.kabupaten} / {desa.provinsi}
          </span>
        </div>

        <div className="mt-4">
          <div className="mb-2 flex items-center justify-between gap-2 text-sm sm:text-xs">
            <span className="text-slate-500">Kelengkapan data</span>
            <span className="font-bold text-slate-700">{desa.completenessScore ?? 0}%</span>
          </div>
          <div className="h-2.5 overflow-hidden rounded-full bg-slate-100 sm:h-2">
            <div
              className={`h-full rounded-full transition-all ${
                (desa.completenessScore ?? 0) >= 75 ? "bg-emerald-500" :
                (desa.completenessScore ?? 0) >= 40 ? "bg-sky-500" :
                (desa.completenessScore ?? 0) >= 15 ? "bg-amber-400" : "bg-slate-300"
              }`}
              style={{ width: `${desa.completenessScore ?? 0}%` }}
            />
          </div>
        </div>

        {/* Dana Desa pagu from DJPK */}
        {(desa.paguDanaDesa ?? 0) > 0 && (
          <div className="mt-3 rounded-xl bg-indigo-50 px-3 py-2">
            <div className="flex items-center justify-between gap-2 mb-1.5">
              <span className="text-[10px] font-semibold uppercase tracking-wide text-indigo-600">Dana Desa (DJPK)</span>
              <span className="text-[11px] font-bold text-indigo-700">{formatRupiah(desa.paguDanaDesa ?? 0)}</span>
            </div>
          </div>
        )}
      </div>
    </Link>
  );
}
