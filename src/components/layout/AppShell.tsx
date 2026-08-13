"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { Bell, LogOut, Menu, Search, Sparkles, X } from "lucide-react";
import { useState } from "react";
import { ThemeToggle } from "@/components/ui/ThemeToggle";
import { Button } from "@/components/ui/Button";
import { cn } from "@/lib/utils";
import { Sidebar } from "./Sidebar";
import { VoiceAssistant } from "@/components/ai/VoiceAssistant";

const pageTitles: Record<string, string> = {
  "/dashboard": "Dashboard",
  "/summarize": "Summarizer",
  "/quiz": "Quiz Generator",
  "/explain": "Explain Concepts",
  "/improve": "Answer Improver",
  "/flashcards": "Flashcards",
  "/planner": "Study Planner",
  "/history": "History",
  "/settings": "Settings",
  "/voice-assistant": "AI Voice Assistant",
};

export function AppShell({
  children,
  user,
}: {
  children: React.ReactNode;
  user: { name: string | null; email: string };
}) {
  const pathname = usePathname();
  const router = useRouter();
  const [open, setOpen] = useState(false);

  async function logout() {
    await fetch("/api/auth/logout", { method: "POST" });
    router.push("/login");
    router.refresh();
  }

  const pageTitle = pageTitles[pathname] || "StudyMate AI";

  return (
    <div className="app-gradient min-h-screen">
      <div className="mx-auto flex min-h-screen max-w-[1440px]">
        <div className="hidden lg:block">
          <div className="sticky top-0 h-screen py-4 pl-4">
            <Sidebar user={user} />
          </div>
        </div>

        <div className="flex min-w-0 flex-1 flex-col">
          <header className="sticky top-0 z-30 px-4 pt-4 lg:px-6">
            <div className="glass flex items-center justify-between gap-4 rounded-2xl px-4 py-3 shadow-lg shadow-[var(--shadow)]">
              <div className="flex items-center gap-3">
                <button
                  type="button"
                  aria-label="Toggle menu"
                  onClick={() => setOpen((v) => !v)}
                  className="rounded-xl border border-[var(--card-border)] bg-[var(--card)] p-2 lg:hidden"
                >
                  {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
                </button>
                <div className="lg:hidden">
                  <Link href="/dashboard" className="flex items-center gap-2">
                    <Sparkles className="h-4 w-4 text-[var(--brand)]" />
                    <span className="font-display text-base text-[var(--foreground)]">StudyMate</span>
                  </Link>
                </div>
                <div className="hidden lg:block">
                  <h2 className="font-display text-lg text-[var(--foreground)]">{pageTitle}</h2>
                  <p className="text-xs text-[var(--muted)]">
                    {user.name ? `Welcome, ${user.name.split(" ")[0]}` : "Your AI study workspace"}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <div className="hidden items-center gap-2 rounded-xl border border-[var(--card-border)] bg-[var(--input-bg)] px-3 py-2 sm:flex">
                  <Search className="h-4 w-4 text-[var(--muted)]" />
                  <input
                    type="text"
                    placeholder="Search tools..."
                    className="w-36 bg-transparent text-sm text-[var(--foreground)] outline-none placeholder:text-[var(--muted)] lg:w-48"
                  />
                </div>
                <button
                  type="button"
                  aria-label="Notifications"
                  className="hidden h-9 w-9 items-center justify-center rounded-xl border border-[var(--card-border)] bg-[var(--card)] text-[var(--muted)] transition hover:text-[var(--brand)] sm:flex"
                >
                  <Bell className="h-4 w-4" />
                </button>
                <ThemeToggle />
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={logout}
                  className="hidden sm:inline-flex"
                >
                  <LogOut className="h-4 w-4" />
                  Sign out
                </Button>
              </div>
            </div>
          </header>

          {open ? (
            <div
              className="fixed inset-0 z-40 bg-black/40 backdrop-blur-sm lg:hidden"
              onClick={() => setOpen(false)}
            />
          ) : null}
          <div
            className={cn(
              "fixed inset-y-0 left-0 z-50 w-72 transform p-4 transition-transform duration-300 lg:hidden",
              open ? "translate-x-0" : "-translate-x-full",
            )}
          >
            <Sidebar user={user} onNavigate={() => setOpen(false)} />
          </div>

          <main className="flex-1 px-4 py-6 sm:px-6 lg:px-8 lg:py-8">{children}</main>
        </div>
      </div>
      <VoiceAssistant />
    </div>
  );
}
