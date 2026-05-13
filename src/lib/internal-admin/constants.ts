import {
  Database,
  FileText,
  FileUp,
  type LucideIcon,
  RefreshCcw,
  UserCog,
} from "lucide-react";

export const INTERNAL_ADMIN_NAV_ITEMS: ReadonlyArray<{
  href: string;
  label: string;
  icon: LucideIcon;
}> = [
  { href: "/internal-admin/claims", label: "Pengajuan", icon: UserCog },
  { href: "/internal-admin/documents", label: "Dokumen", icon: FileText },
  { href: "/internal-admin/intake", label: "Intake", icon: FileUp },
  { href: "/internal-admin/renewals", label: "Perpanjangan", icon: RefreshCcw },
  { href: "/internal-admin/village-data", label: "Data Desa", icon: Database },
] as const;

export const INTERNAL_ADMIN_AREAS_SUMMARY =
  "klaim, dokumen, perpanjangan" as const;

export const CLAIM_QUEUE_PAGE_SIZE = 20;
export const INTERNAL_DOCUMENT_QUEUE_PAGE_SIZE = 100;
export const INTERNAL_RENEWAL_QUEUE_PAGE_SIZE = 100;

export const VALID_CLAIM_STATUSES = [
  "PENDING",
  "IN_REVIEW",
  "REJECTED",
  "APPROVED",
] as const;

export const VALID_INTERNAL_DOCUMENT_STATUSES = [
  "WAITING_VERIFIED_APPROVAL",
  "PROCESSING",
  "PUBLISHED",
  "FAILED",
] as const;
