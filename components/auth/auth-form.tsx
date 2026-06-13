"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useState, type FormEvent } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Field } from "@/components/ui/input";
import { useI18n } from "@/lib/i18n";
import { useAuthStore } from "@/stores/auth";

type Mode = "login" | "register";

export function AuthForm({ mode }: { mode: Mode }) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const login = useAuthStore((s) => s.login);
  const register = useAuthStore((s) => s.register);
  const { t } = useI18n();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const copy =
    mode === "login"
      ? {
          title: t.auth.loginTitle,
          cta: t.auth.loginCta,
          alt: { text: t.auth.loginAltText, href: "/register", label: t.auth.loginAltLabel },
        }
      : {
          title: t.auth.registerTitle,
          cta: t.auth.registerCta,
          alt: { text: t.auth.registerAltText, href: "/login", label: t.auth.registerAltLabel },
        };

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
      setError(err instanceof Error ? err.message : t.auth.genericError);
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
            label={t.auth.emailLabel}
            type="email"
            name="email"
            autoComplete="email"
            placeholder="you@example.com"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
          <Field
            label={t.auth.passwordLabel}
            type="password"
            name="password"
            autoComplete={mode === "login" ? "current-password" : "new-password"}
            placeholder="••••••••"
            required
            minLength={8}
            maxLength={72}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            hint={mode === "register" ? t.auth.passwordHint : undefined}
          />
        </div>

        {error ? (
          <p role="alert" className="rounded-input bg-warm-mist px-4 py-3 text-caption text-terracotta">
            {error}
          </p>
        ) : null}

        <Button type="submit" size="lg" disabled={submitting} className="w-full">
          {submitting ? t.auth.pleaseWait : copy.cta}
        </Button>
      </form>
    </Card>
  );
}
