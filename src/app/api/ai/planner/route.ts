import { NextRequest } from "next/server";
import { runAiRoute } from "@/lib/ai/route-helper";
import { generateStudyPlan } from "@/lib/ai/services";
import { plannerSchema } from "@/lib/validators";
import { prisma } from "@/lib/db";

export async function POST(request: NextRequest) {
  return runAiRoute(request, {
    feature: "PLANNER",
    schema: plannerSchema,
    handler: async (input, userId) => {
      const result = await generateStudyPlan(input);
      const today = new Date();
      today.setHours(0, 0, 0, 0);

      let planId: string | undefined;
      const items = result.data.items.map((item) => {
        const day = new Date(today);
        day.setDate(day.getDate() + item.dayOffset);
        return {
          day,
          subject: item.subject,
          topic: item.topic,
          durationMin: item.durationMin,
        };
      });

      if (input.save) {
        const plan = await prisma.studyPlan.create({
          data: {
            userId,
            title: input.title || result.data.title,
            examDate: new Date(input.examDate),
            hoursPerDay: input.hoursPerDay,
            items: { create: items },
          },
        });
        planId = plan.id;
      }

      return {
        data: {
          title: result.data.title,
          planId,
          items: items.map((item) => ({
            ...item,
            day: item.day.toISOString(),
          })),
        },
        tokensIn: result.tokensIn,
        tokensOut: result.tokensOut,
        provider: result.provider,
        model: result.model,
      };
    },
  });
}
