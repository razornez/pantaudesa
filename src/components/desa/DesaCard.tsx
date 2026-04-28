import Link from "next/link";
import { MapPin, Users, TrendingUp, ArrowRight } from "lucide-react";
import { Desa } from "@/lib/types";
import { formatRupiah, getStatusColor, getStatusLabel, getSerapanColor } from "@/lib/utils";
import { CARD } from "@/lib/copy";

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
        <div className="flex items-start justify-between mb-3">
          <div className="flex-1 min-w-0 pr-2">
            <h3 className="font-semibold text-slate-800 text-sm group-hover:text-indigo-600 transition-colors truncate">
              {desa.nama}
            </h3>
            <div className="flex items-center gap-1 mt-1 text-slate-400">
              <MapPin size={11} />
              <span className="text-xs truncate">{desa.kecamatan}, {desa.kabupaten}</span>
            </div>
          </div>
          <span className={`text-xs font-semibold px-2 py-0.5 rounded-full border flex-shrink-0 ${getStatusColor(desa.status)}`}>
            {getStatusLabel(desa.status)}
          </span>
        </div>

        <div className="mb-3">
          <div className="flex justify-between text-xs text-slate-500 mb-1">
            <span>{CARD.penyerapan}</span>
            <span className="font-semibold">{desa.persentaseSerapan}%</span>
          </div>
          <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
            <div
              className={`h-full rounded-full transition-all ${getSerapanColor(desa.persentaseSerapan)}`}
              style={{ width: `${desa.persentaseSerapan}%` }}
            />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-2 mb-3">
          <div className="bg-slate-50 rounded-xl p-2">
            <p className="text-xs text-slate-600">{CARD.anggaran}</p>
            <p className="text-xs font-semibold text-slate-700">{formatRupiah(desa.totalAnggaran)}</p>
          </div>
          <div className="bg-slate-50 rounded-xl p-2">
            <p className="text-xs text-slate-600">{CARD.realisasi}</p>
            <p className="text-xs font-semibold text-slate-700">{formatRupiah(desa.terealisasi)}</p>
          </div>
        </div>

        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3 text-xs text-slate-600">
            <span className="flex items-center gap-1"><Users size={11} aria-hidden />{desa.penduduk.toLocaleString("id-ID")} jiwa</span>
            <span className="flex items-center gap-1"><TrendingUp size={11} aria-hidden />{desa.kategori}</span>
          </div>
          <ArrowRight size={14} className="text-slate-300 group-hover:text-indigo-400 transition-colors" aria-hidden />
        </div>
      </div>
    </Link>
  );
}
