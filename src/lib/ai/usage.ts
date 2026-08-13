import { prisma } from "@/lib/db";
import type { AiFeature } from "@/lib/validators";

const FREE_DAILY_LIMIT = 40;

export async function checkRateLimit(userId: string, plan: string) {
  if (plan === "PRO") return { allowed: true as const, remaining: 999 };

  const start = new Date();
  start.setHours(0, 0, 0, 0);

  const used = await prisma.usageEvent.count({
    where: { userId, createdAt: { gte: start } },
  });

  if (used >= FREE_DAILY_LIMIT) {
    return { allowed: false as const, remaining: 0, limit: FREE_DAILY_LIMIT };
  }

  return {
    allowed: true as const,
    remaining: FREE_DAILY_LIMIT - used,
    limit: FREE_DAILY_LIMIT,
  };
}

export async function logUsage(input: {
  userId: string;
  feature: AiFeature;
  tokensIn: number;
  tokensOut: number;
  jobInput: unknown;
  jobOutput: unknown;
}) {
  await prisma.$transaction([
    prisma.usageEvent.create({
      data: {
        userId: input.userId,
        feature: input.feature,
        tokensIn: input.tokensIn,
        tokensOut: input.tokensOut,
      },
    }),
    prisma.aiJob.create({
      data: {
        userId: input.userId,
        feature: input.feature,
        status: "SUCCEEDED",
        inputJson: JSON.stringify(input.jobInput),
        outputJson: JSON.stringify(input.jobOutput),
        tokensUsed: input.tokensIn + input.tokensOut,
        finishedAt: new Date(),
      },
    }),
  ]);
}
