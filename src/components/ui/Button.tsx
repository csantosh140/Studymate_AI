import { Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

type ButtonProps = React.ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: "primary" | "secondary" | "ghost" | "outline";
  size?: "sm" | "md" | "lg";
  loading?: boolean;
};

const variants = {
  primary:
    "bg-[var(--brand)] text-white hover:brightness-110 shadow-md shadow-[var(--brand)]/20",
  secondary:
    "bg-[var(--accent-soft)] text-[var(--accent)] hover:bg-[var(--accent)]/20",
  ghost: "text-[var(--muted)] hover:bg-[var(--brand-soft)] hover:text-[var(--brand)]",
  outline:
    "border border-[var(--card-border)] bg-[var(--card)] text-[var(--foreground)] hover:border-[var(--brand)]/40",
};

const sizes = {
  sm: "px-3 py-1.5 text-xs rounded-lg",
  md: "px-4 py-2.5 text-sm rounded-xl",
  lg: "px-6 py-3 text-sm rounded-xl",
};

export function Button({
  variant = "primary",
  size = "md",
  loading,
  className,
  children,
  disabled,
  ...props
}: ButtonProps) {
  return (
    <button
      {...props}
      disabled={disabled || loading}
      className={cn(
        "inline-flex items-center justify-center gap-2 font-semibold transition-all duration-200",
        "disabled:cursor-not-allowed disabled:opacity-50",
        variants[variant],
        sizes[size],
        className,
      )}
    >
      {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
      {children}
    </button>
  );
}

export function FieldLabel({ children }: { children: React.ReactNode }) {
  return (
    <label className="mb-1.5 block text-sm font-medium text-[var(--foreground)]">{children}</label>
  );
}

export function TextArea(props: React.TextareaHTMLAttributes<HTMLTextAreaElement>) {
  return (
    <textarea
      {...props}
      className={cn(
        "w-full rounded-xl border border-[var(--card-border)] bg-[var(--input-bg)] px-3.5 py-2.5",
        "text-sm text-[var(--foreground)] outline-none transition-all duration-200",
        "placeholder:text-[var(--muted)] focus:border-[var(--brand)]/50 focus:ring-2 focus:ring-[var(--brand)]/20",
        props.className,
      )}
    />
  );
}

export function TextInput(props: React.InputHTMLAttributes<HTMLInputElement>) {
  return (
    <input
      {...props}
      className={cn(
        "w-full rounded-xl border border-[var(--card-border)] bg-[var(--input-bg)] px-3.5 py-2.5",
        "text-sm text-[var(--foreground)] outline-none transition-all duration-200",
        "placeholder:text-[var(--muted)] focus:border-[var(--brand)]/50 focus:ring-2 focus:ring-[var(--brand)]/20",
        props.className,
      )}
    />
  );
}

export function Select(props: React.SelectHTMLAttributes<HTMLSelectElement>) {
  return (
    <select
      {...props}
      className={cn(
        "w-full rounded-xl border border-[var(--card-border)] bg-[var(--input-bg)] px-3.5 py-2.5",
        "text-sm text-[var(--foreground)] outline-none transition-all duration-200",
        "focus:border-[var(--brand)]/50 focus:ring-2 focus:ring-[var(--brand)]/20",
        props.className,
      )}
    />
  );
}

export function FormCard({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div className={cn("glass space-y-4 rounded-2xl p-5 shadow-lg shadow-[var(--shadow)] sm:p-6", className)}>
      {children}
    </div>
  );
}
