import { redirect } from "next/navigation";
import SayaProfileClient from "@/app/profil/saya/SayaProfileClient";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";

export const dynamic = "force-dynamic";

export default async function SayaProfilePage() {
  const session = await auth();

  if (!session?.user?.id) {
    redirect("/login");
  }

  const profile = db
    ? await db.user.findUnique({
        where: { id: session.user.id },
        select: {
          nama: true,
          bio: true,
          avatarUrl: true,
        },
      })
    : null;

  return (
    <SayaProfileClient
      initialProfile={{
        nama: profile?.nama ?? session.user.name ?? "",
        bio: profile?.bio ?? "",
        avatarUrl: profile?.avatarUrl ?? undefined,
      }}
    />
  );
}
