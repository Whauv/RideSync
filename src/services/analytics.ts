import AsyncStorage from "@react-native-async-storage/async-storage";
import Constants from "expo-constants";
import { Platform } from "react-native";

import { recordDiagnosticEvent } from "@/services/diagnostics";
import { AnalyticsContext, AnalyticsEvent } from "@/types/analytics";

const ANALYTICS_STORAGE_KEY = "ridesync-analytics-events";

let sessionId = buildId("session");
let currentContext: AnalyticsContext = {
  userId: null,
  roomId: null,
  rideSessionId: null,
  networkType: "unknown"
};

function buildId(prefix: string) {
  return `${prefix}-${Math.random().toString(36).slice(2, 10)}`;
}

function appVersion() {
  return Constants.expoConfig?.version ?? "0.0.0";
}

function platform(): AnalyticsEvent["platform"] {
  if (Platform.OS === "ios" || Platform.OS === "android") {
    return Platform.OS;
  }

  return "web";
}

export function startAnalyticsSession() {
  sessionId = buildId("session");
  return sessionId;
}

export function setAnalyticsContext(next: Partial<AnalyticsContext>) {
  currentContext = {
    ...currentContext,
    ...next
  };
}

export function getAnalyticsContext() {
  return currentContext;
}

export function buildAnalyticsEvent(
  eventName: string,
  properties: AnalyticsEvent["properties"] = {}
): AnalyticsEvent {
  return {
    event_name: eventName,
    event_id: buildId("event"),
    occurred_at: new Date().toISOString(),
    user_id: currentContext.userId,
    room_id: currentContext.roomId,
    platform: platform(),
    app_version: appVersion(),
    network_type: currentContext.networkType,
    session_id: sessionId,
    ride_session_id: currentContext.rideSessionId,
    properties
  };
}

export async function trackEvent(eventName: string, properties: AnalyticsEvent["properties"] = {}) {
  const event = buildAnalyticsEvent(eventName, properties);
  const raw = await AsyncStorage.getItem(ANALYTICS_STORAGE_KEY);
  const existing = raw ? (JSON.parse(raw) as AnalyticsEvent[]) : [];
  const next = [event, ...existing].slice(0, 400);
  await AsyncStorage.setItem(ANALYTICS_STORAGE_KEY, JSON.stringify(next));

  await recordDiagnosticEvent({
    category: "app",
    level: "info",
    title: `Analytics: ${eventName}`,
    detail: "Analytics event queued locally for beta review.",
    context: {
      roomId: event.room_id,
      sessionId: event.session_id
    }
  });

  return event;
}

export async function readAnalyticsEvents() {
  const raw = await AsyncStorage.getItem(ANALYTICS_STORAGE_KEY);
  return raw ? (JSON.parse(raw) as AnalyticsEvent[]) : [];
}

export async function clearAnalyticsEvents() {
  await AsyncStorage.removeItem(ANALYTICS_STORAGE_KEY);
}
