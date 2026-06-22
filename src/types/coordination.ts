import { QuickPingType, RideAlertState, RideMessage } from "@/types/domain";

export interface PingDefinition {
  type: QuickPingType;
  label: string;
  shortLabel: string;
  icon:
    | "motorbike"
    | "gas-station"
    | "coffee-outline"
    | "alert"
    | "map-marker-path"
    | "check-circle-outline"
    | "alert-octagon";
  tone: "neutral" | "accent" | "success" | "warning" | "danger";
  detail: string;
  highPriority?: boolean;
  critical?: boolean;
}

export interface CoordinationAuditEvent {
  id: string;
  roomId: string;
  type:
    | "quick_ping"
    | "sos_started"
    | "sos_cancelled"
    | "sos_activated"
    | "sos_resolved"
    | "notification_sent";
  createdAt: string;
  actorUserId: string;
  actorName: string;
  messageId?: string;
  alertId?: string;
  pingType?: QuickPingType;
  note: string;
}

export interface CoordinationNotificationPayload {
  title: string;
  body: string;
  data: {
    roomId: string;
    kind: RideMessage["kind"] | "alert";
    pingType?: QuickPingType;
    alertId?: string;
  };
}

export interface RoomUnreadState {
  roomId: string;
  lastReadAt: string | null;
}

export interface MessageGroupBoundary {
  showSender: boolean;
  showTimestamp: boolean;
  startsUnread: boolean;
}

export type CoordinationAlert = RideAlertState;
