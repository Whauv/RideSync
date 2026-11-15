import { type AdminIncidentSummary, type AdminRoomSummary } from "@/services/admin";

import { palette } from "./adminConsoleStyles";

/** Pure formatting and tone helpers for the operations console rows. */

export function formatTime(value: string) {
  return new Intl.DateTimeFormat(undefined, {
    hour: "2-digit",
    minute: "2-digit"
  }).format(new Date(value));
}

export function relativeTime(value: string) {
  const minutes = Math.max(0, Math.round((Date.now() - Date.parse(value)) / 60000));
  if (minutes < 1) return "now";
  if (minutes < 60) return `${minutes}m`;
  const hours = Math.round(minutes / 60);
  if (hours < 24) return `${hours}h`;
  return `${Math.round(hours / 24)}d`;
}

export function roomStatus(room: AdminRoomSummary) {
  if (room.lifecycle === "rolling") {
    return { dot: palette.accent, text: "active", tone: palette.accent };
  }
  if (room.pendingApprovals > 0) {
    return { dot: palette.warning, text: "staging", tone: palette.warning };
  }
  return { dot: palette.neutral, text: "idle", tone: palette.textTertiary };
}

export function incidentSeverityTone(severity: AdminIncidentSummary["severity"]) {
  if (severity === "critical" || severity === "high") {
    return { border: palette.danger, badge: palette.dangerSurface, text: palette.danger };
  }
  if (severity === "medium") {
    return { border: palette.warning, badge: palette.warningSurface, text: palette.warning };
  }
  return { border: palette.accent, badge: palette.accentDim, text: palette.accent };
}
