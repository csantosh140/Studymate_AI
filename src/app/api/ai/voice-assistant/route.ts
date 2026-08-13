import { NextRequest } from "next/server";
import { runAiRoute } from "@/lib/ai/route-helper";
import { voiceChat } from "@/lib/ai/services";
import { voiceAssistantSchema } from "@/lib/validators";

export async function POST(request: NextRequest) {
  return runAiRoute(request, {
    feature: "VOICE_ASSISTANT",
    schema: voiceAssistantSchema,
    handler: async (input) => {
      const result = await voiceChat(input);
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
