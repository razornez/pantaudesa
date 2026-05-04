"use client";

import { useMemo, useState, useTransition } from "react";
import {
  Bell,
  BellOff,
  CheckCheck,
  CheckCircle2,
  Clock3,
  FileText,
  MailWarning,
  ShieldAlert,
  UserCog,
} from "lucide-react";

interface NotifRow {
  id: string;
  type: string;
  title: string;
  body: string;
  isRead: boolean;
  readAt: string | null;
  createdAt: string;
  desaId: string | null;
}

function iconMeta(type: string) {
  if (type.includes("RENEWAL")) return { icon: Clock3, tone: "text-amber-700 bg-amber-50" };
  if (type.includes("DOCUMENT")) return { icon: FileText, tone: "text-indigo-700 bg-indigo-50" };
  if (type.includes("MEMBER")) return { icon: UserCog, tone: "text-emerald-700 bg-emerald-50" };
  if (type.includes("CLAIM")) return { icon: CheckCircle2, tone: "text-emerald-700 bg-emerald-50" };
  return { icon: MailWarning, tone: "text-slate-700 bg-slate-100" };
}

export default function AdminDesaNotifikasiClient({
  initialNotifications,
  initialUnread,
}: {
  initialNotifications: NotifRow[];
  initialUnread: number;
}) {
  const [notifications, setNotifications] = useState(initialNotifications);
  const [unread, setUnread] = useState(initialUnread);
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  const summary = useMemo(() => {
    return {
      total: notifications.length,
      unread,
      read: notifications.length - unread,
    };
  }, [notifications.length, unread]);

  async function markAllRead() {
    setError(null);
    try {
      const res = await fetch("/api/admin-claim/notifications/mark-read", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({}),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error ?? "Gagal menandai semua sebagai dibaca.");
        return;
      }
      startTransition(() => {
        setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true, readAt: new Date().toISOString() })));
        setUnread(0);
      });
    } catch {
      setError("Koneksi bermasalah.");
    }
  }

  async function markOneRead(id: string) {
    setError(null);
    try {
      const res = await fetch("/api/admin-claim/notifications/mark-read", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ids: [id] }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error ?? "Gagal menandai notifikasi.");
        return;
      }
      startTransition(() => {
        setNotifications((prev) => prev.map((n) => (
          n.id === id ? { ...n, isRead: true, readAt: new Date().toISOString() } : n
        )));
        setUnread((c) => Math.max(0, c - 1));
      });
    } catch {
      setError("Koneksi bermasalah.");
    }
  }

  return (
    <div className="space-y-6">
      <section className="grid gap-3 sm:grid-cols-3">
        <div className="metric-card">
          <p className="metric-label">Total notifikasi</p>
          <p className="metric-value">{summary.total}</p>
          <p className="metric-note">aktivitas tercatat</p>
        </div>
        <div className="metric-card">
          <p className="metric-label">Belum dibaca</p>
          <p className="metric-value">{summary.unread}</p>
          <p className="metric-note">butuh perhatian</p>
        </div>
        <div className="metric-card">
          <p className="metric-label">Sudah dibaca</p>
          <p className="metric-value">{summary.read}</p>
          <p className="metric-note">riwayat tertata</p>
        </div>
      </section>

      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="notice-card notice-info text-sm flex items-start gap-3">
          <span className="inline-flex h-9 w-9 items-center justify-center rounded-2xl bg-indigo-100 text-indigo-700 shrink-0">
            <Bell size={16} aria-hidden />
          </span>
          <div>
            <p className="font-semibold">{unread > 0 ? `${unread} notifikasi belum dibaca` : "Semua notifikasi sudah dibaca"}</p>
            <p className="mt-1 opacity-90">Jaga inbox admin tetap bersih agar approval dan pengingat penting tidak tertinggal.</p>
          </div>
        </div>

        {unread > 0 && (
          <button
            onClick={markAllRead}
            disabled={isPending}
            className="btn-lux btn-lux-secondary w-full sm:w-auto"
          >
            <CheckCheck size={14} aria-hidden /> Tandai semua dibaca
          </button>
        )}
      </div>

      {error && (
        <div role="alert" className="notice-card notice-danger text-sm flex items-start gap-3">
          <span className="inline-flex h-9 w-9 items-center justify-center rounded-2xl bg-rose-100 text-rose-700 shrink-0">
            <ShieldAlert size={16} aria-hidden />
          </span>
          <span>{error}</span>
        </div>
      )}

      {notifications.length === 0 ? (
        <div className="lux-card p-12 text-center space-y-3">
          <BellOff size={28} className="mx-auto text-slate-300" aria-hidden />
          <p className="text-sm text-slate-500">Belum ada notifikasi.</p>
        </div>
      ) : (
        <ul className="space-y-3">
          {notifications.map((n) => {
            const meta = iconMeta(n.type);
            const Icon = meta.icon;

            return (
              <li
                key={n.id}
                className={`t-spring rounded-[1.45rem] px-5 py-4 space-y-3 ${
                  n.isRead
                    ? "bg-white shadow-[inset_0_0_0_1px_rgba(15,23,42,0.06),0_14px_28px_-24px_rgba(15,23,42,0.18)]"
                    : "lux-panel shadow-[inset_0_0_0_1px_rgba(79,70,229,0.12),0_20px_34px_-26px_rgba(30,27,75,0.28)]"
                }`}
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-start gap-3 min-w-0 flex-1">
                    <span className={`inline-flex h-10 w-10 items-center justify-center rounded-2xl shrink-0 ${meta.tone}`}>
                      <Icon size={18} aria-hidden />
                    </span>
                    <div className="min-w-0">
                      <div className="flex flex-wrap items-center gap-2">
                        <p className={`text-sm font-semibold leading-snug ${n.isRead ? "text-slate-800" : "text-indigo-950"}`}>
                          {n.title}
                        </p>
                        {!n.isRead && <span className="pill-info rounded-full px-2.5 py-1 text-[10px] font-semibold">Baru</span>}
                      </div>
                      <p className="text-xs text-slate-500 mt-1">
                        {new Date(n.createdAt).toLocaleDateString("id-ID", {
                          day: "numeric",
                          month: "long",
                          year: "numeric",
                        })}
                      </p>
                    </div>
                  </div>

                  {!n.isRead && (
                    <button
                      onClick={() => markOneRead(n.id)}
                      disabled={isPending}
                      className="btn-lux btn-lux-ghost !min-h-[38px] text-[11px] shrink-0"
                      aria-label="Tandai dibaca"
                    >
                      Baca
                    </button>
                  )}
                </div>

                <p className="text-sm text-slate-600 leading-relaxed pl-[52px]">{n.body}</p>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
