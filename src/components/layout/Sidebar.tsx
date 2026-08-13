"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  BookOpenCheck,
  Brain,
  CalendarRange,
  History,
  Layers3,
  LayoutDashboard,
  Lightbulb,
  Mic,
  PenLine,
  Settings,
  Sparkles,
} from "lucide-react";
import { cn } from "@/lib/utils";

export const navItems = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/summarize", label: "Summarizer", icon: BookOpenCheck },
  { href: "/quiz", label: "Quiz Generator", icon: Brain },
  { href: "/explain", label: "Explain Concepts", icon: Lightbulb },
  { href: "/improve", label: "Answer Improver", icon: PenLine },
  { href: "/flashcards", label: "Flashcards", icon: Layers3 },
  { href: "/planner", label: "Study Planner", icon: CalendarRange },
  { href: "/voice-assistant", label: "AI Assistant", icon: Mic },
  { href: "/history", label: "History", icon: History },
  { href: "/settings", label: "Settings", icon: Settings },
];

export function Sidebar({
  user,
  onNavigate,
}: {
  user: { name: string | null; email: string };
  onNavigate?: () => void;
}) {
  const pathname = usePathname();

  return (
    <aside className="flex h-full w-72 flex-col glass-strong px-4 py-5">
      <Link href="/dashboard" onClick={onNavigate} className="mb-8 flex items-center gap-3 px-2">
        <span className="relative flex h-10 w-10 items-center justify-center rounded-2xl bg-gradient-to-br from-[var(--brand)] to-[var(--accent)] text-white shadow-lg shadow-[var(--brand)]/25">
          <Sparkles className="h-5 w-5" />
        </span>
        <div>
          <p className="font-display text-lg leading-none text-[var(--foreground)]">StudyMate AI</p>
          <p className="mt-0.5 text-[11px] text-[var(--muted)]">Student learning suite</p>
        </div>
      </Link>

      <nav className="flex-1 space-y-0.5 overflow-y-auto">
        {navItems.map((item) => {
          const active = pathname === item.href;
          const Icon = item.icon;
          return (
            <Link
              key={item.href}
              href={item.href}
              onClick={onNavigate}
              className={cn(
                "group flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-all duration-200",
                active
                  ? "bg-gradient-to-r from-[var(--brand)] to-[var(--brand)]/80 text-white shadow-md shadow-[var(--brand)]/20"
                  : "text-[var(--muted)] hover:bg-[var(--brand-soft)] hover:text-[var(--brand)]",
              )}
            >
              <Icon
                className={cn(
                  "h-4 w-4 shrink-0 transition-transform duration-200",
                  !active && "group-hover:scale-110",
                )}
              />
              {item.label}
            </Link>
          );
        })}
      </nav>

      <div className="mt-4 rounded-2xl border border-[var(--card-border)] bg-[var(--card)] p-3.5">
        <div className="flex items-center gap-3">
          <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-[var(--accent-soft)] text-sm font-bold text-[var(--accent)]">
            {(user.name || user.email)[0]?.toUpperCase()}
          </span>
          <div className="min-w-0">
            <p className="truncate text-sm font-medium text-[var(--foreground)]">
              {user.name || "Student"}
            </p>
            <p className="truncate text-[11px] text-[var(--muted)]">{user.email}</p>
          </div>
        </div>
      </div>
    </aside>
  );
}
