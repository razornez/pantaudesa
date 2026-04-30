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
            Hanya Admin Desa VERIFIED yang boleh mengundang. Admin baru masuk sebagai LIMITED, maksimal 5 admin per desa.
          </p>
        </div>
        <span className={`rounded-full px-2.5 py-1 text-[10px] font-semibold ${canInvite ? "bg-emerald-50 text-emerald-700" : "bg-slate-100 text-slate-500"}`}>
          {canInvite ? "✓ Bisa undang" : "Tidak tersedia"}
        </span>
      </div>

      <div className="mt-4 space-y-3">
        <div>
          <input
            type="email"
            value={invite.email}
            onChange={(event) => onEmailChange(event.target.value)}
            placeholder="email calon admin"
            disabled={invite.loading}
            className="w-full rounded-xl border border-slate-200 px-3 py-2.5 text-sm disabled:cursor-not-allowed disabled:bg-slate-50"
          />
          {!canInvite ? (
            <p className="mt-1.5 text-[10px] text-amber-700 flex items-center gap-1">
              <span className="inline-block w-1 h-1 rounded-full bg-amber-500" />
              {disabledReason}
            </p>
          ) : null}
        </div>
        <button
          type="button"
          onClick={onSubmit}
          disabled={invite.loading || !invite.email.trim() || !canInvite}
          className="inline-flex min-h-11 w-full items-center justify-center rounded-xl bg-slate-900 px-4 py-2.5 text-sm font-bold text-white hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {invite.loading ? "Mengirim..." : "Kirim undangan admin"}
        </button>
        {invite.success ? (
          <div className="rounded-lg border border-emerald-200 bg-emerald-50 p-3 text-xs leading-relaxed text-emerald-800">
            ✓ {invite.success}
          </div>
        ) : invite.error ? (
          <div className="rounded-lg border border-rose-200 bg-rose-50 p-3 text-xs leading-relaxed text-rose-800">
            ✗ {invite.error}
          </div>
        ) : null}
      </div>
    </div>
  );
}
