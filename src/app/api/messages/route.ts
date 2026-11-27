import { NextResponse } from "next/server";
import { requireAdmin } from "@/server/auth/session";
import { errorResponse } from "@/server/http/errors";
import { countUnreadMessages, listMessages } from "@/server/services/contact.service";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    await requireAdmin();
    return NextResponse.json({ messages: listMessages(), unread: countUnreadMessages() });
  } catch (error) {
    return errorResponse(error);
  }
}
