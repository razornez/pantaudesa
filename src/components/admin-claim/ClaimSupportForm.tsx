"use client";

import { useState } from "react";

interface Props {
  claimId: string;
  desaId: string;
  desaName: string;
  desaLocation: string;
  claimStatus: string;
  alreadySubmitted: boolean;
  alreadySubmittedAt: string | null;
}

export default function ClaimSupportForm({
  claimId,
  desaId,
  desaName,
  desaLocation,
  claimStatus,
  alreadySubmitted,
  alreadySubmittedAt,
}: Props) {
  const [reason, setReason] = useState("");
  const [explanation, setExplanation] = useState("");
  const [whyCannotVerify, setWhyCannotVerify] = useState("");
  const [evidenceDescription, setEvidenceDescription] = useState("");
  const [agreed, setAgreed] = useState(false);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<{ ok: boolean; message: string } | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!agreed) {
      setError("Centang pernyataan tanggung jawab sebelum mengirim.");
      return;
    }
    setLoading(true);
    setError(null);

    try {
      const res = await fetch("/api/admin-claim/support-submission", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          claimId,
          desaId,
          reason,
          explanation,
          whyCannotVerify,
          evidenceDescription: evidenceDescription || undefined,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error ?? "Terjadi kesalahan. Coba lagi.");
        return;
      }
      setResult({ ok: true, message: data.message });
    } catch {
      setError("Koneksi bermasalah. Periksa jaringan dan coba lagi.");
    } finally {
      setLoading(false);
    }
  }

  if (result?.ok) {
    return (
      <div className="bg-green-50 border border-green-200 rounded-xl px-5 py-6 space-y-2">
        <p className="font-semibold text-green-800">Pengajuan terkirim</p>
        <p className="text-sm text-green-700">{result.message}</p>
        <a
          href="/profil/klaim-admin-desa"
          className="mt-2 inline-block text-sm text-indigo-600 font-medium hover:underline"
        >
          Kembali ke status klaim →
        </a>
      </div>
    );
  }

  return (
    <div className="space-y-5">
      {/* Claim context */}
      <div className="bg-white border border-slate-200 rounded-xl px-5 py-4 space-y-1">
        <p className="text-sm font-medium text-slate-700">Desa yang diklaim</p>
        <p className="text-base font-semibold text-slate-900">{desaName}</p>
        <p className="text-sm text-slate-500">{desaLocation}</p>
        <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${
          claimStatus === "PENDING" ? "bg-yellow-100 text-yellow-800" :
          claimStatus === "IN_REVIEW" ? "bg-blue-100 text-blue-800" :
          "bg-red-100 text-red-800"
        }`}>
          {claimStatus}
        </span>
      </div>

      {alreadySubmitted && (
        <div className="bg-blue-50 border border-blue-200 rounded-xl px-4 py-3 text-sm text-blue-800">
          <p className="font-medium">Pengajuan sudah dikirim sebelumnya</p>
          {alreadySubmittedAt && (
            <p className="text-blue-600 text-xs mt-0.5">
              Dikirim: {new Date(alreadySubmittedAt).toLocaleString("id-ID")}
            </p>
          )}
          <p className="mt-1">Kamu dapat mengirim pengajuan tambahan dengan bukti terbaru.</p>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-5">
        <div className="bg-white border border-slate-200 rounded-xl px-5 py-5 space-y-4">
          <h2 className="text-sm font-semibold text-slate-900">Detail pengajuan</h2>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">
              Alasan kamu mengajukan sebagai Admin Desa{" "}
              <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              maxLength={200}
              placeholder="Contoh: Saya adalah Kepala Desa / Sekdes / perangkat desa resmi"
              className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400"
              required
            />
            <p className="text-xs text-slate-400 mt-0.5">{reason.length}/200</p>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">
              Penjelasan lengkap pengajuan kamu <span className="text-red-500">*</span>
            </label>
            <textarea
              value={explanation}
              onChange={(e) => setExplanation(e.target.value)}
              maxLength={2000}
              rows={4}
              placeholder="Ceritakan latar belakang, jabatan, dan bukti bahwa kamu berwenang mengelola data desa ini..."
              className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400 resize-none"
              required
            />
            <p className="text-xs text-slate-400 mt-0.5">{explanation.length}/2000</p>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">
              Mengapa kamu tidak bisa verifikasi via website token atau OTP email?{" "}
              <span className="text-red-500">*</span>
            </label>
            <textarea
              value={whyCannotVerify}
              onChange={(e) => setWhyCannotVerify(e.target.value)}
              maxLength={1000}
              rows={3}
              placeholder="Contoh: Website desa sedang dalam perbaikan / tidak ada akses ke email desa resmi / domain desa belum aktif..."
              className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400 resize-none"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">
              Deskripsi bukti/dokumen pendukung{" "}
              <span className="text-slate-400 font-normal">(opsional)</span>
            </label>
            <textarea
              value={evidenceDescription}
              onChange={(e) => setEvidenceDescription(e.target.value)}
              maxLength={1000}
              rows={2}
              placeholder="Contoh: SK Pengangkatan nomor ..., surat kuasa dari kades, foto dokumen resmi..."
              className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400 resize-none"
            />
            <p className="text-xs text-slate-400 mt-0.5">
              Upload file belum tersedia. Deskripsikan bukti yang kamu miliki — bisa dikirimkan lewat email balasan setelah pengajuan.
            </p>
          </div>
        </div>

        {/* Responsibility acknowledgment */}
        <label className="flex items-start gap-3 cursor-pointer">
          <input
            type="checkbox"
            checked={agreed}
            onChange={(e) => setAgreed(e.target.checked)}
            className="mt-0.5 rounded border-slate-300 shrink-0"
          />
          <span className="text-sm text-slate-700">
            Saya menyatakan informasi yang saya kirimkan benar dan dapat dipertanggungjawabkan.
          </span>
        </label>

        {error && (
          <p className="text-sm text-red-600 bg-red-50 rounded-lg px-3 py-2">{error}</p>
        )}

        <button
          type="submit"
          disabled={loading || !agreed}
          className="w-full bg-indigo-600 text-white text-sm font-semibold rounded-xl px-6 py-3 hover:bg-indigo-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {loading ? "Mengirim..." : "Kirim Pengajuan Admin Desa"}
        </button>
      </form>
    </div>
  );
}
