import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import Link from "next/link";
import { db } from "@/lib/db";
import { getAdminDesaContext } from "@/lib/data/admin-desa-context";
import { ExternalLink, MessageSquare, MessagesSquare, ThumbsDown, ThumbsUp } from "lucide-react";

export const dynamic = "force-dynamic";

const CATEGORY_LABEL: Record<string, string> = {
  infrastruktur: "Infrastruktur",
  bansos: "Bansos",
  fasilitas: "Fasilitas",
  anggaran: "Anggaran",
  lingkungan: "Lingkungan",
  lainnya: "Lainnya",
};

const STATUS_LABEL: Record<string, { label: string; cls: string }> = {
  OPEN: { label: "Terbuka", cls: "pill-info" },
  IN_PROGRESS: { label: "Sedang ditangani", cls: "pill-warn" },
  RESOLVED: { label: "Selesai", cls: "pill-ok" },
};

export default async function AdminDesaSuaraPage() {
  const session = await auth();
  if (!session?.user?.id) redirect("/login");
  const ctx = await getAdminDesaContext(session.user.id);
  if (!ctx) redirect("/profil/klaim-admin-desa?error=admin_desa_only");

  const voices = db
    ? await db.voice.findMany({
        where: { desaId: ctx.desa.id },
        orderBy: { createdAt: "desc" },
        take: 50,
        select: {
          id: true,
          category: true,
          text: true,
          isAnon: true,
          status: true,
          createdAt: true,
          resolvedAt: true,
          author: { select: { nama: true, username: true } },
          _count: { select: { replies: true, votes: true, helpfuls: true } },
        },
      })
    : [];

  const summary = voices.reduce((acc, voice) => {
    acc.total += 1;
    acc.replies += voice._count.replies;
    acc.helpful += voice._count.helpfuls;
    if (voice.status === "OPEN") acc.open += 1;
    if (voice.status === "RESOLVED") acc.resolved += 1;
    return acc;
  }, { total: 0, replies: 0, helpful: 0, open: 0, resolved: 0 });

  return (
    <div className="space-y-7">
      <header className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
        <div className="space-y-2">
          <p className="eyebrow text-[10px]">Suara warga</p>
          <h1 className="display text-[30px] sm:text-[34px] font-semibold text-slate-900 tracking-tight leading-tight">
            Percakapan publik yang perlu kamu pahami
          </h1>
          <p className="text-sm text-slate-500 leading-relaxed max-w-2xl">
            Ini adalah tampilan baca untuk suara warga di {ctx.desa.nama}, supaya Admin Desa bisa menangkap konteks tanpa mengganggu ruang publik.
          </p>
        </div>

        <Link href={`/desa/${ctx.desa.id}/suara`} className="btn-lux btn-lux-ghost w-full sm:w-auto">
          Buka halaman publik suara desa <ExternalLink size={14} aria-hidden />
        </Link>
      </header>

      <section className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        <div className="metric-card">
          <p className="metric-label">Total suara</p>
          <p className="metric-value">{summary.total}</p>
          <p className="metric-note">masukan publik</p>
        </div>
        <div className="metric-card">
          <p className="metric-label">Masih terbuka</p>
          <p className="metric-value">{summary.open}</p>
          <p className="metric-note">belum selesai</p>
        </div>
        <div className="metric-card">
          <p className="metric-label">Balasan</p>
          <p className="metric-value">{summary.replies}</p>
          <p className="metric-note">diskusi yang tercatat</p>
        </div>
        <div className="metric-card">
          <p className="metric-label">Helpful</p>
          <p className="metric-value">{summary.helpful}</p>
          <p className="metric-note">respon warga</p>
        </div>
      </section>

      <div className="notice-card notice-info text-sm leading-relaxed">
        <p className="font-semibold">Mode tampilan</p>
        <p className="mt-2 opacity-90">
          Tab ini hanya membantu kamu membaca dinamika warga. Interaksi tetap dilakukan di halaman publik desa agar percakapan tetap transparan.
        </p>
      </div>

      {voices.length === 0 ? (
        <div className="lux-card p-10 text-center text-sm text-slate-500">
          Belum ada suara warga untuk desa ini.
        </div>
      ) : (
        <ul className="space-y-4">
          {voices.map((v) => {
            const statusKey = v.status as keyof typeof STATUS_LABEL;
            const status = STATUS_LABEL[statusKey] ?? STATUS_LABEL.OPEN;
            const author = v.isAnon ? "Anonim" : (v.author?.nama ?? v.author?.username ?? "Anonim");

            return (
              <li key={v.id} className="lux-card t-spring lift hover:shadow-lux-hover p-6 space-y-4">
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div className="space-y-2">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="pill-info rounded-full px-3 py-1 text-[11px] font-semibold">
                        {CATEGORY_LABEL[v.category] ?? v.category}
                      </span>
                      <span className={`rounded-full px-3 py-1 text-[11px] font-semibold ${status.cls}`}>
                        {status.label}
                      </span>
                    </div>
                    <div className="text-xs text-slate-500">
                      {author} · {new Date(v.createdAt).toLocaleDateString("id-ID", { dateStyle: "long" })}
                    </div>
                  </div>

                  <div className="grid grid-cols-3 gap-2 min-w-[180px]">
                    <div className="rounded-2xl bg-slate-50 px-3 py-2 text-center shadow-[inset_0_0_0_1px_rgba(15,23,42,0.05)]">
                      <p className="text-[11px] text-slate-500">Balasan</p>
                      <p className="text-sm font-semibold text-slate-900 mt-1">{v._count.replies}</p>
                    </div>
                    <div className="rounded-2xl bg-slate-50 px-3 py-2 text-center shadow-[inset_0_0_0_1px_rgba(15,23,42,0.05)]">
                      <p className="text-[11px] text-slate-500">Helpful</p>
                      <p className="text-sm font-semibold text-slate-900 mt-1">{v._count.helpfuls}</p>
                    </div>
                    <div className="rounded-2xl bg-slate-50 px-3 py-2 text-center shadow-[inset_0_0_0_1px_rgba(15,23,42,0.05)]">
                      <p className="text-[11px] text-slate-500">Vote</p>
                      <p className="text-sm font-semibold text-slate-900 mt-1">{v._count.votes}</p>
                    </div>
                  </div>
                </div>

                <p className="text-sm text-slate-800 leading-relaxed">{v.text}</p>

                <div className="surface-divider pt-4 flex flex-wrap items-center gap-4 text-xs text-slate-500">
                  <span className="inline-flex items-center gap-1">
                    <MessagesSquare size={12} aria-hidden /> {v._count.replies} balasan
                  </span>
                  <span className="inline-flex items-center gap-1">
                    <ThumbsUp size={12} aria-hidden /> {v._count.helpfuls} helpful
                  </span>
                  <span className="inline-flex items-center gap-1">
                    <ThumbsDown size={12} aria-hidden /> {v._count.votes} vote
                  </span>
                  <span className="inline-flex items-center gap-1">
                    <MessageSquare size={12} aria-hidden /> Arsip publik
                  </span>
                </div>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
