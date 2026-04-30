import type { InviteState } from "@/hooks/use-admin-claim-flow";

export default function AdminInviteForm({
  canInvite,
  disabledReason,
  invite,
  onEmailChange,
  onSubmit,
}: {
  canInvite: boolean;
  disabledReason: string;
  invite: InviteState;
  onEmailChange: (value: string) => void;
  onSubmit: () => void;
}) {
  return (
    <div className="rounded-2xl border border-slate-100 bg-white p-4 shadow-sm">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-sm font-black text-slate-900">Undang admin desa</p>
          <p className="mt-1 text-xs leading-relaxed text-slate-500">
            Hanya Admin Desa terverifikasi yang boleh mengundang. Undangan baru akan masuk sebagai admin terbatas, maksimal 5 admin per desa.
          </p>
        </div>
        <span className={`rounded-full px-2.5 py-1 text-[10px] font-semibold ${canInvite ? "bg-emerald-50 text-emerald-700" : "bg-amber-50 text-amber-700"}`}>
          {canInvite ? "VERIFIED only" : "Belum tersedia"}
        </span>
      </div>

      <div className="mt-4 space-y-3">
        <input
          type="email"
          value={invite.email}
          onChange={(event) => onEmailChange(event.target.value)}
          placeholder="email calon admin"
          disabled={!canInvite || invite.loading}
          className="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm disabled:cursor-not-allowed disabled:bg-slate-50"
        />
        <button
          type="button"
          onClick={onSubmit}
          disabled={!canInvite || invite.loading || !invite.email.trim()}
          className="inline-flex min-h-11 w-full items-center justify-center rounded-xl bg-slate-900 px-4 py-2.5 text-sm font-bold text-white disabled:cursor-not-allowed disabled:opacity-60"
        >
          {invite.loading ? "Mengirim..." : "Kirim undangan admin"}
        </button>
        {!canInvite ? <p className="text-xs text-amber-700">{disabledReason}</p> : null}
        {invite.success ? <p className="text-xs text-emerald-700">{invite.success}</p> : null}
        {invite.error ? <p className="text-xs text-rose-700">{invite.error}</p> : null}
      </div>
    </div>
  );
}
