"use client";

import { useCallback, useEffect, useState } from "react";
import AdminDesaFilterBar, {
  type AdminDesaFilter,
} from "@/components/internal-admin/AdminDesaFilterBar";
import type { DesaRow } from "./types";
import { fetchDesaData } from "./api";
import { ErrorNotice } from "./shared";
import { DesaDataResults } from "./DesaDataResults";

export function DesaDataTab() {
  const [desa, setDesa] = useState<DesaRow[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [filter, setFilter] = useState<AdminDesaFilter>({
    q: "",
    provinsi: "",
    kabupaten: "",
    kecamatan: "",
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [expanded, setExpanded] = useState<string | null>(null);

  const fetchData = useCallback((nextFilter: AdminDesaFilter, nextPage: number) => {
    setLoading(true);
    fetchDesaData(nextFilter, nextPage)
      .then((payload) => {
        setDesa(payload.desa ?? []);
        setTotal(payload.total ?? 0);
        setError(null);
        setLoading(false);
      })
      .catch(() => {
        setError("Gagal memuat data desa.");
        setLoading(false);
      });
  }, []);

  useEffect(() => {
    let cancelled = false;

    fetchDesaData({ q: "", provinsi: "", kabupaten: "", kecamatan: "" }, 1)
      .then((payload) => {
        if (!cancelled) {
          setDesa(payload.desa ?? []);
          setTotal(payload.total ?? 0);
          setLoading(false);
        }
      })
      .catch(() => {
        if (!cancelled) {
          setError("Gagal memuat data desa.");
          setLoading(false);
        }
      });

    return () => {
      cancelled = true;
    };
  }, []);

  const handleFilterChange = (nextFilter: AdminDesaFilter) => {
    setFilter(nextFilter);
    setPage(1);
    fetchData(nextFilter, 1);
  };

  const handlePageChange = (nextPage: number) => {
    setPage(nextPage);
    fetchData(filter, nextPage);
  };

  if (error) return <ErrorNotice message={error} />;

  return (
    <div className="space-y-4">
      <AdminDesaFilterBar onChange={handleFilterChange} />
      <DesaDataResults
        desa={desa}
        filter={filter}
        page={page}
        total={total}
        loading={loading}
        expanded={expanded}
        onExpandedChange={setExpanded}
        onPageChange={handlePageChange}
      />
    </div>
  );
}
