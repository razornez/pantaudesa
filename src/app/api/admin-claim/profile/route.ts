import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { getAdminClaimProfileData } from "@/lib/data/admin-claim-read";
import { handleApiError } from "@/lib/api-error";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const data = await getAdminClaimProfileData(session.user.id);
    return NextResponse.json(data);
  } catch (error) {
    return handleApiError(error, "GET /api/admin-claim/profile");
  }
}
