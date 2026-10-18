import { NextResponse } from "next/server";
import { createSession } from "@/server/auth/session";
import { getClientIpHash } from "@/server/http/client-ip";
import { errorResponse, readJson } from "@/server/http/errors";
import { verifyAdminLogin } from "@/server/services/auth.service";

export async function POST(request: Request) {
  try {
    verifyAdminLogin(await readJson(request), getClientIpHash(request));
    await createSession();
    return NextResponse.json({ success: true });
  } catch (error) {
    return errorResponse(error);
  }
}
