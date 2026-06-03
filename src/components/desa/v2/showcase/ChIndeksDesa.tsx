import { Check, X } from "lucide-react";
import ChapterPanel from "../ChapterPanel";
import type { IdmDemo, DisiplinPublikasiDemo } from "@/lib/desa-detail/showcase-demo";

const CIRC = 753.98; // 2π·120

const IDM_LABEL: Record<IdmDemo["status"], string> = {
  SANGAT_TERTINGGAL: "Sangat Tertinggal",
  TERTINGGAL: "Tertinggal",
  BERKEMBANG: "Berkembang",
  MAJU: "Maju",
  MANDIRI: "Mandiri",
};

export default function ChIndeksDesa({
  chapterNo,
  idm,
  disiplin,
}: {
  chapterNo: string;
  idm: IdmDemo;
  disiplin: DisiplinPublikasiDemo[];
}) {
  const skor100 = Math.round(idm.skor * 100);
  const arcTo = (CIRC * (1 - skor100 / 100)).toFixed(2);
  const tersedia = disiplin.filter((d) => d.tersedia).length;
  const sub = [
    { label: "Ketahanan Ekonomi (IKE)", value: Math.round(idm.ike * 100) },
    { label: "Ketahanan Sosial (IKS)", value: Math.round(idm.iks * 100) },
    { label: "Ketahanan Lingkungan (IKL)", value: Math.round(idm.ikl * 100) },
  ];

  return (
    <ChapterPanel
      id={`ch-${chapterNo}`}
      chapterNo={chapterNo}
      ribbonLabel="INDEKS & TRANSPARANSI"
      ribbonDot="var(--color-good-500)"
      stripGradient="linear-gradient(90deg,#10B981,#F59E0B,#F43F5E)"
      tagText="IDM RESMI + DISIPLIN · (MOCK)"
      tagClass="ch-tag-emerald"
      dark
      sourceNote={{ label: "IDM Kemendesa & PPID Kabupaten Bandung", mock: true }}
      headline={
        <>
          Status desa <span className="underline-sweep">{IDM_LABEL[idm.status]}</span> menurut Indeks Desa
          Membangun {idm.tahun}.
        </>
      }
    >
      <div className="grid grid-cols-1 gap-6 reveal reveal-4 lg:grid-cols-[auto_1fr] lg:items-center lg:gap-10">
        <div className="relative mx-auto inline-flex items-center justify-center">
          <svg width="220" height="220" viewBox="0 0 280 280" className="max-w-full -rotate-90">
            <circle cx="140" cy="140" r="120" fill="none" stroke="rgba(255,255,255,.08)" strokeWidth="2" />
            <circle cx="140" cy="140" r="120" fill="none" stroke={`url(#idmG-${chapterNo})`} strokeWidth="4" strokeLinecap="round" className="score-arc" strokeDasharray={`${CIRC} ${CIRC}`} style={{ ["--arc-from" as string]: `${CIRC}`, ["--arc-to" as string]: arcTo }} />
            <defs>
              <linearGradient id={`idmG-${chapterNo}`} x1="0" x2="1">
                <stop offset="0%" stopColor="#10B981" />
                <stop offset="100%" stopColor="#34D399" />
              </linearGradient>
            </defs>
          </svg>
          <div className="absolute text-center">
            <p className="num display text-[56px] font-semibold leading-none text-white" data-counter data-target={skor100}>0</p>
            <p className="mono mt-2 text-[11px] tracking-[.18em] text-white/50">SKOR IDM</p>
          </div>
        </div>

        <div className="space-y-2.5">
          {sub.map((s) => (
            <div key={s.label} className="rounded-2xl bg-white/[0.06] p-4 ring-1 ring-inset ring-white/10">
              <div className="mb-2 flex items-baseline justify-between gap-3">
                <p className="text-[12.5px] text-white/85">{s.label}</p>
                <p className="num text-[13px] font-semibold text-white">{s.value}</p>
              </div>
              <div className="h-[3px] overflow-hidden rounded-full bg-white/10">
                <div className="bar-anim shimmer-fill h-full rounded-full" style={{ "--w": `${s.value}%`, "--c-from": "#10B981", "--c-to": "#34D399" } as React.CSSProperties} />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Disiplin publikasi */}
      <div className="mt-6 reveal reveal-5">
        <div className="mb-3 flex items-center gap-2">
          <p className="eyebrow text-white/45">Disiplin publikasi dokumen</p>
          <span className="cpill cpill-warn">
            <span className="num font-semibold">{tersedia}</span>/{disiplin.length} tersedia
          </span>
        </div>
        <div className="grid grid-cols-1 gap-2 sm:grid-cols-3">
          {disiplin.map((d, i) => (
            <div key={`${d.jenis}-${d.tahun}-${i}`} className="flex items-center gap-2.5 rounded-xl bg-white/[0.06] px-3 py-2.5 ring-1 ring-inset ring-white/10">
              {d.tersedia ? (
                <Check size={14} className="flex-shrink-0 text-good-500" aria-hidden />
              ) : (
                <X size={14} className="flex-shrink-0 text-white/30" aria-hidden />
              )}
              <span className={`text-[12px] ${d.tersedia ? "text-white/85" : "text-white/40"}`}>
                {d.jenis} <span className="num">{d.tahun}</span>
              </span>
            </div>
          ))}
        </div>
        <p className="mono mt-3 text-[10px] text-white/35">(mock) sumber: IDM Kemendesa + PPID Kabupaten</p>
      </div>
    </ChapterPanel>
  );
}
