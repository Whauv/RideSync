import { StateCreator } from "zustand";

import { AuthIdentity } from "@/types/auth";

import {
  defaultFeatureFlags,
  defaultMusicSync,
  defaultPermissions,
  defaultReliability,
  defaultRuntimePreferences,
  defaultVoiceSession
} from "../defaults";
import { AppState } from "../types";

export interface AuthSlice {
  authBootstrapped: boolean;
  authIdentity: AuthIdentity | null;
  hasSeenOnboarding: boolean;
  setAuthBootstrapped: (value: boolean) => void;
  setAuthIdentity: (identity: AuthIdentity) => void;
  clearAuthIdentity: () => void;
  completeOnboarding: () => void;
  signOutLocal: () => void;
}

export const createAuthSlice: StateCreator<AppState, [], [], AuthSlice> = (set) => ({
  authBootstrapped: false,
  authIdentity: null,
  hasSeenOnboarding: false,
  setAuthBootstrapped: (value) => set({ authBootstrapped: value }),
  setAuthIdentity: (identity) => set({ authIdentity: identity }),
  clearAuthIdentity: () => set({ authIdentity: null }),
  completeOnboarding: () => set({ hasSeenOnboarding: true }),
  // Signing out clears everything session-scoped across slices. `set` is typed
  // over the whole AppState, so a single flat reset keeps the slices decoupled.
  signOutLocal: () =>
    set({
      authIdentity: null,
      pendingJoinCode: null,
      activeRoom: null,
      roomMembers: [],
      riders: [],
      rideLayers: [],
      messages: [],
      activeAlert: null,
      ridePlan: null,
      safety: null,
      lastActiveRoomId: null,
      permissions: defaultPermissions,
      runtimePreferences: defaultRuntimePreferences,
      featureFlags: defaultFeatureFlags,
      reliability: defaultReliability,
      musicSync: defaultMusicSync,
      voiceSession: defaultVoiceSession,
      voiceParticipants: {},
      messageReadAtByRoom: {}
    })
});
