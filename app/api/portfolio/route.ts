import { NextRequest, NextResponse } from "next/server";
import { getSupabaseServerClient } from "@/app/lib/supabase/server";

const TABLE_NAME = "portfolio_data";

export async function GET() {
  try {
    const supabase = getSupabaseServerClient();
    const { data, error } = await supabase
      .from(TABLE_NAME)
      .select("data")
      .eq("id", 1)
      .single();

    if (error) {
      return NextResponse.json({ data: null }, { status: 200 });
    }

    return NextResponse.json({ data: data?.data ?? null });
  } catch {
    return NextResponse.json({ data: null }, { status: 200 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const adminPassword = process.env.ADMIN_PASSWORD;
    const providedPassword = request.headers.get("x-admin-password");
    if (!adminPassword || providedPassword !== adminPassword) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const payload = await request.json();
    const supabase = getSupabaseServerClient();
    const { error } = await supabase.from(TABLE_NAME).upsert(
      {
        id: 1,
        data: payload.data ?? payload,
      },
      { onConflict: "id" }
    );

    if (error) {
      return NextResponse.json({ error: "Save failed" }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ error: "Invalid request" }, { status: 400 });
  }
}
