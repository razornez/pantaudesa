import Link from "next/link";
import Image from "next/image";
import { ArrowRight, CheckCircle2, FolderOpen, Search } from "lucide-react";
import HeroSection from "@/components/home/HeroSection";
import StatsCards from "@/components/home/StatsCards";
import TrendChart from "@/components/home/TrendChart";
import SerapanDonut from "@/components/home/SerapanDonut";
import DesaLeaderboard from "@/components/home/DesaLeaderboard";
import AlertDiniSection from "@/components/home/AlertDiniSection";
import CitizenJourneySection from "@/components/home/CitizenJourneySection";
import DataStatusCardsSection from "@/components/home/DataStatusCardsSection";
import DataProcessingTrustSection from "@/components/home/DataProcessingTrustSection";
import DocumentDeskSection from "@/components/home/DocumentDeskSection";
import PilotAreaStorySection from "@/components/home/PilotAreaStorySection";
import PondasiTransparansiSection from "@/components/home/PondasiTransparansiSection";
import { buildSummaryStats, buildTrendData, getDesaListResult } from "@/lib/data/desa-read";
import type { Desa } from "@/lib/types";
import { DATA_DISCLAIMER, SECTION } from "@/lib/copy";
import { ASSETS } from "@/lib/assets";

export const dynamic = "force-dynamic";

export default async function HomePage() {
  const desaResult = await getDesaListResult();
  const desaItems = desaResult.items;
  const summaryStats = buildSummaryStats(desaItems);
  const trendData = buildTrendData(desaItems);

  const topBaik = [...desaItems]
    .filter((d) => d.status === "baik")
    .sort((a, b) => b.persentaseSerapan - a.persentaseSerapan)
    .slice(0, 5);

  const topRendah = [...desaItems]
    .filter((d) => d.status === "rendah")
    .sort((a, b) => a.persentaseSerapan - b.persentaseSerapan)
    .slice(0, 5);

  // Provinsi ranking — includes best desa name per province
  const byProvinsi = desaItems.reduce<Record<string, { total: number; count: number; best: Desa }>>((acc, d) => {
    if (!acc[d.provinsi]) acc[d.provinsi] = { total: 0, count: 0, best: d };
    acc[d.provinsi].total += d.persentaseSerapan;
    acc[d.provinsi].count += 1;
    if (d.persentaseSerapan > acc[d.provinsi].best.persentaseSerapan) acc[d.provinsi].best = d;
    return acc;
  }, {});

  const provinsiRanking = Object.entries(byProvinsi)
    .map(([provinsi, { total, count, best }]) => ({
      provinsi,
      avg:   Math.round(total / count),
      count,
      best:  best.nama.replace(/^Desa\s+/, ""),
    }))
    .sort((a, b) => b.avg - a.avg)
    .slice(0, 7);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">

      {/* ── Hero ─────────────────────────────────────────────────────────── */}
      <HeroSection totalDesa={desaItems.length} tahun={2024} />

      {desaResult.state !== "ready" && (
        <div className="rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-900">
          <p className="font-bold">Data belum siap ditampilkan</p>
          <p className="mt-1 text-xs leading-relaxed">
            Beberapa bagian halaman belum bisa memuat data terbaru. Coba muat ulang beberapa saat lagi.
          </p>
        </div>
      )}

      <section>
        <div className="mb-4 max-w-2xl">
          <div className="flex flex-wrap items-center gap-2">
            <p className="text-xs font-semibold uppercase tracking-wide text-indigo-600">Prioritas warga</p>
            <span className="rounded-full border border-amber-200 bg-amber-50 px-2 py-0.5 text-[10px] font-bold text-amber-700">
              angka bertanda mock
            </span>
          </div>
          <h2 className="text-lg font-semibold text-slate-800 mt-1">Mulai dari desa yang perlu dilihat lebih dulu</h2>
          <p className="text-sm text-slate-500 mt-1">
            Urutan ini memakai data contoh untuk membantu warga membaca indikator awal; angka persentase belum menjadi fakta final atau terverifikasi.
          </p>
        </div>
        <div className="grid grid-cols-1 xl:grid-cols-[minmax(0,1.15fr)_minmax(320px,0.85fr)] gap-4 items-start">
          <DesaLeaderboard
            topBaik={topBaik}
            topRendah={topRendah}
            provinsiRanking={provinsiRanking}
          />
          <AlertDiniSection desa={desaItems} />
        </div>
      </section>

      <CitizenJourneySection />
      <DataStatusCardsSection />
      <DataProcessingTrustSection />
      <DocumentDeskSection />
      <PilotAreaStorySection />
      <PondasiTransparansiSection />

      {/* ── Stats ─────────────────────────────────────────────────────────── */}
      <div>
        <h2 className="text-lg font-semibold text-slate-800 mb-1">{SECTION.ringkasanNasional}</h2>
        <p className="text-sm text-slate-500 mb-4">{SECTION.ringkasanNasionalSub}</p>
        <StatsCards stats={summaryStats} />
        <p className="text-center text-xs text-slate-400 pb-2">
          {DATA_DISCLAIMER.short}
        </p>
      </div>

      {/* ── Charts + Leaderboard ─────────────────────────────────────────── */}
      <section>
        <div className="mb-4 max-w-2xl">
          <h2 className="text-base font-semibold text-slate-800">Gambaran angka pendukung</h2>
          <p className="text-sm text-slate-500 mt-1">
            Grafik tetap tersedia sebagai konteks tambahan, sementara prioritas cek transparansi tampil lebih dulu.
          </p>
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <TrendChart data={trendData} />
          <SerapanDonut stats={summaryStats} />
        </div>
      </section>

      {/* ── CTA + Citizen Illustration ────────────────────────────────────── */}
      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
        <div className="flex flex-col lg:flex-row items-stretch">
          <div className="relative w-full lg:w-80 h-56 lg:h-auto flex-shrink-0">
            <Image
              src={ASSETS.illustrationCitizen}
              alt="Warga desa mengakses data anggaran desanya"
              fill
              className="object-cover object-center"
              sizes="(max-width: 1024px) 100vw, 320px"
            />
          </div>
          <div className="flex-1 flex flex-col justify-center p-6 sm:p-8 text-center lg:text-left">
            <p className="text-xs font-semibold uppercase tracking-wide text-indigo-600">Dari bingung jadi tahu harus cek apa</p>
            <h2 className="mt-1 text-lg font-bold text-slate-800">PantauDesa merapikan bahan bacaan warga.</h2>
            <div className="my-5 grid grid-cols-1 gap-3 sm:grid-cols-2">
              <div className="rounded-2xl border border-slate-100 bg-slate-50 p-4 text-left">
                <div className="flex items-start gap-3">
                  <div className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-xl bg-white text-slate-500">
                    <Search size={16} />
                  </div>
                  <div>
                    <p className="text-sm font-bold text-slate-800">Sebelum</p>
                    <p className="mt-1 text-xs leading-relaxed text-slate-500">
                      Warga membuka banyak website dan bingung dokumen mana yang terbaru.
                    </p>
                  </div>
                </div>
              </div>
              <div className="rounded-2xl border border-indigo-100 bg-indigo-50 p-4 text-left">
                <div className="flex items-start gap-3">
                  <div className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-xl bg-white text-indigo-600">
                    <FolderOpen size={16} />
                  </div>
                  <div>
                    <p className="text-sm font-bold text-slate-800">Sesudah</p>
                    <p className="mt-1 text-xs leading-relaxed text-slate-600">
                      PantauDesa merapikan sumber, dokumen, dan status agar lebih mudah dicek.
                    </p>
                  </div>
                </div>
              </div>
            </div>
            <p className="mb-5 inline-flex items-center justify-center gap-2 text-xs font-semibold text-slate-500 lg:justify-start">
              <CheckCircle2 size={14} className="text-emerald-600" />
              Tetap gunakan sumber dan status data sebelum membuat kesimpulan.
            </p>
            <div>
              <Link
                href="/desa"
                className="inline-flex items-center gap-2 bg-indigo-600 text-white font-semibold px-6 py-2.5 rounded-xl hover:bg-indigo-700 transition-colors text-sm shadow-md"
              >
                Cari Desamu Sekarang <ArrowRight size={16} />
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
