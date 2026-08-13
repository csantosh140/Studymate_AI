import { NextResponse } from "next/server";
import { getAiStatus } from "@/lib/ai/config";

export async function GET() {
  const status = getAiStatus();
  return NextResponse.json({
    success: true,
    data: status,
    error: null,
  });
}
