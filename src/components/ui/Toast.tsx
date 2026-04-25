"use client";

import { useEffect, useState } from "react";
import { CheckCircle2, XCircle, AlertTriangle, X } from "lucide-react";

export type ToastType = "success" | "error" | "warning";

interface ToastProps {
  message:  string;
  type?:    ToastType;
  duration?: number;
  onClose:  () => void;
}

const ICONS = {
  success: <CheckCircle2 size={16} className="text-emerald-500 flex-shrink-0" />,
  error:   <XCircle     size={16} className="text-rose-500 flex-shrink-0"    />,
  warning: <AlertTriangle size={16} className="text-amber-500 flex-shrink-0" />,
};

const STYLES = {
  success: "bg-white border-emerald-200 text-emerald-800",
  error:   "bg-white border-rose-200 text-rose-800",
  warning: "bg-white border-amber-200 text-amber-800",
};

export function Toast({ message, type = "success", duration = 3000, onClose }: ToastProps) {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    // Trigger enter animation
    const show = requestAnimationFrame(() => setVisible(true));
    const hide = setTimeout(() => {
      setVisible(false);
      setTimeout(onClose, 300);
    }, duration);
    return () => { cancelAnimationFrame(show); clearTimeout(hide); };
  }, [duration, onClose]);

  return (
    <div className={`flex items-center gap-3 px-4 py-3 rounded-2xl border shadow-lg shadow-slate-200/60 text-sm font-medium transition-all duration-300 ${STYLES[type]} ${
      visible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-2"
    }`}>
      {ICONS[type]}
      <span className="flex-1">{message}</span>
      <button onClick={() => { setVisible(false); setTimeout(onClose, 300); }} className="ml-1 p-0.5 rounded-lg hover:bg-slate-100 transition-colors">
        <X size={13} className="text-slate-400" />
      </button>
    </div>
  );
}

// ─── Toast container — fixed bottom-right ─────────────────────────────────────

interface ToastItem { id: string; message: string; type: ToastType }

interface ToastContainerProps { toasts: ToastItem[]; onRemove: (id: string) => void }

export function ToastContainer({ toasts, onRemove }: ToastContainerProps) {
  if (toasts.length === 0) return null;
  return (
    <div className="fixed bottom-6 right-4 sm:right-6 z-50 flex flex-col gap-2 max-w-sm w-full pointer-events-none">
      {toasts.map(t => (
        <div key={t.id} className="pointer-events-auto">
          <Toast message={t.message} type={t.type} onClose={() => onRemove(t.id)} />
        </div>
      ))}
    </div>
  );
}

// ─── useToast hook ────────────────────────────────────────────────────────────

export function useToast() {
  const [toasts, setToasts] = useState<ToastItem[]>([]);

  const add = (message: string, type: ToastType = "success") => {
    const id = `${Date.now()}-${Math.random()}`;
    setToasts(prev => [...prev, { id, message, type }]);
  };

  const remove = (id: string) => setToasts(prev => prev.filter(t => t.id !== id));

  return { toasts, toast: add, removeToast: remove };
}
