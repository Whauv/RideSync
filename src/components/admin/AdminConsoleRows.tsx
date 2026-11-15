import { motion } from "framer-motion";

import { type AdminIncidentSummary, type AdminRoomSummary } from "@/services/admin";

import { incidentSeverityTone, relativeTime, roomStatus } from "./adminConsoleFormatters";
import {
  incidentRowStyle,
  roomRowStyle,
  rowMonoStyle,
  rowRightStackStyle,
  rowRightStyle,
  rowSubtitleStyle,
  rowTitleStyle,
  severityBadgeStyle,
  statusDotStyle,
  timeAgoStyle
} from "./adminConsoleStyles";

export function RoomRow({ room }: { room: AdminRoomSummary }) {
  const status = roomStatus(room);

  return (
    <motion.div layout style={roomRowStyle} whileHover={{ backgroundColor: "rgba(255,255,255,0.025)" }}>
      <div style={{ minWidth: 0 }}>
        <div style={rowTitleStyle}>{room.title}</div>
        <div style={rowSubtitleStyle}>{room.routeTitle ?? "No route title set"}</div>
      </div>
      <div style={rowRightStyle}>
        <span style={rowMonoStyle}>{room.riderCount} riders</span>
        <span style={{ ...statusDotStyle, background: status.dot }} />
      </div>
    </motion.div>
  );
}

export function IncidentRow({ incident }: { incident: AdminIncidentSummary }) {
  const tone = incidentSeverityTone(incident.severity);

  return (
    <motion.div
      animate={{ opacity: 1, x: 0 }}
      initial={{ opacity: 0, x: -8 }}
      style={{ ...incidentRowStyle, borderLeft: `2px solid ${tone.border}` }}
      transition={{ duration: 0.25, ease: "easeOut" }}
      whileHover={{ backgroundColor: "rgba(255,255,255,0.025)" }}
    >
      <div style={{ minWidth: 0 }}>
        <div style={rowTitleStyle}>{incident.title}</div>
        <div style={rowSubtitleStyle}>{incident.detail}</div>
      </div>
      <div style={rowRightStackStyle}>
        <span style={timeAgoStyle}>{relativeTime(incident.createdAt)}</span>
        <span style={{ ...severityBadgeStyle, color: tone.text, background: tone.badge, borderColor: tone.border }}>{incident.status}</span>
      </div>
    </motion.div>
  );
}

export function AbuseRow({ subject, detail, disposition, roomTitle, severity }: { detail: string; disposition: string; roomTitle: string; severity: AdminIncidentSummary["severity"]; subject: string }) {
  const tone = incidentSeverityTone(severity);

  return (
    <motion.div style={{ ...incidentRowStyle, borderLeft: `2px solid ${tone.border}` }} whileHover={{ backgroundColor: "rgba(255,255,255,0.025)" }}>
      <div style={{ minWidth: 0 }}>
        <div style={rowTitleStyle}>{subject}</div>
        <div style={rowSubtitleStyle}>{roomTitle} · {detail}</div>
      </div>
      <div style={rowRightStackStyle}>
        <span style={{ ...severityBadgeStyle, color: tone.text, background: tone.badge, borderColor: tone.border }}>{disposition}</span>
      </div>
    </motion.div>
  );
}
