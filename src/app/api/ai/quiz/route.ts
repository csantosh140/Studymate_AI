import { NextRequest } from "next/server";
import { runAiRoute } from "@/lib/ai/route-helper";
import { generateQuiz } from "@/lib/ai/services";
import { quizSchema } from "@/lib/validators";
import { prisma } from "@/lib/db";

export async function POST(request: NextRequest) {
  return runAiRoute(request, {
    feature: "QUIZ",
    schema: quizSchema,
    handler: async (input, userId) => {
      const result = await generateQuiz(input);
      let quizId: string | undefined;

      if (input.save) {
        const quiz = await prisma.quiz.create({
          data: {
            userId,
            title: input.title || result.data.title,
            difficulty: input.difficulty,
            questions: {
              create: result.data.questions.map((q) => ({
                type: q.type,
                prompt: q.prompt,
                optionsJson: q.options ? JSON.stringify(q.options) : null,
                answer: q.answer,
                explanation: q.explanation,
              })),
            },
          },
        });
        quizId = quiz.id;
      }

      return {
        data: { ...result.data, quizId },
        tokensIn: result.tokensIn,
        tokensOut: result.tokensOut,
        provider: result.provider,
        model: result.model,
      };
    },
  });
}
