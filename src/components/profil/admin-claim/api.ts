import type { AdminClaimProfileData } from "@/lib/data/admin-claim-read";

export async function fetchAdminClaimProfile(signal?: AbortSignal) {
  const response = await fetch("/api/admin-claim/profile", {
    cache: "no-store",
    signal,
  });

  if (!response.ok) {
    throw new Error(`admin claim profile load failed: ${response.status}`);
  }

  return (await response.json()) as AdminClaimProfileData;
}
