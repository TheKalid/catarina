"use client";

import Link from "next/link";
import { ButtonLink } from "@/components/ui/button";
import { Container } from "@/components/ui/container";
import { LanguageSwitcher } from "@/components/ui/language-switcher";
import { Logo } from "@/components/ui/logo";
import { useI18n } from "@/lib/i18n";
import { useHydrated } from "@/lib/use-hydrated";
import { useAuthStore } from "@/stores/auth";

export function SiteHeader() {
  const hydrated = useHydrated();
  const isAuthed = useAuthStore((s) => Boolean(s.token));
  const { t } = useI18n();

  const navLinks = [
    { href: "/#product", label: t.nav.product },
    { href: "/#how-it-works", label: t.nav.howItWorks },
    { href: "/#service", label: t.nav.service },
    { href: "/#scales", label: t.nav.whoFor },
  ];

  return (
    <header className="sticky top-0 z-50 border-b border-ink/5 bg-canvas/80 backdrop-blur-md">
      <Container className="flex h-16 items-center justify-between gap-6">
        <Logo />

        <nav className="hidden items-center gap-7 md:flex">
          {navLinks.map((link) => (
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
          <LanguageSwitcher className="mr-1" />
          {hydrated && isAuthed ? (
            <ButtonLink href="/dashboard" variant="primary" size="sm">
              {t.nav.openApp}
            </ButtonLink>
          ) : (
            <>
              <ButtonLink href="/login" variant="link" size="sm" className="px-3">
                {t.nav.logIn}
              </ButtonLink>
              <ButtonLink href="/register" variant="primary" size="sm">
                {t.nav.getStarted}
              </ButtonLink>
            </>
          )}
        </div>
      </Container>
    </header>
  );
}
