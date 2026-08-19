import OpenAI from "openai";
import {
  hasGeminiKey,
  hasGroqKey,
  hasValidApiKey,
  isOllamaEnabled,
} from "@/lib/ai/config";

export type AiProvider = "openai" | "groq" | "gemini" | "ollama";

const GEMINI_FALLBACK_MODELS = [
  "gemini-3.6-flash",
  "gemini-2.5-flash",
  "gemini-2.0-flash-lite",
  "gemini-1.5-flash-8b",
];

const GROQ_FALLBACK_MODELS = [
  "qwen/qwen3.6-27b",
  "groq/compound",
  "openai/gpt-oss-20b",
  "llama-3.3-70b-versatile",
];

let ollamaReachable: boolean | null = null;

export async function checkOllamaAvailable(): Promise<boolean> {
  if (ollamaReachable !== null) return ollamaReachable;
  if (!isOllamaEnabled() && process.env.OLLAMA_AUTO_DETECT === "false") {
    ollamaReachable = false;
    return false;
  }
  try {
    const base = process.env.OLLAMA_BASE_URL?.trim() || "http://localhost:11434";
    const res = await fetch(`${base.replace("/v1", "")}/api/tags`, {
      signal: AbortSignal.timeout(2000),
    });
    ollamaReachable = res.ok;
  } catch {
    ollamaReachable = false;
  }
  return ollamaReachable;
}

export function isProviderConfigured(provider: AiProvider) {
  switch (provider) {
    case "openai":
      return hasValidApiKey();
    case "groq":
      return hasGroqKey();
    case "gemini":
      return hasGeminiKey();
    case "ollama":
      return isOllamaEnabled();
  }
}

export function getProviderChainSync(): AiProvider[] {
  const preferredStr = process.env.AI_PROVIDER?.trim().toLowerCase();
  const preferred = preferredStr && preferredStr !== "auto" ? (preferredStr as AiProvider) : undefined;

  const chain: AiProvider[] = [];
  if (hasGroqKey()) chain.push("groq");
  if (hasGeminiKey()) chain.push("gemini");
  if (isOllamaEnabled()) chain.push("ollama");
  if (hasValidApiKey()) chain.push("openai");

  if (!chain.length) {
    return hasGeminiKey() ? ["gemini"] : ["openai"];
  }

  if (preferred && isProviderConfigured(preferred)) {
    return [preferred, ...chain.filter((p) => p !== preferred)];
  }

  return chain;
}

export async function getProviderChain(): Promise<AiProvider[]> {
  const chain = getProviderChainSync();
  if (!chain.includes("ollama")) {
    const available = await checkOllamaAvailable();
    if (available) chain.push("ollama");
  }
  return chain;
}

export function getActiveProvider(): AiProvider {
  return getProviderChainSync()[0] ?? "gemini";
}

export function getModel(provider: AiProvider = getActiveProvider(), geminiModelOverride?: string) {
  switch (provider) {
    case "groq":
      return process.env.GROQ_MODEL?.trim() || "qwen/qwen3.6-27b";
    case "gemini":
      return geminiModelOverride || process.env.GEMINI_MODEL?.trim() || "gemini-2.5-flash";
    case "ollama":
      return process.env.OLLAMA_MODEL?.trim() || "llama3.2";
    default:
      return process.env.OPENAI_MODEL?.trim() || "gpt-4o-mini";
  }
}

const clients = new Map<string, OpenAI>();

export function getOpenAiCompatibleClient(provider: "openai" | "groq" | "ollama") {
  let client = clients.get(provider);
  if (!client) {
    if (provider === "groq") {
      client = new OpenAI({
        apiKey: process.env.GROQ_API_KEY,
        baseURL: "https://api.groq.com/openai/v1",
        timeout: 90_000,
        maxRetries: 1,
      });
    } else if (provider === "ollama") {
      client = new OpenAI({
        apiKey: "ollama",
        baseURL: process.env.OLLAMA_BASE_URL?.trim() || "http://localhost:11434/v1",
        timeout: 180_000,
        maxRetries: 0,
      });
    } else {
      client = new OpenAI({
        apiKey: process.env.OPENAI_API_KEY,
        timeout: 90_000,
        maxRetries: 1,
      });
    }
    clients.set(provider, client);
  }
  return client;
}

export function getProviderLabel(provider: AiProvider) {
  switch (provider) {
    case "groq":
      return "Groq";
    case "gemini":
      return "Gemini";
    case "ollama":
      return "Ollama (local)";
    default:
      return "OpenAI";
  }
}

export function isQuotaError(error: unknown) {
  if (error instanceof OpenAI.APIError) {
    const msg = error.message.toLowerCase();
    return (
      error.status === 402 ||
      (error.status === 429 &&
        (error.code === "insufficient_quota" ||
          msg.includes("credit") ||
          msg.includes("quota") ||
          msg.includes("billing") ||
          msg.includes("rate limit")))
    );
  }
  if (error instanceof Error) {
    const msg = error.message.toLowerCase();
    return (
      msg.includes("credit") ||
      msg.includes("quota") ||
      msg.includes("billing") ||
      msg.includes("rate limit") ||
      msg.includes("exceeded")
    );
  }
  return false;
}

export function isModelNotFoundError(error: unknown): boolean {
  if (error instanceof OpenAI.APIError) {
    return error.status === 404 || error.status === 400 || error.status === 413;
  }
  if (error instanceof Error) {
    const msg = error.message.toLowerCase();
    return (
      msg.includes("does not exist") ||
      msg.includes("not found") ||
      msg.includes("decommissioned") ||
      msg.includes("no longer available") ||
      msg.includes("request entity too large") ||
      msg.includes("request_too_large") ||
      msg.includes("404") ||
      msg.includes("400") ||
      msg.includes("413")
    );
  }
  return false;
}

export function isRetryableError(error: unknown) {
  if (isQuotaError(error)) return true;
  if (error instanceof OpenAI.APIError) {
    return error.status === 429 || error.status === 503 || error.status === 500;
  }
  if (error instanceof Error) {
    const msg = error.message.toLowerCase();
    return (
      msg.includes("econnrefused") ||
      msg.includes("fetch failed") ||
      msg.includes("timeout") ||
      msg.includes("quota") ||
      msg.includes("rate limit")
    );
  }
  return false;
}

function parseRetryDelay(message: string): number | null {
  const match = message.match(/retry in (\d+(?:\.\d+)?)\s*s/i);
  if (match) return Math.ceil(parseFloat(match[1]) * 1000);
  return null;
}

function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

type CompletionParams = {
  system: string;
  user: string;
  temperature: number;
  jsonMode: boolean;
};

type CompletionResult = {
  content: string;
  tokensIn: number;
  tokensOut: number;
  model: string;
};

async function geminiCompletionWithModel(
  model: string,
  params: CompletionParams,
): Promise<CompletionResult> {
  const key = process.env.GEMINI_API_KEY?.trim();

  const res = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${key}`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        systemInstruction: { parts: [{ text: params.system }] },
        contents: [{ role: "user", parts: [{ text: params.user }] }],
        generationConfig: {
          temperature: params.temperature,
          responseMimeType: params.jsonMode ? "application/json" : "text/plain",
        },
      }),
    },
  );

  const body = (await res.json()) as {
    error?: { message?: string; status?: string };
    candidates?: Array<{ content?: { parts?: Array<{ text?: string }> } }>;
    usageMetadata?: { promptTokenCount?: number; candidatesTokenCount?: number };
  };

  if (!res.ok) {
    const msg = body.error?.message || `Gemini API error (${res.status})`;
    const err = new Error(msg);
    if (res.status === 429 || msg.toLowerCase().includes("quota") || msg.toLowerCase().includes("rate")) {
      (err as Error & { isQuota: boolean }).isQuota = true;
    }
    throw err;
  }

  const content = body.candidates?.[0]?.content?.parts?.[0]?.text?.trim();
  if (!content) throw new Error("Gemini returned an empty response.");

  return {
    content,
    tokensIn: body.usageMetadata?.promptTokenCount ?? 0,
    tokensOut: body.usageMetadata?.candidatesTokenCount ?? 0,
    model,
  };
}

async function geminiCompletion(params: CompletionParams): Promise<CompletionResult> {
  const primary = getModel("gemini");
  const models = Array.from(new Set([primary, ...GEMINI_FALLBACK_MODELS]));

  let lastError: Error | null = null;

  for (const model of models) {
    try {
      return await geminiCompletionWithModel(model, params);
    } catch (error) {
      lastError = error instanceof Error ? error : new Error("Gemini error");
      const delay = parseRetryDelay(lastError.message);
      if (delay && delay <= 45_000) {
        await sleep(delay + 500);
        try {
          return await geminiCompletionWithModel(model, params);
        } catch (retryErr) {
          lastError = retryErr instanceof Error ? retryErr : lastError;
        }
      }
      if (isQuotaError(error) || isModelNotFoundError(error)) continue;
      throw lastError;
    }
  }

  throw lastError ?? new Error("All Gemini models exhausted. Try Groq or Ollama.");
}

async function openAiCompatibleCompletion(
  provider: "openai" | "groq" | "ollama",
  params: CompletionParams,
): Promise<CompletionResult> {
  const primaryModel = getModel(provider);
  const modelsToTry = provider === "groq"
    ? Array.from(new Set([primaryModel, ...GROQ_FALLBACK_MODELS]))
    : [primaryModel];

  let lastError: Error | null = null;

  for (const model of modelsToTry) {
    try {
      const completion = await getOpenAiCompatibleClient(provider).chat.completions.create({
        model,
        temperature: params.temperature,
        max_tokens: provider === "groq" ? 4096 : undefined,
        response_format: params.jsonMode ? { type: "json_object" } : undefined,
        messages: [
          { role: "system", content: params.system },
          { role: "user", content: params.user },
        ],
      });

      const content = completion.choices[0]?.message?.content?.trim();
      if (!content) throw new Error(`${getProviderLabel(provider)} returned an empty response.`);

      return {
        content,
        tokensIn: completion.usage?.prompt_tokens ?? 0,
        tokensOut: completion.usage?.completion_tokens ?? 0,
        model,
      };
    } catch (error) {
      lastError = error instanceof Error ? error : new Error(`${getProviderLabel(provider)} error`);
      if (provider === "groq" && isModelNotFoundError(error)) {
        continue;
      }
      throw lastError;
    }
  }

  throw lastError ?? new Error(`All ${getProviderLabel(provider)} models failed.`);
}

export async function runCompletion(
  provider: AiProvider,
  params: CompletionParams,
): Promise<CompletionResult> {
  if (provider === "gemini") return geminiCompletion(params);
  return openAiCompatibleCompletion(provider, params);
}

export function buildAllProvidersFailedMessage(tried: AiProvider[]): string {
  const triedLabels = tried.map(getProviderLabel).join(", ");
  return (
    `All configured AI providers failed (${triedLabels || "none"}). ` +
    "Cloud free tiers are exhausted. Fix options:\n" +
    "1. Groq (free): get key at console.groq.com → add GROQ_API_KEY to .env\n" +
    "2. Ollama (unlimited, local): install from ollama.com → run 'ollama pull llama3.2' → set OLLAMA_ENABLED=true\n" +
    "3. Wait until tomorrow for Gemini/OpenAI quotas to reset\n" +
    "Then restart: npm run dev"
  );
}
