import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { handleApiError } from "@/lib/api-error";

const MAX_SIZE_BYTES = 512 * 1024; // 512 KB
const ALLOWED_TYPES  = ["image/jpeg", "image/png", "image/webp", "image/gif"];

// POST /api/users/avatar — accepts multipart/form-data with field "file"
export async function POST(req: Request) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const form = await req.formData();
    const file = form.get("file");

    if (!file || !(file instanceof File)) {
      return NextResponse.json({ error: "File tidak ditemukan" }, { status: 400 });
    }
    if (!ALLOWED_TYPES.includes(file.type)) {
      return NextResponse.json({ error: "Format file tidak didukung. Gunakan JPG, PNG, atau WebP." }, { status: 400 });
    }
    if (file.size > MAX_SIZE_BYTES) {
      return NextResponse.json({ error: "Ukuran file terlalu besar. Maksimal 512 KB." }, { status: 400 });
    }

    // Convert to base64 data URL — stored directly in DB (no external storage needed for MVP)
    const buffer   = await file.arrayBuffer();
    const base64   = Buffer.from(buffer).toString("base64");
    const dataUrl  = `data:${file.type};base64,${base64}`;

    const user = await db.user.update({
      where:  { id: session.user.id },
      data:   { avatarUrl: dataUrl, image: dataUrl },
      select: { id: true, avatarUrl: true },
    });

    return NextResponse.json({ avatarUrl: user.avatarUrl });
  } catch (error) {
    return handleApiError(error, "POST /api/users/avatar");
  }
}
