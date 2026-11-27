import { NextResponse } from "next/server";
import { requireAdmin } from "@/server/auth/session";
import { errorResponse, readJson } from "@/server/http/errors";
import { getPortfolio, updatePortfolio } from "@/server/services/portfolio.service";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    return NextResponse.json({ data: getPortfolio() });
  } catch (error) {
    return errorResponse(error);
  }
}

export async function PUT(request: Request) {
  try {
    await requireAdmin();
    const body = (await readJson(request)) as { data?: unknown };
    return NextResponse.json({ data: updatePortfolio(body?.data) });
  } catch (error) {
    return errorResponse(error);
  }
}
