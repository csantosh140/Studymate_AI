import Link from "next/link";
import { cn } from "@/lib/utils";
import { GlassCard } from "./GlassCard";

type AnimatedCardProps = {
  href?: string;
  icon?: React.ReactNode;
  title: string;
  description?: string;
  badge?: string;
  delay?: number;
  className?: string;
  onClick?: () => void;
  children?: React.ReactNode;
};

export function AnimatedCard({
  href,
  icon,
  title,
  description,
  badge,
  delay = 0,
  className,
  onClick,
  children,
}: AnimatedCardProps) {
  const style = { animationDelay: `${delay}ms` };
  const inner = (
    <GlassCard
      className={cn(
        "group relative overflow-hidden p-5 transition-all duration-300",
        "hover:-translate-y-1 hover:border-[var(--brand)]/30 hover:shadow-xl hover:shadow-[var(--brand)]/5",
        href || onClick ? "cursor-pointer" : "",
        "animate-rise-in",
        className,
      )}
      style={style}
    >
      <div className="pointer-events-none absolute -right-8 -top-8 h-24 w-24 rounded-full bg-[var(--brand-soft)] opacity-0 blur-2xl transition-opacity duration-300 group-hover:opacity-100" />
      {badge ? (
        <span className="mb-3 inline-block rounded-full bg-[var(--accent-soft)] px-2.5 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-[var(--accent)]">
          {badge}
        </span>
      ) : null}
      {icon ? (
        <span className="inline-flex h-11 w-11 items-center justify-center rounded-xl bg-[var(--brand-soft)] text-[var(--brand)] transition-colors duration-300 group-hover:bg-[var(--brand)] group-hover:text-white">
          {icon}
        </span>
      ) : null}
      <h3 className="mt-4 font-display text-lg text-[var(--foreground)]">{title}</h3>
      {description ? (
        <p className="mt-1.5 text-sm leading-relaxed text-[var(--muted)]">{description}</p>
      ) : null}
      {children}
    </GlassCard>
  );

  if (href) {
    return (
      <Link href={href} className="block">
        {inner}
      </Link>
    );
  }

  if (onClick) {
    return (
      <button type="button" onClick={onClick} className="block w-full text-left">
        {inner}
      </button>
    );
  }

  return inner;
}
