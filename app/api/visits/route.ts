import { NextRequest, NextResponse } from "next/server";
import crypto from "crypto";
import { getSupabaseServerClient } from "@/app/lib/supabase/server";

const TABLE_NAME = "visits";

function getClientIp(request: NextRequest) {
  const forwardedFor = request.headers.get("x-forwarded-for");
  if (forwardedFor) {
    return forwardedFor.split(",")[0]?.trim();
  }
  return request.headers.get("x-real-ip") || "unknown";
}

function hashIp(ip: string) {
  const salt = process.env.ADMIN_PASSWORD || "local-salt";
  return crypto.createHmac("sha256", salt).update(ip).digest("hex");
}

export async function POST(request: NextRequest) {
  try {
    const ip = getClientIp(request);
    const ipHash = hashIp(ip);
    const supabase = getSupabaseServerClient();

    const { error } = await supabase.from(TABLE_NAME).upsert(
      {
        ip_hash: ipHash,
        created_at: new Date().toISOString(),
      },
      { onConflict: "ip_hash" }
    );

    if (error) {
      return NextResponse.json({ error: "Visit log failed" }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ error: "Invalid request" }, { status: 400 });
  }
}

export async function GET() {
  try {
    const supabase = getSupabaseServerClient();
    const { count, error } = await supabase
      .from(TABLE_NAME)
      .select("ip_hash", { count: "exact", head: true });

    if (error) {
      return NextResponse.json({ count: 0 }, { status: 200 });
    }

    return NextResponse.json({ count: count ?? 0 });
  } catch {
    return NextResponse.json({ count: 0 }, { status: 200 });
  }
}
