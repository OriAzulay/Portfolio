import { NextResponse } from "next/server";
import { requireAdmin } from "@/server/auth/session";
import { errorResponse } from "@/server/http/errors";
import { listGitHubRepos } from "@/server/services/github.service";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  try {
    await requireAdmin();
    const refresh = new URL(request.url).searchParams.get("refresh") === "1";
    return NextResponse.json(await listGitHubRepos({ refresh }));
  } catch (error) {
    return errorResponse(error);
  }
}
