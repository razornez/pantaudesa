/**
 * Admin claim email service — separate from NextAuth login provider.
 * Uses existing RESEND_API_KEY, RESEND_FROM, AUTH_URL.
 * Does NOT reuse NextAuth signIn("resend").
 */

import { resend } from "@/lib/resend";

export type AdminClaimEmailResult =
  | { ok: true; messageId: string }
  | { ok: false; error: string; code: "RESEND_ENV_MISSING" | "RESEND_SEND_FAILED" };

function getBaseUrl(): string {
  const raw = process.env.AUTH_URL ?? "";
  return raw.replace(/\/$/, "");
}

function isResendConfigured(): boolean {
  return Boolean(process.env.RESEND_API_KEY && process.env.RESEND_FROM);
}

export async function sendAdminClaimMagicLink({
  toEmail,
  desaName,
  rawToken,
  claimId,
}: {
  toEmail: string;
  desaName: string;
  rawToken: string;
  claimId: string;
}): Promise<AdminClaimEmailResult> {
  if (!isResendConfigured()) {
    return { ok: false, error: "Resend env missing", code: "RESEND_ENV_MISSING" };
  }

  const baseUrl = getBaseUrl();
  const verifyUrl = `${baseUrl}/api/admin-claim/verify-email?token=${rawToken}&claimId=${claimId}`;
  const from = process.env.RESEND_FROM!;

  try {
    const result = await resend.emails.send({
      from,
      to: toEmail,
      subject: `Verifikasi klaim admin desa: ${desaName}`,
      html: `
        <div style="font-family:sans-serif;max-width:480px;margin:0 auto;">
          <h2 style="color:#3730a3;">Verifikasi Klaim Admin Desa</h2>
          <p>Kamu mengajukan klaim sebagai admin desa <strong>${desaName}</strong>.</p>
          <p>Klik tautan di bawah untuk memverifikasi klaim ini. Tautan berlaku selama <strong>24 jam</strong>.</p>
          <a href="${verifyUrl}"
             style="display:inline-block;background:#4f46e5;color:#fff;padding:12px 24px;border-radius:8px;text-decoration:none;font-weight:bold;margin:16px 0;">
            Verifikasi Sekarang
          </a>
          <p style="color:#64748b;font-size:13px;">
            Jika kamu tidak mengajukan klaim ini, abaikan email ini.
          </p>
          <p style="color:#94a3b8;font-size:12px;">PantauDesa — transparansi anggaran desa</p>
        </div>
      `,
    });

    if (result.error) {
      return { ok: false, error: result.error.message, code: "RESEND_SEND_FAILED" };
    }

    return { ok: true, messageId: result.data?.id ?? "sent" };
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    return { ok: false, error: msg, code: "RESEND_SEND_FAILED" };
  }
}

export async function sendAdminInviteEmail({
  toEmail,
  desaName,
  rawToken,
  inviteId,
}: {
  toEmail: string;
  desaName: string;
  rawToken: string;
  inviteId: string;
}): Promise<AdminClaimEmailResult> {
  if (!isResendConfigured()) {
    return { ok: false, error: "Resend env missing", code: "RESEND_ENV_MISSING" };
  }

  const baseUrl = getBaseUrl();
  const acceptUrl = `${baseUrl}/api/admin-claim/accept-invite?token=${rawToken}&inviteId=${inviteId}`;
  const from = process.env.RESEND_FROM!;

  try {
    const result = await resend.emails.send({
      from,
      to: toEmail,
      subject: `Undangan admin desa: ${desaName}`,
      html: `
        <div style="font-family:sans-serif;max-width:480px;margin:0 auto;">
          <h2 style="color:#3730a3;">Undangan Admin Desa</h2>
          <p>Kamu diundang bergabung sebagai admin desa <strong>${desaName}</strong>.</p>
          <p>Klik tautan di bawah untuk menerima undangan. Tautan berlaku selama <strong>7 hari</strong>.</p>
          <a href="${acceptUrl}"
             style="display:inline-block;background:#4f46e5;color:#fff;padding:12px 24px;border-radius:8px;text-decoration:none;font-weight:bold;margin:16px 0;">
            Terima Undangan
          </a>
          <p style="color:#64748b;font-size:13px;">
            Jika kamu tidak mengenal pengirim undangan ini, abaikan email ini.
          </p>
          <p style="color:#94a3b8;font-size:12px;">PantauDesa — transparansi anggaran desa</p>
        </div>
      `,
    });

    if (result.error) {
      return { ok: false, error: result.error.message, code: "RESEND_SEND_FAILED" };
    }

    return { ok: true, messageId: result.data?.id ?? "sent" };
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    return { ok: false, error: msg, code: "RESEND_SEND_FAILED" };
  }
}
