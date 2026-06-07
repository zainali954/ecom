import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import cloudinary from "@/lib/cloudinary";

const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB
const ALLOWED_TYPES = ["image/jpeg", "image/png", "image/webp", "image/gif", "image/avif"];

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session?.user || session.user.role !== "admin") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const formData = await req.formData();
  const files = formData.getAll("files") as File[];

  if (files.length === 0) {
    return NextResponse.json({ error: "No files provided" }, { status: 400 });
  }

  const results: { url: string; publicId: string }[] = [];
  const errors: string[] = [];

  for (const file of files) {
    if (!ALLOWED_TYPES.includes(file.type)) {
      errors.push(`${file.name}: invalid file type (${file.type})`);
      continue;
    }

    if (file.size > MAX_FILE_SIZE) {
      errors.push(`${file.name}: exceeds 5MB limit`);
      continue;
    }

    const buffer = Buffer.from(await file.arrayBuffer());
    const base64 = `data:${file.type};base64,${buffer.toString("base64")}`;

    try {
      const result = await cloudinary.uploader.upload(base64, {
        folder: "products",
        format: "webp",
        quality: "auto",
        transformation: [{ width: 1200, crop: "limit" }],
      });

      results.push({ url: result.secure_url, publicId: result.public_id });
    } catch {
      errors.push(`${file.name}: upload failed`);
    }
  }

  return NextResponse.json({ results, errors });
}
