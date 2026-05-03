"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { ShieldCheck, BadgeCheck, UserPlus, MoreVertical, X, AlertTriangle, Clock } from "lucide-react";
import type { DesaAdminRoster, DesaAdminRow } from "@/lib/data/desa-admins";

interface Props {
  currentUserId: string;
  desaId: string;
  desaName: string;
  canManage: boolean;
  roster: DesaAdminRoster;
  maxAdmins: number;
}

function StatusPill({ status }: { status: DesaAdminRow["status"] }) {
  const map: Record<DesaAdminRow["status"], { label: string; cls: string }> = {
    VERIFIED: { label: "VERIFIED", cls: "bg-emerald-100 text-emerald-800" },
    LIMITED:  { label: "LIMITED",  cls: "bg-amber-100 text-amber-800" },
    REVOKED:  { label: "REVOKED",  cls: "bg-slate-200 text-slate-700" },
    EXPIRED:  { label: "EXPIRED",  cls: "bg-slate-200 text-slate-700" },
  };
  const m = map[status];
  return (
    <span className={`text-[11px] font-semibold px-2 py-0.5 rounded-full ${m.cls}`}>
      {m.label}
    </span>
  );
}

function AdminRow({
  row,
  canManage,
  isSelf,
  onRevoke,
}: {
  row: DesaAdminRow;
  canManage: boolean;
  isSelf: boolean;
  onRevoke: (row: DesaAdminRow) => void;
}) {
  const displayName = row.user.nama ?? row.user.username ?? row.user.email;
  const isVerified = row.status === "VERIFIED";
  const canRevokeThis = canManage && row.status === "LIMITED" && !isSelf;

  return (
    <div className="flex items-center gap-3 py-3 border-b border-slate-100 last:border-0">
      <span className="shrink-0 w-10 h-10 rounded-full overflow-hidden bg-slate-100 relative">
        {row.user.avatarUrl ? (
          <Image src={row.user.avatarUrl} alt={displayName} width={40} height={40} className="object-cover" />
        ) : (
          <span className="absolute inset-0 flex items-center justify-center text-xs font-semibold text-slate-700">
            {displayName.slice(0, 2).toUpperCase()}
          </span>
        )}
        {(isVerified || row.status === "LIMITED") && (
          <span className={`absolute -bottom-0.5 -right-0.5 w-4 h-4 rounded-full ${
            isVerified ? "bg-emerald-500" : "bg-amber-500"
          } flex items-center justify-center border-2 border-white`}>
            {isVerified ? <ShieldCheck size={9} className="text-white" /> : <BadgeCheck size={9} className="text-white" />}
          </span>
        )}
      </span>

      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-2">
          <p className="font-medium text-slate-900 truncate">{displayName}</p>
          <StatusPill status={row.status} />
          {isSelf && (
            <span className="text-[10px] text-slate-500 px-1.5 py-0.5 bg-slate-100 rounded">Kamu</span>
          )}
        </div>
        <p className="text-xs text-slate-500 truncate">{row.user.email}</p>
        {row.acceptedAt && (
          <p className="text-[11px] text-slate-400">
            Bergabung: {new Date(row.acceptedAt).toLocaleDateString("id-ID")}
          </p>
        )}
        {row.revokedAt && row.revokedReason && (
          <p className="text-[11px] text-slate-500 italic mt-0.5">
            Dicabut: {new Date(row.revokedAt).toLocaleDateString("id-ID")} — {row.revokedReason}
          </p>
        )}
      </div>

      {canRevokeThis && (
        <button
          type="button"
          onClick={() => onRevoke(row)}
          className="shrink-0 p-2 text-slate-500 hover:text-red-700 hover:bg-red-50 rounded-lg transition-colors"
          aria-label={`Hapus akses ${displayName}`}
        >
          <MoreVertical size={16} />
        </button>
      )}
    </div>
  );
}

function InviteModal({
  desaId,
  desaName,
  onClose,
  onDone,
}: {
  desaId: string;
  desaName: string;
  onClose: () => void;
  onDone: () => void;
}) {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!email.trim()) {
      setError("Email wajib diisi.");
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/admin-claim/invite", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ desaId, email: email.trim() }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error ?? "Gagal mengirim undangan.");
        return;
      }
      setSuccess("Undangan berhasil dikirim. Invitee akan menerima email dengan tautan terima undangan.");
      setEmail("");
      setTimeout(() => {
        onDone();
      }, 1500);
    } catch {
      setError("Koneksi bermasalah. Coba lagi.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-xl max-w-md w-full p-5 space-y-4">
        <div className="flex items-start justify-between gap-3">
          <div>
            <h2 className="text-lg font-semibold text-slate-900">Undang Admin Desa</h2>
            <p className="text-sm text-slate-500 mt-0.5">untuk {desaName}</p>
          </div>
          <button onClick={onClose} className="p-1 rounded-lg hover:bg-slate-100" aria-label="Tutup">
            <X size={18} />
          </button>
        </div>

        <div className="bg-amber-50 border border-amber-200 rounded-lg px-3 py-2 text-xs text-amber-800">
          Invitee akan menjadi Admin Desa <strong>LIMITED</strong>. Mereka tidak dapat publish data atau mengundang admin lain.
        </div>

        <form onSubmit={handleSubmit} className="space-y-3">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Email invitee</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="email@desa.id"
              className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400"
              required
              autoFocus
            />
            <p className="text-xs text-slate-500 mt-1">
              Sistem akan memblokir invite jika email ini sudah aktif sebagai Admin Desa di desa lain.
            </p>
          </div>

          {error && (
            <p className="text-sm text-red-700 bg-red-50 border border-red-200 rounded-lg px-3 py-2">{error}</p>
          )}
          {success && (
            <p className="text-sm text-green-700 bg-green-50 border border-green-200 rounded-lg px-3 py-2">{success}</p>
          )}

          <div className="flex gap-2 pt-2">
            <button type="button" onClick={onClose}
              className="flex-1 border border-slate-300 rounded-lg px-4 py-2 text-sm font-medium hover:bg-slate-50">
              Batal
            </button>
            <button type="submit" disabled={loading}
              className="flex-1 bg-indigo-600 text-white rounded-lg px-4 py-2 text-sm font-medium hover:bg-indigo-700 disabled:opacity-50">
              {loading ? "Mengirim..." : "Kirim Undangan"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

function RevokeModal({
  member,
  onClose,
  onDone,
}: {
  member: DesaAdminRow;
  onClose: () => void;
  onDone: () => void;
}) {
  const [reason, setReason] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const displayName = member.user.nama ?? member.user.username ?? member.user.email;

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`/api/admin-claim/revoke-member/${member.id}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ reason: reason.trim() || undefined }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error ?? "Gagal mencabut akses.");
        return;
      }
      onDone();
    } catch {
      setError("Koneksi bermasalah. Coba lagi.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-xl max-w-md w-full p-5 space-y-4">
        <div className="flex items-start gap-3">
          <span className="shrink-0 w-10 h-10 rounded-full bg-red-100 text-red-600 flex items-center justify-center">
            <AlertTriangle size={20} />
          </span>
          <div>
            <h2 className="text-lg font-semibold text-slate-900">Hapus akses Admin Desa</h2>
            <p className="text-sm text-slate-500 mt-0.5">{displayName}</p>
          </div>
        </div>

        <p className="text-sm text-slate-700">
          Akses akan dicabut dan diubah menjadi <strong>REVOKED</strong>. Riwayat akses tetap tersimpan untuk audit.
          User akan kehilangan akses Admin Desa, tetapi data dokumen yang sudah mereka unggah tetap tersedia.
        </p>

        <form onSubmit={handleSubmit} className="space-y-3">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">
              Alasan pencabutan <span className="text-slate-400 font-normal">(opsional)</span>
            </label>
            <textarea
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              rows={3}
              placeholder="Contoh: Tidak lagi berperan sebagai admin desa..."
              className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-red-400 resize-none"
            />
          </div>

          {error && (
            <p className="text-sm text-red-700 bg-red-50 border border-red-200 rounded-lg px-3 py-2">{error}</p>
          )}

          <div className="flex gap-2 pt-2">
            <button type="button" onClick={onClose}
              className="flex-1 border border-slate-300 rounded-lg px-4 py-2 text-sm font-medium hover:bg-slate-50">
              Batal
            </button>
            <button type="submit" disabled={loading}
              className="flex-1 bg-red-600 text-white rounded-lg px-4 py-2 text-sm font-medium hover:bg-red-700 disabled:opacity-50">
              {loading ? "Memproses..." : "Hapus Akses"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default function AdminDesaListAdminClient({
  currentUserId,
  desaId,
  desaName,
  canManage,
  roster,
  maxAdmins,
}: Props) {
  const router = useRouter();
  const [showInvite, setShowInvite] = useState(false);
  const [revokeTarget, setRevokeTarget] = useState<DesaAdminRow | null>(null);
  // Stable "now" captured at mount to avoid impure Date.now() during render (React 19 purity rule).
  const [nowMs] = useState(() => Date.now());

  const totalActive = roster.verifiedCount + roster.limitedCount;
  const inviteLimitReached = totalActive >= maxAdmins;

  function refresh() {
    router.refresh();
  }

  return (
    <div className="space-y-6">
      <header className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">List Admin</h1>
          <p className="text-sm text-slate-500 mt-0.5">
            {totalActive} dari {maxAdmins} admin aktif untuk {desaName}
          </p>
        </div>
        {canManage && (
          <button
            type="button"
            onClick={() => setShowInvite(true)}
            disabled={inviteLimitReached}
            className="inline-flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 disabled:bg-slate-300 disabled:cursor-not-allowed text-white text-sm font-semibold rounded-xl px-4 py-2 transition-colors"
          >
            <UserPlus size={16} />
            Undang Admin
          </button>
        )}
      </header>

      {!canManage && (
        <div className="bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm text-slate-600">
          Hanya Admin Desa VERIFIED yang dapat mengundang/mencabut akses admin lain.
        </div>
      )}

      {inviteLimitReached && canManage && (
        <div className="bg-amber-50 border border-amber-200 rounded-xl px-4 py-3 text-sm text-amber-800">
          Sudah mencapai batas {maxAdmins} admin per desa. Cabut salah satu LIMITED untuk mengundang admin baru.
        </div>
      )}

      {/* Active admins */}
      <section className="bg-white border border-slate-200 rounded-2xl p-5">
        <h2 className="text-sm font-semibold text-slate-900 mb-2">Admin Aktif</h2>
        {roster.active.length === 0 ? (
          <p className="text-sm text-slate-500 py-4 text-center">Belum ada admin aktif.</p>
        ) : (
          <div className="divide-y divide-slate-100">
            {roster.active.map((row) => (
              <AdminRow
                key={row.id}
                row={row}
                canManage={canManage}
                isSelf={row.userId === currentUserId}
                onRevoke={setRevokeTarget}
              />
            ))}
          </div>
        )}
      </section>

      {/* Pending invites */}
      {canManage && roster.pendingInvites.length > 0 && (
        <section className="bg-white border border-slate-200 rounded-2xl p-5">
          <h2 className="text-sm font-semibold text-slate-900 mb-3 flex items-center gap-2">
            <Clock size={14} /> Undangan menunggu
          </h2>
          <ul className="space-y-2">
            {roster.pendingInvites.map((inv) => {
              const expired = new Date(inv.expiresAt).getTime() < nowMs;
              return (
                <li key={inv.id} className="flex items-center justify-between text-sm py-2 border-b border-slate-100 last:border-0">
                  <div>
                    <p className="font-medium text-slate-900">{inv.email}</p>
                    <p className={`text-xs ${expired ? "text-red-600" : "text-slate-500"}`}>
                      Dikirim {new Date(inv.createdAt).toLocaleDateString("id-ID")} •{" "}
                      {expired ? "Sudah kedaluwarsa" : `Berlaku sampai ${new Date(inv.expiresAt).toLocaleDateString("id-ID")}`}
                    </p>
                  </div>
                </li>
              );
            })}
          </ul>
        </section>
      )}

      {/* History */}
      {roster.history.length > 0 && (
        <section className="bg-white border border-slate-200 rounded-2xl p-5">
          <h2 className="text-sm font-semibold text-slate-900 mb-2">Riwayat Akses</h2>
          <p className="text-xs text-slate-500 mb-2">Akses sebelumnya yang sudah dicabut atau berakhir.</p>
          <div className="divide-y divide-slate-100">
            {roster.history.map((row) => (
              <AdminRow
                key={row.id}
                row={row}
                canManage={false}
                isSelf={row.userId === currentUserId}
                onRevoke={() => {}}
              />
            ))}
          </div>
        </section>
      )}

      {showInvite && (
        <InviteModal desaId={desaId} desaName={desaName}
          onClose={() => setShowInvite(false)}
          onDone={() => { setShowInvite(false); refresh(); }} />
      )}
      {revokeTarget && (
        <RevokeModal member={revokeTarget}
          onClose={() => setRevokeTarget(null)}
          onDone={() => { setRevokeTarget(null); refresh(); }} />
      )}
    </div>
  );
}
