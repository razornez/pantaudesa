import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import Link from "next/link";
import { db } from "@/lib/db";
import { getAdminDesaContext } from "@/lib/data/admin-desa-context";
import { MessageSquare, ThumbsUp, ThumbsDown, ExternalLink } from "lucide-react";

export const dynamic = "force-dynamic";

const CATEGORY_LABEL: Record<string, string> = {
  infrastruktur: "Infrastruktur",
  bansos:        "Bansos",
  fasilitas:     "Fasilitas",
  anggaran:      "Anggaran",
  lingkungan:    "Lingkungan",
  lainnya:       "Lainnya",
};

const STATUS_LABEL: Record<string, { label: string; cls: string }> = {
  OPEN:        { label: "Terbuka",          cls: "pill-info"   },
  IN_PROGRESS: { label: "Sedang ditangani", cls: "pill-warn"   },
  RESOLVED:    { label: "Selesai",          cls: "pill-ok"     },
};

export default async function AdminDesaSuaraPage() {
  const session = await auth();
  if (!session?.user?.id) redirect("/login");
  const ctx = await getAdminDesaContext(session.user.id);
  if (!ctx) redirect("/profil/klaim-admin-desa?error=admin_desa_only");

  // Strictly filter by ctx.desa.id so admin only sees suara for their own desa.
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

  return (
    <div className="space-y-7">
      <header className="space-y-1.5">
        <p className="eyebrow text-[10px]">Tab</p>
        <h1 className="display text-[28px] sm:text-[32px] font-semibold text-slate-900 tracking-tight leading-tight">Suara Warga</h1>
        <p className="text-sm text-slate-500 leading-relaxed max-w-xl">
          Komentar dan suara warga untuk {ctx.desa.nama}. Mode tampilan saja — Admin Desa tidak melakukan moderasi.
        </p>
      </header>

      <div className="rounded-2xl px-4 py-3 text-sm pill-info">
        <p className="font-semibold">Mode tampilan</p>
        <p className="text-xs mt-0.5 leading-relaxed opacity-90">
          Tab ini menampilkan suara warga yang sudah dipublikasikan untuk desa kamu.
          Untuk membalas atau berinteraksi, gunakan halaman publik desa.
        </p>
      </div>

      {voices.length === 0 ? (
        <div className="lux-card p-10 text-center text-sm text-slate-500">
          Belum ada suara warga untuk desa ini.
        </div>
      ) : (
        <ul className="space-y-3">
          {voices.map((v) => {
            const statusKey = v.status as keyof typeof STATUS_LABEL;
            const status = STATUS_LABEL[statusKey] ?? STATUS_LABEL.OPEN;
            const author = v.isAnon ? "Anonim" : (v.author?.nama ?? v.author?.username ?? "Anonim");
            return (
              <li
                key={v.id}
                className="lux-card t-spring lift hover:shadow-lux-hover p-6 space-y-3"
              >
                <div className="flex flex-wrap items-center gap-2 text-xs">
                  <span className="font-semibold text-slate-700">
                    {CATEGORY_LABEL[v.category] ?? v.category}
                  </span>
                  <span className={`font-semibold px-2 py-0.5 rounded-full ${status.cls}`}>
                    {status.label}
                  </span>
                  <span className="text-slate-400">•</span>
                  <span className="text-slate-500">{author}</span>
                  <span className="text-slate-400">•</span>
                  <span className="text-slate-500">
                    {new Date(v.createdAt).toLocaleDateString("id-ID")}
                  </span>
                </div>

                <p className="text-sm text-slate-800 leading-relaxed">{v.text}</p>

                <div className="flex items-center gap-4 text-xs text-slate-500 pt-1 border-t border-slate-100">
                  <span className="inline-flex items-center gap-1">
                    <MessageSquare size={12} /> {v._count.replies}
                  </span>
                  <span className="inline-flex items-center gap-1">
                    <ThumbsUp size={12} /> {v._count.helpfuls}
                  </span>
                  <span className="inline-flex items-center gap-1">
                    <ThumbsDown size={12} /> {v._count.votes}
                  </span>
                </div>
              </li>
            );
          })}
        </ul>
      )}

      <div className="flex justify-end pt-2">
        <Link
          href={`/desa/${ctx.desa.id}/suara`}
          className="inline-flex items-center gap-1 text-sm text-indigo-600 hover:underline"
        >
          Buka halaman publik suara desa
          <ExternalLink size={12} />
        </Link>
      </div>
    </div>
  );
}
