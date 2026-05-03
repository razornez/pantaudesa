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
    <div className="space-y-6">
      <header className="flex flex-wrap items-start justify-between gap-3">
        <div className="space-y-1">
          <h1 className="text-2xl font-bold text-slate-900">Status Admin Desa</h1>
          <p className="text-sm text-slate-500">
            Detail keanggotaan Admin Desa kamu untuk {ctx.desa.nama}.
          </p>
        </div>
        {/* Bug #3: link goes to the desa being managed, not the desa list */}
        <Link
          href={`/desa/${ctx.desa.slug}`}
          className="inline-flex items-center gap-1.5 text-sm font-medium text-indigo-600 hover:text-indigo-800 hover:bg-indigo-50 px-3 py-2 rounded-xl transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 focus-visible:ring-offset-2"
        >
          Lihat profil publik desa <ExternalLink size={13} />
        </Link>
      </header>

      {/* Status card */}
      <section className="bg-white border border-slate-200 rounded-2xl p-5 space-y-4">
        <div className="flex items-center justify-between gap-3">
          <div>
            <p className="text-xs font-medium text-slate-500 uppercase tracking-wide">Status</p>
            <p className={`text-lg font-bold mt-0.5 ${
              isVerified ? "text-emerald-700" : "text-amber-700"
            }`}>
              {isVerified ? "VERIFIED" : "LIMITED"}
            </p>
          </div>
          <span className={`text-xs font-semibold px-3 py-1 rounded-full ${
            isVerified ? "bg-emerald-100 text-emerald-800" : "bg-amber-100 text-amber-800"
          }`}>
            {ctx.member.role.replace("_", " ")}
          </span>
        </div>

        <dl className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm">
          <div>
            <dt className="text-xs text-slate-500">Desa</dt>
            <dd className="font-medium text-slate-900">{ctx.desa.nama}</dd>
          </div>
          <div>
            <dt className="text-xs text-slate-500">Lokasi</dt>
            <dd className="text-slate-700">
              {ctx.desa.kecamatan}, {ctx.desa.kabupaten}, {ctx.desa.provinsi}
            </dd>
          </div>
          <div>
            <dt className="text-xs text-slate-500">Bergabung</dt>
            <dd className="text-slate-700">
              {new Date(ctx.member.joinedAt).toLocaleDateString("id-ID", { dateStyle: "long" })}
            </dd>
          </div>
          {ctx.member.acceptedAt && (
            <div>
              <dt className="text-xs text-slate-500">Aksep undangan</dt>
              <dd className="text-slate-700">
                {new Date(ctx.member.acceptedAt).toLocaleDateString("id-ID", { dateStyle: "long" })}
              </dd>
            </div>
          )}
          {ctx.member.renewalDueAt && (
            <div className="sm:col-span-2">
              <dt className="text-xs text-slate-500">Perpanjangan jatuh tempo</dt>
              <dd className={`font-medium ${
                ctx.renewal.state === "OVERDUE" ? "text-red-700" :
                ctx.renewal.state === "URGENT" ? "text-orange-700" :
                ctx.renewal.state === "DUE_SOON" ? "text-amber-700" :
                "text-slate-700"
              }`}>
                {new Date(ctx.member.renewalDueAt).toLocaleDateString("id-ID", { dateStyle: "long" })}
                {ctx.renewal.daysUntil !== null && (
                  <span className="ml-2 text-xs font-normal">
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
      <section className="bg-white border border-slate-200 rounded-2xl p-5 space-y-3">
        <h2 className="text-sm font-semibold text-slate-900">Yang bisa kamu lakukan</h2>
        {isVerified ? (
          <ul className="text-sm text-slate-700 space-y-1.5">
            <li>• Publish/update data desa setelah dokumen lolos review internal</li>
            <li>• Mengundang Admin Desa LIMITED untuk membantu mengelola data</li>
            <li>• Mencabut akses Admin Desa LIMITED</li>
            <li>• Mengupload dokumen langsung ke tahap PROCESSING</li>
            <li>• Menyetujui dokumen yang diunggah Admin LIMITED untuk diproses</li>
          </ul>
        ) : (
          <ul className="text-sm text-slate-700 space-y-1.5">
            <li>• Mengupload dokumen kontribusi (perlu persetujuan Admin VERIFIED)</li>
            <li>• Melihat dokumen, suara warga, dan notifikasi desa</li>
          </ul>
        )}

        {!isVerified && (
          <ul className="text-sm text-slate-500 space-y-1.5 pt-2 border-t border-slate-100">
            <li>✗ Tidak bisa publish data desa</li>
            <li>✗ Tidak bisa mengundang admin lain</li>
            <li>✗ Tidak bisa mencabut akses admin lain</li>
          </ul>
        )}
      </section>

      {/* Renewal warning if applicable */}
      {isVerified && (ctx.renewal.state === "URGENT" || ctx.renewal.state === "OVERDUE") && (
        <section className={`rounded-2xl p-5 ${
          ctx.renewal.state === "OVERDUE"
            ? "bg-red-50 border border-red-200"
            : "bg-orange-50 border border-orange-200"
        }`}>
          <h2 className={`text-sm font-semibold ${
            ctx.renewal.state === "OVERDUE" ? "text-red-900" : "text-orange-900"
          }`}>
            {ctx.renewal.state === "OVERDUE" ? "Perpanjangan terlambat" : "Perpanjangan segera dibutuhkan"}
          </h2>
          <p className={`text-sm mt-1 ${
            ctx.renewal.state === "OVERDUE" ? "text-red-800" : "text-orange-800"
          }`}>
            Verifikasi Admin Desa kamu wajib diperpanjang setiap 6 bulan. Sukses
            verifikasi token tetap perlu review internal sebelum status VERIFIED
            kamu diperpanjang. Hubungi admin PantauDesa untuk panduan perpanjangan.
          </p>
        </section>
      )}

      <div className="flex justify-end">
        <Link
          href="/profil/saya"
          className="text-sm text-slate-500 hover:text-slate-700 transition-colors"
        >
          ← Kembali ke profil saya
        </Link>
      </div>
    </div>
  );
}
