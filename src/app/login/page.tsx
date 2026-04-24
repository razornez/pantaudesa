"use client";

import { useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import {
  Mail, ArrowRight, ArrowLeft, RotateCw,
  CheckCircle2, ShieldCheck, Sparkles, Building2, Users,
} from "lucide-react";
import { ASSETS } from "@/lib/assets";
import { generateOTP, verifyOTP, getAccountByEmail } from "@/lib/auth-mock";
import { useAuth } from "@/lib/auth-context";

type LoginMode = "desa" | "warga";
type Step      = "email" | "otp" | "success";

// ─── OTP 6-box input ─────────────────────────────────────────────────────────

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
              : "border-slate-200 bg-white text-slate-800 focus:border-indigo-400 focus:bg-indigo-50/50"
          }`}
          style={{ height: 52 }}
        />
      ))}
    </div>
  );
}

// ─── Mode selector ────────────────────────────────────────────────────────────

function ModeSelector({ mode, onChange }: { mode: LoginMode; onChange: (m: LoginMode) => void }) {
  return (
    <div className="flex bg-slate-100 rounded-2xl p-1 gap-1">
      {([
        { id: "warga", label: "Saya Warga",          icon: Users     },
        { id: "desa",  label: "Portal Desa / Admin",  icon: Building2 },
      ] as { id: LoginMode; label: string; icon: React.ElementType }[]).map(m => {
        const Icon = m.icon;
        return (
          <button
            key={m.id}
            type="button"
            onClick={() => onChange(m.id)}
            className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-xs font-bold transition-all ${
              mode === m.id
                ? "bg-white text-slate-800 shadow-sm"
                : "text-slate-500 hover:text-slate-700"
            }`}
          >
            <Icon size={13} /> {m.label}
          </button>
        );
      })}
    </div>
  );
}

// ─── Main ─────────────────────────────────────────────────────────────────────

export default function LoginPage() {
  const router = useRouter();
  const { login, user } = useAuth();

  const [mode,      setMode]      = useState<LoginMode>("warga");
  const [step,      setStep]      = useState<Step>("email");
  const [email,     setEmail]     = useState("");
  const [emailErr,  setEmailErr]  = useState("");
  const [otpErr,    setOtpErr]    = useState("");
  const [loading,   setLoading]   = useState(false);
  const [countdown, setCountdown] = useState(0);
  const [mockCode,  setMockCode]  = useState("");

  useEffect(() => {
    if (user) router.push(user.role === "admin" ? "/admin" : user.role === "desa" ? "/desa-admin" : "/profil/saya");
  }, [user, router]);

  useEffect(() => {
    if (countdown <= 0) return;
    const t = setTimeout(() => setCountdown(c => c - 1), 1000);
    return () => clearTimeout(t);
  }, [countdown]);

  // Reset saat mode ganti
  const handleModeChange = (m: LoginMode) => {
    setMode(m); setEmail(""); setEmailErr(""); setStep("email");
  };

  const handleEmailSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setEmailErr("");
    const trimmed = email.toLowerCase().trim();
    if (!trimmed) return setEmailErr("Email tidak boleh kosong.");

    const account = getAccountByEmail(trimmed);
    if (!account) return setEmailErr("Email tidak terdaftar.");

    // Validasi mode
    if (mode === "desa" && account.role === "warga")
      return setEmailErr("Email ini terdaftar sebagai warga, bukan desa/admin.");
    if (mode === "warga" && (account.role === "desa" || account.role === "admin"))
      return setEmailErr("Email ini terdaftar sebagai portal desa. Gunakan tab Desa/Admin.");

    setLoading(true);
    await new Promise(r => setTimeout(r, 700));
    const code = generateOTP(trimmed);
    setMockCode(code);
    setLoading(false);
    setStep("otp");
    setCountdown(60);
  };

  const handleOTPComplete = async (code: string) => {
    setOtpErr("");
    setLoading(true);
    await new Promise(r => setTimeout(r, 600));
    const valid = verifyOTP(email.toLowerCase().trim(), code);
    if (!valid) { setLoading(false); return setOtpErr("Kode salah atau kedaluwarsa."); }
    const account = getAccountByEmail(email.toLowerCase().trim());
    if (!account) { setLoading(false); return; }
    login(account);
    setStep("success");
    await new Promise(r => setTimeout(r, 1200));
    router.push(account.role === "admin" ? "/admin" : account.role === "desa" ? "/desa-admin" : "/profil/saya");
  };

  const handleResend = () => {
    if (countdown > 0) return;
    const code = generateOTP(email.toLowerCase().trim());
    setMockCode(code);
    setCountdown(60);
    setOtpErr("");
  };

  const demoAccounts = mode === "warga"
    ? [{ email: "pak.muryanto@gmail.com", label: "Pak Muryanto (warga)" }, { email: "ibu.sumarni@gmail.com", label: "Ibu Sumarni (warga)" }]
    : [{ email: "desa.sukamaju@gmail.com", label: "Desa Sukamaju" }, { email: "admin@pantaudesa.id", label: "Admin" }];

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
              <ShieldCheck size={13} /> Masuk dengan aman
            </div>
            <h1 className="text-3xl font-black text-white leading-tight mb-4">
              Suaramu penting<br />untuk desamu.
            </h1>
            <p className="text-indigo-200 text-sm leading-relaxed">
              Bergabung sebagai warga untuk bersuara, memantau anggaran, dan mendorong transparansi desa.
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

        {/* ── Step: email ─────────────────────────────────────────────────── */}
        {step === "email" && (
          <div className="space-y-5">
            <div>
              <h2 className="text-2xl font-black text-slate-900">Masuk</h2>
              <p className="text-sm text-slate-500 mt-1">Tidak perlu password — kami kirimkan kode verifikasi.</p>
            </div>

            {/* Mode selector */}
            <ModeSelector mode={mode} onChange={handleModeChange} />

            {/* Demo hint */}
            <div className="bg-amber-50 border border-amber-200 rounded-2xl px-4 py-3 text-xs text-amber-700">
              <p className="font-bold mb-1.5">🧪 Demo — coba email ini:</p>
              {demoAccounts.map(a => (
                <button
                  key={a.email}
                  type="button"
                  onClick={() => setEmail(a.email)}
                  className="block font-mono hover:text-amber-900 hover:underline transition-colors"
                >
                  {a.email} <span className="font-sans text-amber-500">({a.label})</span>
                </button>
              ))}
            </div>

            <form onSubmit={handleEmailSubmit} className="space-y-4">
              <div>
                <label className="text-xs font-semibold text-slate-600 block mb-1.5">
                  {mode === "warga" ? "Email kamu" : "Email resmi desa / admin"}
                </label>
                <div className="relative">
                  <Mail size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input
                    type="email"
                    value={email}
                    onChange={e => { setEmail(e.target.value); setEmailErr(""); }}
                    placeholder={mode === "warga" ? "email@kamu.com" : "email@desa.id"}
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
                  : <><span>Kirim Kode Verifikasi</span><ArrowRight size={15} /></>
                }
              </button>
            </form>

            <p className="text-center text-xs text-slate-400">
              Kode OTP berlaku 5 menit · Tidak ada password yang perlu diingat
            </p>
          </div>
        )}

        {/* ── Step: OTP ──────────────────────────────────────────────────── */}
        {step === "otp" && (
          <div className="space-y-5">
            <button onClick={() => setStep("email")} className="inline-flex items-center gap-1.5 text-xs text-slate-400 hover:text-slate-600 transition-colors">
              <ArrowLeft size={13} /> Ganti email
            </button>
            <div>
              <h2 className="text-2xl font-black text-slate-900">Masukkan Kode</h2>
              <p className="text-sm text-slate-500 mt-1">
                Dikirim ke <span className="font-semibold text-slate-700">{email}</span>
              </p>
            </div>

            {/* Demo code */}
            {mockCode && (
              <div className="bg-indigo-50 border border-indigo-200 rounded-2xl px-4 py-3 flex items-center gap-3">
                <Sparkles size={16} className="text-indigo-500 flex-shrink-0" />
                <div>
                  <p className="text-[10px] font-bold text-indigo-500 uppercase tracking-wider">Kode Demo</p>
                  <p className="text-2xl font-black text-indigo-700 tracking-[0.3em]">{mockCode}</p>
                </div>
              </div>
            )}

            <OTPInput onComplete={handleOTPComplete} disabled={loading} />

            {otpErr && <p className="text-xs text-rose-600 text-center">⚠️ {otpErr}</p>}
            {loading && <div className="flex justify-center"><RotateCw size={18} className="text-indigo-500 animate-spin" /></div>}

            <div className="text-center">
              {countdown > 0
                ? <p className="text-xs text-slate-400">Kirim ulang dalam <span className="font-bold text-slate-600">{countdown}s</span></p>
                : <button onClick={handleResend} className="text-xs font-semibold text-indigo-600 hover:text-indigo-800 transition-colors">Kirim ulang kode</button>
              }
            </div>
          </div>
        )}

        {/* ── Step: success ─────────────────────────────────────────────── */}
        {step === "success" && (
          <div className="flex flex-col items-center text-center gap-5">
            <div className="w-20 h-20 rounded-3xl bg-emerald-100 flex items-center justify-center">
              <CheckCircle2 size={40} className="text-emerald-500" />
            </div>
            <div>
              <h2 className="text-xl font-black text-slate-900">Berhasil masuk!</h2>
              <p className="text-sm text-slate-500 mt-1">Sedang mengalihkan...</p>
            </div>
            <div className="w-8 h-8 rounded-full border-4 border-indigo-200 border-t-indigo-600 animate-spin" />
          </div>
        )}

        <div className="mt-10 pt-6 border-t border-slate-100">
          <p className="text-xs text-slate-400 text-center">
            Belum punya akun?{" "}
            <a href="mailto:admin@pantaudesa.id" className="text-indigo-600 font-semibold hover:underline">
              Daftar sebagai warga
            </a>
          </p>
        </div>
      </div>
    </div>
  );
}
