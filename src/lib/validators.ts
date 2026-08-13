import { z } from "zod";

export const summarizeSchema = z.object({
  text: z.string().min(20, "Add more notes to summarize (min 20 characters).").max(30000),
  length: z.enum(["short", "medium", "detailed"]).default("medium"),
  style: z.enum(["bullets", "paragraph"]).default("bullets"),
});

export const quizSchema = z.object({
  text: z.string().min(20).max(30000),
  count: z.coerce.number().int().min(3).max(20).default(5),
  difficulty: z.enum(["easy", "medium", "hard"]).default("medium"),
  types: z.array(z.enum(["mcq", "short", "true_false"])).default(["mcq"]),
  title: z.string().min(1).max(120).optional(),
  save: z.boolean().default(true),
});

export const explainSchema = z.object({
  concept: z.string().min(2).max(500),
  level: z.enum(["eli5", "standard", "advanced"]).default("standard"),
  context: z.string().max(5000).optional(),
});

export const improveSchema = z.object({
  question: z.string().min(5).max(5000),
  answer: z.string().min(5).max(10000),
  rubric: z.string().max(3000).optional(),
});

export const flashcardsSchema = z.object({
  text: z.string().min(20).max(30000),
  count: z.coerce.number().int().min(5).max(40).default(10),
  title: z.string().min(1).max(120).optional(),
  save: z.boolean().default(true),
});

export const plannerSchema = z.object({
  subjects: z.array(z.string().min(1)).min(1).max(12),
  examDate: z.string().min(4),
  hoursPerDay: z.coerce.number().min(0.5).max(12).default(2),
  title: z.string().min(1).max(120).optional(),
  save: z.boolean().default(true),
});

export const authSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6).max(72),
  name: z.string().min(1).max(80).optional(),
});

export const voiceAssistantSchema = z.object({
  message: z.string().min(1).max(3000),
  mode: z.enum(["study", "english"]).default("study"),
  history: z
    .array(
      z.object({
        role: z.enum(["user", "assistant"]),
        content: z.string().min(1),
      }),
    )
    .max(20)
    .default([]),
});

export type AiFeature =
  | "SUMMARIZE"
  | "QUIZ"
  | "EXPLAIN"
  | "IMPROVE"
  | "FLASHCARDS"
  | "PLANNER"
  | "VOICE_ASSISTANT";
