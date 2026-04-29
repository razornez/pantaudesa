"use client";

import { useEffect } from "react";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { useRouter } from "next/navigation";
import AdminClaimWizard from "@/components/profil/admin-claim/AdminClaimWizard";
import { useAuth } from "@/lib/auth-context";

export default function KlaimAdminDesaPage() {
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && !user) {
      router.push("/login");
    }
  }, [loading, router, user]);

  if (loading || !user) {
    return null;
  }

  return (
    <div className="mx-auto max-w-4xl px-4 py-8 sm:px-6">
      <Link
        href="/profil/saya"
        className="mb-4 inline-flex min-h-11 items-center gap-2 text-sm font-semibold text-slate-500 transition-colors hover:text-slate-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-300 focus-visible:ring-offset-2"
      >
        <ArrowLeft size={15} />
        Kembali ke profil saya
      </Link>

      <AdminClaimWizard user={user} />
    </div>
  );
}
