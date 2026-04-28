import Image from "next/image";
import { CheckCircle2, ClipboardList, HelpCircle, ChevronRight, Info } from "lucide-react";
import { Desa } from "@/lib/types";
import { formatRupiah } from "@/lib/utils";
import { getExpectations, ExpectedStatus } from "@/lib/expectations";
import { ASSETS } from "@/lib/assets";
import { SEHARUSNYA_ADA } from "@/lib/copy";

interface Props {
  desa: Desa;
}

// ─── Config per status ────────────────────────────────────────────────────────

const STATUS_CONFIG: Record<ExpectedStatus, {
  icon:       typeof CheckCircle2;
  iconColor:  string;
  badgeBg:    string;
  badgeText:  string;
  label:      string;
}> = {
  wajib: {
    icon:      CheckCircle2,
    iconColor: "text-emerald-500",
    badgeBg:   "bg-emerald-100",
    badgeText: "text-emerald-700",
    label:     SEHARUSNYA_ADA.statusLabels.wajib,
  },
  direncanakan: {
    icon:      ClipboardList,
    iconColor: "text-indigo-500",
    badgeBg:   "bg-indigo-100",
    badgeText: "text-indigo-700",
    label:     SEHARUSNYA_ADA.statusLabels.direncanakan,
  },
  tanyakan: {
    icon:      HelpCircle,
    iconColor: "text-amber-500",
    badgeBg:   "bg-amber-100",
    badgeText: "text-amber-700",
    label:     SEHARUSNYA_ADA.statusLabels.tanyakan,
  },
};

const SECTION_TITLE: Record<ExpectedStatus, string> = {
  wajib:        "Ada Dasar Regulasi",
  direncanakan: "Sudah Direncanakan dalam APBDes",
  tanyakan:     "Bisa Ditanyakan ke Desa",
};

const SECTION_DESC: Record<ExpectedStatus, string> = {
  wajib:        "Ada dasar regulasi umum, tetapi penerapannya tetap perlu dicek pada aturan, musyawarah, dan dokumen desa terkait.",
  direncanakan: "Masuk rencana anggaran dalam data demo. Cek dokumen APBDes sebelum menjadikannya rujukan.",
  tanyakan:     "Warga bisa bertanya soal ini dengan tenang. Daftar ini bukan kesimpulan ada atau tidaknya pelanggaran.",
};

const TONE_STYLE: Record<string, { bg: string; border: string; text: string; badge: string }> = {
  positive: { bg: "bg-emerald-50", border: "border-emerald-200", text: "text-emerald-800", badge: "bg-emerald-600" },
  warning:  { bg: "bg-amber-50",   border: "border-amber-200",   text: "text-amber-800",   badge: "bg-amber-600"   },
  danger:   { bg: "bg-rose-50",    border: "border-rose-200",    text: "text-rose-800",    badge: "bg-rose-600"    },
};

// ─── Sub-komponen: grup per status ────────────────────────────────────────────

function ItemGroup({ status, items }: { status: ExpectedStatus; items: ReturnType<typeof getExpectations>["items"] }) {
  const filtered = items.filter(i => i.status === status);
  if (filtered.length === 0) return null;

  const cfg = STATUS_CONFIG[status];

  return (
    <div>
      {/* Group header */}
      <div className="flex items-center gap-2 mb-3">
        <cfg.icon size={14} className={cfg.iconColor} />
        <p className="text-xs font-bold text-slate-700 uppercase tracking-wider">{SECTION_TITLE[status]}</p>
      </div>
      <p className="text-xs text-slate-500 mb-3 ml-5">{SECTION_DESC[status]}</p>

      {/* Items */}
      <div className="space-y-2 ml-1">
        {filtered.map((item, i) => {
          const Icon = cfg.icon;
          return (
            <div
              key={i}
              className="group flex items-start gap-3 rounded-2xl border border-slate-100 bg-white p-3.5 shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:border-amber-200 hover:shadow-md"
            >
              <div className="flex-shrink-0 mt-0.5">
                <span className="animate-check-pop inline-flex h-7 w-7 items-center justify-center rounded-full bg-slate-50 shadow-sm transition-transform duration-200 group-hover:scale-110">
                  <Icon size={16} className={cfg.iconColor} />
                </span>
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex flex-wrap items-center gap-2 mb-1">
                  <span className="text-sm font-semibold text-slate-800">{item.label}</span>
                  {item.nilai && (
                    <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${cfg.badgeBg} ${cfg.badgeText}`}>
                      {item.nilai}
                    </span>
                  )}
                  <span className={`text-[10px] font-semibold px-1.5 py-0.5 rounded-full ${cfg.badgeBg} ${cfg.badgeText} opacity-70`}>
                    {cfg.label}
                  </span>
                </div>
                <p className="text-xs text-slate-500 leading-relaxed">{item.detail}</p>
              </div>
              {status === "tanyakan" && (
                <ChevronRight size={14} className="text-slate-300 group-hover:text-amber-400 transition-colors flex-shrink-0 mt-1" />
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ─── Komponen utama ────────────────────────────────────────────────────────────

export default function SeharusnyaAdaSection({ desa }: Props) {
  const { items, ringkasan, ringkasanTone } = getExpectations(desa);
  const toneStyle = TONE_STYLE[ringkasanTone];
  const hakSummaryCards = [
    { label: "Ada dasar", value: items.filter((i) => i.status === "wajib").length, className: "border-emerald-300/30 bg-emerald-400/10 text-emerald-100" },
    { label: "Masuk rencana", value: items.filter((i) => i.status === "direncanakan").length, className: "border-indigo-300/30 bg-indigo-400/10 text-indigo-100" },
    { label: "Bisa ditanya", value: items.filter((i) => i.status === "tanyakan").length, className: "border-amber-300/40 bg-amber-400/10 text-amber-100" },
  ];

  return (
    <div className="rounded-2xl border border-slate-200 overflow-hidden shadow-sm">

      {/* Header banner */}
      <div className="relative bg-gradient-to-r from-slate-800 to-slate-700 overflow-hidden">
        {/* Texture overlay */}
        <div className="absolute inset-0 opacity-[0.06]">
          <Image src={ASSETS.textureDark} alt="" fill className="object-cover" />
        </div>
        <div className="relative flex items-center gap-0">
          {/* Ilustrasi kiri */}
          <div className="hidden sm:block relative w-44 h-36 flex-shrink-0">
            <Image
              src={ASSETS.illustrationHakWarga}
              alt="Warga dengan checklist hak desa"
              fill
              className="object-cover object-center"
              sizes="176px"
            />
          </div>
          {/* Teks */}
          <div className="px-5 sm:pl-4 sm:pr-6 py-5 flex-1">
            <p className="text-xs text-amber-400 font-bold uppercase tracking-widest mb-1">
              Panduan Hak Warga
            </p>
            <h2 className="text-lg sm:text-xl font-black text-white leading-tight">
              Apa yang bisa ditanyakan warga dari anggaran{" "}
              <span className="text-amber-300">{formatRupiah(desa.totalAnggaran)}</span>
              {" "}ini?
            </h2>
            <ul className="mt-2 list-disc space-y-1 pl-4 text-xs text-slate-400">
              <li>Hak warga perlu dibaca bersama aturan dan dokumen desa.</li>
              <li>Estimasi ini panduan bertanya, bukan kondisi aktual final.</li>
            </ul>
            <div className="mt-4 grid grid-cols-3 gap-2">
              {hakSummaryCards.map((card) => (
                <div key={card.label} className={`rounded-2xl border px-3 py-2 ${card.className}`}>
                  <p className="text-lg font-black leading-none">{card.value}</p>
                  <p className="mt-1 text-[10px] font-semibold leading-tight opacity-85">{card.label}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Body */}
      <div className="bg-slate-50 px-5 sm:px-6 py-5 space-y-6">

        {/* Estimasi caution — RIGHTS-06 */}
        <div className="flex items-start gap-2.5 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3">
          <Info size={14} className="text-amber-600 flex-shrink-0 mt-0.5" aria-hidden />
          <p className="text-xs text-amber-800 leading-relaxed">
            <span className="font-bold">{SEHARUSNYA_ADA.estimasiCaution}</span>
            {" "}{SEHARUSNYA_ADA.sectionDisclaimer}
          </p>
        </div>

        <ItemGroup status="wajib"        items={items} />
        <ItemGroup status="direncanakan" items={items} />
        <ItemGroup status="tanyakan"     items={items} />

        {/* Verdict bar — with demo note */}
        <div className={`rounded-xl border p-4 flex flex-col sm:flex-row items-start sm:items-center gap-3 ${toneStyle.bg} ${toneStyle.border}`}>
          <div className={`flex-shrink-0 w-10 h-10 rounded-xl ${toneStyle.badge} flex items-center justify-center text-white font-black text-sm`}>
            {desa.persentaseSerapan}%
          </div>
          <div className="flex-1 min-w-0">
            <p className={`text-sm font-semibold mb-0.5 ${toneStyle.text}`}>
              Indikator serapan: {desa.persentaseSerapan}%
            </p>
            <p className={`text-xs leading-relaxed ${toneStyle.text} opacity-80`}>
              {ringkasan}
            </p>
            <p className="text-[10px] text-slate-500 mt-1.5">{SEHARUSNYA_ADA.verdictDemoNote}</p>
          </div>
        </div>
      </div>
    </div>
  );
}
