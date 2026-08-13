"use client";

import { useEffect, useState } from "react";
import { Bell, Bot, Moon, Palette, Shield, User } from "lucide-react";
import { useTheme } from "@/components/theme/ThemeProvider";
import { Badge } from "@/components/ui/Badge";
import { Button, FieldLabel, FormCard, Select, TextInput } from "@/components/ui/Button";
import { GlassCard } from "@/components/ui/GlassCard";
import { PageHeader } from "@/components/ui/PageHeader";

type AiStatus = {
  mockMode: boolean;
  providers: { openai: boolean; groq: boolean; gemini: boolean; ollama: boolean };
  activeProvider: string;
  model: string;
  setupHint: string | null;
};

export default function SettingsPage() {
  const { theme, setTheme } = useTheme();
  const [aiStatus, setAiStatus] = useState<AiStatus | null>(null);

  useEffect(() => {
    fetch("/api/ai/status")
      .then((r) => r.json())
      .then((json) => {
        if (json.success) setAiStatus(json.data);
      })
      .catch(() => {});
  }, []);

  return (
    <div>
      <PageHeader
        eyebrow="Preferences"
        title="Settings"
        description="Customize your StudyMate AI experience, appearance, and AI provider."
      />

      {aiStatus?.setupHint ? (
        <GlassCard className="mb-6 border-amber-500/30 bg-amber-500/5 p-5">
          <p className="text-sm font-medium text-amber-700 dark:text-amber-300">AI setup required</p>
          <p className="mt-2 text-sm text-[var(--muted)]">{aiStatus.setupHint}</p>
          <ol className="mt-3 list-decimal space-y-1.5 pl-5 text-sm text-[var(--muted)]">
            <li>
              Get a <strong className="text-[var(--foreground)]">free Gemini key</strong> at{" "}
              <a
                href="https://aistudio.google.com/apikey"
                target="_blank"
                rel="noreferrer"
                className="text-[var(--brand)] underline"
              >
                aistudio.google.com/apikey
              </a>
            </li>
            <li>
              Add to <code className="rounded bg-[var(--muted-bg)] px-1">.env</code>:{" "}
              <code className="rounded bg-[var(--muted-bg)] px-1">GEMINI_API_KEY=&quot;AIza...&quot;</code>
            </li>
            <li>
              Restart: <code className="rounded bg-[var(--muted-bg)] px-1">npm run dev</code>
            </li>
          </ol>
        </GlassCard>
      ) : null}

      <div className="grid gap-6 lg:grid-cols-2">
        <GlassCard className="p-5 sm:p-6 lg:col-span-2">
          <div className="mb-4 flex items-center gap-2">
            <Bot className="h-4 w-4 text-[var(--brand)]" />
            <h2 className="font-display text-lg text-[var(--foreground)]">AI Provider</h2>
            {aiStatus ? (
              <Badge variant={aiStatus.mockMode ? "warning" : "success"}>
                {aiStatus.mockMode ? "Demo mode" : "Live AI"}
              </Badge>
            ) : null}
          </div>
          {aiStatus ? (
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
              {(
                [
                  ["Gemini (free)", aiStatus.providers.gemini, "GEMINI_API_KEY"],
                  ["Groq (free)", aiStatus.providers.groq, "GROQ_API_KEY"],
                  ["Ollama (local)", aiStatus.providers.ollama, "OLLAMA_ENABLED=true"],
                  ["OpenAI (paid)", aiStatus.providers.openai, "OPENAI_API_KEY"],
                ] as const
              ).map(([label, configured, envVar]) => (
                <div
                  key={label}
                  className={`rounded-xl border p-3 ${
                    configured
                      ? "border-emerald-500/30 bg-emerald-500/5"
                      : "border-[var(--card-border)] bg-[var(--card)]"
                  }`}
                >
                  <p className="text-sm font-medium text-[var(--foreground)]">{label}</p>
                  <p className="mt-0.5 text-xs text-[var(--muted)]">
                    {configured ? "Configured ✓" : envVar}
                  </p>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-sm text-[var(--muted)]">Loading AI status...</p>
          )}
          {!aiStatus?.mockMode && aiStatus ? (
            <p className="mt-3 text-xs text-[var(--muted)]">
              Active: <strong>{aiStatus.activeProvider}</strong> · {aiStatus.model}
            </p>
          ) : null}
        </GlassCard>

        <FormCard>
          <div className="mb-2 flex items-center gap-2">
            <User className="h-4 w-4 text-[var(--brand)]" />
            <h2 className="font-display text-lg text-[var(--foreground)]">Profile</h2>
          </div>
          <div className="space-y-4">
            <div>
              <FieldLabel>Display name</FieldLabel>
              <TextInput placeholder="Your name" defaultValue="" />
            </div>
            <div>
              <FieldLabel>Email</FieldLabel>
              <TextInput type="email" placeholder="you@school.edu" disabled />
            </div>
            <Button size="sm">Save profile</Button>
          </div>
        </FormCard>

        <FormCard>
          <div className="mb-2 flex items-center gap-2">
            <Palette className="h-4 w-4 text-[var(--accent)]" />
            <h2 className="font-display text-lg text-[var(--foreground)]">Appearance</h2>
          </div>
          <div className="space-y-4">
            <div>
              <FieldLabel>Theme</FieldLabel>
              <div className="grid grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => setTheme("light")}
                  className={`flex items-center gap-2 rounded-xl border p-3 text-sm font-medium transition ${
                    theme === "light"
                      ? "border-[var(--brand)] bg-[var(--brand-soft)] text-[var(--brand)]"
                      : "border-[var(--card-border)] text-[var(--muted)] hover:border-[var(--brand)]/30"
                  }`}
                >
                  <span className="h-6 w-6 rounded-lg bg-gradient-to-br from-slate-100 to-slate-200" />
                  Light
                </button>
                <button
                  type="button"
                  onClick={() => setTheme("dark")}
                  className={`flex items-center gap-2 rounded-xl border p-3 text-sm font-medium transition ${
                    theme === "dark"
                      ? "border-[var(--brand)] bg-[var(--brand-soft)] text-[var(--brand)]"
                      : "border-[var(--card-border)] text-[var(--muted)] hover:border-[var(--brand)]/30"
                  }`}
                >
                  <Moon className="h-5 w-5" />
                  Dark
                </button>
              </div>
            </div>
            <div>
              <FieldLabel>Language</FieldLabel>
              <Select defaultValue="en">
                <option value="en">English</option>
                <option value="es">Español</option>
                <option value="fr">Français</option>
              </Select>
            </div>
          </div>
        </FormCard>

        <FormCard>
          <div className="mb-2 flex items-center gap-2">
            <Bell className="h-4 w-4 text-[var(--brand)]" />
            <h2 className="font-display text-lg text-[var(--foreground)]">Notifications</h2>
          </div>
          <div className="space-y-3">
            {[
              { label: "Study reminders", desc: "Daily nudge to review flashcards" },
              { label: "Plan updates", desc: "When your study plan is regenerated" },
              { label: "Usage alerts", desc: "When approaching daily AI limit" },
            ].map((item) => (
              <label
                key={item.label}
                className="flex cursor-pointer items-center justify-between rounded-xl border border-[var(--card-border)] p-3 transition hover:bg-[var(--brand-soft)]/30"
              >
                <div>
                  <p className="text-sm font-medium text-[var(--foreground)]">{item.label}</p>
                  <p className="text-xs text-[var(--muted)]">{item.desc}</p>
                </div>
                <input
                  type="checkbox"
                  defaultChecked
                  className="h-4 w-4 rounded accent-[var(--brand)]"
                />
              </label>
            ))}
          </div>
        </FormCard>

        <GlassCard className="p-5 sm:p-6">
          <div className="mb-4 flex items-center gap-2">
            <Shield className="h-4 w-4 text-[var(--accent)]" />
            <h2 className="font-display text-lg text-[var(--foreground)]">Account & plan</h2>
          </div>
          <div className="space-y-4">
            <div className="flex items-center justify-between rounded-xl border border-[var(--card-border)] p-4">
              <div>
                <p className="text-sm font-medium text-[var(--foreground)]">Current plan</p>
                <p className="text-xs text-[var(--muted)]">Free tier with daily AI limits</p>
              </div>
              <Badge variant="brand">Free</Badge>
            </div>
            <Button variant="outline" size="sm" className="w-full">
              Upgrade to Pro
            </Button>
          </div>
        </GlassCard>
      </div>
    </div>
  );
}
