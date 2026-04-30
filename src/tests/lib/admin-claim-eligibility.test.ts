import { describe, expect, it } from "vitest";
import {
  getAdminClaimEligibility,
  getAdminClaimPageNotice,
  isActiveAdminStatus,
} from "@/lib/admin-claim/eligibility";

describe("admin claim eligibility", () => {
  it("allows user with no active relation", () => {
    expect(getAdminClaimEligibility({})).toEqual({
      canStartNewClaim: true,
      blockedReason: null,
      activeRelation: null,
      message: null,
    });
  });

  it("blocks user who already manages another desa", () => {
    const result = getAdminClaimEligibility({
      activeMember: {
        desaId: "desa-a",
        desaName: "Desa A",
        status: "VERIFIED",
        source: "member",
      },
      targetDesaId: "desa-b",
    });

    expect(result.canStartNewClaim).toBe(false);
    expect(result.blockedReason).toBe("already_managing_other_desa");
    expect(result.message).toContain("Desa A");
  });

  it("blocks pending claim on same desa with resume guidance", () => {
    const result = getAdminClaimEligibility({
      activeClaim: {
        desaId: "desa-a",
        desaName: "Desa A",
        status: "PENDING",
        source: "claim",
      },
      targetDesaId: "desa-a",
    });

    expect(result.canStartNewClaim).toBe(false);
    expect(result.blockedReason).toBe("pending_same_desa");
    expect(result.message).toContain("Lanjutkan verifikasi");
  });

  it("recognizes active statuses only", () => {
    expect(isActiveAdminStatus("PENDING")).toBe(true);
    expect(isActiveAdminStatus("LIMITED")).toBe(true);
    expect(isActiveAdminStatus("VERIFIED")).toBe(true);
    expect(isActiveAdminStatus("REJECTED")).toBe(false);
  });
});

describe("admin claim page notice", () => {
  it("builds success notice for verified email", () => {
    const notice = getAdminClaimPageNotice({ verified: "email" });
    expect(notice?.tone).toBe("success");
    expect(notice?.title).toContain("berhasil");
  });

  it("builds error notice for expired token", () => {
    const notice = getAdminClaimPageNotice({ error: "token_expired" });
    expect(notice?.tone).toBe("error");
    expect(notice?.message).toContain("Kirim ulang");
  });
});
