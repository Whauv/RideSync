import AsyncStorage from "@react-native-async-storage/async-storage";
import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";

import { AuthIdentity, PermissionState, RiderProfile } from "@/types/auth";
import { LeaderMusicState, PresenceState, RideAlertState, RideLayerMarker, RideMessage, RideRoom, RiderPresence, RoomMember } from "@/types/domain";
import { VoiceParticipantState, VoiceSessionSnapshot } from "@/types/voice";

type ThemeMode = "system" | "light" | "dark";

const defaultProfile: RiderProfile = {
  riderName: "",
  bikeName: "",
  avatarInitials: "RS",
  emergencyContact: {
    name: "",
    phone: ""
  },
  preferredUnits: "imperial",
  bikeBrand: "",
  intercomBrand: ""
};

const defaultPermissions: PermissionState = {
  location: "unknown",
  microphone: "unknown",
  notifications: "unknown",
  audio: "unknown"
};

const seededMusic: LeaderMusicState = {
  isPlaying: true,
  track: "Northern Pass",
  artist: "Signal / Line",
  elapsedSeconds: 96
};

const defaultVoiceSession: VoiceSessionSnapshot = {
  provider: "livekit",
  roomId: null,
  connectionState: "idle",
  networkQuality: "good",
  selfMuted: false,
  poorNetwork: false,
  leaderAnnounceRequested: false,
  deviceStatus: {
    inputLabel: "Helmet mic",
    outputLabel: "Bluetooth intercom",
    bluetoothConnected: true,
    backgroundProtected: false
  },
  activeSpeakerIds: [],
  errorMessage: null
};

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

interface AppState {
  themeMode: ThemeMode;
  authBootstrapped: boolean;
  authIdentity: AuthIdentity | null;
  hasSeenOnboarding: boolean;
  profile: RiderProfile;
  permissions: PermissionState;
  pendingJoinCode: string | null;
  activeRoom: RideRoom | null;
  roomMembers: RoomMember[];
  roomPresenceState: PresenceState;
  riders: RiderPresence[];
  rideLayers: RideLayerMarker[];
  messages: RideMessage[];
  activeAlert: RideAlertState | null;
  messageReadAtByRoom: Record<string, string | null>;
  leaderMusic: LeaderMusicState;
  voiceSession: VoiceSessionSnapshot;
  voiceParticipants: Record<string, VoiceParticipantState>;
  setThemeMode: (themeMode: ThemeMode) => void;
  setAuthBootstrapped: (value: boolean) => void;
  setAuthIdentity: (identity: AuthIdentity) => void;
  clearAuthIdentity: () => void;
  completeOnboarding: () => void;
  mergeProfile: (profile: Partial<RiderProfile>) => void;
  replaceProfile: (profile: RiderProfile) => void;
  updatePermission: (key: keyof PermissionState, value: PermissionState[keyof PermissionState]) => void;
  resetPermissions: () => void;
  setPendingJoinCode: (code: string | null) => void;
  setRoomSession: (
    room: RideRoom,
    members: RoomMember[],
    riders: RiderPresence[],
    layers: RideLayerMarker[],
    messages: RideMessage[],
    activeAlert: RideAlertState | null
  ) => void;
  clearRoomSession: () => void;
  setRoomPresenceState: (presenceState: PresenceState) => void;
  setRiders: (riders: RiderPresence[]) => void;
  markRoomMessagesRead: (roomId: string, lastReadAt?: string) => void;
  setVoiceSnapshot: (
    voiceSession: VoiceSessionSnapshot,
    voiceParticipants: Record<string, VoiceParticipantState>
  ) => void;
  resetVoiceState: () => void;
  postMessage: (message: RideMessage) => void;
  signOutLocal: () => void;
}

export const useAppStore = create<AppState>()(
  persist(
    (set) => ({
      themeMode: "system",
      authBootstrapped: false,
      authIdentity: null,
      hasSeenOnboarding: false,
      profile: defaultProfile,
      permissions: defaultPermissions,
      pendingJoinCode: null,
      activeRoom: null,
      roomMembers: [],
      roomPresenceState: "connected",
      riders: [],
      rideLayers: [],
      messages: [],
      activeAlert: null,
      messageReadAtByRoom: {},
      leaderMusic: seededMusic,
      voiceSession: defaultVoiceSession,
      voiceParticipants: {},
      setThemeMode: (themeMode) => set({ themeMode }),
      setAuthBootstrapped: (value) => set({ authBootstrapped: value }),
      setAuthIdentity: (identity) => set({ authIdentity: identity }),
      clearAuthIdentity: () => set({ authIdentity: null }),
      completeOnboarding: () => set({ hasSeenOnboarding: true }),
      mergeProfile: (profile) =>
        set((state) => ({
          profile: {
            ...state.profile,
            ...profile,
            emergencyContact: {
              ...state.profile.emergencyContact,
              ...profile.emergencyContact
            },
            avatarInitials: deriveInitials(profile.riderName ?? state.profile.riderName)
          }
        })),
      replaceProfile: (profile) =>
        set({
          profile: {
            ...profile,
            avatarInitials: deriveInitials(profile.riderName)
          }
        }),
      updatePermission: (key, value) =>
        set((state) => ({
          permissions: {
            ...state.permissions,
            [key]: value
          }
        })),
      resetPermissions: () => set({ permissions: defaultPermissions }),
      setPendingJoinCode: (code) => set({ pendingJoinCode: code }),
      setRoomSession: (room, members, riders, layers, messages, activeAlert) =>
        set({
          activeRoom: room,
          roomMembers: members,
          riders,
          rideLayers: layers,
          messages,
          activeAlert
        }),
      clearRoomSession: () =>
        set({
          activeRoom: null,
          roomMembers: [],
          riders: [],
          rideLayers: [],
          messages: [],
          activeAlert: null
        }),
      setRoomPresenceState: (roomPresenceState) => set({ roomPresenceState }),
      setRiders: (riders) => set({ riders }),
      markRoomMessagesRead: (roomId, lastReadAt) =>
        set((state) => ({
          messageReadAtByRoom: {
            ...state.messageReadAtByRoom,
            [roomId]: lastReadAt ?? new Date().toISOString()
          }
        })),
      setVoiceSnapshot: (voiceSession, voiceParticipants) =>
        set({
          voiceSession,
          voiceParticipants
        }),
      resetVoiceState: () =>
        set({
          voiceSession: defaultVoiceSession,
          voiceParticipants: {}
        }),
      postMessage: (message) =>
        set((state) => ({
          messages: [message, ...state.messages]
        })),
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
          permissions: defaultPermissions,
          voiceSession: defaultVoiceSession,
          voiceParticipants: {},
          messageReadAtByRoom: {}
        })
    }),
    {
      name: "ridesync-app-store",
      storage: createJSONStorage(() => AsyncStorage),
      partialize: (state) => ({
        themeMode: state.themeMode,
        hasSeenOnboarding: state.hasSeenOnboarding,
        profile: state.profile,
        permissions: state.permissions,
        pendingJoinCode: state.pendingJoinCode,
        messageReadAtByRoom: state.messageReadAtByRoom
      })
    }
  )
);
