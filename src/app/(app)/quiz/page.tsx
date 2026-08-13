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
  Select,
  TextArea,
  TextInput,
  useAiRequest,
} from "@/components/ai/shared";

type QuizResult = {
  title: string;
  quizId?: string;
  questions: Array<{
    type: string;
    prompt: string;
    options?: string[];
    answer: string;
    explanation: string;
  }>;
};

export default function QuizPage() {
  const [text, setText] = useState("");
  const [count, setCount] = useState(5);
  const [difficulty, setDifficulty] = useState("medium");
  const [revealed, setRevealed] = useState<Record<number, boolean>>({});
  const { loading, error, data, meta, run } = useAiRequest<QuizResult>();

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setRevealed({});
    await run("/api/ai/quiz", {
      text,
      count,
      difficulty,
      types: ["mcq", "short", "true_false"],
      save: true,
    });
  }

  return (
    <div>
      <FeaturePageHeader
        title="Quiz Generator"
        description="Turn study material into practice questions with answers and explanations."
      />

      <div className="grid gap-6 lg:grid-cols-2">
        <form onSubmit={onSubmit}>
          <FormCard>
          <div>
            <FieldLabel>Source material</FieldLabel>
            <TextArea
              rows={12}
              value={text}
              onChange={(e) => setText(e.target.value)}
              placeholder="Paste a chapter, notes, or topic details..."
              required
            />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <FieldLabel>Questions</FieldLabel>
              <TextInput
                type="number"
                min={3}
                max={20}
                value={count}
                onChange={(e) => setCount(Number(e.target.value))}
              />
            </div>
            <div>
              <FieldLabel>Difficulty</FieldLabel>
              <Select value={difficulty} onChange={(e) => setDifficulty(e.target.value)}>
                <option value="easy">Easy</option>
                <option value="medium">Medium</option>
                <option value="hard">Hard</option>
              </Select>
            </div>
          </div>
          <PrimaryButton type="submit" loading={loading}>
            Generate quiz
          </PrimaryButton>
          </FormCard>
        </form>

        <div className="space-y-4">
          {loading ? <LoadingState label="Building your quiz..." /> : null}
          {meta ? <AiStatusNotice meta={meta} /> : null}
          {error ? <ErrorBanner message={error} /> : null}
          {data ? (
            <ResultPanel title={data.title}>
              {data.questions.map((q, idx) => (
                <div key={`${q.prompt}-${idx}`} className="rounded-xl border border-[var(--card-border)] bg-[var(--brand-soft)]/30 p-3">
                  <p className="text-xs font-semibold uppercase tracking-wide text-[var(--brand)]">
                    Q{idx + 1} · {q.type}
                  </p>
                  <p className="mt-1 font-medium text-[var(--foreground)]">{q.prompt}</p>
                  {q.options?.length ? (
                    <ul className="mt-2 space-y-1 text-[var(--muted)]">
                      {q.options.map((opt) => (
                        <li key={opt}>• {opt}</li>
                      ))}
                    </ul>
                  ) : null}
                  <button
                    type="button"
                    className="mt-2 text-xs font-semibold text-[var(--brand)] underline"
                    onClick={() => setRevealed((prev) => ({ ...prev, [idx]: !prev[idx] }))}
                  >
                    {revealed[idx] ? "Hide answer" : "Reveal answer"}
                  </button>
                  {revealed[idx] ? (
                    <div className="mt-2 text-sm">
                      <p>
                        <span className="font-semibold">Answer:</span> {q.answer}
                      </p>
                      <p className="mt-1 text-slate-600">{q.explanation}</p>
                    </div>
                  ) : null}
                </div>
              ))}
            </ResultPanel>
          ) : null}
        </div>
      </div>
    </div>
  );
}
