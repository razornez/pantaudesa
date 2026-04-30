"use client";

import { useEffect, useMemo, useState } from "react";
import type { AdminClaimProfileData } from "@/lib/data/admin-claim-read";
import {
  getSelectedDesa,
  isDemoSession,
} from "@/components/profil/admin-claim/adminClaimCopy";

export function useAdminClaimProfile() {
  const [data, setData] = useState<AdminClaimProfileData | null>(null);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState(false);
  const [requestSeq, setRequestSeq] = useState(0);

  useEffect(() => {
    void refresh();
  }, []);

  async function refresh() {
    setRequestSeq((value) => value + 1);
  }

  useEffect(() => {
    let mounted = true;
    const controller = new AbortController();

    async function load() {
    setLoading(true);
    return fetch("/api/admin-claim/profile", { cache: "no-store" })
      .then(async (response) => {
        if (!response.ok) {
          throw new Error(`admin claim profile load failed: ${response.status}`);
        }
        const payload = await response.json() as AdminClaimProfileData;
        if (!mounted) return;
        setData(payload);
        setLoadError(false);
      } catch {
        if (!mounted || controller.signal.aborted) return;
        setLoadError(true);
        setData(null);
      })
      .finally(() => {
        setLoading(false);
      });
  }
  const defaultDesaId = data?.selectedDesaId ?? data?.desaOptions?.[0]?.id ?? null;
  const defaultDesa = useMemo(
    () => getSelectedDesa(data?.desaOptions ?? [], defaultDesaId),
    [data?.desaOptions, defaultDesaId],
  );

  return {
    data,
    loading,
    loadError,
    defaultDesaId,
    defaultDesa,
    isDemoAccount: isDemoSession(data),
    refresh,
  };
}
