import { NextResponse } from "next/server";
import { getStoredFileByUrl } from "@/server/services/image.service";
import { getPortfolio } from "@/server/services/portfolio.service";

export const dynamic = "force-dynamic";

/** /cv - opens the uploaded CV (PDF), or redirects to an external CV link. */
export async function GET(request: Request) {
  const { cvUrl, name } = (await getPortfolio()).personalInfo;
  if (!cvUrl) return NextResponse.redirect(new URL("/", request.url));

  const file = await getStoredFileByUrl(cvUrl);
  if (!file) return NextResponse.redirect(new URL(cvUrl, request.url));

  const filename = `${(name || "CV").replace(/[^\w\- ]+/g, "").trim().replace(/\s+/g, "_")}_CV.pdf`;
  return new Response(new Uint8Array(file.data), {
    headers: {
      "Content-Type": file.mimeType,
      "Content-Length": String(file.size),
      "Content-Disposition": `inline; filename="${filename}"`,
      "Cache-Control": "public, max-age=0, s-maxage=300, must-revalidate",
      "X-Content-Type-Options": "nosniff",
    },
  });
}
