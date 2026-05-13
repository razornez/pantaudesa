"use client";

import { useCallback, useEffect, useState } from "react";
import { Eye, EyeOff } from "lucide-react";
import type { DesaComponentData } from "./types";
import {
  fetchDesaComponentData,
  saveComponentVisibility,
} from "./api";

export function ComponentVisibilityPanel({ desaId }: { desaId: string }) {
  const [data, setData] = useState<DesaComponentData | null>(null);
  const [loading, setLoading] = useState(true);
  const [toggling, setToggling] = useState<string | null>(null);

  const load = useCallback(() => {
    setLoading(true);
    fetchDesaComponentData(desaId)
      .then((payload) => {
        setData(payload);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, [desaId]);

  useEffect(() => {
    let cancelled = false;

    fetchDesaComponentData(desaId)
      .then((payload) => {
        if (!cancelled) {
          setData(payload);
          setLoading(false);
        }
      })
      .catch(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [desaId]);

  const toggle = async (componentId: string, currentlyVisible: boolean) => {
    if (data?.source !== "db") return;
    setToggling(componentId);

    const newVisible = !currentlyVisible;
    setData((previous) => {
      if (!previous) return previous;

      if (newVisible) {
        const component = previous.hiddenComponents.find(
          (item) => item.componentId === componentId,
        );
        if (!component) return previous;

        return {
          ...previous,
          hiddenComponents: previous.hiddenComponents.filter(
            (item) => item.componentId !== componentId,
          ),
          visibleComponents: [
            ...previous.visibleComponents,
            {
              componentId: component.componentId,
              componentKey: component.componentKey,
              label: component.label,
              displayOrder: component.displayOrder,
              fieldCount: 0,
            },
          ],
        };
      }

      const component = previous.visibleComponents.find(
        (item) => item.componentId === componentId,
      );
      if (!component) return previous;

      return {
        ...previous,
        visibleComponents: previous.visibleComponents.filter(
          (item) => item.componentId !== componentId,
        ),
        hiddenComponents: [
          ...previous.hiddenComponents,
          {
            componentId: component.componentId,
            componentKey: component.componentKey,
            label: component.label,
            displayOrder: component.displayOrder,
          },
        ],
      };
    });

    try {
      await saveComponentVisibility({ desaId, componentId, isVisible: newVisible });
      const payload = await fetchDesaComponentData(desaId);
      setData((previous) => (previous ? payload : previous));
    } catch {
      load();
    } finally {
      setToggling(null);
    }
  };

  if (loading) {
    return (
      <div
        className="rounded-2xl bg-white/60 px-4 py-3 animate-pulse h-16"
        style={{ boxShadow: "inset 0 0 0 1px rgba(15,23,42,0.05)" }}
      />
    );
  }

  if (!data) return null;

  const allComponents = [
    ...data.visibleComponents.map((component) => ({ ...component, isVisible: true })),
    ...data.hiddenComponents.map((component) => ({
      ...component,
      fieldCount: 0,
      isVisible: false,
    })),
  ].sort((left, right) => left.displayOrder - right.displayOrder);

  return (
    <div
      className="rounded-2xl bg-white/70 px-4 py-3 space-y-2.5"
      style={{ boxShadow: "inset 0 0 0 1px rgba(15,23,42,0.05)" }}
    >
      <div className="flex items-center justify-between gap-2">
        <p className="text-[11px] font-semibold text-slate-500 uppercase tracking-widest">
          Visibilitas Komponen
        </p>
        <span className="text-[10.5px] text-slate-400">{data.templateName}</span>
        {data.source === "fallback" ? (
          <span
            className="text-[10px] text-amber-600 bg-amber-50 px-2 py-0.5 rounded-full"
            style={{ boxShadow: "inset 0 0 0 1px rgba(217,119,6,0.15)" }}
          >
            Migrasi belum aktif
          </span>
        ) : null}
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5">
        {allComponents.map((component) => (
          <div
            key={component.componentId}
            className={`flex items-center justify-between gap-2 rounded-xl px-3 py-2 ${
              component.isVisible ? "bg-slate-50/80" : "bg-rose-50/60"
            }`}
            style={{ boxShadow: "inset 0 0 0 1px rgba(15,23,42,0.05)" }}
          >
            <div className="flex items-center gap-2 min-w-0">
              {component.isVisible ? (
                <Eye size={12} className="text-emerald-500 flex-shrink-0" aria-hidden />
              ) : (
                <EyeOff size={12} className="text-rose-400 flex-shrink-0" aria-hidden />
              )}
              <span className="text-[12px] text-slate-700 truncate font-medium">
                {component.label}
              </span>
              {component.fieldCount > 0 ? (
                <span className="text-[10px] text-slate-400 tabular-nums flex-shrink-0">
                  {component.fieldCount}f
                </span>
              ) : null}
            </div>
            {data.source === "db" ? (
              <button
                type="button"
                disabled={toggling === component.componentId}
                onClick={() => void toggle(component.componentId, component.isVisible)}
                className={`flex-shrink-0 text-[10.5px] px-2 py-0.5 rounded-lg font-medium transition-colors ${
                  component.isVisible
                    ? "text-rose-600 hover:bg-rose-100"
                    : "text-emerald-600 hover:bg-emerald-100"
                } disabled:opacity-40`}
              >
                {toggling === component.componentId
                  ? "..."
                  : component.isVisible
                    ? "Sembunyikan"
                    : "Tampilkan"}
              </button>
            ) : (
              <span className="text-[10px] text-slate-300">-</span>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
