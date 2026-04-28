"use client";

import { useState, useMemo } from "react";
import Image from "next/image";
import { LayoutGrid, List } from "lucide-react";
import SearchFilterBar from "@/components/desa/SearchFilterBar";
import DesaCard from "@/components/desa/DesaCard";
import DesaTable from "@/components/desa/DesaTable";
import { mockDesa, provinsiList } from "@/lib/mock-data";
import { StatusSerapan, SortField, SortOrder } from "@/lib/types";
import { ASSETS } from "@/lib/assets";

type ViewMode = "grid" | "table";

export default function DesaListPage() {
  const [search, setSearch] = useState(() => {
    if (typeof window === "undefined") return "";
    return new URLSearchParams(window.location.search).get("cari") ?? "";
  });
  const [provinsi, setProvinsi] = useState("");
  const [status, setStatus] = useState<StatusSerapan>("semua");
  const [sortField, setSortField] = useState<SortField>("nama");
  const [sortOrder, setSortOrder] = useState<SortOrder>("asc");
  const [view, setView] = useState<ViewMode>("grid");
  const [page, setPage] = useState(1);

  const PAGE_SIZE = 12;

  const handleSort = (field: SortField) => {
    if (field === sortField) {
      setSortOrder(sortOrder === "asc" ? "desc" : "asc");
    } else {
      setSortField(field);
      setSortOrder("asc");
    }
    setPage(1);
  };

  const filtered = useMemo(() => {
    let result = [...mockDesa];

    if (search) {
      const q = search.toLowerCase();
      result = result.filter(
        (d) =>
          d.nama.toLowerCase().includes(q) ||
          d.kecamatan.toLowerCase().includes(q) ||
          d.kabupaten.toLowerCase().includes(q) ||
          d.provinsi.toLowerCase().includes(q)
      );
    }

    if (provinsi) {
      result = result.filter((d) => d.provinsi === provinsi);
    }

    if (status !== "semua") {
      result = result.filter((d) => d.status === status);
    }

    result.sort((a, b) => {
      const multiplier = sortOrder === "asc" ? 1 : -1;
      if (sortField === "nama") return multiplier * a.nama.localeCompare(b.nama);
      return multiplier * (a[sortField] - b[sortField]);
    });

    return result;
  }, [search, provinsi, status, sortField, sortOrder]);

  const totalPages = Math.ceil(filtered.length / PAGE_SIZE);
  const paginated = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  const handleFilterChange = (setter: (v: string) => void) => (v: string) => {
    setter(v);
    setPage(1);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Data Desa</h1>
          <p className="text-sm text-slate-500 mt-0.5">
            Pantau penyerapan anggaran dari seluruh desa terdaftar
          </p>
        </div>
        <div className="flex items-center gap-1 bg-white border border-slate-200 rounded-xl p-1">
          <button
            onClick={() => setView("grid")}
            className={`p-2 rounded-lg transition-colors ${view === "grid" ? "bg-indigo-100 text-indigo-600" : "text-slate-400 hover:text-slate-600"}`}
          >
            <LayoutGrid size={16} />
          </button>
          <button
            onClick={() => setView("table")}
            className={`p-2 rounded-lg transition-colors ${view === "table" ? "bg-indigo-100 text-indigo-600" : "text-slate-400 hover:text-slate-600"}`}
          >
            <List size={16} />
          </button>
        </div>
      </div>

      <SearchFilterBar
        search={search}
        onSearch={handleFilterChange(setSearch)}
        provinsi={provinsi}
        onProvinsi={handleFilterChange(setProvinsi)}
        status={status}
        onStatus={(v) => { setStatus(v); setPage(1); }}
        provinsiList={provinsiList}
        totalResults={filtered.length}
      />

      {paginated.length === 0 ? (
        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm py-12 px-6 flex flex-col items-center gap-4 text-center">
          <Image
            src={ASSETS.mascotEmpty}
            alt="Pak Waspada tidak menemukan hasil pencarian"
            width={150}
            height={170}
            className="object-contain"
          />
          <div>
            <p className="font-semibold text-slate-700 text-sm mb-1">Tidak ada desa yang cocok</p>
            <p className="text-slate-400 text-xs max-w-xs">
              Pak Waspada sudah mencari ke mana-mana tapi tidak ketemu.
              Coba ubah filter atau kata kunci pencarianmu.
            </p>
          </div>
        </div>
      ) : view === "grid" ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {paginated.map((d) => <DesaCard key={d.id} desa={d} />)}
        </div>
      ) : (
        <DesaTable
          desa={paginated}
          sortField={sortField}
          sortOrder={sortOrder}
          onSort={handleSort}
        />
      )}

      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-2 pt-2">
          <button
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            disabled={page === 1}
            className="px-3 py-1.5 text-sm rounded-lg border border-slate-200 bg-white text-slate-600 hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
          >
            Sebelumnya
          </button>
          {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
            <button
              key={p}
              onClick={() => setPage(p)}
              className={`w-8 h-8 text-sm rounded-lg transition-colors ${
                p === page
                  ? "bg-indigo-600 text-white font-semibold"
                  : "bg-white border border-slate-200 text-slate-600 hover:bg-slate-50"
              }`}
            >
              {p}
            </button>
          ))}
          <button
            onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
            disabled={page === totalPages}
            className="px-3 py-1.5 text-sm rounded-lg border border-slate-200 bg-white text-slate-600 hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
          >
            Berikutnya
          </button>
        </div>
      )}
    </div>
  );
}
