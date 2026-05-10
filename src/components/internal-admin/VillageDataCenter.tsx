"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useRouter, usePathname, useSearchParams } from "next/navigation";
import {
  BookOpen, Database, Clock, ChevronRight, ExternalLink,
  CheckCircle2, Clock3, AlertCircle, LayoutGrid,
} from "lucide-react";
import { DEFAULT_TEMPLATE_KEY, DEFAULT_TEMPLATE_NAME } from "@/lib/village-data/template-constants";

// ─── Types ────────────────────────────────────────────────────────────────────

type Tab = "standards" | "desa-data" | "versions";

interface FieldStandard {
  sectionKey: string; sectionLabel: string; fieldKey: string; fieldLabel: string;
  publishableNow: boolean; aiDetectable: boolean; currentModelSource: string;
  sourceRequirement?: string; validationRequirement?: string; deferredReason?: string | null;
}

interface FieldStandardsData {
  templateKey: string; templateName: string;
  totalFields: number; publishableCount: number; holdCount: number;
  sections: Array<{ sectionKey: string; sectionLabel: string; fields: FieldStandard[] }>;
}

interface DesaRow {
  id: string; nama: string; slug: string; kecamatan: string; kabupaten: string;
  provinsi: string; websiteUrl: string | null; kategori: string | null;
  tahunData: number | null; jumlahPenduduk: number | null;
  dataStatus: string; dataSourceLabel: string | null; dataPublishedAt: string | null;
  _count: { villageDataVersions: number };
}

interface VersionRow {
  id: string; desaId: string; versionNumber: number; status: string; title: string;
  sourceLabel: string | null; changedFields: string[]; reviewNote: string | null;
  publishedAt: string | null; createdAt: string;
  desa: { nama: string; kecamatan: string; kabupaten: string };
}

interface AuditRow {
  id: string; desaId: string; eventType: string; eventLabel: string | null;
  actorRole: string | null; note: string | null; createdAt: string;
  desa: { nama: string };
}

// ─── VillageDataCenter ────────────────────────────────────────────────────────

export function VillageDataCenter({ initialTab }: { initialTab: Tab }) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [activeTab, setActiveTab] = useState<Tab>(initialTab);

  const switchTab = useCallback((tab: Tab) => {
    setActiveTab(tab);
    const params = new URLSearchParams(searchParams.toString());
    params.set("tab", tab);
    router.replace(`${pathname}?${params.toString()}`, { scroll: false });
  }, [router, pathname, searchParams]);

  return (
    <>
      {/* Sticky header */}
      <header className="sticky top-0 z-40 glass" style={{ borderRadius: 0 }}>
        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-3 flex items-center gap-3 sm:gap-4">
          <div className="hidden sm:flex items-center gap-2 text-[12px] text-slate-500 min-w-0">
            <span className="font-semibold text-slate-900">Admin</span>
            <ChevronRight size={10} aria-hidden />
            <span className="text-slate-900 font-medium">Data Desa</span>
          </div>
          <div className="hidden lg:flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white/60 text-[11px] text-slate-500"
            style={{ boxShadow: "inset 0 0 0 1px rgba(15,23,42,0.06)" }}>
            <Database size={11} aria-hidden className="text-[#1E1B4B]" />
            <span className="ml-0.5 font-medium text-slate-700">{DEFAULT_TEMPLATE_KEY}</span>
          </div>
          <div className="flex-1" />
          <span className="text-[11px] text-slate-400 hidden sm:inline">
            Foundation · template-aware
          </span>
        </div>
      </header>

      <div className="space-y-6">
        {/* Page header */}
        <div className="pt-2">
          <p className="eyebrow mb-1.5">Data Desa · Admin Center</p>
          <h1 className="text-[24px] sm:text-[28px] font-semibold text-slate-900 leading-tight" style={{ letterSpacing: "-0.02em" }}>
            Manajemen Data & Template Desa
          </h1>
          <p className="text-[13px] text-slate-500 mt-1.5 max-w-2xl">
            Foundation untuk sistem data desa yang fleksibel. Saat ini semua desa memakai{" "}
            <span className="font-medium text-slate-700">{DEFAULT_TEMPLATE_NAME}</span>.
          </p>
        </div>

        {/* Tab bar */}
        <div className="flex items-center gap-1 p-1 rounded-2xl bg-slate-50 w-fit"
          style={{ boxShadow: "inset 0 0 0 1px rgba(15,23,42,0.06)" }}>
          <TabButton tab="standards" active={activeTab} icon={<BookOpen size={13} />} label="Standar Detail" onClick={switchTab} />
          <TabButton tab="desa-data" active={activeTab} icon={<LayoutGrid size={13} />} label="Data per Desa" onClick={switchTab} />
          <TabButton tab="versions" active={activeTab} icon={<Clock size={13} />} label="Versi & Audit" onClick={switchTab} />
        </div>

        {/* Tab content */}
        {activeTab === "standards" && <StandardsTab />}
        {activeTab === "desa-data" && <DesaDataTab />}
        {activeTab === "versions" && <VersionsTab />}
      </div>
    </>
  );
}

// ─── TabButton ────────────────────────────────────────────────────────────────

function TabButton({ tab, active, icon, label, onClick }: {
  tab: Tab; active: Tab; icon: React.ReactNode; label: string; onClick: (t: Tab) => void;
}) {
  const isActive = tab === active;
  return (
    <button
      type="button"
      onClick={() => onClick(tab)}
      className={`inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-[12px] font-medium transition-all duration-150 ${
        isActive ? "bg-[#1E1B4B] text-white shadow-sm" : "text-slate-500 hover:bg-white/70 hover:text-slate-900"
      }`}
    >
      {icon}{label}
    </button>
  );
}

// ─── Tab 1: Standar Detail ────────────────────────────────────────────────────

function StandardsTab() {
  const [data, setData] = useState<FieldStandardsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetch("/api/internal-admin/village-data/field-standards")
      .then(r => r.json())
      .then(d => { setData(d); setLoading(false); })
      .catch(() => { setError("Gagal memuat standar field."); setLoading(false); });
  }, []);

  if (loading) return <SkeletonCards count={3} />;
  if (error || !data) return <ErrorNotice message={error ?? "Gagal memuat data."} />;

  return (
    <div className="space-y-5">
      {/* Template ribbon */}
      <section className="rounded-3xl bg-white p-6"
        style={{ boxShadow: "inset 0 0 0 1px rgba(15,23,42,0.06), 0 1px 1px rgba(15,23,42,0.03), 0 2px 4px rgba(15,23,42,0.04), 0 8px 20px -8px rgba(15,23,42,0.06)" }}>
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <p className="eyebrow text-indigo-600 mb-1.5">Template aktif · MVP</p>
            <h2 className="text-[18px] font-semibold text-slate-900 leading-tight">{data.templateName}</h2>
            <p className="text-[12px] text-slate-500 mt-1">{data.templateKey}</p>
          </div>
          <div className="flex flex-wrap gap-2">
            <StatPill color="emerald" count={data.publishableCount} label="siap terbit" />
            <StatPill color="amber" count={data.holdCount} label="belum bisa terbit" />
            <StatPill color="slate" count={data.totalFields} label="total field" />
          </div>
        </div>
        <div className="mt-4 pt-4 border-t border-slate-100 flex items-start gap-3">
          <div className="w-8 h-8 rounded-full bg-gradient-to-br from-indigo-50 to-emerald-50 flex items-center justify-center flex-shrink-0"
            style={{ boxShadow: "inset 0 0 0 1px rgba(15,23,42,0.06)" }}>
            <Database size={13} className="text-[#1E1B4B]" aria-hidden />
          </div>
          <p className="text-[12px] text-slate-600">
            <span className="font-semibold text-slate-900">Saat ini:</span> semua desa memakai template ini.{" "}
            <span className="text-slate-400">Setelah migrasi schema disetujui, setiap desa bisa mendapatkan template berbeda.</span>
          </p>
        </div>
      </section>

      {/* Per-section field cards */}
      {data.sections.map(section => (
        <section key={section.sectionKey} className="rounded-3xl bg-white p-6"
          style={{ boxShadow: "inset 0 0 0 1px rgba(15,23,42,0.06), 0 1px 1px rgba(15,23,42,0.03), 0 2px 4px rgba(15,23,42,0.04), 0 8px 20px -8px rgba(15,23,42,0.06)" }}>
          <div className="flex items-center justify-between mb-4">
            <div>
              <p className="eyebrow mb-1">{section.sectionLabel}</p>
              <p className="text-[12px] text-slate-500">{section.fields.length} field</p>
            </div>
            <span className="text-[11px] text-slate-400 tabular-nums">
              {section.fields.filter(f => f.publishableNow).length}/{section.fields.length} publishable
            </span>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {section.fields.map(field => (
              <div key={field.fieldKey}
                className={`rounded-2xl p-4 ${field.publishableNow ? "bg-emerald-50/40" : "bg-slate-50/60"}`}
                style={{ boxShadow: "inset 0 0 0 1px rgba(15,23,42,0.05)" }}>
                <div className="flex items-start justify-between gap-2 mb-1.5">
                  <p className="text-[13px] font-semibold text-slate-900">{field.fieldLabel}</p>
                  <FieldStatusPill publishable={field.publishableNow} />
                </div>
                <p className="text-[11px] text-slate-400 font-mono mb-2">{field.fieldKey}</p>
                {field.sourceRequirement && (
                  <p className="text-[11px] text-slate-500 leading-relaxed">
                    <span className="font-medium">Sumber:</span> {field.sourceRequirement}
                  </p>
                )}
                {!field.publishableNow && (
                  <p className="text-[11px] text-amber-700 mt-1.5">
                    Bisa dibaca dari dokumen, tapi belum ada tempat untuk menyimpannya di data publik desa. Masih dalam pengembangan.
                  </p>
                )}
              </div>
            ))}
          </div>
        </section>
      ))}
    </div>
  );
}

// ─── Tab 2: Data per Desa ─────────────────────────────────────────────────────

function DesaDataTab() {
  const [desa, setDesa] = useState<DesaRow[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [query, setQuery] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [expanded, setExpanded] = useState<string | null>(null);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const fetchData = useCallback((q: string, p: number) => {
    setLoading(true);
    const params = new URLSearchParams();
    if (q) params.set("q", q);
    params.set("page", String(p));
    fetch(`/api/internal-admin/village-data/desa-data?${params.toString()}`)
      .then(r => r.json())
      .then(d => { setDesa(d.desa ?? []); setTotal(d.total ?? 0); setLoading(false); })
      .catch(() => { setError("Gagal memuat data desa."); setLoading(false); });
  }, []);

  // eslint-disable-next-line react-hooks/set-state-in-effect
  useEffect(() => { fetchData("", 1); }, [fetchData]);

  const handleSearch = (q: string) => {
    setQuery(q);
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => { setPage(1); fetchData(q, 1); }, 300);
  };

  if (error) return <ErrorNotice message={error} />;

  const totalPages = Math.ceil(total / 20);

  return (
    <div className="space-y-4">
      {/* Search */}
      <div className="relative">
        <input type="text" value={query} onChange={e => handleSearch(e.target.value)}
          className="field-lux text-sm pr-8" placeholder="Cari nama desa, kecamatan, atau kabupaten..." />
        {loading && (
          <span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2">
            <span className="block h-3.5 w-3.5 animate-spin rounded-full border-2 border-slate-200 border-t-indigo-500" />
          </span>
        )}
      </div>

      {/* Summary */}
      {!loading && (
        <p className="text-[12px] text-slate-500 tabular-nums">
          {total.toLocaleString("id-ID")} desa {query && `· hasil pencarian "${query}"`}
        </p>
      )}

      {/* Desa list */}
      {loading && desa.length === 0 ? (
        <SkeletonCards count={5} height="h-16" />
      ) : desa.length === 0 ? (
        <EmptyState icon={<Database size={20} />} title="Tidak ada desa ditemukan" note={query ? `Tidak ada hasil untuk "${query}".` : "Belum ada data desa."} />
      ) : (
        <section className="rounded-3xl bg-white overflow-hidden"
          style={{ boxShadow: "inset 0 0 0 1px rgba(15,23,42,0.06), 0 1px 1px rgba(15,23,42,0.03), 0 2px 4px rgba(15,23,42,0.04), 0 8px 20px -8px rgba(15,23,42,0.06)" }}>
          <div className="hidden sm:grid px-6 py-3 border-b border-slate-100 text-[10.5px] uppercase tracking-[0.14em] font-semibold text-slate-400"
            style={{ gridTemplateColumns: "1fr 120px 80px 100px" }}>
            <span>Desa</span>
            <span>Field terisi</span>
            <span>Versi</span>
            <span>Dipublish</span>
          </div>
          <div>
            {desa.map((d, i) => {
              const filledCount = [d.websiteUrl, d.kategori, d.tahunData, d.jumlahPenduduk].filter(Boolean).length;
              const isExpanded = expanded === d.id;
              return (
                <div key={d.id} className={`border-b border-slate-50 last:border-b-0 ${i % 2 === 0 ? "" : "bg-slate-50/30"}`}>
                  {/* Row */}
                  <button type="button" onClick={() => setExpanded(isExpanded ? null : d.id)}
                    className="w-full text-left px-4 sm:px-6 py-3.5 hover:bg-indigo-50/30 transition-colors duration-150">
                    {/* Mobile */}
                    <div className="sm:hidden flex items-start justify-between gap-2">
                      <div>
                        <p className="text-[13px] font-semibold text-slate-900">{d.nama}</p>
                        <p className="text-[11px] text-slate-500">{d.kecamatan}, {d.kabupaten}</p>
                      </div>
                      <DesaStatusPill status={d.dataStatus} />
                    </div>
                    {/* Desktop */}
                    <div className="hidden sm:grid items-center gap-4"
                      style={{ gridTemplateColumns: "1fr 120px 80px 100px" }}>
                      <div className="min-w-0">
                        <p className="text-[13px] font-semibold text-slate-900 truncate">{d.nama}</p>
                        <p className="text-[11px] text-slate-400">{d.kecamatan}, {d.kabupaten}</p>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <div className="h-1.5 flex-1 max-w-[60px] rounded-full bg-slate-100 overflow-hidden">
                          <div className="h-full bg-emerald-500 rounded-full"
                            style={{ width: `${Math.round((filledCount / 7) * 100)}%` }} />
                        </div>
                        <span className="text-[11px] text-slate-500 tabular-nums">{filledCount}/7</span>
                      </div>
                      <span className="text-[11.5px] text-slate-600 tabular-nums">{d._count.villageDataVersions}</span>
                      <span className="text-[11px] text-slate-500">
                        {d.dataPublishedAt ? new Date(d.dataPublishedAt).toLocaleDateString("id-ID", { day: "numeric", month: "short", year: "numeric" }) : "—"}
                      </span>
                    </div>
                  </button>

                  {/* Expanded detail */}
                  {isExpanded && (
                    <div className="px-4 sm:px-6 pb-4 pt-1 bg-indigo-50/20 border-t border-indigo-100/60">
                      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 mb-3">
                        <FieldValue label="Website" value={d.websiteUrl} />
                        <FieldValue label="Kategori" value={d.kategori} />
                        <FieldValue label="Tahun data" value={d.tahunData ? String(d.tahunData) : null} />
                        <FieldValue label="Penduduk" value={d.jumlahPenduduk ? d.jumlahPenduduk.toLocaleString("id-ID") + " jiwa" : null} />
                      </div>
                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-3">
                        <FieldValue label="Kecamatan" value={d.kecamatan} />
                        <FieldValue label="Kabupaten" value={d.kabupaten} />
                        <FieldValue label="Provinsi" value={d.provinsi} />
                      </div>
                      <div className="flex items-center gap-2 mt-2">
                        <a href={`/internal-admin/intake?desaId=${d.id}`}
                          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-[11.5px] font-medium bg-white text-indigo-700 hover:bg-indigo-50 transition-colors"
                          style={{ boxShadow: "inset 0 0 0 1px rgba(67,56,202,0.15)" }}>
                          <ExternalLink size={11} aria-hidden /> Buka di Intake
                        </a>
                        {d.dataSourceLabel && (
                          <span className="text-[11px] text-slate-400">Sumber: {d.dataSourceLabel}</span>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </section>
      )}

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between text-[12px] text-slate-500">
          <span>Halaman {page} dari {totalPages}</span>
          <div className="flex gap-2">
            <button type="button" disabled={page <= 1}
              onClick={() => { const p = page - 1; setPage(p); fetchData(query, p); }}
              className="px-3 py-1.5 rounded-xl bg-white text-slate-700 disabled:opacity-40 hover:bg-slate-50 transition-colors"
              style={{ boxShadow: "inset 0 0 0 1px rgba(15,23,42,0.08)" }}>
              ← Sebelumnya
            </button>
            <button type="button" disabled={page >= totalPages}
              onClick={() => { const p = page + 1; setPage(p); fetchData(query, p); }}
              className="px-3 py-1.5 rounded-xl bg-white text-slate-700 disabled:opacity-40 hover:bg-slate-50 transition-colors"
              style={{ boxShadow: "inset 0 0 0 1px rgba(15,23,42,0.08)" }}>
              Berikutnya →
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

// ─── Tab 3: Versi & Audit ─────────────────────────────────────────────────────

function VersionsTab() {
  const [versions, setVersions] = useState<VersionRow[]>([]);
  const [auditEvents, setAuditEvents] = useState<AuditRow[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [desaFilter, setDesaFilter] = useState("");
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const fetchData = useCallback((desaId: string) => {
    setLoading(true);
    const params = new URLSearchParams();
    if (desaId) params.set("desaId", desaId);
    fetch(`/api/internal-admin/village-data/versions?${params.toString()}`)
      .then(r => r.json())
      .then(d => {
        setVersions(d.versions ?? []);
        setAuditEvents(d.auditEvents ?? []);
        setTotal(d.total ?? 0);
        setLoading(false);
      })
      .catch(() => { setError("Gagal memuat riwayat versi."); setLoading(false); });
  }, []);

  // eslint-disable-next-line react-hooks/set-state-in-effect
  useEffect(() => { fetchData(""); }, [fetchData]);

  if (error) return <ErrorNotice message={error} />;

  return (
    <div className="space-y-5">
      {/* Filter */}
      <div className="relative max-w-sm">
        <input type="text" value={desaFilter}
          onChange={e => {
            setDesaFilter(e.target.value);
            if (debounceRef.current) clearTimeout(debounceRef.current);
            debounceRef.current = setTimeout(() => fetchData(e.target.value), 400);
          }}
          className="field-lux text-sm" placeholder="Filter berdasarkan ID desa..." />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-[1.1fr_1fr] gap-5">
        {/* Versions */}
        <section className="rounded-3xl bg-white p-6"
          style={{ boxShadow: "inset 0 0 0 1px rgba(15,23,42,0.06), 0 1px 1px rgba(15,23,42,0.03), 0 2px 4px rgba(15,23,42,0.04), 0 8px 20px -8px rgba(15,23,42,0.06)" }}>
          <p className="eyebrow text-indigo-600 mb-1.5">Riwayat versi</p>
          <h3 className="text-[17px] font-semibold text-slate-900 mb-4">
            {total > 0 ? `${total} versi data tersimpan` : "Riwayat versi"}
          </h3>
          {loading ? <SkeletonCards count={3} height="h-14" /> : versions.length === 0 ? (
            <EmptyState icon={<Clock3 size={18} />}
              title="Belum ada riwayat versi"
              note="Versi akan muncul setelah intake dikirim ke review dan diproses." />
          ) : (
            <div className="space-y-2.5">
              {versions.map(v => (
                <div key={v.id} className="rounded-2xl p-4 bg-slate-50/60"
                  style={{ boxShadow: "inset 0 0 0 1px rgba(15,23,42,0.05)" }}>
                  <div className="flex items-start justify-between gap-2 mb-1.5">
                    <div className="min-w-0 flex-1">
                      <p className="text-[12.5px] font-semibold text-slate-900 truncate">{v.title}</p>
                      <p className="text-[11px] text-slate-400">{v.desa.nama} · {v.desa.kecamatan}</p>
                    </div>
                    <VersionStatusPill status={v.status} />
                  </div>
                  <div className="flex flex-wrap items-center gap-3 text-[11px] text-slate-500">
                    <span className="tabular-nums">v{v.versionNumber}</span>
                    {v.changedFields.length > 0 && (
                      <span>{v.changedFields.length} field berubah</span>
                    )}
                    <span>{new Date(v.createdAt).toLocaleDateString("id-ID", { day: "numeric", month: "short", year: "numeric" })}</span>
                  </div>
                  {v.changedFields.length > 0 && (
                    <div className="flex flex-wrap gap-1 mt-2">
                      {v.changedFields.slice(0, 4).map(f => (
                        <span key={f} className="px-1.5 py-0.5 rounded-md text-[10px] bg-indigo-50 text-indigo-700"
                          style={{ boxShadow: "inset 0 0 0 1px rgba(67,56,202,0.12)" }}>
                          {f}
                        </span>
                      ))}
                      {v.changedFields.length > 4 && (
                        <span className="text-[10px] text-slate-400">+{v.changedFields.length - 4}</span>
                      )}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </section>

        {/* Audit feed */}
        <section className="rounded-3xl bg-white p-6"
          style={{ boxShadow: "inset 0 0 0 1px rgba(15,23,42,0.06), 0 1px 1px rgba(15,23,42,0.03), 0 2px 4px rgba(15,23,42,0.04), 0 8px 20px -8px rgba(15,23,42,0.06)" }}>
          <p className="eyebrow text-amber-700 mb-1.5">Audit trail</p>
          <h3 className="text-[17px] font-semibold text-slate-900 mb-4">Aktivitas terbaru</h3>
          {loading ? <SkeletonCards count={4} height="h-12" /> : auditEvents.length === 0 ? (
            <EmptyState icon={<AlertCircle size={18} />}
              title="Belum ada aktivitas"
              note="Audit event akan tercatat setelah intake diproses atau data diterbitkan." />
          ) : (
            <div className="space-y-2">
              {auditEvents.map(ev => (
                <div key={ev.id} className="flex items-start gap-3 py-2.5 border-b border-slate-50 last:border-b-0">
                  <div className="w-1.5 h-1.5 rounded-full bg-indigo-400 mt-1.5 flex-shrink-0" />
                  <div className="min-w-0 flex-1">
                    <p className="text-[12px] font-medium text-slate-900">
                      {ev.eventLabel ?? ev.eventType}
                    </p>
                    <p className="text-[11px] text-slate-400">{ev.desa.nama} · {ev.actorRole ?? "system"}</p>
                    {ev.note && <p className="text-[11px] text-slate-500 mt-0.5 truncate">{ev.note}</p>}
                  </div>
                  <span className="text-[10.5px] text-slate-400 flex-shrink-0 tabular-nums">
                    {new Date(ev.createdAt).toLocaleDateString("id-ID", { day: "numeric", month: "short" })}
                  </span>
                </div>
              ))}
            </div>
          )}
        </section>
      </div>
    </div>
  );
}

// ─── Shared micro-components ──────────────────────────────────────────────────

function StatPill({ color, count, label }: { color: "emerald" | "amber" | "slate"; count: number; label: string }) {
  const styles = {
    emerald: "bg-emerald-50 text-emerald-900 shadow-[inset_0_0_0_1px_rgba(5,95,70,0.12)]",
    amber:   "bg-amber-50 text-amber-900 shadow-[inset_0_0_0_1px_rgba(146,64,14,0.14)]",
    slate:   "bg-slate-100 text-slate-700 shadow-[inset_0_0_0_1px_rgba(15,23,42,0.08)]",
  };
  return (
    <span className={`inline-flex items-center gap-1 px-2.5 py-1.5 rounded-xl text-[11.5px] font-semibold ${styles[color]}`}>
      <span className="tabular-nums font-bold">{count}</span> {label}
    </span>
  );
}

function FieldStatusPill({ publishable }: { publishable: boolean }) {
  return publishable ? (
    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-100 text-emerald-800 flex-shrink-0">
      <CheckCircle2 size={9} aria-hidden /> publishable
    </span>
  ) : (
    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-amber-50 text-amber-800 flex-shrink-0"
      style={{ boxShadow: "inset 0 0 0 1px rgba(180,83,9,0.14)" }}>
      <Clock3 size={9} aria-hidden /> belum bisa terbit
    </span>
  );
}

function DesaStatusPill({ status }: { status: string }) {
  const map: Record<string, string> = {
    verified:     "pill-ok",
    needs_review: "pill-warn",
    demo:         "pill-info",
    imported:     "pill-info",
    outdated:     "pill-warn",
    rejected:     "pill-danger",
  };
  return (
    <span className={`${map[status] ?? "pill-info"} inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-semibold`}>
      {status}
    </span>
  );
}

function VersionStatusPill({ status }: { status: string }) {
  const map: Record<string, { cls: string; label: string }> = {
    PUBLISHED:    { cls: "bg-emerald-50 text-emerald-800 shadow-[inset_0_0_0_1px_rgba(5,95,70,0.12)]", label: "Diterbitkan" },
    REVIEW_READY: { cls: "bg-indigo-50 text-[#1E1B4B] shadow-[inset_0_0_0_1px_rgba(67,56,202,0.12)]", label: "Siap review" },
    REJECTED:     { cls: "bg-rose-50 text-rose-800 shadow-[inset_0_0_0_1px_rgba(159,18,57,0.12)]", label: "Ditolak" },
    REPLACED:     { cls: "bg-slate-100 text-slate-600 shadow-[inset_0_0_0_1px_rgba(15,23,42,0.08)]", label: "Digantikan" },
    FAILED:       { cls: "bg-rose-50 text-rose-800 shadow-[inset_0_0_0_1px_rgba(159,18,57,0.12)]", label: "Gagal" },
  };
  const s = map[status] ?? { cls: "bg-slate-100 text-slate-600", label: status };
  return <span className={`inline-flex px-2 py-0.5 rounded-full text-[10px] font-semibold flex-shrink-0 ${s.cls}`}>{s.label}</span>;
}

function FieldValue({ label, value }: { label: string; value: string | null | undefined }) {
  return (
    <div className="rounded-xl px-3 py-2.5 bg-white" style={{ boxShadow: "inset 0 0 0 1px rgba(15,23,42,0.05)" }}>
      <p className="text-[10px] uppercase tracking-[0.12em] text-slate-400 font-semibold mb-0.5">{label}</p>
      <p className="text-[12.5px] font-medium text-slate-900 truncate">
        {value ?? <span className="text-slate-300 font-normal italic">— belum diisi</span>}
      </p>
    </div>
  );
}

function SkeletonCards({ count, height = "h-28" }: { count: number; height?: string }) {
  return (
    <div className="grid grid-cols-1 gap-3 animate-pulse">
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className={`rounded-2xl bg-slate-100 ${height}`} />
      ))}
    </div>
  );
}

function EmptyState({ icon, title, note }: { icon: React.ReactNode; title: string; note: string }) {
  return (
    <div className="rounded-2xl border border-dashed border-slate-200 py-10 px-6 flex flex-col items-center gap-2 text-center">
      <span className="text-slate-300">{icon}</span>
      <p className="text-[13px] font-semibold text-slate-600">{title}</p>
      <p className="text-[12px] text-slate-400 max-w-xs">{note}</p>
    </div>
  );
}

function ErrorNotice({ message }: { message: string }) {
  return (
    <div className="notice-card notice-danger flex items-start gap-2 text-sm">
      <AlertCircle size={14} className="mt-0.5 shrink-0" aria-hidden />
      <span>{message}</span>
    </div>
  );
}
