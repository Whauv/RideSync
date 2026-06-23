import { readDiagnosticEvents } from "@/services/diagnostics";
import { listRideRoomSnapshots } from "@/services/roomWorkflow";
import { DiagnosticEvent } from "@/types/runtime";

type AdminSeverity = "critical" | "high" | "medium" | "low";

export interface AdminRoomSummary {
  id: string;
  title: string;
  code: string;
  lifecycle: "lobby" | "rolling";
  privacyMode: "invite_only" | "approval_required";
  riderCount: number;
  pendingApprovals: number;
  connectedRiders: number;
  reconnectingRiders: number;
  offlineRiders: number;
  locked: boolean;
  routeTitle?: string;
  activeAlertKind?: "sos" | "emergency_ping";
  updatedAt: string;
}

export interface AdminIncidentSummary {
  id: string;
  roomId: string;
  roomTitle: string;
  kind: "sos" | "emergency_ping" | "hazard" | "fuel" | "straggler" | "connectivity";
  severity: AdminSeverity;
  title: string;
  detail: string;
  createdAt: string;
  status: "active" | "watch" | "resolved";
}

export interface AbuseReportSummary {
  id: string;
  roomId: string;
  roomTitle: string;
  severity: AdminSeverity;
  source: "system_flag" | "ride_signal";
  subject: string;
  detail: string;
  createdAt: string;
  disposition: "open" | "watch";
}

export interface AdminConsoleOverview {
  rooms: AdminRoomSummary[];
  incidents: AdminIncidentSummary[];
  abuseReports: AbuseReportSummary[];
  diagnostics: DiagnosticEvent[];
}

function byNewest<T extends { createdAt: string }>(left: T, right: T) {
  return Date.parse(right.createdAt) - Date.parse(left.createdAt);
}

export async function getAdminConsoleOverview(): Promise<AdminConsoleOverview> {
  const [snapshots, diagnostics] = await Promise.all([listRideRoomSnapshots(), readDiagnosticEvents()]);

  const rooms = snapshots.map((snapshot) => {
    const pendingApprovals = snapshot.members.filter((member) => member.approvalStatus === "pending").length;
    const connectedRiders = snapshot.members.filter((member) => member.presenceState === "connected").length;
    const reconnectingRiders = snapshot.members.filter((member) => member.presenceState === "reconnecting").length;
    const offlineRiders = snapshot.members.filter((member) => member.presenceState === "offline").length;
    const updatedAt = [snapshot.room.startedAt, snapshot.activeAlert?.createdAt, ...snapshot.members.map((member) => member.lastSeenAt)]
      .filter(Boolean)
      .sort()
      .at(-1) ?? snapshot.room.createdAt;

    return {
      id: snapshot.room.id,
      title: snapshot.room.title,
      code: snapshot.room.code,
      lifecycle: snapshot.room.lifecycle,
      privacyMode: snapshot.room.privacyMode,
      riderCount: snapshot.room.riderCount,
      pendingApprovals,
      connectedRiders,
      reconnectingRiders,
      offlineRiders,
      locked: snapshot.room.locked,
      routeTitle: snapshot.room.routeTitle,
      activeAlertKind: snapshot.activeAlert?.status === "active" ? snapshot.activeAlert.kind : undefined,
      updatedAt
    } satisfies AdminRoomSummary;
  });

  const incidents = snapshots
    .flatMap((snapshot) => {
      const items: AdminIncidentSummary[] = [];

      if (snapshot.activeAlert?.status === "active") {
        items.push({
          id: snapshot.activeAlert.id,
          roomId: snapshot.room.id,
          roomTitle: snapshot.room.title,
          kind: snapshot.activeAlert.kind,
          severity: "critical",
          title: snapshot.activeAlert.kind === "sos" ? "Active SOS escalation" : "Emergency ping in progress",
          detail: snapshot.activeAlert.detail,
          createdAt: snapshot.activeAlert.createdAt,
          status: "active"
        });
      }

      snapshot.safety.hazards.forEach((hazard) => {
        items.push({
          id: hazard.id,
          roomId: snapshot.room.id,
          roomTitle: snapshot.room.title,
          kind: "hazard",
          severity: hazard.severity === "critical" ? "high" : hazard.severity === "caution" ? "medium" : "low",
          title: hazard.title,
          detail: `${hazard.note} Reported by ${hazard.reporterName}.`,
          createdAt: hazard.confirmedAt ?? hazard.createdAt,
          status: hazard.status === "dismissed" ? "resolved" : hazard.status === "confirmed" ? "active" : "watch"
        });
      });

      snapshot.safety.fuelAlerts.forEach((alert) => {
        items.push({
          id: `${snapshot.room.id}-${alert.riderId}-fuel`,
          roomId: snapshot.room.id,
          roomTitle: snapshot.room.title,
          kind: "fuel",
          severity: alert.level === "critical" ? "high" : "medium",
          title: `${alert.riderName} low on fuel`,
          detail: `${alert.rangeMiles} mi estimated range remaining.`,
          createdAt: alert.createdAt,
          status: "watch"
        });
      });

      snapshot.safety.stragglers.forEach((straggler) => {
        items.push({
          id: `${snapshot.room.id}-${straggler.riderId}-straggler`,
          roomId: snapshot.room.id,
          roomTitle: snapshot.room.title,
          kind: "straggler",
          severity: straggler.severity === "assist" ? "high" : "medium",
          title: `${straggler.riderName} separated from group`,
          detail: straggler.detail,
          createdAt: snapshot.room.startedAt ?? snapshot.room.createdAt,
          status: straggler.severity === "assist" ? "active" : "watch"
        });
      });

      const unstableCount = snapshot.members.filter((member) => member.presenceState !== "connected").length;
      if (unstableCount > 0) {
        items.push({
          id: `${snapshot.room.id}-connectivity`,
          roomId: snapshot.room.id,
          roomTitle: snapshot.room.title,
          kind: "connectivity",
          severity: unstableCount > 1 ? "high" : "medium",
          title: "Room connectivity degraded",
          detail: `${unstableCount} rider${unstableCount === 1 ? "" : "s"} currently offline or reconnecting.`,
          createdAt: snapshot.room.startedAt ?? snapshot.room.createdAt,
          status: "watch"
        });
      }

      return items;
    })
    .sort(byNewest);

  const abuseReports = snapshots
    .flatMap((snapshot) => {
      const senderEmergencyCounts = snapshot.messages.reduce<Record<string, { count: number; senderName: string }>>((accumulator, message) => {
        if (message.kind !== "sos" && message.pingType !== "emergency") {
          return accumulator;
        }

        const current = accumulator[message.senderId] ?? { count: 0, senderName: message.senderName };
        accumulator[message.senderId] = {
          count: current.count + 1,
          senderName: current.senderName
        };
        return accumulator;
      }, {});

      return Object.entries(senderEmergencyCounts)
        .filter(([, value]) => value.count >= 2)
        .map(([senderId, value]) => ({
          id: `${snapshot.room.id}-${senderId}-emergency-review`,
          roomId: snapshot.room.id,
          roomTitle: snapshot.room.title,
          severity: (value.count >= 3 ? "high" : "medium") as AdminSeverity,
          source: "system_flag" as const,
          subject: "Repeated emergency channel use",
          detail: `${value.senderName} triggered ${value.count} emergency messages in the current room history. Review for misuse before beta rollout expands.`,
          createdAt: snapshot.messages.find((message) => message.senderId === senderId)?.createdAt ?? snapshot.room.createdAt,
          disposition: "open" as const
        }));
    })
    .sort(byNewest);

  return {
    rooms,
    incidents,
    abuseReports,
    diagnostics: diagnostics.slice(0, 16)
  };
}
