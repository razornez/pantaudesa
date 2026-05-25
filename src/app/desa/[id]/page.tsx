import Link from "next/link";
import type { ReactNode } from "react";
import { notFound } from "next/navigation";
import {
  ArrowLeft,
  ArrowRight,
  CheckCircle2,
  Clock,
  Megaphone,
  TrendingUp,
  Wallet,
} from "lucide-react";
import { getDesaByIdOrSlugWithFallback } from "@/lib/data/desa-read";
import {
  buildPublishedProfilSection,
  readPublishedNumber,
  readPublishedString,
  toPublishedApbdesItems,
  toPublishedOutputFisikArray,
  toPublishedPerangkatDesaArray,
  toPublishedRiwayatArray,
} from "@/lib/data/desa-template-public-view";
import { getPublishedTemplateData } from "@/lib/data/village-template-read";
import { getVoicePreviewForDesaFromDb } from "@/lib/data/voice-read";
import { perfStart, publicPerfLog } from "@/lib/perf";
import {
  buildPublicDetailRenderPlan,
  getOrderedVisibleSlots,
  isLegacyPublicDetailComponent,
  type PublicDetailSlotKey,
} from "@/lib/village-data/public-detail-composition";
import { buildRuntimeTemplateManifest } from "@/lib/village-data/runtime-template-manifest";
import { formatRupiah, formatRupiahFull } from "@/lib/utils";
import { BUDGET_ITEMS, PENDAPATAN } from "@/lib/copy";
import DownloadButton from "@/components/desa/DownloadButton";
import DesaDetailFirstView from "@/components/desa/DesaDetailFirstView";
import DetailSectionNav, {
  type DetailSectionNavItem,
} from "@/components/desa/DetailSectionNav";
import KelengkapanDesa from "@/components/desa/KelengkapanDesa";
import KinerjaAnggaranCard from "@/components/desa/KinerjaAnggaranCard";
import PreReportChecklistCard from "@/components/desa/PreReportChecklistCard";
import ResponsibilityGuideCard from "@/components/desa/ResponsibilityGuideCard";
import SeharusnyaAdaSection from "@/components/desa/SeharusnyaAdaSection";
import SourceDocumentSnapshotSection from "@/components/desa/SourceDocumentSnapshotSection";
import TransparansiCard from "@/components/desa/TransparansiCard";
import {
  PUBLIC_TEMPLATE_COMPONENT_REGISTRY,
} from "@/components/desa/public-template-registry";

import type { Metadata } from "next";

export const dynamic = "force-dynamic";

interface Props {
  params: Promise<{ id: string }>;
}

const SLOT_META: Record<
  PublicDetailSlotKey,
  {
    anchorId: string;
    navLabel: string;
  }
> = {
  first_view: { anchorId: "ringkasan", navLabel: "Ringkasan" },
  sumber_dokumen: {
    anchorId: "dokumen-transparansi",
    navLabel: "Sumber & Dokumen",
  },
  transparansi: { anchorId: "dokumen-desa", navLabel: "Transparansi" },
  ringkasan_anggaran: { anchorId: "anggaran", navLabel: "Anggaran" },
  kinerja_anggaran: {
    anchorId: "kinerja-anggaran",
    navLabel: "Kinerja",
  },
  kelengkapan_desa: {
    anchorId: "kelengkapan-desa",
    navLabel: "Kelengkapan",
  },
  panduan_warga: { anchorId: "panduan-warga", navLabel: "Panduan Warga" },
  suara_warga: { anchorId: "suara-warga", navLabel: "Suara Warga" },
};

function getPublicDetailSlot(componentKey: string) {
  return PUBLIC_TEMPLATE_COMPONENT_REGISTRY[componentKey]
    ?.detailSlot as PublicDetailSlotKey | undefined;
}

function buildNavItems(slots: PublicDetailSlotKey[]): DetailSectionNavItem[] {
  return slots.map((slot) => ({
    href: `#${SLOT_META[slot].anchorId}`,
    label: SLOT_META[slot].navLabel,
  }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id } = await params;
  const desa = await getDesaByIdOrSlugWithFallback(id);
  if (!desa) return { title: "Desa Tidak Ditemukan" };

  const title = `${desa.nama} - Halaman Detail Desa`;
  const description = `${desa.nama}, ${desa.kecamatan}, ${desa.kabupaten}. Halaman detail desa berbasis template aktif dan data publik yang sudah diterbitkan.`;

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      url: `https://pantaudesa.id/desa/${desa.id}`,
      type: "article",
    },
    twitter: { title, description },
  };
}

export default async function DesaDetailPage({ params }: Props) {
  const routeTimer = perfStart();
  const { id } = await params;
  const desaTimer = perfStart();
  const desa = await getDesaByIdOrSlugWithFallback(id);
  publicPerfLog("public.desa-detail", "getDesaByIdOrSlugWithFallback()", desaTimer);
  if (!desa) return notFound();

  const templateData = await getPublishedTemplateData(desa.prismaId ?? desa.id);
  const runtimeManifest = buildRuntimeTemplateManifest(templateData.resolvedTemplate);
  publicPerfLog("public.desa-detail", "routeDataReady", routeTimer);

  const publishedValues = templateData.publishedValues;
  const publishedPenduduk = readPublishedNumber(publishedValues, "jumlahPenduduk");
  const publishedTahun = readPublishedNumber(publishedValues, "tahunData");
  const publishedTotalAnggaran = readPublishedNumber(publishedValues, "totalAnggaran");
  const publishedTerealisasi = readPublishedNumber(publishedValues, "terealisasi");
  const publishedPersentaseSerapan = readPublishedNumber(
    publishedValues,
    "persentaseSerapan",
  );

  const desaView = {
    ...desa,
    kecamatan: readPublishedString(publishedValues, "kecamatan") ?? desa.kecamatan,
    kabupaten: readPublishedString(publishedValues, "kabupaten") ?? desa.kabupaten,
    provinsi: readPublishedString(publishedValues, "provinsi") ?? desa.provinsi,
    kategori: readPublishedString(publishedValues, "kategori") ?? desa.kategori,
    perangkat: toPublishedPerangkatDesaArray(
      publishedValues.perangkatDesa,
      readPublishedString(publishedValues, "kepalaDesa"),
    ),
    profil: buildPublishedProfilSection(publishedValues, desa.profil) ?? undefined,
    apbdes: toPublishedApbdesItems(publishedValues.apbdesItems),
    outputFisik: toPublishedOutputFisikArray(publishedValues.outputFisik),
    riwayat: toPublishedRiwayatArray(publishedValues.riwayatAPBDes),
    penduduk: publishedPenduduk ?? desa.penduduk,
    tahun: publishedTahun ?? desa.tahun,
    totalAnggaran: publishedTotalAnggaran ?? desa.totalAnggaran,
    terealisasi: publishedTerealisasi ?? desa.terealisasi,
  };

  desaView.persentaseSerapan =
    publishedPersentaseSerapan !== null
      ? publishedPersentaseSerapan
      : desaView.totalAnggaran > 0
        ? Math.round((desaView.terealisasi / desaView.totalAnggaran) * 100)
        : desa.persentaseSerapan;

  const hiddenComponentKeys = new Set(
    runtimeManifest.hiddenComponents.map((component) => component.componentKey),
  );
  const visibleComponentKeys = runtimeManifest.visibleComponents.map(
    (component) => component.componentKey,
  );
  const visibleSlots = getOrderedVisibleSlots(
    visibleComponentKeys,
    getPublicDetailSlot,
  );
  const renderPlan = buildPublicDetailRenderPlan(
    visibleComponentKeys,
    getPublicDetailSlot,
  );
  const navItems = buildNavItems(visibleSlots);
  const showBudgetSummary =
    visibleComponentKeys.includes("anggaran") ||
    visibleComponentKeys.includes("pendapatan");
  const showBudgetMetrics = visibleComponentKeys.includes("anggaran");
  const showPendapatanBreakdown = visibleComponentKeys.includes("pendapatan");
  const showSourceSection = visibleComponentKeys.includes("sumber_dokumen");
  const showPerangkatSection = visibleComponentKeys.includes("perangkat");
  const showTransparansiSection = visibleComponentKeys.includes("transparansi");
  const showKinerjaSection = visibleComponentKeys.includes("kinerja");
  const showProfilSection = visibleComponentKeys.includes("profil_desa");
  const showPanduanSection = visibleComponentKeys.includes("panduan_warga");
  const showSuaraSection = visibleComponentKeys.includes("suara_warga");
  const showFirstView = visibleSlots.includes("first_view");

  const selisih = desaView.totalAnggaran - desaView.terealisasi;
  const voiceSummary = showSuaraSection
    ? await getVoicePreviewForDesaFromDb(desaView.prismaId ?? desaView.id)
    : { total: 0, preview: [] };
  const voicePreview = voiceSummary.preview;
  const profil = desaView.profil;

  const budgetItems = [
    {
      icon: Wallet,
      label: BUDGET_ITEMS.totalAnggaran.label,
      value: formatRupiahFull(desaView.totalAnggaran),
      color: "text-indigo-600",
      bg: "bg-indigo-50",
    },
    {
      icon: CheckCircle2,
      label: BUDGET_ITEMS.terealisasi.label,
      value: formatRupiahFull(desaView.terealisasi),
      color: "text-emerald-600",
      bg: "bg-emerald-50",
    },
    {
      icon: Clock,
      label: BUDGET_ITEMS.belumTerserap.label,
      value: formatRupiahFull(selisih),
      color: "text-rose-600",
      bg: "bg-rose-50",
    },
    {
      icon: TrendingUp,
      label: BUDGET_ITEMS.persentase.label,
      value: `${desaView.persentaseSerapan}%`,
      color: "text-amber-600",
      bg: "bg-amber-50",
    },
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

  const registryOnlySectionEntries = await Promise.all(
    visibleComponentKeys
      .filter((componentKey) => !isLegacyPublicDetailComponent(componentKey))
      .map(async (componentKey) => {
        const section = await PUBLIC_TEMPLATE_COMPONENT_REGISTRY[componentKey]?.render({
          desa: desaView,
          publishedValues,
          sourceSummaries: templateData.sourceSummaries,
        });
        return [componentKey, section] as const;
      }),
  );
  const registryOnlySectionsByComponentKey = new Map(
    registryOnlySectionEntries.filter(
      (entry) => entry[1] !== null && entry[1] !== undefined && entry[1] !== false,
    ) as Array<readonly [string, ReactNode]>,
  );

  const renderSlotSections = (
    _slot: PublicDetailSlotKey,
    legacySection?: ReactNode,
  ) => {
    if (!legacySection) return null;

    return (
      <div className="space-y-5">
        {legacySection}
      </div>
    );
  };

  const slotSections: Partial<Record<PublicDetailSlotKey, ReactNode>> = {
    ...(showFirstView
      ? {
          first_view: renderSlotSections("first_view", (
            <div id={SLOT_META.first_view.anchorId}>
              <DesaDetailFirstView
                desa={desaView}
                hiddenComponentKeys={hiddenComponentKeys}
              />
            </div>
          )),
        }
      : {}),
    ...(showSourceSection
      ? {
          sumber_dokumen: renderSlotSections("sumber_dokumen", (
            <section
              id={SLOT_META.sumber_dokumen.anchorId}
              className="space-y-5"
            >
              <SourceDocumentSnapshotSection desa={desaView} />
            </section>
          )),
        }
      : {}),
    ...(showTransparansiSection || showPerangkatSection
      ? {
          transparansi: renderSlotSections("transparansi", (
            <section id={SLOT_META.transparansi.anchorId}>
              <TransparansiCard
                desa={desaView}
                showDokumen={showSourceSection}
                showTransparansi={showTransparansiSection}
                showPerangkat={showPerangkatSection}
              />
            </section>
          )),
        }
      : {}),
    ...(showBudgetSummary
      ? {
          ringkasan_anggaran: renderSlotSections("ringkasan_anggaran", (
            <section id={SLOT_META.ringkasan_anggaran.anchorId} className="space-y-5">
              <div className="space-y-3">
                {desa.dataStatus === "demo" ? (
                  <p className="rounded-2xl border border-amber-100 bg-amber-50 px-4 py-3 text-xs leading-relaxed text-amber-800">
                    Angka ini masih bersifat demo. Tetap cek sumber dan dokumen sebelum
                    menjadikannya rujukan akhir.
                  </p>
                ) : null}

                {showBudgetMetrics ? (
                  <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
                    {budgetItems.map((item) => {
                      const Icon = item.icon;
                      return (
                        <div
                          key={item.label}
                          className="rounded-2xl border border-slate-100 bg-white p-4 shadow-sm"
                        >
                          <div
                            className={`mb-2 inline-flex rounded-xl p-2 ${item.bg}`}
                          >
                            <Icon size={15} className={item.color} aria-hidden />
                          </div>
                          <p className="mb-0.5 text-[10px] leading-tight text-slate-600">
                            {item.label}
                          </p>
                          <p className={`text-sm font-black leading-tight ${item.color}`}>
                            {item.value}
                          </p>
                        </div>
                      );
                    })}
                  </div>
                ) : null}

                {showPendapatanBreakdown && desaView.pendapatan ? (
                  <div className="rounded-2xl border border-slate-100 bg-white px-5 py-4 shadow-sm">
                    <div className="mb-3 flex flex-wrap items-center gap-2">
                      <p className="text-xs font-bold text-slate-600">
                        Dari mana uang desa ini berasal?
                      </p>
                    </div>
                    <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
                      {(
                        [
                          {
                            key: "danaDesa",
                            amount: desaView.pendapatan.danaDesa,
                            bar: "bg-indigo-500",
                            dot: "bg-indigo-400",
                          },
                          {
                            key: "add",
                            amount: desaView.pendapatan.add,
                            bar: "bg-sky-500",
                            dot: "bg-sky-400",
                          },
                          {
                            key: "pades",
                            amount: desaView.pendapatan.pades,
                            bar: "bg-emerald-500",
                            dot: "bg-emerald-400",
                          },
                          {
                            key: "bantuanKeuangan",
                            amount: desaView.pendapatan.bantuanKeuangan,
                            bar: "bg-violet-500",
                            dot: "bg-violet-400",
                          },
                        ] as const
                      ).map((source) => {
                        const info = PENDAPATAN[source.key];
                        const pct =
                          desaView.totalAnggaran > 0
                            ? Math.round((source.amount / desaView.totalAnggaran) * 100)
                            : 0;
                        return (
                          <div key={source.key} className="space-y-1.5">
                            <div className="flex items-center gap-1.5">
                              <div
                                className={`h-2 w-2 flex-shrink-0 rounded-full ${source.dot}`}
                                aria-hidden
                              />
                              <p className="truncate text-[10px] leading-tight text-slate-600">
                                {info.label}
                              </p>
                            </div>
                            <p className="text-sm font-black text-slate-800">
                              {formatRupiah(source.amount)}
                            </p>
                            <div className="h-1.5 overflow-hidden rounded-full bg-slate-100">
                              <div
                                className={`h-full rounded-full ${source.bar}`}
                                style={{ width: `${pct}%` }}
                              />
                            </div>
                            <p className="text-[10px] text-slate-500">{pct}% dari total</p>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                ) : null}
              </div>
            </section>
          )),
        }
      : {}),
    ...(showKinerjaSection
      ? {
          kinerja_anggaran: renderSlotSections("kinerja_anggaran", (
            <section id={SLOT_META.kinerja_anggaran.anchorId}>
              <KinerjaAnggaranCard desa={desaView} />
            </section>
          )),
        }
      : {}),
    ...(showProfilSection
      ? {
          kelengkapan_desa: renderSlotSections("kelengkapan_desa", (
            <section id={SLOT_META.kelengkapan_desa.anchorId}>
              {profil ? (
                <KelengkapanDesa profil={profil} />
              ) : (
                <div className="rounded-2xl border border-slate-100 bg-white px-5 py-6 shadow-sm">
                  <p className="text-sm font-bold text-slate-800">
                    Kelengkapan desa belum diterbitkan.
                  </p>
                  <p className="mt-1 text-xs leading-relaxed text-slate-500">
                    Komponen ini tetap mengikuti template aktif, tetapi field profil dan
                    kelengkapan desa belum memiliki data publik yang siap ditayangkan.
                  </p>
                </div>
              )}
            </section>
          )),
        }
      : {}),
    ...(showPanduanSection
      ? {
          panduan_warga: renderSlotSections("panduan_warga", (
            <section
              id={SLOT_META.panduan_warga.anchorId}
              className="space-y-4 border-y border-amber-100 bg-amber-50/45 py-5 sm:rounded-3xl sm:border sm:p-5"
            >
              <div className="space-y-4">
                <div className="max-w-2xl">
                  <p className="text-xs font-black uppercase tracking-widest text-amber-700">
                    Panduan Warga
                  </p>
                  <h2 className="mt-1 text-xl font-black leading-tight text-slate-900">
                    Baca hak warga, tanya pihak yang tepat, lalu cek langkah sebelum
                    melapor.
                  </h2>
                  <p className="mt-2 text-sm leading-relaxed text-slate-600">
                    Alur ini membantu warga bergerak dari memahami konteks, menanyakan
                    hal yang tepat, sampai menyampaikan kondisi desa tanpa membuat data
                    publik terlihat seperti kesimpulan final.
                  </p>
                </div>

                <ol
                  className="grid gap-2 sm:grid-cols-4"
                  aria-label="Alur panduan warga"
                >
                  {panduanFlowSteps.map((item) => (
                    <li
                      key={item.step}
                      className="rounded-2xl border border-amber-100 bg-white/85 p-3"
                    >
                      <div className="flex items-center gap-2">
                        <span className="flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-full bg-amber-100 text-xs font-black text-amber-800">
                          {item.step}
                        </span>
                        <p className="text-xs font-black text-slate-800">
                          {item.title}
                        </p>
                      </div>
                      <p className="mt-2 text-[11px] leading-relaxed text-slate-600">
                        {item.body}
                      </p>
                    </li>
                  ))}
                </ol>
              </div>

              <SeharusnyaAdaSection desa={desaView} />
              <ResponsibilityGuideCard />
              <div id="pre-report-checklist">
                <PreReportChecklistCard kabupaten={desaView.kabupaten} />
              </div>
            </section>
          )),
        }
      : {}),
    ...(showSuaraSection
      ? {
          suara_warga: renderSlotSections("suara_warga", (
            <section id={SLOT_META.suara_warga.anchorId} className="space-y-3">
              <div className="max-w-2xl">
                <p className="text-xs font-black uppercase tracking-widest text-indigo-600">
                  Suara Warga
                </p>
                <h2 className="mt-1 text-lg font-black text-slate-900">
                  Cerita warga tentang kondisi desa ini
                </h2>
              </div>

              <Link
                href={`/desa/${desaView.id}/suara`}
                prefetch={false}
                className="group block overflow-hidden rounded-2xl border border-indigo-100 shadow-sm transition-all hover:shadow-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 focus-visible:ring-offset-2"
                aria-label={`Suara warga untuk ${desaView.nama}`}
              >
                <div className="flex items-center justify-between gap-3 bg-gradient-to-r from-indigo-600 to-violet-600 px-4 py-3.5">
                  <div className="flex items-center gap-2.5">
                    <div className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-xl bg-white/15">
                      <Megaphone size={15} className="text-white" aria-hidden />
                    </div>
                    <div>
                      <p className="text-sm font-bold text-white">Suara Warga</p>
                      <p className="text-[10px] text-indigo-200">
                        {voiceSummary.total > 0
                          ? `${voiceSummary.total} cerita dari warga`
                          : "Jadilah yang pertama bercerita"}
                      </p>
                    </div>
                  </div>
                  <ArrowRight
                    size={16}
                    className="flex-shrink-0 text-indigo-200 transition-all group-hover:translate-x-1 group-hover:text-white"
                    aria-hidden
                  />
                </div>
                {voicePreview.length > 0 ? (
                  <div className="divide-y divide-slate-50 bg-white">
                    {voicePreview.map((voice) => (
                      <div
                        key={voice.id}
                        className="flex items-start gap-2.5 px-4 py-2.5"
                      >
                        <span
                          className="mt-0.5 inline-flex min-w-12 flex-shrink-0 justify-center rounded-full bg-slate-100 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-[0.08em] text-slate-600"
                          aria-hidden
                        >
                          {voice.category}
                        </span>
                        <div className="min-w-0 flex-1">
                          <p className="line-clamp-2 text-xs leading-relaxed text-slate-700">
                            {voice.text}
                          </p>
                          <p className="mt-0.5 text-[10px] text-slate-500">
                            {voice.author}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : null}
                <div className="flex items-center justify-between bg-indigo-50 px-4 py-2">
                  <span className="text-[11px] font-semibold text-indigo-600">
                    Ceritakan Kondisi Desaku
                  </span>
                  <ArrowRight
                    size={12}
                    className="text-indigo-400 transition-transform group-hover:translate-x-0.5"
                    aria-hidden
                  />
                </div>
              </Link>
            </section>
          )),
        }
      : {}),
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-5">
      <div className="flex items-center justify-between">
        <Link
          href="/desa"
          prefetch={false}
          className="inline-flex items-center gap-2 rounded-lg text-sm text-slate-500 transition-colors hover:text-indigo-600 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 focus-visible:ring-offset-2"
        >
          <ArrowLeft size={15} aria-hidden /> Kembali ke Daftar Desa
        </Link>
        <DownloadButton desa={desaView} />
      </div>

      <DetailSectionNav sections={navItems} />
      {renderPlan.map((item, index) => {
        if (item.kind === "legacy_slot") {
          const section = slotSections[item.slot];
          return section ? <div key={`slot-${item.slot}`}>{section}</div> : null;
        }

        const section = registryOnlySectionsByComponentKey.get(item.componentKey);
        return section ? (
          <div key={`component-${item.componentKey}-${index}`}>{section}</div>
        ) : null;
      })}
    </div>
  );
}
