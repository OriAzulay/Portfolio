import { NextRequest, NextResponse } from "next/server";
import { mkdir, writeFile } from "fs/promises";
import path from "path";
import crypto from "crypto";

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get("file");
    const kindRaw = (formData.get("kind") || "generic").toString();

    if (!(file instanceof File)) {
      return NextResponse.json({ error: "Missing file" }, { status: 400 });
    }

    const safeKind = kindRaw.replace(/[^a-z0-9-_]/gi, "").toLowerCase() || "generic";
    const ext = path.extname(file.name) || ".png";
    const filename = `${Date.now()}-${crypto.randomUUID()}${ext}`;

    const uploadDir = path.join(process.cwd(), "public", "uploads", safeKind);
    await mkdir(uploadDir, { recursive: true });

    const buffer = Buffer.from(await file.arrayBuffer());
    await writeFile(path.join(uploadDir, filename), buffer);

    return NextResponse.json({ url: `/uploads/${safeKind}/${filename}` });
  } catch (error) {
    return NextResponse.json({ error: "Upload failed" }, { status: 500 });
  }
}
