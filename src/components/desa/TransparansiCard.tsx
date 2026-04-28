"use client";

import { useState } from "react";
import Image from "next/image";
import { FileText, ExternalLink, BarChart3, Users2 } from "lucide-react";
import { Desa } from "@/lib/types";
import { ASSETS } from "@/lib/assets";
import { SECTION, DOKUMEN } from "@/lib/copy";
import SkorTransparansiCard from "./SkorTransparansiCard";
import PerangkatDesaSection from "./PerangkatDesaSection";

type Tab = "transparansi" | "perangkat" | "dokumen";

export default function TransparansiCard({ desa }: { desa: Desa }) {
  const [tab, setTab] = useState<Tab>("dokumen");
  const tersediaCount = desa.dokumen?.filter(d => d.tersedia).length ?? 0;
  const totalDok      = desa.dokumen?.length ?? 0;

  const tabs: { id: Tab; label: string; icon: React.ElementType; badge?: string }[] = [
    { id: "dokumen",      label: "Dokumen",       icon: FileText,
      badge: totalDok > 0 ? `${tersediaCount}/${totalDok}` : undefined },
    { id: "transparansi", label: "Transparansi", icon: BarChart3 },
    { id: "perangkat",    label: "Perangkat",    icon: Users2 },
  ];

  return (
    <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
      {/* Tab bar — clean, no illustration header */}
      <div className="flex border-b border-slate-100 bg-slate-50/40">
        {tabs.map(t => {
          const Icon = t.icon;
          return (
            <button
              key={t.id}
              onClick={() => setTab(t.id)}
              className={`flex items-center gap-1.5 px-4 py-3.5 text-xs font-bold border-b-2 transition-all flex-1 justify-center ${
                tab === t.id
                  ? "border-indigo-500 text-indigo-600 bg-white"
                  : "border-transparent text-slate-500 hover:text-slate-700"
              }`}
            >
              <Icon size={13} />
              {t.label}
              {t.badge && (
                <span className={`text-[9px] font-black px-1.5 py-0.5 rounded-full ${
                  tersediaCount === totalDok ? "bg-emerald-100 text-emerald-700" : "bg-amber-100 text-amber-700"
                }`}>{t.badge}</span>
              )}
            </button>
          );
        })}
      </div>

      {/* Content */}
      <div className="p-4 sm:p-5">

        {/* Transparansi — hanya skor, tanpa banner gambar */}
        {tab === "transparansi" && desa.skorTransparansi && (
          <div className="space-y-3">
            <div className="flex items-center gap-2 pb-3 border-b border-slate-100">
              <div className="w-8 h-8 rounded-xl bg-sky-100 flex items-center justify-center">
                <BarChart3 size={15} className="text-sky-600" />
              </div>
              <div>
                <p className="text-sm font-bold text-slate-800">Keterbukaan Informasi Desa</p>
                <p className="text-xs text-slate-400">Seberapa terbuka desa ini ke warganya?</p>
              </div>
            </div>
            <SkorTransparansiCard skor={desa.skorTransparansi} />
          </div>
        )}

        {/* Perangkat — header teks berwarna, tanpa banner gambar */}
        {tab === "perangkat" && desa.perangkat && (
          <div className="space-y-3">
            <div className="flex items-center gap-2 pb-3 border-b border-slate-100">
              <div className="w-8 h-8 rounded-xl bg-indigo-100 flex items-center justify-center">
                <Users2 size={15} className="text-indigo-600" />
              </div>
              <div>
                <p className="text-sm font-bold text-slate-800">Perangkat Desa</p>
                <p className="text-xs text-slate-400">Siapa yang bertanggung jawab di desa ini?</p>
              </div>
            </div>
            <PerangkatDesaSection perangkat={desa.perangkat} />
          </div>
        )}

        {/* Dokumen — thumbnail kecil tetap, lebih compact */}
        {tab === "dokumen" && desa.dokumen && (
          <div>
            <div className="flex items-center gap-3 mb-4 pb-3 border-b border-slate-100">
              <div className="relative w-12 h-12 flex-shrink-0 rounded-xl overflow-hidden bg-indigo-50">
                <Image src={ASSETS.illustrationDocs} alt="Dokumen" fill className="object-cover" />
              </div>
              <div>
                <p className="text-sm font-bold text-slate-800">{SECTION.dokumen}</p>
                <p className="text-xs text-slate-400">{SECTION.dokumenSub}</p>
              </div>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {desa.dokumen.map((dok, i) => (
                <div key={i} className={`flex items-center gap-3 p-3 rounded-xl border ${
                  dok.tersedia ? "border-emerald-100 bg-emerald-50" : "border-slate-100 bg-slate-50 opacity-60"
                }`}>
                  <div className={`w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 ${
                    dok.tersedia ? "bg-emerald-100" : "bg-slate-200"
                  }`}>
                    <FileText size={13} className={dok.tersedia ? "text-emerald-600" : "text-slate-400"} />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-xs font-semibold text-slate-700 truncate">{dok.nama}</p>
                    <p className="text-[10px] text-slate-400">{dok.jenis} · {dok.tahun}</p>
                  </div>
                  {dok.tersedia
                    ? <button className="flex-shrink-0 text-emerald-600 hover:text-emerald-700" title={DOKUMEN.tersedia}><ExternalLink size={13} /></button>
                    : <span className="flex-shrink-0 text-[10px] text-rose-400 font-medium">{DOKUMEN.belum}</span>
                  }
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
