import { GraduationCap, Stethoscope, Landmark, Store, Droplets, Zap, UserRound, Users, Building2 } from "lucide-react";
import ChapterPanel from "../ChapterPanel";
import type { FasilitasPodesDemo, LembagaDemo, BumdesDemo, ShowcaseDemo } from "@/lib/desa-detail/showcase-demo";

export default function ChFasilitas({
  chapterNo,
  fasilitas,
  kades,
  lembaga,
  bumdes,
}: {
  chapterNo: string;
  fasilitas: FasilitasPodesDemo;
  kades: ShowcaseDemo["kades"];
  lembaga: LembagaDemo[];
  bumdes: BumdesDemo | null;
}) {
  const groups = [
    { key: "pendidikan", label: "Pendidikan", icon: GraduationCap, tile: "tile-sky", chip: "ichip-sky", items: fasilitas.pendidikan },
    { key: "kesehatan", label: "Kesehatan", icon: Stethoscope, tile: "tile-watch", chip: "ichip-watch", items: fasilitas.kesehatan },
    { key: "ibadah", label: "Ibadah", icon: Landmark, tile: "tile-violet", chip: "ichip-violet", items: fasilitas.ibadah },
    { key: "ekonomi", label: "Ekonomi", icon: Store, tile: "tile-amber", chip: "ichip-amber", items: fasilitas.ekonomi },
  ];

  return (
    <ChapterPanel
      id={`ch-${chapterNo}`}
      chapterNo={chapterNo}
      ribbonLabel="ISI DESA"
      ribbonDot="var(--color-teal-500)"
      stripGradient="linear-gradient(90deg,#14B8A6,#0EA5E9,#8B5CF6)"
      blobStyle={{ width: 320, height: 320, top: -120, left: -80, background: "var(--color-teal-500)" }}
      tagText="FASILITAS DESA · (MOCK)"
      tagClass="ch-tag-teal"
      sourceNote={{ label: "BPS Podes (fasilitas) & Prodeskel (lembaga/BUMDes)", mock: true }}
      headline={
        <>
          Apa yang <span className="underline-sweep">sudah ada</span> di desa ini — sekolah, faskes,
          rumah ibadah, ekonomi.
        </>
      }
    >
      <div className="grid grid-cols-1 gap-3 reveal reveal-4 sm:grid-cols-2">
        {groups.map((g) => {
          const Icon = g.icon;
          return (
            <div key={g.key} className={`tile ${g.tile}`}>
              <div className="mb-3 flex items-center gap-2">
                <div className={`ichip ${g.chip}`}><Icon size={15} aria-hidden /></div>
                <p className="text-[13px] font-semibold text-ink-1">{g.label}</p>
              </div>
              <div className="space-y-1.5">
                {g.items.map((it) => (
                  <div key={it.label} className="flex items-center justify-between gap-2 border-t border-[color:var(--color-hair)] pt-1.5 first:border-t-0 first:pt-0">
                    <span className={`text-[12px] ${it.jumlah === 0 ? "text-ink-4" : "text-ink-2"}`}>{it.label}</span>
                    <span className={`num text-[13px] font-semibold ${it.jumlah === 0 ? "text-ink-4" : "text-ink-1"}`}>{it.jumlah}</span>
                  </div>
                ))}
              </div>
            </div>
          );
        })}
      </div>

      <div className="mt-3 grid grid-cols-1 gap-3 reveal reveal-5 sm:grid-cols-2">
        <div className="tile tile-sky">
          <div className="flex items-center gap-2.5">
            <div className="ichip ichip-sky"><Droplets size={15} aria-hidden /></div>
            <div className="min-w-0">
              <p className="text-[12px] font-medium text-ink-1">Akses air bersih</p>
              <p className="text-[11.5px] text-ink-3">{fasilitas.aksesAirBersih}</p>
            </div>
          </div>
        </div>
        <div className="tile tile-amber">
          <div className="flex items-center gap-2.5">
            <div className="ichip ichip-amber"><Zap size={15} aria-hidden /></div>
            <div className="min-w-0">
              <p className="text-[12px] font-medium text-ink-1">Akses listrik</p>
              <p className="num text-[11.5px] text-ink-3">{fasilitas.aksesListrikPct}% rumah tangga</p>
            </div>
          </div>
        </div>
      </div>

      {/* Organisasi & Pemerintahan: Kades + Lembaga + BUMDes */}
      <div className="reveal reveal-6 mt-6">
        <p className="eyebrow mb-3">Organisasi &amp; Pemerintahan</p>

        <div className="grid grid-cols-1 gap-3 lg:grid-cols-2">
          {/* Kades + kontak kantor */}
          <div className="tile tile-brand">
            <div className="flex items-center gap-2.5">
              <div className="ichip ichip-brand"><UserRound size={15} aria-hidden /></div>
              <div className="min-w-0">
                <p className="text-[13px] font-semibold text-ink-1">{kades.nama}</p>
                <p className="num text-[11px] text-ink-3">Kepala Desa · {kades.periode}</p>
              </div>
            </div>
            <div className="mt-3 space-y-1 border-t border-[color:var(--color-hair)] pt-3 text-[11.5px] text-ink-3">
              <p>{kades.alamatKantor}</p>
              <p className="num">{kades.telepon} · {kades.jamPelayanan}</p>
            </div>
          </div>

          {/* BUMDes */}
          {bumdes ? (
            <div className="tile tile-good">
              <div className="flex items-center gap-2.5">
                <div className="ichip ichip-good"><Building2 size={15} aria-hidden /></div>
                <div className="min-w-0">
                  <p className="text-[13px] font-semibold text-ink-1">{bumdes.nama}</p>
                  <p className="num text-[11px] text-ink-3">BUMDes · berdiri {bumdes.tahunBerdiri}</p>
                </div>
                <span className={`cpill ${bumdes.status === "aktif" ? "cpill-good" : "cpill-warn"} ml-auto`}>
                  {bumdes.status === "aktif" ? "Aktif" : bumdes.status === "dalam_pembentukan" ? "Pembentukan" : "Tidak aktif"}
                </span>
              </div>
              <p className="mt-3 border-t border-[color:var(--color-hair)] pt-3 text-[11.5px] text-ink-3">
                {bumdes.bidangUsaha}
              </p>
            </div>
          ) : null}
        </div>

        {/* Lembaga */}
        {lembaga.length > 0 ? (
          <div className="mt-3 grid grid-cols-1 gap-2 sm:grid-cols-2">
            {lembaga.map((l) => (
              <div key={l.nama} className="tile tile-violet">
                <div className="flex items-center gap-2.5">
                  <div className="ichip ichip-violet"><Users size={15} aria-hidden /></div>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-[12.5px] font-medium text-ink-1">{l.nama}</p>
                    <p className="num text-[11px] text-ink-3">{l.jenis} · {l.anggota} anggota</p>
                  </div>
                  <span className={`cpill ${l.aktif ? "cpill-good" : "cpill-ink"}`}>{l.aktif ? "Aktif" : "Vakum"}</span>
                </div>
              </div>
            ))}
          </div>
        ) : null}
      </div>
    </ChapterPanel>
  );
}
