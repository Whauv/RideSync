export type RideStatus = "staged" | "rolling" | "fuel" | "hazard" | "offline";

export type RiderRole = "leader" | "tail" | "rider";
export type RoomPrivacyMode = "invite_only" | "approval_required";
export type RoomLifecycle = "lobby" | "rolling";
export type MemberApprovalStatus = "approved" | "pending";
export type MemberReadiness = "ready" | "review";
export type PresenceState = "connected" | "reconnecting" | "offline";
export type IntercomState = "connected" | "not_connected";

export interface RiderPresence {
  id: string;
  name: string;
  role: RiderRole;
  bike: string;
  speedMph: number;
  headingDeg: number;
  status: RideStatus;
  isTalking: boolean;
  hasMusicSync: boolean;
  batteryPct: number;
  lat: number;
  lng: number;
}

export interface RideRoom {
  id: string;
  code: string;
  title: string;
  routeTitle?: string;
  leaderId: string;
  privacyMode: RoomPrivacyMode;
  maxRiders: number;
  locked: boolean;
  lifecycle: RoomLifecycle;
  inviteLink: string;
  createdAt: string;
  startedAt?: string;
  riderCount: number;
  voiceProvider: "livekit" | "agora";
  musicTrack?: string;
  etaMinutes?: number;
}

export interface RoomMember {
  id: string;
  userId: string;
  riderName: string;
  avatarInitials: string;
  bikeName: string;
  role: RiderRole;
  approvalStatus: MemberApprovalStatus;
  readiness: MemberReadiness;
  presenceState: PresenceState;
  intercomState: IntercomState;
  joinedAt: string;
  lastSeenAt: string;
}

export interface CreateRoomInput {
  roomName: string;
  privacyMode: RoomPrivacyMode;
  routeTitle?: string;
  maxRiders: number;
}

export interface RideMessage {
  id: string;
  senderId: string;
  senderName: string;
  sentAt: string;
  kind: "message" | "ping" | "sos" | "system";
  body: string;
}

export interface RoomJoinPayload {
  value: string;
}

export interface RideRoomSnapshot {
  room: RideRoom;
  members: RoomMember[];
  riders: RiderPresence[];
  messages: RideMessage[];
}

export interface LeaderMusicState {
  isPlaying: boolean;
  track: string;
  artist: string;
  elapsedSeconds: number;
}
