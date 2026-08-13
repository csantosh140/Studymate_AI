import { cn } from "@/lib/utils";

type GlassCardProps = React.HTMLAttributes<HTMLDivElement> & {
  variant?: "default" | "strong";
};

export function GlassCard({
  className,
  variant = "default",
  children,
  ...props
}: GlassCardProps) {
  return (
    <div
      className={cn(
        "rounded-2xl",
        variant === "strong" ? "glass-strong" : "glass",
        "shadow-lg shadow-[var(--shadow)]",
        className,
      )}
      {...props}
    >
      {children}
    </div>
  );
}
