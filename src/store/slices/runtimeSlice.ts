import { StateCreator } from "zustand";

import { FeatureFlags, RuntimePreferences } from "@/types/runtime";

import { ThemeMode, defaultFeatureFlags, defaultRuntimePreferences } from "../defaults";
import { AppState } from "../types";

export interface RuntimeSlice {
  themeMode: ThemeMode;
  runtimePreferences: RuntimePreferences;
  featureFlags: FeatureFlags;
  setThemeMode: (themeMode: ThemeMode) => void;
  setRuntimePreferences: (preferences: Partial<RuntimePreferences>) => void;
  setFeatureFlag: <K extends keyof FeatureFlags>(key: K, value: FeatureFlags[K]) => void;
}

export const createRuntimeSlice: StateCreator<AppState, [], [], RuntimeSlice> = (set) => ({
  themeMode: "system",
  runtimePreferences: defaultRuntimePreferences,
  featureFlags: defaultFeatureFlags,
  setThemeMode: (themeMode) => set({ themeMode }),
  setRuntimePreferences: (preferences) =>
    set((state) => ({
      runtimePreferences: {
        ...state.runtimePreferences,
        ...preferences
      }
    })),
  setFeatureFlag: (key, value) =>
    set((state) => ({
      featureFlags: {
        ...state.featureFlags,
        [key]: value
      }
    }))
});
