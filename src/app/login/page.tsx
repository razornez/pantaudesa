"use client";

import { useState } from "react";
import { signIn } from "next-auth/react";
import * as Sentry from "@sentry/nextjs";
import Image from "next/image";
import Link from "next/link";
import {
  Mail, ArrowRight, RotateCw, ShieldCheck, Sparkles,
  AlertTriangle, RefreshCw,
} from "lucide-react";
import { ASSETS } from "@/lib/assets";

type Step = "email" | "sent";

// ─── Terjemahkan kode error NextAuth ke pesan yang user pahami ────────────────

function parseSignInError(error: unknown): { message: string; action: string } {
  const str = String(error ?? "").toLowerCase();

  if (str.includes("configuration") || str.includes("server"))
    return {
      message: "Server sedang bermasalah.",
      action:  "Coba lagi dalam beberapa menit. Jika masih gagal, hubungi tim kami.",
    };
  if (str.includes("email") || str.includes("send") || str.includes("resend"))
    return {
      message: "Email gagal terkirim.",
      action:  "Pastikan alamat email benar dan coba lagi. Periksa folder spam jika sudah mencoba beberapa kali.",
    };
  if (str.includes("rate") || str.includes("limit") || str.includes("too many"))
    return {
      message: "Terlalu banyak percobaan.",
      action:  "Tunggu beberapa menit sebelum mencoba lagi.",
    };
  if (str.includes("network") || str.includes("fetch") || str.includes("connect"))
    return {
      message: "Koneksi internet bermasalah.",
      action:  "Periksa koneksi internet kamu dan coba lagi.",
    };

  return {
    message: "Terjadi kesalahan yang tidak diketahui.",
    action:  "Coba lagi, atau hubungi kami jika masalah terus berlanjut.",
  };
}

// ─── Error box ────────────────────────────────────────────────────────────────

function ErrorBox({ message, action, onRetry }: { message: string; action: string; onRetry: () => void }) {
  return (
    <div className="bg-rose-50 border border-rose-200 rounded-2xl p-4 space-y-3">
      <div className="flex items-start gap-2.5">
        <AlertTriangle size={16} className="text-rose-500 flex-shrink-0 mt-0.5" />
        <div>
          <p className="text-sm font-semibold text-rose-800">{message}</p>
          <p className="text-xs text-rose-600 mt-0.5 leading-relaxed">{action}</p>
        </div>
      </div>
      <button
        type="button"
        onClick={onRetry}
        className="inline-flex items-center gap-1.5 text-xs font-semibold text-rose-700 hover:text-rose-900 bg-rose-100 hover:bg-rose-200 px-3 py-1.5 rounded-lg transition-colors"
      >
        <RefreshCw size={11} /> Coba lagi
      </button>
    </div>
  );
}

// ─── Main ─────────────────────────────────────────────────────────────────────

export default function LoginPage() {
  const [step,     setStep]     = useState<Step>("email");
  const [email,    setEmail]    = useState("");
  const [error,    setError]    = useState<{ message: string; action: string } | null>(null);
  const [loading,  setLoading]  = useState(false);

  const handleSubmit = async (e: React.SyntheticEvent) => {
    e.preventDefault();
    setError(null);
    const trimmed = email.toLowerCase().trim();
    if (!trimmed) {
      setError({ message: "Email tidak boleh kosong.", action: "Masukkan alamat email kamu." });
      return;
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmed)) {
      setError({ message: "Format email tidak valid.", action: "Contoh: nama@gmail.com" });
      return;
    }

    setLoading(true);
    try {
      const res = await signIn("resend", {
        email:       trimmed,
        redirect:    false,
        callbackUrl: "/",
      });

      if (res?.error) {
        Sentry.captureMessage(`signIn error: ${res.error}`, { level: "warning", extra: { email: trimmed } });
        setError(parseSignInError(res.error));
        return;
      }

      setStep("sent");
    } catch (err) {
      Sentry.captureException(err);
      setError(parseSignInError(err));
    } finally {
      setLoading(false);
    }
  };

  const reset = () => { setError(null); setStep("email"); };

  return (
    <div className="min-h-screen flex">

      {/* ── Sisi kiri — branding ──────────────────────────────────────────── */}
      <div className="hidden lg:flex flex-col flex-1 relative bg-gradient-to-br from-indigo-700 via-indigo-600 to-violet-700 overflow-hidden p-10">
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
            <div className="inline-flex items-center gap-2 bg-white/15 rounded-full px-3 py-1.5 text-xs font-semibold text-white mb-6 w-fit">
              <ShieldCheck size={13} /> Masuk dengan aman — tanpa password
            </div>
            <h1 className="text-3xl font-black text-white leading-tight mb-4">
              Suaramu penting<br />untuk desamu.
            </h1>
            <p className="text-indigo-200 text-sm leading-relaxed">
              Masukkan email kamu dan kami kirimkan link masuk — klik link-nya, langsung masuk. Tidak ada password yang perlu diingat.
            </p>
          </div>

          <div className="flex justify-end opacity-70">
            <Image src={ASSETS.mascotStanding} alt="Pak Waspada" width={100} height={140} className="object-contain" />
          </div>
        </div>
      </div>

      {/* ── Sisi kanan — form ─────────────────────────────────────────────── */}
      <div className="flex-1 lg:max-w-md flex flex-col justify-center px-6 sm:px-10 py-12 bg-white">

        {/* Mobile logo */}
        <div className="lg:hidden mb-8">
          <Link href="/" className="flex items-center gap-2 w-fit">
            <div className="w-7 h-7 rounded-lg overflow-hidden">
              <Image src={ASSETS.logo} alt="PantauDesa" width={28} height={28} className="w-full h-full object-cover" />
            </div>
            <span className="font-bold text-slate-800">Pantau<span className="text-indigo-600">Desa</span></span>
          </Link>
        </div>

        {/* ── Step: email ───────────────────────────────────────────────── */}
        {step === "email" && (
          <div className="space-y-5">
            <div>
              <h2 className="text-2xl font-black text-slate-900">Masuk</h2>
              <p className="text-sm text-slate-500 mt-1">
                Tidak perlu password — kami kirimkan link masuk ke emailmu.
              </p>
            </div>

            {error && (
              <ErrorBox message={error.message} action={error.action} onRetry={reset} />
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="text-xs font-semibold text-slate-600 block mb-1.5">
                  Email kamu
                </label>
                <div className="relative">
                  <Mail size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input
                    type="email"
                    value={email}
                    onChange={e => { setEmail(e.target.value); setError(null); }}
                    placeholder="email@kamu.com"
                    className={`w-full pl-10 pr-4 py-3 text-sm bg-slate-50 border rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-300 focus:border-indigo-400 transition ${
                      error ? "border-rose-300 bg-rose-50" : "border-slate-200"
                    }`}
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full flex items-center justify-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-3 rounded-xl transition-all shadow-md shadow-indigo-200 disabled:opacity-50"
              >
                {loading
                  ? <><RotateCw size={16} className="animate-spin" /> Mengirim...</>
                  : <><span>Kirim Link Masuk</span><ArrowRight size={15} /></>
                }
              </button>
            </form>

            <p className="text-center text-xs text-slate-400">
              Link berlaku 10 menit · Tidak ada password yang perlu diingat
            </p>
          </div>
        )}

        {/* ── Step: sent ────────────────────────────────────────────────── */}
        {step === "sent" && (
          <div className="space-y-5 text-center">
            <div className="w-16 h-16 rounded-3xl bg-indigo-100 flex items-center justify-center mx-auto">
              <Sparkles size={32} className="text-indigo-500" />
            </div>
            <div>
              <h2 className="text-2xl font-black text-slate-900">Cek emailmu!</h2>
              <p className="text-sm text-slate-500 mt-2 leading-relaxed">
                Kami mengirimkan link masuk ke{" "}
                <span className="font-semibold text-slate-700">{email}</span>.
                <br />Klik link di email untuk langsung masuk.
              </p>
            </div>
            <div className="bg-amber-50 border border-amber-200 rounded-2xl px-4 py-3 text-xs text-amber-700 text-left space-y-1.5">
              <p className="font-bold">Tidak menerima email?</p>
              <ul className="space-y-1 list-disc list-inside">
                <li>Periksa folder <strong>Spam</strong> atau <strong>Promotions</strong></li>
                <li>Tunggu 1–2 menit, email kadang terlambat masuk</li>
                <li>Pastikan alamat email yang dimasukkan benar</li>
              </ul>
              <button
                onClick={reset}
                className="mt-1 underline font-semibold hover:text-amber-900 transition-colors"
              >
                Kirim ulang ke email lain
              </button>
            </div>
          </div>
        )}

        <div className="mt-10 pt-6 border-t border-slate-100">
          <p className="text-xs text-slate-400 text-center">
            Belum punya akun?{" "}
            <Link href="/daftar" className="text-indigo-600 font-semibold hover:underline">
              Daftar gratis
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
