import { PermissionState, RiderProfile } from "@/types/auth";
import { LeaderMusicState } from "@/types/domain";
import { MusicSyncSnapshot } from "@/types/music";
import { FeatureFlags, ReliabilitySnapshot, RuntimePreferences } from "@/types/runtime";
import { VoiceSessionSnapshot } from "@/types/voice";

export type ThemeMode = "system" | "light" | "dark";

export const defaultProfile: RiderProfile = {
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

export const defaultPermissions: PermissionState = {
  location: "unknown",
  microphone: "unknown",
  notifications: "unknown",
  audio: "unknown"
};

export const seededMusic: LeaderMusicState = {
  isPlaying: true,
  track: "Northern Pass",
  artist: "Signal / Line",
  elapsedSeconds: 96
};

export const defaultMusicSync: MusicSyncSnapshot = {
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

export const defaultVoiceSession: VoiceSessionSnapshot = {
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

export const defaultRuntimePreferences: RuntimePreferences = {
  batterySaverMode: false,
  reducedGpsCadence: false
};

export const defaultFeatureFlags: FeatureFlags = {
  experimentalCrashDetection: true,
  voiceLeaderAnnounce: true,
  musicSyncDiagnostics: true,
  developerDiagnostics: true
};

export const defaultReliability: ReliabilitySnapshot = {
  connectivity: "online",
  recoveryState: "idle",
  lastRoomSyncAt: null,
  lastRecoveryAt: null,
  lastRecoveryError: null
};
