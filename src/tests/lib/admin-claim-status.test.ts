import { describe, it, expect } from "vitest";
import { isTransitionAllowed, assertTransitionAllowed } from "@/lib/admin-claim/status";
import type { ClaimStatus } from "@/lib/admin-claim/status";

describe("admin-claim status transitions", () => {
  const allowed: Array<[ClaimStatus, ClaimStatus]> = [
    ["PENDING",   "LIMITED"],
    ["PENDING",   "VERIFIED"],
    ["PENDING",   "REJECTED"],
    ["PENDING",   "SUSPENDED"],
    ["LIMITED",   "VERIFIED"],
    ["LIMITED",   "REJECTED"],
    ["LIMITED",   "SUSPENDED"],
    ["VERIFIED",  "SUSPENDED"],
    ["REJECTED",  "PENDING"],
    ["SUSPENDED", "PENDING"],
  ];

  const blocked: Array<[ClaimStatus, ClaimStatus]> = [
    ["VERIFIED",  "PENDING"],
    ["VERIFIED",  "LIMITED"],
    ["VERIFIED",  "REJECTED"],
    ["REJECTED",  "VERIFIED"],
    ["REJECTED",  "LIMITED"],
    ["SUSPENDED", "VERIFIED"],
    ["SUSPENDED", "LIMITED"],
    ["SUSPENDED", "REJECTED"],
  ];

  allowed.forEach(([from, to]) => {
    it(`allows transition ${from} → ${to}`, () => {
      expect(isTransitionAllowed(from, to)).toBe(true);
    });
  });

  blocked.forEach(([from, to]) => {
    it(`blocks transition ${from} → ${to}`, () => {
      expect(isTransitionAllowed(from, to)).toBe(false);
    });
  });

  it("assertTransitionAllowed does not throw for allowed transition", () => {
    expect(() => assertTransitionAllowed("PENDING", "LIMITED")).not.toThrow();
  });

  it("assertTransitionAllowed throws for blocked transition", () => {
    expect(() => assertTransitionAllowed("VERIFIED", "PENDING")).toThrow();
  });

  it("client cannot set arbitrary status by bypassing the map", () => {
    // Arbitrary status not in the ClaimStatus type returns false
    expect(isTransitionAllowed("PENDING", "ADMIN" as ClaimStatus)).toBe(false);
    expect(isTransitionAllowed("PENDING", "" as ClaimStatus)).toBe(false);
  });
});
