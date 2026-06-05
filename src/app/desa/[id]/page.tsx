import type { ReactNode } from "react";
import { notFound } from "next/navigation";
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
import PublicContributeForm from "@/components/desa/PublicContributeForm";
import {
  getAcceptedFileInputValue,
  getAllowedFormatLabels,
  getMaxFileSizeBytes,
} from "@/lib/storage/upload-validation";
import { getVoicePreviewForDesaFromDb } from "@/lib/data/voice-read";
import { perfStart, publicPerfLog } from "@/lib/perf";
import {
  buildPublicDetailRenderPlan,
  getOrderedVisibleSlots,
  type PublicDetailSlotKey,
} from "@/lib/village-data/public-detail-composition";
import { buildRuntimeTemplateManifest } from "@/lib/village-data/runtime-template-manifest";
import type { ComponentRendererType } from "@/lib/village-data/component-catalog-manifest";
import { PUBLIC_TEMPLATE_RENDERER_REGISTRY } from "@/components/desa/public-template-registry";
import DetailV2Shell, { type ChapterRailItem } from "@/components/desa/v2/DetailV2Shell";
import ChIdentity from "@/components/desa/v2/ChIdentity";
import ChSumber from "@/components/desa/v2/ChSumber";
import ChAnggaran from "@/components/desa/v2/ChAnggaran";
import ChKinerja from "@/components/desa/v2/ChKinerja";
import ChIsiDesa from "@/components/desa/v2/ChIsiDesa";
import ChTransparansi from "@/components/desa/v2/ChTransparansi";
import ChPanduan from "@/components/desa/v2/ChPanduan";
import ChSuara, { type VoicePreviewItem } from "@/components/desa/v2/ChSuara";
import { getShowcaseDemo } from "@/lib/desa-detail/showcase-demo";
import { getKomposisiBenchmark } from "@/lib/benchmarks/komposisi-apbdes";
import ChDanaDesa from "@/components/desa/v2/showcase/ChDanaDesa";
import ChKomposisi from "@/components/desa/v2/showcase/ChKomposisi";
import ChFasilitas from "@/components/desa/v2/showcase/ChFasilitas";
import ChPeta from "@/components/desa/v2/showcase/ChPeta";
import ChIndeksDesa from "@/components/desa/v2/showcase/ChIndeksDesa";
import ChKomparasi from "@/components/desa/v2/showcase/ChKomparasi";

import type { Metadata } from "next";

export const dynamic = "force-dynamic";

interface Props {
  params: Promise<{ id: string }>;
}

const SLOT_RAIL_LABEL: Record<PublicDetailSlotKey, string> = {
  first_view: "Kenalan",
  sumber_dokumen: "Sumber & Dokumen",
  transparansi: "Transparansi",
  ringkasan_anggaran: "Anggaran",
  kinerja_anggaran: "Kinerja",
  kelengkapan_desa: "Isi Desa",
  panduan_warga: "Panduan",
  suara_warga: "Suara Warga",
};

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
  const publishedPersentaseSerapan = readPublishedNumber(publishedValues, "persentaseSerapan");
  // Dana Desa pagu from DJPK (always present after ingestion; not the same as
  // APBDes totalAnggaran but the closest real budget figure we have).
  const publishedDanaDesa = readPublishedNumber(publishedValues, "danaDesa");

  // Real sources from DataDesa provenance (every published field carries a cited
  // source: DJPK, OSM, OpenSID, etc.). The legacy DataSource table is empty, which
  // made the detail page show "0 sumber" while displaying sourced data. Surface the
  // real provenance so the Sumber section reflects what's actually cited.
  const realSumber = (() => {
    const seen = new Set<string>();
    const out: { nama: string; status: "imported"; perluReview: boolean }[] = [];
    for (const s of templateData.sourceSummaries) {
      const label = s.sourceLabel?.trim();
      if (!label || seen.has(label)) continue;
      seen.add(label);
      out.push({ nama: label, status: "imported", perluReview: false });
    }
    return out;
  })();

  const desaView = {
    ...desa,
    sumber: realSumber.length > 0 ? realSumber : desa.sumber,
    jumlahSumber: realSumber.length > 0 ? realSumber.length : desa.jumlahSumber,
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
    // Use APBDes totalAnggaran if published; fall back to danaDesa pagu from
    // DJPK when APBDes data isn't available. The pagu is real but only the
    // central-government share — ADD/PADes/bantuan will show as 0 (unknown).
    totalAnggaran: publishedTotalAnggaran ?? (desa.totalAnggaran > 0 ? desa.totalAnggaran : (publishedDanaDesa ?? 0)),
    terealisasi: publishedTerealisasi ?? desa.terealisasi,
    pendapatan: publishedTotalAnggaran ?? desa.totalAnggaran
      ? undefined  // keep existing pendapatan from APBDes if available
      : publishedDanaDesa
        ? { danaDesa: publishedDanaDesa, add: 0, pades: 0, bantuanKeuangan: 0 }
        : undefined,
  };

  desaView.persentaseSerapan =
    publishedPersentaseSerapan !== null
      ? publishedPersentaseSerapan
      : desaView.totalAnggaran > 0
        ? Math.round((desaView.terealisasi / desaView.totalAnggaran) * 100)
        : desa.persentaseSerapan;

  // ─── SANDBOX SHOWCASE (throwaway) ──────────────────────────────────────────
  // Batukarut renders the FULL BMAD-T-001 v2 component set with DEMO (mock) data
  // for UI redesign. Replace with real template-driven data when adapters land.
  // See: src/lib/desa-detail/showcase-demo.ts + memory project-batukarut-demo-data-swap
  const demo = getShowcaseDemo(desa.id);
  if (demo) {
    const voice = await getVoicePreviewForDesaFromDb(desaView.prismaId ?? desaView.id);

    // Real geo coords from OSM ingestion (DataDesa) override the demo center when present.
    const realLat = readPublishedNumber(publishedValues, "geoLat");
    const realLng = readPublishedNumber(publishedValues, "geoLng");
    const geoIsReal = realLat !== null && realLng !== null;
    // When the center is real (from OSM), demo POI pins would sit ~km away and look
    // wrong — so show only a single marker at the real village center instead.
    const geo = geoIsReal
      ? {
          lat: realLat,
          lng: realLng,
          topografi: "Perbukitan · 650–700 mdpl",
          poi: [
            {
              label: `${desaView.nama} (pusat desa)`,
              jenis: "kantor" as const,
              lat: realLat,
              lng: realLng,
            },
          ],
        }
      : demo.geo;

    // Real Dana Desa pagu from DJPK (via Kemendesa IDM) ingestion overrides demo pagu.
    const realDanaDesa = readPublishedNumber(publishedValues, "danaDesa");
    // Keep the displayed year consistent with the real pagu figure's year (tahunData).
    const danaDesa =
      realDanaDesa !== null
        ? { ...demo.danaDesa, pagu: realDanaDesa, tahun: publishedTahun ?? demo.danaDesa.tahun }
        : demo.danaDesa;
    const danaDesaPaguReal = realDanaDesa !== null;

    // Real demografi from the desa's own official OpenSID site overrides demo values.
    const realKK = readPublishedNumber(publishedValues, "jumlahKK");
    const realDusun = readPublishedNumber(publishedValues, "jumlahDusun");
    const realRt = readPublishedNumber(publishedValues, "jumlahRt");
    const realRw = readPublishedNumber(publishedValues, "jumlahRw");
    if (desaView.profil) {
      if (realKK !== null) desaView.profil.jumlahKk = realKK;
      if (realDusun !== null) desaView.profil.jumlahDusun = realDusun;
      if (realRt !== null) desaView.profil.jumlahRt = realRt;
      if (realRw !== null) desaView.profil.jumlahRw = realRw;
    }
    const demografiReal = publishedPenduduk !== null || realKK !== null || realDusun !== null;

    // Kepala Desa + mata pencaharian from the desa's official site (real if ingested).
    const realKades = readPublishedString(publishedValues, "kepalaDesa");
    const realJob = readPublishedString(publishedValues, "mataPencaharian");
    if (desaView.profil && realJob) desaView.profil.mataPencaharian = realJob;

    // Wilayah, tata guna lahan & kontak — verified from the desa's own official site
    // (batukarut.desa.id /data-wilayah + homepage footer). Real, attributed to DESA-WEB.
    const REAL_KANTOR = "Jl. Arjasari No. 106, Batukarut, Arjasari, Kab. Bandung 40379";
    const REAL_TELP = "022-8593-0543";
    const REAL_WEB = "https://batukarut.desa.id";
    if (desaView.profil) {
      desaView.profil.luasWilayah = 1.78; // 177,77 ha → km²
      desaView.profil.luasSawah = 27.77; // sawah teknis 19,77 + tadah hujan 8 ha
      desaView.profil.telepon = REAL_TELP;
      desaView.profil.website = REAL_WEB;
    }
    const kades = {
      ...demo.kades,
      ...(realKades ? { nama: realKades } : {}),
      alamatKantor: REAL_KANTOR,
      telepon: REAL_TELP,
    };

    // Komposisi belanja = national benchmark config (reference, not per-desa mock).
    const bench = getKomposisiBenchmark("BERKEMBANG");
    const komposisi = { kategoriDesa: bench.kategori, bidang: bench.bidang };
    const showcaseChapters: ChapterRailItem[] = [
      { id: "ch-00", label: "00 · Kenalan" },
      { id: "ch-01", label: "01 · Dana Desa" },
      { id: "ch-02", label: "02 · Dipakai apa" },
      { id: "ch-03", label: "03 · Isi desa" },
      { id: "ch-04", label: "04 · Peta" },
      { id: "ch-05", label: "05 · Indeks" },
      { id: "ch-06", label: "06 · Komparasi" },
      { id: "ch-07", label: "07 · Sumber" },
      { id: "ch-08", label: "08 · Panduan" },
      { id: "ch-09", label: "09 · Suara warga" },
    ];
    return (
      <DetailV2Shell chapters={showcaseChapters}>
        <ChIdentity
          desa={desaView}
          chapterNo="00"
          totalChapters={showcaseChapters.length}
          sourceNote={
            demografiReal
              ? { label: "Website Resmi Desa (batukarut.desa.id) — demografi, wilayah & kontak; sebagian profil contoh", mock: false, url: "https://batukarut.desa.id" }
              : { label: "BPS Podes (demografi) & Prodeskel (profil/kontak)", mock: true }
          }
        />
        <ChDanaDesa
          chapterNo="01"
          danaDesa={danaDesa}
          paguSourceLabel={danaDesaPaguReal ? "DJPK Kemenkeu (via Kemendesa IDM)" : null}
        />
        <ChKomposisi chapterNo="02" komposisi={komposisi} isReference />
        <ChFasilitas
          chapterNo="03"
          fasilitas={demo.fasilitas}
          kades={kades}
          lembaga={demo.lembaga}
          bumdes={demo.bumdes}
        />
        <ChPeta
          chapterNo="04"
          geo={geo}
          namaDesa={desaView.nama}
          coordSourceLabel={geoIsReal ? "OpenStreetMap" : null}
        />
        <ChIndeksDesa chapterNo="05" idm={demo.idm} disiplin={demo.disiplin} />
        <ChKomparasi chapterNo="06" peer={demo.peer} />
        <ChSumber
          desa={desaView}
          chapterNo="07"
          sourceNote={{ label: "Website desa & PPID Kabupaten Bandung", mock: true }}
        />
        <ChPanduan desa={desaView} chapterNo="08" />
        <ChSuara desa={desaView} chapterNo="09" voice={voice} />
      </DetailV2Shell>
    );
  }

  const visibleComponents = runtimeManifest.visibleComponents;

  // Real coordinates from DataDesa (for map chapter + source attribution)
  const realLat = readPublishedNumber(publishedValues, "geoLat");
  const realLng = readPublishedNumber(publishedValues, "geoLng");
  const geoIsReal = realLat !== null && realLng !== null;

  // Source note derived from what real fields were ingested for this desa
  const derivedSourceNote = (() => {
    const hasDemografi = publishedPenduduk !== null || readPublishedString(publishedValues, "kepalaDesa") !== null;
    const parts: string[] = [];
    if (hasDemografi) parts.push("Website Resmi Desa (OpenSID)");
    if (geoIsReal) parts.push("OpenStreetMap");
    parts.push("DJPK Kemenkeu (Dana Desa)");
    return { label: parts.join(" · "), mock: false };
  })();

  const visibleSlots = getOrderedVisibleSlots(visibleComponents);
  const renderPlan = buildPublicDetailRenderPlan(visibleComponents);
  const hasRenderer = (rendererType: string) =>
    visibleComponents.some((component) => component.rendererType === rendererType);

  const showBudgetSummary = hasRenderer("budget_summary") || hasRenderer("pendapatan_breakdown");
  const showSourceSection = hasRenderer("source_snapshot");
  const showPerangkatSection = hasRenderer("perangkat_contacts");
  const showTransparansiSection = hasRenderer("transparency_metrics");
  const showKinerjaSection = hasRenderer("kinerja_breakdown");
  const showProfilSection = hasRenderer("kelengkapan_tabs");
  const showPanduanSection = hasRenderer("citizen_guide");
  const showSuaraSection = hasRenderer("voice_preview");
  const showFirstView = visibleSlots.includes("first_view");

  const voiceSummary = showSuaraSection
    ? await getVoicePreviewForDesaFromDb(desaView.prismaId ?? desaView.id)
    : { total: 0, preview: [] as VoicePreviewItem[] };

  // Registry-only components (non-legacy renderers, e.g. agenda_desa)
  const registryOnlySectionEntries = await Promise.all(
    renderPlan
      .filter((item) => item.kind === "registry_component")
      .map(async (item) => {
        const section = await PUBLIC_TEMPLATE_RENDERER_REGISTRY[
          item.rendererType as ComponentRendererType
        ]?.render({
          desa: desaView,
          publishedValues,
          sourceSummaries: templateData.sourceSummaries,
        });
        return [item.componentKey, section] as const;
      }),
  );
  const registryNodesByKey = new Map(
    registryOnlySectionEntries.filter(
      (entry) => entry[1] !== null && entry[1] !== undefined && entry[1] !== false,
    ) as Array<readonly [string, ReactNode]>,
  );

  // Per-slot chapter visibility + renderer (template-driven)
  const slotEnabled: Partial<Record<PublicDetailSlotKey, boolean>> = {
    first_view: showFirstView,
    sumber_dokumen: showSourceSection,
    transparansi: showTransparansiSection || showPerangkatSection,
    ringkasan_anggaran: showBudgetSummary,
    kinerja_anggaran: showKinerjaSection,
    kelengkapan_desa: showProfilSection,
    panduan_warga: showPanduanSection,
    suara_warga: showSuaraSection,
  };

  const enabledChapterCount = renderPlan.reduce((n, item) => {
    if (item.kind === "legacy_slot") return n + (slotEnabled[item.slot] ? 1 : 0);
    return n + (registryNodesByKey.has(item.componentKey) ? 1 : 0);
  }, 0) + (geoIsReal ? 1 : 0);

  const renderSlotChapter = (slot: PublicDetailSlotKey, no: string): ReactNode => {
    switch (slot) {
      case "first_view":
        return (
          <ChIdentity
            desa={desaView}
            chapterNo={no}
            totalChapters={enabledChapterCount}
            sourceNote={derivedSourceNote}
          />
        );
      case "sumber_dokumen":
        return <ChSumber desa={desaView} chapterNo={no} sourceNote={derivedSourceNote} />;
      case "transparansi":
        return <ChTransparansi desa={desaView} chapterNo={no} sourceNote={derivedSourceNote} />;
      case "ringkasan_anggaran":
        return <ChAnggaran desa={desaView} chapterNo={no} sourceNote={derivedSourceNote} />;
      case "kinerja_anggaran":
        return <ChKinerja desa={desaView} chapterNo={no} sourceNote={derivedSourceNote} />;
      case "kelengkapan_desa":
        return <ChIsiDesa desa={desaView} chapterNo={no} sourceNote={derivedSourceNote} />;
      case "panduan_warga":
        return <ChPanduan desa={desaView} chapterNo={no} sourceNote={derivedSourceNote} />;
      case "suara_warga":
        return <ChSuara desa={desaView} chapterNo={no} voice={voiceSummary} sourceNote={derivedSourceNote} />;
      default:
        return null;
    }
  };

  // Build ordered chapters from the render plan, numbering sequentially.
  const chapters: ChapterRailItem[] = [];
  const chapterNodes: ReactNode[] = [];
  let chapterIndex = 0;

  for (const item of renderPlan) {
    if (item.kind === "legacy_slot") {
      if (!slotEnabled[item.slot]) continue;

      const no = String(chapterIndex).padStart(2, "0");
      const node = renderSlotChapter(item.slot, no);
      if (!node) continue;
      chapters.push({ id: `ch-${no}`, label: `${no} · ${SLOT_RAIL_LABEL[item.slot]}` });
      chapterNodes.push(<div key={`ch-${item.slot}`}>{node}</div>);
      chapterIndex += 1;

      // Insert map chapter right AFTER first_view (Kenalan) → chapter 01.
      if (item.slot === "first_view" && geoIsReal) {
        const petaNo = String(chapterIndex).padStart(2, "0");
        chapters.push({ id: `ch-${petaNo}`, label: `${petaNo} · Peta` });
        chapterNodes.push(
          <div key="ch-peta">
            <ChPeta
              chapterNo={petaNo}
              geo={{
                lat: realLat!,
                lng: realLng!,
                topografi: `${desaView.kecamatan}, Kab. Bandung`,
                poi: [{ label: `${desaView.nama} (pusat desa)`, jenis: "kantor" as const, lat: realLat!, lng: realLng! }],
              }}
              namaDesa={desaView.nama}
              coordSourceLabel="OpenStreetMap"
            />
          </div>,
        );
        chapterIndex += 1;
      }
    } else {
      const section = registryNodesByKey.get(item.componentKey);
      if (!section) continue;
      const no = String(chapterIndex).padStart(2, "0");
      chapters.push({ id: `ch-${no}`, label: `${no} · ${item.componentKey}` });
      chapterNodes.push(
        <section key={`reg-${item.componentKey}`} id={`ch-${no}`} className="chapter">
          <div className="mx-auto max-w-[1080px] px-4 sm:px-6">{section}</div>
        </section>,
      );
      chapterIndex += 1;
    }
  }

  // Public "help complete the data" contribution form — appended as the final
  // chapter. Lists which dimensions are still missing so visitors know what helps.
  const missingDimensions: string[] = [];
  if (!geoIsReal) missingDimensions.push("Koordinat/peta");
  if (publishedPenduduk === null && !(desaView.penduduk > 0)) missingDimensions.push("Jumlah penduduk");
  if (readPublishedNumber(publishedValues, "luasWilayah") === null) missingDimensions.push("Luas wilayah");
  if (readPublishedString(publishedValues, "kepalaDesa") === null) missingDimensions.push("Kepala desa");
  if ((desaView.dokumen?.length ?? 0) === 0) missingDimensions.push("Dokumen publik");
  if ((desaView.apbdes?.length ?? 0) === 0) missingDimensions.push("Rincian APBDes");

  chapters.push({ id: "ch-contribute", label: "★ Bantu Lengkapi" });
  chapterNodes.push(
    <section key="ch-contribute" id="ch-contribute" className="chapter">
      <div className="mx-auto max-w-[1080px] px-4 sm:px-6">
        <PublicContributeForm
          desaId={desaView.prismaId ?? desaView.id}
          desaNama={desaView.nama}
          missing={missingDimensions}
          accept={getAcceptedFileInputValue()}
          formatLabels={getAllowedFormatLabels()}
          maxFileMb={Math.round(getMaxFileSizeBytes() / (1024 * 1024))}
        />
      </div>
    </section>,
  );

  return (
    <DetailV2Shell chapters={chapters}>
      {chapterNodes}
    </DetailV2Shell>
  );
}
