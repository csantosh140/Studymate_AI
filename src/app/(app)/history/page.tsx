"use client";

import { useEffect, useState } from "react";
import { History as HistoryIcon } from "lucide-react";
import { FeaturePageHeader } from "@/components/layout/PageBits";
import { ErrorBanner, LoadingState } from "@/components/ai/shared";
import { Badge } from "@/components/ui/Badge";
import { GlassCard } from "@/components/ui/GlassCard";
import { formatDate } from "@/lib/utils";

type HistoryItem = {
  id: string;
  feature: string;
  status: string;
  tokensUsed: number | null;
  createdAt: string;
  preview: unknown;
};

export default function HistoryPage() {
  const [items, setItems] = useState<HistoryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function load() {
      try {
        const res = await fetch("/api/history");
        const json = await res.json();
        if (!res.ok || !json.success) {
          throw new Error(json.error?.message || "Failed to load history");
        }
        setItems(json.data);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to load history");
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  return (
    <div>
      <FeaturePageHeader
        title="History"
        description="Review recent AI generations across all StudyMate tools."
      />

      {loading ? <LoadingState label="Loading history..." /> : null}
      {error ? <ErrorBanner message={error} /> : null}

      {!loading && !error ? (
        <GlassCard className="overflow-hidden">
          {items.length === 0 ? (
            <div className="flex flex-col items-center px-5 py-16 text-center">
              <span className="mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-[var(--brand-soft)]">
                <HistoryIcon className="h-6 w-6 text-[var(--brand)]" />
              </span>
              <p className="text-sm font-medium text-[var(--foreground)]">No history yet</p>
              <p className="mt-1 text-sm text-[var(--muted)]">
                Your AI generations will appear here once you start using the tools.
              </p>
            </div>
          ) : (
            <ul className="divide-y divide-[var(--card-border)]">
              {items.map((item) => (
                <li key={item.id} className="px-5 py-4 transition hover:bg-[var(--brand-soft)]/20">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <p className="font-semibold text-[var(--foreground)]">{item.feature}</p>
                    <div className="flex items-center gap-2">
                      <Badge variant="muted">{item.status}</Badge>
                      <span className="text-xs text-[var(--muted)]">{formatDate(item.createdAt)}</span>
                    </div>
                  </div>
                  <p className="mt-1 text-xs text-[var(--muted)]">
                    {item.tokensUsed ?? 0} tokens used
                  </p>
                  <pre className="mt-2 max-h-28 overflow-auto rounded-lg bg-[var(--muted-bg)]/30 p-2 text-[11px] text-[var(--muted)]">
                    {JSON.stringify(item.preview, null, 2)}
                  </pre>
                </li>
              ))}
            </ul>
          )}
        </GlassCard>
      ) : null}
    </div>
  );
}
