/**
 * Crops store — the global crop catalog plus per-crop target ranges, cached by
 * crop id. Crops are bounded reference data, so they fit the Zustand-as-cache
 * pattern (unlike high-volume readings).
 */
"use client";

import { create } from "zustand";
import { crops as cropsApi, type Crop } from "@/lib/api";
import type { Schemas } from "@/lib/api/types";

type Target = Schemas["CropTargetView"];

interface CropsState {
  list: Crop[];
  targetsById: Record<string, Target[]>;
  fetchList: () => Promise<void>;
  fetchTargets: (cropId: string) => Promise<void>;
}

export const useCropsStore = create<CropsState>((set, get) => ({
  list: [],
  targetsById: {},

  fetchList: async () => {
    if (get().list.length > 0) return;
    const { data } = await cropsApi.listCrops();
    set({ list: data });
  },

  fetchTargets: async (cropId) => {
    if (get().targetsById[cropId]) return;
    const crop = await cropsApi.getCrop(cropId);
    set((s) => ({ targetsById: { ...s.targetsById, [cropId]: crop.targets } }));
  },
}));
