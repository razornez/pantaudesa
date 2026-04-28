import { FileText, Gauge, ShieldCheck } from "lucide-react";
import { Desa } from "@/lib/types";
import { DataStatusBadge } from "@/components/ui/DataStatusBadge";

export default function DetailStickySummary({ desa }: { desa: Desa }) {
  const totalDokumen = desa.dokumen?.length ?? 0;
  const dokumenTersedia = desa.dokumen?.filter((d) => d.tersedia).length ?? 0;
  const skor = desa.skorTransparansi?.total ?? null;

  return (
    <div className="sticky top-16 z-30 rounded-2xl border border-slate-200 bg-white/95 p-2 shadow-lg shadow-slate-200/60 backdrop-blur">
      <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
        <a
          href="#anggaran"
          className="group rounded-xl border border-slate-100 bg-slate-50 px-3 py-2 transition-all hover:-translate-y-0.5 hover:border-emerald-200 hover:bg-emerald-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500"
        >
          <span className="flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-wide text-slate-500">
            <Gauge size={12} className="text-emerald-600" aria-hidden /> Serapan
          </span>
          <span className="mt-0.5 block text-base font-black text-emerald-700">{desa.persentaseSerapan}%</span>
        </a>

        <a
          href="#dokumen-desa"
          className="group rounded-xl border border-slate-100 bg-slate-50 px-3 py-2 transition-all hover:-translate-y-0.5 hover:border-sky-200 hover:bg-sky-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-500"
        >
          <span className="flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-wide text-slate-500">
            <FileText size={12} className="text-sky-600" aria-hidden /> Dokumen
          </span>
          <span className="mt-0.5 block text-base font-black text-sky-700">
            {dokumenTersedia}/{totalDokumen || "-"}
          </span>
        </a>

        <a
          href="#dokumen-transparansi"
          className="group rounded-xl border border-slate-100 bg-slate-50 px-3 py-2 transition-all hover:-translate-y-0.5 hover:border-indigo-200 hover:bg-indigo-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500"
        >
          <span className="flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-wide text-slate-500">
            <ShieldCheck size={12} className="text-indigo-600" aria-hidden /> Keterbukaan
          </span>
          <span className="mt-0.5 block text-base font-black text-indigo-700">
            {skor ?? "-"}/100
          </span>
        </a>

        <div className="rounded-xl border border-amber-100 bg-amber-50 px-3 py-2">
          <span className="block text-[10px] font-bold uppercase tracking-wide text-amber-700">Status</span>
          <DataStatusBadge status="demo" size="xs" className="mt-1" />
        </div>
      </div>
    </div>
  );
}
