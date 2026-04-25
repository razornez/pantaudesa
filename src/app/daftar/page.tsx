"use client";

import { useState, useRef, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import * as Sentry from "@sentry/nextjs";
import {
  ArrowRight, Check, User, AtSign, FileText,
  RotateCw, Camera, AlertTriangle, RefreshCw, LogIn,
} from "lucide-react";
import { ASSETS } from "@/lib/assets";

// ─── Types ────────────────────────────────────────────────────────────────────

type Step = "info" | "avatar" | "done";

interface FormData {
  nama:      string;
  username:  string;
  bio:       string;
  avatarUrl?: string;
}

interface FieldErrors {
  nama?:     string;
  username?: string;
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

function slugify(str: string) {
  return str.toLowerCase()
    .replace(/\s+/g, "_")
    .replace(/[^a-z0-9_]/g, "")
    .slice(0, 20);
}

function parseApiError(status: number, message: string): { message: string; action: string } {
  if (status === 401)
    return {
      message: "Sesi login tidak ditemukan.",
      action:  "Kamu perlu login terlebih dahulu. Klik link masuk yang dikirim ke emailmu, lalu buka halaman ini lagi.",
    };
  if (status === 409 || message.toLowerCase().includes("username"))
    return {
      message: "Username sudah dipakai orang lain.",
      action:  "Coba username yang berbeda, misalnya tambahkan angka di belakangnya.",
    };
  if (status === 400)
    return {
      message: "Data yang dimasukkan tidak valid.",
      action:  message,
    };
  return {
    message: "Server sedang bermasalah.",
    action:  "Coba lagi dalam beberapa menit. Jika masih gagal, hubungi tim kami.",
  };
}

// ─── Progress dots ────────────────────────────────────────────────────────────

function ProgressDots({ step }: { step: Step }) {
  const steps: Step[] = ["info", "avatar", "done"];
  const idx           = steps.indexOf(step);
  return (
    <div className="flex items-center justify-center gap-2 mb-8">
      {steps.slice(0, -1).map((_, i) => (
        <div key={i} className="flex items-center gap-2">
          <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-black transition-all ${
            i < idx   ? "bg-indigo-600 text-white" :
            i === idx ? "bg-indigo-100 text-indigo-600 ring-2 ring-indigo-400 ring-offset-1" :
                        "bg-slate-100 text-slate-400"
          }`}>
            {i < idx ? <Check size={13} /> : i + 1}
          </div>
          {i < 1 && <div className={`w-8 h-0.5 rounded-full ${i < idx ? "bg-indigo-400" : "bg-slate-200"}`} />}
        </div>
      ))}
    </div>
  );
}

// ─── Error box ────────────────────────────────────────────────────────────────

function ErrorBox({ message, action }: { message: string; action: string }) {
  return (
    <div className="bg-rose-50 border border-rose-200 rounded-2xl p-4">
      <div className="flex items-start gap-2.5">
        <AlertTriangle size={16} className="text-rose-500 flex-shrink-0 mt-0.5" />
        <div>
          <p className="text-sm font-semibold text-rose-800">{message}</p>
          <p className="text-xs text-rose-600 mt-0.5 leading-relaxed">{action}</p>
        </div>
      </div>
    </div>
  );
}

// ─── Loading screen ───────────────────────────────────────────────────────────

function LoadingScreen() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-white">
      <div className="text-center space-y-3">
        <RotateCw size={24} className="animate-spin text-indigo-400 mx-auto" />
        <p className="text-sm text-slate-400">Memverifikasi sesi...</p>
      </div>
    </div>
  );
}

// ─── Not logged in screen ─────────────────────────────────────────────────────

function NeedLoginScreen() {
  return (
    <div className="min-h-screen flex items-center justify-center px-4 bg-white">
      <div className="max-w-sm w-full text-center space-y-5">
        <div className="w-16 h-16 rounded-3xl bg-amber-100 flex items-center justify-center mx-auto">
          <LogIn size={28} className="text-amber-600" />
        </div>
        <div>
          <h2 className="text-xl font-black text-slate-900">Login dulu yuk</h2>
          <p className="text-sm text-slate-500 mt-2 leading-relaxed">
            Untuk melengkapi profil, kamu perlu masuk dulu menggunakan email.
            Kami akan kirimkan link masuk — tidak perlu password.
          </p>
        </div>
        <Link
          href="/login"
          className="inline-flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white font-bold px-6 py-3 rounded-xl text-sm transition-colors shadow-md shadow-indigo-200"
        >
          <LogIn size={14} /> Masuk dengan Email
        </Link>
        <p className="text-xs text-slate-400">
          Sudah pernah daftar?{" "}
          <Link href="/login" className="text-indigo-600 font-semibold hover:underline">
            Masuk di sini
          </Link>
        </p>
      </div>
    </div>
  );
}

// ─── Main ─────────────────────────────────────────────────────────────────────

export default function DaftarPage() {
  const router                      = useRouter();
  const { data: session, status }   = useSession();
  const fileRef                     = useRef<HTMLInputElement>(null);

  const [step,    setStep]    = useState<Step>("info");
  const [loading, setLoading] = useState(false);
  const [errors,  setErrors]  = useState<FieldErrors>({});
  const [apiErr,  setApiErr]  = useState<{ message: string; action: string } | null>(null);

  const [form, setForm] = useState<FormData>({
    nama:     "",
    username: "",
    bio:      "",
  });

  // Pre-fill nama dari session jika tersedia
  useEffect(() => {
    if (session?.user?.name && !form.nama) {
      const nama = session.user.name;
      setForm(f => ({ ...f, nama, username: f.username || slugify(nama) }));
    }
  }, [session]);  // eslint-disable-line react-hooks/exhaustive-deps

  // Jika session sudah ada dan profile sudah lengkap, langsung ke profil
  useEffect(() => {
    if (status === "authenticated" && session?.user?.username) {
      router.replace("/profil/saya");
    }
  }, [status, session, router]);

  // Tampilkan loading saat session sedang dicek
  if (status === "loading") return <LoadingScreen />;

  // Tampilkan layar login jika belum login
  if (status === "unauthenticated") return <NeedLoginScreen />;

  const set = (k: keyof FormData, v: string) => {
    setForm(f => ({ ...f, [k]: v }));
    setErrors(e => ({ ...e, [k]: undefined }));
    setApiErr(null);
  };

  const handleNamaChange = (v: string) => {
    set("nama", v);
    if (!form.username || form.username === slugify(form.nama)) {
      set("username", slugify(v));
    }
  };

  // ── Step 1: simpan info ke DB ──────────────────────────────────────────
  const handleInfoSubmit = async (e: React.SyntheticEvent) => {
    e.preventDefault();
    const errs: FieldErrors = {};
    if (!form.nama.trim())     errs.nama     = "Nama tidak boleh kosong.";
    if (!form.username.trim()) errs.username = "Username tidak boleh kosong.";
    if (!/^[a-z0-9_]{3,20}$/.test(form.username))
      errs.username = "Hanya huruf kecil, angka, underscore. 3–20 karakter.";
    if (Object.keys(errs).length) return setErrors(errs);

    setLoading(true);
    setApiErr(null);
    try {
      const res = await fetch("/api/users/register", {
        method:  "POST",
        headers: { "Content-Type": "application/json" },
        body:    JSON.stringify({
          username: form.username.trim(),
          nama:     form.nama.trim(),
          bio:      form.bio.trim() || null,
        }),
      });

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        const parsed = parseApiError(res.status, data.error ?? "");
        if (res.status === 409 || (data.error ?? "").includes("username")) {
          setErrors({ username: "Username sudah dipakai. Coba yang lain." });
        } else {
          setApiErr(parsed);
        }
        Sentry.captureMessage("register failed", {
          level: "warning",
          extra: { status: res.status, error: data.error },
        });
        return;
      }

      setStep("avatar");
    } catch (err) {
      Sentry.captureException(err);
      setApiErr({
        message: "Koneksi bermasalah.",
        action:  "Periksa koneksi internet kamu dan coba lagi.",
      });
    } finally {
      setLoading(false);
    }
  };

  // ── Step 2: upload avatar (opsional) → selesai ────────────────────────
  const handleAvatarFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0];
    if (f) set("avatarUrl", URL.createObjectURL(f));
  };

  const handleFinish = async () => {
    setLoading(true);
    try {
      if (form.avatarUrl) {
        await fetch("/api/users/me", {
          method:  "PATCH",
          headers: { "Content-Type": "application/json" },
          body:    JSON.stringify({ avatarUrl: form.avatarUrl }),
        });
      }
    } catch (err) {
      // Avatar upload failing is non-critical — continue anyway
      Sentry.captureException(err);
    } finally {
      setLoading(false);
    }
    setStep("done");
    await new Promise(r => setTimeout(r, 1000));
    router.push("/profil/saya");
  };

  return (
    <div className="min-h-screen flex">

      {/* Sisi kiri */}
      <div className="hidden lg:flex flex-col flex-1 relative bg-gradient-to-br from-violet-600 via-indigo-600 to-indigo-700 overflow-hidden p-10">
        <div className="absolute inset-0 opacity-10">
          <Image src={ASSETS.textureLight} alt="" fill className="object-cover" />
        </div>
        <div className="relative z-10 flex flex-col h-full">
          <Link href="/" className="flex items-center gap-2.5 w-fit">
            <div className="w-8 h-8 rounded-lg overflow-hidden shadow-sm">
              <Image src={ASSETS.logo} alt="PantauDesa" width={32} height={32} className="w-full h-full object-cover" />
            </div>
            <span className="font-bold text-lg text-white">Pantau<span className="text-indigo-200">Desa</span></span>
          </Link>

          <div className="flex-1 flex flex-col justify-center max-w-sm">
            <div className="text-4xl mb-5">🏘️</div>
            <h1 className="text-3xl font-black text-white leading-tight mb-4">
              Suaramu bisa<br />mengubah desamu.
            </h1>
            <p className="text-indigo-200 text-sm leading-relaxed mb-8">
              Bergabung sebagai warga, pantau anggaran desa, dan berikan suara yang dipercaya oleh warga lain.
            </p>
            {[
              { emoji: "📢", text: "Laporkan masalah di desamu" },
              { emoji: "✅", text: "Verifikasi laporan warga lain" },
              { emoji: "🏆", text: "Bangun reputasi sebagai suara terpercaya" },
              { emoji: "🔔", text: "Dapatkan notifikasi respons desa" },
            ].map(f => (
              <div key={f.text} className="flex items-center gap-3 mb-3">
                <span className="text-lg">{f.emoji}</span>
                <span className="text-sm text-indigo-100">{f.text}</span>
              </div>
            ))}
          </div>

          <p className="text-indigo-300 text-xs">
            Sudah punya akun?{" "}
            <Link href="/login" className="text-white font-semibold hover:underline">Masuk di sini</Link>
          </p>
        </div>
      </div>

      {/* Sisi kanan — form */}
      <div className="flex-1 lg:max-w-md flex flex-col justify-center px-6 sm:px-10 py-12 bg-white">

        {/* Mobile header */}
        <div className="lg:hidden flex items-center justify-between mb-8">
          <Link href="/" className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg overflow-hidden">
              <Image src={ASSETS.logo} alt="PantauDesa" width={28} height={28} className="w-full h-full object-cover" />
            </div>
            <span className="font-bold text-slate-800">Pantau<span className="text-indigo-600">Desa</span></span>
          </Link>
          <Link href="/login" className="text-xs text-indigo-600 font-semibold">Masuk</Link>
        </div>

        {step !== "done" && <ProgressDots step={step} />}

        {/* ── Step 1: Info ────────────────────────────────────────────────── */}
        {step === "info" && (
          <div className="space-y-5">
            <div>
              <h2 className="text-2xl font-black text-slate-900">Lengkapi Profilmu</h2>
              <p className="text-sm text-slate-500 mt-1">
                Masuk sebagai{" "}
                <span className="font-semibold text-slate-700">{session?.user?.email}</span>
              </p>
            </div>

            {apiErr && (
              <ErrorBox message={apiErr.message} action={apiErr.action} />
            )}

            <form onSubmit={handleInfoSubmit} className="space-y-4">
              {/* Nama */}
              <div>
                <label className="text-xs font-semibold text-slate-600 block mb-1.5">
                  Nama Lengkap <span className="text-rose-400">*</span>
                </label>
                <div className="relative">
                  <User size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input
                    type="text" value={form.nama}
                    onChange={e => handleNamaChange(e.target.value)}
                    placeholder="Nama aslimu"
                    className={`w-full pl-10 pr-4 py-2.5 text-sm bg-slate-50 border rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-300 transition ${
                      errors.nama ? "border-rose-300 bg-rose-50" : "border-slate-200 focus:border-indigo-400"
                    }`}
                  />
                </div>
                {errors.nama && (
                  <p className="text-xs text-rose-600 mt-1 flex items-center gap-1">
                    <AlertTriangle size={10} /> {errors.nama}
                  </p>
                )}
              </div>

              {/* Username */}
              <div>
                <label className="text-xs font-semibold text-slate-600 block mb-1.5">
                  Username <span className="text-rose-400">*</span>
                </label>
                <div className="relative">
                  <AtSign size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input
                    type="text" value={form.username}
                    onChange={e => set("username", e.target.value.toLowerCase().replace(/[^a-z0-9_]/g, ""))}
                    placeholder="username_kamu"
                    maxLength={20}
                    className={`w-full pl-10 pr-4 py-2.5 text-sm bg-slate-50 border rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-300 transition font-mono ${
                      errors.username ? "border-rose-300 bg-rose-50" : "border-slate-200 focus:border-indigo-400"
                    }`}
                  />
                </div>
                {errors.username ? (
                  <p className="text-xs text-rose-600 mt-1 flex items-center gap-1">
                    <AlertTriangle size={10} /> {errors.username}
                  </p>
                ) : (
                  <p className="text-[10px] text-slate-400 mt-1">
                    Huruf kecil, angka, underscore · <strong>Tidak bisa diubah setelah disimpan</strong>
                  </p>
                )}
              </div>

              {/* Bio */}
              <div>
                <label className="text-xs font-semibold text-slate-500 block mb-1.5">
                  Bio <span className="font-normal text-slate-400">(opsional)</span>
                </label>
                <div className="relative">
                  <FileText size={14} className="absolute left-3.5 top-3 text-slate-400" />
                  <textarea
                    value={form.bio}
                    onChange={e => set("bio", e.target.value)}
                    placeholder="Ceritakan sedikit tentang dirimu..."
                    maxLength={160} rows={2}
                    className="w-full pl-10 pr-4 py-2.5 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-300 focus:border-indigo-400 transition resize-none"
                  />
                </div>
                <p className="text-[10px] text-slate-400 mt-1 text-right">{form.bio.length}/160</p>
              </div>

              <button
                type="submit" disabled={loading}
                className="w-full flex items-center justify-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-3 rounded-xl transition-all shadow-md shadow-indigo-200 disabled:opacity-50"
              >
                {loading
                  ? <><RotateCw size={16} className="animate-spin" /> Menyimpan...</>
                  : <><span>Lanjut</span><ArrowRight size={15} /></>
                }
              </button>
            </form>
          </div>
        )}

        {/* ── Step 2: Avatar ──────────────────────────────────────────────── */}
        {step === "avatar" && (
          <div className="space-y-6">
            <div>
              <h2 className="text-2xl font-black text-slate-900">Tambah Foto Profil</h2>
              <p className="text-sm text-slate-500 mt-1">Opsional — kamu bisa melewatinya sekarang.</p>
            </div>

            <div className="flex flex-col items-center gap-5">
              <div className="relative">
                {form.avatarUrl ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={form.avatarUrl} alt="Avatar" className="w-24 h-24 rounded-full object-cover ring-4 ring-indigo-100" />
                ) : (
                  <div className="w-24 h-24 rounded-full bg-gradient-to-br from-indigo-400 to-violet-500 flex items-center justify-center ring-4 ring-indigo-100">
                    <span className="text-3xl font-black text-white">{form.nama.charAt(0).toUpperCase()}</span>
                  </div>
                )}
                <button
                  type="button"
                  onClick={() => fileRef.current?.click()}
                  className="absolute bottom-0 right-0 w-8 h-8 rounded-full bg-indigo-600 border-2 border-white flex items-center justify-center shadow hover:bg-indigo-700 transition-colors"
                >
                  <Camera size={14} className="text-white" />
                </button>
                <input ref={fileRef} type="file" accept="image/*" onChange={handleAvatarFile} className="hidden" />
              </div>

              <div className="text-center">
                <p className="text-base font-black text-slate-900">{form.nama}</p>
                <p className="text-sm text-slate-400">@{form.username}</p>
                {form.bio && <p className="text-xs text-slate-500 mt-1 max-w-xs">{form.bio}</p>}
              </div>
            </div>

            <div className="space-y-2.5">
              <button
                onClick={handleFinish} disabled={loading}
                className="w-full flex items-center justify-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-3 rounded-xl transition-all shadow-md shadow-indigo-200 disabled:opacity-50"
              >
                {loading
                  ? <><RotateCw size={16} className="animate-spin" /> Menyimpan...</>
                  : "Selesai & Masuk ke Profil"
                }
              </button>
              <button
                type="button" onClick={handleFinish} disabled={loading}
                className="w-full text-xs text-slate-400 hover:text-slate-600 py-2 transition-colors"
              >
                Lewati, tambah foto nanti
              </button>
            </div>
          </div>
        )}

        {/* ── Step 3: Done ────────────────────────────────────────────────── */}
        {step === "done" && (
          <div className="flex flex-col items-center text-center gap-5">
            <div className="w-20 h-20 rounded-3xl bg-emerald-100 flex items-center justify-center">
              <span className="text-4xl">🎉</span>
            </div>
            <div>
              <h2 className="text-2xl font-black text-slate-900">
                Selamat datang, {form.nama.split(" ")[0]}!
              </h2>
              <p className="text-sm text-slate-500 mt-1">Akunmu sudah aktif. Mengalihkan ke profil...</p>
            </div>
            <div className="w-8 h-8 rounded-full border-4 border-indigo-200 border-t-indigo-600 animate-spin" />
          </div>
        )}

        {step === "info" && (
          <div className="mt-8 text-center">
            <p className="text-xs text-slate-400">
              Sudah punya akun?{" "}
              <Link href="/login" className="text-indigo-600 font-semibold hover:underline">Masuk</Link>
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
