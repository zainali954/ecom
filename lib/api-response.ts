import { NextResponse } from "next/server";
import type { ApiResponse } from "@/types/api";

export function successResponse<T>(
  data: T,
  message: string = "Success",
  status: number = 200,
): NextResponse<ApiResponse<T>> {
  return NextResponse.json({ success: true, message, data }, { status });
}

export function errorResponse(
  message: string,
  status: number = 500,
  error?: string,
): NextResponse<ApiResponse<never>> {
  return NextResponse.json({ success: false, message, error: error ?? message }, { status });
}

export function createdResponse<T>(
  data: T,
  message: string = "Created successfully",
): NextResponse<ApiResponse<T>> {
  return successResponse(data, message, 201);
}
