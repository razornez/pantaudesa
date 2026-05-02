import { redirect } from "next/navigation";
import { getInternalAdminSession } from "@/lib/auth/internal-admin";

export default async function InternalAdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getInternalAdminSession();
  if (!session) {
    redirect("/masuk?error=unauthorized");
  }

  return (
    <div className="min-h-screen bg-slate-50">
      <nav className="bg-slate-900 text-white px-6 py-3 flex items-center gap-4">
        <span className="font-semibold text-sm">PantauDesa Internal Admin</span>
        <div className="flex gap-4 ml-auto text-sm">
          <a href="/internal-admin/claims" className="hover:text-slate-200 transition-colors">
            Admin Desa Review
          </a>
        </div>
      </nav>
      <main className="max-w-5xl mx-auto px-4 py-8">{children}</main>
    </div>
  );
}
