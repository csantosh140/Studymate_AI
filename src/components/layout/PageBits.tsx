import Link from "next/link";
import { GlassCard } from "@/components/ui/GlassCard";

export function FeaturePageHeader({
  title,
  description,
}: {
  title: string;
  description: string;
}) {
  return (
    <div className="mb-8 max-w-3xl animate-rise-in">
      <p className="text-xs font-semibold uppercase tracking-[0.16em] text-[var(--brand)]">
        StudyMate AI
      </p>
      <h1 className="mt-2 font-display text-3xl tracking-tight text-[var(--foreground)] sm:text-4xl">
        {title}
      </h1>
      <p className="mt-2 text-base leading-relaxed text-[var(--muted)]">{description}</p>
    </div>
  );
}

export function EmptyHint({ children }: { children: React.ReactNode }) {
  return (
    <div className="rounded-2xl border border-dashed border-[var(--card-border)] bg-[var(--card)] px-5 py-10 text-center text-sm text-[var(--muted)]">
      {children}
    </div>
  );
}

export function AuthCard({
  title,
  subtitle,
  children,
  footer,
}: {
  title: string;
  subtitle: string;
  children: React.ReactNode;
  footer: React.ReactNode;
}) {
  return (
    <GlassCard className="mx-auto w-full max-w-md p-6 sm:p-8">
      <Link href="/" className="inline-flex items-center gap-2">
        <span className="flex h-8 w-8 items-center justify-center rounded-xl bg-gradient-to-br from-[var(--brand)] to-[var(--accent)] text-white text-sm font-bold">
          S
        </span>
        <span className="font-display text-xl text-[var(--foreground)]">StudyMate AI</span>
      </Link>
      <h1 className="mt-6 font-display text-3xl text-[var(--foreground)]">{title}</h1>
      <p className="mt-2 text-sm text-[var(--muted)]">{subtitle}</p>
      <div className="mt-6">{children}</div>
      <div className="mt-5 text-sm text-[var(--muted)]">{footer}</div>
    </GlassCard>
  );
}
