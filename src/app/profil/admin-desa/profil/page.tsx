import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import Link from "next/link";
import { CalendarClock, ExternalLink, ShieldCheck, Sparkles, Users } from "lucide-react";
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
      <header className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
        <div className="space-y-2">
          <p className="eyebrow text-[10px]">Profil Admin Desa</p>
          <h1 className="display text-[30px] sm:text-[34px] font-semibold text-slate-900 tracking-tight leading-tight">
            Status, hak akses, dan ritme verifikasi
          </h1>
          <p className="text-sm text-slate-500 leading-relaxed max-w-2xl">
            Semua informasi inti tentang peran Admin Desa kamu untuk {ctx.desa.nama} dalam satu tempat yang lebih rapi.
          </p>
        </div>

        <Link
          href={`/desa/${ctx.desa.slug}`}
          className="btn-lux btn-lux-ghost w-full sm:w-auto focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 focus-visible:ring-offset-2"
        >
          Lihat profil publik desa <ExternalLink size={14} aria-hidden />
        </Link>
      </header>

      <section className={`lux-panel p-6 sm:p-7 ${isVerified ? "lux-status-good" : "lux-status-warn"}`}>
        <div className="grid gap-6 lg:grid-cols-[minmax(0,1.35fr)_minmax(280px,0.85fr)]">
          <div className="space-y-5">
            <div className="flex flex-wrap items-start justify-between gap-4">
              <div>
                <p className="eyebrow text-[10px]">Status keanggotaan</p>
                <div className="flex items-center gap-3 mt-2">
                  <p className={`display text-[28px] sm:text-[34px] font-semibold ${isVerified ? "text-emerald-900" : "text-amber-900"}`}>
                    {isVerified ? "VERIFIED" : "LIMITED"}
                  </p>
                  <span className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-[11px] font-semibold ${isVerified ? "pill-ok" : "pill-warn"}`}>
                    <span
                      className="w-1.5 h-1.5 rounded-full"
                      style={{ background: isVerified ? "#10B981" : "#D97706" }}
                      aria-hidden
                    />
                    {ctx.member.role.replace("_", " ")}
                  </span>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3 sm:min-w-[260px]">
                <div className="metric-card">
                  <p className="metric-label">Bergabung</p>
                  <p className="metric-value text-[1.2rem]">
                    {new Date(ctx.member.joinedAt).toLocaleDateString("id-ID", { day: "2-digit", month: "short" })}
                  </p>
                  <p className="metric-note">Awal akses admin</p>
                </div>
                <div className="metric-card">
                  <p className="metric-label">Renewal</p>
                  <p className="metric-value text-[1.2rem]">{ctx.member.renewalDueAt ? "On" : "-"}</p>
                  <p className="metric-note">
                    {ctx.renewal.daysUntil !== null ? `${Math.abs(ctx.renewal.daysUntil)} hari` : "Belum aktif"}
                  </p>
                </div>
              </div>
            </div>

            <dl className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
              <div className="metric-card">
                <dt className="metric-label">Desa</dt>
                <dd className="mt-2 font-semibold text-slate-900">{ctx.desa.nama}</dd>
                <p className="metric-note">{ctx.desa.kecamatan}, {ctx.desa.kabupaten}</p>
              </div>
              <div className="metric-card">
                <dt className="metric-label">Lokasi lengkap</dt>
                <dd className="mt-2 text-slate-800">{ctx.desa.provinsi}</dd>
                <p className="metric-note">Wilayah kerja admin kamu</p>
              </div>
              <div className="metric-card">
                <dt className="metric-label">Undangan diterima</dt>
                <dd className="mt-2 text-slate-800">
                  {ctx.member.acceptedAt
                    ? new Date(ctx.member.acceptedAt).toLocaleDateString("id-ID", { dateStyle: "long" })
                    : "Tidak melalui undangan"}
                </dd>
              </div>
              <div className="metric-card">
                <dt className="metric-label">Perpanjangan berikutnya</dt>
                <dd className={`mt-2 font-medium ${
                  ctx.renewal.state === "OVERDUE" ? "text-rose-700" :
                  ctx.renewal.state === "URGENT" || ctx.renewal.state === "DUE_SOON" ? "text-amber-700" :
                  "text-slate-800"
                }`}>
                  {ctx.member.renewalDueAt
                    ? new Date(ctx.member.renewalDueAt).toLocaleDateString("id-ID", { dateStyle: "long" })
                    : "Belum ada jadwal"}
                </dd>
              </div>
            </dl>
          </div>

          <aside className="space-y-4">
            <div className="notice-card notice-info">
              <div className="flex items-start gap-3">
                <span className="mt-0.5 inline-flex h-10 w-10 items-center justify-center rounded-2xl bg-indigo-100 text-indigo-700">
                  <ShieldCheck size={18} aria-hidden />
                </span>
                <div className="space-y-1">
                  <p className="text-sm font-semibold">Peran kamu saat ini</p>
                  <p className="text-sm leading-relaxed opacity-90">
                    {isVerified
                      ? "Kamu memegang kendali penuh untuk alur dokumen desa, koordinasi admin, dan pengiriman data yang siap ditinjau PantauDesa."
                      : "Kamu sudah punya akses kerja, tetapi keputusan penting masih menunggu persetujuan Admin Desa VERIFIED."}
                  </p>
                </div>
              </div>
            </div>

            <div className="notice-card notice-ok">
              <div className="flex items-start gap-3">
                <span className="mt-0.5 inline-flex h-10 w-10 items-center justify-center rounded-2xl bg-emerald-100 text-emerald-700">
                  <Sparkles size={18} aria-hidden />
                </span>
                <div className="space-y-2">
                  <p className="text-sm font-semibold">Standar kerja yang direkomendasikan</p>
                  <ul className="space-y-2 text-sm leading-relaxed opacity-90">
                    <li>Unggah dokumen dalam batch rapi per topik dan tahun.</li>
                    <li>Jaga judul dokumen konsisten agar review internal lebih cepat.</li>
                    <li>Periksa notifikasi secara rutin agar approval tidak menumpuk.</li>
                  </ul>
                </div>
              </div>
            </div>
          </aside>
        </div>
      </section>

      <section className="grid gap-4 lg:grid-cols-2">
        <div className="lux-card p-6 space-y-4">
          <div className="flex items-center gap-3">
            <span className="inline-flex h-10 w-10 items-center justify-center rounded-2xl bg-indigo-50 text-indigo-700">
              <Users size={18} aria-hidden />
            </span>
            <div>
              <p className="eyebrow text-[10px]">Hak akses</p>
              <h2 className="text-[18px] font-semibold text-slate-900 mt-1">Yang bisa kamu lakukan</h2>
            </div>
          </div>

          <ul className="space-y-3 text-sm text-slate-700 leading-relaxed">
            {isVerified ? (
              <>
                <li>Publikasikan atau update data desa setelah dokumen lolos review internal.</li>
                <li>Undang dan kelola Admin Desa LIMITED sesuai kebutuhan operasional.</li>
                <li>Setujui dokumen kontribusi dari admin LIMITED agar masuk ke tahap processing.</li>
                <li>Gunakan dashboard ini sebagai workspace harian untuk dokumen, suara, dan notifikasi.</li>
              </>
            ) : (
              <>
                <li>Unggah dokumen kontribusi dengan bukti yang rapi dan dapat diverifikasi.</li>
                <li>Lihat perkembangan dokumen, suara warga, dan pengingat dari PantauDesa.</li>
                <li>Siapkan dokumen kerja sambil menunggu approval dari Admin Desa VERIFIED.</li>
              </>
            )}
          </ul>
        </div>

        <div className="lux-card p-6 space-y-4">
          <div className="flex items-center gap-3">
            <span className="inline-flex h-10 w-10 items-center justify-center rounded-2xl bg-amber-50 text-amber-700">
              <CalendarClock size={18} aria-hidden />
            </span>
            <div>
              <p className="eyebrow text-[10px]">Pembatas peran</p>
              <h2 className="text-[18px] font-semibold text-slate-900 mt-1">Yang tetap perlu perhatian</h2>
            </div>
          </div>

          <ul className="space-y-3 text-sm leading-relaxed">
            {isVerified ? (
              <>
                <li className="text-slate-700">Verifikasi berkala tetap wajib dan tidak otomatis diperpanjang.</li>
                <li className="text-slate-700">Akses Admin Desa tidak sama dengan akses internal admin PantauDesa.</li>
                <li className="text-slate-700">Kualitas judul, kategori, dan bukti dokumen sangat memengaruhi kecepatan review.</li>
              </>
            ) : (
              <>
                <li className="text-rose-700">Belum bisa publish data desa langsung ke publik.</li>
                <li className="text-rose-700">Belum bisa mengundang atau mencabut admin lain.</li>
                <li className="text-rose-700">Dokumen yang kamu kirim tetap menunggu approval Admin VERIFIED.</li>
              </>
            )}
          </ul>
        </div>
      </section>

      {isVerified && (ctx.renewal.state === "URGENT" || ctx.renewal.state === "OVERDUE") && (
        <section
          className={`notice-card ${ctx.renewal.state === "OVERDUE" ? "notice-danger" : "notice-warn"}`}
          role="alert"
        >
          <p className="eyebrow text-[10px]" style={{ color: ctx.renewal.state === "OVERDUE" ? "#9F1239" : "#B45309" }}>
            Perhatian
          </p>
          <h2 className="display text-[20px] font-semibold mt-2">
            {ctx.renewal.state === "OVERDUE" ? "Perpanjangan terlambat" : "Perpanjangan segera dibutuhkan"}
          </h2>
          <p className="text-sm mt-2 leading-relaxed opacity-90 max-w-3xl">
            Verifikasi Admin Desa wajib diperpanjang berkala. Token yang berhasil diverifikasi tetap perlu review internal sebelum masa aktif kamu diperbarui.
          </p>
        </section>
      )}
    </div>
  );
}
