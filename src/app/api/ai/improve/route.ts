import { NextRequest } from "next/server";
import { runAiRoute } from "@/lib/ai/route-helper";
import { improveAnswer } from "@/lib/ai/services";
import { improveSchema } from "@/lib/validators";

export async function POST(request: NextRequest) {
  return runAiRoute(request, {
    feature: "IMPROVE",
    schema: improveSchema,
    handler: async (input) => {
      const result = await improveAnswer(input);
      return {
        data: result.data,
        tokensIn: result.tokensIn,
        tokensOut: result.tokensOut,
        provider: result.provider,
        model: result.model,
      };
    },
  });
}
