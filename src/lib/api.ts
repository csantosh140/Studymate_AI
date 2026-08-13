import { NextResponse } from "next/server";
import { ZodError } from "zod";

export function jsonOk<T>(data: T, meta?: Record<string, unknown>, status = 200) {
  return NextResponse.json({ success: true, data, meta: meta ?? null, error: null }, { status });
}

export function jsonError(message: string, status = 400, details?: unknown) {
  return NextResponse.json(
    { success: false, data: null, meta: null, error: { message, details: details ?? null } },
    { status },
  );
}

export function handleApiError(error: unknown) {
  if (error instanceof Error && error.message === "UNAUTHORIZED") {
    return jsonError("Please sign in to continue.", 401);
  }

  if (error instanceof ZodError) {
    return jsonError(error.issues[0]?.message || "Invalid input.", 400, error.issues);
  }

  if (error instanceof Error) {
    const msg = error.message;
    if (msg.includes("OPENAI_API_KEY")) {
      return jsonError(msg, 503);
    }
    if (msg.includes("credit") || msg.includes("quota") || msg.includes("billing")) {
      return jsonError(msg, 402);
    }
    if (msg.includes("429") || msg.toLowerCase().includes("rate limit")) {
      return jsonError("AI provider rate limit hit. Please wait and retry.", 429);
    }
    return jsonError(msg || "Something went wrong.", 500);
  }

  return jsonError("Unexpected server error.", 500);
}
