/**
 * Accounts store — normalized account slice plus the per-account member list.
 * Follows the devices-store pattern: actions call the `accounts` resource and
 * fold results into state, with optimistic rename + rollback.
 */
"use client";

import { create } from "zustand";
import { accounts as accountsApi, type Account } from "@/lib/api";
import type { Schemas } from "@/lib/api/types";

type Member = Schemas["MemberView"];

interface AccountsState {
  byId: Record<string, Account>;
  allIds: string[];
  /** Members keyed by account id (loaded on demand). */
  membersByAccount: Record<string, Member[]>;
  status: "idle" | "loading" | "error";
  error: string | null;

  list: () => Account[];

  fetchAll: () => Promise<void>;
  rename: (accountId: string, name: string) => Promise<void>;
  fetchMembers: (accountId: string) => Promise<void>;
}

export const useAccountsStore = create<AccountsState>((set, get) => ({
  byId: {},
  allIds: [],
  membersByAccount: {},
  status: "idle",
  error: null,

  list: () => {
    const { byId, allIds } = get();
    return allIds.map((id) => byId[id]);
  },

  fetchAll: async () => {
    set({ status: "loading", error: null });
    try {
      const { data } = await accountsApi.listAccounts();
      set({
        byId: Object.fromEntries(data.map((a) => [a.id, a])),
        allIds: data.map((a) => a.id),
        status: "idle",
      });
    } catch (err) {
      set({ status: "error", error: errorMessage(err) });
      throw err;
    }
  },

  rename: async (accountId, name) => {
    const previous = get().byId[accountId];
    set((s) => ({ byId: { ...s.byId, [accountId]: { ...s.byId[accountId], name } } }));
    try {
      const updated = await accountsApi.updateAccount(accountId, { name });
      set((s) => ({ byId: { ...s.byId, [accountId]: updated } }));
    } catch (err) {
      if (previous) set((s) => ({ byId: { ...s.byId, [accountId]: previous } }));
      throw err;
    }
  },

  fetchMembers: async (accountId) => {
    const { data } = await accountsApi.listMembers(accountId);
    set((s) => ({ membersByAccount: { ...s.membersByAccount, [accountId]: data } }));
  },
}));

function errorMessage(err: unknown): string {
  return err instanceof Error ? err.message : "Something went wrong";
}
