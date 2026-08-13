import { Mic, GraduationCap, MessageCircle, Zap } from "lucide-react";

export const metadata = {
  title: "AI Voice Assistant | StudyMate AI",
  description: "Chat and speak with your personal AI study assistant. Get instant help with study questions and improve your English communication skills.",
};

const features = [
  {
    icon: GraduationCap,
    title: "Study Assistant",
    desc: "Ask any academic question — concepts, problems, formulas, history. Get clear, exam-ready answers instantly.",
    color: "var(--brand)",
    bg: "var(--brand-soft)",
  },
  {
    icon: MessageCircle,
    title: "English Coach",
    desc: "Speak or type naturally. Your AI coach corrects grammar, improves vocabulary, and helps you communicate with confidence.",
    color: "var(--accent)",
    bg: "var(--accent-soft)",
  },
  {
    icon: Zap,
    title: "Voice Powered",
    desc: "Use your microphone to speak questions and hear answers read aloud — hands-free learning at its best.",
    color: "#f59e0b",
    bg: "rgba(245,158,11,0.1)",
  },
];

export default function VoiceAssistantPage() {
  return (
    <div>
      {/* Hero */}
      <div className="mb-10 text-center">
        <div className="mx-auto mb-5 flex h-20 w-20 items-center justify-center rounded-3xl bg-gradient-to-br from-[var(--brand)] to-[var(--accent)] shadow-2xl shadow-[var(--brand)]/25">
          <Mic className="h-9 w-9 text-white" />
        </div>
        <h1 className="font-display text-3xl font-bold text-[var(--foreground)] sm:text-4xl">
          AI Voice Assistant
        </h1>
        <p className="mx-auto mt-3 max-w-lg text-[var(--muted)]">
          Your personal AI tutor — available 24/7. Ask study questions or practice your English
          communication. Click the{" "}
          <span className="inline-flex h-6 w-6 items-center justify-center rounded-full bg-gradient-to-br from-[var(--brand)] to-[var(--accent)]">
            <Mic className="h-3 w-3 text-white" />
          </span>{" "}
          button in the bottom-right corner to start.
        </p>
      </div>

      {/* Feature cards */}
      <div className="grid gap-5 sm:grid-cols-3 mb-10">
        {features.map((f) => {
          const Icon = f.icon;
          return (
            <div
              key={f.title}
              className="rounded-2xl border border-[var(--card-border)] bg-[var(--card)] p-6"
              style={{ backdropFilter: "blur(12px)" }}
            >
              <span
                className="mb-4 flex h-11 w-11 items-center justify-center rounded-2xl"
                style={{ background: f.bg, color: f.color }}
              >
                <Icon className="h-5 w-5" />
              </span>
              <h2 className="mb-2 font-semibold text-[var(--foreground)]">{f.title}</h2>
              <p className="text-sm leading-relaxed text-[var(--muted)]">{f.desc}</p>
            </div>
          );
        })}
      </div>

      {/* How to use */}
      <div className="rounded-2xl border border-[var(--card-border)] bg-[var(--card)] p-6" style={{ backdropFilter: "blur(12px)" }}>
        <h2 className="mb-5 font-display text-lg font-semibold text-[var(--foreground)]">How to use</h2>
        <ol className="space-y-4">
          {[
            { step: "1", text: "Click the glowing mic button in the bottom-right corner of any page." },
            { step: "2", text: 'Choose your mode: "Study" for academic help or "English" for language coaching.' },
            { step: "3", text: "Tap the mic icon to speak, or type your question and press Enter." },
            { step: "4", text: "Hear the AI response read aloud and see it in the chat. Toggle 🔇 to mute voice output." },
            { step: "5", text: "In English mode, look for ✍️ Corrections and 💡 Tips cards below each AI response." },
          ].map((item) => (
            <li key={item.step} className="flex items-start gap-4">
              <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-[var(--brand)] to-[var(--accent)] text-xs font-bold text-white">
                {item.step}
              </span>
              <p className="mt-0.5 text-sm text-[var(--muted)]">{item.text}</p>
            </li>
          ))}
        </ol>
      </div>
    </div>
  );
}
