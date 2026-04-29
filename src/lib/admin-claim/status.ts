// Centralized allowed status transitions for DesaAdminClaim.
// Client must never set arbitrary status — all transitions go through this map.

export type ClaimStatus = "PENDING" | "LIMITED" | "VERIFIED" | "REJECTED" | "SUSPENDED";

// Maps: currentStatus -> allowed next statuses (server-enforced)
const ALLOWED_TRANSITIONS: Record<ClaimStatus, ClaimStatus[]> = {
  PENDING:   ["LIMITED", "VERIFIED", "REJECTED", "SUSPENDED"],
  LIMITED:   ["VERIFIED", "REJECTED", "SUSPENDED"],
  VERIFIED:  ["SUSPENDED"],
  REJECTED:  ["PENDING"],
  SUSPENDED: ["PENDING"],
};

export function isTransitionAllowed(from: ClaimStatus, to: ClaimStatus): boolean {
  return ALLOWED_TRANSITIONS[from]?.includes(to) ?? false;
}

export function assertTransitionAllowed(from: ClaimStatus, to: ClaimStatus): void {
  if (!isTransitionAllowed(from, to)) {
    throw new Error(`Status transition ${from} → ${to} is not allowed`);
  }
}
