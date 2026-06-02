import { PieChart, Info } from "lucide-react";
import ChapterPanel from "../ChapterPanel";
import type { KomposisiBenchmarkDemo } from "@/lib/desa-detail/showcase-demo";

const BAR_COLORS = [
  { from: "#1E1B4B", to: "#4F46E5" },
  { from: "#047857", to: "#10B981" },
  { from: "#B45309", to: "#F59E0B" },
  { from: "#6D28D9", to: "#8B5CF6" },
  { from: "#BE123C", to: "#F43F5E" },
];

export default function ChKomposisi({
  chapterNo,
  komposisi,
  isReference,
}: {
  chapterNo: string;
  komposisi: KomposisiBenchmarkDemo;
  /** true = backed by the national benchmark config (reference, not per-desa mock) */
  isReference?: boolean;
}) {
  return (
    <ChapterPanel
      id={`ch-${chapterNo}`}
      chapterNo={chapterNo}
      ribbonLabel="DIPAKAI UNTUK APA"
      ribbonDot="var(--color-brand-500)"
      stripGradient="linear-gradient(90deg,#6366F1,#10B981)"
      blobStyle={{ width: 320, height: 320, bottom: -120, right: -70, background: "var(--color-good-500)" }}
      tagText={isReference ? "KOMPOSISI TIPIKAL · REFERENSI" : "KOMPOSISI TIPIKAL · (MOCK)"}
      tagClass="ch-tag-violet"
      sourceNote={{
        label: "Referensi rata-rata nasional (agregasi DJPK) — bukan APBDes aktual desa",
        mock: !isReference,
      }}
      headline={
        <>
          Rincian pasti APBDes belum tersedia. Ini <span className="underline-sweep">komposisi tipikal</span> desa
          kategori {komposisi.kategoriDesa}.
        </>
      }
    >
      <div className="mb-3 flex items-start gap-3 rounded-2xl bg-[color:var(--color-warn-50)] px-4 py-3 reveal reveal-3 ring-hair">
        <Info size={14} className="mt-0.5 flex-shrink-0 text-warn-700" aria-hidden />
        <p className="text-[12px] leading-relaxed text-warn-900">
          Angka di bawah adalah <span className="mono font-medium">(mock)</span> rata-rata nasional sebagai
          rujukan membaca, bukan APBDes aktual Batukarut. Minta Perdes APBDes ke kantor desa untuk angka pasti.
        </p>
      </div>

      <div className="rounded-2xl bg-surface p-5 reveal reveal-4 ring-hair sm:p-6">
        <div className="mb-5 flex items-center gap-2">
          <div className="ichip ichip-brand"><PieChart size={15} aria-hidden /></div>
          <p className="text-[12.5px] font-medium text-ink-1">5 bidang belanja desa</p>
        </div>
        <div className="space-y-4">
          {komposisi.bidang.map((b, i) => {
            const c = BAR_COLORS[i % BAR_COLORS.length];
            return (
              <div key={b.label}>
                <div className="mb-1.5 flex items-baseline justify-between gap-3">
                  <p className="text-[12.5px] text-ink-2">{b.label}</p>
                  <p className="num text-[13px] font-semibold text-ink-1">{b.pct}%</p>
                </div>
                <div className="h-[6px] overflow-hidden rounded-full bg-black/[.06]">
                  <div className="bar-anim shimmer-fill h-full rounded-full" style={{ "--w": `${b.pct}%`, "--c-from": c.from, "--c-to": c.to } as React.CSSProperties} />
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </ChapterPanel>
  );
}
