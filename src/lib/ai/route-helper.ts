import { NextRequest } from "next/server";
import { requireUser } from "@/lib/auth";
import { isMockMode } from "@/lib/ai/config";
import { getActiveProvider, getModel, getProviderLabel } from "@/lib/ai/providers";
import { checkRateLimit, logUsage } from "@/lib/ai/usage";
import { handleApiError, jsonError, jsonOk } from "@/lib/api";
import type { AiFeature } from "@/lib/validators";
import type { ZodType } from "zod";

export async function runAiRoute<TInput, TOutput>(
  request: NextRequest,
  options: {
    feature: AiFeature;
    schema: ZodType<TInput>;
    handler: (input: TInput, userId: string) => Promise<{
      data: TOutput;
      tokensIn: number;
      tokensOut: number;
      persistInput?: unknown;
      provider?: string;
      model?: string;
    }>;
  },
) {
  try {
    const user = await requireUser();
    const limit = await checkRateLimit(user.id, user.plan);
    if (!limit.allowed) {
      return jsonError(
        `Daily free limit reached (${limit.limit} requests). Try again tomorrow or upgrade.`,
        429,
      );
    }

    const body = await request.json();
    const input = options.schema.parse(body);
    const result = await options.handler(input, user.id);

    await logUsage({
      userId: user.id,
      feature: options.feature,
      tokensIn: result.tokensIn,
      tokensOut: result.tokensOut,
      jobInput: result.persistInput ?? input,
      jobOutput: result.data,
    });

    return jsonOk(result.data, {
      tokensUsed: result.tokensIn + result.tokensOut,
      remainingToday: Math.max(0, (limit.remaining ?? 1) - 1),
      mockMode: isMockMode(),
      provider: result.provider ?? getProviderLabel(getActiveProvider()),
      model: result.model ?? getModel(),
    });
  } catch (error) {
    return handleApiError(error);
  }
}
