import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import Link from "next/link";
import { db } from "@/lib/db";
import { getAdminDesaContext } from "@/lib/data/admin-desa-context";
import { BACK_OFFICE_COPY } from "@/lib/back-office-copy";
import AdminDesaSuaraStatusAction from "@/components/admin-desa/AdminDesaSuaraStatusAction";
import { ExternalLink, MessageSquare, MessagesSquare, ThumbsDown, ThumbsUp } from "lucide-react";

export const dynamic = "force-dynamic";

const COPY = BACK_OFFICE_COPY.adminDesa.suara;

export default async function AdminDesaSuaraPage() {
  const session = await auth();
  if (!session?.user?.id) redirect("/login");
  const ctx = await getAdminDesaContext(session.user.id);
  if (!ctx) redirect("/profil/klaim-admin-desa?error=admin_desa_only");

  const voiceDesaKeys = [ctx.desa.id, ctx.desa.slug].filter(Boolean);
  const voices = db
    ? await db.voice.findMany({
        where: { desaId: { in: voiceDesaKeys } },
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
          author: { select: { nama: true, username: true, email: true } },
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
    <div className="space-y-5">
      <header className="flex flex-col gap-3 lg:flex-row lg:items-end lg:justify-between">
        <div className="space-y-1.5">
          <p className="eyebrow text-[10px]">{COPY.headingEyebrow}</p>
          <h1 className="display text-[24px] sm:text-[30px] font-semibold text-slate-900 tracking-tight leading-tight">{COPY.headingTitle}</h1>
          <p className="text-sm text-slate-500 leading-relaxed max-w-2xl">{COPY.headingBody(ctx.desa.nama)}</p>
        </div>
        <Link href={`/desa/${ctx.desa.slug}/suara`} className="btn-lux btn-lux-ghost w-full sm:w-auto text-sm">
          {COPY.openPublicPage} <ExternalLink size={14} aria-hidden />
        </Link>
      </header>

      <section className="grid grid-cols-2 gap-2 sm:grid-cols-4">
        <div className="metric-card p-3 sm:p-4"><p className="metric-label text-[10px]">{COPY.summary.total}</p><p className="metric-value text-[1.25rem] sm:text-[1.5rem]">{summary.total}</p><p className="metric-note text-[10px]">{COPY.summary.publicInput}</p></div>
        <div className="metric-card p-3 sm:p-4"><p className="metric-label text-[10px]">{COPY.summary.open}</p><p className="metric-value text-[1.25rem] sm:text-[1.5rem]">{summary.open}</p><p className="metric-note text-[10px]">{COPY.summary.unresolved}</p></div>
        <div className="metric-card p-3 sm:p-4"><p className="metric-label text-[10px]">{COPY.summary.replies}</p><p className="metric-value text-[1.25rem] sm:text-[1.5rem]">{summary.replies}</p><p className="metric-note text-[10px]">{COPY.summary.discussions}</p></div>
        <div className="metric-card p-3 sm:p-4"><p className="metric-label text-[10px]">{COPY.summary.helpful}</p><p className="metric-value text-[1.25rem] sm:text-[1.5rem]">{summary.helpful}</p><p className="metric-note text-[10px]">{COPY.summary.citizenResponse}</p></div>
      </section>

      <div className="notice-card notice-info text-sm leading-relaxed"><p className="font-semibold">{COPY.noticeTitle}</p><p className="mt-1 opacity-90">{COPY.noticeBody}</p></div>

      {voices.length === 0 ? (
        <div className="lux-card p-8 text-center text-sm text-slate-500">{COPY.empty}</div>
      ) : (
        <ul className="space-y-3">
          {voices.map((v) => {
            const author = v.isAnon ? COPY.authorAnonymous : (v.author?.nama ?? v.author?.username ?? v.author?.email ?? COPY.authorAnonymous);
            return (
              <li key={v.id} className="lux-card t-spring lift hover:shadow-lux-hover p-4 sm:p-5 space-y-3">
                <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                  <div className="space-y-2 min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="pill-info rounded-full px-2.5 py-1 text-[11px] font-semibold">{COPY.category[v.category as keyof typeof COPY.category] ?? v.category}</span>
                      <AdminDesaSuaraStatusAction voiceId={v.id} currentStatus={v.status as "OPEN" | "IN_PROGRESS" | "RESOLVED"} />
                    </div>
                    <div className="text-xs text-slate-500">{author} · {new Date(v.createdAt).toLocaleDateString("id-ID", { dateStyle: "medium" })}</div>
                  </div>
                  <div className="grid grid-cols-3 gap-1.5 sm:min-w-[168px]">
                    <div className="rounded-xl bg-slate-50 px-2.5 py-2 text-center shadow-[inset_0_0_0_1px_rgba(15,23,42,0.05)]"><p className="text-[10px] text-slate-500">{COPY.summary.replies}</p><p className="text-sm font-semibold text-slate-900 mt-0.5">{v._count.replies}</p></div>
                    <div className="rounded-xl bg-slate-50 px-2.5 py-2 text-center shadow-[inset_0_0_0_1px_rgba(15,23,42,0.05)]"><p className="text-[10px] text-slate-500">{COPY.summary.helpful}</p><p className="text-sm font-semibold text-slate-900 mt-0.5">{v._count.helpfuls}</p></div>
                    <div className="rounded-xl bg-slate-50 px-2.5 py-2 text-center shadow-[inset_0_0_0_1px_rgba(15,23,42,0.05)]"><p className="text-[10px] text-slate-500">Vote</p><p className="text-sm font-semibold text-slate-900 mt-0.5">{v._count.votes}</p></div>
                  </div>
                </div>
                <p className="text-sm text-slate-800 leading-relaxed">{v.text}</p>
                <div className="surface-divider pt-3 flex flex-wrap items-center gap-x-4 gap-y-2 text-xs text-slate-500">
                  <span className="inline-flex items-center gap-1"><MessagesSquare size={12} aria-hidden /> {v._count.replies} {COPY.labels.replies}</span>
                  <span className="inline-flex items-center gap-1"><ThumbsUp size={12} aria-hidden /> {v._count.helpfuls} {COPY.labels.helpful}</span>
                  <span className="inline-flex items-center gap-1"><ThumbsDown size={12} aria-hidden /> {v._count.votes} {COPY.labels.vote}</span>
                  <span className="inline-flex items-center gap-1"><MessageSquare size={12} aria-hidden /> {COPY.labels.publicArchive}</span>
                </div>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
