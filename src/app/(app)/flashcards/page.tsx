"use client";

import { useState } from "react";
import { FeaturePageHeader } from "@/components/layout/PageBits";
import {
  ErrorBanner,
  AiStatusNotice,
  FieldLabel,
  FormCard,
  LoadingState,
  PrimaryButton,
  ResultPanel,
  TextArea,
  TextInput,
  useAiRequest,
} from "@/components/ai/shared";

type FlashResult = {
  title: string;
  deckId?: string;
  cards: Array<{ front: string; back: string }>;
};

export default function FlashcardsPage() {
  const [text, setText] = useState("");
  const [count, setCount] = useState(10);
  const [flipped, setFlipped] = useState<Record<number, boolean>>({});
  const { loading, error, data, meta, run } = useAiRequest<FlashResult>();

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setFlipped({});
    await run("/api/ai/flashcards", { text, count, save: true });
  }

  return (
    <div>
      <FeaturePageHeader
        title="Flashcard Generator"
        description="Create flip cards from your notes for quick active recall sessions."
      />

      <div className="grid gap-6 lg:grid-cols-2">
        <form onSubmit={onSubmit}>
          <FormCard>
          <div>
            <FieldLabel>Notes or topic</FieldLabel>
            <TextArea
              rows={12}
              value={text}
              onChange={(e) => setText(e.target.value)}
              placeholder="Paste notes to convert into flashcards..."
              required
            />
          </div>
          <div>
            <FieldLabel>Number of cards</FieldLabel>
            <TextInput
              type="number"
              min={5}
              max={40}
              value={count}
              onChange={(e) => setCount(Number(e.target.value))}
            />
          </div>
          <PrimaryButton type="submit" loading={loading}>
            Generate flashcards
          </PrimaryButton>
          </FormCard>
        </form>

        <div className="space-y-4">
          {loading ? <LoadingState label="Creating flashcards..." /> : null}
          {meta ? <AiStatusNotice meta={meta} /> : null}
          {error ? <ErrorBanner message={error} /> : null}
          {data ? (
            <ResultPanel title={data.title}>
              <div className="grid gap-3 sm:grid-cols-2">
                {data.cards.map((card, idx) => (
                  <button
                    key={`${card.front}-${idx}`}
                    type="button"
                    onClick={() => setFlipped((prev) => ({ ...prev, [idx]: !prev[idx] }))}
                    className="min-h-28 rounded-xl border border-[var(--card-border)] bg-gradient-to-br from-[var(--card)] to-[var(--brand-soft)] p-4 text-left transition hover:border-[var(--brand)]/40 hover:shadow-md"
                  >
                    <p className="text-[11px] font-semibold uppercase tracking-wide text-[var(--brand)]">
                      {flipped[idx] ? "Back" : "Front"} · tap to flip
                    </p>
                    <p className="mt-2 text-sm font-medium text-[var(--foreground)]">
                      {flipped[idx] ? card.back : card.front}
                    </p>
                  </button>
                ))}
              </div>
            </ResultPanel>
          ) : null}
        </div>
      </div>
    </div>
  );
}
