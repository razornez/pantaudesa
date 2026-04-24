"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import {
  ArrowLeft, Save, Eye, EyeOff, CheckCircle2,
  MapPin, Globe2, Phone, Mail, Users, Layers,
  AlertTriangle, RotateCw,
} from "lucide-react";
import { useAuth } from "@/lib/auth-context";
import { mockDesa } from "@/lib/mock-data";
import { ASSETS } from "@/lib/assets";
import { formatRupiah } from "@/lib/utils";

// ─── Field wrapper ────────────────────────────────────────────────────────────

function Field({ label, hint, children }: { label: string; hint?: string; children: React.ReactNode }) {
  return (
    <div>
      <label className="text-xs font-semibold text-slate-600 block mb-1.5">{label}</label>
      {children}
      {hint && <p className="text-[10px] text-slate-400 mt-1">{hint}</p>}
    </div>
  );
}

// ─── Section card ─────────────────────────────────────────────────────────────

function Section({ title, sub, icon, children }: {
  title: string; sub?: string; icon: string; children: React.ReactNode;
}) {
  return (
    <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
      <div className="px-5 py-4 border-b border-slate-100 flex items-center gap-3">
        <span className="text-xl">{icon}</span>
        <div>
          <p className="text-sm font-black text-slate-800">{title}</p>
          {sub && <p className="text-xs text-slate-400 mt-0.5">{sub}</p>}
        </div>
      </div>
      <div className="p-5 space-y-4">{children}</div>
    </div>
  );
}

// ─── Main ─────────────────────────────────────────────────────────────────────

export default function ProfilAdminPage() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const [saved,    setSaved]    = useState(false);
  const [saving,   setSaving]   = useState(false);
  const [showPass, setShowPass] = useState(false);

  // Form state — pre-fill dari data desa
  const desa = mockDesa.find(d => d.id === user?.desaId);
  const [form, setForm] = useState({
    website:    desa?.profil?.website ?? "",
    email:      user?.email ?? "",
    telepon:    desa?.profil?.telepon ?? "",
    potensi:    desa?.profil?.potensiUnggulan ?? "",
    mataP:      desa?.profil?.mataPencaharian ?? "",
    apiUrl:     "",
    newPass:    "",
    confirmP:   "",
  });

  const [passErr, setPassErr] = useState("");

  useEffect(() => {
    if (!loading && (!user || user.role !== "desa")) router.push("/login");
  }, [user, loading, router]);

  if (loading || !user || !desa) return null;

  const set = (k: keyof typeof form, v: string) => setForm(f => ({ ...f, [k]: v }));

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setPassErr("");

    if (form.newPass) {
      if (form.newPass.length < 6) return setPassErr("PIN minimal 6 digit.");
      if (form.newPass !== form.confirmP) return setPassErr("Konfirmasi tidak cocok.");
    }

    setSaving(true);
    await new Promise(r => setTimeout(r, 900));
    setSaving(false);
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  };

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Header */}
      <header className="bg-white border-b border-slate-100 sticky top-0 z-30">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 h-14 flex items-center gap-3">
          <Link href="/desa-admin" className="p-2 rounded-xl hover:bg-slate-100 transition-colors">
            <ArrowLeft size={16} className="text-slate-500" />
          </Link>
          <div className="w-px h-4 bg-slate-200" />
          <Image src={ASSETS.logo} alt="PantauDesa" width={24} height={24} className="rounded-lg" />
          <p className="text-sm font-bold text-slate-700 flex-1">Pengaturan Profil Desa</p>
          {saved && (
            <div className="flex items-center gap-1.5 text-xs font-semibold text-emerald-700 bg-emerald-50 border border-emerald-200 px-3 py-1.5 rounded-xl animate-fade-up">
              <CheckCircle2 size={13} /> Tersimpan
            </div>
          )}
        </div>
      </header>

      <div className="max-w-3xl mx-auto px-4 sm:px-6 py-8">
        <form onSubmit={handleSave} className="space-y-5">

          {/* Info read-only */}
          <Section title="Identitas Desa" sub="Data dari sistem — tidak dapat diubah langsung" icon="🏛️">
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              {[
                { icon: MapPin, label: "Kecamatan",     val: desa.kecamatan   },
                { icon: MapPin, label: "Kabupaten",      val: desa.kabupaten   },
                { icon: MapPin, label: "Provinsi",        val: desa.provinsi    },
                { icon: Users,  label: "Penduduk",        val: `${desa.penduduk.toLocaleString("id-ID")} jiwa` },
                { icon: Layers, label: "Fokus Program",   val: desa.kategori   },
                { icon: Layers, label: "Total Anggaran",  val: formatRupiah(desa.totalAnggaran) },
              ].map(i => {
                const Icon = i.icon;
                return (
                  <div key={i.label} className="bg-slate-50 rounded-xl px-3 py-2.5 border border-slate-100">
                    <p className="text-[10px] text-slate-400 font-medium flex items-center gap-1 mb-0.5">
                      <Icon size={9} /> {i.label}
                    </p>
                    <p className="text-xs font-bold text-slate-700 leading-snug">{i.val}</p>
                  </div>
                );
              })}
            </div>
            <p className="text-[10px] text-slate-400 flex items-center gap-1">
              <AlertTriangle size={10} /> Untuk perubahan data utama, hubungi admin PantauDesa.
            </p>
          </Section>

          {/* Kontak & web */}
          <Section title="Kontak & Web" sub="Ditampilkan di profil publik desa" icon="🌐">
            <Field label="Website Desa" hint="Contoh: https://desa-sukamaju.id">
              <div className="relative">
                <Globe2 size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="url"
                  value={form.website}
                  onChange={e => set("website", e.target.value)}
                  placeholder="https://desa-anda.id"
                  className="w-full pl-9 pr-4 py-2.5 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-300 focus:border-indigo-400 transition"
                />
              </div>
            </Field>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Field label="Email Resmi Desa">
                <div className="relative">
                  <Mail size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input
                    type="email"
                    value={form.email}
                    onChange={e => set("email", e.target.value)}
                    className="w-full pl-9 pr-4 py-2.5 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-300 focus:border-indigo-400 transition"
                  />
                </div>
              </Field>
              <Field label="Nomor Telepon / WhatsApp" hint="Format: 08xxxxxxxx">
                <div className="relative">
                  <Phone size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input
                    type="tel"
                    value={form.telepon}
                    onChange={e => set("telepon", e.target.value)}
                    placeholder="081234567890"
                    className="w-full pl-9 pr-4 py-2.5 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-300 focus:border-indigo-400 transition"
                  />
                </div>
              </Field>
            </div>
          </Section>

          {/* Potensi desa */}
          <Section title="Potensi & Profil Desa" sub="Ditampilkan di bagian bawah profil desa" icon="✨">
            <Field label="Potensi Unggulan" hint="Contoh: Padi, pariwisata alam, kerajinan batik">
              <input
                type="text"
                value={form.potensi}
                onChange={e => set("potensi", e.target.value)}
                className="w-full px-4 py-2.5 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-300 focus:border-indigo-400 transition"
              />
            </Field>
            <Field label="Mata Pencaharian Utama" hint="Contoh: Petani, Pedagang, Nelayan">
              <input
                type="text"
                value={form.mataP}
                onChange={e => set("mataP", e.target.value)}
                className="w-full px-4 py-2.5 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-300 focus:border-indigo-400 transition"
              />
            </Field>
          </Section>

          {/* API / Link Data */}
          <Section title="Sumber Data Anggaran" sub="Opsional — untuk integrasi otomatis" icon="🔗">
            <Field label="URL API atau Link Data Desa" hint="Misalnya link Google Sheets publik, SIPD, atau endpoint API desa">
              <input
                type="url"
                value={form.apiUrl}
                onChange={e => set("apiUrl", e.target.value)}
                placeholder="https://api.sipd.kemendagri.go.id/desa/..."
                className="w-full px-4 py-2.5 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-300 focus:border-indigo-400 transition"
              />
            </Field>
            <div className="bg-sky-50 border border-sky-200 rounded-xl px-3 py-2.5">
              <p className="text-xs text-sky-700 font-semibold mb-0.5">Cara kerja integrasi API</p>
              <p className="text-[10px] text-sky-600 leading-relaxed">
                Jika desa menyediakan endpoint data publik (SIPD, OMSPAN, atau custom API), PantauDesa bisa menarik data anggaran secara otomatis setiap hari tanpa perlu upload manual. Hubungi admin untuk setup.
              </p>
            </div>
          </Section>

          {/* Ganti PIN login */}
          <Section title="Keamanan Akun" sub="Ubah PIN login untuk email ini" icon="🔐">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Field label="PIN Baru (6 digit)" hint="Kosongkan jika tidak ingin mengubah">
                <div className="relative">
                  <input
                    type={showPass ? "text" : "password"}
                    inputMode="numeric"
                    maxLength={6}
                    value={form.newPass}
                    onChange={e => set("newPass", e.target.value.replace(/\D/g, ""))}
                    placeholder="••••••"
                    className="w-full pr-10 px-4 py-2.5 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-300 focus:border-indigo-400 transition"
                  />
                  <button type="button" onClick={() => setShowPass(v => !v)} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors">
                    {showPass ? <EyeOff size={14} /> : <Eye size={14} />}
                  </button>
                </div>
              </Field>
              <Field label="Konfirmasi PIN">
                <input
                  type={showPass ? "text" : "password"}
                  inputMode="numeric"
                  maxLength={6}
                  value={form.confirmP}
                  onChange={e => set("confirmP", e.target.value.replace(/\D/g, ""))}
                  placeholder="••••••"
                  className="w-full px-4 py-2.5 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-300 focus:border-indigo-400 transition"
                />
              </Field>
            </div>
            {passErr && <p className="text-xs text-rose-600 flex items-center gap-1">⚠️ {passErr}</p>}
          </Section>

          {/* Submit */}
          <button
            type="submit"
            disabled={saving}
            className="w-full flex items-center justify-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-3.5 rounded-2xl transition-all shadow-lg shadow-indigo-200 disabled:opacity-50 text-sm"
          >
            {saving
              ? <><RotateCw size={15} className="animate-spin" /> Menyimpan...</>
              : <><Save size={15} /> Simpan Perubahan</>
            }
          </button>
        </form>
      </div>
    </div>
  );
}
