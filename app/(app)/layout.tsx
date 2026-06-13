"use client";

import { usePathname, useRouter } from "next/navigation";
import { useEffect } from "react";
import { AppTopBar } from "@/components/app/app-top-bar";
import { setUnauthorizedHandler } from "@/lib/api";
import { useI18n } from "@/lib/i18n";
import { useHydrated } from "@/lib/use-hydrated";
import { useAuthStore } from "@/stores/auth";

/**
 * Client-side auth guard. The JWT lives in localStorage, so the session is only
 * known after hydration — server middleware can't see it. We wait for hydration,
 * then redirect unauthenticated users to /login?next=<path>.
 */
export default function AppLayout({ children }: { children: React.ReactNode }) {
  const hydrated = useHydrated();
  const router = useRouter();
  const pathname = usePathname();
  const isAuthed = useAuthStore((s) => Boolean(s.token));
  const { t } = useI18n();

  useEffect(() => {
    if (hydrated && !isAuthed) {
      router.replace(`/login?next=${encodeURIComponent(pathname)}`);
    }
  }, [hydrated, isAuthed, pathname, router]);

  // Expire the session on any 401 from an authed request: clear auth (which
  // trips the guard above) and bounce to login preserving the return path.
  useEffect(() => {
    setUnauthorizedHandler(() => {
      useAuthStore.getState().logout();
      router.replace(`/login?next=${encodeURIComponent(pathname)}`);
    });
    return () => setUnauthorizedHandler(null);
  }, [pathname, router]);

  // Avoid flashing protected content before the session is known / redirect runs.
  if (!hydrated || !isAuthed) {
    return (
      <main className="flex flex-1 items-center justify-center">
        <span className="text-caption text-muted-stone">{t.appNav.loading}</span>
      </main>
    );
  }

  return (
    <>
      <AppTopBar />
      <main className="flex-1">{children}</main>
    </>
  );
}
