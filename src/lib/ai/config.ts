const PLACEHOLDER_KEYS = new Set([
  "",
  "sk-...",
  "your-openai-api-key",
  "sk-your-key-here",
  "gsk-your-groq-key",
  "your-gemini-api-key",
]);

function isRealKey(key: string | undefined, placeholders: string[] = []) {
  const trimmed = key?.trim();
  if (!trimmed || trimmed.length < 10) return false;
  if (PLACEHOLDER_KEYS.has(trimmed)) return false;
  return !placeholders.some((p) => trimmed.includes(p));
}

export function hasValidApiKey() {
  const key = process.env.OPENAI_API_KEY?.trim();
  if (!key) return false;
  if (PLACEHOLDER_KEYS.has(key)) return false;
  return key.startsWith("sk-") || key.startsWith("sk-proj-") || key.length > 20;
}

export function hasGroqKey() {
  return isRealKey(process.env.GROQ_API_KEY, ["your-groq", "gsk-your"]);
}

export function hasGeminiKey() {
  return isRealKey(process.env.GEMINI_API_KEY, ["your-gemini", "AIza-your"]);
}

export function isOllamaEnabled() {
  return process.env.OLLAMA_ENABLED === "true";
}

export function isOllamaAutoDetect() {
  return process.env.OLLAMA_AUTO_DETECT !== "false";
}

export function hasAnyAiProvider() {
  return hasValidApiKey() || hasGroqKey() || hasGeminiKey() || isOllamaEnabled();
}

/** Demo mode is opt-in only. Real AI runs when any provider is configured. */
export function isMockMode() {
  if (process.env.AI_MOCK_MODE === "true") return true;
  return !hasAnyAiProvider();
}

export function getAiModeMessage() {
  if (!isMockMode()) return null;
  return "Demo mode: add a free GEMINI_API_KEY or GROQ_API_KEY to .env, set AI_MOCK_MODE=false, then restart npm run dev.";
}

export function getAiStatus() {
  const mock = isMockMode();
  const providers = {
    openai: hasValidApiKey(),
    groq: hasGroqKey(),
    gemini: hasGeminiKey(),
    ollama: isOllamaEnabled(),
  };

  const active = getPreferredProviderName();

  return {
    mockMode: mock,
    providers,
    activeProvider: active,
    model: getModelForProvider(active),
    message: getAiModeMessage(),
    setupHint: mock
      ? "Install Ollama (ollama.com) for unlimited free local AI, or get GROQ_API_KEY at console.groq.com"
      : !providers.groq && !providers.ollama
        ? "Cloud quotas exhausted? Add GROQ_API_KEY (free) or install Ollama for unlimited local AI"
        : null,
  };
}

export type ProviderName = "openai" | "groq" | "gemini" | "ollama" | "none";

function getPreferredProviderName(): ProviderName {
  const preferred = process.env.AI_PROVIDER?.trim().toLowerCase();
  if (preferred === "groq" && hasGroqKey()) return "groq";
  if (preferred === "gemini" && hasGeminiKey()) return "gemini";
  if (preferred === "ollama" && isOllamaEnabled()) return "ollama";
  if (preferred === "openai" && hasValidApiKey()) return "openai";
  if (hasGroqKey()) return "groq";
  if (hasGeminiKey()) return "gemini";
  if (isOllamaEnabled()) return "ollama";
  if (hasValidApiKey()) return "openai";
  return "none";
}

function getModelForProvider(provider: ProviderName) {
  switch (provider) {
    case "groq":
      return process.env.GROQ_MODEL || "qwen/qwen3.6-27b";
    case "gemini":
      return process.env.GEMINI_MODEL || "gemini-2.5-flash";
    case "ollama":
      return process.env.OLLAMA_MODEL || "llama3.2";
    case "openai":
      return process.env.OPENAI_MODEL || "gpt-4o-mini";
    default:
      return "none";
  }
}
