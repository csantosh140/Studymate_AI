"use client";

import { useState } from "react";
import { Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button, FieldLabel, FormCard, Select, TextArea, TextInput } from "@/components/ui/Button";
import { GlassCard } from "@/components/ui/GlassCard";

type ApiResponse<T> = {
  success: boolean;
  data: T | null;
  meta: Record<string, unknown> | null;
  error: { message: string } | null;
};

export function useAiRequest<T>() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [data, setData] = useState<T | null>(null);
  const [meta, setMeta] = useState<Record<string, unknown> | null>(null);

  async function run(url: string, body: unknown) {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      const json = (await res.json()) as ApiResponse<T>;
      if (!res.ok || !json.success) {
        throw new Error(json.error?.message || "Request failed");
      }
      setData(json.data);
      setMeta(json.meta);
      return json.data;
    } catch (err) {
      const message = err instanceof Error ? err.message : "Something went wrong";
      setError(message);
      setData(null);
      return null;
    } finally {
      setLoading(false);
    }
  }

  function reset() {
    setError(null);
    setData(null);
    setMeta(null);
  }

  return { loading, error, data, meta, run, reset, setError };
}

export function LoadingState({ label = "Thinking with StudyMate AI..." }: { label?: string }) {
  return (
    <GlassCard className="flex items-center gap-3 p-4">
      <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[var(--brand-soft)]">
        <Loader2 className="h-5 w-5 animate-spin text-[var(--brand)]" />
      </div>
      <div>
        <p className="text-sm font-medium text-[var(--foreground)]">{label}</p>
        <p className="text-xs text-[var(--muted)]">This usually takes a few seconds.</p>
      </div>
    </GlassCard>
  );
}

export function DemoBanner() {
  return (
    <div className="rounded-xl border border-amber-500/30 bg-amber-500/10 px-4 py-3 text-amber-700 dark:text-amber-300">
      <p className="text-sm font-medium">Demo mode active</p>
      <p className="mt-1 text-sm opacity-90">
        Real AI is disabled. Add a valid <code className="rounded bg-amber-500/10 px-1">OPENAI_API_KEY</code> to{" "}
        <code className="rounded bg-amber-500/10 px-1">.env</code>, set{" "}
        <code className="rounded bg-amber-500/10 px-1">AI_MOCK_MODE=false</code>, then restart{" "}
        <code className="rounded bg-amber-500/10 px-1">npm run dev</code>.
      </p>
    </div>
  );
}

export function AiStatusNotice({ meta }: { meta: Record<string, unknown> | null }) {
  if (meta?.mockMode) return <DemoBanner />;
  if (meta && meta.mockMode === false) {
    return (
      <div className="rounded-xl border border-emerald-500/30 bg-emerald-500/10 px-4 py-2 text-emerald-700 dark:text-emerald-300">
        <p className="text-xs font-medium">
          Live AI active · {String(meta.provider || "AI")} · {String(meta.model || "gpt-4o-mini")}
          {meta.tokensUsed ? ` · ${meta.tokensUsed} tokens` : ""}
        </p>
      </div>
    );
  }
  return null;
}

export function ErrorBanner({ message, onRetry }: { message: string; onRetry?: () => void }) {
  const isQuota =
    message.toLowerCase().includes("credit") ||
    message.toLowerCase().includes("quota") ||
    message.toLowerCase().includes("billing") ||
    message.toLowerCase().includes("exhausted") ||
    message.toLowerCase().includes("all configured");

  return (
    <div className="rounded-xl border border-rose-500/30 bg-rose-500/10 px-4 py-3 text-rose-700 dark:text-rose-300">
      <p className="text-sm font-medium">
        {isQuota ? "Cloud AI quota exhausted" : "Something went wrong"}
      </p>
      <p className="mt-1 whitespace-pre-line text-sm opacity-90">{message}</p>
      {isQuota ? (
        <div className="mt-3 space-y-3 rounded-lg bg-rose-500/10 p-3 text-xs leading-relaxed">
          <div>
            <p className="font-semibold text-[var(--foreground)]">Option 1 — Groq (free cloud)</p>
            <ol className="mt-1 list-decimal space-y-0.5 pl-4">
              <li>
                Get key at{" "}
                <a href="https://console.groq.com" target="_blank" rel="noreferrer" className="underline">
                  console.groq.com
                </a>
              </li>
              <li>
                Add to <code className="rounded bg-rose-500/10 px-1">.env</code>:{" "}
                <code className="rounded bg-rose-500/10 px-1">GROQ_API_KEY=&quot;gsk_...&quot;</code>
              </li>
            </ol>
          </div>
          <div>
            <p className="font-semibold text-[var(--foreground)]">Option 2 — Ollama (unlimited, local)</p>
            <ol className="mt-1 list-decimal space-y-0.5 pl-4">
              <li>
                Install from{" "}
                <a href="https://ollama.com/download" target="_blank" rel="noreferrer" className="underline">
                  ollama.com/download
                </a>
              </li>
              <li>
                Run: <code className="rounded bg-rose-500/10 px-1">ollama pull llama3.2</code>
              </li>
              <li>
                Add to <code className="rounded bg-rose-500/10 px-1">.env</code>:{" "}
                <code className="rounded bg-rose-500/10 px-1">OLLAMA_ENABLED=true</code>
              </li>
            </ol>
          </div>
          <p className="text-[var(--muted)]">Then restart: npm run dev</p>
        </div>
      ) : null}
      {onRetry ? (
        <button
          type="button"
          onClick={onRetry}
          className="mt-2 text-sm font-semibold underline underline-offset-2"
        >
          Try again
        </button>
      ) : null}
    </div>
  );
}

export function ResultPanel({
  title,
  children,
  className,
}: {
  title: string;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <GlassCard className={cn("p-5 sm:p-6", className)}>
      <h3 className="font-display text-lg text-[var(--foreground)]">{title}</h3>
      <div className="mt-3 space-y-3 text-sm leading-relaxed text-[var(--muted)]">{children}</div>
    </GlassCard>
  );
}

export { Button, FieldLabel, FormCard, Select, TextArea, TextInput };

export function PrimaryButton({
  children,
  loading,
  className,
  ...props
}: React.ButtonHTMLAttributes<HTMLButtonElement> & { loading?: boolean }) {
  return (
    <Button {...props} loading={loading} className={className}>
      {children}
    </Button>
  );
}
