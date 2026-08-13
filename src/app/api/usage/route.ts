import { requireUser } from "@/lib/auth";
import { checkRateLimit } from "@/lib/ai/usage";
import { prisma } from "@/lib/db";
import { handleApiError, jsonOk } from "@/lib/api";

export async function GET() {
  try {
    const user = await requireUser();
    const limit = await checkRateLimit(user.id, user.plan);

    const start = new Date();
    start.setHours(0, 0, 0, 0);

    const todayCount = await prisma.usageEvent.count({
      where: { userId: user.id, createdAt: { gte: start } },
    });

    return jsonOk({
      plan: user.plan,
      todayCount,
      remaining: limit.remaining,
      limit: "limit" in limit ? limit.limit : null,
    });
  } catch (error) {
    return handleApiError(error);
  }
}
