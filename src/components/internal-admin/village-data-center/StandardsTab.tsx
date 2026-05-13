"use client";

import { useEffect, useState } from "react";
import { Database } from "lucide-react";
import type { FieldStandardsData } from "./types";
import { fetchFieldStandards } from "./api";
import { ErrorNotice, FieldStatusPill, SkeletonCards, StatPill } from "./shared";

export function StandardsTab() {
  const [data, setData] = useState<FieldStandardsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchFieldStandards()
      .then((payload: FieldStandardsData) => {
        setData(payload);
        setLoading(false);
      })
      .catch(() => {
        setError("Gagal memuat standar field.");
        setLoading(false);
      });
  }, []);

  if (loading) return <SkeletonCards count={3} />;
  if (error || !data) return <ErrorNotice message={error ?? "Gagal memuat data."} />;

  return (
    <div className="space-y-5">
      <section
        className="rounded-3xl bg-white p-6"
        style={{
          boxShadow:
            "inset 0 0 0 1px rgba(15,23,42,0.06), 0 1px 1px rgba(15,23,42,0.03), 0 2px 4px rgba(15,23,42,0.04), 0 8px 20px -8px rgba(15,23,42,0.06)",
        }}
      >
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <p className="eyebrow text-indigo-600 mb-1.5">Template aktif · MVP</p>
            <h2 className="text-[18px] font-semibold text-slate-900 leading-tight">
              {data.templateName}
            </h2>
            <p className="text-[12px] text-slate-500 mt-1">{data.templateKey}</p>
          </div>
          <div className="flex flex-wrap gap-2">
            <StatPill color="emerald" count={data.publishableCount} label="siap terbit" />
            <StatPill color="amber" count={data.holdCount} label="belum bisa terbit" />
            <StatPill color="slate" count={data.totalFields} label="total field" />
          </div>
        </div>
        <div className="mt-4 pt-4 border-t border-slate-100 flex items-start gap-3">
          <div
            className="w-8 h-8 rounded-full bg-gradient-to-br from-indigo-50 to-emerald-50 flex items-center justify-center flex-shrink-0"
            style={{ boxShadow: "inset 0 0 0 1px rgba(15,23,42,0.06)" }}
          >
            <Database size={13} className="text-[#1E1B4B]" aria-hidden />
          </div>
          <p className="text-[12px] text-slate-600">
            <span className="font-semibold text-slate-900">Saat ini:</span> semua desa
            memakai template ini.{" "}
            <span className="text-slate-400">
              Setelah migrasi schema disetujui, setiap desa bisa mendapatkan template
              berbeda.
            </span>
          </p>
        </div>
      </section>

      {(data.sections ?? []).map((section) => (
        <section
          key={section.sectionKey}
          className="rounded-3xl bg-white p-6"
          style={{
            boxShadow:
              "inset 0 0 0 1px rgba(15,23,42,0.06), 0 1px 1px rgba(15,23,42,0.03), 0 2px 4px rgba(15,23,42,0.04), 0 8px 20px -8px rgba(15,23,42,0.06)",
          }}
        >
          <div className="flex items-center justify-between mb-4">
            <div>
              <p className="eyebrow mb-1">{section.sectionLabel}</p>
              <p className="text-[12px] text-slate-500">{section.fields.length} field</p>
            </div>
            <span className="text-[11px] text-slate-400 tabular-nums">
              {section.fields.filter((field) => field.publishableNow).length}/
              {section.fields.length} publishable
            </span>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {section.fields.map((field) => (
              <div
                key={field.fieldKey}
                className={`rounded-2xl p-4 ${field.publishableNow ? "bg-emerald-50/40" : "bg-slate-50/60"}`}
                style={{ boxShadow: "inset 0 0 0 1px rgba(15,23,42,0.05)" }}
              >
                <div className="flex items-start justify-between gap-2 mb-1.5">
                  <p className="text-[13px] font-semibold text-slate-900">
                    {field.fieldLabel}
                  </p>
                  <FieldStatusPill publishable={field.publishableNow} />
                </div>
                <p className="text-[11px] text-slate-400 font-mono mb-2">{field.fieldKey}</p>
                {field.sourceRequirement ? (
                  <p className="text-[11px] text-slate-500 leading-relaxed">
                    <span className="font-medium">Sumber:</span> {field.sourceRequirement}
                  </p>
                ) : null}
                {!field.publishableNow ? (
                  <p className="text-[11px] text-amber-700 mt-1.5">
                    Bisa dibaca dari dokumen, tapi belum ada tempat untuk menyimpannya di
                    data publik desa. Masih dalam pengembangan.
                  </p>
                ) : null}
              </div>
            ))}
          </div>
        </section>
      ))}
    </div>
  );
}
