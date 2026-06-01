"use client";

import { useSyncExternalStore } from "react";

// Never emits — the snapshot value is constant per environment.
const noopSubscribe = () => () => {};

/**
 * Returns `false` during SSR and the first client render, then `true` once
 * hydrated. Use to gate UI that depends on persisted client state (e.g. the
 * auth token) so server markup matches the first client render and we avoid
 * hydration mismatches. Implemented with `useSyncExternalStore` so it stays
 * SSR-safe without a setState-in-effect.
 */
export function useHydrated(): boolean {
  return useSyncExternalStore(
    noopSubscribe,
    () => true,
    () => false,
  );
}
