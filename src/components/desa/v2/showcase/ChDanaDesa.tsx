import { Wallet, CheckCircle2, Clock, TrendingUp, Circle } from "lucide-react";
import { formatRupiah } from "@/lib/utils";
import ChapterPanel from "../ChapterPanel";
import type { DanaDesaDemo } from "@/lib/desa-detail/showcase-demo";

function buildChart(riwayat: DanaDesaDemo["riwayat"]) {
  const pts = riwayat.slice().sort((a, b) => a.tahun - b.tahun);
  const n = pts.length;
  if (n < 2) return null;
  const pct = (r: { pagu: number; realisasi: number }) => (r.pagu > 0 ? (r.realisasi / r.pagu) * 100 : 0);
  const x = (i: number) => 100 + (640 * i) / (n - 1);
  const y = (p: number) => 240 - (Math.max(0, Math.min(100, p)) / 100) * 200;
  const coords = pts.map((p, i) => ({ tahun: p.tahun, cx: x(i), cy: y(pct(p)), pct: Math.round(pct(p)) }));
  const line = coords.map((c, i) => `${i === 0 ? "M" : "L"} ${c.cx.toFixed(0)} ${c.cy.toFixed(0)}`).join(" ");
  const area = `${line} L ${x(n - 1).toFixed(0)} 240 L 100 240 Z`;
  return { coords, line, area };
}

export default function ChDanaDesa({
  chapterNo,
  danaDesa,
  paguSourceLabel,
}: {
  chapterNo: string;
  danaDesa: DanaDesaDemo;
  /** When set, the pagu is REAL (from this source); tahap/tren stay demo. */
  paguSourceLabel?: string | null;
}) {
  const paguReal = Boolean(paguSourceLabel);
  const totalCair = danaDesa.realisasiTahap1 + danaDesa.realisasiTahap2 + danaDesa.realisasiTahap3;
  const belum = Math.max(0, danaDesa.pagu - totalCair);
  const persen = danaDesa.pagu > 0 ? Math.round((totalCair / danaDesa.pagu) * 100) : 0;
  const chart = buildChart(danaDesa.riwayat);

  const tahap = [
    { n: 1, nilai: danaDesa.realisasiTahap1 },
    { n: 2, nilai: danaDesa.realisasiTahap2 },
    { n: 3, nilai: danaDesa.realisasiTahap3 },
  ];

  const stats = [
    { chip: "ichip-brand", icon: Wallet, label: "Pagu Dana Desa", value: danaDesa.pagu, cls: "text-ink-1", mock: !paguReal },
    { chip: "ichip-good", icon: CheckCircle2, label: "Sudah cair", value: totalCair, cls: "text-good-900", mock: true },
    { chip: "ichip-watch", icon: Clock, label: "Belum cair", value: belum, cls: "text-watch-900", mock: true },
  ];

  return (
    <ChapterPanel
      id={`ch-${chapterNo}`}
      chapterNo={chapterNo}
      ribbonLabel="DANA DESA"
      ribbonDot="var(--color-brand-600)"
      stripGradient="linear-gradient(90deg,#4F46E5,#7C3AED)"
      blobStyle={{ width: 340, height: 340, top: -130, right: -90, background: "var(--color-brand-500)" }}
      tagText={paguReal ? "UANG DARI PUSAT" : "UANG DARI PUSAT · (MOCK)"}
      tagClass="ch-tag-blue"
      sourceNote={
        paguReal
          ? { label: `${paguSourceLabel} — pagu real; pencairan tahap & tren masih contoh`, mock: false }
          : { label: "DJPK Kemenkeu (PMK Dana Desa) & OM-SPAN", mock: true }
      }
      headline={
        <>
          {paguReal ? "Batukarut menerima" : `Tahun ${danaDesa.tahun}, Batukarut menerima`}{" "}
          <span className="underline-sweep num">
            <span data-counter data-target={danaDesa.pagu} data-format="rupiah">Rp 0</span>
          </span>{" "}
          Dana Desa dari APBN.
        </>
      }
    >
      <div className="grid grid-cols-2 gap-3 reveal reveal-4 lg:grid-cols-4">
        {stats.map((s) => {
          const Icon = s.icon;
          return (
            <div key={s.label} className="tile tile-brand hover-lift">
              <div className={`ichip ${s.chip} mb-3`}><Icon size={16} aria-hidden /></div>
              <p className={`num display text-[22px] font-semibold leading-none ${s.cls}`} data-counter data-target={s.value} data-format="rupiah">Rp 0</p>
              <p className="mt-1.5 text-[11.5px] text-ink-3">{s.label}</p>
              <p className="mono mt-0.5 text-[10px] text-ink-4">{s.mock ? "(mock)" : "real · DJPK"}</p>
            </div>
          );
        })}
        <div className="tile tile-good hover-lift">
          <div className="ichip ichip-good mb-3"><TrendingUp size={16} aria-hidden /></div>
          <p className="num display text-[22px] font-semibold leading-none text-good-900" data-counter data-target={persen} data-suffix="%">0%</p>
          <p className="mt-1.5 text-[11.5px] text-ink-3">Pencairan</p>
        </div>
      </div>

      {/* Timeline pencairan */}
      <div className="mt-3 rounded-2xl bg-surface p-5 reveal reveal-5 ring-hair sm:p-6">
        <p className="mb-4 text-[12.5px] font-medium text-ink-1">Pencairan per tahap</p>
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
          {tahap.map((t) => {
            const cair = t.n <= danaDesa.tahapCair && t.nilai > 0;
            return (
              <div key={t.n} className={`tile ${cair ? "tile-good stripe-good" : "tile-warn stripe-warn"}`}>
                <div className="flex items-center gap-2">
                  {cair ? (
                    <CheckCircle2 size={15} className="text-good-700" aria-hidden />
                  ) : (
                    <Circle size={15} className="text-warn-700" aria-hidden />
                  )}
                  <p className="text-[12px] font-semibold text-ink-1">Tahap {t.n}</p>
                  <span className={`cpill ${cair ? "cpill-good" : "cpill-warn"} ml-auto`}>
                    {cair ? "Cair" : "Belum"}
                  </span>
                </div>
                <p className="num mt-2 text-[15px] font-semibold text-ink-1">{formatRupiah(t.nilai)}</p>
              </div>
            );
          })}
        </div>
      </div>

      {/* Riwayat 5 tahun */}
      {chart ? (
        <div className="mt-3 rounded-2xl bg-surface p-5 reveal reveal-6 ring-hair sm:p-6">
          <p className="mb-2 text-[12.5px] font-medium text-ink-1">
            Tren pencairan {chart.coords[0].tahun}–{chart.coords[chart.coords.length - 1].tahun}
          </p>
          <svg viewBox="0 0 800 280" className="w-full max-h-[320px]">
            <defs>
              <linearGradient id={`ddArea-${chapterNo}`} x1="0" x2="0" y1="0" y2="1">
                <stop offset="0%" stopColor="#4F46E5" stopOpacity=".28" />
                <stop offset="100%" stopColor="#4F46E5" stopOpacity="0" />
              </linearGradient>
            </defs>
            <path className="line-draw" d={chart.area} fill={`url(#ddArea-${chapterNo})`} />
            <path className="line-draw" d={chart.line} fill="none" stroke="var(--color-brand-600)" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
            {chart.coords.map((c, i) => {
              const last = i === chart.coords.length - 1;
              return (
                <g key={c.tahun}>
                  <circle className={`dot-pop dot-pop-${Math.min(i + 1, 5)}`} cx={c.cx} cy={c.cy} r={last ? 9 : 6} fill={last ? "var(--color-good-500)" : "white"} stroke={last ? "var(--color-good-700)" : "var(--color-brand-600)"} strokeWidth="2.5" />
                  <text x={c.cx} y={266} textAnchor="middle" className="num" fontSize="13" fill="var(--color-ink-3)">{c.tahun}</text>
                </g>
              );
            })}
          </svg>
        </div>
      ) : null}
    </ChapterPanel>
  );
}
