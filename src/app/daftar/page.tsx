"use client";

import { useState, useRef } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import {
  ArrowLeft, ArrowRight, Check, User, Mail,
  AtSign, FileText, RotateCw, Sparkles, Camera,
} from "lucide-react";
import { ASSETS } from "@/lib/assets";
import { MOCK_ACCOUNTS, generateOTP, verifyOTP } from "@/lib/auth-mock";
import { useAuth } from "@/lib/auth-context";
import type { AuthUser } from "@/lib/auth-mock";

// ─── Types ────────────────────────────────────────────────────────────────────

type Step = "info" | "otp" | "avatar" | "done";

interface FormData {
  nama:     string;
  username: string;
  email:    string;
  bio:      string;
  avatarUrl?: string;
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

function isEmailTaken(email: string) {
  return Object.keys(MOCK_ACCOUNTS).includes(email.toLowerCase().trim());
}

function isUsernameTaken(username: string) {
  return Object.values(MOCK_ACCOUNTS).some(
    a => a.username.toLowerCase() === username.toLowerCase().trim()
  );
}

function slugify(str: string) {
  return str.toLowerCase()
    .replace(/\s+/g, "_")
    .replace(/[^a-z0-9_]/g, "")
    .slice(0, 20);
}

// ─── Progress dots ────────────────────────────────────────────────────────────

function ProgressDots({ step }: { step: Step }) {
  const steps: Step[] = ["info", "otp", "avatar", "done"];
  const idx           = steps.indexOf(step);
  return (
    <div className="flex items-center justify-center gap-2 mb-8">
      {steps.slice(0, -1).map((s, i) => (
        <div key={s} className="flex items-center gap-2">
          <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-black transition-all ${
            i < idx  ? "bg-indigo-600 text-white" :
            i === idx? "bg-indigo-100 text-indigo-600 ring-2 ring-indigo-400 ring-offset-1" :
                       "bg-slate-100 text-slate-400"
          }`}>
            {i < idx ? <Check size={13} /> : i + 1}
          </div>
          {i < 2 && <div className={`w-8 h-0.5 rounded-full ${i < idx ? "bg-indigo-400" : "bg-slate-200"}`} />}
        </div>
      ))}
    </div>
  );
}

// ─── OTP Input ────────────────────────────────────────────────────────────────

function OTPInput({ onComplete, disabled }: { onComplete: (v: string) => void; disabled?: boolean }) {
  const [digits, setDigits] = useState(["","","","","",""]);
  // eslint-disable-next-line react-hooks/rules-of-hooks
  const refs = Array.from({ length: 6 }, () => useRef<HTMLInputElement>(null));

  const handleChange = (i: number, val: string) => {
    const v = val.replace(/\D/g, "").slice(-1);
    const next = [...digits]; next[i] = v;
    setDigits(next);
    if (v && i < 5) refs[i + 1].current?.focus();
    if (next.join("").length === 6) onComplete(next.join(""));
  };
  const handleKey = (i: number, e: React.KeyboardEvent) => {
    if (e.key === "Backspace" && !digits[i] && i > 0) refs[i - 1].current?.focus();
  };
  const handlePaste = (e: React.ClipboardEvent) => {
    const text = e.clipboardData.getData("text").replace(/\D/g, "").slice(0, 6);
    if (text.length === 6) { setDigits(text.split("")); onComplete(text); }
    e.preventDefault();
  };

  return (
    <div className="flex gap-2.5 justify-center" onPaste={handlePaste}>
      {digits.map((d, i) => (
        <input
          key={i} ref={refs[i]} type="text" inputMode="numeric"
          maxLength={1} value={d} disabled={disabled}
          onChange={e => handleChange(i, e.target.value)}
          onKeyDown={e => handleKey(i, e)}
          className={`w-11 text-center text-xl font-black rounded-2xl border-2 transition-all outline-none focus:scale-105 disabled:opacity-40 ${
            d ? "border-indigo-500 bg-indigo-50 text-indigo-700"
              : "border-slate-200 bg-white focus:border-indigo-400 focus:bg-indigo-50/50"
          }`}
          style={{ height: 52 }}
        />
      ))}
    </div>
  );
}

// ─── Main ─────────────────────────────────────────────────────────────────────

export default function DaftarPage() {
  const router      = useRouter();
  const { login }   = useAuth();
  const fileRef     = useRef<HTMLInputElement>(null);

  const [step,    setStep]    = useState<Step>("info");
  const [loading, setLoading] = useState(false);
  const [otp,     setOtp]     = useState("");
  const [otpCode, setOtpCode] = useState(""); // mock — hapus di produksi
  const [otpErr,  setOtpErr]  = useState("");
  const [errors,  setErrors]  = useState<Partial<FormData>>({});

  const [form, setForm] = useState<FormData>({
    nama:     "",
    username: "",
    email:    "",
    bio:      "",
  });

  const set = (k: keyof FormData, v: string) => {
    setForm(f => ({ ...f, [k]: v }));
    setErrors(e => ({ ...e, [k]: undefined }));
  };

  // Auto-generate username dari nama
  const handleNamaChange = (v: string) => {
    set("nama", v);
    if (!form.username || form.username === slugify(form.nama)) {
      set("username", slugify(v));
    }
  };

  // ── Step 1: validasi + kirim OTP ──────────────────────────────────────
  const handleInfoSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const errs: Partial<FormData> = {};
    if (!form.nama.trim())      errs.nama     = "Nama tidak boleh kosong.";
    if (!form.username.trim())  errs.username = "Username tidak boleh kosong.";
    if (!/^[a-z0-9_]{3,20}$/.test(form.username))
      errs.username = "Hanya huruf kecil, angka, underscore. 3–20 karakter.";
    if (!form.email.trim())     errs.email    = "Email tidak boleh kosong.";
    if (isEmailTaken(form.email))
      errs.email = "Email sudah terdaftar. Silakan masuk.";
    if (isUsernameTaken(form.username))
      errs.username = "Username sudah dipakai.";
    if (Object.keys(errs).length) return setErrors(errs);

    setLoading(true);
    await new Promise(r => setTimeout(r, 600));
    const code = generateOTP(form.email.toLowerCase().trim());
    setOtpCode(code);
    setLoading(false);
    setStep("otp");
  };

  // ── Step 2: verifikasi OTP ─────────────────────────────────────────────
  const handleOTPComplete = async (code: string) => {
    setOtpErr(""); setLoading(true);
    await new Promise(r => setTimeout(r, 500));
    const valid = verifyOTP(form.email.toLowerCase().trim(), code);
    if (!valid) { setLoading(false); return setOtpErr("Kode salah atau kedaluwarsa."); }
    setLoading(false);
    setStep("avatar");
  };

  // ── Step 3: avatar (opsional) → selesai ────────────────────────────────
  const handleAvatarFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0];
    if (f) set("avatarUrl", URL.createObjectURL(f));
  };

  const handleFinish = async () => {
    setLoading(true);
    await new Promise(r => setTimeout(r, 800));

    const newUser: AuthUser = {
      id:        `w-${Date.now()}`,
      nama:      form.nama.trim(),
      username:  form.username.trim(),
      email:     form.email.toLowerCase().trim(),
      role:      "warga",
      bio:       form.bio.trim() || undefined,
      avatarUrl: form.avatarUrl,
      joinedAt:  new Date(),
    };

    // In production: POST /api/users, here we just log in directly
    login(newUser);
    setStep("done");
    await new Promise(r => setTimeout(r, 1200));
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
          <div className="space-y-5 animate-fade-up">
            <div>
              <h2 className="text-2xl font-black text-slate-900">Buat Akun Warga</h2>
              <p className="text-sm text-slate-500 mt-1">Gratis, tanpa perlu kartu kredit. Hanya butuh email.</p>
            </div>

            <form onSubmit={handleInfoSubmit} className="space-y-4">
              {/* Nama */}
              <div>
                <label className="text-xs font-semibold text-slate-600 block mb-1.5">Nama Lengkap *</label>
                <div className="relative">
                  <User size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input
                    type="text" value={form.nama}
                    onChange={e => handleNamaChange(e.target.value)}
                    placeholder="Nama aslimu"
                    className={`w-full pl-10 pr-4 py-2.5 text-sm bg-slate-50 border rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-300 transition ${errors.nama ? "border-rose-300 bg-rose-50" : "border-slate-200 focus:border-indigo-400"}`}
                  />
                </div>
                {errors.nama && <p className="text-xs text-rose-600 mt-1">⚠️ {errors.nama}</p>}
              </div>

              {/* Username */}
              <div>
                <label className="text-xs font-semibold text-slate-600 block mb-1.5">Username *</label>
                <div className="relative">
                  <AtSign size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input
                    type="text" value={form.username}
                    onChange={e => set("username", e.target.value.toLowerCase().replace(/[^a-z0-9_]/g, ""))}
                    placeholder="username_kamu"
                    maxLength={20}
                    className={`w-full pl-10 pr-4 py-2.5 text-sm bg-slate-50 border rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-300 transition font-mono ${errors.username ? "border-rose-300 bg-rose-50" : "border-slate-200 focus:border-indigo-400"}`}
                  />
                </div>
                {errors.username
                  ? <p className="text-xs text-rose-600 mt-1">⚠️ {errors.username}</p>
                  : <p className="text-[10px] text-slate-400 mt-1">Huruf kecil, angka, underscore · Tidak bisa diubah nanti</p>
                }
              </div>

              {/* Email */}
              <div>
                <label className="text-xs font-semibold text-slate-600 block mb-1.5">Email *</label>
                <div className="relative">
                  <Mail size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input
                    type="email" value={form.email}
                    onChange={e => set("email", e.target.value)}
                    placeholder="email@kamu.com"
                    className={`w-full pl-10 pr-4 py-2.5 text-sm bg-slate-50 border rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-300 transition ${errors.email ? "border-rose-300 bg-rose-50" : "border-slate-200 focus:border-indigo-400"}`}
                  />
                </div>
                {errors.email && <p className="text-xs text-rose-600 mt-1">⚠️ {errors.email}</p>}
              </div>

              {/* Bio (opsional) */}
              <div>
                <label className="text-xs font-semibold text-slate-500 block mb-1.5">Bio <span className="font-normal">(opsional)</span></label>
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
                {loading ? <RotateCw size={16} className="animate-spin" /> : <><span>Lanjut</span><ArrowRight size={15} /></>}
              </button>
            </form>

            <p className="text-center text-xs text-slate-400">
              Dengan mendaftar, kamu menyetujui{" "}
              <Link href="/panduan" className="text-indigo-600 hover:underline">ketentuan layanan</Link> kami.
            </p>
          </div>
        )}

        {/* ── Step 2: OTP ─────────────────────────────────────────────────── */}
        {step === "otp" && (
          <div className="space-y-5 animate-fade-up">
            <button onClick={() => setStep("info")} className="inline-flex items-center gap-1.5 text-xs text-slate-400 hover:text-slate-600 transition-colors">
              <ArrowLeft size={13} /> Kembali
            </button>
            <div>
              <h2 className="text-2xl font-black text-slate-900">Verifikasi Email</h2>
              <p className="text-sm text-slate-500 mt-1">
                Kode dikirim ke <span className="font-semibold text-slate-700">{form.email}</span>
              </p>
            </div>

            {otpCode && (
              <div className="bg-indigo-50 border border-indigo-200 rounded-2xl px-4 py-3 flex items-center gap-3">
                <Sparkles size={16} className="text-indigo-500 flex-shrink-0" />
                <div>
                  <p className="text-[10px] font-bold text-indigo-500 uppercase tracking-wider">Kode Demo</p>
                  <p className="text-2xl font-black text-indigo-700 tracking-[0.3em]">{otpCode}</p>
                </div>
              </div>
            )}

            <OTPInput onComplete={handleOTPComplete} disabled={loading} />
            {otpErr && <p className="text-xs text-rose-600 text-center">⚠️ {otpErr}</p>}
            {loading && <div className="flex justify-center"><RotateCw size={18} className="text-indigo-500 animate-spin" /></div>}
          </div>
        )}

        {/* ── Step 3: Avatar ──────────────────────────────────────────────── */}
        {step === "avatar" && (
          <div className="space-y-6 animate-fade-up">
            <div>
              <h2 className="text-2xl font-black text-slate-900">Tambah Foto Profil</h2>
              <p className="text-sm text-slate-500 mt-1">Opsional — kamu bisa melewatinya sekarang.</p>
            </div>

            <div className="flex flex-col items-center gap-5">
              {/* Avatar preview */}
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
                {loading ? <RotateCw size={16} className="animate-spin" /> : "Selesai & Masuk"}
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

        {/* ── Step 4: Done ────────────────────────────────────────────────── */}
        {step === "done" && (
          <div className="flex flex-col items-center text-center gap-5 animate-fade-up">
            <div className="w-20 h-20 rounded-3xl bg-emerald-100 flex items-center justify-center">
              <span className="text-4xl">🎉</span>
            </div>
            <div>
              <h2 className="text-2xl font-black text-slate-900">Selamat datang, {form.nama.split(" ")[0]}!</h2>
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
