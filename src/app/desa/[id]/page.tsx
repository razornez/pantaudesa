import Link from "next/link";
import Image from "next/image";
import { notFound } from "next/navigation";
import {
  ArrowLeft, Wallet, CheckCircle2, Clock, TrendingUp,
  Megaphone, ArrowRight, ExternalLink,
} from "lucide-react";
import { mockDesa } from "@/lib/mock-data";
import { formatRupiah, formatRupiahFull } from "@/lib/utils";
import { BUDGET_ITEMS, PENDAPATAN, PENGADUAN } from "@/lib/copy";
import { ASSETS } from "@/lib/assets";
import DownloadButton from "@/components/desa/DownloadButton";
import DesaHeroCard from "@/components/desa/DesaHeroCard";
import KelengkapanDesa from "@/components/desa/KelengkapanDesa";
import SeharusnyaAdaSection from "@/components/desa/SeharusnyaAdaSection";
import KinerjaAnggaranCard from "@/components/desa/KinerjaAnggaranCard";
import TransparansiCard from "@/components/desa/TransparansiCard";
import ResponsibilityGuideCard from "@/components/desa/ResponsibilityGuideCard";
import TanggungJawabSection from "@/components/desa/TanggungJawabSection";
import { getVoicesForDesa } from "@/lib/citizen-voice";

import type { Metadata } from "next";

interface Props { params: Promise<{ id: string }> }

export async function generateStaticParams() {
  return mockDesa.map((d) => ({ id: d.id }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id } = await params;
  const desa   = mockDesa.find((d) => d.id === id);
  if (!desa) return { title: "Desa Tidak Ditemukan" };

  const title       = `${desa.nama} — Anggaran ${desa.tahun}`;
  const description = `${desa.nama}, ${desa.kecamatan}, ${desa.kabupaten}. Serapan anggaran ${desa.persentaseSerapan}% dari total ${new Intl.NumberFormat("id-ID", { style: "currency", currency: "IDR", maximumFractionDigits: 0 }).format(desa.totalAnggaran)}.`;

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
  const desa   = mockDesa.find((d) => d.id === id);
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

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-5">

      {/* ── Nav ──────────────────────────────────────────────────────────── */}
      <div className="flex items-center justify-between">
        <Link href="/desa" className="inline-flex items-center gap-2 text-sm text-slate-500 hover:text-indigo-600 transition-colors">
          <ArrowLeft size={15} /> Kembali ke Daftar Desa
        </Link>
        <DownloadButton desa={desa} />
      </div>

      {/* ── 1. HERO CARD — nama, badge, profil, progress, verdict ─────────── */}
      <DesaHeroCard desa={desa} />

      {/* ── 2. KELENGKAPAN DESA — aset / fasilitas / lembaga / bumdes ────── */}
      {profil && <KelengkapanDesa profil={profil} />}

      {/* ── 3. HAK WARGA — seharusnya ada apa ───────────────────────────── */}
      <SeharusnyaAdaSection desa={desa} />

      {/* ── 4. BUDGET RINGKASAN — 4 stat + sumber pendapatan ─────────────── */}
      <div className="space-y-3">
        {/* 4 cards */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {budgetItems.map((item) => {
            const Icon = item.icon;
            return (
              <div key={item.label} className="bg-white rounded-2xl border border-slate-100 shadow-sm p-4">
                <div className={`inline-flex p-2 rounded-xl ${item.bg} mb-2`}>
                  <Icon size={15} className={item.color} />
                </div>
                <p className="text-[10px] text-slate-500 mb-0.5 leading-tight">{item.label}</p>
                <p className={`text-sm font-black ${item.color} leading-tight`}>{item.value}</p>
              </div>
            );
          })}
        </div>

        {/* Sumber pendapatan — compact horizontal */}
        {desa.pendapatan && (
          <div className="bg-white rounded-2xl border border-slate-100 shadow-sm px-5 py-4">
            <p className="text-xs font-bold text-slate-600 mb-3">Dari mana uang desa ini berasal?</p>
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
                      <div className={`w-2 h-2 rounded-full flex-shrink-0 ${s.dot}`} />
                      <p className="text-[10px] text-slate-500 leading-tight truncate">{info.label}</p>
                    </div>
                    <p className="text-sm font-black text-slate-800">{formatRupiah(s.amount)}</p>
                    <div className="h-1.5 bg-slate-100 rounded-full overflow-hidden">
                      <div className={`h-full rounded-full ${s.bar}`} style={{ width: `${pct}%` }} />
                    </div>
                    <p className="text-[10px] text-slate-400">{pct}% dari total</p>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>

      {/* ── 5. KINERJA ANGGARAN — collapsible (chart, APBDes, riwayat) ─────── */}
      <KinerjaAnggaranCard desa={desa} />

      {/* ── 5b. TANYAKAN KE PIHAK YANG TEPAT ──────────────────────────────── */}
      <ResponsibilityGuideCard />

      {/* ── 6. TRANSPARANSI — tab: skor / perangkat / dokumen ─────────────── */}
      <TransparansiCard desa={desa} />

      {/* ── 7. TANGGUNG JAWAB ────────────────────────────────────────────── */}
      <TanggungJawabSection desa={desa} />

      {/* ── 8. SUARA WARGA + PAK WASPADA CTA ─────────────────────────────── */}
      <div className="grid grid-cols-1 sm:grid-cols-5 gap-4">
        {/* Suara warga preview */}
        <Link
          href={`/desa/${desa.id}/suara`}
          className="sm:col-span-3 group block rounded-2xl overflow-hidden border border-indigo-100 shadow-sm hover:shadow-md transition-all"
        >
          <div className="bg-gradient-to-r from-indigo-600 to-violet-600 px-4 py-3.5 flex items-center justify-between gap-3">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-xl bg-white/15 flex items-center justify-center flex-shrink-0">
                <Megaphone size={15} className="text-white" />
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
            <ArrowRight size={16} className="text-indigo-200 group-hover:text-white group-hover:translate-x-1 transition-all flex-shrink-0" />
          </div>
          {voicePreview.length > 0 && (
            <div className="bg-white divide-y divide-slate-50">
              {voicePreview.map((v) => (
                <div key={v.id} className="px-4 py-2.5 flex items-start gap-2.5">
                  <span className="text-sm flex-shrink-0 mt-0.5">
                    {["🛣️","💰","🏫","📋","🌿","💬"][["infrastruktur","bansos","fasilitas","anggaran","lingkungan","lainnya"].indexOf(v.category)] ?? "💬"}
                  </span>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs text-slate-700 line-clamp-2 leading-relaxed">{v.text}</p>
                    <p className="text-[10px] text-slate-400 mt-0.5">{v.author}</p>
                  </div>
                </div>
              ))}
            </div>
          )}
          <div className="bg-indigo-50 px-4 py-2 flex items-center justify-between">
            <span className="text-[11px] text-indigo-600 font-semibold">Lihat semua & tambah ceritamu</span>
            <ArrowRight size={12} className="text-indigo-400 group-hover:translate-x-0.5 transition-transform" />
          </div>
        </Link>

        {/* Pak Waspada CTA */}
        <div className="sm:col-span-2 bg-amber-50 border border-amber-200 rounded-2xl overflow-hidden flex flex-col justify-between">
          <div className="p-4 flex-1">
            <p className="text-sm font-bold text-amber-800 mb-1">{PENGADUAN.title}</p>
            <p className="text-xs text-amber-600 leading-relaxed mb-4">{PENGADUAN.subtitle}</p>
            <div className="space-y-2">
              <a href="https://www.lapor.go.id" target="_blank" rel="noopener noreferrer"
                className="flex items-center gap-1.5 text-xs font-semibold bg-amber-600 text-white px-3 py-2 rounded-xl hover:bg-amber-700 transition-colors w-full justify-center"
              >
                <ExternalLink size={11} /> {PENGADUAN.lapor}
              </a>
              <p className="text-[10px] text-center text-amber-600 font-medium">{PENGADUAN.inspektorat(desa.kabupaten)}</p>
            </div>
          </div>
          <div className="flex justify-end">
            <Image src={ASSETS.mascotStanding} alt="Pak Waspada" width={80} height={110} className="object-contain object-bottom" />
          </div>
        </div>
      </div>

      {/* Note */}
      <p className="text-[10px] text-slate-400 text-center px-4">
        Data bersifat ilustrasi. Integrasi SIPD, OMSPAN &amp; OpenData DJPK Kemenkeu sedang disiapkan.
      </p>
    </div>
  );
}
