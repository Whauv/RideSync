import { StateCreator } from "zustand";

import { ReliabilitySnapshot } from "@/types/runtime";

import { defaultReliability } from "../defaults";
import { AppState } from "../types";

export interface ReliabilitySlice {
  reliability: ReliabilitySnapshot;
  setConnectivityState: (connectivity: ReliabilitySnapshot["connectivity"]) => void;
  setRecoveryState: (
    recoveryState: ReliabilitySnapshot["recoveryState"],
    options?: { lastRecoveryAt?: string | null; lastRecoveryError?: string | null }
  ) => void;
  markRoomSynced: (timestamp?: string) => void;
}

export const createReliabilitySlice: StateCreator<AppState, [], [], ReliabilitySlice> = (set) => ({
  reliability: defaultReliability,
  setConnectivityState: (connectivity) =>
    set((state) => ({
      reliability: {
        ...state.reliability,
        connectivity
      }
    })),
  setRecoveryState: (recoveryState, options) =>
    set((state) => ({
      reliability: {
        ...state.reliability,
        recoveryState,
        lastRecoveryAt: options?.lastRecoveryAt ?? state.reliability.lastRecoveryAt,
        lastRecoveryError:
          options?.lastRecoveryError === undefined ? state.reliability.lastRecoveryError : options.lastRecoveryError
      }
    })),
  markRoomSynced: (timestamp) =>
    set((state) => ({
      reliability: {
        ...state.reliability,
        lastRoomSyncAt: timestamp ?? new Date().toISOString(),
        lastRecoveryError: null
      }
    }))
});
