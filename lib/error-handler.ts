import { NextResponse } from "next/server";
import { AppError } from "@/lib/errors";
import { logger } from "@/lib/logger";
import type { ApiResponse } from "@/types/api";

function isZodError(error: unknown): error is { issues: Array<{ message: string }> } {
  return (
    typeof error === "object" &&
    error !== null &&
    "issues" in error &&
    Array.isArray((error as Record<string, unknown>).issues)
  );
}

export function handleApiError(error: unknown): NextResponse<ApiResponse<never>> {
  if (error instanceof AppError) {
    logger.warn(error.message, { statusCode: error.statusCode });
    return NextResponse.json(
      { success: false, message: error.message, error: error.message },
      { status: error.statusCode },
    );
  }

  if (isZodError(error)) {
    const message = error.issues.map((e) => e.message).join(", ");
    logger.warn("Validation error", { errors: error.issues });
    return NextResponse.json(
      { success: false, message: "Validation failed", error: message },
      { status: 400 },
    );
  }

  const message = error instanceof Error ? error.message : "Internal server error";
  logger.error("Unhandled error", { error: message });
  return NextResponse.json(
    { success: false, message: "Internal server error", error: message },
    { status: 500 },
  );
}
