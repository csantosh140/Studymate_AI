import { cn } from "@/lib/utils";

type PageHeaderProps = {
  eyebrow?: string;
  title: string;
  description?: string;
  action?: React.ReactNode;
  className?: string;
};

export function PageHeader({ eyebrow, title, description, action, className }: PageHeaderProps) {
  return (
    <div className={cn("mb-8 flex flex-wrap items-end justify-between gap-4", className)}>
      <div className="max-w-2xl animate-rise-in">
        {eyebrow ? (
          <p className="text-xs font-semibold uppercase tracking-[0.16em] text-[var(--brand)]">
            {eyebrow}
          </p>
        ) : null}
        <h1 className="mt-2 font-display text-3xl tracking-tight text-[var(--foreground)] sm:text-4xl">
          {title}
        </h1>
        {description ? (
          <p className="mt-2 text-base leading-relaxed text-[var(--muted)]">{description}</p>
        ) : null}
      </div>
      {action ? <div className="animate-rise-in stagger-1">{action}</div> : null}
    </div>
  );
}
