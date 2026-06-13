"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Container } from "@/components/ui/container";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/cn";
import { type Account } from "@/lib/api";
import { useAccountsStore } from "@/stores/accounts";
import { useAuthStore } from "@/stores/auth";

export default function AccountPage() {
  const user = useAuthStore((s) => s.user);
  // Select stable refs and derive the list in render — a selector that returns
  // a fresh array each call loops under zustand v5 (no default shallow compare).
  const byId = useAccountsStore((s) => s.byId);
  const allIds = useAccountsStore((s) => s.allIds);
  const accounts = allIds.map((id) => byId[id]);
  const status = useAccountsStore((s) => s.status);
  const error = useAccountsStore((s) => s.error);
  const fetchAll = useAccountsStore((s) => s.fetchAll);

  useEffect(() => {
    fetchAll().catch(() => {});
  }, [fetchAll]);

  return (
    <Container className="flex max-w-3xl flex-col gap-8 py-10">
      <div className="flex flex-col gap-1.5">
        <h1 className="font-display text-display text-ink">Account</h1>
        <p className="text-body text-muted-stone">
          Manage your accounts, names, and members.
        </p>
      </div>

      {/* Profile */}
      <Card className="flex flex-col gap-4 p-6">
        <h2 className="text-heading font-medium text-ink">Profile</h2>
        <Row label="Email" value={user?.email ?? "—"} />
      </Card>

      {/* Accounts */}
      <section className="flex flex-col gap-4">
        <h2 className="text-heading font-medium text-ink">Your accounts</h2>

        {status === "loading" && accounts.length === 0 ? (
          <Card className="flex flex-col gap-4 p-6">
            <Skeleton className="h-6 w-40" />
            <div className="flex gap-2">
              <Skeleton className="h-5 w-20 rounded-pill" />
              <Skeleton className="h-5 w-16 rounded-pill" />
            </div>
            <Skeleton className="h-4 w-28" />
          </Card>
        ) : error && accounts.length === 0 ? (
          <Card variant="fog" className="p-6">
            <p className="text-body text-terracotta">{error}</p>
          </Card>
        ) : accounts.length === 0 ? (
          <Card variant="fog" className="p-6">
            <p className="text-body text-muted-stone">No accounts found.</p>
          </Card>
        ) : (
          accounts.map((account) => <AccountCard key={account.id} account={account} />)
        )}
      </section>
    </Container>
  );
}

/* ----------------------------------------------------------- AccountCard -- */

function AccountCard({ account }: { account: Account }) {
  const rename = useAccountsStore((s) => s.rename);
  const fetchMembers = useAccountsStore((s) => s.fetchMembers);
  const members = useAccountsStore((s) => s.membersByAccount[account.id]);

  const [editing, setEditing] = useState(false);
  const [name, setName] = useState(account.name);
  const [saving, setSaving] = useState(false);
  const [renameError, setRenameError] = useState<string | null>(null);
  const [membersOpen, setMembersOpen] = useState(false);

  const canManage = account.role === "owner" || account.role === "admin";

  async function save() {
    const trimmed = name.trim();
    if (!trimmed || trimmed === account.name) {
      setEditing(false);
      setName(account.name);
      return;
    }
    setSaving(true);
    setRenameError(null);
    try {
      await rename(account.id, trimmed);
      setEditing(false);
    } catch (err) {
      setRenameError(err instanceof Error ? err.message : "Could not rename");
      setName(account.name);
    } finally {
      setSaving(false);
    }
  }

  function toggleMembers() {
    const next = !membersOpen;
    setMembersOpen(next);
    if (next && !members) fetchMembers(account.id).catch(() => {});
  }

  return (
    <Card className="flex flex-col gap-5 p-6">
      <div className="flex items-start justify-between gap-4">
        <div className="flex flex-1 flex-col gap-2">
          {editing ? (
            <div className="flex items-center gap-2">
              <Input
                value={name}
                autoFocus
                maxLength={120}
                onChange={(e) => setName(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") save();
                  if (e.key === "Escape") {
                    setEditing(false);
                    setName(account.name);
                  }
                }}
                className="h-10 max-w-xs"
              />
              <Button size="sm" onClick={save} disabled={saving}>
                {saving ? "Saving…" : "Save"}
              </Button>
              <Button
                size="sm"
                variant="ghost"
                onClick={() => {
                  setEditing(false);
                  setName(account.name);
                  setRenameError(null);
                }}
              >
                Cancel
              </Button>
            </div>
          ) : (
            <div className="flex items-center gap-3">
              <span className="text-heading-lg font-medium text-ink">{account.name}</span>
              {canManage ? (
                <button
                  type="button"
                  onClick={() => setEditing(true)}
                  className="text-caption font-medium text-muted-stone underline-offset-4 hover:text-ink hover:underline"
                >
                  Edit
                </button>
              ) : null}
            </div>
          )}
          <div className="flex items-center gap-2">
            <Badge>{account.kind}</Badge>
            <Badge tone="role">{account.role}</Badge>
          </div>
          {renameError ? (
            <p className="text-caption text-terracotta">{renameError}</p>
          ) : null}
        </div>
      </div>

      {/* Members */}
      <div className="border-t border-ink/5 pt-4">
        <button
          type="button"
          onClick={toggleMembers}
          className="text-caption font-medium text-ink underline-offset-4 hover:underline"
        >
          {membersOpen ? "Hide members" : "View members"}
        </button>

        {membersOpen ? (
          <div className="mt-4">
            {!members ? (
              <p className="text-caption text-muted-stone">Loading members…</p>
            ) : members.length === 0 ? (
              <p className="text-caption text-muted-stone">No members.</p>
            ) : (
              <ul className="flex flex-col divide-y divide-ink/5">
                {members.map((m) => (
                  <li key={m.userId} className="flex items-center justify-between py-2.5">
                    <span className="text-body text-ink">{m.email}</span>
                    <Badge tone="role">{m.role}</Badge>
                  </li>
                ))}
              </ul>
            )}
          </div>
        ) : null}
      </div>
    </Card>
  );
}

/* ----------------------------------------------------------------- atoms -- */

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between">
      <span className="text-caption text-muted-stone">{label}</span>
      <span className="text-body text-ink">{value}</span>
    </div>
  );
}

function Badge({ children, tone = "kind" }: { children: React.ReactNode; tone?: "kind" | "role" }) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-pill px-2.5 py-0.5 text-caption capitalize",
        tone === "kind" ? "bg-fog text-muted-stone" : "bg-warm-mist text-terracotta",
      )}
    >
      {children}
    </span>
  );
}
