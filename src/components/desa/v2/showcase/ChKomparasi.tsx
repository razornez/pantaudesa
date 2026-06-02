import { TrendingUp, Award, FileCheck } from "lucide-react";
import ChapterPanel from "../ChapterPanel";
import type { PeerDemo } from "@/lib/desa-detail/showcase-demo";

function ordinal(rank: number, total: number) {
  return `#${rank} dari ${total}`;
}

export default function ChKomparasi({ chapterNo, peer }: { chapterNo: string; peer: PeerDemo }) {
  const cards = [
    { chip: "ichip-good", icon: TrendingUp, label: "Pencairan Dana Desa", rank: peer.rankSerapan, tile: "tile-good" },
    { chip: "ichip-brand", icon: Award, label: "Indeks Desa Membangun", rank: peer.rankIdm, tile: "tile-brand" },
    { chip: "ichip-amber", icon: FileCheck, label: "Disiplin publikasi", rank: peer.rankDisiplin, tile: "tile-amber" },
  ];

  return (
    <ChapterPanel
      id={`ch-${chapterNo}`}
      chapterNo={chapterNo}
      ribbonLabel="KOMPARASI"
      ribbonDot="var(--color-sky-500)"
      stripGradient="linear-gradient(90deg,#4F46E5,#0EA5E9,#10B981)"
      blobStyle={{ width: 300, height: 300, top: -110, right: -70, background: "var(--color-sky-500)" }}
      tagText="VS DESA SEKECAMATAN · (MOCK)"
      tagClass="ch-tag-sky"
      sourceNote={{ label: "Hitungan PantauDesa dari data desa sekecamatan", mock: true }}
      headline={
        <>
          Dibanding <span className="underline-sweep num">{peer.totalDesa} desa</span> lain di Kecamatan {peer.kecamatan},
          posisi Batukarut:
        </>
      }
    >
      <div className="grid grid-cols-1 gap-3 reveal reveal-4 sm:grid-cols-3">
        {cards.map((c) => {
          const Icon = c.icon;
          return (
            <div key={c.label} className={`tile ${c.tile} hover-lift`}>
              <div className={`ichip ${c.chip} mb-3`}><Icon size={16} aria-hidden /></div>
              <p className="num display text-[28px] font-semibold leading-none text-ink-1">
                #<span data-counter data-target={c.rank}>0</span>
              </p>
              <p className="num mt-1 text-[11px] text-ink-3">{ordinal(c.rank, peer.totalDesa)}</p>
              <p className="mt-1.5 text-[12px] font-medium text-ink-2">{c.label}</p>
            </div>
          );
        })}
      </div>
      <p className="mono mt-3 text-[10px] text-ink-4 reveal reveal-5">(mock) peringkat contoh — nanti dihitung dari data sekecamatan</p>
    </ChapterPanel>
  );
}
