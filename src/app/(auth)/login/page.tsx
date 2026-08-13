"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { AuthCard } from "@/components/layout/PageBits";
import { ErrorBanner, FieldLabel, PrimaryButton, TextInput } from "@/components/ai/shared";
import { ThemeToggle } from "@/components/ui/ThemeToggle";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });
      const json = await res.json();
      if (!res.ok || !json.success) {
        throw new Error(json.error?.message || "Login failed");
      }
      router.push("/dashboard");
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Login failed");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="app-gradient relative flex min-h-screen items-center justify-center px-4 py-10">
      <div className="pointer-events-none absolute -left-32 top-20 h-80 w-80 rounded-full bg-[var(--glow-1)] blur-3xl" />
      <div className="pointer-events-none absolute -right-32 bottom-20 h-72 w-72 rounded-full bg-[var(--glow-2)] blur-3xl" />
      <div className="absolute right-6 top-6">
        <ThemeToggle />
      </div>
      <AuthCard
        title="Sign in"
        subtitle="Access your StudyMate AI learning workspace."
        footer={
          <>
            New here?{" "}
            <Link href="/signup" className="font-semibold text-[var(--brand)] hover:underline">
              Create an account
            </Link>
          </>
        }
      >
        <form onSubmit={onSubmit} className="space-y-4">
          {error ? <ErrorBanner message={error} /> : null}
          <div>
            <FieldLabel>Email</FieldLabel>
            <TextInput
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>
          <div>
            <FieldLabel>Password</FieldLabel>
            <TextInput
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>
          <PrimaryButton type="submit" loading={loading} className="w-full">
            Sign in
          </PrimaryButton>
        </form>
      </AuthCard>
    </div>
  );
}
