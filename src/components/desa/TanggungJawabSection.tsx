"use client";

import { useState } from "react";
import { ExternalLink, Phone, ChevronRight, AlertTriangle, Lightbulb } from "lucide-react";
import { Desa } from "@/lib/types";
import { getResponsibilities, ProblemCategory } from "@/lib/responsibility";

interface Props {
  desa: Desa;
}

// ─── Warna per level eskalasi ─────────────────────────────────────────────────

const LEVEL_STYLE = {
  1: {
    ring:   "bg-emerald-500",
    border: "border-emerald-200",
    bg:     "bg-emerald-50",
    label:  "Hubungi Pertama",
    lColor: "text-emerald-700 bg-emerald-100",
  },
  2: {
    ring:   "bg-amber-500",
    border: "border-amber-200",
    bg:     "bg-amber-50",
    label:  "Jika Tidak Direspons",
    lColor: "text-amber-700 bg-amber-100",
  },
  3: {
    ring:   "bg-rose-500",
    border: "border-rose-200",
    bg:     "bg-rose-50",
    label:  "Eskalasi Terakhir",
    lColor: "text-rose-700 bg-rose-100",
  },
} as const;

// ─── Sub-komponen: satu langkah eskalasi ─────────────────────────────────────

function EscalationCard({ step, isLast }: { step: ProblemCategory["eskalasi"][number]; isLast: boolean }) {
  const style = LEVEL_STYLE[step.level];

  return (
    <div className="flex gap-3">
      {/* Timeline line + circle */}
      <div className="flex flex-col items-center flex-shrink-0">
        <div className={`w-7 h-7 rounded-full ${style.ring} flex items-center justify-center text-white font-black text-xs shadow-sm flex-shrink-0`}>
          {step.level}
        </div>
        {!isLast && <div className="w-0.5 flex-1 bg-slate-200 mt-1.5 mb-1.5" />}
      </div>

      {/* Content */}
      <div className={`flex-1 rounded-xl border p-4 mb-3 ${style.border} ${style.bg}`}>
        <div className="flex flex-wrap items-center gap-2 mb-2">
          <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${style.lColor}`}>
            {style.label}
          </span>
        </div>

        <p className="text-sm font-bold text-slate-800 mb-1.5">{step.pihak}</p>
        <p className="text-xs text-slate-600 leading-relaxed mb-3">{step.keterangan}</p>

        {/* Kontak & URL */}
        <div className="flex flex-wrap gap-2">
          {step.kontak && (
            <a
              href={`tel:${step.kontak.replace(/\D/g, "")}`}
              className="inline-flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-lg bg-white border border-current text-slate-600 hover:text-indigo-600 hover:border-indigo-300 transition-colors"
            >
              <Phone size={11} />
              {step.kontak}
            </a>
          )}
          {step.url && (
            <a
              href={step.url}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-lg bg-white border border-indigo-200 text-indigo-600 hover:bg-indigo-50 transition-colors"
            >
              <ExternalLink size={11} />
              {step.labelUrl ?? step.url}
            </a>
          )}
        </div>
      </div>
    </div>
  );
}

// ─── Komponen utama ────────────────────────────────────────────────────────────

export default function TanggungJawabSection({ desa }: Props) {
  const categories   = getResponsibilities(desa);
  const [active, setActive] = useState<string>(categories[0].id);
  const current      = categories.find(c => c.id === active) ?? categories[0];

  return (
    <div className="rounded-2xl border border-slate-200 overflow-hidden shadow-sm">

      {/* Header */}
      <div className="bg-gradient-to-r from-slate-900 to-slate-800 px-5 sm:px-6 py-5">
        <div className="flex items-center gap-2 mb-2">
          <AlertTriangle size={16} className="text-amber-400" />
          <p className="text-xs text-slate-400 font-semibold uppercase tracking-widest">Panduan Warga</p>
        </div>
        <h2 className="text-lg sm:text-xl font-black text-white">
          Siapa yang Bertanggung Jawab?
        </h2>
        <p className="text-slate-400 text-xs mt-1.5 leading-relaxed">
          Pilih masalahmu di bawah — kami tunjukkan ke mana harus melapor, langkah demi langkah.
        </p>
      </div>

      {/* Tab selector */}
      <div className="border-b border-slate-200 bg-white overflow-x-auto">
        <div className="flex min-w-max px-2 pt-2">
          {categories.map((cat) => (
            <button
              key={cat.id}
              onClick={() => setActive(cat.id)}
              className={`flex items-center gap-1.5 px-3.5 py-2.5 text-xs font-semibold rounded-t-lg border-b-2 transition-all whitespace-nowrap mr-1 ${
                active === cat.id
                  ? "border-indigo-500 text-indigo-700 bg-indigo-50"
                  : "border-transparent text-slate-500 hover:text-slate-700 hover:bg-slate-50"
              }`}
            >
              <span>{cat.icon}</span>
              {cat.labelTab}
            </button>
          ))}
        </div>
      </div>

      {/* Body */}
      <div className="bg-slate-50 px-5 sm:px-6 py-5">

        {/* Problem title */}
        <div className="mb-5">
          <h3 className="text-base font-bold text-slate-800 mb-1">{current.judul}</h3>
          <p className="text-xs text-slate-500 leading-relaxed">{current.deskripsi}</p>
        </div>

        {/* Escalation chain */}
        <div className="mb-4">
          {current.eskalasi.map((step, i) => (
            <EscalationCard
              key={i}
              step={step}
              isLast={i === current.eskalasi.length - 1}
            />
          ))}
        </div>

        {/* Tips */}
        {current.tips && (
          <div className="flex items-start gap-2.5 rounded-xl bg-amber-50 border border-amber-200 px-4 py-3">
            <Lightbulb size={14} className="text-amber-500 flex-shrink-0 mt-0.5" />
            <p className="text-xs text-amber-800 leading-relaxed">
              <span className="font-bold">Tips: </span>{current.tips}
            </p>
          </div>
        )}

        {/* Universal lapor button */}
        <div className="mt-4 flex items-center gap-3 p-3.5 rounded-xl bg-white border border-slate-200">
          <div className="w-8 h-8 rounded-lg bg-indigo-600 flex items-center justify-center flex-shrink-0">
            <ChevronRight size={16} className="text-white" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-xs font-semibold text-slate-700">Untuk semua masalah:</p>
            <p className="text-xs text-slate-400">LAPOR.go.id · Hotline <strong>1708</strong> · Wajib direspons dalam 5 hari kerja</p>
          </div>
          <a
            href="https://www.lapor.go.id"
            target="_blank"
            rel="noopener noreferrer"
            className="flex-shrink-0 inline-flex items-center gap-1 text-xs font-bold text-indigo-600 hover:text-indigo-800 transition-colors"
          >
            Lapor <ExternalLink size={11} />
          </a>
        </div>
      </div>
    </div>
  );
}
