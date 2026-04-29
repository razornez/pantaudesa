import { describe, it, expect } from "vitest";
import { AUDIT_EVENT } from "@/lib/admin-claim/audit-events";

describe("audit event constants", () => {
  it("CLAIM_STARTED is defined", () => {
    expect(AUDIT_EVENT.CLAIM_STARTED).toBe("CLAIM_STARTED");
  });

  it("all required events exist for Batch 1 (claim lifecycle)", () => {
    expect(AUDIT_EVENT.CLAIM_STARTED).toBeDefined();
    expect(AUDIT_EVENT.CLAIM_REUSED).toBeDefined();
    expect(AUDIT_EVENT.CLAIM_METHOD_UPDATED).toBeDefined();
  });

  it("all required events exist for Batch 2 (token generation)", () => {
    expect(AUDIT_EVENT.EMAIL_TOKEN_GENERATED).toBeDefined();
    expect(AUDIT_EVENT.WEBSITE_TOKEN_GENERATED).toBeDefined();
  });

  it("all required events exist for Batch 3 (verification)", () => {
    expect(AUDIT_EVENT.EMAIL_TOKEN_VERIFIED).toBeDefined();
    expect(AUDIT_EVENT.EMAIL_TOKEN_EXPIRED).toBeDefined();
    expect(AUDIT_EVENT.EMAIL_TOKEN_INVALID).toBeDefined();
    expect(AUDIT_EVENT.WEBSITE_TOKEN_FOUND).toBeDefined();
    expect(AUDIT_EVENT.WEBSITE_TOKEN_NOT_FOUND).toBeDefined();
    expect(AUDIT_EVENT.WEBSITE_TOKEN_EXPIRED).toBeDefined();
    expect(AUDIT_EVENT.WEBSITE_CHECK_BLOCKED).toBeDefined();
  });

  it("all required events exist for Batch 3 (status transitions)", () => {
    expect(AUDIT_EVENT.STATUS_TO_LIMITED).toBeDefined();
    expect(AUDIT_EVENT.STATUS_TO_VERIFIED).toBeDefined();
    expect(AUDIT_EVENT.STATUS_TO_REJECTED).toBeDefined();
    expect(AUDIT_EVENT.STATUS_TO_SUSPENDED).toBeDefined();
  });

  it("all required events exist for Batch 4 (invite)", () => {
    expect(AUDIT_EVENT.INVITE_CREATED).toBeDefined();
    expect(AUDIT_EVENT.INVITE_ACCEPTED).toBeDefined();
    expect(AUDIT_EVENT.INVITE_EXPIRED).toBeDefined();
  });

  it("all required events exist for Batch 5 (fake report)", () => {
    expect(AUDIT_EVENT.FAKE_ADMIN_REPORT_SUBMITTED).toBeDefined();
    expect(AUDIT_EVENT.ADMIN_CLAIM_FLAGGED_BY_PUBLIC).toBeDefined();
  });

  it("all values are unique strings", () => {
    const values = Object.values(AUDIT_EVENT);
    const unique = new Set(values);
    expect(unique.size).toBe(values.length);
  });
});
