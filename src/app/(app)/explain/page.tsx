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

type ExplainResult = {
  explanation: string;
  analogy?: string;
  related: string[];
};

export default function ExplainPage() {
  const [concept, setConcept] = useState("");
  const [level, setLevel] = useState("standard");
  const [context, setContext] = useState("");
  const { loading, error, data, meta, run } = useAiRequest<ExplainResult>();

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    await run("/api/ai/explain", { concept, level, context: context || undefined });
  }

  return (
    <div>
      <FeaturePageHeader
        title="Explain Concepts"
        description="Get clear explanations at the level you need — from ELI5 to advanced."
      />

      <div className="grid gap-6 lg:grid-cols-2">
        <form onSubmit={onSubmit}>
          <FormCard>
          <div>
            <FieldLabel>Concept</FieldLabel>
            <TextInput
              value={concept}
              onChange={(e) => setConcept(e.target.value)}
              placeholder="e.g. Photosynthesis, Binary search, Keynesian economics"
              required
            />
          </div>
          <div>
            <FieldLabel>Level</FieldLabel>
            <Select value={level} onChange={(e) => setLevel(e.target.value)}>
              <option value="eli5">ELI5</option>
              <option value="standard">Standard</option>
              <option value="advanced">Advanced</option>
            </Select>
          </div>
          <div>
            <FieldLabel>Optional context</FieldLabel>
            <TextArea
              rows={5}
              value={context}
              onChange={(e) => setContext(e.target.value)}
              placeholder="Course name, chapter, or what confuses you..."
            />
          </div>
          <PrimaryButton type="submit" loading={loading}>
            Explain concept
          </PrimaryButton>
          </FormCard>
        </form>

        <div className="space-y-4">
          {loading ? <LoadingState label="Preparing explanation..." /> : null}
          {meta ? <AiStatusNotice meta={meta} /> : null}
          {error ? <ErrorBanner message={error} /> : null}
          {data ? (
            <ResultPanel title="Explanation">
              <p className="whitespace-pre-wrap">{data.explanation}</p>
              {data.analogy ? (
                <p>
                  <span className="font-semibold">Analogy:</span> {data.analogy}
                </p>
              ) : null}
              {data.related?.length ? (
                <div>
                  <p className="mb-1 font-semibold text-slate-900">Related ideas</p>
                  <ul className="list-disc pl-5">
                    {data.related.map((item) => (
                      <li key={item}>{item}</li>
                    ))}
                  </ul>
                </div>
              ) : null}
            </ResultPanel>
          ) : null}
        </div>
      </div>
    </div>
  );
}
