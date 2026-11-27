import { NextResponse } from "next/server";
import { requireAdmin } from "@/server/auth/session";
import { AppError, errorResponse } from "@/server/http/errors";
import { storeUploadedImage } from "@/server/services/image.service";

export async function POST(request: Request) {
  try {
    await requireAdmin();
    const formData = await request.formData().catch(() => {
      throw new AppError(400, "Expected multipart form data");
    });
    const image = await storeUploadedImage(formData.get("file"), formData.get("kind"));
    return NextResponse.json(image, { status: 201 });
  } catch (error) {
    return errorResponse(error);
  }
}
