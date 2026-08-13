const MOCK_TOKENS = { tokensIn: 120, tokensOut: 280 };

function excerpt(text: string, max = 80) {
  const line = text.trim().split("\n").find(Boolean) || "your study material";
  return line.slice(0, max);
}

export function mockSummarize(text: string) {
  return {
    data: {
      summary:
        "The Solar System formed about 4.6 billion years ago from a collapsing cloud of gas and dust. The Sun contains most of the system's mass, while planets, moons, and smaller bodies orbit it. Key bodies include the rocky inner planets, gas giants like Jupiter and Saturn, and ice giants such as Neptune.",
      keyPoints: [
        "Solar System age: ~4.6 billion years",
        "Sun holds ~99.8% of system mass",
        "Jupiter is the largest planet",
        "Saturn is known for its ring system",
        "Neptune is an ice giant with strong winds",
      ],
    },
    ...MOCK_TOKENS,
    mock: true as const,
  };
}

export function mockQuiz(text: string, count: number) {
  const topic = excerpt(text);
  const questions = Array.from({ length: Math.min(count, 5) }, (_, i) => ({
    type: "mcq" as const,
    prompt: `Sample question ${i + 1} about ${topic}?`,
    options: ["Option A", "Option B", "Option C", "Option D"],
    answer: "Option A",
    explanation: "Demo answer — connect this to your notes after adding a real OpenAI API key.",
  }));

  return {
    data: { title: "Demo Quiz (Solar System)", questions },
    ...MOCK_TOKENS,
    mock: true as const,
  };
}

export function mockExplain(concept: string) {
  return {
    data: {
      explanation: `${concept} is explained here in demo mode. With a real API key, StudyMate AI will generate a tailored explanation at your chosen level.`,
      analogy: "Think of it like building blocks that fit together to form a bigger picture.",
      related: ["Related concept 1", "Related concept 2"],
    },
    ...MOCK_TOKENS,
    mock: true as const,
  };
}

export function mockImprove(question: string, answer: string) {
  return {
    data: {
      improved: `${answer}\n\n[Demo improvement] Add clearer structure, define key terms, and link ideas back to the question.`,
      feedback: "Good start — expand with evidence and a stronger conclusion.",
      strengths: ["Addresses the question", "Shows basic understanding"],
      gaps: ["Needs more detail", "Missing examples"],
    },
    ...MOCK_TOKENS,
    mock: true as const,
  };
}

export function mockFlashcards(text: string, count: number) {
  const cards = Array.from({ length: Math.min(count, 10) }, (_, i) => ({
    front: `Demo card ${i + 1}: key term from notes`,
    back: `Definition or fact ${i + 1} based on ${excerpt(text, 40)}`,
  }));

  return {
    data: { title: "Demo Flashcard Deck", cards },
    ...MOCK_TOKENS,
    mock: true as const,
  };
}

export function mockPlanner(subjects: string[], hoursPerDay: number) {
  const items = subjects.flatMap((subject, idx) =>
    [0, 1, 2].map((dayOffset) => ({
      dayOffset: idx + dayOffset,
      subject,
      topic: `Review core ${subject} topics`,
      durationMin: Math.round((hoursPerDay * 60) / 2),
    })),
  );

  return {
    data: { title: "Demo Study Plan", items: items.slice(0, 12) },
    ...MOCK_TOKENS,
    mock: true as const,
  };
}
