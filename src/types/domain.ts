export type RideStatus = "staged" | "rolling" | "fuel" | "hazard" | "offline";

export type RiderRole = "leader" | "tail" | "rider";

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
  destination: string;
  leaderId: string;
  startedAt: string;
  riderCount: number;
  voiceProvider: "livekit" | "agora";
  musicTrack: string;
  etaMinutes: number;
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
  code: string;
  displayName: string;
}

export interface LeaderMusicState {
  isPlaying: boolean;
  track: string;
  artist: string;
  elapsedSeconds: number;
}
