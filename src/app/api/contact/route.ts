import { NextResponse } from "next/server";
import { getClientIpHash } from "@/server/http/client-ip";
import { errorResponse, readJson } from "@/server/http/errors";
import { submitContactMessage } from "@/server/services/contact.service";

export async function POST(request: Request) {
  try {
    submitContactMessage(await readJson(request), getClientIpHash(request));
    return NextResponse.json({ success: true }, { status: 201 });
  } catch (error) {
    return errorResponse(error);
  }
}
