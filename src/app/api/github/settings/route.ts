import { NextResponse } from "next/server";
import { requireAdmin } from "@/server/auth/session";
import { errorResponse, readJson } from "@/server/http/errors";
import { getGitHubSettings, updateGitHubSettings } from "@/server/services/github.service";

export const dynamic = "force-dynamic";

/** The token itself is never returned - only whether one is saved. */
export async function GET() {
  try {
    await requireAdmin();
    return NextResponse.json(getGitHubSettings());
  } catch (error) {
    return errorResponse(error);
  }
}

export async function PUT(request: Request) {
  try {
    await requireAdmin();
    return NextResponse.json(updateGitHubSettings(await readJson(request)));
  } catch (error) {
    return errorResponse(error);
  }
}
