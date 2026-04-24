"use client";

import { useEffect, useState, useRef } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import {
  ArrowLeft, Upload, FileText, CheckCircle2, Clock,
  XCircle, X, AlertTriangle, CloudUpload, Eye,
} from "lucide-react";
import { useAuth } from "@/lib/auth-context";
import { MOCK_UPLOADS, UploadedDoc, DocStatus } from "@/lib/auth-mock";
import { ASSETS } from "@/lib/assets";

// ─── Status badge ─────────────────────────────────────────────────────────────

const STATUS_CFG: Record<DocStatus, { label: string; icon: React.ElementType; bg: string; text: string; border: string }> = {
  menunggu_review: { label: "Menunggu Review", icon: Clock,        bg: "bg-amber-50",   text: "text-amber-700",   border: "border-amber-200"  },
  disetujui:       { label: "Disetujui",        icon: CheckCircle2, bg: "bg-emerald-50", text: "text-emerald-700", border: "border-emerald-200" },
  ditolak:         { label: "Ditolak",           icon: XCircle,      bg: "bg-rose-50",    text: "text-rose-700",    border: "border-rose-200"    },
};

const DOC_TYPES = ["APBDes", "LPPD", "RKP Desa", "Laporan Realisasi", "Profil Desa", "Dokumen Lainnya"];
const CURRENT_YEAR = new Date().getFullYear();
const YEARS = [CURRENT_YEAR, CURRENT_YEAR - 1, CURRENT_YEAR - 2];

// ─── Upload form ──────────────────────────────────────────────────────────────

function UploadForm({ desaNama, onSuccess }: { desaNama: string; onSuccess: (doc: UploadedDoc) => void }) {
  const [docType,   setDocType]   = useState("");
  const [tahun,     setTahun]     = useState(CURRENT_YEAR);
  const [file,      setFile]      = useState<File | null>(null);
  const [drag,      setDrag]      = useState(false);
  const [uploading, setUploading] = useState(false);
  const [progress,  setProgress]  = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleFile = (f: File) => {
    if (f.size > 10 * 1024 * 1024) return alert("Maksimal ukuran file 10 MB.");
    if (!["application/pdf", "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet", "application/vnd.ms-excel"].includes(f.type) && !f.name.endsWith(".pdf") && !f.name.endsWith(".xlsx")) {
      return alert("Hanya file PDF atau Excel yang diterima.");
    }
    setFile(f);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault(); setDrag(false);
    const f = e.dataTransfer.files[0];
    if (f) handleFile(f);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!file || !docType) return;
    setUploading(true);
    // Simulasi upload progress
    for (let i = 0; i <= 100; i += 10) {
      await new Promise(r => setTimeout(r, 80));
      setProgress(i);
    }
    const newDoc: UploadedDoc = {
      id:         `doc-${Date.now()}`,
      desaId:     "1",
      desaNama,
      jenis:      docType,
      nama:       file.name,
      tahun,
      fileUrl:    URL.createObjectURL(file),
      fileSize:   `${(file.size / 1024 / 1024).toFixed(1)} MB`,
      uploadedAt: new Date(),
      uploadedBy: "Perangkat Desa",
      status:     "menunggu_review",
    };
    setUploading(false);
    setProgress(0);
    setFile(null);
    setDocType("");
    onSuccess(newDoc);
  };

  const canSubmit = !!file && !!docType && !uploading;

  return (
    <form onSubmit={handleSubmit} className="space-y-5">

      {/* Doc type + year */}
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="text-xs font-semibold text-slate-600 block mb-1.5">Jenis Dokumen *</label>
          <select
            value={docType}
            onChange={e => setDocType(e.target.value)}
            className="w-full px-3 py-2.5 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-300 focus:border-indigo-400 transition"
          >
            <option value="">Pilih jenis...</option>
            {DOC_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
          </select>
        </div>
        <div>
          <label className="text-xs font-semibold text-slate-600 block mb-1.5">Tahun</label>
          <select
            value={tahun}
            onChange={e => setTahun(Number(e.target.value))}
            className="w-full px-3 py-2.5 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-300 focus:border-indigo-400 transition"
          >
            {YEARS.map(y => <option key={y} value={y}>{y}</option>)}
          </select>
        </div>
      </div>

      {/* Drop zone */}
      <div>
        <label className="text-xs font-semibold text-slate-600 block mb-1.5">File Dokumen *</label>
        <input ref={inputRef} type="file" accept=".pdf,.xlsx,.xls" onChange={e => e.target.files?.[0] && handleFile(e.target.files[0])} className="hidden" />

        {!file ? (
          <button
            type="button"
            onClick={() => inputRef.current?.click()}
            onDragOver={e => { e.preventDefault(); setDrag(true); }}
            onDragLeave={() => setDrag(false)}
            onDrop={handleDrop}
            className={`w-full border-2 border-dashed rounded-2xl p-8 flex flex-col items-center gap-3 transition-all ${
              drag ? "border-indigo-400 bg-indigo-50 scale-[1.01]" : "border-slate-200 hover:border-indigo-300 hover:bg-slate-50"
            }`}
          >
            <div className={`w-12 h-12 rounded-2xl flex items-center justify-center transition-colors ${drag ? "bg-indigo-100" : "bg-slate-100"}`}>
              <CloudUpload size={22} className={drag ? "text-indigo-600" : "text-slate-400"} />
            </div>
            <div className="text-center">
              <p className="text-sm font-semibold text-slate-700">Seret file ke sini atau klik untuk pilih</p>
              <p className="text-xs text-slate-400 mt-0.5">PDF atau Excel · Maksimal 10 MB</p>
            </div>
          </button>
        ) : (
          <div className="flex items-center gap-3 bg-indigo-50 border border-indigo-200 rounded-2xl px-4 py-3">
            <div className="w-10 h-10 rounded-xl bg-indigo-100 flex items-center justify-center flex-shrink-0">
              <FileText size={18} className="text-indigo-600" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold text-slate-800 truncate">{file.name}</p>
              <p className="text-[10px] text-slate-400">{(file.size / 1024 / 1024).toFixed(1)} MB</p>
            </div>
            <button type="button" onClick={() => setFile(null)} className="text-slate-400 hover:text-rose-500 transition-colors flex-shrink-0">
              <X size={16} />
            </button>
          </div>
        )}
      </div>

      {/* Progress bar */}
      {uploading && (
        <div className="space-y-2">
          <div className="flex justify-between text-xs text-slate-500">
            <span>Mengunggah...</span>
            <span className="font-bold">{progress}%</span>
          </div>
          <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
            <div className="h-full bg-indigo-500 rounded-full transition-all duration-100" style={{ width: `${progress}%` }} />
          </div>
        </div>
      )}

      {/* Info box */}
      <div className="flex items-start gap-2.5 bg-amber-50 border border-amber-200 rounded-xl px-3 py-2.5">
        <AlertTriangle size={13} className="text-amber-500 mt-0.5 flex-shrink-0" />
        <p className="text-xs text-amber-700 leading-relaxed">
          Dokumen akan ditinjau oleh tim PantauDesa sebelum ditampilkan ke publik. Proses review biasanya 1–2 hari kerja.
        </p>
      </div>

      <button
        type="submit"
        disabled={!canSubmit}
        className="w-full flex items-center justify-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-3 rounded-xl transition-all shadow-md shadow-indigo-200 disabled:opacity-40 disabled:cursor-not-allowed"
      >
        <Upload size={15} />
        {uploading ? "Mengunggah..." : "Unggah Dokumen"}
      </button>
    </form>
  );
}

// ─── Main ─────────────────────────────────────────────────────────────────────

export default function DokumenPage() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const [docs, setDocs] = useState<UploadedDoc[]>([]);
  const [successId, setSuccessId] = useState<string | null>(null);

  useEffect(() => {
    if (!loading && (!user || user.role !== "desa")) router.push("/login");
  }, [user, loading, router]);

  useEffect(() => {
    if (user) setDocs(MOCK_UPLOADS.filter(d => d.desaId === user.desaId));
  }, [user]);

  if (loading || !user) return null;

  const handleSuccess = (doc: UploadedDoc) => {
    setDocs(prev => [doc, ...prev]);
    setSuccessId(doc.id);
    setTimeout(() => setSuccessId(null), 4000);
  };

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Header */}
      <header className="bg-white border-b border-slate-100 sticky top-0 z-30">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 h-14 flex items-center gap-3">
          <Link href="/desa-admin" className="p-2 rounded-xl hover:bg-slate-100 transition-colors">
            <ArrowLeft size={16} className="text-slate-500" />
          </Link>
          <div className="w-px h-4 bg-slate-200" />
          <div className="flex items-center gap-2">
            <Image src={ASSETS.logo} alt="PantauDesa" width={24} height={24} className="rounded-lg" />
            <p className="text-sm font-bold text-slate-700">Dokumen Desa</p>
          </div>
        </div>
      </header>

      <div className="max-w-5xl mx-auto px-4 sm:px-6 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">

          {/* Form kiri */}
          <div className="lg:col-span-2 space-y-4">
            <div>
              <h1 className="text-lg font-black text-slate-900">Unggah Dokumen</h1>
              <p className="text-xs text-slate-500 mt-0.5">APBDes, LPPD, RKP, dan dokumen resmi lainnya</p>
            </div>
            <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5">
              <UploadForm desaNama={user.desaNama ?? "Desamu"} onSuccess={handleSuccess} />
            </div>
          </div>

          {/* Daftar dokumen kanan */}
          <div className="lg:col-span-3 space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-base font-bold text-slate-800">Riwayat Unggahan</h2>
              <span className="text-xs text-slate-400">{docs.length} dokumen</span>
            </div>

            {/* Success toast */}
            {successId && (
              <div className="flex items-center gap-2.5 bg-emerald-50 border border-emerald-200 rounded-2xl px-4 py-3 animate-fade-up">
                <CheckCircle2 size={16} className="text-emerald-600 flex-shrink-0" />
                <div>
                  <p className="text-sm font-bold text-emerald-800">Dokumen berhasil diunggah!</p>
                  <p className="text-xs text-emerald-600">Sedang menunggu review dari tim PantauDesa.</p>
                </div>
              </div>
            )}

            {docs.length === 0 ? (
              <div className="bg-white rounded-2xl border border-slate-100 p-10 text-center">
                <div className="w-14 h-14 rounded-2xl bg-slate-100 flex items-center justify-center mx-auto mb-3">
                  <FileText size={24} className="text-slate-400" />
                </div>
                <p className="text-sm font-semibold text-slate-600">Belum ada dokumen</p>
                <p className="text-xs text-slate-400 mt-1">Upload dokumen pertama desamu di form sebelah.</p>
              </div>
            ) : (
              <div className="space-y-3">
                {docs.map(doc => {
                  const cfg  = STATUS_CFG[doc.status];
                  const Icon = cfg.icon;
                  return (
                    <div key={doc.id} className={`bg-white rounded-2xl border shadow-sm p-4 transition-all ${
                      doc.id === successId ? "border-emerald-300 ring-2 ring-emerald-100" : "border-slate-100"
                    }`}>
                      <div className="flex items-start gap-3">
                        <div className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 ${cfg.bg}`}>
                          <FileText size={18} className={cfg.text} />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-start justify-between gap-2">
                            <div>
                              <p className="text-sm font-bold text-slate-800 truncate">{doc.nama}</p>
                              <p className="text-[10px] text-slate-400 mt-0.5">{doc.jenis} · {doc.tahun} · {doc.fileSize}</p>
                            </div>
                            <span className={`inline-flex items-center gap-1 text-[10px] font-bold px-2 py-1 rounded-full border flex-shrink-0 ${cfg.bg} ${cfg.text} ${cfg.border}`}>
                              <Icon size={9} /> {cfg.label}
                            </span>
                          </div>

                          {/* Review note jika ditolak */}
                          {doc.status === "ditolak" && doc.reviewNote && (
                            <div className="mt-2 bg-rose-50 border border-rose-100 rounded-xl px-3 py-2">
                              <p className="text-[10px] font-bold text-rose-600 mb-0.5">Catatan Admin:</p>
                              <p className="text-xs text-rose-700">{doc.reviewNote}</p>
                            </div>
                          )}

                          <div className="flex items-center gap-3 mt-2">
                            <p className="text-[10px] text-slate-400">
                              Diunggah {doc.uploadedAt.toLocaleDateString("id-ID", { day: "numeric", month: "short", year: "numeric" })}
                            </p>
                            {doc.status === "disetujui" && (
                              <a href={doc.fileUrl} className="text-[10px] text-indigo-600 font-semibold flex items-center gap-0.5 hover:underline">
                                <Eye size={10} /> Lihat
                              </a>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
