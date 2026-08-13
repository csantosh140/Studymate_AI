import { cn } from "@/lib/utils";

type BadgeProps = {
  children: React.ReactNode;
  variant?: "brand" | "accent" | "muted" | "success" | "warning";
  className?: string;
};

const variants = {
  brand: "bg-[var(--brand-soft)] text-[var(--brand)]",
  accent: "bg-[var(--accent-soft)] text-[var(--accent)]",
  muted: "bg-[var(--muted-bg)] text-[var(--muted)]",
  success: "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400",
  warning: "bg-amber-500/10 text-amber-600 dark:text-amber-400",
};

export function Badge({ children, variant = "brand", className }: BadgeProps) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full px-2.5 py-0.5 text-[11px] font-semibold uppercase tracking-wider",
        variants[variant],
        className,
      )}
    >
      {children}
    </span>
  );
}
