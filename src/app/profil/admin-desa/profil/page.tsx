import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import Link from "next/link";
import { ExternalLink } from "lucide-react";
import { getAdminDesaContext } from "@/lib/data/admin-desa-context";

export const dynamic = "force-dynamic";

export default async function AdminDesaProfilePage() {
  const session = await auth();
  if (!session?.user?.id) redirect("/login");

  const ctx = await getAdminDesaContext(session.user.id);
  if (!ctx) redirect("/profil/klaim-admin-desa?error=admin_desa_only");

  const isVerified = ctx.member.status === "VERIFIED";

  return (
    <div className="space-y-7">
      <header className="flex flex-wrap items-start justify-between gap-3">
        <div className="space-y-1.5">
          <p className="eyebrow text-[10px]">Tab</p>
          <h1 className="display text-[28px] sm:text-[32px] font-semibold text-slate-900 tracking-tight leading-tight">Status Admin Desa</h1>
          <p className="text-sm text-slate-500 leading-relaxed">
            Detail keanggotaan Admin Desa kamu untuk {ctx.desa.nama}.
          </p>
        </div>
        {/* Bug #3: link goes to the desa being managed, not the desa list */}
        <Link
          href={`/desa/${ctx.desa.slug}`}
          className="t-spring inline-flex items-center gap-1.5 text-sm font-medium text-indigo-700 hover:text-indigo-900 hover:bg-indigo-50 px-3.5 py-2 rounded-xl focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 focus-visible:ring-offset-2"
        >
          Lihat profil publik desa <ExternalLink size={13} aria-hidden />
        </Link>
      </header>

      {/* Status card — Quiet Luxury hairline + tinted gradient based on state */}
      <section className={`rounded-3xl p-7 space-y-5 shadow-lux-1 ${isVerified ? "lux-status-good" : "lux-status-warn"}`}>
        <div className="flex items-center justify-between gap-3">
          <div>
            <p className="eyebrow text-[10px]">Status keanggotaan</p>
            <p className={`text-[26px] display font-semibold mt-1 tracking-tight ${
              isVerified ? "text-emerald-900" : "text-amber-900"
            }`}>
              {isVerified ? "VERIFIED" : "LIMITED"}
            </p>
          </div>
          <span className={`inline-flex items-center gap-1.5 text-[11px] font-medium px-2.5 py-1 rounded-full ${
            isVerified ? "pill-ok" : "pill-warn"
          }`}>
            <span
              className="w-1.5 h-1.5 rounded-full"
              style={{ background: isVerified ? "#10B981" : "#D97706" }}
              aria-hidden
            />
            {ctx.member.role.replace("_", " ")}
          </span>
        </div>

        <dl className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-4 text-sm">
          <div>
            <dt className="eyebrow text-[10px]">Desa</dt>
            <dd className="font-medium text-slate-900 mt-1">{ctx.desa.nama}</dd>
          </div>
          <div>
            <dt className="eyebrow text-[10px]">Lokasi</dt>
            <dd className="text-slate-700 mt-1">
              {ctx.desa.kecamatan}, {ctx.desa.kabupaten}, {ctx.desa.provinsi}
            </dd>
          </div>
          <div>
            <dt className="eyebrow text-[10px]">Bergabung</dt>
            <dd className="text-slate-700 mt-1 num">
              {new Date(ctx.member.joinedAt).toLocaleDateString("id-ID", { dateStyle: "long" })}
            </dd>
          </div>
          {ctx.member.acceptedAt && (
            <div>
              <dt className="eyebrow text-[10px]">Aksep undangan</dt>
              <dd className="text-slate-700 mt-1 num">
                {new Date(ctx.member.acceptedAt).toLocaleDateString("id-ID", { dateStyle: "long" })}
              </dd>
            </div>
          )}
          {ctx.member.renewalDueAt && (
            <div className="sm:col-span-2">
              <dt className="eyebrow text-[10px]">Perpanjangan jatuh tempo</dt>
              <dd className={`font-medium mt-1 num ${
                ctx.renewal.state === "OVERDUE" ? "text-rose-700" :
                ctx.renewal.state === "URGENT"  ? "text-amber-700" :
                ctx.renewal.state === "DUE_SOON"? "text-amber-700" :
                "text-slate-700"
              }`}>
                {new Date(ctx.member.renewalDueAt).toLocaleDateString("id-ID", { dateStyle: "long" })}
                {ctx.renewal.daysUntil !== null && (
                  <span className="ml-2 text-xs font-normal text-slate-500">
                    ({ctx.renewal.daysUntil >= 0
                      ? `${ctx.renewal.daysUntil} hari lagi`
                      : `lewat ${Math.abs(ctx.renewal.daysUntil)} hari`})
                  </span>
                )}
              </dd>
            </div>
          )}
        </dl>
      </section>

      {/* Capability summary */}
      <section className="lux-card p-7 space-y-4">
        <div>
          <p className="eyebrow text-[10px]">Hak akses</p>
          <h2 className="text-[15px] font-semibold text-slate-900 mt-1">Yang bisa kamu lakukan</h2>
        </div>
        {isVerified ? (
          <ul className="text-sm text-slate-700 space-y-2 leading-relaxed">
            <li className="flex items-start gap-2"><span className="text-emerald-600 mt-0.5">✓</span> Publish/update data desa setelah dokumen lolos review internal</li>
            <li className="flex items-start gap-2"><span className="text-emerald-600 mt-0.5">✓</span> Mengundang Admin Desa LIMITED untuk membantu mengelola data</li>
            <li className="flex items-start gap-2"><span className="text-emerald-600 mt-0.5">✓</span> Mencabut akses Admin Desa LIMITED</li>
            <li className="flex items-start gap-2"><span className="text-emerald-600 mt-0.5">✓</span> Mengupload dokumen langsung ke tahap PROCESSING</li>
            <li className="flex items-start gap-2"><span className="text-emerald-600 mt-0.5">✓</span> Menyetujui dokumen yang diunggah Admin LIMITED untuk diproses</li>
          </ul>
        ) : (
          <ul className="text-sm text-slate-700 space-y-2 leading-relaxed">
            <li className="flex items-start gap-2"><span className="text-emerald-600 mt-0.5">✓</span> Mengupload dokumen kontribusi (perlu persetujuan Admin VERIFIED)</li>
            <li className="flex items-start gap-2"><span className="text-emerald-600 mt-0.5">✓</span> Melihat dokumen, suara warga, dan notifikasi desa</li>
          </ul>
        )}

        {!isVerified && (
          <ul className="text-sm text-slate-500 space-y-2 pt-3 leading-relaxed" style={{ borderTop: "1px solid var(--hair)" }}>
            <li className="flex items-start gap-2"><span className="text-rose-500 mt-0.5">✗</span> Tidak bisa publish data desa</li>
            <li className="flex items-start gap-2"><span className="text-rose-500 mt-0.5">✗</span> Tidak bisa mengundang admin lain</li>
            <li className="flex items-start gap-2"><span className="text-rose-500 mt-0.5">✗</span> Tidak bisa mencabut akses admin lain</li>
          </ul>
        )}
      </section>

      {/* Renewal warning if applicable */}
      {isVerified && (ctx.renewal.state === "URGENT" || ctx.renewal.state === "OVERDUE") && (
        <section
          className={`rounded-3xl p-7 space-y-2 shadow-lux-1 ${
            ctx.renewal.state === "OVERDUE" ? "lux-status-danger" : "lux-status-warn"
          }`}
          role="alert"
        >
          <p className="eyebrow text-[10px]" style={{ color: ctx.renewal.state === "OVERDUE" ? "#9F1239" : "#B45309" }}>
            Perhatian
          </p>
          <h2 className={`display text-[18px] font-semibold tracking-tight ${
            ctx.renewal.state === "OVERDUE" ? "text-rose-900" : "text-amber-900"
          }`}>
            {ctx.renewal.state === "OVERDUE" ? "Perpanjangan terlambat" : "Perpanjangan segera dibutuhkan"}
          </h2>
          <p className={`text-sm leading-relaxed ${
            ctx.renewal.state === "OVERDUE" ? "text-rose-800" : "text-amber-800"
          }`}>
            Verifikasi Admin Desa kamu wajib diperpanjang setiap 6 bulan. Sukses
            verifikasi token tetap perlu review internal sebelum status VERIFIED
            kamu diperpanjang. Hubungi admin PantauDesa untuk panduan perpanjangan.
          </p>
        </section>
      )}

      <div className="flex justify-end pt-2">
        <Link
          href="/profil/saya"
          className="t-spring text-sm font-medium text-slate-500 hover:text-slate-900 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 focus-visible:ring-offset-2 rounded-lg px-2 py-1"
        >
          ← Kembali ke profil saya
        </Link>
      </div>
    </div>
  );
}
