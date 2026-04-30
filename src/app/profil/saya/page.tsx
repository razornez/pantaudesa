import { redirect } from "next/navigation";
import SayaProfileClient from "@/app/profil/saya/SayaProfileClient";
import { auth } from "@/lib/auth";

export const dynamic = "force-dynamic";

export default async function SayaProfilePage() {
  const session = await auth();

  if (!session?.user?.id) {
    redirect("/login");
  }

  return <SayaProfileClient />;
}
