import { NextRequest } from "next/server";
import { runAiRoute } from "@/lib/ai/route-helper";
import { generateFlashcards } from "@/lib/ai/services";
import { flashcardsSchema } from "@/lib/validators";
import { prisma } from "@/lib/db";

export async function POST(request: NextRequest) {
  return runAiRoute(request, {
    feature: "FLASHCARDS",
    schema: flashcardsSchema,
    handler: async (input, userId) => {
      const result = await generateFlashcards(input);
      let deckId: string | undefined;

      if (input.save) {
        const deck = await prisma.flashcardDeck.create({
          data: {
            userId,
            title: input.title || result.data.title,
            cards: {
              create: result.data.cards.map((card) => ({
                front: card.front,
                back: card.back,
              })),
            },
          },
        });
        deckId = deck.id;
      }

      return {
        data: { ...result.data, deckId },
        tokensIn: result.tokensIn,
        tokensOut: result.tokensOut,
        provider: result.provider,
        model: result.model,
      };
    },
  });
}
