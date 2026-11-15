import * as Linking from "expo-linking";

import { formatMessageTime } from "@/services/coordination";
import { applyLeaderDistances, buildCrashDetectionPlaceholder, buildSafetySnapshot } from "@/services/safety";
import { AuthIdentity, RiderProfile } from "@/types/auth";
import {
  RideLayerMarker,
  RideMessage,
  RidePlan,
  RideRoom,
  RideRoomSnapshot,
  RiderPresence,
  RiderRole,
  RoomMember
} from "@/types/domain";

/**
 * Pure, side-effect-free helpers that shape room domain data.
 *
 * These were extracted from `roomWorkflow.ts` so the orchestration layer can
 * focus on sequencing (analytics, tracing, persistence) while the data shaping
 * stays independently testable and storage-agnostic.
 */

export const ROOM_BASE_LAT = 39.7392;
export const ROOM_BASE_LNG = -104.9903;

export function nowIso() {
  return new Date().toISOString();
}

export function buildInviteLink(code: string) {
  return Linking.createURL("/join", {
    queryParams: {
      code
    }
  });
}

export function buildCode() {
  return Math.random().toString(36).slice(2, 7).toUpperCase();
}

export function buildId(prefix: string) {
  return `${prefix}-${Math.random().toString(36).slice(2, 10)}`;
}

export function parseJoinValue(value: string) {
  const trimmed = value.trim();
  if (!trimmed) {
    return "";
  }

  const codeMatch = trimmed.match(/[?&]code=([A-Za-z0-9]+)/);
  if (codeMatch?.[1]) {
    return codeMatch[1].toUpperCase();
  }

  return trimmed.toUpperCase().replace(/[^A-Z0-9]/g, "");
}

export function buildMember(
  authIdentity: AuthIdentity,
  profile: RiderProfile,
  role: RiderRole,
  approvalStatus: "approved" | "pending"
): RoomMember {
  const timestamp = nowIso();

  return {
    id: buildId("member"),
    userId: authIdentity.uid,
    riderName: profile.riderName,
    avatarInitials: profile.avatarInitials,
    bikeName: profile.bikeName,
    role,
    approvalStatus,
    readiness: role === "leader" ? "ready" : "review",
    rsvpStatus: role === "leader" ? "going" : "pending",
    presenceState: "connected",
    intercomState: "not_connected",
    joinedAt: timestamp,
    lastSeenAt: timestamp
  };
}

export function buildRidePresence(members: RoomMember[]): RiderPresence[] {
  const approvedMembers = members.filter((member) => member.approvalStatus === "approved");
  const timestamp = nowIso();

  return applyLeaderDistances(
    approvedMembers.map((member, index) => ({
      id: member.id,
      name: member.riderName,
      role: member.role,
      bike: member.bikeName,
      speedMph: member.role === "leader" ? 66 : 62 + (index % 3) * 2,
      headingDeg: 102 + index,
      status: "rolling",
      isTalking: member.role === "leader",
      hasMusicSync: member.intercomState === "connected",
      batteryPct: 80 - index * 7,
      signalState: index === 0 ? "strong" : index === 1 ? "moderate" : "weak",
      lastUpdatedAt: timestamp,
      lat: ROOM_BASE_LAT + index * 0.004,
      lng: ROOM_BASE_LNG + index * 0.006,
      fuelRangeMiles: member.fuelRangeMiles ?? 110 - index * 12
    }))
  );
}

export function buildRideLayers(room: RideRoom): RideLayerMarker[] {
  return [
    {
      id: `${room.id}-regroup`,
      type: "regroup",
      title: "Regroup turnout",
      subtitle: "Leader fallback rally point",
      lat: ROOM_BASE_LAT + 0.011,
      lng: ROOM_BASE_LNG + 0.014
    },
    {
      id: `${room.id}-hazard`,
      type: "hazard",
      title: "Gravel wash",
      subtitle: "Reduced traction reported",
      lat: ROOM_BASE_LAT + 0.018,
      lng: ROOM_BASE_LNG - 0.006
    },
    {
      id: `${room.id}-fuel`,
      type: "fuel",
      title: "Fuel stop",
      subtitle: "Next planned top-off",
      lat: ROOM_BASE_LAT + 0.028,
      lng: ROOM_BASE_LNG + 0.008
    },
    {
      id: `${room.id}-emergency`,
      type: "emergency",
      title: "Emergency staging",
      subtitle: "Visible to leader only until needed",
      lat: ROOM_BASE_LAT - 0.008,
      lng: ROOM_BASE_LNG + 0.02
    }
  ];
}

export function buildDefaultRidePlan(room: RideRoom): RidePlan {
  const scheduledFor = new Date(Date.now() + 1000 * 60 * 60 * 18).toISOString();

  return {
    id: buildId("plan"),
    routeTitle: room.routeTitle ?? room.title,
    scheduledFor,
    meetupPoint: "Morrison Park-and-Ride",
    notes: "Fuel topped off, rain layer packed, and intercom paired before departure.",
    distanceMiles: 118,
    etaMinutes: 210,
    imports: [],
    stops: [
      {
        id: buildId("stop"),
        type: "fuel",
        title: "Nederland fuel stop",
        note: "Fast pumps and quick regroup lane.",
        etaOffsetMinutes: 58
      },
      {
        id: buildId("stop"),
        type: "food",
        title: "Canyon lunch window",
        note: "Quick service and hydration reset.",
        etaOffsetMinutes: 112
      },
      {
        id: buildId("stop"),
        type: "emergency_fallback",
        title: "Front range fallback",
        note: "Weather or mechanical bail-out point.",
        etaOffsetMinutes: 146
      }
    ]
  };
}

export function buildSystemMessage(body: string, senderId: string, senderName: string): RideMessage {
  const timestamp = nowIso();

  return {
    id: buildId("message"),
    senderId,
    senderName,
    createdAt: timestamp,
    sentAt: formatMessageTime(timestamp),
    kind: "system",
    body,
    severity: "normal"
  };
}

export function buildUserMessage(
  kind: RideMessage["kind"],
  authIdentity: AuthIdentity,
  profile: RiderProfile,
  body: string,
  options?: Pick<RideMessage, "pingType" | "severity" | "metadata">
): RideMessage {
  const timestamp = nowIso();

  return {
    id: buildId("message"),
    senderId: authIdentity.uid,
    senderName: profile.riderName,
    createdAt: timestamp,
    sentAt: formatMessageTime(timestamp),
    kind,
    body,
    pingType: options?.pingType,
    severity: options?.severity ?? "normal",
    metadata: options?.metadata
  };
}

export function sortMembers(members: RoomMember[]) {
  return [...members].sort((left, right) => {
    if (left.role === "leader") return -1;
    if (right.role === "leader") return 1;
    if (left.approvalStatus !== right.approvalStatus) {
      return left.approvalStatus === "pending" ? -1 : 1;
    }

    return left.riderName.localeCompare(right.riderName);
  });
}

export function hydrateRoomSnapshot(snapshot: RideRoomSnapshot): RideRoomSnapshot {
  const normalized = {
    ...snapshot,
    room: {
      ...snapshot.room,
      riderCount: snapshot.members.filter((member) => member.approvalStatus === "approved").length
    },
    members: sortMembers(snapshot.members),
    riders: applyLeaderDistances(snapshot.riders),
    activeAlert: snapshot.activeAlert ?? null,
    ridePlan: snapshot.ridePlan ?? buildDefaultRidePlan(snapshot.room),
    safety: snapshot.safety ?? {
      stragglers: [],
      hazards: [],
      fuelAlerts: [],
      crashDetection: buildCrashDetectionPlaceholder(),
      insights: {
        averageSpeedMph: 0,
        stopCount: 0,
        distanceMiles: snapshot.ridePlan?.distanceMiles ?? 0,
        eventLog: []
      }
    }
  } satisfies RideRoomSnapshot;

  return {
    ...normalized,
    safety: buildSafetySnapshot(normalized, normalized.safety)
  };
}
