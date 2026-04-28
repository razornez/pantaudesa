import Link from "next/link";
import { MapPin } from "lucide-react";
import { Desa } from "@/lib/types";
import { formatRupiah, getStatusColor, getStatusLabel, getSerapanColor } from "@/lib/utils";
import { CARD } from "@/lib/copy";
import { DataStatusBadge } from "@/components/ui/DataStatusBadge";

interface Props {
  desa: Desa;
}

export default function DesaCard({ desa }: Props) {
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
          <span className={`flex-shrink-0 rounded-full border px-2.5 py-1 text-xs font-semibold ${getStatusColor(desa.status)}`}>
            {getStatusLabel(desa.status)}
          </span>
        </div>

        <div className="mt-2.5 flex items-start gap-1.5 text-slate-500">
          <MapPin size={13} className="mt-0.5 flex-shrink-0" aria-hidden />
          <span className="line-clamp-2 text-sm leading-relaxed sm:text-xs">
            {desa.kecamatan} / {desa.kabupaten} / {desa.provinsi}
          </span>
        </div>

        <div className="mt-4">
          <div className="mb-2 flex items-center justify-between gap-2 text-sm sm:text-xs">
            <div className="flex min-w-0 flex-wrap items-center gap-1.5 text-slate-600">
              <span>{CARD.penyerapan}</span>
              <DataStatusBadge status="demo" size="xs" />
            </div>
            <span className="font-bold text-slate-700">{desa.persentaseSerapan}%</span>
          </div>
          <div className="h-2.5 overflow-hidden rounded-full bg-slate-100 sm:h-2">
            <div
              className={`h-full rounded-full transition-all ${getSerapanColor(desa.persentaseSerapan)}`}
              style={{ width: `${desa.persentaseSerapan}%` }}
            />
          </div>
        </div>

        <div className="mt-4 grid grid-cols-2 gap-2.5">
          <div className="rounded-xl bg-slate-50 p-3 sm:p-2">
            <p className="text-[11px] font-semibold uppercase tracking-wide text-slate-500 sm:text-[10px]">Diterima</p>
            <p className="mt-0.5 text-sm font-bold text-slate-800 sm:text-xs">{formatRupiah(desa.totalAnggaran)}</p>
          </div>
          <div className="rounded-xl bg-slate-50 p-3 sm:p-2">
            <p className="text-[11px] font-semibold uppercase tracking-wide text-slate-500 sm:text-[10px]">Dipakai</p>
            <p className="mt-0.5 text-sm font-bold text-slate-800 sm:text-xs">{formatRupiah(desa.terealisasi)}</p>
          </div>
        </div>
      </div>
    </Link>
  );
}
