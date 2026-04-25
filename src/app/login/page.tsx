"use client";

import { useState } from "react";
import { signIn } from "next-auth/react";
import Image from "next/image";
import Link from "next/link";
import {
  Mail, ArrowRight, RotateCw, ShieldCheck, Sparkles,
} from "lucide-react";
import { ASSETS } from "@/lib/assets";

type Step = "email" | "sent";

export default function LoginPage() {
  const [step,     setStep]     = useState<Step>("email");
  const [email,    setEmail]    = useState("");
  const [emailErr, setEmailErr] = useState("");
  const [loading,  setLoading]  = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setEmailErr("");
    const trimmed = email.toLowerCase().trim();
    if (!trimmed) return setEmailErr("Email tidak boleh kosong.");

    setLoading(true);
    const res = await signIn("resend", { email: trimmed, redirect: false });
    setLoading(false);

    if (res?.error) {
      setEmailErr("Gagal mengirim kode. Coba lagi.");
      return;
    }
    setStep("sent");
  };

  return (
    <div className="min-h-screen flex">

      {/* ── Sisi kiri — branding ─────────────────────────────────────────── */}
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
              Masukkan email kamu dan kami kirimkan magic link — klik link-nya, langsung masuk. Tidak ada password yang perlu diingat.
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

        {step === "email" && (
          <div className="space-y-5">
            <div>
              <h2 className="text-2xl font-black text-slate-900">Masuk</h2>
              <p className="text-sm text-slate-500 mt-1">Tidak perlu password — kami kirimkan magic link ke emailmu.</p>
            </div>

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
                    onChange={e => { setEmail(e.target.value); setEmailErr(""); }}
                    placeholder="email@kamu.com"
                    className={`w-full pl-10 pr-4 py-3 text-sm bg-slate-50 border rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-300 focus:border-indigo-400 transition ${
                      emailErr ? "border-rose-300 bg-rose-50" : "border-slate-200"
                    }`}
                  />
                </div>
                {emailErr && <p className="text-xs text-rose-600 mt-1.5">⚠️ {emailErr}</p>}
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full flex items-center justify-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-3 rounded-xl transition-all shadow-md shadow-indigo-200 disabled:opacity-50"
              >
                {loading
                  ? <RotateCw size={16} className="animate-spin" />
                  : <><span>Kirim Magic Link</span><ArrowRight size={15} /></>
                }
              </button>
            </form>

            <p className="text-center text-xs text-slate-400">
              Link berlaku 10 menit · Tidak ada password yang perlu diingat
            </p>
          </div>
        )}

        {step === "sent" && (
          <div className="space-y-5 text-center">
            <div className="w-16 h-16 rounded-3xl bg-indigo-100 flex items-center justify-center mx-auto">
              <Sparkles size={32} className="text-indigo-500" />
            </div>
            <div>
              <h2 className="text-2xl font-black text-slate-900">Cek emailmu!</h2>
              <p className="text-sm text-slate-500 mt-2">
                Kami kirimkan magic link ke{" "}
                <span className="font-semibold text-slate-700">{email}</span>.<br />
                Klik link di email untuk masuk.
              </p>
            </div>
            <div className="bg-amber-50 border border-amber-200 rounded-2xl px-4 py-3 text-xs text-amber-700 text-left">
              <p className="font-bold mb-1">Tidak menerima email?</p>
              <ul className="space-y-0.5 list-disc list-inside">
                <li>Cek folder spam / promotions</li>
                <li>Pastikan email yang dimasukkan benar</li>
                <li>
                  <button
                    onClick={() => { setStep("email"); setEmail(""); }}
                    className="underline font-semibold hover:text-amber-900"
                  >
                    Coba kirim ulang
                  </button>
                </li>
              </ul>
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
