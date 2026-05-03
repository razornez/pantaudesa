import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { getAdminDesaContext } from "@/lib/data/admin-desa-context";

export const dynamic = "force-dynamic";

export default async function AdminDesaSuaraPage() {
  const session = await auth();
  if (!session?.user?.id) redirect("/login");
  const ctx = await getAdminDesaContext(session.user.id);
  if (!ctx) redirect("/profil/klaim-admin-desa?error=admin_desa_only");

  return (
    <div className="space-y-6">
      <header>
        <h1 className="text-2xl font-bold text-slate-900">Suara Warga</h1>
        <p className="text-sm text-slate-500">
          Suara dan komentar warga untuk {ctx.desa.nama}.
        </p>
      </header>

      <div className="bg-white border border-slate-200 rounded-2xl p-5 text-sm text-slate-500 text-center">
        Tab Suara akan diisi pada batch 04-008.10.
      </div>
    </div>
  );
}
