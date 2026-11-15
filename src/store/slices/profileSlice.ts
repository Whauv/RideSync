import { StateCreator } from "zustand";

import { RiderProfile } from "@/types/auth";

import { defaultProfile } from "../defaults";
import { normalizeProfile } from "../selectors";
import { AppState } from "../types";

export interface ProfileSlice {
  profile: RiderProfile;
  mergeProfile: (profile: Partial<RiderProfile>) => void;
  replaceProfile: (profile: RiderProfile) => void;
}

export const createProfileSlice: StateCreator<AppState, [], [], ProfileSlice> = (set) => ({
  profile: defaultProfile,
  mergeProfile: (profile) =>
    set((state) => ({
      profile: normalizeProfile({
        ...state.profile,
        ...profile,
        emergencyContact: {
          ...state.profile.emergencyContact,
          ...profile.emergencyContact
        },
        medicalProfile: {
          ...state.profile.medicalProfile,
          ...profile.medicalProfile
        }
      })
    })),
  replaceProfile: (profile) =>
    set({
      profile: normalizeProfile(profile)
    })
});
