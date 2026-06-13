"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useState, type FormEvent } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Field } from "@/components/ui/input";
import { useAuthStore } from "@/stores/auth";

type Mode = "login" | "register";

const COPY: Record<Mode, { title: string; cta: string; alt: { text: string; href: string; label: string } }> = {
  login: {
    title: "Welcome back",
    cta: "Log in",
    alt: { text: "New to Catarina?", href: "/register", label: "Create an account" },
  },
  register: {
    title: "Create your account",
    cta: "Get started",
    alt: { text: "Already have an account?", href: "/login", label: "Log in" },
  },
};

export function AuthForm({ mode }: { mode: Mode }) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const login = useAuthStore((s) => s.login);
  const register = useAuthStore((s) => s.register);

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const copy = COPY[mode];

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();
    setError(null);
    setSubmitting(true);
    try {
      if (mode === "login") {
        await login(email, password);
      } else {
        await register(email, password);
      }
      const next = searchParams.get("next");
      router.push(next && next.startsWith("/") ? next : "/dashboard");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
      setSubmitting(false);
    }
  }

  return (
    <Card className="w-full p-8">
      <form onSubmit={handleSubmit} className="flex flex-col gap-6">
        <div className="flex flex-col gap-1.5">
          <h1 className="font-display text-heading-lg text-ink">{copy.title}</h1>
          <p className="text-caption text-muted-stone">
            {copy.alt.text}{" "}
            <Link href={copy.alt.href} className="font-medium text-ink underline-offset-4 hover:underline">
              {copy.alt.label}
            </Link>
          </p>
        </div>

        <div className="flex flex-col gap-4">
          <Field
            label="Email"
            type="email"
            name="email"
            autoComplete="email"
            placeholder="you@example.com"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
          <Field
            label="Password"
            type="password"
            name="password"
            autoComplete={mode === "login" ? "current-password" : "new-password"}
            placeholder="••••••••"
            required
            minLength={8}
            maxLength={72}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            hint={mode === "register" ? "8–72 characters." : undefined}
          />
        </div>

        {error ? (
          <p role="alert" className="rounded-input bg-warm-mist px-4 py-3 text-caption text-terracotta">
            {error}
          </p>
        ) : null}

        <Button type="submit" size="lg" disabled={submitting} className="w-full">
          {submitting ? "Please wait…" : copy.cta}
        </Button>
      </form>
    </Card>
  );
}
