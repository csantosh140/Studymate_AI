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
import { formatDate } from "@/lib/utils";

type PlanResult = {
  title: string;
  planId?: string;
  items: Array<{
    day: string;
    subject: string;
    topic: string;
    durationMin: number;
  }>;
};

export default function PlannerPage() {
  const [subjectsText, setSubjectsText] = useState("Biology\nChemistry\nMath");
  const [examDate, setExamDate] = useState("");
  const [hoursPerDay, setHoursPerDay] = useState(2);
  const { loading, error, data, meta, run } = useAiRequest<PlanResult>();

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    const subjects = subjectsText
      .split("\n")
      .map((s) => s.trim())
      .filter(Boolean);
    await run("/api/ai/planner", {
      subjects,
      examDate,
      hoursPerDay,
      save: true,
    });
  }

  return (
    <div>
      <FeaturePageHeader
        title="Study Planner"
        description="Build a realistic day-by-day plan from your subjects, exam date, and available hours."
      />

      <div className="grid gap-6 lg:grid-cols-2">
        <form onSubmit={onSubmit}>
          <FormCard>
          <div>
            <FieldLabel>Subjects (one per line)</FieldLabel>
            <TextArea rows={6} value={subjectsText} onChange={(e) => setSubjectsText(e.target.value)} required />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <FieldLabel>Exam date</FieldLabel>
              <TextInput
                type="date"
                value={examDate}
                onChange={(e) => setExamDate(e.target.value)}
                required
              />
            </div>
            <div>
              <FieldLabel>Hours / day</FieldLabel>
              <TextInput
                type="number"
                min={0.5}
                max={12}
                step={0.5}
                value={hoursPerDay}
                onChange={(e) => setHoursPerDay(Number(e.target.value))}
              />
            </div>
          </div>
          <PrimaryButton type="submit" loading={loading}>
            Generate plan
          </PrimaryButton>
          </FormCard>
        </form>

        <div className="space-y-4">
          {loading ? <LoadingState label="Planning your study schedule..." /> : null}
          {meta ? <AiStatusNotice meta={meta} /> : null}
          {error ? <ErrorBanner message={error} /> : null}
          {data ? (
            <ResultPanel title={data.title}>
              <div className="space-y-2">
                {data.items.map((item, idx) => (
                  <div
                    key={`${item.day}-${item.topic}-${idx}`}
                    className="flex items-start justify-between gap-3 rounded-xl border border-[var(--card-border)] bg-[var(--brand-soft)]/20 px-3 py-2"
                  >
                    <div>
                      <p className="text-xs font-semibold uppercase tracking-wide text-[var(--brand)]">
                        {formatDate(item.day)} · {item.subject}
                      </p>
                      <p className="mt-0.5 font-medium text-[var(--foreground)]">{item.topic}</p>
                    </div>
                    <p className="shrink-0 text-xs font-semibold text-[var(--muted)]">{item.durationMin} min</p>
                  </div>
                ))}
              </div>
            </ResultPanel>
          ) : null}
        </div>
      </div>
    </div>
  );
}
