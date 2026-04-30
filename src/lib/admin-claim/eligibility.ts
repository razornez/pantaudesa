export const ACTIVE_ADMIN_STATUSES = ["PENDING", "LIMITED", "VERIFIED"] as const;

export type ActiveAdminStatus = (typeof ACTIVE_ADMIN_STATUSES)[number];

export interface ActiveAdminRelation {
  desaId: string;
  desaName: string;
  status: string;
  source: "claim" | "member";
}

export interface AdminClaimEligibility {
  canStartNewClaim: boolean;
  blockedReason:
    | "already_managing_same_desa"
    | "already_managing_other_desa"
    | "pending_same_desa"
    | "pending_other_desa"
    | null;
  activeRelation: ActiveAdminRelation | null;
  message: string | null;
}

export function isActiveAdminStatus(status: string | null | undefined): status is ActiveAdminStatus {
  return ACTIVE_ADMIN_STATUSES.includes(status as ActiveAdminStatus);
}

export function getAdminClaimEligibility({
  activeClaim,
  activeMember,
  targetDesaId,
}: {
  activeClaim?: ActiveAdminRelation | null;
  activeMember?: ActiveAdminRelation | null;
  targetDesaId?: string | null;
}): AdminClaimEligibility {
  const relation = activeMember ?? activeClaim ?? null;

  if (!relation) {
    return {
      canStartNewClaim: true,
      blockedReason: null,
      activeRelation: null,
      message: null,
    };
  }

  const sameDesa = targetDesaId ? relation.desaId === targetDesaId : false;

  if (relation.source === "member") {
    return {
      canStartNewClaim: false,
      blockedReason: sameDesa ? "already_managing_same_desa" : "already_managing_other_desa",
      activeRelation: relation,
      message: sameDesa
        ? `Akun ini sudah tercatat sebagai admin untuk ${relation.desaName}.`
        : `Akun ini sudah mewakili ${relation.desaName}. Satu akun hanya boleh mengelola satu desa.`,
    };
  }

  return {
    canStartNewClaim: false,
    blockedReason: sameDesa ? "pending_same_desa" : "pending_other_desa",
    activeRelation: relation,
    message: sameDesa
      ? `Kamu sudah punya klaim aktif untuk ${relation.desaName}. Lanjutkan verifikasi yang sedang berjalan.`
      : `Kamu sudah punya klaim aktif untuk ${relation.desaName}. Selesaikan atau selesaikan status desa itu dulu sebelum klaim desa lain.`,
  };
}

export interface AdminClaimPageNotice {
  tone: "success" | "error" | "info";
  title: string;
  message: string;
}

function pickParam(value: string | string[] | undefined) {
  if (Array.isArray(value)) return value[0] ?? null;
  return value ?? null;
}

export function getAdminClaimPageNotice(params: Record<string, string | string[] | undefined>): AdminClaimPageNotice | null {
  const verified = pickParam(params.verified);
  const invite = pickParam(params.invite);
  const error = pickParam(params.error);

  if (verified === "email") {
    return {
      tone: "success",
      title: "Email berhasil diverifikasi",
      message: "Status klaimmu sudah diperbarui. Lanjutkan dari panel status di bawah.",
    };
  }

  if (invite === "accepted") {
    return {
      tone: "success",
      title: "Undangan diterima",
      message: "Akunmu sekarang tercatat sebagai Admin Desa terbatas. Lanjutkan ke status untuk langkah berikutnya.",
    };
  }

  switch (error) {
    case "service_unavailable":
      return {
        tone: "error",
        title: "Layanan belum tersedia",
        message: "Layanan verifikasi sedang tidak tersedia. Coba lagi sebentar lagi atau hubungi admin.",
      };
    case "invalid_link":
    case "invalid_invite_link":
      return {
        tone: "error",
        title: "Tautan tidak valid",
        message: "Tautan verifikasi atau undangan tidak lengkap. Minta kirim ulang dari halaman ini.",
      };
    case "invalid_token":
    case "invalid_invite":
    case "invalid_invite_token":
      return {
        tone: "error",
        title: "Token tidak valid",
        message: "Token verifikasi tidak cocok atau sudah tidak bisa dipakai. Buat token baru lalu coba lagi.",
      };
    case "token_expired":
    case "invite_expired":
      return {
        tone: "error",
        title: "Token kedaluwarsa",
        message: "Masa berlaku token sudah habis. Kirim ulang email atau generate token website yang baru.",
      };
    case "invite_used":
      return {
        tone: "info",
        title: "Undangan sudah dipakai",
        message: "Undangan ini sudah pernah dipakai. Cek status admin desamu di panel status.",
      };
    default:
      return null;
  }
}
