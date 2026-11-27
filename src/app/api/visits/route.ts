import { NextResponse } from "next/server";
import { requireAdmin } from "@/server/auth/session";
import { getClientIpHash } from "@/server/http/client-ip";
import { errorResponse } from "@/server/http/errors";
import { countUniqueVisitors, recordVisit } from "@/server/services/visit.service";

export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  try {
    recordVisit(getClientIpHash(request));
    return new NextResponse(null, { status: 204 });
  } catch (error) {
    return errorResponse(error);
  }
}

export async function GET() {
  try {
    await requireAdmin();
    return NextResponse.json({ count: countUniqueVisitors() });
  } catch (error) {
    return errorResponse(error);
  }
}
