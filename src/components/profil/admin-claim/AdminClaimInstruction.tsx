import { useState } from "react";
import { ArrowUpRight, CopyCheck, LifeBuoy } from "lucide-react";
import { DataStatusBadge } from "@/components/ui/DataStatusBadge";
import {
  buildSupportMailto,
  METHOD_COPY,
  type ClaimMethod,
} from "@/components/profil/admin-claim/adminClaimCopy";
import type { AdminClaimDesaOption } from "@/lib/data/admin-claim-read";

export default function AdminClaimInstruction({
  method,
  selectedDesa,
  supportEmail,
  onBack,
  onContinue,
  onClaimRefresh,
}: {
  method: ClaimMethod;
  selectedDesa: AdminClaimDesaOption | null;
  supportEmail: string | null;
  onBack: () => void;
  onContinue: () => void;
  onClaimRefresh: () => Promise<void>;
}) {
  const [claimId, setClaimId] = useState<string | null>(null);
  const [officialEmail, setOfficialEmail] = useState("");
  const [websiteUrl, setWebsiteUrl] = useState(selectedDesa?.websiteUrl ?? "");
  const [rawToken, setRawToken] = useState<string | null>(null);
  const [feedback, setFeedback] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  const copy = METHOD_COPY[method];
  const supportHref = supportEmail && selectedDesa
    ? buildSupportMailto(supportEmail, selectedDesa.nama)
    : undefined;

  async function submitClaim() {
    if (!selectedDesa) return;
    setBusy(true);
    setError(null);
    setFeedback(null);
    const response = await fetch("/api/admin-claim/submit", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ desaId: selectedDesa.id, method, officialEmail, websiteUrl }),
    });
    const payload = await response.json() as { claimId?: string; error?: string };
    if (!response.ok || !payload.claimId) {
      setError(payload.error ?? "Gagal mengirim klaim.");
      setBusy(false);
      return;
    }
    setClaimId(payload.claimId);
    setFeedback("Klaim berhasil dibuat. Lanjutkan verifikasi sesuai metode.");
    setBusy(false);
    await onClaimRefresh();
  }

  return (
    <div className="space-y-4">
      <div>
        <h2 className="text-lg font-black text-slate-950">Ikuti instruksi</h2>
        <p className="mt-1 text-sm leading-relaxed text-slate-600">
          Kami tampilkan satu langkah yang sesuai dengan pilihanmu supaya alurnya tetap fokus.
        </p>
      </div>

      <div className="rounded-2xl border border-indigo-100 bg-indigo-50 p-4">
        <p className="text-xs font-semibold uppercase tracking-wide text-indigo-700">Cara yang dipilih</p>
        <p className="mt-1 text-sm font-black text-slate-900">{copy.title}</p>
        <p className="mt-2 text-sm leading-relaxed text-slate-600">{copy.instruction}</p>
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
        </div>
      ) : null}

      {method === "SUPPORT_REVIEW" ? (
        <div className="rounded-2xl border border-slate-100 bg-white p-4 shadow-sm">
          <div className="flex items-start gap-3">
            <span className="inline-flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-2xl bg-slate-100 text-slate-600">
              <LifeBuoy size={16} />
            </span>
            <div>
              <p className="text-sm font-black text-slate-900">Format bantuan</p>
              <p className="mt-1 text-xs leading-relaxed text-slate-500">
                Pilihan ini tidak akan membuka email otomatis sampai kamu klik tombol kirim.
              </p>
            </div>
          </div>
          <div className="mt-4 rounded-2xl bg-slate-50 p-4 text-xs leading-relaxed text-slate-600">
            <p>Nama lengkap:</p>
            <p>Jabatan:</p>
            <p>Nama desa: {selectedDesa?.nama ?? "Belum dipilih"}</p>
            <p>Kecamatan: {selectedDesa?.kecamatan ?? "-"}</p>
            <p>Kabupaten: {selectedDesa?.kabupaten ?? "-"}</p>
            <p>Provinsi: {selectedDesa?.provinsi ?? "-"}</p>
            <p>Website resmi desa, jika ada: {selectedDesa?.websiteUrl ?? "Belum tercatat"}</p>
            <p>Email resmi desa, jika ada: {selectedDesa?.officialEmailLabel ?? "Belum tercatat"}</p>
            <p>Nomor kontak resmi yang tercantum di website, jika ada:</p>
            <p>Kendala yang dialami:</p>
            <p>Bukti pendukung/link dokumen, jika ada:</p>
          </div>
          {supportHref ? (
            <a
              href={supportHref}
              className="mt-4 inline-flex min-h-11 w-full items-center justify-center gap-2 rounded-xl bg-slate-900 px-4 py-2.5 text-sm font-bold text-white transition-colors hover:bg-slate-800 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-300 focus-visible:ring-offset-2 sm:w-auto"
            >
              <ArrowUpRight size={14} />
              Kirim Email Bantuan
            </a>
          ) : (
            <p className="mt-4 text-xs text-slate-500">Email bantuan belum tersedia pada lingkungan ini.</p>
          )}
        </div>
      ) : (
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
            <button
              type="button"
              onClick={submitClaim}
              disabled={busy || !selectedDesa}
              className="inline-flex min-h-11 w-full items-center justify-center rounded-xl bg-indigo-600 px-4 py-2.5 text-sm font-bold text-white disabled:cursor-not-allowed disabled:opacity-60"
            >
              {busy ? "Memproses..." : "Kirim klaim"}
            </button>

            {method === "OFFICIAL_EMAIL" ? (
              <>
                <input
                  type="email"
                  value={officialEmail}
                  onChange={(event) => setOfficialEmail(event.target.value)}
                  placeholder="email resmi desa"
                  className="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm"
                />
                <button
                  type="button"
                  disabled={busy || !claimId || !officialEmail.trim()}
                  onClick={async () => {
                    setBusy(true);
                    setError(null);
                    const response = await fetch("/api/admin-claim/generate-email-token", {
                      method: "POST",
                      headers: { "Content-Type": "application/json" },
                      body: JSON.stringify({ claimId, officialEmail }),
                    });
                    const payload = await response.json() as { message?: string; error?: string };
                    if (!response.ok) {
                      setError(payload.error ?? payload.message ?? "Gagal mengirim email verifikasi.");
                    } else {
                      setFeedback("Email verifikasi berhasil dikirim.");
                    }
                    setBusy(false);
                    await onClaimRefresh();
                  }}
                  className="inline-flex min-h-11 w-full items-center justify-center rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-bold text-slate-700 disabled:cursor-not-allowed disabled:opacity-60"
                >Kirim email verifikasi</button>
              </>
            ) : null}

            {method === "WEBSITE_TOKEN" ? (
              <>
                <input
                  type="url"
                  value={websiteUrl}
                  onChange={(event) => setWebsiteUrl(event.target.value)}
                  placeholder="https://desa.go.id"
                  className="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm"
                />
                <button
                  type="button"
                  disabled={busy || !claimId || !websiteUrl.trim()}
                  onClick={async () => {
                    setBusy(true);
                    setError(null);
                    const response = await fetch("/api/admin-claim/generate-website-token", {
                      method: "POST",
                      headers: { "Content-Type": "application/json" },
                      body: JSON.stringify({ claimId, websiteUrl }),
                    });
                    const payload = await response.json() as { rawToken?: string; error?: string };
                    if (!response.ok || !payload.rawToken) {
                      setError(payload.error ?? "Gagal generate token website.");
                    } else {
                      setRawToken(payload.rawToken);
                      setFeedback("Token berhasil dibuat. Pasang token di website resmi desa lalu klik cek token.");
                    }
                    setBusy(false);
                  }}
                  className="inline-flex min-h-11 w-full items-center justify-center rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-bold text-slate-700 disabled:cursor-not-allowed disabled:opacity-60"
                >Generate token website</button>
                {rawToken ? <p className="rounded-lg bg-slate-50 p-2 text-xs break-all">Token sesi aktif: {rawToken}</p> : null}
                <button
                  type="button"
                  disabled={busy || !claimId || !rawToken}
                  onClick={async () => {
                    setBusy(true);
                    setError(null);
                    const response = await fetch("/api/admin-claim/check-website-token", {
                      method: "POST",
                      headers: { "Content-Type": "application/json" },
                      body: JSON.stringify({ claimId, rawToken }),
                    });
                    const payload = await response.json() as { found?: boolean; reason?: string; error?: string };
                    if (!response.ok) {
                      setError(payload.error ?? "Gagal memeriksa token website.");
                    } else if (!payload.found) {
                      setError(`Token belum ditemukan (${payload.reason ?? "unknown"}).`);
                    } else {
                      setFeedback("Token ditemukan. Status akan diperbarui.");
                    }
                    setBusy(false);
                    await onClaimRefresh();
                  }}
                  className="inline-flex min-h-11 w-full items-center justify-center rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-bold text-slate-700 disabled:cursor-not-allowed disabled:opacity-60"
                >Cek token website</button>
              </>
            ) : null}

            {feedback ? <p className="text-xs text-emerald-700">{feedback}</p> : null}
            {error ? <p className="text-xs text-rose-700">{error}</p> : null}
          </div>
        </div>
      )}

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
