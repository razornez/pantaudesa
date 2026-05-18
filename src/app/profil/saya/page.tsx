import { redirect } from "next/navigation";
import SayaProfileClient from "@/app/profil/saya/SayaProfileClient";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { getAdminClaimProfileSummaryData } from "@/lib/data/admin-claim-read";

export const dynamic = "force-dynamic";

export default async function SayaProfilePage() {
  const session = await auth();

  if (!session?.user?.id) {
    redirect("/login");
  }

  const [profile, initialAdminClaimProfile] = await Promise.all([
    db
      ? db.user.findUnique({
          where: { id: session.user.id },
          select: {
            nama: true,
            bio: true,
            avatarUrl: true,
          },
        })
      : Promise.resolve(null),
    getAdminClaimProfileSummaryData(session.user.id),
  ]);

  return (
    <SayaProfileClient
      initialAdminClaimProfile={initialAdminClaimProfile}
      initialProfile={{
        nama: profile?.nama ?? session.user.name ?? "",
        bio: profile?.bio ?? "",
        avatarUrl: profile?.avatarUrl ?? undefined,
      }}
    />
  );
}
