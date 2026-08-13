import Link from "next/link";
import { redirect } from "next/navigation";
import {
  ArrowRight,
  BookOpenCheck,
  Brain,
  CalendarRange,
  Layers3,
  Lightbulb,
  PenLine,
  Sparkles,
  Zap,
} from "lucide-react";
import { getSession } from "@/lib/auth";
import { cn } from "@/lib/utils";
import { ThemeToggle } from "@/components/ui/ThemeToggle";
import { AnimatedCard } from "@/components/ui/AnimatedCard";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { GlassCard } from "@/components/ui/GlassCard";

const features = [
  {
    icon: BookOpenCheck,
    title: "Smart Summaries",
    desc: "Compress long notes into exam-ready key points in seconds.",
  },
  {
    icon: Brain,
    title: "Quiz Generator",
    desc: "Turn any chapter into practice questions with explanations.",
  },
  {
    icon: Lightbulb,
    title: "Concept Explainer",
    desc: "Understand hard topics from ELI5 to advanced level.",
  },
  {
    icon: Layers3,
    title: "Flashcards",
    desc: "Build active recall decks from your study material instantly.",
  },
  {
    icon: PenLine,
    title: "Answer Coach",
    desc: "Upgrade exam responses with structured AI feedback.",
  },
  {
    icon: CalendarRange,
    title: "Study Planner",
    desc: "Map revision sessions to your exam date and schedule.",
  },
];

const stats = [
  { value: "6+", label: "AI Tools" },
  { value: "24/7", label: "Available" },
  { value: "Free", label: "To Start" },
];

export default async function HomePage() {
  const session = await getSession();
  if (session) redirect("/dashboard");

  return (
    <div className="relative min-h-screen overflow-hidden">
      <div className="app-gradient absolute inset-0" />
      <div className="pointer-events-none absolute -left-32 top-20 h-96 w-96 rounded-full bg-[var(--glow-1)] blur-3xl" />
      <div className="pointer-events-none absolute -right-32 top-40 h-80 w-80 rounded-full bg-[var(--glow-2)] blur-3xl" />

      <header className="relative z-10 mx-auto flex max-w-6xl items-center justify-between px-6 py-6">
        <Link href="/" className="flex items-center gap-2.5">
          <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-[var(--brand)] to-[var(--accent)] text-white shadow-lg shadow-[var(--brand)]/25">
            <Sparkles className="h-4 w-4" />
          </span>
          <span className="font-display text-xl text-[var(--foreground)]">StudyMate AI</span>
        </Link>
        <div className="flex items-center gap-3">
          <ThemeToggle />
          <Link href="/login">
            <Button variant="ghost" size="sm">
              Sign in
            </Button>
          </Link>
          <Link href="/signup">
            <Button size="sm">Get started</Button>
          </Link>
        </div>
      </header>

      <main className="relative z-10 mx-auto max-w-6xl px-6 pb-24 pt-8 sm:pt-16">
        <section className="text-center sm:text-left">
          <Badge className="animate-rise-in">AI-Powered Learning</Badge>
          <h1 className="animate-rise-in stagger-1 mt-6 font-display text-5xl leading-[1.05] tracking-tight text-[var(--foreground)] sm:text-6xl lg:text-7xl">
            Your personal
            <span className="block bg-gradient-to-r from-[var(--brand)] to-[var(--accent)] bg-clip-text text-transparent">
              AI study companion
            </span>
          </h1>
          <p className="animate-rise-in stagger-2 mx-auto mt-6 max-w-2xl text-lg leading-relaxed text-[var(--muted)] sm:mx-0">
            Summarize notes, generate quizzes, explain concepts, improve answers, build flashcards,
            and plan revision — all in one beautiful, responsive web app.
          </p>
          <div className="animate-rise-in stagger-3 mt-8 flex flex-wrap items-center justify-center gap-3 sm:justify-start">
            <Link href="/signup">
              <Button size="lg" className="group">
                Open web app
                <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
              </Button>
            </Link>
            <Link href="/login">
              <Button variant="outline" size="lg">
                I have an account
              </Button>
            </Link>
          </div>
        </section>

        <section className="mt-12 grid gap-4 sm:grid-cols-3">
          {stats.map((stat, i) => (
            <GlassCard
              key={stat.label}
              className={cn(
                "animate-rise-in p-5 text-center",
                `stagger-${i + 3}`,
              )}
              style={{ animationDelay: `${(i + 3) * 50}ms` }}
            >
              <p className="font-display text-3xl text-[var(--brand)]">{stat.value}</p>
              <p className="mt-1 text-sm text-[var(--muted)]">{stat.label}</p>
            </GlassCard>
          ))}
        </section>

        <section className="mt-20">
          <div className="mb-8 flex items-end justify-between">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.16em] text-[var(--brand)]">
                Features
              </p>
              <h2 className="mt-2 font-display text-3xl text-[var(--foreground)]">
                Everything you need to study smarter
              </h2>
            </div>
            <Zap className="hidden h-8 w-8 text-[var(--accent)] sm:block animate-float" />
          </div>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {features.map((feature, i) => {
              const Icon = feature.icon;
              return (
                <AnimatedCard
                  key={feature.title}
                  title={feature.title}
                  description={feature.desc}
                  delay={i * 60}
                  icon={<Icon className="h-5 w-5" />}
                />
              );
            })}
          </div>
        </section>

        <section className="mt-20">
          <GlassCard className="relative overflow-hidden p-8 sm:p-12">
            <div className="pointer-events-none absolute -right-16 -top-16 h-48 w-48 rounded-full bg-[var(--accent-soft)] blur-3xl" />
            <div className="relative">
              <h2 className="font-display text-3xl text-[var(--foreground)] sm:text-4xl">
                Ready to transform how you study?
              </h2>
              <p className="mt-3 max-w-xl text-[var(--muted)]">
                Join StudyMate AI and turn every study session into a focused, AI-assisted
                experience. Free to start, no credit card required.
              </p>
              <Link href="/signup" className="mt-6 inline-block">
                <Button size="lg">Create free account</Button>
              </Link>
            </div>
          </GlassCard>
        </section>
      </main>
    </div>
  );
}
