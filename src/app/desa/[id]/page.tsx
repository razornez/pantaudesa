import Link from "next/link";
import Image from "next/image";
import { notFound } from "next/navigation";
import {
  ArrowLeft, Wallet, CheckCircle2, Clock, TrendingUp,
  Megaphone, ArrowRight,
} from "lucide-react";
import { mockDesa } from "@/lib/mock-data";
import { getDesaByIdOrSlugWithFallback } from "@/lib/data/desa-read";
import { formatRupiah, formatRupiahFull } from "@/lib/utils";
import { BUDGET_ITEMS, DATA_DISCLAIMER, PENDAPATAN, PENGADUAN } from "@/lib/copy";
import { ASSETS } from "@/lib/assets";
import DownloadButton from "@/components/desa/DownloadButton";
import DesaDetailFirstView from "@/components/desa/DesaDetailFirstView";
import DetailSectionNav from "@/components/desa/DetailSectionNav";
import SourceDocumentSnapshotSection from "@/components/desa/SourceDocumentSnapshotSection";
import KelengkapanDesa from "@/components/desa/KelengkapanDesa";
import SeharusnyaAdaSection from "@/components/desa/SeharusnyaAdaSection";
import KinerjaAnggaranCard from "@/components/desa/KinerjaAnggaranCard";
import TransparansiCard from "@/components/desa/TransparansiCard";
import ResponsibilityGuideCard from "@/components/desa/ResponsibilityGuideCard";
import TanggungJawabSection from "@/components/desa/TanggungJawabSection";
import PreReportChecklistCard from "@/components/desa/PreReportChecklistCard";
import { getVoicesForDesa } from "@/lib/citizen-voice";
import { DataStatusBadge } from "@/components/ui/DataStatusBadge";

import type { Metadata } from "next";

interface Props { params: Promise<{ id: string }> }

const SEEDED_DESA_SLUGS = [
  "ancolmekar",
  "arjasari",
  "baros",
  "batukarut",
  "lebakwangi",
  "mangunjaya",
  "mekarjaya",
  "patrolsari",
  "pinggirsari",
  "rancakole",
  "wargaluyu",
];

export async function generateStaticParams() {
  return [
    ...mockDesa.map((d) => ({ id: d.id })),
    ...SEEDED_DESA_SLUGS.map((id) => ({ id })),
  ];
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id } = await params;
  const desa = await getDesaByIdOrSlugWithFallback(id);
  if (!desa) return { title: "Desa Tidak Ditemukan" };

  const title       = `${desa.nama} — Anggaran ${desa.tahun}`;
  const description = `${desa.nama}, ${desa.kecamatan}, ${desa.kabupaten}. Indikator serapan anggaran ${desa.persentaseSerapan}% dari total ${new Intl.NumberFormat("id-ID", { style: "currency", currency: "IDR", maximumFractionDigits: 0 }).format(desa.totalAnggaran)} (data demo).`;

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      url:  `https://pantaudesa.id/desa/${desa.id}`,
      type: "article",
    },
    twitter: { title, description },
  };
}

export default async function DesaDetailPage({ params }: Props) {
  const { id } = await params;
  const desa = await getDesaByIdOrSlugWithFallback(id);
  if (!desa) return notFound();

  const selisih      = desa.totalAnggaran - desa.terealisasi;
  const voicePreview = getVoicesForDesa(desa.id).slice(0, 2);
  const profil       = desa.profil;

  const budgetItems = [
    { icon: Wallet,       label: BUDGET_ITEMS.totalAnggaran.label, value: formatRupiahFull(desa.totalAnggaran), color: "text-indigo-600",  bg: "bg-indigo-50"  },
    { icon: CheckCircle2, label: BUDGET_ITEMS.terealisasi.label,   value: formatRupiahFull(desa.terealisasi),   color: "text-emerald-600", bg: "bg-emerald-50" },
    { icon: Clock,        label: BUDGET_ITEMS.belumTerserap.label, value: formatRupiahFull(selisih),            color: "text-rose-600",    bg: "bg-rose-50"    },
    { icon: TrendingUp,   label: BUDGET_ITEMS.persentase.label,    value: `${desa.persentaseSerapan}%`,         color: "text-amber-600",   bg: "bg-amber-50"   },
  ];

  const panduanFlowSteps = [
    {
      step: "1",
      title: "Pahami hak warga",
      body: "Mulai dari hal yang bisa ditanyakan, bukan langsung menyimpulkan.",
    },
    {
      step: "2",
      title: "Tanya pihak yang tepat",
      body: "Bedakan urusan desa, kabupaten, dan layanan lain sebelum bertindak.",
    },
    {
      step: "3",
      title: "Cek sebelum melapor",
      body: "Pastikan dokumen, konteks, dan jalur tanya sudah dicoba dulu.",
    },
    {
      step: "4",
      title: "Sampaikan suara warga",
      body: "Bagikan kondisi desa atau lanjutkan ke kanal resmi bila sudah siap.",
    },
  ] as const;

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-5">

      {/* ── Nav ──────────────────────────────────────────────────────────── */}
      <div className="flex items-center justify-between">
        <Link href="/desa" className="inline-flex items-center gap-2 text-sm text-slate-500 hover:text-indigo-600 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 focus-visible:ring-offset-2 rounded-lg">
          <ArrowLeft size={15} aria-hidden /> Kembali ke Daftar Desa
        </Link>
        <DownloadButton desa={desa} />
      </div>

      {/* ── 1. FIRST VIEW — identity, status, safe framing (DETAIL-HIER-01/06, DETAIL-RISK-01) */}
      <div id="ringkasan">
        <DesaDetailFirstView desa={desa} />
      </div>

      <DetailSectionNav />

      {/* ── 2. SOURCE & DOCUMENTS — source/doc proof before any numbers (DOC-01) */}
      <section id="dokumen-transparansi" className="space-y-5">
        <SourceDocumentSnapshotSection desa={desa} />

      {/* ── 3. TRANSPARANSI — dokumen tab first, before budget numbers (METRIC-06) */}
        <div id="dokumen-desa">
          <TransparansiCard desa={desa} />
        </div>
      </section>

      {/* ── 4. BUDGET RINGKASAN — after source/doc context (DETAIL-RISK-02, D-01) */}
      <section id="anggaran" className="space-y-5">
      <div className="space-y-3">

        {/* Demo status strip — DETAIL-RISK-01/02 */}
        <DataStatusBadge status="demo" showMicrocopy className="w-full sm:w-auto" />

        {/* 4 stat cards */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {budgetItems.map((item) => {
            const Icon = item.icon;
            return (
              <div key={item.label} className="bg-white rounded-2xl border border-slate-100 shadow-sm p-4">
                <div className={`inline-flex p-2 rounded-xl ${item.bg} mb-2`}>
                  <Icon size={15} className={item.color} aria-hidden />
                </div>
                <p className="text-[10px] text-slate-600 mb-0.5 leading-tight">{item.label}</p>
                <p className={`text-sm font-black ${item.color} leading-tight`}>{item.value}</p>
                <DataStatusBadge status="demo" size="xs" className="mt-1" />
              </div>
            );
          })}
        </div>

        {/* Sumber pendapatan — compact horizontal */}
        {desa.pendapatan && (
          <div className="bg-white rounded-2xl border border-slate-100 shadow-sm px-5 py-4">
            <div className="mb-3 flex flex-wrap items-center gap-2">
              <p className="text-xs font-bold text-slate-600">Dari mana uang desa ini berasal?</p>
              <DataStatusBadge status="demo" size="xs" />
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              {(
                [
                  { key: "danaDesa",        amount: desa.pendapatan.danaDesa,        bar: "bg-indigo-500", dot: "bg-indigo-400" },
                  { key: "add",             amount: desa.pendapatan.add,             bar: "bg-sky-500",    dot: "bg-sky-400" },
                  { key: "pades",           amount: desa.pendapatan.pades,           bar: "bg-emerald-500",dot: "bg-emerald-400" },
                  { key: "bantuanKeuangan", amount: desa.pendapatan.bantuanKeuangan, bar: "bg-violet-500", dot: "bg-violet-400" },
                ] as const
              ).map((s) => {
                const info = PENDAPATAN[s.key];
                const pct  = Math.round((s.amount / desa.totalAnggaran) * 100);
                return (
                  <div key={s.key} className="space-y-1.5">
                    <div className="flex items-center gap-1.5">
                      <div className={`w-2 h-2 rounded-full flex-shrink-0 ${s.dot}`} aria-hidden />
                      <p className="text-[10px] text-slate-600 leading-tight truncate">{info.label}</p>
                    </div>
                    <p className="text-sm font-black text-slate-800">{formatRupiah(s.amount)}</p>
                    <div className="h-1.5 bg-slate-100 rounded-full overflow-hidden">
                      <div className={`h-full rounded-full ${s.bar}`} style={{ width: `${pct}%` }} />
                    </div>
                    <p className="text-[10px] text-slate-500">{pct}% dari total</p>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>

      {/* ── 5. KINERJA ANGGARAN — after budget context */}
      <KinerjaAnggaranCard desa={desa} />
      </section>

      {/* ── 6. KELENGKAPAN DESA — secondary context before citizen guidance */}
      {profil && <KelengkapanDesa profil={profil} />}

      {/* ── 7. PANDUAN WARGA — connected citizen journey */}
      <section id="panduan-warga" className="space-y-4 border-y border-amber-100 bg-amber-50/45 py-5 sm:rounded-3xl sm:border sm:p-5">
        <div className="space-y-4">
          <div className="max-w-2xl">
            <p className="text-xs font-black uppercase tracking-widest text-amber-700">Panduan Warga</p>
            <h2 className="mt-1 text-xl font-black leading-tight text-slate-900">
              Baca hak warga, tanya pihak yang tepat, lalu cek langkah sebelum melapor.
            </h2>
            <p className="mt-2 text-sm leading-relaxed text-slate-600">
              Alur ini membantu warga bergerak dari memahami konteks, menanyakan hal yang tepat,
              sampai menyampaikan kondisi desa tanpa membuat data demo terlihat seperti temuan final.
            </p>
          </div>

          <ol className="grid gap-2 sm:grid-cols-4" aria-label="Alur panduan warga">
            {panduanFlowSteps.map((item) => (
              <li key={item.step} className="rounded-2xl border border-amber-100 bg-white/85 p-3">
                <div className="flex items-center gap-2">
                  <span className="flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-full bg-amber-100 text-xs font-black text-amber-800">
                    {item.step}
                  </span>
                  <p className="text-xs font-black text-slate-800">{item.title}</p>
                </div>
                <p className="mt-2 text-[11px] leading-relaxed text-slate-600">{item.body}</p>
              </li>
            ))}
          </ol>
        </div>

        <SeharusnyaAdaSection desa={desa} />

        {/* ── 8. TANYAKAN KE PIHAK YANG TEPAT ──────────────────────────────── */}
        <ResponsibilityGuideCard />

        {/* ── 9. TANGGUNG JAWAB — escalation guide ──────────────────────────── */}
        <TanggungJawabSection desa={desa} />

        {/* ── 10. PRE-REPORT CHECKLIST — gate before any external CTA (REPORT-01..07) */}
        <div id="pre-report-checklist">
          <PreReportChecklistCard kabupaten={desa.kabupaten} />
        </div>

        {/* ── 11. SUARA WARGA + PAK WASPADA CTA ─────────────────────────────── */}
        <div className="grid grid-cols-1 sm:grid-cols-5 gap-4">
        {/* Suara warga preview */}
        <Link
          href={`/desa/${desa.id}/suara`}
          className="sm:col-span-3 group block rounded-2xl overflow-hidden border border-indigo-100 shadow-sm hover:shadow-md transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 focus-visible:ring-offset-2"
          aria-label={`Suara warga untuk ${desa.nama}`}
        >
          <div className="bg-gradient-to-r from-indigo-600 to-violet-600 px-4 py-3.5 flex items-center justify-between gap-3">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-xl bg-white/15 flex items-center justify-center flex-shrink-0">
                <Megaphone size={15} className="text-white" aria-hidden />
              </div>
              <div>
                <p className="text-sm font-bold text-white">Suara Warga</p>
                <p className="text-[10px] text-indigo-200">
                  {getVoicesForDesa(desa.id).length > 0
                    ? `${getVoicesForDesa(desa.id).length} cerita dari warga`
                    : "Jadilah yang pertama bercerita"}
                </p>
              </div>
            </div>
            <ArrowRight size={16} className="text-indigo-200 group-hover:text-white group-hover:translate-x-1 transition-all flex-shrink-0" aria-hidden />
          </div>
          {voicePreview.length > 0 && (
            <div className="bg-white divide-y divide-slate-50">
              {voicePreview.map((v) => (
                <div key={v.id} className="px-4 py-2.5 flex items-start gap-2.5">
                  <span className="text-sm flex-shrink-0 mt-0.5" aria-hidden>
                    {["🛣️","💰","🏫","📋","🌿","💬"][["infrastruktur","bansos","fasilitas","anggaran","lingkungan","lainnya"].indexOf(v.category)] ?? "💬"}
                  </span>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs text-slate-700 line-clamp-2 leading-relaxed">{v.text}</p>
                    <p className="text-[10px] text-slate-500 mt-0.5">{v.author}</p>
                  </div>
                </div>
              ))}
            </div>
          )}
          <div className="bg-indigo-50 px-4 py-2 flex items-center justify-between">
            <span className="text-[11px] text-indigo-600 font-semibold">Ceritakan Kondisi Desaku</span>
            <ArrowRight size={12} className="text-indigo-400 group-hover:translate-x-0.5 transition-transform" aria-hidden />
          </div>
        </Link>

        {/* Pak Waspada CTA — now points to checklist, not direct LAPOR */}
        <div className="sm:col-span-2 bg-amber-50 border border-amber-200 rounded-2xl overflow-hidden flex flex-col justify-between">
          <div className="p-4 flex-1">
            <p className="text-sm font-bold text-amber-800 mb-1">{PENGADUAN.title}</p>
            <p className="text-xs text-amber-600 leading-relaxed mb-4">{PENGADUAN.subtitle}</p>
            <div className="space-y-2">
              <a
                href="#pre-report-checklist"
                className="flex items-center gap-1.5 text-xs font-semibold bg-amber-600 text-white px-3 py-2.5 rounded-xl hover:bg-amber-700 transition-colors w-full justify-center focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-500 focus-visible:ring-offset-1"
              >
                {PENGADUAN.lapor}
              </a>
              <p className="text-[10px] text-center text-amber-600 font-medium">{PENGADUAN.inspektorat(desa.kabupaten)}</p>
            </div>
          </div>
          <div className="flex justify-end">
            <Image src={ASSETS.mascotStanding} alt="Pak Waspada" width={80} height={110} className="object-contain object-bottom" />
          </div>
        </div>
      </div>
      </section>

      {/* Data note */}
      <p className="text-[10px] text-slate-400 text-center px-4">
        {DATA_DISCLAIMER.short}
      </p>
    </div>
  );
}
