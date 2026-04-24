/**
 * auth-mock.ts — simulasi autentikasi & session untuk demo.
 * Ganti dengan API calls nyata saat backend tersedia.
 */

export type UserRole = "desa" | "admin";

export interface AuthUser {
  id:       string;
  nama:     string;
  email:    string;
  role:     UserRole;
  desaId?:  string;  // hanya untuk role "desa"
  desaNama?:string;
  avatar?:  string;
}

// ─── Mock accounts ────────────────────────────────────────────────────────────

export const MOCK_DESA_ACCOUNTS: Record<string, { password: string; user: AuthUser }> = {
  "desa.sukamaju@gmail.com": {
    password: "123456",
    user: { id: "u1", nama: "H. Asep Supriatna, S.H.", email: "desa.sukamaju@gmail.com", role: "desa", desaId: "1", desaNama: "Desa Sukamaju" },
  },
  "desa.harapanjaya@gmail.com": {
    password: "123456",
    user: { id: "u2", nama: "Dadang Sutisna, A.Md.", email: "desa.harapanjaya@gmail.com", role: "desa", desaId: "2", desaNama: "Desa Harapan Jaya" },
  },
  "admin@pantaudesa.id": {
    password: "admin123",
    user: { id: "a1", nama: "Admin PantauDesa", email: "admin@pantaudesa.id", role: "admin" },
  },
};

// ─── OTP simulation ───────────────────────────────────────────────────────────

const OTP_STORE: Record<string, { code: string; expiresAt: number }> = {};

export function generateOTP(email: string): string {
  const code = Math.floor(100000 + Math.random() * 900000).toString();
  OTP_STORE[email] = { code, expiresAt: Date.now() + 5 * 60_000 }; // 5 menit
  console.info(`[MOCK OTP] ${email} → ${code}`); // di produksi ini dikirim via email/WA
  return code;
}

export function verifyOTP(email: string, code: string): boolean {
  const entry = OTP_STORE[email];
  if (!entry) return false;
  if (Date.now() > entry.expiresAt) { delete OTP_STORE[email]; return false; }
  if (entry.code !== code) return false;
  delete OTP_STORE[email];
  return true;
}

export function getAccountByEmail(email: string): AuthUser | null {
  return MOCK_DESA_ACCOUNTS[email]?.user ?? null;
}

// ─── Document status types ────────────────────────────────────────────────────

export type DocStatus = "menunggu_review" | "disetujui" | "ditolak";

export interface UploadedDoc {
  id:          string;
  desaId:      string;
  desaNama:    string;
  jenis:       string;   // "APBDes", "LPPD", "RKP", "Profil", dll.
  nama:        string;
  tahun:       number;
  fileUrl:     string;   // blob URL (mock) atau path
  fileSize:    string;
  uploadedAt:  Date;
  uploadedBy:  string;
  status:      DocStatus;
  reviewNote?: string;
  reviewedAt?: Date;
}

// ─── Mock uploaded documents ──────────────────────────────────────────────────

export const MOCK_UPLOADS: UploadedDoc[] = [
  {
    id: "doc1", desaId: "1", desaNama: "Desa Sukamaju",
    jenis: "APBDes", nama: "APBDes Sukamaju 2024.pdf", tahun: 2024,
    fileUrl: "#", fileSize: "2.4 MB",
    uploadedAt: new Date(Date.now() - 3 * 86_400_000),
    uploadedBy: "H. Asep Supriatna",
    status: "disetujui", reviewedAt: new Date(Date.now() - 2 * 86_400_000),
  },
  {
    id: "doc2", desaId: "1", desaNama: "Desa Sukamaju",
    jenis: "LPPD", nama: "LPPD Sukamaju 2023.pdf", tahun: 2023,
    fileUrl: "#", fileSize: "1.8 MB",
    uploadedAt: new Date(Date.now() - 10 * 86_400_000),
    uploadedBy: "H. Asep Supriatna",
    status: "menunggu_review",
  },
  {
    id: "doc3", desaId: "2", desaNama: "Desa Harapan Jaya",
    jenis: "RKP", nama: "RKP Harapan Jaya 2024.pdf", tahun: 2024,
    fileUrl: "#", fileSize: "3.1 MB",
    uploadedAt: new Date(Date.now() - 1 * 86_400_000),
    uploadedBy: "Dadang Sutisna",
    status: "menunggu_review",
  },
  {
    id: "doc4", desaId: "2", desaNama: "Desa Harapan Jaya",
    jenis: "APBDes", nama: "APBDes Harapan Jaya 2024.pdf", tahun: 2024,
    fileUrl: "#", fileSize: "2.9 MB",
    uploadedAt: new Date(Date.now() - 15 * 86_400_000),
    uploadedBy: "Dadang Sutisna",
    status: "ditolak",
    reviewNote: "File tidak terbaca. Harap upload ulang dalam format PDF yang valid.",
    reviewedAt: new Date(Date.now() - 13 * 86_400_000),
  },
];
