import { CopyCheck } from "lucide-react";
import { DataStatusBadge } from "@/components/ui/DataStatusBadge";
import { METHOD_COPY, type ClaimMethod } from "@/components/profil/admin-claim/adminClaimCopy";
import type { AdminClaimActiveClaim, AdminClaimDesaOption } from "@/lib/data/admin-claim-read";
import type { AdminClaimEligibility } from "@/lib/admin-claim/eligibility";
import type { AdminClaimFlowState } from "@/hooks/use-admin-claim-flow";

export default function AdminClaimInstruction({
  method,
  selectedDesa,
  currentClaim,
  eligibility,
  flow,
  onBack,
  onContinue,
}: {
  method: ClaimMethod;
  selectedDesa: AdminClaimDesaOption | null;
  currentClaim: AdminClaimActiveClaim | null;
  eligibility: AdminClaimEligibility | null;
  flow: AdminClaimFlowState;
  onBack: () => void;
  onContinue: () => void;
}) {
  const copy = METHOD_COPY[method];
  const rawTokenLost = method === "WEBSITE_TOKEN" && currentClaim?.method === "WEBSITE_TOKEN" && currentClaim.hasActiveToken && !flow.rawToken;

  return (
    <div className="space-y-4">
      <div>
        <h2 className="text-lg font-black text-slate-950">Ikuti instruksi</h2>
        <p className="mt-1 text-sm leading-relaxed text-slate-600">
          Lanjutkan klaim yang sedang aktif atau kirim klaim baru untuk desa yang kamu pilih.
        </p>
      </div>

      <div className="rounded-2xl border border-indigo-100 bg-indigo-50 p-4">
        <p className="text-xs font-semibold uppercase tracking-wide text-indigo-700">Cara yang dipilih</p>
        <p className="mt-1 text-sm font-black text-slate-900">{copy.title}</p>
        <p className="mt-2 text-sm leading-relaxed text-slate-600">{copy.instruction}</p>
        {method === "WEBSITE_TOKEN" ? (
          <p className="mt-2 text-xs leading-relaxed text-indigo-800">
            Verifikasi website perlu diperbarui setiap 6 bulan agar hubungan dengan website resmi desa tetap segar.
          </p>
        ) : null}
      </div>

      {selectedDesa ? (
        <div className="rounded-2xl border border-slate-100 bg-white p-4 shadow-sm">
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div>
              <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">Ringkasan desa</p>
              <p className="mt-1 text-sm font-black text-slate-900">{selectedDesa.nama}</p>
              <p className="mt-1 text-xs leading-relaxed text-slate-500">
                {selectedDesa.kecamatan}, {selectedDesa.kabupaten}, {selectedDesa.provinsi}
              </p>
            </div>
            <DataStatusBadge status={selectedDesa.dataStatus} size="xs" />
          </div>
          <div className="mt-3 space-y-2 rounded-2xl bg-slate-50 p-4 text-xs leading-relaxed text-slate-600">
            <p>Sumber yang tercatat: {selectedDesa.sourceLabel}</p>
            <p>Email resmi: {selectedDesa.officialEmailLabel}</p>
            <p>Website resmi: {selectedDesa.websiteUrl ?? "Belum tercatat"}</p>
          </div>
          {eligibility && !eligibility.canStartNewClaim ? (
            <div className="mt-3 rounded-xl border border-amber-200 bg-amber-50 px-3 py-2 text-xs leading-relaxed text-amber-800">
              {eligibility.message}
            </div>
          ) : null}
        </div>
      ) : null}

      <div className="rounded-2xl border border-slate-100 bg-white p-4 shadow-sm">
        <div className="flex items-start gap-3">
          <span className="inline-flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-2xl bg-slate-100 text-slate-600">
            <CopyCheck size={16} />
          </span>
          <div>
            <p className="text-sm font-black text-slate-900">{copy.cta}</p>
            <p className="mt-1 text-xs leading-relaxed text-slate-500">{copy.note}</p>
          </div>
        </div>

        <div className="mt-4 space-y-3">
          {selectedDesa && !currentClaim ? (
            <button
              type="button"
              onClick={flow.submitClaimOnly}
              disabled={flow.busy || !selectedDesa}
              className="inline-flex min-h-11 w-full items-center justify-center rounded-xl bg-indigo-600 px-4 py-2.5 text-sm font-bold text-white hover:bg-indigo-700 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {flow.busy ? "Memproses..." : "Kirim klaim"}
            </button>
          ) : currentClaim ? (
            <div className="rounded-xl border border-emerald-100 bg-emerald-50 px-3 py-2.5 text-xs leading-relaxed text-emerald-800">
              Klaim aktif untuk <strong>{currentClaim.desaName}</strong> sudah tercatat. Lanjutkan dengan verifikasi di bawah. Kamu tidak bisa mengirim klaim baru selama klaim aktif sudah ada.
            </div>
          ) : null}

          {method === "OFFICIAL_EMAIL" ? (
            <>
              <input
                type="email"
                value={flow.officialEmail}
                onChange={(event) => flow.setOfficialEmail(event.target.value)}
                placeholder="email resmi desa,例: admin@desakita.go.id"
                className="w-full rounded-xl border border-slate-200 px-3 py-2.5 text-sm"
              />
              <button
                type="button"
                disabled={flow.busy || !flow.officialEmail.trim()}
                onClick={flow.sendEmailToken}
                className="inline-flex min-h-11 w-full items-center justify-center rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-bold text-slate-700 hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {flow.busy ? "Mengirim..." : currentClaim?.method === "OFFICIAL_EMAIL" ? "Kirim ulang email verifikasi" : "Kirim email verifikasi"}
              </button>
              <p className="text-[10px] text-slate-400">
                Buka email dari inbox dan klik tautan verifikasi. Tautan berlaku beberapa waktu.
              </p>
            </>
          ) : null}

          {method === "WEBSITE_TOKEN" ? (
            <>
              <input
                type="url"
                value={flow.websiteUrl}
                onChange={(event) => flow.setWebsiteUrl(event.target.value)}
                placeholder="https://desa.go.id"
                className="w-full rounded-xl border border-slate-200 px-3 py-2.5 text-sm"
              />
              <button
                type="button"
                disabled={flow.busy || !flow.websiteUrl.trim()}
                onClick={flow.generateWebsiteToken}
                className="inline-flex min-h-11 w-full items-center justify-center rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-bold text-slate-700 hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {flow.busy ? "Membuat token..." : currentClaim?.method === "WEBSITE_TOKEN" ? "Generate ulang token website" : "Generate token website"}
              </button>
              {flow.websiteInstruction ? (
                <div className="rounded-lg bg-indigo-50 border border-indigo-100 p-3 text-xs leading-relaxed text-indigo-700">
                  {flow.websiteInstruction}
                </div>
              ) : null}
              {flow.rawToken ? (
                <div className="rounded-lg border border-indigo-200 bg-indigo-50 p-3 text-xs leading-relaxed text-indigo-800">
                  <p className="font-bold mb-1">Token sesi aktif (hanya sekali tampil):</p>
                  <code className="break-all font-mono text-[11px]">{flow.rawToken}</code>
                </div>
              ) : null}
              {rawTokenLost ? (
                <div className="rounded-lg border border-amber-200 bg-amber-50 p-3 text-xs leading-relaxed text-amber-800">
                  Token dari sesi sebelumnya tidak tersedia karena refresh halaman. Generate token baru di atas, lalu pasang di website dan cek dari sini.
                </div>
              ) : null}
              <button
                type="button"
                disabled={flow.busy || !flow.rawToken}
                onClick={flow.checkWebsiteToken}
                className="inline-flex min-h-11 w-full items-center justify-center rounded-xl bg-slate-900 px-4 py-2.5 text-sm font-bold text-white hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {flow.busy ? "Mengecek..." : "Cek token di website"}
              </button>
              <p className="text-[10px] text-slate-400">
                Token hanya dicek jika sudah dipasang di website. Verifikasi perlu diperbarui setiap 6 bulan.
              </p>
            </>
          ) : null}

          {flow.feedback ? (
            <div className="rounded-lg border border-emerald-200 bg-emerald-50 p-3 text-xs leading-relaxed text-emerald-800">
              ✓ {flow.feedback}
            </div>
          ) : null}
          {flow.error ? (
            <div className="rounded-lg border border-rose-200 bg-rose-50 p-3 text-xs leading-relaxed text-rose-800">
              ✗ {flow.error}
            </div>
          ) : null}
        </div>
      </div>

      <div className="flex flex-col gap-2 sm:flex-row">
        <button
          type="button"
          onClick={onBack}
          className="inline-flex min-h-11 items-center justify-center rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-bold text-slate-700 transition-colors hover:bg-slate-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-300 focus-visible:ring-offset-2"
        >
          Kembali
        </button>
        <button
          type="button"
          onClick={onContinue}
          className="inline-flex min-h-11 flex-1 items-center justify-center rounded-xl bg-indigo-600 px-4 py-2.5 text-sm font-bold text-white transition-colors hover:bg-indigo-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-300 focus-visible:ring-offset-2"
        >
          Lanjut ke status
        </button>
      </div>
    </div>
  );
}
