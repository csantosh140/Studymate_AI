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
  useAiRequest,
} from "@/components/ai/shared";

type SummaryResult = {
  summary: string;
  keyPoints: string[];
};

export default function SummarizePage() {
  const [text, setText] = useState("");
  const [length, setLength] = useState("medium");
  const [style, setStyle] = useState("bullets");
  const { loading, error, data, meta, run } = useAiRequest<SummaryResult>();

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    await run("/api/ai/summarize", { text, length, style });
  }

  return (
    <div>
      <FeaturePageHeader
        title="Notes Summarizer"
        description="Paste lecture notes or textbook excerpts and get a clear, exam-ready summary."
      />

      <div className="grid gap-6 lg:grid-cols-2">
        <form onSubmit={onSubmit}>
          <FormCard>
          <div>
            <FieldLabel>Your notes</FieldLabel>
            <TextArea
              rows={12}
              value={text}
              onChange={(e) => setText(e.target.value)}
              placeholder="Paste your notes here..."
              required
            />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <FieldLabel>Length</FieldLabel>
              <Select value={length} onChange={(e) => setLength(e.target.value)}>
                <option value="short">Short</option>
                <option value="medium">Medium</option>
                <option value="detailed">Detailed</option>
              </Select>
            </div>
            <div>
              <FieldLabel>Style</FieldLabel>
              <Select value={style} onChange={(e) => setStyle(e.target.value)}>
                <option value="bullets">Bullets</option>
                <option value="paragraph">Paragraph</option>
              </Select>
            </div>
          </div>
          <PrimaryButton type="submit" loading={loading}>
            Summarize notes
          </PrimaryButton>
          </FormCard>
        </form>

        <div className="space-y-4">
          {loading ? <LoadingState label="Summarizing your notes..." /> : null}
          {meta ? <AiStatusNotice meta={meta} /> : null}
          {error ? <ErrorBanner message={error} /> : null}
          {data ? (
            <ResultPanel title="Summary">
              <p className="whitespace-pre-wrap">{data.summary}</p>
              <div>
                <p className="mb-2 font-semibold text-slate-900">Key points</p>
                <ul className="list-disc space-y-1 pl-5">
                  {data.keyPoints.map((point) => (
                    <li key={point}>{point}</li>
                  ))}
                </ul>
              </div>
            </ResultPanel>
          ) : null}
        </div>
      </div>
    </div>
  );
}
