"use client";

import { useState } from "react";
import { ChevronDown, ChevronUp } from "lucide-react";
import { Desa } from "@/lib/types";
import BudgetBarChart from "./BudgetBarChart";
import APBDesBreakdown from "./APBDesBreakdown";
import RiwayatChart from "./RiwayatChart";
import OutputFisikCards from "./OutputFisikCards";

export default function KinerjaAnggaranCard({ desa }: { desa: Desa }) {
  const [open, setOpen] = useState(false);

  return (
    <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
      {/* Toggle header */}
      <button
        onClick={() => setOpen(v => !v)}
        className="w-full flex items-center justify-between px-5 py-4 hover:bg-slate-50 transition-colors text-left"
      >
        <div>
          <p className="text-sm font-bold text-slate-800">Kinerja &amp; Rincian Anggaran</p>
          <p className="text-xs text-slate-400 mt-0.5">Chart historis, APBDes per bidang, output fisik, tren 5 tahun</p>
        </div>
        <div className={`w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0 transition-colors ${open ? "bg-indigo-100" : "bg-slate-100"}`}>
          {open
            ? <ChevronUp size={16} className="text-indigo-600" />
            : <ChevronDown size={16} className="text-slate-500" />
          }
        </div>
      </button>

      {/* Expandable content */}
      {open && (
        <div className="border-t border-slate-100 p-4 sm:p-5 space-y-4">
          {desa.outputFisik && <OutputFisikCards items={desa.outputFisik} />}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <BudgetBarChart desa={desa} />
            {desa.apbdes && <APBDesBreakdown items={desa.apbdes} />}
          </div>
          {desa.riwayat && <RiwayatChart riwayat={desa.riwayat} />}
        </div>
      )}
    </div>
  );
}
