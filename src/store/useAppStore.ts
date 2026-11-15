import AsyncStorage from "@react-native-async-storage/async-storage";
import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";

import { createAuthSlice } from "./slices/authSlice";
import { createMusicSlice } from "./slices/musicSlice";
import { createPermissionsSlice } from "./slices/permissionsSlice";
import { createProfileSlice } from "./slices/profileSlice";
import { createReliabilitySlice } from "./slices/reliabilitySlice";
import { createRoomSlice } from "./slices/roomSlice";
import { createRuntimeSlice } from "./slices/runtimeSlice";
import { createVoiceSlice } from "./slices/voiceSlice";
import { AppState } from "./types";

export const useAppStore = create<AppState>()(
  persist(
    (...a) => ({
      ...createAuthSlice(...a),
      ...createProfileSlice(...a),
      ...createPermissionsSlice(...a),
      ...createRoomSlice(...a),
      ...createReliabilitySlice(...a),
      ...createRuntimeSlice(...a),
      ...createMusicSlice(...a),
      ...createVoiceSlice(...a)
    }),
    {
      name: "ridesync-app-store",
      storage: createJSONStorage(() => AsyncStorage),
      // Persisted whitelist is intentionally unchanged from the pre-slice store
      // so existing hydrated data (same storage key) keeps working without a
      // migration.
      partialize: (state) => ({
        themeMode: state.themeMode,
        hasSeenOnboarding: state.hasSeenOnboarding,
        profile: state.profile,
        permissions: state.permissions,
        pendingJoinCode: state.pendingJoinCode,
        lastActiveRoomId: state.lastActiveRoomId,
        runtimePreferences: state.runtimePreferences,
        featureFlags: state.featureFlags,
        reliability: {
          ...state.reliability,
          recoveryState: "idle"
        },
        messageReadAtByRoom: state.messageReadAtByRoom
      })
    }
  )
);

// Back-compat re-exports: these pure helpers were previously defined in this
// module and are imported from here across the app.
export { deriveInitials, isProfileComplete, hasCorePermissions } from "./selectors";
export type { AppState } from "./types";
