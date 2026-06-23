import AsyncStorage from "@react-native-async-storage/async-storage";
import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";

import { AuthIdentity, PermissionState, RiderProfile } from "@/types/auth";
import {
  LeaderMusicState,
  PresenceState,
  RideAlertState,
  RideLayerMarker,
  RideMessage,
  RidePlan,
  RideRoom,
  RiderPresence,
  RoomMember,
  SafetySnapshot
} from "@/types/domain";
import { MusicSyncSnapshot } from "@/types/music";
import { FeatureFlags, ReliabilitySnapshot, RuntimePreferences } from "@/types/runtime";
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
  intercomBrand: "",
  medicalProfile: {
    bloodType: "",
    allergies: "",
    conditions: "",
    medications: "",
    notes: "",
    shareWithRideLeaders: true
  }
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

const defaultMusicSync: MusicSyncSnapshot = {
  provider: "simulation",
  transportMode: "metadata_sync",
  roomId: null,
  leaderUserId: null,
  localUserId: null,
  canControl: false,
  queue: [
    {
      id: "track-northern-pass",
      title: "Northern Pass",
      artist: "Signal / Line",
      album: "Open Asphalt",
      durationMs: 248000,
      artworkToken: "northern-pass",
      sourceType: "simulation"
    }
  ],
  currentIndex: 0,
  currentTrackId: "track-northern-pass",
  playbackState: "paused",
  elapsedMs: 96000,
  anchorEpochMs: null,
  anchorPositionMs: 96000,
  queueVersion: 1,
  commandRevision: 0,
  lastCommandAt: null,
  syncHealth: "tight",
  resyncState: "idle",
  driftMs: 0,
  deviceLagMs: 80,
  lagCompensationMs: 0,
  localMixPct: 72,
  integrationReady: false,
  constraintNote: "Simulation only until a licensed provider adapter is configured."
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

const defaultRuntimePreferences: RuntimePreferences = {
  batterySaverMode: false,
  reducedGpsCadence: false
};

const defaultFeatureFlags: FeatureFlags = {
  experimentalCrashDetection: true,
  voiceLeaderAnnounce: true,
  musicSyncDiagnostics: true,
  developerDiagnostics: true
};

const defaultReliability: ReliabilitySnapshot = {
  connectivity: "online",
  recoveryState: "idle",
  lastRoomSyncAt: null,
  lastRecoveryAt: null,
  lastRecoveryError: null
};

function normalizeProfile(profile: Partial<RiderProfile>): RiderProfile {
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
  ridePlan: RidePlan | null;
  safety: SafetySnapshot | null;
  lastActiveRoomId: string | null;
  runtimePreferences: RuntimePreferences;
  featureFlags: FeatureFlags;
  reliability: ReliabilitySnapshot;
  messageReadAtByRoom: Record<string, string | null>;
  leaderMusic: LeaderMusicState;
  musicSync: MusicSyncSnapshot;
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
    activeAlert: RideAlertState | null,
    ridePlan: RidePlan | null,
    safety: SafetySnapshot
  ) => void;
  clearRoomSession: () => void;
  setRoomPresenceState: (presenceState: PresenceState) => void;
  setRideTelemetry: (riders: RiderPresence[], safety: SafetySnapshot) => void;
  setRuntimePreferences: (preferences: Partial<RuntimePreferences>) => void;
  setFeatureFlag: <K extends keyof FeatureFlags>(key: K, value: FeatureFlags[K]) => void;
  setConnectivityState: (connectivity: ReliabilitySnapshot["connectivity"]) => void;
  setRecoveryState: (
    recoveryState: ReliabilitySnapshot["recoveryState"],
    options?: { lastRecoveryAt?: string | null; lastRecoveryError?: string | null }
  ) => void;
  markRoomSynced: (timestamp?: string) => void;
  markRoomMessagesRead: (roomId: string, lastReadAt?: string) => void;
  setMusicSyncSnapshot: (snapshot: MusicSyncSnapshot) => void;
  resetMusicSync: () => void;
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
      ridePlan: null,
      safety: null,
      lastActiveRoomId: null,
      runtimePreferences: defaultRuntimePreferences,
      featureFlags: defaultFeatureFlags,
      reliability: defaultReliability,
      messageReadAtByRoom: {},
      leaderMusic: seededMusic,
      musicSync: defaultMusicSync,
      voiceSession: defaultVoiceSession,
      voiceParticipants: {},
      setThemeMode: (themeMode) => set({ themeMode }),
      setAuthBootstrapped: (value) => set({ authBootstrapped: value }),
      setAuthIdentity: (identity) => set({ authIdentity: identity }),
      clearAuthIdentity: () => set({ authIdentity: null }),
      completeOnboarding: () => set({ hasSeenOnboarding: true }),
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
      setRoomSession: (room, members, riders, layers, messages, activeAlert, ridePlan, safety) =>
        set({
          activeRoom: room,
          roomMembers: members,
          riders,
          rideLayers: layers,
          messages,
          activeAlert,
          ridePlan,
          safety,
          lastActiveRoomId: room.id,
          reliability: {
            ...defaultReliability,
            ...defaultReliability,
            connectivity: "online",
            recoveryState: "restored",
            lastRoomSyncAt: new Date().toISOString(),
            lastRecoveryAt: new Date().toISOString(),
            lastRecoveryError: null
          }
        }),
      clearRoomSession: () =>
        set({
          activeRoom: null,
          roomMembers: [],
          riders: [],
          rideLayers: [],
          messages: [],
          activeAlert: null,
          ridePlan: null,
          safety: null
        }),
      setRoomPresenceState: (roomPresenceState) => set({ roomPresenceState }),
      setRideTelemetry: (riders, safety) => set({ riders, safety }),
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
        })),
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
        })),
      markRoomMessagesRead: (roomId, lastReadAt) =>
        set((state) => ({
          messageReadAtByRoom: {
            ...state.messageReadAtByRoom,
            [roomId]: lastReadAt ?? new Date().toISOString()
          }
        })),
      setMusicSyncSnapshot: (musicSync) => set({ musicSync }),
      resetMusicSync: () => set({ musicSync: defaultMusicSync }),
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
