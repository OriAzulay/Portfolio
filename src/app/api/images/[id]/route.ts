import { errorResponse } from "@/server/http/errors";
import { getImage } from "@/server/services/image.service";

export async function GET(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const image = getImage((await params).id);
    return new Response(new Uint8Array(image.data), {
      headers: {
        "Content-Type": image.mimeType,
        "Content-Length": String(image.size),
        // Image ids are never reused, so the bytes behind a URL never change.
        "Cache-Control": "public, max-age=31536000, immutable",
        "X-Content-Type-Options": "nosniff",
      },
    });
  } catch (error) {
    return errorResponse(error);
  }
}
