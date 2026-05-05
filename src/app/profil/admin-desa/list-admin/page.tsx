import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { getDesaAdminRoster } from "@/lib/data/desa-admins";
import { getAdminDesaContext } from "@/lib/data/admin-desa-context";
import AdminDesaListAdminClient from "@/components/admin-desa/AdminDesaListAdminClient";
import { perfLog, perfStart } from "@/lib/perf";

export const dynamic = "force-dynamic";

const MAX_ADMINS_PER_DESA = 5;

export default async function AdminDesaListAdminPage() {
  const tAuth = perfStart();
  const session = await auth();
  perfLog("admin-desa.list-admin", "auth()", tAuth);
  if (!session?.user?.id) redirect("/login");

  const tContext = perfStart();
  const ctx = await getAdminDesaContext(session.user.id);
  perfLog("admin-desa.list-admin", "getAdminDesaContext()", tContext);
  if (!ctx) redirect("/profil/klaim-admin-desa?error=admin_desa_only");

  const tRoster = perfStart();
  const roster = await getDesaAdminRoster(ctx.desa.id);
  perfLog("admin-desa.list-admin", "getDesaAdminRoster()", tRoster);
  const canManage = ctx.member.status === "VERIFIED" && ctx.member.role === "VERIFIED_ADMIN";

  return (
    <AdminDesaListAdminClient
      currentUserId={ctx.user.id}
      desaId={ctx.desa.id}
      desaName={ctx.desa.nama}
      canManage={canManage}
      roster={roster}
      maxAdmins={MAX_ADMINS_PER_DESA}
    />
  );
}
