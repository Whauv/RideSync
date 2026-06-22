export type VoiceProvider = "livekit" | "agora";

export type VoiceConnectionState = "idle" | "connecting" | "connected" | "reconnecting" | "degraded" | "error";

export type VoiceNetworkQuality = "excellent" | "good" | "poor";

export interface VoiceParticipantState {
  memberId: string;
  userId: string;
  riderName: string;
  role: "leader" | "tail" | "rider";
  isSpeaking: boolean;
  isMuted: boolean;
  networkQuality: VoiceNetworkQuality;
}

export interface VoiceDeviceStatus {
  inputLabel: string;
  outputLabel: string;
  bluetoothConnected: boolean;
  backgroundProtected: boolean;
}

export interface VoiceSessionSnapshot {
  provider: VoiceProvider;
  roomId: string | null;
  connectionState: VoiceConnectionState;
  networkQuality: VoiceNetworkQuality;
  selfMuted: boolean;
  poorNetwork: boolean;
  leaderAnnounceRequested: boolean;
  deviceStatus: VoiceDeviceStatus;
  activeSpeakerIds: string[];
  errorMessage: string | null;
}

export interface VoiceConnectOptions {
  provider: VoiceProvider;
  roomId: string;
  roomCode: string;
  currentUserId: string;
}

export interface VoiceRosterMember {
  memberId: string;
  userId: string;
  riderName: string;
  role: "leader" | "tail" | "rider";
  connected: boolean;
}
