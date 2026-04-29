"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import {
  ArrowRight,
  Building2,
  ChevronRight,
  Globe2,
  Mail,
  MapPin,
  Search,
  ShieldCheck,
  Sparkles,
  UserRound,
  Users2,
  WandSparkles,
} from "lucide-react";
import { DataStatusBadge } from "@/components/ui/DataStatusBadge";
import {
  type AdminClaimDataStatus,
  type AdminClaimDesaOption,
  type AdminClaimProfileData,
  type AdminClaimStateCard,
} from "@/lib/data/admin-claim-read";
import type { AuthUser } from "@/lib/auth-context";

type ClaimStep = 1 | 2 | 3 | 4;
type ClaimMethod = "OFFICIAL_EMAIL" | "WEBSITE_TOKEN" | "SUPPORT_REVIEW";

const STEP_LABELS: Array<{ step: ClaimStep; label: string }> = [
  { step: 1, label: "Pilih desa" },
  { step: 2, label: "Pilih cara verifikasi" },
  { step: 3, label: "Ikuti instruksi" },
  { step: 4, label: "Lihat status" },
];

const CLAIM_STATUS_BADGE_TEXT: Record<AdminClaimStateCard["status"], { short: string; full: string }> = {
  none: { short: "Belum klaim", full: "Belum mengajukan" },
  pending: { short: "Pending", full: "Menunggu verifikasi" },
  limited: { short: "Terbatas", full: "Akses terbatas" },
  verified: { short: "Terverifikasi", full: "Admin Desa Terverifikasi" },
  rejected: { short: "Belum diterima", full: "Pengajuan belum bisa diterima" },
  suspended: { short: "Ditinjau", full: "Akses sedang ditinjau" },
  platform: { short: "Platform", full: "Admin Platform" },
};

const METHOD_COPY: Record<ClaimMethod, {
  title: string;
  body: string;
  cta: string;
  note: string;
  instruction: string;
}> = {
  OFFICIAL_EMAIL: {
    title: "Verifikasi lewat email resmi",
    body: "Paling cepat jika kamu punya akses ke email resmi desa atau email yang tercantum di sumber resmi desa.",
    cta: "Gunakan email resmi",
    note: "Pengiriman link verifikasi akan diaktifkan setelah layanan email siap.",
    instruction: "Kami akan mengirim tautan verifikasi ke email resmi desa. Buka email tersebut lalu ikuti tautannya.",
  },
  WEBSITE_TOKEN: {
    title: "Verifikasi lewat website resmi",
    body: "Gunakan cara ini jika kamu bisa menaruh kode verifikasi di website resmi desa.",
    cta: "Buat kode verifikasi",
    note: "Tahap ini disiapkan sebagai alur awal. Verifikasi otomatis akan diaktifkan pada batch berikutnya.",
    instruction: "Tempel kode verifikasi di website resmi desa, lalu kembali ke halaman ini untuk mengecek statusnya.",
  },
  SUPPORT_REVIEW: {
    title: "Tidak bisa memakai email atau website?",
    body: "Hubungi admin PantauDesa agar kendalanya bisa dibantu dicek.",
    cta: "Hubungi Kami",
    note: "Gunakan format yang sudah disiapkan supaya pemeriksaan awal lebih cepat.",
    instruction: "Kirim email dengan format yang sudah disiapkan agar admin PantauDesa bisa membantu mengecek kendala.",
  },
};

const CLAIM_STATUS_COPY: Record<AdminClaimStateCard["status"], {
  title: string;
  note: string;
  tone: string;
}> = {
  none: {
    title: "Belum mengajukan",
    note: "Kamu belum punya klaim admin desa yang tercatat.",
    tone: "bg-slate-100 text-slate-700 border-slate-200",
  },
  pending: {
    title: "Menunggu verifikasi",
    note: "Kami masih perlu memastikan klaim ini melalui kanal resmi desa.",
    tone: "bg-amber-50 text-amber-800 border-amber-200",
  },
  limited: {
    title: "Akses terbatas",
    note: "Kamu bisa menyiapkan dokumen atau klarifikasi, tetapi belum tampil sebagai Admin Desa Terverifikasi.",
    tone: "bg-sky-50 text-sky-800 border-sky-200",
  },
  verified: {
    title: "Admin Desa Terverifikasi",
    note: "Akun ini sudah terhubung dengan kanal resmi desa.",
    tone: "bg-emerald-50 text-emerald-800 border-emerald-200",
  },
  rejected: {
    title: "Pengajuan belum bisa diterima",
    note: "Klaim ini belum memenuhi bukti yang dibutuhkan.",
    tone: "bg-rose-50 text-rose-800 border-rose-200",
  },
  suspended: {
    title: "Akses sedang ditinjau",
    note: "Ada laporan atau perubahan yang perlu dicek ulang.",
    tone: "bg-orange-50 text-orange-800 border-orange-200",
  },
  platform: {
    title: "Admin Platform",
    note: "Akun ini mengelola ruang pantau lintas desa, bukan verifikasi desa.",
    tone: "bg-violet-50 text-violet-800 border-violet-200",
  },
};

function ClaimStatusBadge({ status }: { status: AdminClaimStateCard["status"] }) {
  const copy = CLAIM_STATUS_COPY[status];
  const label = CLAIM_STATUS_BADGE_TEXT[status];
  return (
    <span
      className={`inline-flex items-center rounded-full border px-2.5 py-1 text-[10px] font-black uppercase tracking-wide ${copy.tone}`}
      title={label.full}
    >
      <span className="sm:hidden">{label.short}</span>
      <span className="hidden sm:inline">{label.full}</span>
    </span>
  );
}

function MethodCard({
  method,
  active,
  onSelect,
  supportHref,
}: {
  method: ClaimMethod;
  active: boolean;
  onSelect: () => void;
  supportHref?: string;
}) {
  const copy = METHOD_COPY[method];
  const Icon = method === "OFFICIAL_EMAIL" ? Mail : method === "WEBSITE_TOKEN" ? Globe2 : Users2;

  const content = (
    <button
      type="button"
      onClick={onSelect}
      className={`w-full rounded-2xl border p-4 text-left transition-all ${
        active ? "border-indigo-300 bg-indigo-50 shadow-sm" : "border-slate-100 bg-white hover:border-slate-200 hover:bg-slate-50"
      } focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-300 focus-visible:ring-offset-2`}
    >
      <div className="flex items-start gap-3">
        <div className={`flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-2xl ${active ? "bg-indigo-600 text-white" : "bg-slate-100 text-slate-600"}`}>
          <Icon size={17} aria-hidden />
        </div>
        <div className="min-w-0 flex-1">
          <p className="text-sm font-black text-slate-900">{copy.title}</p>
          <p className="mt-1 text-xs leading-relaxed text-slate-500">{copy.body}</p>
          <p className="mt-2 text-[10px] font-semibold text-slate-400">{copy.note}</p>
          <div className="mt-3 inline-flex items-center gap-1.5 text-[11px] font-black text-indigo-700">
            {copy.cta}
            <ChevronRight size={12} />
          </div>
        </div>
      </div>
    </button>
  );

  if (method === "SUPPORT_REVIEW") {
    if (supportHref) {
      return (
        <a
          href={supportHref}
          onClick={onSelect}
          className="block rounded-2xl focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-300 focus-visible:ring-offset-2"
        >
          <div className={`w-full rounded-2xl border p-4 text-left transition-all ${active ? "border-indigo-300 bg-indigo-50 shadow-sm" : "border-slate-100 bg-white hover:border-slate-200 hover:bg-slate-50"}`}>
            <div className="flex items-start gap-3">
              <div className={`flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-2xl ${active ? "bg-indigo-600 text-white" : "bg-slate-100 text-slate-600"}`}>
                <Icon size={17} aria-hidden />
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-sm font-black text-slate-900">{copy.title}</p>
                <p className="mt-1 text-xs leading-relaxed text-slate-500">{copy.body}</p>
                <p className="mt-2 text-[10px] font-semibold text-slate-400">{copy.note}</p>
                <div className="mt-3 inline-flex items-center gap-1.5 text-[11px] font-black text-indigo-700">
                  {copy.cta}
                  <ChevronRight size={12} />
                </div>
              </div>
            </div>
          </div>
        </a>
      );
    }
  }

  return content;
}

function StateCard({ state }: { state: AdminClaimStateCard }) {
  const statusCopy = CLAIM_STATUS_COPY[state.status];
  return (
    <div className="rounded-2xl border border-slate-100 bg-white p-4 shadow-sm">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-[11px] font-semibold uppercase tracking-wide text-slate-400">{state.title}</p>
          <p className="mt-1 text-sm font-black text-slate-900">{statusCopy.title}</p>
        </div>
        <ClaimStatusBadge status={state.status} />
      </div>
      <p className="mt-2 text-xs leading-relaxed text-slate-500">{statusCopy.note}</p>
      <div className="mt-3 flex flex-wrap gap-2">
        <span className="rounded-full bg-slate-50 px-2.5 py-1 text-[10px] font-semibold text-slate-500">
          {state.roleLabel}
        </span>
        <span className="rounded-full bg-slate-50 px-2.5 py-1 text-[10px] font-semibold text-slate-500">
          {state.desaName}
        </span>
        {state.methodLabel && (
          <span className="rounded-full bg-slate-50 px-2.5 py-1 text-[10px] font-semibold text-slate-500">
            {state.methodLabel}
          </span>
        )}
        <DataStatusBadge status={state.dataStatus as AdminClaimDataStatus} size="xs" />
      </div>
      <p className="mt-3 text-[10px] leading-relaxed text-slate-400">
        {state.note}
      </p>
      {state.isDemo && (
        <p className="mt-1 text-[10px] font-semibold uppercase tracking-wide text-amber-600">
          Data demo
        </p>
      )}
    </div>
  );
}

function DesaOptionCard({
  desa,
  selected,
  onSelect,
}: {
  desa: AdminClaimDesaOption;
  selected: boolean;
  onSelect: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onSelect}
      className={`w-full rounded-2xl border p-4 text-left transition-all ${
        selected ? "border-indigo-300 bg-indigo-50 shadow-sm" : "border-slate-100 bg-white hover:border-slate-200 hover:bg-slate-50"
      } focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-300 focus-visible:ring-offset-2`}
    >
      <div className="flex items-start justify-between gap-3">
        <div>
          <div className="flex items-center gap-2">
            <p className="text-sm font-black text-slate-900">{desa.nama}</p>
            <DataStatusBadge status={desa.dataStatus} size="xs" />
          </div>
          <p className="mt-1 text-xs leading-relaxed text-slate-500">
            {desa.kecamatan}, {desa.kabupaten}, {desa.provinsi}
          </p>
        </div>
        <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-slate-50 text-slate-500">
          <MapPin size={14} />
        </div>
      </div>
      <div className="mt-3 flex flex-wrap gap-2">
        <span className="rounded-full bg-slate-50 px-2.5 py-1 text-[10px] font-semibold text-slate-500">
          {desa.sourceLabel}
        </span>
        <span className="rounded-full bg-slate-50 px-2.5 py-1 text-[10px] font-semibold text-slate-500">
          Email resmi: {desa.officialEmailLabel}
        </span>
      </div>
    </button>
  );
}

export default function ProfileAdminAccessCard({ user }: { user: Pick<AuthUser, "id" | "nama" | "username" | "email" | "role"> }) {
  const [data, setData] = useState<AdminClaimProfileData | null>(null);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState(false);
  const [step, setStep] = useState<ClaimStep>(1);
  const [method, setMethod] = useState<ClaimMethod>("OFFICIAL_EMAIL");
  const [search, setSearch] = useState("");
  const [selectedDesaId, setSelectedDesaId] = useState<string | null>(null);
  const claimSectionRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    let active = true;
    fetch("/api/admin-claim/profile")
      .then(async (response) => {
        if (!response.ok) {
          throw new Error(`admin claim profile load failed: ${response.status}`);
        }
        const payload = await response.json();
        if (!active) return;
        setLoadError(false);
        setData(payload);
        setSelectedDesaId(payload.selectedDesaId ?? payload.desaOptions?.[0]?.id ?? null);
      })
      .catch(() => {
        if (!active) return;
        setLoadError(true);
        setData(null);
      })
      .finally(() => {
        if (active) setLoading(false);
      });

    return () => {
      active = false;
    };
  }, []);

  const supportEmail = data?.supportEmail ?? getClientSupportEmail();
  const initialSelectedDesaId = data?.selectedDesaId ?? data?.desaOptions?.[0]?.id ?? null;
  const effectiveSelectedDesaId = selectedDesaId ?? initialSelectedDesaId;
  const supportHref = supportEmail ? buildSupportMailto(supportEmail, data?.desaOptions.find((desa) => desa.id === effectiveSelectedDesaId)?.nama ?? "Desa Pilihan") : undefined;
  const desaOptions = useMemo(() => data?.desaOptions ?? [], [data?.desaOptions]);
  const demoStates = useMemo(() => data?.demoStates ?? [], [data?.demoStates]);
  const currentState = data?.currentState;
  const selectedDesa = desaOptions.find((desa) => desa.id === effectiveSelectedDesaId) ?? desaOptions[0] ?? null;

  const filteredDesa = useMemo(() => {
    const term = search.trim().toLowerCase();
    if (!term) return desaOptions;
    return desaOptions.filter((desa) => {
      return [desa.nama, desa.kecamatan, desa.kabupaten, desa.provinsi].some((value) => value.toLowerCase().includes(term));
    });
  }, [desaOptions, search]);

  const currentDetail = currentState ? CLAIM_STATUS_COPY[currentState.status] : CLAIM_STATUS_COPY.none;

  const scrollToFlow = () => {
    claimSectionRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
    setStep(1);
  };

  return (
    <section ref={claimSectionRef} id="klaim-admin-desa" className="space-y-4">
      <div className="rounded-3xl border border-violet-100 bg-gradient-to-br from-white via-violet-50/30 to-sky-50 shadow-sm">
        <div className="p-5 sm:p-6">
          <div className="flex flex-wrap items-center gap-2">
            <span className="inline-flex items-center gap-1.5 rounded-full bg-violet-50 px-3 py-1 text-xs font-bold text-violet-700">
              <ShieldCheck size={13} />
              Akses Admin Desa
            </span>
            <span className="inline-flex items-center gap-1.5 rounded-full bg-slate-50 px-3 py-1 text-xs font-bold text-slate-600">
              <UserRound size={13} />
              {user.nama || user.username || user.email}
            </span>
          </div>

          <h2 className="mt-4 text-xl font-black leading-tight text-slate-950 sm:text-2xl">
            Klaim sebagai Admin Desa
          </h2>
          <p className="mt-2 max-w-2xl text-sm leading-relaxed text-slate-600">
            Jika kamu adalah perwakilan desa, kamu bisa mengajukan akses untuk mengunggah dokumen, memberi klarifikasi, dan mengelola informasi sumber desa.
          </p>
          <p className="mt-2 text-xs leading-relaxed text-slate-500">
            Akses admin hanya diberikan melalui kanal resmi desa atau pengecekan tambahan.
          </p>

          <div className="mt-4 flex flex-col gap-2 sm:flex-row">
            <button
              type="button"
              onClick={scrollToFlow}
              className="inline-flex items-center justify-center gap-2 rounded-xl bg-indigo-600 px-4 py-2.5 text-sm font-bold text-white transition-colors hover:bg-indigo-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-300 focus-visible:ring-offset-2"
            >
              Klaim sebagai Admin Desa
              <ArrowRight size={14} />
            </button>
            {supportHref ? (
              <a
                href={supportHref}
                className="inline-flex items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-bold text-slate-700 transition-colors hover:bg-slate-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-300 focus-visible:ring-offset-2"
              >
                Hubungi Kami
              </a>
            ) : (
              <span className="inline-flex items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-bold text-slate-400">
                Hubungi Kami
              </span>
            )}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-[1.2fr_0.8fr]">
        <div className="space-y-4">
          <div className="rounded-3xl border border-slate-100 bg-white p-5 shadow-sm">
            <div className="flex flex-wrap items-center gap-2">
              {STEP_LABELS.map((item) => (
                <button
                  key={item.step}
                  type="button"
                  onClick={() => setStep(item.step)}
                  className={`inline-flex items-center gap-2 rounded-full border px-3 py-1.5 text-xs font-bold transition-colors ${
                    step === item.step
                      ? "border-indigo-300 bg-indigo-50 text-indigo-700"
                      : "border-slate-200 bg-slate-50 text-slate-500 hover:bg-slate-100"
                  } focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-300 focus-visible:ring-offset-2`}
                >
                  <span className="inline-flex h-5 w-5 items-center justify-center rounded-full bg-white text-[10px] font-black">
                    {item.step}
                  </span>
                  {item.label}
                </button>
              ))}
            </div>

            <div className="mt-5 space-y-5">
              {step === 1 && (
                <div className="space-y-4">
                  <div className="flex items-start gap-3 rounded-2xl border border-sky-100 bg-sky-50 p-4">
                    <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-2xl bg-white text-sky-600 shadow-sm">
                      <Building2 size={17} />
                    </div>
                    <div>
                      <p className="text-sm font-black text-slate-900">Pilih desa yang ingin kamu kelola.</p>
                      <p className="mt-1 text-xs leading-relaxed text-slate-600">
                        Kami akan membantu mengecek apakah kamu punya akses ke kanal resmi desa tersebut.
                      </p>
                    </div>
                  </div>

                  <div className="relative">
                    <Search size={14} className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                    <input
                      value={search}
                      onChange={(event) => setSearch(event.target.value)}
                      aria-label="Cari desa untuk klaim admin"
                      placeholder="Ketik nama desa, kecamatan, atau kabupaten"
                      className="w-full rounded-2xl border border-slate-200 bg-slate-50 py-3 pl-10 pr-4 text-sm outline-none transition focus:border-indigo-300 focus:ring-2 focus:ring-indigo-200"
                    />
                  </div>

                  <div className="space-y-3 lg:max-h-[32rem] lg:overflow-y-auto lg:pr-1">
                    {loading ? (
                      <div className="rounded-2xl border border-slate-100 bg-slate-50 p-4 text-sm text-slate-500">
                        Memuat desa dan status claim...
                      </div>
                    ) : loadError ? (
                      <div className="rounded-2xl border border-rose-100 bg-rose-50 p-4 text-sm text-rose-700">
                        Data claim admin belum bisa dimuat sekarang. Kamu masih bisa pakai tombol Hubungi Kami sambil kami cek koneksinya.
                      </div>
                    ) : filteredDesa.length > 0 ? (
                      filteredDesa.map((desa) => (
                        <DesaOptionCard
                          key={desa.id}
                          desa={desa}
                          selected={selectedDesaId === desa.id}
                          onSelect={() => {
                            setSelectedDesaId(desa.id);
                            setStep(2);
                          }}
                        />
                      ))
                    ) : (
                      <div className="rounded-2xl border border-slate-100 bg-slate-50 p-4 text-sm text-slate-500">
                        Kami belum menemukan desa dengan kata kunci itu.
                      </div>
                    )}
                  </div>

                  <div className="rounded-2xl border border-amber-100 bg-amber-50 p-4">
                    <p className="text-sm font-black text-slate-900">Kanal resmi yang tercatat</p>
                    <p className="mt-1 text-xs leading-relaxed text-slate-600">
                      {selectedDesa?.sourceLabel ?? "Belum tercatat"}
                    </p>
                    <p className="mt-2 text-xs font-semibold text-amber-700">
                      Email resmi: {selectedDesa?.officialEmailLabel ?? "Belum tercatat"}
                    </p>
                    {!selectedDesa?.websiteUrl && (
                      <p className="mt-1 text-xs leading-relaxed text-slate-500">
                        Kami belum menemukan kanal resmi untuk desa ini. Kamu tetap bisa memakai bantuan admin PantauDesa.
                      </p>
                    )}
                    {selectedDesa?.dataStatus === "needs-review" && (
                      <div className="mt-3">
                        <DataStatusBadge status="needs-review" showMicrocopy className="w-full" />
                      </div>
                    )}
                  </div>
                </div>
              )}

              {step === 2 && (
                <div className="space-y-3">
                  <div className="flex items-start gap-3 rounded-2xl border border-slate-100 bg-slate-50 p-4">
                    <WandSparkles size={16} className="mt-0.5 text-indigo-600" />
                    <div>
                      <p className="text-sm font-black text-slate-900">Pilih cara verifikasi</p>
                      <p className="mt-1 text-xs leading-relaxed text-slate-600">
                        Pilih satu cara yang paling masuk akal untuk kanal resmi desa yang kamu punya.
                      </p>
                    </div>
                  </div>
                  <div className="grid gap-3">
                    <MethodCard method="OFFICIAL_EMAIL" active={method === "OFFICIAL_EMAIL"} onSelect={() => { setMethod("OFFICIAL_EMAIL"); setStep(3); }} />
                    <MethodCard method="WEBSITE_TOKEN" active={method === "WEBSITE_TOKEN"} onSelect={() => { setMethod("WEBSITE_TOKEN"); setStep(3); }} />
                    <MethodCard method="SUPPORT_REVIEW" active={method === "SUPPORT_REVIEW"} onSelect={() => { setMethod("SUPPORT_REVIEW"); setStep(3); }} supportHref={supportHref} />
                  </div>
                </div>
              )}

              {step === 3 && (
                <div className="space-y-4">
                  <div className="flex items-start gap-3 rounded-2xl border border-indigo-100 bg-indigo-50 p-4">
                    <Sparkles size={16} className="mt-0.5 text-indigo-600" />
                    <div>
                      <p className="text-sm font-black text-slate-900">{METHOD_COPY[method].title}</p>
                      <p className="mt-1 text-xs leading-relaxed text-slate-600">{METHOD_COPY[method].instruction}</p>
                    </div>
                  </div>
                  <div className="rounded-2xl border border-slate-100 bg-white p-4 shadow-sm">
                    <p className="text-sm font-black text-slate-900">Format bantuan yang disiapkan</p>
                    <div className="mt-3 space-y-2 rounded-2xl bg-slate-50 p-4 text-xs leading-relaxed text-slate-600">
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
                    <p className="mt-3 text-[10px] font-semibold uppercase tracking-wide text-slate-400">
                      {METHOD_COPY[method].note}
                    </p>
                  </div>
                </div>
              )}

              {step === 4 && currentState && (
                <div className="space-y-4">
                  <div className="flex items-start gap-3 rounded-2xl border border-emerald-100 bg-emerald-50 p-4">
                    <ShieldCheck size={16} className="mt-0.5 text-emerald-600" />
                    <div>
                      <p className="text-sm font-black text-slate-900">Lihat status</p>
                      <p className="mt-1 text-xs leading-relaxed text-slate-600">
                        Status yang tercatat di sini dibaca dari data demo atau data database yang aman.
                      </p>
                    </div>
                  </div>
                  <div className="rounded-2xl border border-slate-100 bg-slate-50 p-4">
                    <p className="text-sm font-black text-slate-900">{currentDetail.title}</p>
                    <p className="mt-1 text-xs leading-relaxed text-slate-600">{currentDetail.note}</p>
                    <div className="mt-3 flex flex-wrap gap-2">
                      <ClaimStatusBadge status={currentState.status} />
                      <span className="rounded-full bg-white px-2.5 py-1 text-[10px] font-semibold text-slate-500">
                        {currentState.roleLabel}
                      </span>
                      <span className="rounded-full bg-white px-2.5 py-1 text-[10px] font-semibold text-slate-500">
                        {currentState.desaName}
                      </span>
                    </div>
                    {currentState.note && (
                      <p className="mt-3 text-[10px] leading-relaxed text-slate-500">
                        {currentState.note}
                      </p>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>

          <div className="rounded-3xl border border-slate-100 bg-white p-5 shadow-sm">
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-sm font-black text-slate-900">Contoh status yang bisa muncul</p>
                <p className="mt-1 text-xs leading-relaxed text-slate-500">
                  Ini contoh dari data demo yang disiapkan supaya alurnya gampang dipahami sebelum kamu mengajukan akses.
                </p>
              </div>
              <div className="rounded-2xl bg-slate-50 px-3 py-2 text-[10px] font-semibold text-slate-500">
                {data?.source === "database" ? "Dibaca dari database" : "Demo fallback"}
              </div>
            </div>
            <div className="mt-4 grid gap-3 sm:grid-cols-2">
              {demoStates.length > 0 ? (
                demoStates.map((state) => (
                  <StateCard key={state.key} state={state} />
                ))
              ) : (
                <div className="rounded-2xl border border-slate-100 bg-slate-50 p-4 text-sm text-slate-500 sm:col-span-2">
                  Contoh status belum termuat. Muat ulang halaman ini atau lanjutkan lewat bantuan support.
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="space-y-4">
          <div className="rounded-3xl border border-slate-100 bg-white p-5 shadow-sm">
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-sm font-black text-slate-900">Status akun saat ini</p>
                <p className="mt-1 text-xs leading-relaxed text-slate-500">
                  Ringkasan ini dibaca dari data yang aman dan tidak memberi self-promotion.
                </p>
              </div>
              <DataStatusBadge status={currentState?.dataStatus ?? "demo"} size="xs" />
            </div>
            {currentState ? (
              <div className="mt-4 rounded-2xl border border-slate-100 bg-slate-50 p-4">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="text-[11px] font-semibold uppercase tracking-wide text-slate-400">{currentState.userName}</p>
                    <p className="mt-1 text-sm font-black text-slate-900">{currentDetail.title}</p>
                  </div>
                  <ClaimStatusBadge status={currentState.status} />
                </div>
                <p className="mt-2 text-xs leading-relaxed text-slate-600">{currentDetail.note}</p>
                <div className="mt-3 flex flex-wrap gap-2">
                  <span className="rounded-full bg-white px-2.5 py-1 text-[10px] font-semibold text-slate-500">
                    {currentState.roleLabel}
                  </span>
                  <span className="rounded-full bg-white px-2.5 py-1 text-[10px] font-semibold text-slate-500">
                    {currentState.desaName}
                  </span>
                  {currentState.methodLabel && (
                    <span className="rounded-full bg-white px-2.5 py-1 text-[10px] font-semibold text-slate-500">
                      {currentState.methodLabel}
                    </span>
                  )}
                </div>
                {currentState.status === "none" && (
                  <p className="mt-3 text-[10px] leading-relaxed text-slate-500">
                    Role aplikasi {user.role} belum otomatis menjadi admin desa. Relasi claim/member harus tercatat dulu.
                  </p>
                )}
              </div>
            ) : (
              <div className="mt-4 rounded-2xl border border-slate-100 bg-slate-50 p-4 text-sm text-slate-500">
                Data akun belum termuat.
              </div>
            )}
          </div>

          <div className="rounded-3xl border border-slate-100 bg-white p-5 shadow-sm">
            <p className="text-sm font-black text-slate-900">Alur yang disiapkan</p>
            <div className="mt-3 space-y-3">
              {[
                { title: "Pilih desa", body: "Pilih desa dan cek apakah kanal resmi sudah tercatat." },
                { title: "Pilih verifikasi", body: "Pilih email resmi, website token, atau bantuan support." },
                { title: "Ikuti instruksi", body: "Ikuti format yang disiapkan tanpa menganggap verifikasi sudah aktif." },
                { title: "Lihat status", body: "Baca apakah status masih warga, pending, limited, verified, rejected, atau suspended." },
              ].map((item) => (
                <div key={item.title} className="flex items-start gap-3 rounded-2xl bg-slate-50 p-3">
                  <div className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-xl bg-white text-slate-600 shadow-sm">
                    <span className="text-[10px] font-black">{item.title.slice(0, 1)}</span>
                  </div>
                  <div>
                    <p className="text-sm font-bold text-slate-900">{item.title}</p>
                    <p className="mt-1 text-xs leading-relaxed text-slate-500">{item.body}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

function buildSupportMailto(email: string, desaName: string) {
  const subject = encodeURIComponent(`Kendala Verifikasi Admin Desa - ${desaName}`);
  const body = encodeURIComponent(
    [
      "Nama lengkap:",
      "Jabatan:",
      `Nama desa: ${desaName}`,
      "Kecamatan:",
      "Kabupaten:",
      "Provinsi:",
      "Website resmi desa, jika ada:",
      "Email resmi desa, jika ada:",
      "Nomor kontak resmi yang tercantum di website, jika ada:",
      "Kendala yang dialami:",
      "Bukti pendukung/link dokumen, jika ada:",
    ].join("\n"),
  );
  return `mailto:${email}?subject=${subject}&body=${body}`;
}

function getClientSupportEmail() {
  const publicEmail = process.env.NEXT_PUBLIC_SUPPORT_EMAIL?.trim();
  if (publicEmail) return publicEmail;
  return process.env.NODE_ENV === "development" ? "support@pantaudesa.local" : null;
}
