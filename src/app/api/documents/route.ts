import { NextResponse } from "next/server";
import { requireAdmin } from "@/server/auth/session";
import { AppError, errorResponse } from "@/server/http/errors";
import { storeUploadedDocument } from "@/server/services/image.service";

/** Uploads a PDF document (the CV). */
export async function POST(request: Request) {
  try {
    await requireAdmin();
    const formData = await request.formData().catch(() => {
      throw new AppError(400, "Expected multipart form data");
    });
    return NextResponse.json(await storeUploadedDocument(formData.get("file")), { status: 201 });
  } catch (error) {
    return errorResponse(error);
  }
}
