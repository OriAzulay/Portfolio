import "server-only";
import { NextResponse } from "next/server";
import { z } from "zod";

/** An error that is safe to show to the client, with an HTTP status. */
export class AppError extends Error {
  constructor(
    public readonly status: number,
    message: string,
    public readonly details?: unknown
  ) {
    super(message);
    this.name = "AppError";
  }
}

/** Maps service-layer errors to a JSON response. Use in every route handler's catch. */
export function errorResponse(error: unknown): NextResponse {
  if (error instanceof AppError) {
    return NextResponse.json(
      { error: error.message, ...(error.details ? { details: error.details } : {}) },
      { status: error.status }
    );
  }
  if (error instanceof z.ZodError) {
    return NextResponse.json(
      { error: "Validation failed", details: z.flattenError(error).fieldErrors },
      { status: 400 }
    );
  }
  console.error("[api] Unexpected error:", error);
  return NextResponse.json({ error: "Internal server error" }, { status: 500 });
}

/** Parses a JSON body, turning malformed JSON into a 400. */
export async function readJson(request: Request): Promise<unknown> {
  try {
    return await request.json();
  } catch {
    throw new AppError(400, "Invalid JSON body");
  }
}
