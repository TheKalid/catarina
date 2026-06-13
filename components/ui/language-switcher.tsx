"use client";

import { cn } from "@/lib/cn";
import { LOCALES, useI18n, type Locale } from "@/lib/i18n";

const SHORT: Record<Locale, string> = { en: "EN", es: "ES" };
const FULL: Record<Locale, "english" | "spanish"> = { en: "english", es: "spanish" };

/** Compact segmented EN/ES toggle. Switches language in place, no reload. */
export function LanguageSwitcher({ className }: { className?: string }) {
  const { locale, setLocale, t } = useI18n();

  return (
    <div
      role="group"
      aria-label={t.language.label}
      className={cn("inline-flex items-center gap-0.5 rounded-pill bg-fog p-0.5", className)}
    >
      {LOCALES.map((code) => {
        const active = code === locale;
        return (
          <button
            key={code}
            type="button"
            onClick={() => setLocale(code)}
            aria-pressed={active}
            aria-label={t.language[FULL[code]]}
            className={cn(
              "rounded-pill px-2 py-0.5 text-caption font-medium transition-colors",
              active ? "bg-canvas text-ink shadow-subtle" : "text-muted-stone hover:text-ink",
            )}
          >
            {SHORT[code]}
          </button>
        );
      })}
    </div>
  );
}
