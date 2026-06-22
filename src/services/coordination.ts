import AsyncStorage from "@react-native-async-storage/async-storage";
import * as Notifications from "expo-notifications";

import { CoordinationAuditEvent, CoordinationNotificationPayload, PingDefinition } from "@/types/coordination";

const AUDIT_STORAGE_KEY = "ridesync-coordination-audit";

export const QUICK_PINGS: PingDefinition[] = [
  {
    type: "pull_over",
    label: "Pull over",
    shortLabel: "Pull over",
    icon: "motorbike",
    tone: "warning",
    detail: "Leader or rider needs the group to come off the road."
  },
  {
    type: "fuel_stop",
    label: "Fuel stop",
    shortLabel: "Fuel",
    icon: "gas-station",
    tone: "accent",
    detail: "Fuel window approaching."
  },
  {
    type: "need_break",
    label: "Need break",
    shortLabel: "Break",
    icon: "coffee-outline",
    tone: "neutral",
    detail: "Rider needs a brief stop."
  },
  {
    type: "hazard",
    label: "Hazard",
    shortLabel: "Hazard",
    icon: "alert",
    tone: "warning",
    detail: "Road hazard reported ahead.",
    highPriority: true
  },
  {
    type: "regroup",
    label: "Regroup",
    shortLabel: "Regroup",
    icon: "map-marker-path",
    tone: "accent",
    detail: "Tighten the pack at the next safe point."
  },
  {
    type: "all_good",
    label: "All good",
    shortLabel: "All good",
    icon: "check-circle-outline",
    tone: "success",
    detail: "Status clear."
  },
  {
    type: "emergency",
    label: "Emergency",
    shortLabel: "Emergency",
    icon: "alert-octagon",
    tone: "danger",
    detail: "Immediate ride-wide attention required.",
    highPriority: true,
    critical: true
  }
];

export function getQuickPingDefinition(type: PingDefinition["type"]) {
  return QUICK_PINGS.find((ping) => ping.type === type) ?? QUICK_PINGS[0];
}

export function formatMessageTime(iso: string) {
  return new Date(iso).toLocaleTimeString([], {
    hour: "2-digit",
    minute: "2-digit"
  });
}

export async function configureCoordinationNotifications() {
  Notifications.setNotificationHandler({
    handleNotification: async () => ({
      shouldShowAlert: true,
      shouldShowBanner: true,
      shouldShowList: true,
      shouldPlaySound: true,
      shouldSetBadge: false
    })
  });
}

export async function sendCoordinationNotification(payload: CoordinationNotificationPayload) {
  await Notifications.scheduleNotificationAsync({
    content: {
      title: payload.title,
      body: payload.body,
      sound: "default",
      priority: Notifications.AndroidNotificationPriority.MAX,
      data: payload.data
    },
    trigger: null
  });
}

export async function recordCoordinationAudit(event: CoordinationAuditEvent) {
  const raw = await AsyncStorage.getItem(AUDIT_STORAGE_KEY);
  const existing = raw ? (JSON.parse(raw) as CoordinationAuditEvent[]) : [];
  const next = [event, ...existing].slice(0, 200);
  await AsyncStorage.setItem(AUDIT_STORAGE_KEY, JSON.stringify(next));
}
