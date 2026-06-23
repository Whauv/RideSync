export type ConnectivityState = "online" | "unstable" | "offline";
export type RecoveryState = "idle" | "recovering" | "restored" | "failed";

export interface RuntimePreferences {
  batterySaverMode: boolean;
  reducedGpsCadence: boolean;
}

export interface FeatureFlags {
  experimentalCrashDetection: boolean;
  voiceLeaderAnnounce: boolean;
  musicSyncDiagnostics: boolean;
  developerDiagnostics: boolean;
}

export interface ReliabilitySnapshot {
  connectivity: ConnectivityState;
  recoveryState: RecoveryState;
  lastRoomSyncAt: string | null;
  lastRecoveryAt: string | null;
  lastRecoveryError: string | null;
}

export interface DiagnosticEvent {
  id: string;
  category: "app" | "room" | "voice" | "notification" | "recovery";
  level: "info" | "warning" | "error";
  createdAt: string;
  title: string;
  detail: string;
  context?: Record<string, string | number | boolean | null | undefined>;
}

export interface NotificationBridgePayload {
  title: string;
  body: string;
  data: Record<string, string | null | undefined>;
}

export interface NotificationBridgeSubscription {
  remove: () => void;
}

export interface NotificationBridge {
  configure: () => Promise<void>;
  schedule: (payload: NotificationBridgePayload) => Promise<void>;
  addReceivedListener: (listener: (payload: unknown) => void) => NotificationBridgeSubscription;
  addResponseListener: (listener: (payload: unknown) => void) => NotificationBridgeSubscription;
}
