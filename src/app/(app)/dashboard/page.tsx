import Link from "next/link";
import { redirect } from "next/navigation";
import {
  ArrowRight,
  BookOpenCheck,
  Brain,
  CalendarRange,
  Clock,
  Layers3,
  Lightbulb,
  PenLine,
  TrendingUp,
} from "lucide-react";
import { getSession } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { checkRateLimit } from "@/lib/ai/usage";
import { formatDate } from "@/lib/utils";
import { AnimatedCard } from "@/components/ui/AnimatedCard";
import { Badge } from "@/components/ui/Badge";
import { GlassCard } from "@/components/ui/GlassCard";
import { PageHeader } from "@/components/ui/PageHeader";

const tools = [
  {
    href: "/summarize",
    title: "Summarizer",
    desc: "Compress long notes into key takeaways.",
    icon: BookOpenCheck,
    badge: "Popular",
  },
  {
    href: "/quiz",
    title: "Quiz Generator",
    desc: "Practice with AI-made questions.",
    icon: Brain,
  },
  {
    href: "/explain",
    title: "Explain Concepts",
    desc: "Understand hard topics clearly.",
    icon: Lightbulb,
  },
  {
    href: "/improve",
    title: "Answer Improver",
    desc: "Upgrade exam responses with feedback.",
    icon: PenLine,
  },
  {
    href: "/flashcards",
    title: "Flashcards",
    desc: "Build recall decks in seconds.",
    icon: Layers3,
  },
  {
    href: "/planner",
    title: "Study Planner",
    desc: "Map study sessions to your exam date.",
    icon: CalendarRange,
  },
];

export default async function DashboardPage() {
  const session = await getSession();
  if (!session) redirect("/login");

  const [usage, recent] = await Promise.all([
    checkRateLimit(session.id, session.plan),
    prisma.aiJob.findMany({
      where: { userId: session.id },
      orderBy: { createdAt: "desc" },
      take: 5,
    }),
  ]);

  return (
    <div>
      <PageHeader
        eyebrow="Welcome back"
        title={session.name ? `${session.name.split(" ")[0]}'s study hub` : "Your study hub"}
        description={`Pick a tool and start learning smarter. ${usage.remaining} AI requests remaining today on your free plan.`}
      />

      <div className="mb-8 grid gap-4 sm:grid-cols-3">
        <GlassCard className="animate-rise-in p-5">
          <div className="flex items-center gap-3">
            <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-[var(--brand-soft)]">
              <TrendingUp className="h-5 w-5 text-[var(--brand)]" />
            </span>
            <div>
              <p className="text-2xl font-semibold text-[var(--foreground)]">{usage.remaining}</p>
              <p className="text-xs text-[var(--muted)]">Requests left today</p>
            </div>
          </div>
        </GlassCard>
        <GlassCard className="animate-rise-in stagger-1 p-5">
          <div className="flex items-center gap-3">
            <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-[var(--accent-soft)]">
              <Clock className="h-5 w-5 text-[var(--accent)]" />
            </span>
            <div>
              <p className="text-2xl font-semibold text-[var(--foreground)]">{recent.length}</p>
              <p className="text-xs text-[var(--muted)]">Recent sessions</p>
            </div>
          </div>
        </GlassCard>
        <GlassCard className="animate-rise-in stagger-2 p-5">
          <div className="flex items-center gap-3">
            <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-500/10">
              <Brain className="h-5 w-5 text-emerald-500" />
            </span>
            <div>
              <p className="text-2xl font-semibold text-[var(--foreground)]">6</p>
              <p className="text-xs text-[var(--muted)]">AI tools available</p>
            </div>
          </div>
        </GlassCard>
      </div>

      <div className="mb-2 flex items-center justify-between">
        <h2 className="font-display text-xl text-[var(--foreground)]">Study tools</h2>
        <Badge variant="accent">All tools</Badge>
      </div>
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        {tools.map((tool, i) => {
          const Icon = tool.icon;
          return (
            <AnimatedCard
              key={tool.href}
              href={tool.href}
              title={tool.title}
              description={tool.desc}
              badge={tool.badge}
              delay={i * 50}
              icon={<Icon className="h-5 w-5" />}
            />
          );
        })}
      </div>

      <section className="mt-10">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="font-display text-xl text-[var(--foreground)]">Recent activity</h2>
          <Link
            href="/history"
            className="inline-flex items-center gap-1 text-sm font-semibold text-[var(--brand)] hover:underline"
          >
            View all
            <ArrowRight className="h-3.5 w-3.5" />
          </Link>
        </div>
        <GlassCard className="overflow-hidden">
          {recent.length === 0 ? (
            <p className="px-5 py-10 text-center text-sm text-[var(--muted)]">
              No AI activity yet. Generate a summary or quiz to get started.
            </p>
          ) : (
            <ul className="divide-y divide-[var(--card-border)]">
              {recent.map((job) => (
                <li
                  key={job.id}
                  className="flex items-center justify-between px-5 py-3.5 text-sm transition hover:bg-[var(--brand-soft)]/50"
                >
                  <div>
                    <p className="font-medium text-[var(--foreground)]">{job.feature}</p>
                    <p className="text-xs text-[var(--muted)]">{formatDate(job.createdAt)}</p>
                  </div>
                  <Badge variant="muted">{job.tokensUsed ?? 0} tokens</Badge>
                </li>
              ))}
            </ul>
          )}
        </GlassCard>
      </section>
    </div>
  );
}
