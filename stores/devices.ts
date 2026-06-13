/**
 * Devices store — the canonical example of the resource-slice pattern.
 *
 * Devices are stored normalized (keyed by id) so any view can read a single
 * device in O(1) and a mutation updates exactly one place. Actions call the
 * `devices` resource wrappers (pure transport) and fold results into state.
 * `updateDevice` shows the optimistic-update + rollback shape that gives the
 * UI its snappy feel — apply locally first, reconcile or revert on the result.
 *
 * Note: high-volume time-series (readings/events) deliberately do NOT live
 * here. Fetch those per-view; keeping the store to bounded, relational
 * resources is what keeps it fast.
 */
"use client";

import { create } from "zustand";
import { devices as devicesApi, type Device } from "@/lib/api";
import type { ListDevicesQuery } from "@/lib/api/resources/devices";
import type { Schemas } from "@/lib/api/types";

interface DevicesState {
  /** Normalized device records, keyed by device id. */
  byId: Record<string, Device>;
  /** Insertion/most-recent fetch order for stable list rendering. */
  allIds: string[];
  status: "idle" | "loading" | "error";
  /** True once the first list fetch has resolved (distinguishes "not yet
   *  loaded" from "loaded, genuinely empty" — avoids an empty-state flash). */
  loaded: boolean;
  error: string | null;

  /** Selector: devices as an ordered array. */
  list: () => Device[];

  fetchAll: (query?: ListDevicesQuery) => Promise<void>;
  fetchOne: (deviceId: string) => Promise<Device>;
  /** Register a device; returns the one-time plaintext secret to surface once. */
  register: (body: Schemas["RegisterDeviceBody"]) => Promise<string>;
  rename: (deviceId: string, name: string) => Promise<void>;
  remove: (deviceId: string) => Promise<void>;
}

export const useDevicesStore = create<DevicesState>((set, get) => ({
  byId: {},
  allIds: [],
  status: "idle",
  loaded: false,
  error: null,

  list: () => {
    const { byId, allIds } = get();
    return allIds.map((id) => byId[id]);
  },

  fetchAll: async (query) => {
    set({ status: "loading", error: null });
    try {
      const { data } = await devicesApi.listDevices(query);
      set({
        byId: Object.fromEntries(data.map((d) => [d.id, d])),
        allIds: data.map((d) => d.id),
        status: "idle",
        loaded: true,
      });
    } catch (err) {
      set({ status: "error", error: errorMessage(err) });
      throw err;
    }
  },

  fetchOne: async (deviceId) => {
    const device = await devicesApi.getDevice(deviceId);
    set((s) => ({
      byId: { ...s.byId, [device.id]: device },
      allIds: s.allIds.includes(device.id) ? s.allIds : [...s.allIds, device.id],
    }));
    return device;
  },

  register: async (body) => {
    // Response carries the device plus a one-time `secret`. Keep the device in
    // state; hand the secret back to the caller to show once (never stored).
    const { secret, ...device } = await devicesApi.registerDevice(body);
    set((s) => ({
      byId: { ...s.byId, [device.id]: device },
      allIds: s.allIds.includes(device.id) ? s.allIds : [device.id, ...s.allIds],
    }));
    return secret;
  },

  rename: async (deviceId, name) => {
    const previous = get().byId[deviceId];
    // Optimistic: reflect the new name immediately.
    set((s) => ({ byId: { ...s.byId, [deviceId]: { ...s.byId[deviceId], name } } }));
    try {
      const updated = await devicesApi.updateDevice(deviceId, { name });
      // Reconcile with the server's authoritative record.
      set((s) => ({ byId: { ...s.byId, [deviceId]: updated } }));
    } catch (err) {
      // Roll back to the pre-edit snapshot.
      if (previous) set((s) => ({ byId: { ...s.byId, [deviceId]: previous } }));
      throw err;
    }
  },

  remove: async (deviceId) => {
    await devicesApi.deleteDevice(deviceId);
    set((s) => {
      const byId = { ...s.byId };
      delete byId[deviceId];
      return { byId, allIds: s.allIds.filter((id) => id !== deviceId) };
    });
  },
}));

function errorMessage(err: unknown): string {
  return err instanceof Error ? err.message : "Something went wrong";
}
