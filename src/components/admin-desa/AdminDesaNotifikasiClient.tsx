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
            className="inline-flex items-center gap-1.5 text-xs font-medium text-slate-600 hover:text-slate-900 hover:bg-slate-100 px-2.5 py-1.5 rounded-lg transition-colors disabled:opacity-50"
          >
            <CheckCheck size={13} /> Tandai semua dibaca
          </button>
        )}
      </div>

      {error && (
        <p className="text-sm text-red-700 bg-red-50 border border-red-200 rounded-lg px-3 py-2">{error}</p>
      )}

      {notifications.length === 0 ? (
        <div className="bg-white border border-slate-200 rounded-2xl p-10 text-center">
          <BellOff size={28} className="mx-auto text-slate-300 mb-2" />
          <p className="text-sm text-slate-500">Belum ada notifikasi.</p>
        </div>
      ) : (
        <ul className="space-y-2">
          {notifications.map((n) => (
            <li
              key={n.id}
              className={`bg-white border rounded-2xl px-4 py-3.5 space-y-1 transition-colors ${
                n.isRead ? "border-slate-200" : "border-indigo-200 bg-indigo-50/40"
              }`}
            >
              <div className="flex items-start justify-between gap-2">
                <div className="flex items-start gap-2 min-w-0 flex-1">
                  <span className="text-base leading-none mt-0.5 shrink-0">{typeIcon(n.type)}</span>
                  <div className="min-w-0">
                    <p className={`text-sm font-semibold leading-snug ${n.isRead ? "text-slate-800" : "text-indigo-900"}`}>
                      {n.title}
                    </p>
                    <p className="text-xs text-slate-500 mt-0.5">
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
                    className="shrink-0 text-[11px] font-medium text-indigo-600 hover:text-indigo-800 hover:bg-indigo-100 px-2 py-1 rounded-md transition-colors disabled:opacity-50"
                    aria-label="Tandai dibaca"
                  >
                    Baca
                  </button>
                )}
              </div>
              <p className="text-xs text-slate-600 leading-relaxed pl-6">{n.body}</p>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
