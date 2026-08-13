import { z } from "zod";
import { agentPrompts, buildUserPrompt } from "@/lib/ai/agent";
import { chatJson } from "@/lib/ai/client";
import { isMockMode } from "@/lib/ai/config";
import {
  mockExplain,
  mockFlashcards,
  mockImprove,
  mockPlanner,
  mockQuiz,
  mockSummarize,
} from "@/lib/ai/mock";
import { getProviderLabel } from "@/lib/ai/providers";

const summarySchema = z.object({
  summary: z.string().min(1),
  keyPoints: z.array(z.string().min(1)).min(1),
});

const quizOutSchema = z.object({
  title: z.string().min(1),
  questions: z.array(
    z.object({
      type: z.enum(["mcq", "short", "true_false"]),
      prompt: z.string().min(1),
      options: z.array(z.string()).optional(),
      answer: z.string().min(1),
      explanation: z.string().min(1),
    }),
  ).min(1),
});

const explainOutSchema = z.object({
  explanation: z.string().min(1),
  analogy: z.string().optional(),
  related: z.array(z.string()).default([]),
});

const improveOutSchema = z.object({
  improved: z.string().min(1),
  feedback: z.string().min(1),
  strengths: z.array(z.string().min(1)).min(1),
  gaps: z.array(z.string().min(1)).min(1),
});

const flashOutSchema = z.object({
  title: z.string().min(1),
  cards: z.array(
    z.object({
      front: z.string().min(1),
      back: z.string().min(1),
    }),
  ).min(1),
});

const planOutSchema = z.object({
  title: z.string().min(1),
  items: z.array(
    z.object({
      dayOffset: z.number().int().min(0),
      subject: z.string().min(1),
      topic: z.string().min(1),
      durationMin: z.number().int().min(15).max(180),
    }),
  ).min(1),
});

type AiResult<T> = {
  data: T;
  tokensIn: number;
  tokensOut: number;
  provider: string;
  model: string;
  mock?: true;
};

function wrapResult<T>(result: {
  data: T;
  tokensIn: number;
  tokensOut: number;
  provider: "openai" | "groq" | "gemini" | "ollama";
  model: string;
}): AiResult<T> {
  return {
    ...result,
    provider: getProviderLabel(result.provider),
  };
}

export async function summarizeNotes(input: {
  text: string;
  length: "short" | "medium" | "detailed";
  style: "bullets" | "paragraph";
}): Promise<AiResult<{ summary: string; keyPoints: string[] }>> {
  if (isMockMode()) return { ...mockSummarize(input.text), provider: "Demo", model: "mock" };

  return wrapResult(
    await chatJson({
      system: agentPrompts.summarize(input.length, input.style),
      user: buildUserPrompt("Student notes to summarize", input.text),
      schema: summarySchema,
      temperature: 0.3,
    }),
  );
}

export async function generateQuiz(input: {
  text: string;
  count: number;
  difficulty: "easy" | "medium" | "hard";
  types: Array<"mcq" | "short" | "true_false">;
}) {
  if (isMockMode()) return { ...mockQuiz(input.text, input.count), provider: "Demo", model: "mock" };

  return wrapResult(
    await chatJson({
      system: agentPrompts.quiz(input.count, input.difficulty, input.types.join(", ")),
      user: buildUserPrompt("Source material for quiz generation", input.text),
      schema: quizOutSchema,
      temperature: 0.45,
    }),
  );
}

export async function explainConcept(input: {
  concept: string;
  level: "eli5" | "standard" | "advanced";
  context?: string;
}) {
  if (isMockMode()) return { ...mockExplain(input.concept), provider: "Demo", model: "mock" };

  const contextBlock = input.context
    ? `\n\nAdditional context from the student:\n${input.context}`
    : "";

  return wrapResult(
    await chatJson({
      system: agentPrompts.explain(input.concept, input.level),
      user: `Explain the concept: "${input.concept}"${contextBlock}`,
      schema: explainOutSchema,
      temperature: 0.35,
    }),
  );
}

export async function improveAnswer(input: {
  question: string;
  answer: string;
  rubric?: string;
}) {
  if (isMockMode()) return { ...mockImprove(input.question, input.answer), provider: "Demo", model: "mock" };

  const rubricBlock = input.rubric ? `\n\nMarking rubric:\n${input.rubric}` : "";

  return wrapResult(
    await chatJson({
      system: agentPrompts.improve(),
      user: `Exam question:\n${input.question}\n\nStudent's draft answer:\n${input.answer}${rubricBlock}`,
      schema: improveOutSchema,
      temperature: 0.35,
    }),
  );
}

export async function generateFlashcards(input: { text: string; count: number }) {
  if (isMockMode()) return { ...mockFlashcards(input.text, input.count), provider: "Demo", model: "mock" };

  return wrapResult(
    await chatJson({
      system: agentPrompts.flashcards(input.count),
      user: buildUserPrompt("Notes to convert into flashcards", input.text),
      schema: flashOutSchema,
      temperature: 0.4,
    }),
  );
}

export async function generateStudyPlan(input: {
  subjects: string[];
  examDate: string;
  hoursPerDay: number;
}) {
  if (isMockMode()) return { ...mockPlanner(input.subjects, input.hoursPerDay), provider: "Demo", model: "mock" };

  const today = new Date().toISOString().slice(0, 10);

  return wrapResult(
    await chatJson({
      system: agentPrompts.planner(input.subjects, input.examDate, input.hoursPerDay, today),
      user: `Create a realistic day-by-day study plan from today (${today}) until the exam on ${input.examDate}.`,
      schema: planOutSchema,
      temperature: 0.3,
    }),
  );
}

// ── Voice Assistant ────────────────────────────────────────────────────────

const voiceReplySchema = z.object({
  reply: z.string().min(1),
  corrections: z.array(z.string()).optional(),
  tips: z.array(z.string()).optional(),
});

export type VoiceReply = z.infer<typeof voiceReplySchema>;

const STUDY_SYSTEM = `You are StudyMate AI — a friendly, knowledgeable personal study assistant.
Help students understand concepts, solve problems, and learn effectively.
Keep answers concise (2-5 sentences for simple questions, up to a short paragraph for complex ones).
Use simple, clear language. When relevant, suggest related topics to explore.
Return JSON: { "reply": "your response text" }`;

const ENGLISH_SYSTEM = `You are an expert English communication coach helping students improve their spoken and written English.
When the user sends a message:
1. Respond naturally and helpfully to what they said.
2. If their message has grammar mistakes, awkward phrasing, or vocabulary that could be improved — provide corrections.
3. Give 1-2 practical communication tips relevant to their message.
Keep your reply warm, encouraging, and concise.
Return JSON: {
  "reply": "your conversational response",
  "corrections": ["original phrase → improved phrase (explanation)"],
  "tips": ["actionable tip about English communication"]
}
If the message is perfectly correct, corrections and tips may be empty arrays.`;

export async function voiceChat(input: {
  message: string;
  mode: "study" | "english";
  history: Array<{ role: "user" | "assistant"; content: string }>;
}): Promise<AiResult<VoiceReply>> {
  const system = input.mode === "english" ? ENGLISH_SYSTEM : STUDY_SYSTEM;

  // Build conversation context from history
  const historyContext =
    input.history.length > 0
      ? "\n\nConversation so far:\n" +
        input.history
          .map((m) => `${m.role === "user" ? "Student" : "Assistant"}: ${m.content}`)
          .join("\n")
      : "";

  return wrapResult(
    await chatJson({
      system,
      user: `${historyContext}\n\nStudent: ${input.message}`,
      schema: voiceReplySchema,
      temperature: 0.6,
    }),
  );
}

