import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";

export async function GET() {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const user = await db.user.findUnique({
    where: { id: session.user.id },
    select: { id: true, email: true, username: true, nama: true, bio: true, avatarUrl: true, role: true, createdAt: true },
  });

  if (!user) return NextResponse.json({ error: "User not found" }, { status: 404 });
  return NextResponse.json(user);
}

export async function PATCH(req: Request) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await req.json();
  const { nama, bio, avatarUrl } = body;

  const user = await db.user.update({
    where: { id: session.user.id },
    data: {
      ...(nama      !== undefined && { nama }),
      ...(bio       !== undefined && { bio }),
      ...(avatarUrl !== undefined && { avatarUrl }),
    },
    select: { id: true, email: true, username: true, nama: true, bio: true, avatarUrl: true, role: true },
  });

  return NextResponse.json(user);
}
