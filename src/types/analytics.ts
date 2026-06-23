export interface AnalyticsEvent {
  event_name: string;
  event_id: string;
  occurred_at: string;
  user_id: string | null;
  room_id: string | null;
  platform: "ios" | "android" | "web";
  app_version: string;
  network_type: "wifi" | "cellular" | "offline" | "unknown" | null;
  session_id: string;
  ride_session_id: string | null;
  properties: Record<string, string | number | boolean | null | undefined>;
}

export interface AnalyticsContext {
  userId: string | null;
  roomId: string | null;
  rideSessionId: string | null;
  networkType: AnalyticsEvent["network_type"];
}
