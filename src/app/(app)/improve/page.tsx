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
  useAiRequest,
} from "@/components/ai/shared";

type ImproveResult = {
  improved: string;
  feedback: string;
  strengths: string[];
  gaps: string[];
};

export default function ImprovePage() {
  const [question, setQuestion] = useState("");
  const [answer, setAnswer] = useState("");
  const [rubric, setRubric] = useState("");
  const { loading, error, data, meta, run } = useAiRequest<ImproveResult>();

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    await run("/api/ai/improve", {
      question,
      answer,
      rubric: rubric || undefined,
    });
  }

  return (
    <div>
      <FeaturePageHeader
        title="Improve Answers"
        description="Paste a draft exam answer and get a stronger version with actionable feedback."
      />

      <div className="grid gap-6 lg:grid-cols-2">
        <form onSubmit={onSubmit}>
          <FormCard>
          <div>
            <FieldLabel>Question</FieldLabel>
            <TextArea rows={4} value={question} onChange={(e) => setQuestion(e.target.value)} required />
          </div>
          <div>
            <FieldLabel>Your answer</FieldLabel>
            <TextArea rows={8} value={answer} onChange={(e) => setAnswer(e.target.value)} required />
          </div>
          <div>
            <FieldLabel>Rubric (optional)</FieldLabel>
            <TextArea
              rows={3}
              value={rubric}
              onChange={(e) => setRubric(e.target.value)}
              placeholder="Marking criteria, word limit, required points..."
            />
          </div>
          <PrimaryButton type="submit" loading={loading}>
            Improve answer
          </PrimaryButton>
          </FormCard>
        </form>

        <div className="space-y-4">
          {loading ? <LoadingState label="Reviewing your answer..." /> : null}
          {meta ? <AiStatusNotice meta={meta} /> : null}
          {error ? <ErrorBanner message={error} /> : null}
          {data ? (
            <ResultPanel title="Improved answer">
              <p className="whitespace-pre-wrap">{data.improved}</p>
              <p>
                <span className="font-semibold">Feedback:</span> {data.feedback}
              </p>
              <div className="grid gap-3 sm:grid-cols-2">
                <div>
                  <p className="font-semibold text-emerald-800">Strengths</p>
                  <ul className="mt-1 list-disc pl-5">
                    {data.strengths.map((s) => (
                      <li key={s}>{s}</li>
                    ))}
                  </ul>
                </div>
                <div>
                  <p className="font-semibold text-amber-800">Gaps</p>
                  <ul className="mt-1 list-disc pl-5">
                    {data.gaps.map((g) => (
                      <li key={g}>{g}</li>
                    ))}
                  </ul>
                </div>
              </div>
            </ResultPanel>
          ) : null}
        </div>
      </div>
    </div>
  );
}
