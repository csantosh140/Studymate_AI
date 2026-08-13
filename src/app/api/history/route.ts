import { NextRequest } from "next/server";
import { requireUser } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { handleApiError, jsonOk } from "@/lib/api";

export async function GET(request: NextRequest) {
  try {
    const user = await requireUser();
    const feature = request.nextUrl.searchParams.get("feature");

    const jobs = await prisma.aiJob.findMany({
      where: {
        userId: user.id,
        ...(feature ? { feature } : {}),
      },
      orderBy: { createdAt: "desc" },
      take: 30,
      select: {
        id: true,
        feature: true,
        status: true,
        tokensUsed: true,
        createdAt: true,
        outputJson: true,
      },
    });

    return jsonOk(
      jobs.map((job) => ({
        ...job,
        preview: job.outputJson ? JSON.parse(job.outputJson) : null,
        outputJson: undefined,
      })),
    );
  } catch (error) {
    return handleApiError(error);
  }
}
