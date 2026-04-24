import Image from "next/image";
import { CheckCircle2, ClipboardList, HelpCircle, ChevronRight } from "lucide-react";
import { Desa } from "@/lib/types";
import { formatRupiah } from "@/lib/utils";
import { getExpectations, ExpectedStatus } from "@/lib/expectations";
import { ASSETS } from "@/lib/assets";

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
    label:     "Wajib ada",
  },
  direncanakan: {
    icon:      ClipboardList,
    iconColor: "text-indigo-500",
    badgeBg:   "bg-indigo-100",
    badgeText: "text-indigo-700",
    label:     "Dalam APBDes",
  },
  tanyakan: {
    icon:      HelpCircle,
    iconColor: "text-amber-500",
    badgeBg:   "bg-amber-100",
    badgeText: "text-amber-700",
    label:     "Tanyakan ke desa",
  },
};

const SECTION_TITLE: Record<ExpectedStatus, string> = {
  wajib:        "Wajib Ada — Diatur oleh Regulasi",
  direncanakan: "Sudah Direncanakan dalam APBDes",
  tanyakan:     "Tanyakan Langsung ke Kepala Desa",
};

const SECTION_DESC: Record<ExpectedStatus, string> = {
  wajib:        "Poin-poin ini bukan janji — ini kewajiban yang diatur undang-undang.",
  direncanakan: "Ini yang sudah masuk dalam rencana anggaran desa tahun ini.",
  tanyakan:     "Warga berhak bertanya soal ini. Jika tidak ada jawaban, itu sudah jadi masalah.",
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
              className="flex items-start gap-3 p-3.5 rounded-xl bg-white border border-slate-100 hover:border-slate-200 hover:shadow-sm transition-all group"
            >
              <div className="flex-shrink-0 mt-0.5">
                <Icon size={16} className={cfg.iconColor} />
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
              Hak Wargamu
            </p>
            <h2 className="text-lg sm:text-xl font-black text-white leading-tight">
              Dengan{" "}
              <span className="text-amber-300">{formatRupiah(desa.totalAnggaran)}</span>
              {", "}desa ini seharusnya bisa memberikan ini:
            </h2>
            <p className="text-slate-400 text-xs mt-2">
              Berdasarkan regulasi Dana Desa &amp; alokasi APBDes {desa.tahun}
            </p>
          </div>
        </div>
      </div>

      {/* Body */}
      <div className="bg-slate-50 px-5 sm:px-6 py-5 space-y-6">

        <ItemGroup status="wajib"        items={items} />
        <ItemGroup status="direncanakan" items={items} />
        <ItemGroup status="tanyakan"     items={items} />

        {/* Verdict bar */}
        <div className={`rounded-xl border p-4 flex flex-col sm:flex-row items-start sm:items-center gap-3 ${toneStyle.bg} ${toneStyle.border}`}>
          <div className={`flex-shrink-0 w-10 h-10 rounded-xl ${toneStyle.badge} flex items-center justify-center text-white font-black text-sm`}>
            {desa.persentaseSerapan}%
          </div>
          <div className="flex-1 min-w-0">
            <p className={`text-sm font-semibold mb-0.5 ${toneStyle.text}`}>
              Kenyataannya: {desa.persentaseSerapan}% anggaran sudah terserap
            </p>
            <p className={`text-xs leading-relaxed ${toneStyle.text} opacity-80`}>
              {ringkasan}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
