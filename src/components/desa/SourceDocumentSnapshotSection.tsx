import type { LucideIcon } from "lucide-react";
import {
  Building2,
  FileText,
  Globe2,
  SearchCheck,
  ShieldCheck,
} from "lucide-react";
import type { Desa } from "@/lib/types";
import { DataStatusBadge, type DataStatusKind } from "@/components/ui/DataStatusBadge";

interface Props {
  desa: Desa;
}

interface SnapshotCard {
  title: string;
  status: string;
  statusKind?: DataStatusKind;
  body: string;
  icon: LucideIcon;
  tone: "indigo" | "sky" | "emerald" | "amber";
}

const toneClasses: Record<SnapshotCard["tone"], { card: string; icon: string; fallbackBadge: string }> = {
  indigo: {
    card: "border-indigo-100 bg-indigo-50/60",
    icon: "bg-white text-indigo-600",
    fallbackBadge: "bg-white text-indigo-700",
  },
  sky: {
    card: "border-sky-100 bg-sky-50/70",
    icon: "bg-white text-sky-600",
    fallbackBadge: "bg-white text-sky-700",
  },
  emerald: {
    card: "border-emerald-100 bg-emerald-50/70",
    icon: "bg-white text-emerald-600",
    fallbackBadge: "bg-white text-emerald-700",
  },
  amber: {
    card: "border-amber-100 bg-amber-50/80",
    icon: "bg-white text-amber-700",
    fallbackBadge: "bg-white text-amber-700",
  },
};

export default function SourceDocumentSnapshotSection({ desa }: Props) {
  const docs = desa.dokumen ?? [];
  const availableDocs = docs.filter((doc) => doc.tersedia);
  const hasWebsite = Boolean(desa.profil?.website);
  const hasApbdes = availableDocs.some((doc) => /apbdes/i.test(doc.nama));
  const hasRealisasi = availableDocs.some((doc) => /realisasi/i.test(doc.nama));
  const documentStatus =
    hasApbdes || hasRealisasi ? "Sumber ditemukan" : "Belum tercatat";
  const documentBody =
    hasApbdes && hasRealisasi
      ? "APBDes dan realisasi ada sebagai dokumen referensi, belum menjadi kesimpulan final."
      : hasApbdes
        ? "APBDes ada sebagai dokumen referensi. Realisasi masih perlu dicek lebih lanjut."
        : hasRealisasi
          ? "Dokumen realisasi ada sebagai referensi. APBDes masih perlu dicek lebih lanjut."
          : "Dokumen APBDes/Realisasi belum tercatat di data demo ini.";

  const cards: SnapshotCard[] = [
    {
      title: "Website desa",
      status: hasWebsite ? "Sumber ditemukan" : "Belum tercatat",
      statusKind: hasWebsite ? "source-found" : undefined,
      body: hasWebsite
        ? "Website desa tersedia untuk mulai membaca informasi publik tanpa menumpuk tautan teknis di ringkasan."
        : "Website desa belum tercatat di data demo ini.",
      icon: Globe2,
      tone: "indigo",
    },
    {
      title: "Halaman kecamatan",
      status: "Belum tercatat",
      body: `Belum ada halaman kecamatan ${desa.kecamatan} yang dicatat sebagai sumber di data demo ini.`,
      icon: Building2,
      tone: "sky",
    },
    {
      title: "Dokumen APBDes/Realisasi",
      status: documentStatus,
      statusKind: hasApbdes || hasRealisasi ? "source-found" : undefined,
      body: documentBody,
      icon: FileText,
      tone: "emerald",
    },
    {
      title: "Status review",
      status: "Perlu Review",
      statusKind: "needs-review",
      body: "Semua sumber dan dokumen di halaman ini perlu dicek sebelum menjadi rujukan resmi.",
      icon: ShieldCheck,
      tone: "amber",
    },
  ];

  return (
    <section className="space-y-4">
      <div className="rounded-3xl border border-slate-100 bg-white p-5 shadow-sm sm:p-6">
        <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-xs font-bold uppercase tracking-wide text-slate-400">
              Snapshot sumber
            </p>
            <h2 className="mt-1 text-lg font-black text-slate-950">
              Sumber dan dokumen yang sudah terlihat
            </h2>
          </div>
          <p className="max-w-md text-xs leading-relaxed text-slate-500">
            Ringkasan ini membantu warga tahu apa yang bisa mulai dibaca tanpa
            menganggapnya sebagai kesimpulan final.
          </p>
        </div>

        <div className="mt-5 grid grid-cols-1 gap-3 sm:grid-cols-2">
          {cards.map((card) => {
            const Icon = card.icon;
            const tone = toneClasses[card.tone];

            return (
              <div key={card.title} className={`rounded-2xl border p-4 ${tone.card}`}>
                <div className="flex items-start gap-3">
                  <div className={`flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-xl shadow-sm ${tone.icon}`}>
                    <Icon size={17} />
                  </div>
                  <div className="min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                      <p className="text-sm font-black text-slate-900">{card.title}</p>
                      {card.statusKind
                        ? <DataStatusBadge status={card.statusKind} />
                        : (
                          <span className={`rounded-full px-2 py-0.5 text-[10px] font-bold ${tone.fallbackBadge}`}>
                            {card.status}
                          </span>
                        )}
                    </div>
                    <p className="mt-2 text-xs leading-relaxed text-slate-600">
                      {card.body}
                    </p>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      <div className="rounded-3xl border border-sky-100 bg-sky-50 p-5 shadow-sm sm:p-6">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-start">
          <div className="flex h-11 w-11 flex-shrink-0 items-center justify-center rounded-2xl bg-white text-sky-600 shadow-sm">
            <SearchCheck size={18} />
          </div>
          <div>
            <p className="text-sm font-black text-slate-950">Kenapa desa ini perlu dibaca?</p>
            <div className="mt-3 grid grid-cols-1 gap-2 text-xs leading-relaxed text-slate-600 sm:grid-cols-3">
              <p className="rounded-2xl bg-white/70 p-3">
                Ada sumber publik yang bisa membantu warga memahami informasi desa.
              </p>
              <p className="rounded-2xl bg-white/70 p-3">
                Dokumen perlu dibaca sebagai referensi sebelum menyimpulkan angka.
              </p>
              <p className="rounded-2xl bg-white/70 p-3">
                Jika informasi belum lengkap, warga bisa bertanya ke pihak yang tepat.
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
