"use client";

import Link from "next/link";
import { Container } from "@/components/ui/container";
import { Logo } from "@/components/ui/logo";
import { useI18n } from "@/lib/i18n";

export function SiteFooter() {
  const { t } = useI18n();

  const columns = [
    {
      title: t.footer.productTitle,
      links: [
        { href: "/#product", label: t.footer.overview },
        { href: "/#service", label: t.footer.service },
        { href: "/#scales", label: t.footer.whoFor },
      ],
    },
    {
      title: t.footer.accountTitle,
      links: [
        { href: "/login", label: t.footer.logIn },
        { href: "/register", label: t.footer.getStarted },
      ],
    },
  ];

  return (
    <footer className="mt-auto border-t border-ink/5 bg-fog">
      <Container className="flex flex-col gap-10 py-12 md:flex-row md:justify-between">
        <div className="flex max-w-xs flex-col gap-3">
          <Logo />
          <p className="text-caption text-muted-stone text-pretty">
            {t.footer.tagline}
          </p>
        </div>

        <div className="flex gap-16">
          {columns.map((col) => (
            <div key={col.title} className="flex flex-col gap-3">
              <span className="text-caption font-medium text-ink">{col.title}</span>
              {col.links.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className="text-caption text-muted-stone transition-colors hover:text-ink"
                >
                  {link.label}
                </Link>
              ))}
            </div>
          ))}
        </div>
      </Container>
      <Container className="border-t border-ink/5 py-6">
        <p className="text-caption text-light-steel">
          {t.footer.rights(new Date().getFullYear())}
        </p>
      </Container>
    </footer>
  );
}
