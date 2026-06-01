"use client";

import Link from "next/link";
import { Card } from "@/components/ui/card";
import { Container } from "@/components/ui/container";
import { ChipIcon } from "@/components/ui/icons";
import { useAuthStore } from "@/stores/auth";

export default function DashboardPage() {
  const email = useAuthStore((s) => s.user?.email);

  return (
    <Container className="flex flex-col gap-8 py-10">
      <div className="flex flex-col gap-1.5">
        <h1 className="font-display text-display text-ink">Dashboard</h1>
        <p className="text-body text-muted-stone">
          {email ? `Signed in as ${email}.` : "Welcome back."}
        </p>
      </div>

      {/* Devices land here next milestone — placeholder for now. */}
      <Card variant="fog" className="flex flex-col items-center gap-4 px-6 py-16 text-center">
        <span className="flex size-12 items-center justify-center rounded-image bg-canvas text-ink">
          <ChipIcon className="size-6" />
        </span>
        <div className="flex flex-col gap-1.5">
          <h2 className="text-heading font-medium text-ink">No devices yet</h2>
          <p className="max-w-sm text-body text-muted-stone text-pretty">
            Device monitoring is coming next. For now, set up your account and
            invite your household.
          </p>
        </div>
        <Link
          href="/account"
          className="text-caption font-medium text-ink underline-offset-4 hover:underline"
        >
          Manage account →
        </Link>
      </Card>
    </Container>
  );
}
