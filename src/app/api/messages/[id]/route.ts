import { NextResponse } from "next/server";
import { requireAdmin } from "@/server/auth/session";
import { errorResponse, readJson } from "@/server/http/errors";
import { deleteMessage, updateMessage } from "@/server/services/contact.service";

type Context = { params: Promise<{ id: string }> };

export async function PATCH(request: Request, { params }: Context) {
  try {
    await requireAdmin();
    updateMessage((await params).id, await readJson(request));
    return NextResponse.json({ success: true });
  } catch (error) {
    return errorResponse(error);
  }
}

export async function DELETE(_request: Request, { params }: Context) {
  try {
    await requireAdmin();
    deleteMessage((await params).id);
    return NextResponse.json({ success: true });
  } catch (error) {
    return errorResponse(error);
  }
}
