import { NextRequest, NextResponse } from "next/server";
import path from "path";
import crypto from "crypto";
import { getSupabaseServerClient } from "@/app/lib/supabase/server";

export async function POST(request: NextRequest) {
  try {
    const adminPassword = process.env.ADMIN_PASSWORD;
    const providedPassword = request.headers.get("x-admin-password");
    if (!adminPassword || providedPassword !== adminPassword) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const formData = await request.formData();
    const file = formData.get("file");
    const kindRaw = (formData.get("kind") || "generic").toString();

    if (!(file instanceof File)) {
      return NextResponse.json({ error: "Missing file" }, { status: 400 });
    }

    if (!file.type.startsWith("image/")) {
      return NextResponse.json({ error: "Invalid file type" }, { status: 415 });
    }

    const maxSizeBytes = 5 * 1024 * 1024;
    if (file.size > maxSizeBytes) {
      return NextResponse.json({ error: "File too large" }, { status: 413 });
    }

    const safeKind = kindRaw.replace(/[^a-z0-9-_]/gi, "").toLowerCase() || "generic";
    const ext = path.extname(file.name) || ".png";
    const filename = `${safeKind}/${Date.now()}-${crypto.randomUUID()}${ext}`;
    const bucket = process.env.SUPABASE_BUCKET || "portfolio-assets";

    const supabase = getSupabaseServerClient();
    const buffer = Buffer.from(await file.arrayBuffer());
    const { error } = await supabase.storage
      .from(bucket)
      .upload(filename, buffer, { contentType: file.type, upsert: false });

    if (error) {
      return NextResponse.json({ error: "Upload failed" }, { status: 500 });
    }

    const { data } = supabase.storage.from(bucket).getPublicUrl(filename);
    return NextResponse.json({ url: data.publicUrl });
  } catch (error) {
    return NextResponse.json({ error: "Upload failed" }, { status: 500 });
  }
}
