import Link from "next/link";
import {
  ArrowRight,
  CheckCircle2,
  Clock,
  FileText,
  Layers3,
  Mail,
  MapPin,
  Megaphone,
  Phone,
  TrendingUp,
  Users2,
  Wallet,
} from "lucide-react";
import type { ReactNode } from "react";
import type { Desa, PendapatanDesa, PerangkatDesa, ProfilDesa } from "@/lib/types";
import type { PublishedTemplateSourceSummary } from "@/lib/data/village-template-read";
import {
  buildPublishedProfilSection,
  readPublishedNumber,
  readPublishedString,
  toPublishedApbdesItems,
  toPublishedOutputFisikArray,
  toPublishedPerangkatDesaArray,
  toPublishedRiwayatArray,
} from "@/lib/data/desa-template-public-view";
import { getVoicePreviewForDesaFromDb } from "@/lib/data/voice-read";
import { formatRupiahFull } from "@/lib/utils";
import APBDesBreakdown from "@/components/desa/APBDesBreakdown";
import KelengkapanDesa from "@/components/desa/KelengkapanDesa";
import OutputFisikCards from "@/components/desa/OutputFisikCards";
import PreReportChecklistCard from "@/components/desa/PreReportChecklistCard";
import ResponsibilityGuideCard from "@/components/desa/ResponsibilityGuideCard";
import RiwayatChart from "@/components/desa/RiwayatChart";
import SeharusnyaAdaSection from "@/components/desa/SeharusnyaAdaSection";
import SourceDocumentSnapshotSection from "@/components/desa/SourceDocumentSnapshotSection";
import { DataStatusBadge } from "@/components/ui/DataStatusBadge";

export interface PublicTemplateSectionContext {
  desa: Desa;
  publishedValues: Record<string, unknown>;
  sourceSummaries: PublishedTemplateSourceSummary[];
}

export interface PublicTemplateSectionDefinition {
  componentKey: string;
  navLabel: string;
  anchorId: string;
  detailSlot: string;
  render: (
    context: PublicTemplateSectionContext,
  ) => ReactNode | Promise<ReactNode>;
  preview: (input: PublicTemplatePreviewInput) => ReactNode;
}

export interface PublicTemplatePreviewField {
  fieldKey: string;
  label: string;
  valueType?: string;
}

export interface PublicTemplatePreviewInput {
  componentKey: string;
  label: string;
  description: string;
  fields: PublicTemplatePreviewField[];
  highlightFieldKeys?: string[];
}

function SectionShell({
  title,
  subtitle,
  children,
}: {
  title: string;
  subtitle: string;
  children: ReactNode;
}) {
  return (
    <section className="space-y-3">
      <div>
        <p className="text-xs font-black uppercase tracking-widest text-slate-400">
          {subtitle}
        </p>
        <h2 className="mt-1 text-xl font-black leading-tight text-slate-900">
          {title}
        </h2>
      </div>
      {children}
    </section>
  );
}

function EmptySectionState({
  title,
  body,
}: {
  title: string;
  body: string;
}) {
  return (
    <div
      className="rounded-3xl bg-white px-5 py-6 text-sm text-slate-500"
      style={{
        boxShadow:
          "inset 0 0 0 1px rgba(15,23,42,0.06), 0 1px 1px rgba(15,23,42,0.03), 0 2px 4px rgba(15,23,42,0.04)",
      }}
    >
      <p className="font-semibold text-slate-800">{title}</p>
      <p className="mt-2 leading-relaxed">{body}</p>
    </div>
  );
}

function PreviewDbFieldChip({ label }: { label: string }) {
  return (
    <span className="inline-flex items-center gap-1 rounded-full bg-indigo-50 px-2 py-1 text-[10px] font-semibold text-indigo-700 shadow-[inset_0_0_0_1px_rgba(79,70,229,0.12)]">
      <span className="h-1.5 w-1.5 rounded-full bg-indigo-500" aria-hidden />
      Field DB
      <span className="text-indigo-500/80">{label}</span>
    </span>
  );
}

function renderPreviewFieldChips(input: PublicTemplatePreviewInput) {
  const highlightKeys = new Set(input.highlightFieldKeys ?? []);
  const highlighted = input.fields.filter((field) => highlightKeys.has(field.fieldKey));
  const fallback = highlighted.length > 0 ? highlighted : input.fields.slice(0, 3);
  return fallback.slice(0, 4).map((field) => (
    <PreviewDbFieldChip key={field.fieldKey} label={field.label} />
  ));
}

function PreviewShell({
  eyebrow,
  title,
  body,
  tone,
  chips,
  children,
}: {
  eyebrow: string;
  title: string;
  body: string;
  tone: string;
  chips: ReactNode;
  children: ReactNode;
}) {
  return (
    <div className={`overflow-hidden rounded-[28px] border ${tone}`}>
      <div className="space-y-3 p-4 sm:p-5">
        <div>
          <p className="text-[10px] font-black uppercase tracking-[0.16em] text-slate-400">
            {eyebrow}
          </p>
          <h3 className="mt-1 text-[15px] font-black leading-tight text-slate-900">
            {title}
          </h3>
          <p className="mt-1 text-[11px] leading-relaxed text-slate-500">{body}</p>
        </div>
        <div className="flex flex-wrap gap-1.5">{chips}</div>
        {children}
      </div>
    </div>
  );
}

function FieldGridItem({
  label,
  value,
}: {
  label: string;
  value: string | null;
}) {
  return (
    <div
      className="rounded-2xl bg-white px-4 py-3"
      style={{ boxShadow: "inset 0 0 0 1px rgba(15,23,42,0.05)" }}
    >
      <p className="text-[10px] uppercase tracking-[0.14em] text-slate-400 font-semibold">
        {label}
      </p>
      <p className="mt-1 text-[13px] font-semibold text-slate-900">
        {value ?? <span className="italic font-normal text-slate-400">Belum terisi</span>}
      </p>
    </div>
  );
}

function buildPerangkatSectionData(
  publishedValues: Record<string, unknown>,
): PerangkatDesa[] {
  return toPublishedPerangkatDesaArray(
    publishedValues.perangkatDesa,
    readPublishedString(publishedValues, "kepalaDesa"),
  );
}

function buildPendapatanSectionData(
  publishedValues: Record<string, unknown>,
): PendapatanDesa | null {
  const danaDesa = readPublishedNumber(publishedValues, "danaDesa");
  const add = readPublishedNumber(publishedValues, "add");
  const pades = readPublishedNumber(publishedValues, "pades");
  const bantuanKeuangan = readPublishedNumber(publishedValues, "bantuanKeuangan");

  if (
    danaDesa === null &&
    add === null &&
    pades === null &&
    bantuanKeuangan === null
  ) {
    return null;
  }

  return {
    danaDesa: danaDesa ?? 0,
    add: add ?? 0,
    pades: pades ?? 0,
    bantuanKeuangan: bantuanKeuangan ?? 0,
  };
}

function buildProfilContactChips(profil: ProfilDesa) {
  const chips = [
    profil.telepon
      ? {
          href: `tel:${profil.telepon}`,
          label: profil.telepon,
          icon: Phone,
          external: false,
        }
      : null,
    profil.email
      ? {
          href: `mailto:${profil.email}`,
          label: profil.email,
          icon: Mail,
          external: false,
        }
      : null,
  ].filter(Boolean) as Array<{
    href: string;
    label: string;
    icon: typeof Phone;
    external: boolean;
  }>;

  return chips;
}

function renderIdentitasSection({ publishedValues }: PublicTemplateSectionContext) {
  return (
    <SectionShell
      title="Identitas & wilayah desa"
      subtitle="Komponen template identitas"
    >
      <div
        className="rounded-3xl bg-gradient-to-br from-white via-indigo-50/40 to-sky-50 p-5 sm:p-6"
        style={{
          boxShadow:
            "inset 0 0 0 1px rgba(15,23,42,0.06), 0 1px 1px rgba(15,23,42,0.03), 0 2px 4px rgba(15,23,42,0.04)",
        }}
      >
        <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
          <FieldGridItem
            label="Website resmi"
            value={readPublishedString(publishedValues, "websiteUrl")}
          />
          <FieldGridItem
            label="Kategori desa"
            value={readPublishedString(publishedValues, "kategori")}
          />
          <FieldGridItem
            label="Tahun data"
            value={
              readPublishedNumber(publishedValues, "tahunData") !== null
                ? String(readPublishedNumber(publishedValues, "tahunData"))
                : null
            }
          />
          <FieldGridItem
            label="Kecamatan"
            value={readPublishedString(publishedValues, "kecamatan")}
          />
          <FieldGridItem
            label="Kabupaten/Kota"
            value={readPublishedString(publishedValues, "kabupaten")}
          />
          <FieldGridItem
            label="Provinsi"
            value={readPublishedString(publishedValues, "provinsi")}
          />
        </div>
      </div>
    </SectionShell>
  );
}

function renderDemografiSection({ publishedValues }: PublicTemplateSectionContext) {
  const cards = [
    {
      label: "Jumlah penduduk",
      value: readPublishedNumber(publishedValues, "jumlahPenduduk"),
      suffix: "jiwa",
      icon: Users2,
      tone: "text-indigo-700 bg-indigo-50",
    },
    {
      label: "Jumlah KK",
      value: readPublishedNumber(publishedValues, "jumlahKK"),
      suffix: "KK",
      icon: Layers3,
      tone: "text-emerald-700 bg-emerald-50",
    },
    {
      label: "Jumlah dusun",
      value: readPublishedNumber(publishedValues, "jumlahDusun"),
      suffix: "dusun",
      icon: MapPin,
      tone: "text-sky-700 bg-sky-50",
    },
    {
      label: "Jumlah RT",
      value: readPublishedNumber(publishedValues, "jumlahRt"),
      suffix: "RT",
      icon: MapPin,
      tone: "text-amber-700 bg-amber-50",
    },
    {
      label: "Jumlah RW",
      value: readPublishedNumber(publishedValues, "jumlahRw"),
      suffix: "RW",
      icon: MapPin,
      tone: "text-violet-700 bg-violet-50",
    },
  ];

  return (
    <SectionShell title="Demografi desa" subtitle="Komponen template demografi">
      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-5">
        {cards.map((card) => {
          const Icon = card.icon;
          return (
            <div
              key={card.label}
              className="rounded-3xl bg-white p-4"
              style={{
                boxShadow:
                  "inset 0 0 0 1px rgba(15,23,42,0.06), 0 1px 1px rgba(15,23,42,0.03), 0 2px 4px rgba(15,23,42,0.04)",
              }}
            >
              <div
                className={`inline-flex h-10 w-10 items-center justify-center rounded-2xl ${card.tone}`}
              >
                <Icon size={16} aria-hidden />
              </div>
              <p className="mt-3 text-[11px] text-slate-500">{card.label}</p>
              <p className="mt-1 text-lg font-black text-slate-900">
                {card.value !== null ? `${card.value.toLocaleString("id-ID")} ${card.suffix}` : "—"}
              </p>
            </div>
          );
        })}
      </div>
    </SectionShell>
  );
}

function renderSumberDokumenSection({ desa }: PublicTemplateSectionContext) {
  return (
    <SectionShell
      title="Sumber publik & dokumen pendukung"
      subtitle="Komponen template sumber"
    >
      <SourceDocumentSnapshotSection desa={desa} />
    </SectionShell>
  );
}

function renderTransparansiSection({ publishedValues }: PublicTemplateSectionContext) {
  const metrics = [
    {
      label: "Skor transparansi total",
      value: readPublishedNumber(publishedValues, "skorTransparansiTotal"),
      tone: "bg-indigo-50 text-indigo-700",
    },
    {
      label: "Ketepatan pelaporan",
      value: readPublishedNumber(publishedValues, "skorKetepatan"),
      tone: "bg-emerald-50 text-emerald-700",
    },
    {
      label: "Kelengkapan dokumen",
      value: readPublishedNumber(publishedValues, "skorKelengkapan"),
      tone: "bg-amber-50 text-amber-700",
    },
  ];

  if (metrics.every((metric) => metric.value === null)) {
    return (
      <SectionShell
        title="Transparansi & skor"
        subtitle="Komponen template transparansi"
      >
        <EmptySectionState
          title="Skor transparansi belum diterbitkan"
          body="Section ini hanya akan menampilkan skor yang sudah terbit dari field template aktif."
        />
      </SectionShell>
    );
  }

  return (
    <SectionShell
      title="Transparansi & skor"
      subtitle="Komponen template transparansi"
    >
      <div className="grid gap-3 lg:grid-cols-3">
        {metrics.map((metric) => (
          <div
            key={metric.label}
            className="rounded-3xl bg-white p-5"
            style={{
              boxShadow:
                "inset 0 0 0 1px rgba(15,23,42,0.06), 0 1px 1px rgba(15,23,42,0.03), 0 2px 4px rgba(15,23,42,0.04)",
            }}
          >
            <div
              className={`inline-flex rounded-full px-3 py-1 text-[10px] font-semibold ${metric.tone}`}
            >
              {metric.label}
            </div>
            <p className="mt-3 text-3xl font-black text-slate-900">
              {metric.value !== null ? metric.value : "—"}
            </p>
            <p className="mt-2 text-[12px] leading-relaxed text-slate-500">
              Hanya angka yang sudah terbit dari template aktif yang tampil di section ini.
            </p>
          </div>
        ))}
      </div>
    </SectionShell>
  );
}

function renderAnggaranSection({ publishedValues }: PublicTemplateSectionContext) {
  const totalAnggaran = readPublishedNumber(publishedValues, "totalAnggaran");
  const terealisasi = readPublishedNumber(publishedValues, "terealisasi");
  const persentaseSerapan = readPublishedNumber(publishedValues, "persentaseSerapan");

  if (totalAnggaran === null && terealisasi === null && persentaseSerapan === null) {
    return (
      <SectionShell
        title="Anggaran & realisasi"
        subtitle="Komponen template anggaran"
      >
        <EmptySectionState
          title="Ringkasan anggaran belum terbit"
          body="Section ini menunggu field total anggaran, realisasi, dan persentase serapan dari template aktif."
        />
      </SectionShell>
    );
  }

  const safeTotal = totalAnggaran ?? 0;
  const safeRealisasi = terealisasi ?? 0;
  const selisih = Math.max(0, safeTotal - safeRealisasi);

  const cards = [
    {
      label: "Total anggaran",
      value: totalAnggaran !== null ? formatRupiahFull(safeTotal) : "—",
      icon: Wallet,
      tone: "bg-indigo-50 text-indigo-700",
    },
    {
      label: "Sudah terealisasi",
      value: terealisasi !== null ? formatRupiahFull(safeRealisasi) : "—",
      icon: CheckCircle2,
      tone: "bg-emerald-50 text-emerald-700",
    },
    {
      label: "Belum terserap",
      value:
        totalAnggaran !== null || terealisasi !== null ? formatRupiahFull(selisih) : "—",
      icon: Clock,
      tone: "bg-rose-50 text-rose-700",
    },
    {
      label: "Persentase serapan",
      value: persentaseSerapan !== null ? `${persentaseSerapan}%` : "—",
      icon: TrendingUp,
      tone: "bg-amber-50 text-amber-700",
    },
  ];

  return (
    <SectionShell
      title="Anggaran & realisasi"
      subtitle="Komponen template anggaran"
    >
      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        {cards.map((card) => {
          const Icon = card.icon;
          return (
            <div
              key={card.label}
              className="rounded-3xl bg-white p-4"
              style={{
                boxShadow:
                  "inset 0 0 0 1px rgba(15,23,42,0.06), 0 1px 1px rgba(15,23,42,0.03), 0 2px 4px rgba(15,23,42,0.04)",
              }}
            >
              <div
                className={`inline-flex h-10 w-10 items-center justify-center rounded-2xl ${card.tone}`}
              >
                <Icon size={16} aria-hidden />
              </div>
              <p className="mt-3 text-[11px] text-slate-500">{card.label}</p>
              <p className="mt-1 text-[15px] font-black text-slate-900">{card.value}</p>
            </div>
          );
        })}
      </div>
    </SectionShell>
  );
}

function renderPendapatanSection({ publishedValues }: PublicTemplateSectionContext) {
  const pendapatan = buildPendapatanSectionData(publishedValues);
  if (!pendapatan) {
    return (
      <SectionShell
        title="Sumber pendapatan desa"
        subtitle="Komponen template pendapatan"
      >
        <EmptySectionState
          title="Belum ada rincian pendapatan yang terbit"
          body="Section ini menunggu field sumber pendapatan APBDes dari template aktif."
        />
      </SectionShell>
    );
  }

  const items = [
    { label: "Dana Desa", value: pendapatan.danaDesa, tone: "bg-indigo-50 text-indigo-700" },
    { label: "ADD", value: pendapatan.add, tone: "bg-sky-50 text-sky-700" },
    { label: "PADes", value: pendapatan.pades, tone: "bg-emerald-50 text-emerald-700" },
    {
      label: "Bantuan keuangan",
      value: pendapatan.bantuanKeuangan,
      tone: "bg-violet-50 text-violet-700",
    },
  ];

  return (
    <SectionShell
      title="Sumber pendapatan desa"
      subtitle="Komponen template pendapatan"
    >
      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        {items.map((item) => (
          <div
            key={item.label}
            className="rounded-3xl bg-white p-4"
            style={{
              boxShadow:
                "inset 0 0 0 1px rgba(15,23,42,0.06), 0 1px 1px rgba(15,23,42,0.03), 0 2px 4px rgba(15,23,42,0.04)",
            }}
          >
            <span
              className={`inline-flex rounded-full px-3 py-1 text-[10px] font-semibold ${item.tone}`}
            >
              {item.label}
            </span>
            <p className="mt-3 text-lg font-black text-slate-900">
              {formatRupiahFull(item.value)}
            </p>
          </div>
        ))}
      </div>
    </SectionShell>
  );
}

function renderKinerjaSection({ publishedValues }: PublicTemplateSectionContext) {
  const outputFisik = toPublishedOutputFisikArray(publishedValues.outputFisik);
  const apbdesItems = toPublishedApbdesItems(publishedValues.apbdesItems);
  const riwayat = toPublishedRiwayatArray(publishedValues.riwayatAPBDes);

  if (outputFisik.length === 0 && apbdesItems.length === 0 && riwayat.length === 0) {
    return (
      <SectionShell
        title="Kinerja & rincian APBDes"
        subtitle="Komponen template kinerja"
      >
        <EmptySectionState
          title="Belum ada kinerja yang terbit"
          body="Output fisik, rincian APBDes, dan riwayat tahunan akan tampil di sini setelah diterbitkan dari template aktif."
        />
      </SectionShell>
    );
  }

  return (
    <SectionShell
      title="Kinerja & rincian APBDes"
      subtitle="Komponen template kinerja"
    >
      <div className="space-y-4">
        {outputFisik.length > 0 ? <OutputFisikCards items={outputFisik} /> : null}
        <div className="grid gap-4 xl:grid-cols-2">
          {apbdesItems.length > 0 ? <APBDesBreakdown items={apbdesItems} /> : null}
          {riwayat.length > 0 ? <RiwayatChart riwayat={riwayat} /> : null}
        </div>
      </div>
    </SectionShell>
  );
}

function renderProfilSection({ publishedValues }: PublicTemplateSectionContext) {
  const profil = buildPublishedProfilSection(publishedValues);
  if (!profil) {
    return (
      <SectionShell
        title="Profil & kelengkapan desa"
        subtitle="Komponen template profil"
      >
        <EmptySectionState
          title="Profil desa belum terbit"
          body="Section ini menunggu kontak, perangkat desa, potensi, profil wilayah, aset, fasilitas, lembaga, atau BUMDes dari template aktif."
        />
      </SectionShell>
    );
  }

  const perangkat = buildPerangkatSectionData(publishedValues);
  const profilWithPerangkat = {
    ...profil,
    perangkat,
  };
  const contactChips = buildProfilContactChips(profil);
  const summaryCards = [
    { label: "Potensi unggulan", value: profil.potensiUnggulan || "Belum terisi" },
    { label: "Mata pencaharian", value: profil.mataPencaharian || "Belum terisi" },
    {
      label: "Luas wilayah",
      value: profil.luasWilayah ? `${profil.luasWilayah} km2` : "Belum terisi",
    },
    {
      label: "Luas sawah",
      value: profil.luasSawah ? `${profil.luasSawah} ha` : "Belum terisi",
    },
    {
      label: "Luas hutan/kebun",
      value: profil.luasHutan ? `${profil.luasHutan} ha` : "Belum terisi",
    },
  ];

  return (
    <SectionShell
      title="Profil & kelengkapan desa"
      subtitle="Komponen template profil"
    >
      <div className="space-y-4">
        <div
          className="rounded-3xl bg-white p-5 sm:p-6"
          style={{
            boxShadow:
              "inset 0 0 0 1px rgba(15,23,42,0.06), 0 1px 1px rgba(15,23,42,0.03), 0 2px 4px rgba(15,23,42,0.04)",
          }}
        >
          <div className="grid gap-3 lg:grid-cols-[minmax(0,1.2fr)_minmax(0,0.8fr)]">
            <div className="space-y-3">
              <p className="text-sm leading-relaxed text-slate-600">
                Informasi kontak, potensi, dan kelengkapan desa berikut seluruhnya
                ditarik dari field template aktif yang sudah diterbitkan.
              </p>
              <div className="grid gap-3 sm:grid-cols-2">
                {summaryCards.map((card) => (
                  <FieldGridItem key={card.label} label={card.label} value={card.value} />
                ))}
              </div>
            </div>

            <div className="space-y-3">
              {contactChips.length > 0 ? (
                <div className="flex flex-wrap gap-2">
                  {contactChips.map((chip) => {
                    const Icon = chip.icon;
                    return (
                      <a
                        key={`${chip.label}-${chip.href}`}
                        href={chip.href}
                        target={chip.external ? "_blank" : undefined}
                        rel={chip.external ? "noopener noreferrer" : undefined}
                        className="inline-flex items-center gap-1.5 rounded-xl bg-slate-50 px-3 py-2 text-[11px] font-semibold text-slate-700"
                        style={{
                          boxShadow: "inset 0 0 0 1px rgba(15,23,42,0.07)",
                        }}
                      >
                        <Icon size={12} aria-hidden />
                        {chip.label}
                      </a>
                    );
                  })}
                </div>
              ) : (
                <EmptySectionState
                  title="Kontak desa belum terbit"
                  body="Telepon dan email desa akan tampil di sini saat field template terkait sudah diterbitkan."
                />
              )}
            </div>
          </div>
        </div>

        {(profilWithPerangkat.perangkat?.length ||
          profilWithPerangkat.aset.length > 0 ||
          profilWithPerangkat.fasilitas.length > 0 ||
          profilWithPerangkat.lembaga.length > 0 ||
          profilWithPerangkat.bumdes) ? (
          <KelengkapanDesa profil={profilWithPerangkat} />
        ) : null}
      </div>
    </SectionShell>
  );
}

function renderPanduanWargaSection({ desa }: PublicTemplateSectionContext) {
  return (
    <SectionShell title="Panduan warga" subtitle="Komponen template panduan">
      <div className="space-y-4 rounded-3xl border border-amber-100 bg-amber-50/55 p-5 sm:p-6">
        <div className="max-w-2xl">
          <p className="text-sm font-black text-slate-900">
            Baca hak warga, tanya pihak yang tepat, lalu cek langkah sebelum melapor.
          </p>
          <p className="mt-2 text-sm leading-relaxed text-slate-600">
            Komponen ini dipakai sebagai jalur baca yang aman sebelum warga mengambil
            kesimpulan atau menyampaikan kondisi desa.
          </p>
        </div>

        <SeharusnyaAdaSection desa={desa} />
        <ResponsibilityGuideCard />
        <PreReportChecklistCard kabupaten={desa.kabupaten} />
      </div>
    </SectionShell>
  );
}

async function PublicSuaraWargaSection({ desa }: PublicTemplateSectionContext) {
  const voiceSummary = await getVoicePreviewForDesaFromDb(desa.prismaId ?? desa.id);
  const voicePreview = voiceSummary.preview;

  return (
    <SectionShell title="Suara warga" subtitle="Komponen template suara">
      <Link
        href={`/desa/${desa.id}/suara`}
        prefetch={false}
        className="group block overflow-hidden rounded-3xl border border-indigo-100 shadow-sm transition-all hover:shadow-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 focus-visible:ring-offset-2"
      >
        <div className="flex items-center justify-between gap-3 bg-gradient-to-r from-indigo-600 to-violet-600 px-4 py-4">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-white/15 text-white">
              <Megaphone size={18} aria-hidden />
            </div>
            <div>
              <p className="text-sm font-bold text-white">Cerita warga desa</p>
              <p className="text-[11px] text-indigo-100">
                {voiceSummary.total > 0
                  ? `${voiceSummary.total} cerita tercatat`
                  : "Belum ada cerita warga yang tercatat"}
              </p>
            </div>
          </div>
          <ArrowRight size={16} className="text-indigo-100 transition-transform group-hover:translate-x-1" />
        </div>

        {voicePreview.length > 0 ? (
          <div className="divide-y divide-slate-50 bg-white">
            {voicePreview.map((voice) => (
              <div key={voice.id} className="flex items-start gap-3 px-4 py-3">
                <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-indigo-50 text-indigo-600">
                  <FileText size={14} aria-hidden />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="line-clamp-2 text-xs leading-relaxed text-slate-700">
                    {voice.text}
                  </p>
                  <p className="mt-1 text-[10px] text-slate-500">{voice.author}</p>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="bg-white px-4 py-4 text-sm text-slate-500">
            Belum ada cerita warga yang tampil di komponen ini.
          </div>
        )}
      </Link>
    </SectionShell>
  );
}

function previewIdentitasSection(input: PublicTemplatePreviewInput) {
  return (
    <PreviewShell
      eyebrow="Preview detail publik"
      title={input.label}
      body="Kartu identitas desa di halaman publik. Field DB muncul sebagai grid informasi dasar."
      tone="border-indigo-100 bg-gradient-to-br from-white via-indigo-50/40 to-sky-50"
      chips={renderPreviewFieldChips(input)}
    >
      <div className="grid gap-2 sm:grid-cols-2 xl:grid-cols-3">
        {["Website resmi", "Kategori desa", "Tahun data", "Kecamatan", "Kabupaten/Kota", "Provinsi"].map((label) => (
          <div key={label} className="rounded-2xl bg-white px-3 py-2.5 shadow-[inset_0_0_0_1px_rgba(15,23,42,0.05)]">
            <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-slate-400">{label}</p>
            <p className="mt-1 text-[12px] font-semibold text-slate-900">Konten publik</p>
          </div>
        ))}
      </div>
    </PreviewShell>
  );
}

function previewDemografiSection(input: PublicTemplatePreviewInput) {
  return (
    <PreviewShell
      eyebrow="Preview detail publik"
      title={input.label}
      body="Metrik demografi ditampilkan sebagai kartu angka ringkas yang mudah dipindai."
      tone="border-emerald-100 bg-white"
      chips={renderPreviewFieldChips(input)}
    >
      <div className="grid gap-2 sm:grid-cols-3 xl:grid-cols-5">
        {["Penduduk", "KK", "Dusun", "RT", "RW"].map((label, index) => (
          <div key={label} className="rounded-2xl bg-slate-50 px-3 py-3 shadow-[inset_0_0_0_1px_rgba(15,23,42,0.04)]">
            <p className="text-[10px] text-slate-400">{label}</p>
            <p className="mt-1 text-lg font-black text-slate-900">{index === 0 ? "3.786" : index + 4}</p>
          </div>
        ))}
      </div>
    </PreviewShell>
  );
}

function previewSourceSection(input: PublicTemplatePreviewInput) {
  return (
    <PreviewShell
      eyebrow="Preview detail publik"
      title={input.label}
      body="Snapshot sumber tampil sebagai bukti awal sebelum warga membaca angka atau dokumen."
      tone="border-sky-100 bg-white"
      chips={renderPreviewFieldChips(input)}
    >
      <div className="grid gap-2 lg:grid-cols-2">
        <div className="rounded-2xl bg-white p-4 shadow-[inset_0_0_0_1px_rgba(15,23,42,0.05)]">
          <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-slate-400">Sumber publik</p>
          <p className="mt-2 text-[13px] font-black text-slate-900">Website resmi desa</p>
          <p className="mt-1 text-[11px] text-slate-500">URL, label sumber, dan status cek tampil di sini.</p>
        </div>
        <div className="rounded-2xl bg-white p-4 shadow-[inset_0_0_0_1px_rgba(15,23,42,0.05)]">
          <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-slate-400">Dokumen pendukung</p>
          <p className="mt-2 text-[13px] font-black text-slate-900">Belanja desa / profil resmi</p>
          <p className="mt-1 text-[11px] text-slate-500">Ringkasan dokumen, bukan payload panjang.</p>
        </div>
      </div>
    </PreviewShell>
  );
}

function previewTransparansiSection(input: PublicTemplatePreviewInput) {
  return (
    <PreviewShell
      eyebrow="Preview detail publik"
      title={input.label}
      body="Skor transparansi tetap muncul sebagai tiga metrik utama, bukan tabel teknis."
      tone="border-cyan-100 bg-white"
      chips={renderPreviewFieldChips(input)}
    >
      <div className="grid gap-2 lg:grid-cols-3">
        {["Skor total", "Ketepatan", "Kelengkapan"].map((label) => (
          <div key={label} className="rounded-2xl bg-white px-4 py-4 shadow-[inset_0_0_0_1px_rgba(15,23,42,0.05)]">
            <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-slate-400">{label}</p>
            <p className="mt-2 text-2xl font-black text-slate-900">84</p>
          </div>
        ))}
      </div>
    </PreviewShell>
  );
}

function previewAnggaranSection(input: PublicTemplatePreviewInput) {
  return (
    <PreviewShell
      eyebrow="Preview detail publik"
      title={input.label}
      body="Ringkasan anggaran tampil sebagai kartu angka utama yang jadi pintu masuk membaca APBDes."
      tone="border-amber-100 bg-white"
      chips={renderPreviewFieldChips(input)}
    >
      <div className="grid gap-2 sm:grid-cols-2 xl:grid-cols-4">
        {["Total anggaran", "Realisasi", "Belum terserap", "Persentase"].map((label) => (
          <div key={label} className="rounded-2xl bg-white px-3 py-3 shadow-[inset_0_0_0_1px_rgba(15,23,42,0.05)]">
            <p className="text-[10px] text-slate-400">{label}</p>
            <p className="mt-1 text-[13px] font-black text-slate-900">{label === "Persentase" ? "81%" : "Rp 3,3 M"}</p>
          </div>
        ))}
      </div>
    </PreviewShell>
  );
}

function previewPendapatanSection(input: PublicTemplatePreviewInput) {
  return (
    <PreviewShell
      eyebrow="Preview detail publik"
      title={input.label}
      body="Rincian sumber pendapatan tetap berupa breakdown asal dana dengan bar sederhana."
      tone="border-orange-100 bg-white"
      chips={renderPreviewFieldChips(input)}
    >
      <div className="grid gap-2 sm:grid-cols-2 xl:grid-cols-4">
        {["Dana Desa", "ADD", "PADes", "Bantuan"].map((label, index) => (
          <div key={label} className="rounded-2xl bg-white px-3 py-3 shadow-[inset_0_0_0_1px_rgba(15,23,42,0.05)]">
            <p className="text-[10px] text-slate-400">{label}</p>
            <p className="mt-1 text-[13px] font-black text-slate-900">Rp {(index + 1) * 250} Jt</p>
            <div className="mt-2 h-1.5 rounded-full bg-slate-100">
              <div className="h-full rounded-full bg-amber-400" style={{ width: `${68 + index * 6}%` }} />
            </div>
          </div>
        ))}
      </div>
    </PreviewShell>
  );
}

function previewKinerjaSection(input: PublicTemplatePreviewInput) {
  return (
    <PreviewShell
      eyebrow="Preview detail publik"
      title={input.label}
      body="Section ini tetap memadukan output fisik, rincian APBDes, dan riwayat dalam slot yang sama."
      tone="border-slate-200 bg-white"
      chips={renderPreviewFieldChips(input)}
    >
      <div className="grid gap-2 lg:grid-cols-[1.1fr_0.9fr]">
        <div className="rounded-2xl bg-white p-4 shadow-[inset_0_0_0_1px_rgba(15,23,42,0.05)]">
          <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-slate-400">Output fisik</p>
          <div className="mt-2 space-y-2">
            {["Perbaikan jalan desa", "Drainase lingkungan", "Pelatihan warga"].map((item) => (
              <div key={item} className="rounded-xl bg-slate-50 px-3 py-2 text-[11px] font-medium text-slate-700">
                {item}
              </div>
            ))}
          </div>
        </div>
        <div className="rounded-2xl bg-white p-4 shadow-[inset_0_0_0_1px_rgba(15,23,42,0.05)]">
          <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-slate-400">Riwayat & rincian</p>
          <div className="mt-3 space-y-2">
            <div className="h-16 rounded-2xl bg-slate-50" />
            <div className="h-10 rounded-2xl bg-slate-50" />
          </div>
        </div>
      </div>
    </PreviewShell>
  );
}

function previewProfilSection(input: PublicTemplatePreviewInput) {
  return (
    <PreviewShell
      eyebrow="Preview detail publik"
      title={input.label}
      body="Kelengkapan desa tetap memakai tab visual yang sama seperti halaman publik, dengan Perangkat, Aset, Fasilitas, Lembaga, dan BUMDes."
      tone="border-emerald-100 bg-white"
      chips={renderPreviewFieldChips(input)}
    >
      <div className="overflow-hidden rounded-[26px] border border-slate-200 bg-white">
        <div className="bg-[#202B45] px-4 py-3 text-white">
          <p className="text-[10px] font-black uppercase tracking-[0.16em] text-indigo-100">Kelengkapan desa</p>
          <p className="text-[15px] font-black">Aset, Fasilitas & Organisasi Masyarakat</p>
        </div>
        <div className="space-y-3 p-4">
          <div className="flex flex-wrap gap-2">
            {["Perangkat", "Aset", "Fasilitas", "Lembaga", "BUMDes"].map((tab, index) => (
              <span
                key={tab}
                className={`rounded-full px-3 py-1 text-[11px] font-semibold ${
                  index === 0 ? "bg-indigo-50 text-indigo-700" : "bg-slate-100 text-slate-600"
                }`}
              >
                {tab}
              </span>
            ))}
          </div>
          <div className="grid gap-2 sm:grid-cols-2 xl:grid-cols-3">
            {["Kepala Desa", "Sekretaris Desa", "Kaur Keuangan"].map((role) => (
              <div key={role} className="rounded-2xl border border-slate-100 bg-white p-3">
                <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-slate-400">{role}</p>
                <p className="mt-1 text-[13px] font-black text-slate-900">Nama perangkat</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </PreviewShell>
  );
}

function previewPanduanSection(input: PublicTemplatePreviewInput) {
  return (
    <PreviewShell
      eyebrow="Preview detail publik"
      title={input.label}
      body="Panduan warga tetap tampil sebagai alur langkah dan kartu pemeriksa sebelum laporan."
      tone="border-amber-100 bg-amber-50/55"
      chips={renderPreviewFieldChips(input)}
    >
      <div className="grid gap-2 sm:grid-cols-2 xl:grid-cols-4">
        {["Pahami hak warga", "Tanya pihak tepat", "Cek sebelum lapor", "Sampaikan suara"].map((step, index) => (
          <div key={step} className="rounded-2xl border border-amber-100 bg-white px-3 py-3">
            <p className="text-[10px] font-black text-amber-700">Langkah {index + 1}</p>
            <p className="mt-1 text-[12px] font-semibold text-slate-900">{step}</p>
          </div>
        ))}
      </div>
    </PreviewShell>
  );
}

function previewSuaraSection(input: PublicTemplatePreviewInput) {
  return (
    <PreviewShell
      eyebrow="Preview detail publik"
      title={input.label}
      body="Komponen suara warga tetap berupa CTA dan preview cerita singkat dalam kartu gradasi."
      tone="border-indigo-100 bg-white"
      chips={renderPreviewFieldChips(input)}
    >
      <div className="overflow-hidden rounded-2xl border border-indigo-100">
        <div className="bg-gradient-to-r from-indigo-600 to-violet-600 px-4 py-3 text-white">
          <p className="text-sm font-black">Suara Warga</p>
          <p className="text-[11px] text-indigo-100">3 cerita dari warga</p>
        </div>
        <div className="space-y-2 bg-white p-4">
          {["Jalan lingkungan mulai rusak", "Posyandu aktif tiap bulan", "Perlu papan APBDes lebih jelas"].map((item) => (
            <div key={item} className="rounded-xl bg-slate-50 px-3 py-2 text-[11px] text-slate-700">
              {item}
            </div>
          ))}
        </div>
      </div>
    </PreviewShell>
  );
}

export function PublicDetailMetaHero({
  desa,
  sourceSummaries,
}: {
  desa: Desa;
  sourceSummaries: PublishedTemplateSourceSummary[];
}) {
  const hasSource = sourceSummaries.length > 0 || Boolean(desa.dataSourceLabel);
  const primarySource = sourceSummaries[0]?.sourceLabel ?? desa.dataSourceLabel ?? null;

  return (
    <section
      className="overflow-hidden rounded-3xl border border-indigo-100 bg-gradient-to-br from-white via-indigo-50/35 to-sky-50 shadow-sm"
    >
      <div className="grid gap-0 lg:grid-cols-[1.15fr_0.85fr]">
        <div className="p-6 sm:p-7">
          <div className="flex flex-wrap items-center gap-2">
            <span className="inline-flex items-center gap-1.5 rounded-full bg-indigo-50 px-3 py-1 text-xs font-bold text-indigo-700">
              <MapPin size={13} aria-hidden />
              Detail desa berbasis template
            </span>
            {hasSource ? <DataStatusBadge status="source-found" size="md" /> : null}
          </div>

          <h1 className="mt-4 text-2xl font-black leading-tight text-slate-950 sm:text-3xl">
            {desa.nama}
          </h1>
          <p className="mt-2 text-sm text-slate-500">
            {desa.kecamatan}, {desa.kabupaten}, {desa.provinsi}
          </p>

          <p className="mt-5 max-w-2xl text-sm leading-relaxed text-slate-600">
            Halaman ini hanya menayangkan field template aktif yang sudah diterbitkan,
            beserta komponen turunan resmi seperti sumber, dokumen, panduan warga, dan
            suara warga.
          </p>

          {desa.dataPublishedAt ? (
            <p className="mt-3 text-xs font-semibold text-slate-500">
              Terakhir diperbarui{" "}
              {new Date(desa.dataPublishedAt).toLocaleDateString("id-ID", {
                day: "numeric",
                month: "short",
                year: "numeric",
              })}
            </p>
          ) : null}
        </div>

        <div className="border-t border-slate-100 bg-slate-50 p-5 sm:p-6 lg:border-l lg:border-t-0">
          <p className="text-sm font-black text-slate-900">Status halaman publik</p>
          <div className="mt-3 space-y-3">
            <div className="rounded-2xl border border-slate-100 bg-white p-4">
              <p className="text-[11px] font-semibold uppercase tracking-wide text-slate-400">
                Sumber publik
              </p>
              <div className="mt-2 flex items-center gap-2">
                {hasSource ? <DataStatusBadge status="source-found" size="xs" /> : null}
                {!hasSource ? (
                  <span className="rounded-full bg-slate-100 px-2 py-0.5 text-[10px] font-semibold text-slate-600">
                    Belum tercatat
                  </span>
                ) : null}
              </div>
              <p className="mt-2 text-xs leading-relaxed text-slate-500">
                {primarySource
                  ? `Rujukan awal: ${primarySource}.`
                  : "Source summary belum tersedia untuk komponen publik yang aktif."}
              </p>
            </div>

            <div className="rounded-2xl border border-slate-100 bg-white p-4">
              <p className="text-[11px] font-semibold uppercase tracking-wide text-slate-400">
                Mode baca
              </p>
              <p className="mt-2 text-sm font-black text-slate-900">
                Template-driven
              </p>
              <p className="mt-2 text-xs leading-relaxed text-slate-500">
                Data publik mengikuti urutan komponen template aktif. Komponen yang
                disembunyikan di internal admin tidak ditampilkan di halaman ini.
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

export const PUBLIC_TEMPLATE_COMPONENT_REGISTRY: Record<
  string,
  PublicTemplateSectionDefinition
> = {
  identitas: {
    componentKey: "identitas",
    navLabel: "Identitas",
    anchorId: "identitas",
    detailSlot: "first_view",
    render: renderIdentitasSection,
    preview: previewIdentitasSection,
  },
  demografi: {
    componentKey: "demografi",
    navLabel: "Demografi",
    anchorId: "demografi",
    detailSlot: "first_view",
    render: renderDemografiSection,
    preview: previewDemografiSection,
  },
  sumber_dokumen: {
    componentKey: "sumber_dokumen",
    navLabel: "Sumber & Dokumen",
    anchorId: "sumber-dokumen",
    detailSlot: "sumber_dokumen",
    render: renderSumberDokumenSection,
    preview: previewSourceSection,
  },
  transparansi: {
    componentKey: "transparansi",
    navLabel: "Transparansi",
    anchorId: "transparansi",
    detailSlot: "transparansi",
    render: renderTransparansiSection,
    preview: previewTransparansiSection,
  },
  anggaran: {
    componentKey: "anggaran",
    navLabel: "Anggaran",
    anchorId: "anggaran",
    detailSlot: "ringkasan_anggaran",
    render: renderAnggaranSection,
    preview: previewAnggaranSection,
  },
  pendapatan: {
    componentKey: "pendapatan",
    navLabel: "Pendapatan",
    anchorId: "pendapatan",
    detailSlot: "ringkasan_anggaran",
    render: renderPendapatanSection,
    preview: previewPendapatanSection,
  },
  kinerja: {
    componentKey: "kinerja",
    navLabel: "Kinerja",
    anchorId: "kinerja",
    detailSlot: "kinerja_anggaran",
    render: renderKinerjaSection,
    preview: previewKinerjaSection,
  },
  profil_desa: {
    componentKey: "profil_desa",
    navLabel: "Profil Desa",
    anchorId: "profil-desa",
    detailSlot: "kelengkapan_desa",
    render: renderProfilSection,
    preview: previewProfilSection,
  },
  panduan_warga: {
    componentKey: "panduan_warga",
    navLabel: "Panduan Warga",
    anchorId: "panduan-warga",
    detailSlot: "panduan_warga",
    render: renderPanduanWargaSection,
    preview: previewPanduanSection,
  },
  suara_warga: {
    componentKey: "suara_warga",
    navLabel: "Suara Warga",
    anchorId: "suara-warga",
    detailSlot: "suara_warga",
    render: PublicSuaraWargaSection,
    preview: previewSuaraSection,
  },
};
