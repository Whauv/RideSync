import { PermissionState, RiderProfile } from "@/types/auth";

import { defaultProfile } from "./defaults";

/**
 * Pure, store-agnostic helpers for deriving values from app state.
 *
 * These were previously co-located inside `useAppStore.ts`. Keeping them here
 * lets screens and the store's own slices share them without creating a cycle,
 * and keeps them trivially unit-testable.
 */

export function deriveInitials(name: string) {
  const parts = name
    .trim()
    .split(" ")
    .filter(Boolean)
    .slice(0, 2);

  if (parts.length === 0) {
    return "RS";
  }

  return parts.map((part) => part[0]?.toUpperCase() ?? "").join("");
}

export function normalizeProfile(profile: Partial<RiderProfile>): RiderProfile {
  return {
    ...defaultProfile,
    ...profile,
    emergencyContact: {
      ...defaultProfile.emergencyContact,
      ...profile.emergencyContact
    },
    medicalProfile: {
      ...defaultProfile.medicalProfile,
      ...profile.medicalProfile
    },
    avatarInitials: deriveInitials(profile.riderName ?? defaultProfile.riderName)
  };
}

export function isProfileComplete(profile: RiderProfile) {
  return Boolean(
    profile.riderName.trim() &&
      profile.bikeName.trim() &&
      profile.emergencyContact.name.trim() &&
      profile.emergencyContact.phone.trim() &&
      profile.preferredUnits
  );
}

export function hasCorePermissions(state: PermissionState) {
  return (
    state.location === "granted" &&
    state.microphone === "granted" &&
    state.audio === "granted" &&
    state.notifications !== "unknown"
  );
}
