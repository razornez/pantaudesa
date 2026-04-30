import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { redirect } from "next/navigation";
import AdminClaimWizard from "@/components/profil/admin-claim/AdminClaimWizard";
import { auth } from "@/lib/auth";
import { getAdminClaimPageNotice } from "@/lib/admin-claim/eligibility";
import type { UserRole } from "@/lib/auth-context";

export const dynamic = "force-dynamic";

interface PageProps {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}

export default async function KlaimAdminDesaPage({ searchParams }: PageProps) {
  const session = await auth();
  if (!session?.user?.id || !session.user.email) {
    redirect("/login");
  }

  const params = await searchParams;
  const notice = getAdminClaimPageNotice(params);
  const user = {
    id: session.user.id,
    nama: session.user.name ?? session.user.username ?? session.user.email,
    username: session.user.username ?? "",
    email: session.user.email,
    role: session.user.role as UserRole,
  };

  return (
    <div className="mx-auto max-w-4xl px-4 py-8 sm:px-6">
      <Link
        href="/profil/saya"
        className="mb-4 inline-flex min-h-11 items-center gap-2 text-sm font-semibold text-slate-500 transition-colors hover:text-slate-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-300 focus-visible:ring-offset-2"
      >
        <ArrowLeft size={15} />
        Kembali ke profil saya
      </Link>

      <AdminClaimWizard user={user} initialNotice={notice} />
    </div>
  );
}
