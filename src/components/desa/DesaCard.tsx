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
      className="group block focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 focus-visible:ring-offset-2 rounded-2xl"
      aria-label={`Lihat detail ${desa.nama}, ${desa.kecamatan}, ${desa.kabupaten}`}
    >
      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-4 hover:shadow-md hover:border-indigo-100 transition-all h-full">
        <div className="flex items-start justify-between gap-3">
          <div className="flex-1 min-w-0 pr-2">
            <h3 className="font-semibold text-slate-800 text-sm group-hover:text-indigo-600 transition-colors truncate">
              {desa.nama}
            </h3>
          </div>
          <span className={`text-xs font-semibold px-2 py-0.5 rounded-full border flex-shrink-0 ${getStatusColor(desa.status)}`}>
            {getStatusLabel(desa.status)}
          </span>
        </div>

        <div className="mt-2 flex items-start gap-1 text-slate-400">
          <MapPin size={11} className="mt-0.5 flex-shrink-0" aria-hidden />
          <span className="text-xs leading-relaxed line-clamp-2">
            {desa.kecamatan} / {desa.kabupaten} / {desa.provinsi}
          </span>
        </div>

        <div className="mt-4">
          <div className="mb-1.5 flex items-center justify-between gap-2 text-xs">
            <div className="flex min-w-0 flex-wrap items-center gap-1.5 text-slate-500">
              <span>{CARD.penyerapan}</span>
              <DataStatusBadge status="demo" size="xs" />
            </div>
            <span className="font-semibold text-slate-700">{desa.persentaseSerapan}%</span>
          </div>
          <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
            <div
              className={`h-full rounded-full transition-all ${getSerapanColor(desa.persentaseSerapan)}`}
              style={{ width: `${desa.persentaseSerapan}%` }}
            />
          </div>
        </div>

        <div className="mt-4 grid grid-cols-2 gap-2">
          <div className="bg-slate-50 rounded-xl p-2">
            <p className="text-[10px] font-medium uppercase tracking-wide text-slate-400">Diterima</p>
            <p className="text-xs font-semibold text-slate-700">{formatRupiah(desa.totalAnggaran)}</p>
          </div>
          <div className="bg-slate-50 rounded-xl p-2">
            <p className="text-[10px] font-medium uppercase tracking-wide text-slate-400">Dipakai</p>
            <p className="text-xs font-semibold text-slate-700">{formatRupiah(desa.terealisasi)}</p>
          </div>
        </div>
      </div>
    </Link>
  );
}
