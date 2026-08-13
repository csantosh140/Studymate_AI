import { z } from "zod";
import { hasAnyAiProvider } from "@/lib/ai/config";
import {
  buildAllProvidersFailedMessage,
  getActiveProvider,
  getModel,
  getProviderChain,
  getProviderLabel,
  isRetryableError,
  runCompletion,
  type AiProvider,
} from "@/lib/ai/providers";

export function assertAiConfigured() {
  if (!hasAnyAiProvider()) {
    throw new Error(
      "No AI provider configured. Install Ollama (ollama.com) for unlimited local AI, or add GROQ_API_KEY (free at console.groq.com) to .env.",
    );
  }
}

export { getModel, getActiveProvider, getProviderLabel };

export async function chatJson<T>({
  system,
  user,
  schema,
  temperature = 0.35,
  maxAttempts = 2,
}: {
  system: string;
  user: string;
  schema: z.ZodType<T>;
  temperature?: number;
  maxAttempts?: number;
}): Promise<{
  data: T;
  tokensIn: number;
  tokensOut: number;
  provider: AiProvider;
  model: string;
}> {
  assertAiConfigured();

  const chain = await getProviderChain();
  let lastError: Error | null = null;
  const triedProviders: AiProvider[] = [];

  for (const provider of chain) {
    triedProviders.push(provider);
    let tokensIn = 0;
    let tokensOut = 0;
    let usedModel = getModel(provider);

    for (let attempt = 1; attempt <= maxAttempts; attempt++) {
      try {
        const result = await runCompletion(provider, {
          system,
          user:
            attempt === 1
              ? user
              : `${user}\n\nReturn ONLY valid JSON matching the required schema. No markdown.`,
          temperature: attempt === 1 ? temperature : Math.max(0.2, temperature - 0.1),
          jsonMode: true,
        });

        tokensIn += result.tokensIn;
        tokensOut += result.tokensOut;
        usedModel = result.model;

        let parsed: unknown;
        try {
          parsed = JSON.parse(result.content);
        } catch {
          lastError = new Error("The AI returned invalid JSON. Retrying...");
          continue;
        }

        const data = schema.parse(parsed);
        return { data, tokensIn, tokensOut, provider, model: usedModel };
      } catch (error) {
        if (error instanceof z.ZodError) {
          lastError = new Error("AI response format invalid. Retrying...");
          continue;
        }
        lastError = error instanceof Error ? error : new Error("Provider error");
        if (isRetryableError(error)) break;
        throw lastError;
      }
    }
  }

  throw new Error(buildAllProvidersFailedMessage(triedProviders));
}
