import { NextRequest } from "next/server";
import { runAiRoute } from "@/lib/ai/route-helper";
import { summarizeNotes } from "@/lib/ai/services";
import { summarizeSchema } from "@/lib/validators";

export async function POST(request: NextRequest) {
  return runAiRoute(request, {
    feature: "SUMMARIZE",
    schema: summarizeSchema,
    handler: async (input) => {
      const result = await summarizeNotes(input);
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
