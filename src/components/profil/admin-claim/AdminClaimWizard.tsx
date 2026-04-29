"use client";

import { useMemo, useState } from "react";
import { LifeBuoy, ShieldCheck } from "lucide-react";
import AdminClaimDesaPicker from "@/components/profil/admin-claim/AdminClaimDesaPicker";
import AdminClaimInstruction from "@/components/profil/admin-claim/AdminClaimInstruction";
import AdminClaimMethodPicker from "@/components/profil/admin-claim/AdminClaimMethodPicker";
import AdminClaimStatusPanel from "@/components/profil/admin-claim/AdminClaimStatusPanel";
import AdminClaimStepNav from "@/components/profil/admin-claim/AdminClaimStepNav";
import {
  CLAIM_STEP_LABELS,
  buildSupportMailto,
  getSelectedDesa,
  type ClaimMethod,
  type ClaimStep,
} from "@/components/profil/admin-claim/adminClaimCopy";
import { useAdminClaimProfile } from "@/components/profil/admin-claim/useAdminClaimProfile";
import type { AuthUser } from "@/lib/auth-context";

export default function AdminClaimWizard({
  user,
}: {
  user: Pick<AuthUser, "id" | "nama" | "username" | "email" | "role">;
}) {
  const { data, loading, loadError, supportEmail, supportHref, defaultDesaId, isDemoAccount } = useAdminClaimProfile();
  const [step, setStep] = useState<ClaimStep>(1);
  const [method, setMethod] = useState<ClaimMethod>("OFFICIAL_EMAIL");
  const [search, setSearch] = useState("");
  const [chosenDesaId, setChosenDesaId] = useState<string | null>(null);

  const desaOptions = useMemo(() => data?.desaOptions ?? [], [data?.desaOptions]);
  const selectedDesaId = chosenDesaId ?? defaultDesaId;
  const selectedDesa = useMemo(
    () => getSelectedDesa(desaOptions, selectedDesaId),
    [desaOptions, selectedDesaId],
  );
  const filteredDesa = useMemo(() => {
    const term = search.trim().toLowerCase();
    if (!term) return desaOptions;

    return desaOptions.filter((desa) =>
      [desa.nama, desa.kecamatan, desa.kabupaten, desa.provinsi]
        .some((value) => value.toLowerCase().includes(term)),
    );
  }, [desaOptions, search]);

  const stepSupportHref = supportEmail && selectedDesa
    ? buildSupportMailto(supportEmail, selectedDesa.nama)
    : supportHref;

  return (
    <section className="space-y-5">
      <div className="rounded-3xl border border-violet-100 bg-gradient-to-br from-white via-violet-50/30 to-sky-50 p-5 shadow-sm sm:p-6">
        <div className="flex flex-wrap items-center gap-2">
          <span className="inline-flex items-center gap-1.5 rounded-full bg-violet-50 px-3 py-1 text-xs font-bold text-violet-700">
            <ShieldCheck size={13} />
            Klaim Admin Desa
          </span>
          <span className="inline-flex items-center gap-1.5 rounded-full bg-white px-3 py-1 text-xs font-semibold text-slate-600">
            {user.nama || user.username || user.email}
          </span>
        </div>

        <h1 className="mt-4 text-2xl font-black leading-tight text-slate-950 sm:text-3xl">
          Ajukan akses admin desa dengan langkah yang fokus.
        </h1>
        <p className="mt-2 max-w-2xl text-sm leading-relaxed text-slate-600">
          Alurnya dibuat singkat: pilih desa, pilih cara verifikasi, baca instruksi, lalu cek status klaimmu.
        </p>

        <div className="mt-4 flex flex-col gap-2 sm:flex-row">
          {stepSupportHref ? (
            <a
              href={stepSupportHref}
              className="inline-flex min-h-11 items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-bold text-slate-700 transition-colors hover:bg-slate-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-300 focus-visible:ring-offset-2"
            >
              <LifeBuoy size={14} />
              Hubungi Kami
            </a>
          ) : null}
        </div>
      </div>

      <div className="rounded-3xl border border-slate-100 bg-white p-5 shadow-sm sm:p-6">
        <AdminClaimStepNav
          steps={CLAIM_STEP_LABELS}
          currentStep={step}
          onSelect={setStep}
        />

        <div className="mt-6">
          {step === 1 ? (
            <AdminClaimDesaPicker
              loading={loading}
              loadError={loadError}
              search={search}
              onSearchChange={setSearch}
              filteredDesa={filteredDesa}
              visibleCount={6}
              selectedDesaId={selectedDesaId}
              onSelect={setChosenDesaId}
              selectedDesa={selectedDesa}
              onContinue={() => setStep(2)}
            />
          ) : null}

          {step === 2 ? (
            <AdminClaimMethodPicker
              selectedDesa={selectedDesa}
              method={method}
              onSelectMethod={setMethod}
              onBack={() => setStep(1)}
              onContinue={() => setStep(3)}
            />
          ) : null}

          {step === 3 ? (
            <AdminClaimInstruction
              method={method}
              selectedDesa={selectedDesa}
              supportEmail={supportEmail}
              onBack={() => setStep(2)}
              onContinue={() => setStep(4)}
            />
          ) : null}

          {step === 4 ? (
            <AdminClaimStatusPanel
              currentState={data?.currentState ?? null}
              showDemoLabel={isDemoAccount}
              supportHref={stepSupportHref}
              onBack={() => setStep(3)}
              onRestart={() => setStep(1)}
            />
          ) : null}
        </div>
      </div>
    </section>
  );
}
