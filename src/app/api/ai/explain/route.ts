import { NextRequest } from "next/server";
import { runAiRoute } from "@/lib/ai/route-helper";
import { explainConcept } from "@/lib/ai/services";
import { explainSchema } from "@/lib/validators";

export async function POST(request: NextRequest) {
  return runAiRoute(request, {
    feature: "EXPLAIN",
    schema: explainSchema,
    handler: async (input) => {
      const result = await explainConcept(input);
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
