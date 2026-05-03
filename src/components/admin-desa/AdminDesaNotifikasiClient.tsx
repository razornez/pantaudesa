"use client";

import { useState, useTransition } from "react";
import { Bell, BellOff, CheckCheck } from "lucide-react";

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

const TYPE_ICON: Record<string, string> = {
  RENEWAL_REMINDER:  "🔔",
  RENEWAL_EXPIRED:   "⚠️",
  RENEWAL_APPROVED:  "✅",
  RENEWAL_REJECTED:  "❌",
  DOCUMENT_APPROVED: "📄",
  DOCUMENT_FAILED:   "📄",
  DOCUMENT_PUBLISHED:"📄",
  MEMBER_INVITED:    "👤",
  MEMBER_REVOKED:    "👤",
  CLAIM_APPROVED:    "✅",
  CLAIM_REJECTED:    "❌",
};

function typeIcon(type: string) {
  return TYPE_ICON[type] ?? "💬";
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

  async function markAllRead() {
    setError(null);
    try {
      const res = await fetch("/api/admin-claim/notifications/mark-read", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({}),
      });
      const data = await res.json();
      if (!res.ok) { setError(data.error ?? "Gagal menandai semua sebagai dibaca."); return; }
      startTransition(() => {
        setNotifications((prev) =>
          prev.map((n) => ({ ...n, isRead: true, readAt: new Date().toISOString() }))
        );
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
      if (!res.ok) { setError(data.error ?? "Gagal."); return; }
      startTransition(() => {
        setNotifications((prev) =>
          prev.map((n) =>
            n.id === id ? { ...n, isRead: true, readAt: new Date().toISOString() } : n
          )
        );
        setUnread((c) => Math.max(0, c - 1));
      });
    } catch {
      setError("Koneksi bermasalah.");
    }
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-2 text-sm text-slate-600">
          <Bell size={15} className="text-slate-400" />
          <span>
            {unread > 0 ? (
              <span className="font-semibold text-indigo-700">{unread} belum dibaca</span>
            ) : (
              "Semua sudah dibaca"
            )}
          </span>
        </div>
        {unread > 0 && (
          <button
            onClick={markAllRead}
            disabled={isPending}
            className="t-spring inline-flex items-center gap-1.5 text-xs font-medium text-slate-600 hover:text-slate-900 hover:bg-slate-100 px-3 py-1.5 rounded-xl disabled:opacity-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 focus-visible:ring-offset-2"
          >
            <CheckCheck size={13} aria-hidden /> Tandai semua dibaca
          </button>
        )}
      </div>

      {error && (
        <div role="alert" className="rounded-2xl px-4 py-3 text-sm pill-danger">{error}</div>
      )}

      {notifications.length === 0 ? (
        <div className="lux-card p-12 text-center space-y-3">
          <BellOff size={28} className="mx-auto text-slate-300" aria-hidden />
          <p className="text-sm text-slate-500">Belum ada notifikasi.</p>
        </div>
      ) : (
        <ul className="space-y-2.5">
          {notifications.map((n) => (
            <li
              key={n.id}
              className={`t-spring rounded-2xl px-5 py-4 space-y-1.5 ${
                n.isRead
                  ? "bg-white shadow-lux-1 ring-hair"
                  : "shadow-lux-1"
              }`}
              style={!n.isRead ? { background: "linear-gradient(180deg, #F5F6FF 0%, #FFFFFF 100%)", boxShadow: "inset 0 0 0 1px rgba(79, 70, 229, 0.18), 0 1px 1px rgba(15,23,42,.03), 0 2px 4px rgba(15,23,42,.04), 0 8px 20px -8px rgba(15,23,42,.06)" } : undefined}
            >
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-start gap-3 min-w-0 flex-1">
                  <span className="text-base leading-none mt-0.5 shrink-0">{typeIcon(n.type)}</span>
                  <div className="min-w-0">
                    <p className={`text-sm font-semibold leading-snug ${n.isRead ? "text-slate-800" : "text-indigo-900"}`}>
                      {n.title}
                    </p>
                    <p className="text-xs text-slate-500 mt-0.5 num">
                      {new Date(n.createdAt).toLocaleDateString("id-ID", {
                        day: "numeric", month: "long", year: "numeric",
                      })}
                    </p>
                  </div>
                </div>
                {!n.isRead && (
                  <button
                    onClick={() => markOneRead(n.id)}
                    disabled={isPending}
                    className="t-spring shrink-0 text-[11px] font-semibold text-indigo-700 hover:text-indigo-900 hover:bg-indigo-100 px-2.5 py-1 rounded-lg disabled:opacity-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 focus-visible:ring-offset-2"
                    aria-label="Tandai dibaca"
                  >
                    Baca
                  </button>
                )}
              </div>
              <p className="text-xs text-slate-600 leading-relaxed pl-7">{n.body}</p>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
