import type { ContactAdminState } from "@/hooks/use-admin-claim-flow";

export default function ContactAdminForm({
  state,
  onChange,
  onSubmit,
}: {
  state: ContactAdminState;
  onChange: (field: "subject" | "description" | "evidence", value: string) => void;
  onSubmit: () => void;
}) {
  return (
    <section id="hubungi-admin" className="rounded-2xl border border-slate-100 bg-white p-4 shadow-sm">
      <p className="text-sm font-black text-slate-900">Hubungi Admin</p>
      <p className="mt-1 text-xs leading-relaxed text-slate-500">
        Gunakan form ini jika kamu butuh bantuan, ingin melaporkan admin palsu, atau perlu klarifikasi. Bukti bisa berupa tautan atau catatan singkat.
      </p>

      <div className="mt-4 space-y-3">
        <input
          type="text"
          value={state.subject}
          onChange={(event) => onChange("subject", event.target.value)}
          placeholder="Subjek"
          disabled={state.loading}
          className="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm disabled:cursor-not-allowed disabled:bg-slate-50"
        />
        <textarea
          value={state.description}
          onChange={(event) => onChange("description", event.target.value)}
          placeholder="Jelaskan kendala atau laporanmu"
          disabled={state.loading}
          rows={4}
          className="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm disabled:cursor-not-allowed disabled:bg-slate-50"
        />
        <input
          type="text"
          value={state.evidence}
          onChange={(event) => onChange("evidence", event.target.value)}
          placeholder="Tautan bukti atau keterangan tambahan (opsional)"
          disabled={state.loading}
          className="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm disabled:cursor-not-allowed disabled:bg-slate-50"
        />
        <button
          type="button"
          onClick={onSubmit}
          disabled={state.loading}
          className="inline-flex min-h-11 w-full items-center justify-center rounded-xl bg-indigo-600 px-4 py-2.5 text-sm font-bold text-white disabled:cursor-not-allowed disabled:opacity-60"
        >
          {state.loading ? "Mengirim..." : "Kirim ke admin"}
        </button>
        {state.success ? <p className="text-xs text-emerald-700">{state.success}</p> : null}
        {state.error ? <p className="text-xs text-rose-700">{state.error}</p> : null}
      </div>
    </section>
  );
}
