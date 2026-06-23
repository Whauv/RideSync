export type RideStatus = "staged" | "rolling" | "fuel" | "hazard" | "offline";

export type RiderRole = "leader" | "tail" | "rider";
export type RoomPrivacyMode = "invite_only" | "approval_required";
export type RoomLifecycle = "lobby" | "rolling";
export type MemberApprovalStatus = "approved" | "pending";
export type MemberReadiness = "ready" | "review";
export type PresenceState = "connected" | "reconnecting" | "offline";
export type IntercomState = "connected" | "not_connected";
export type RiderSignalState = "strong" | "moderate" | "weak";
export type RideLayerType = "regroup" | "hazard" | "fuel" | "emergency";
export type RideMapMode = "day" | "night" | "focus";
export type QuickPingType = "pull_over" | "fuel_stop" | "need_break" | "hazard" | "regroup" | "all_good" | "emergency";
export type RideAlertStatus = "active" | "resolved";
export type RideStopType = "fuel" | "food" | "scenic" | "break" | "emergency_fallback";
export type RouteImportType = "gpx_reference" | "route_reference";
export type RiderRsvpStatus = "pending" | "going" | "late" | "cant_make_it";
export type HazardSeverity = "advisory" | "caution" | "critical";
export type HazardReportStatus = "reported" | "confirmed" | "dismissed";
export type StragglerSeverity = "monitor" | "assist";
export type FuelAlertLevel = "low" | "critical";
export type RideEventType =
  | "room_created"
  | "room_started"
  | "hazard_reported"
  | "hazard_confirmed"
  | "fuel_low"
  | "sos"
  | "ping"
  | "system";

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
  signalState: RiderSignalState;
  lastUpdatedAt: string;
  lat: number;
  lng: number;
  distanceFromLeaderMiles?: number;
  fuelRangeMiles?: number;
}

export interface RideLayerMarker {
  id: string;
  type: RideLayerType;
  title: string;
  subtitle: string;
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
  rsvpStatus: RiderRsvpStatus;
  presenceState: PresenceState;
  intercomState: IntercomState;
  fuelRangeMiles?: number;
  joinedAt: string;
  lastSeenAt: string;
}

export interface RidePlanStop {
  id: string;
  type: RideStopType;
  title: string;
  note: string;
  etaOffsetMinutes: number;
}

export interface RidePlanImportHook {
  id: string;
  type: RouteImportType;
  reference: string;
  importedAt: string;
}

export interface RidePlan {
  id: string;
  routeTitle: string;
  scheduledFor: string;
  meetupPoint: string;
  notes: string;
  distanceMiles: number;
  etaMinutes: number;
  imports: RidePlanImportHook[];
  stops: RidePlanStop[];
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
  createdAt: string;
  sentAt: string;
  kind: "message" | "ping" | "sos" | "system";
  body: string;
  pingType?: QuickPingType;
  severity?: "normal" | "high" | "critical";
  metadata?: {
    actorRole?: RiderRole;
    countdownSeconds?: number;
  };
}

export interface RideAlertState {
  id: string;
  kind: "sos" | "emergency_ping";
  status: RideAlertStatus;
  triggeredByUserId: string;
  triggeredByName: string;
  detail: string;
  createdAt: string;
  resolvedAt?: string;
}

export interface StragglerAlert {
  riderId: string;
  riderName: string;
  distanceMiles: number;
  staleSeconds: number;
  severity: StragglerSeverity;
  detail: string;
}

export interface HazardReport {
  id: string;
  status: HazardReportStatus;
  severity: HazardSeverity;
  title: string;
  note: string;
  reporterUserId: string;
  reporterName: string;
  confirmations: string[];
  confirmationNames: string[];
  createdAt: string;
  confirmedAt?: string;
  lat: number;
  lng: number;
  layerId?: string;
}

export interface FuelAlert {
  riderId: string;
  riderName: string;
  level: FuelAlertLevel;
  rangeMiles: number;
  createdAt: string;
}

export interface CrashDetectionSnapshot {
  experimental: true;
  enabled: boolean;
  availability: "ready" | "unavailable" | "unsupported";
  note: string;
  lastSampleAt?: string;
  lastMotionScore?: number;
  lastEvent?: string;
}

export interface RideEventLog {
  id: string;
  type: RideEventType;
  createdAt: string;
  actorName: string;
  detail: string;
  replayLabel: string;
}

export interface RideInsightsSnapshot {
  averageSpeedMph: number;
  stopCount: number;
  distanceMiles: number;
  eventLog: RideEventLog[];
}

export interface SafetySnapshot {
  stragglers: StragglerAlert[];
  hazards: HazardReport[];
  fuelAlerts: FuelAlert[];
  crashDetection: CrashDetectionSnapshot;
  insights: RideInsightsSnapshot;
}

export interface RoomJoinPayload {
  value: string;
}

export interface RideRoomSnapshot {
  room: RideRoom;
  members: RoomMember[];
  riders: RiderPresence[];
  layers: RideLayerMarker[];
  messages: RideMessage[];
  activeAlert: RideAlertState | null;
  ridePlan: RidePlan | null;
  safety: SafetySnapshot;
}

export interface LeaderMusicState {
  isPlaying: boolean;
  track: string;
  artist: string;
  elapsedSeconds: number;
}
