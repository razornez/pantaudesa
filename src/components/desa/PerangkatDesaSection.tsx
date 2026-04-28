import { PerangkatDesa } from "@/lib/types";
import { User, Building2 } from "lucide-react";
import { SECTION } from "@/lib/copy";

interface Props {
  perangkat: PerangkatDesa[];
}

const JABATAN_COLORS: Record<string, string> = {
  "Kepala Desa":    "bg-indigo-100 text-indigo-700",
  "Sekretaris Desa":"bg-sky-100 text-sky-700",
  "Bendahara Desa": "bg-emerald-100 text-emerald-700",
};

export default function PerangkatDesaSection({ perangkat }: Props) {
  return (
    <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5">
      <div className="mb-4">
        <h2 className="text-base font-semibold text-slate-800">{SECTION.perangkat}</h2>
        <p className="text-xs text-slate-500 mt-0.5">{SECTION.perangkatSub}</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {perangkat.map((p, i) => (
          <div key={i} className="flex items-start gap-3 p-3 rounded-xl bg-slate-50 border border-slate-100">
            <div className="w-8 h-8 rounded-full bg-white border border-slate-200 flex items-center justify-center flex-shrink-0">
              <User size={14} className="text-slate-500" />
            </div>
            <div className="min-w-0 flex-1">
              <span className={`inline-block text-xs font-semibold px-2 py-0.5 rounded-full mb-1 ${JABATAN_COLORS[p.jabatan] ?? "bg-slate-100 text-slate-600"}`}>
                {p.jabatan}
              </span>
              <p className="text-sm font-medium text-slate-800 truncate">{p.nama}</p>
              {p.periode && (
                <p className="text-xs text-slate-400 mt-0.5">Masa jabatan {p.periode}</p>
              )}
              {p.kontak && (
                <div className="flex items-center gap-1 mt-1">
                  <Building2 size={10} className="text-slate-400" aria-hidden />
                  <span className="text-xs text-slate-500">Nomor kantor desa — hubungi via kanal resmi</span>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
