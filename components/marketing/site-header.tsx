"use client";

import Link from "next/link";
import { ButtonLink } from "@/components/ui/button";
import { Container } from "@/components/ui/container";
import { Logo } from "@/components/ui/logo";
import { useHydrated } from "@/lib/use-hydrated";
import { useAuthStore } from "@/stores/auth";

const NAV_LINKS = [
  { href: "/#product", label: "Product" },
  { href: "/#how-it-works", label: "How it works" },
  { href: "/#service", label: "Service" },
  { href: "/#scales", label: "Who it's for" },
];

export function SiteHeader() {
  const hydrated = useHydrated();
  const isAuthed = useAuthStore((s) => Boolean(s.token));

  return (
    <header className="sticky top-0 z-50 border-b border-ink/5 bg-canvas/80 backdrop-blur-md">
      <Container className="flex h-16 items-center justify-between gap-6">
        <Logo />

        <nav className="hidden items-center gap-7 md:flex">
          {NAV_LINKS.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="text-caption text-muted-stone transition-colors hover:text-ink"
            >
              {link.label}
            </Link>
          ))}
        </nav>

        <div className="flex items-center gap-2">
          {hydrated && isAuthed ? (
            <ButtonLink href="/dashboard" variant="primary" size="sm">
              Open app
            </ButtonLink>
          ) : (
            <>
              <ButtonLink href="/login" variant="link" size="sm" className="px-3">
                Log in
              </ButtonLink>
              <ButtonLink href="/register" variant="primary" size="sm">
                Get started
              </ButtonLink>
            </>
          )}
        </div>
      </Container>
    </header>
  );
}
