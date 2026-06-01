/**
 * Auth store — owns the session: the JWT and the current user. It is the
 * single source of truth for "am I logged in", and keeps the API client's
 * bearer token in sync via `setApiToken`.
 *
 * The token is persisted to localStorage so sessions survive reloads; on
 * rehydrate we re-arm the client before any resource call can fire.
 */
"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";
import { auth, setApiToken, type User } from "@/lib/api";

interface AuthState {
  token: string | null;
  user: User | null;
  status: "idle" | "loading" | "error";
  error: string | null;

  login: (email: string, password: string) => Promise<void>;
  register: (email: string, password: string) => Promise<void>;
  logout: () => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      token: null,
      user: null,
      status: "idle",
      error: null,

      login: async (email, password) => {
        set({ status: "loading", error: null });
        try {
          const { token, user } = await auth.login({ email, password });
          setApiToken(token);
          set({ token, user, status: "idle" });
        } catch (err) {
          set({ status: "error", error: errorMessage(err) });
          throw err;
        }
      },

      register: async (email, password) => {
        set({ status: "loading", error: null });
        try {
          const { token, user } = await auth.register({ email, password });
          setApiToken(token);
          set({ token, user, status: "idle" });
        } catch (err) {
          set({ status: "error", error: errorMessage(err) });
          throw err;
        }
      },

      logout: () => {
        setApiToken(null);
        set({ token: null, user: null, status: "idle", error: null });
      },
    }),
    {
      name: "catarina.auth",
      // Only persist the session itself, not transient request status.
      partialize: (s) => ({ token: s.token, user: s.user }),
      // Re-arm the API client with the rehydrated token on load.
      onRehydrateStorage: () => (state) => {
        if (state?.token) setApiToken(state.token);
      },
    },
  ),
);

function errorMessage(err: unknown): string {
  return err instanceof Error ? err.message : "Something went wrong";
}
