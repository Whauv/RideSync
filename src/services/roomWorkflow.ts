import AsyncStorage from "@react-native-async-storage/async-storage";
import * as Linking from "expo-linking";
import { Share } from "react-native";

import { getQuickPingDefinition, formatMessageTime, recordCoordinationAudit, sendCoordinationNotification } from "@/services/coordination";
import { recordDiagnosticEvent } from "@/services/diagnostics";
import { trackEvent } from "@/services/analytics";
import { captureError, finishTrace, startTrace } from "@/services/monitoring";
import { applyLeaderDistances, buildCrashDetectionPlaceholder, buildSafetySnapshot } from "@/services/safety";
import { AuthIdentity, RiderProfile } from "@/types/auth";
import {
  CreateRoomInput,
  HazardSeverity,
  QuickPingType,
  MemberReadiness,
  PresenceState,
  RidePlan,
  RidePlanImportHook,
  RidePlanStop,
  RiderRsvpStatus,
  RideAlertState,
  RideMessage,
  RideLayerMarker,
  RideRoom,
  RideRoomSnapshot,
  RiderPresence,
  RoomJoinPayload,
  RoomMember,
  RiderRole
} from "@/types/domain";

const ROOM_STORAGE_KEY = "ridesync-local-room-workflow";
const ROOM_BASE_LAT = 39.7392;
const ROOM_BASE_LNG = -104.9903;

interface PersistedRooms {
  rooms: RideRoomSnapshot[];
}

function nowIso() {
  return new Date().toISOString();
}

function buildInviteLink(code: string) {
  return Linking.createURL("/join", {
    queryParams: {
      code
    }
  });
}

function buildCode() {
  return Math.random().toString(36).slice(2, 7).toUpperCase();
}

function buildId(prefix: string) {
  return `${prefix}-${Math.random().toString(36).slice(2, 10)}`;
}

async function readStore(): Promise<PersistedRooms> {
  const raw = await AsyncStorage.getItem(ROOM_STORAGE_KEY);
  if (!raw) {
    return { rooms: [] };
  }

  return JSON.parse(raw) as PersistedRooms;
}

async function writeStore(store: PersistedRooms) {
  await AsyncStorage.setItem(ROOM_STORAGE_KEY, JSON.stringify(store));
}

function parseJoinValue(value: string) {
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

function buildMember(
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

function buildRidePresence(members: RoomMember[]): RiderPresence[] {
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

function buildRideLayers(room: RideRoom): RideLayerMarker[] {
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

function buildDefaultRidePlan(room: RideRoom): RidePlan {
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

function buildSystemMessage(body: string, senderId: string, senderName: string): RideMessage {
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

function buildUserMessage(
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

function sortMembers(members: RoomMember[]) {
  return [...members].sort((left, right) => {
    if (left.role === "leader") return -1;
    if (right.role === "leader") return 1;
    if (left.approvalStatus !== right.approvalStatus) {
      return left.approvalStatus === "pending" ? -1 : 1;
    }

    return left.riderName.localeCompare(right.riderName);
  });
}

function hydrateRoomSnapshot(snapshot: RideRoomSnapshot): RideRoomSnapshot {
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

export async function createRideRoom(input: CreateRoomInput, authIdentity: AuthIdentity, profile: RiderProfile) {
  const trace = startTrace("room_create");
  await trackEvent("room_create_started", {
    entry_point: "ride_tab"
  });
  const store = await readStore();
  const code = buildCode();
  const leaderMember = buildMember(authIdentity, profile, "leader", "approved");

  const room: RideRoom = {
    id: buildId("room"),
    code,
    title: input.roomName.trim(),
    routeTitle: input.routeTitle?.trim() || undefined,
    leaderId: leaderMember.id,
    privacyMode: input.privacyMode,
    maxRiders: input.maxRiders,
    locked: false,
    lifecycle: "lobby",
    inviteLink: buildInviteLink(code),
    createdAt: nowIso(),
    riderCount: 1,
    voiceProvider: "livekit",
    musicTrack: "Northern Pass"
  };

  const snapshot = hydrateRoomSnapshot({
    room,
    members: [leaderMember],
    riders: [],
    layers: [],
    messages: [buildSystemMessage("Leader opened the room.", leaderMember.id, leaderMember.riderName)],
    activeAlert: null,
    ridePlan: buildDefaultRidePlan(room),
    safety: {
      stragglers: [],
      hazards: [],
      fuelAlerts: [],
      crashDetection: buildCrashDetectionPlaceholder(),
      insights: {
        averageSpeedMph: 0,
        stopCount: 0,
        distanceMiles: 118,
        eventLog: []
      }
    }
  });

  store.rooms = [snapshot, ...store.rooms.filter((item) => item.room.id !== snapshot.room.id)];
  await writeStore(store);
  await finishTrace(trace, { roomId: snapshot.room.id });
  await trackEvent("room_created", {
    voice_provider: snapshot.room.voiceProvider,
    music_mode: "metadata_sync",
    room_id: snapshot.room.id
  });
  return snapshot;
}

export async function joinRideRoom(payload: RoomJoinPayload, authIdentity: AuthIdentity, profile: RiderProfile) {
  const trace = startTrace("room_join");
  await trackEvent("room_join_started", {
    join_method: payload.value.includes("http") || payload.value.includes("://") ? "link" : "code"
  });
  const code = parseJoinValue(payload.value);
  if (!code) {
    await trackEvent("room_join_failed", {
      join_method: "invalid",
      error_code: "invalid_code"
    });
    throw new Error("Enter a valid room code or invite link.");
  }

  const store = await readStore();
  const targetIndex = store.rooms.findIndex((snapshot) => snapshot.room.code === code);
  if (targetIndex < 0) {
    await trackEvent("room_join_failed", {
      join_method: "code",
      error_code: "room_not_found"
    });
    throw new Error("No room matches that code.");
  }

  const snapshot = store.rooms[targetIndex];
  if (snapshot.room.locked) {
    await trackEvent("room_join_failed", {
      join_method: "code",
      error_code: "room_locked"
    });
    throw new Error("This room is locked.");
  }

  const currentMembers = snapshot.members.filter((member) => member.approvalStatus !== "pending" || member.userId !== authIdentity.uid);
  if (snapshot.members.filter((member) => member.approvalStatus === "approved").length >= snapshot.room.maxRiders) {
    await trackEvent("room_join_failed", {
      join_method: "code",
      error_code: "room_full"
    });
    throw new Error("This room is full.");
  }

  const existingMember = snapshot.members.find((member) => member.userId === authIdentity.uid);
  let nextMembers = snapshot.members;

  if (existingMember) {
    nextMembers = snapshot.members.map((member) =>
      member.userId === authIdentity.uid
        ? {
            ...member,
            presenceState: "connected",
            lastSeenAt: nowIso()
          }
        : member
    );
  } else {
    const nextMember = buildMember(
      authIdentity,
      profile,
      "rider",
      snapshot.room.privacyMode === "approval_required" ? "pending" : "approved"
    );
    nextMembers = [...currentMembers, nextMember];
  }

  const joinedMember = nextMembers.find((member) => member.userId === authIdentity.uid);
  const joinedName = joinedMember?.riderName ?? profile.riderName;
  const nextSnapshot = hydrateRoomSnapshot({
    ...snapshot,
    members: nextMembers,
    messages: [
      buildSystemMessage(
        snapshot.room.privacyMode === "approval_required"
          ? `${joinedName} requested to join the room.`
          : `${joinedName} joined the room.`,
        joinedMember?.id ?? buildId("member"),
        joinedName
      ),
      ...snapshot.messages
    ],
    activeAlert: snapshot.activeAlert,
    ridePlan: snapshot.ridePlan,
    safety: snapshot.safety
  });

  store.rooms[targetIndex] = nextSnapshot;
  await writeStore(store);
  const durationMs = await finishTrace(trace, { roomId: nextSnapshot.room.id });
  await trackEvent("room_join_succeeded", {
    join_method: payload.value.includes("http") || payload.value.includes("://") ? "link" : "code",
    join_duration_ms: durationMs,
    role: joinedMember?.role ?? "rider"
  });
  return nextSnapshot;
}

export async function getRideRoomSnapshot(roomId: string) {
  const store = await readStore();
  const snapshot = store.rooms.find((item) => item.room.id === roomId);
  return snapshot ? hydrateRoomSnapshot(snapshot) : null;
}

export async function listRideRoomSnapshots() {
  const store = await readStore();
  return store.rooms
    .map((snapshot) => hydrateRoomSnapshot(snapshot))
    .sort((left, right) => Date.parse(right.room.createdAt) - Date.parse(left.room.createdAt));
}

export async function updateRidePlan(roomId: string, partial: Partial<RidePlan>) {
  return mutateRoom(roomId, (snapshot) => ({
    ...snapshot,
    ridePlan: snapshot.ridePlan
      ? {
          ...snapshot.ridePlan,
          ...partial
        }
      : null,
    safety: snapshot.safety
  }));
}

export async function addRidePlanStop(roomId: string, stop: Omit<RidePlanStop, "id">) {
  return mutateRoom(roomId, (snapshot) => ({
    ...snapshot,
    ridePlan: snapshot.ridePlan
      ? {
          ...snapshot.ridePlan,
          stops: [
            ...snapshot.ridePlan.stops,
            {
              ...stop,
              id: buildId("stop")
            }
          ]
        }
      : null,
    safety: snapshot.safety
  }));
}

export async function importRideRouteReference(roomId: string, hook: Omit<RidePlanImportHook, "id" | "importedAt">) {
  return mutateRoom(roomId, (snapshot) => ({
    ...snapshot,
    ridePlan: snapshot.ridePlan
      ? {
          ...snapshot.ridePlan,
          imports: [
            {
              id: buildId("import"),
              importedAt: nowIso(),
              ...hook
            },
            ...snapshot.ridePlan.imports
          ]
        }
      : null,
    safety: snapshot.safety
  }));
}

export async function updateRoomMemberRsvp(roomId: string, userId: string, rsvpStatus: RiderRsvpStatus) {
  return mutateRoom(roomId, (snapshot) => ({
    ...snapshot,
    members: snapshot.members.map((member) =>
      member.userId === userId
        ? {
            ...member,
            rsvpStatus,
            lastSeenAt: nowIso()
          }
        : member
    )
  }));
}

export async function updateRiderFuelRange(roomId: string, userId: string, fuelRangeMiles: number) {
  return mutateRoom(roomId, (snapshot) => ({
    ...snapshot,
    members: snapshot.members.map((member) =>
      member.userId === userId
        ? {
            ...member,
            fuelRangeMiles,
            lastSeenAt: nowIso()
          }
        : member
    ),
    riders: snapshot.riders.map((rider) =>
      snapshot.members.find((member) => member.id === rider.id)?.userId === userId
        ? {
            ...rider,
            fuelRangeMiles
          }
        : rider
    )
  }));
}

export async function sendRoomMessage(roomId: string, authIdentity: AuthIdentity, profile: RiderProfile, body: string) {
  const trimmed = body.trim();
  if (!trimmed) {
    throw new Error("Add a message before sending.");
  }

  return mutateRoom(roomId, (snapshot) => ({
    ...snapshot,
    messages: [buildUserMessage("message", authIdentity, profile, trimmed), ...snapshot.messages]
  }));
}

export async function sendQuickPing(roomId: string, authIdentity: AuthIdentity, profile: RiderProfile, pingType: QuickPingType) {
  const ping = getQuickPingDefinition(pingType);
  const message = buildUserMessage("ping", authIdentity, profile, ping.label, {
    pingType,
    severity: ping.critical ? "critical" : ping.highPriority ? "high" : "normal"
  });

  const snapshot = await mutateRoom(roomId, (current) => ({
    ...current,
    messages: [message, ...current.messages],
    activeAlert:
      pingType === "emergency"
        ? {
            id: buildId("alert"),
            kind: "emergency_ping",
            status: "active",
            triggeredByUserId: authIdentity.uid,
            triggeredByName: profile.riderName,
            detail: "Emergency ping issued to the room.",
            createdAt: nowIso()
          }
        : current.activeAlert
  }));

  await recordCoordinationAudit({
    id: buildId("audit"),
    roomId,
    type: "quick_ping",
    createdAt: nowIso(),
    actorUserId: authIdentity.uid,
    actorName: profile.riderName,
    messageId: message.id,
    pingType,
    note: ping.label
  });

  if (ping.highPriority || ping.critical) {
    await sendCoordinationNotification({
      title: `${profile.riderName}: ${ping.label}`,
      body: ping.detail,
      data: {
        roomId,
        kind: "ping",
        pingType
      }
    });

    await recordCoordinationAudit({
      id: buildId("audit"),
      roomId,
      type: "notification_sent",
      createdAt: nowIso(),
      actorUserId: authIdentity.uid,
      actorName: profile.riderName,
      messageId: message.id,
      pingType,
      note: `Notification sent for ${ping.label}`
    });
  }

  await trackEvent("quick_action_sent", {
    action_type: pingType,
    role: "rider"
  });

  return snapshot;
}

export async function triggerSosAlert(
  roomId: string,
  authIdentity: AuthIdentity,
  profile: RiderProfile,
  countdownSeconds: number
) {
  const message = buildUserMessage("sos", authIdentity, profile, "SOS activated", {
    severity: "critical",
    metadata: {
      countdownSeconds
    }
  });

  const alert: RideAlertState = {
    id: buildId("alert"),
    kind: "sos",
    status: "active",
    triggeredByUserId: authIdentity.uid,
    triggeredByName: profile.riderName,
    detail: "Emergency escalation is active. Regroup and assess immediately.",
    createdAt: nowIso()
  };

  const snapshot = await mutateRoom(roomId, (current) => ({
    ...current,
    messages: [message, ...current.messages],
    activeAlert: alert
  }));

  await recordCoordinationAudit({
    id: buildId("audit"),
    roomId,
    type: "sos_activated",
    createdAt: nowIso(),
    actorUserId: authIdentity.uid,
    actorName: profile.riderName,
    messageId: message.id,
    alertId: alert.id,
    note: "SOS alert activated"
  });

  await trackEvent("sos_triggered", {
    role: "rider",
    battery_bucket: "unknown"
  });

  await sendCoordinationNotification({
    title: `SOS from ${profile.riderName}`,
    body: "Emergency escalation is active for this room.",
    data: {
      roomId,
      kind: "alert",
      alertId: alert.id
    }
  });

  await recordCoordinationAudit({
    id: buildId("audit"),
    roomId,
    type: "notification_sent",
    createdAt: nowIso(),
    actorUserId: authIdentity.uid,
    actorName: profile.riderName,
    alertId: alert.id,
    note: "Notification sent for SOS"
  });

  return snapshot;
}

export async function resolveActiveAlert(roomId: string, authIdentity: AuthIdentity, profile: RiderProfile) {
  const snapshot = await mutateRoom(roomId, (snapshot) => {
    if (!snapshot.activeAlert) {
      return snapshot;
    }

    const resolvedAt = nowIso();
    return {
      ...snapshot,
      activeAlert: {
        ...snapshot.activeAlert,
        status: "resolved",
        resolvedAt
      },
      messages: [
        buildSystemMessage(`${profile.riderName} resolved the active alert.`, authIdentity.uid, profile.riderName),
        ...snapshot.messages
      ]
    };
  });

  if (snapshot.activeAlert) {
    await recordCoordinationAudit({
      id: buildId("audit"),
      roomId,
      type: snapshot.activeAlert.kind === "sos" ? "sos_resolved" : "quick_ping",
      createdAt: nowIso(),
      actorUserId: authIdentity.uid,
      actorName: profile.riderName,
      alertId: snapshot.activeAlert.id,
      note: "Active alert resolved"
    });
  }

  if (snapshot.activeAlert?.kind === "sos") {
    await trackEvent("sos_cleared", {
      resolution_type: "resolved"
    });
  }

  return snapshot;
}

export async function updateRoomMemberReadiness(roomId: string, userId: string, readiness: MemberReadiness) {
  return mutateRoom(roomId, (snapshot) => ({
    ...snapshot,
    members: snapshot.members.map((member) =>
      member.userId === userId
        ? {
            ...member,
            readiness,
            lastSeenAt: nowIso()
          }
        : member
    )
  }));
}

export async function updateRoomMemberIntercom(roomId: string, userId: string, connected: boolean) {
  return mutateRoom(roomId, (snapshot) => ({
    ...snapshot,
    members: snapshot.members.map((member) =>
      member.userId === userId
        ? {
            ...member,
            intercomState: connected ? "connected" : "not_connected",
            lastSeenAt: nowIso()
          }
        : member
    )
  }));
}

export async function updateRoomMemberPresence(roomId: string, userId: string, presenceState: PresenceState) {
  return mutateRoom(roomId, (snapshot) => ({
    ...snapshot,
    members: snapshot.members.map((member) =>
      member.userId === userId
        ? {
            ...member,
            presenceState,
            lastSeenAt: nowIso()
          }
        : member
    )
  }));
}

export async function approveRoomMember(roomId: string, memberId: string) {
  return mutateRoom(roomId, (snapshot) => {
    const target = snapshot.members.find((member) => member.id === memberId);
    return {
      ...snapshot,
      members: snapshot.members.map((member) =>
        member.id === memberId
          ? {
              ...member,
              approvalStatus: "approved"
            }
          : member
      ),
      messages: target
        ? [buildSystemMessage(`${target.riderName} was approved for the ride.`, target.id, target.riderName), ...snapshot.messages]
        : snapshot.messages
    };
  });
}

export async function removeRoomMember(roomId: string, memberId: string) {
  return mutateRoom(roomId, (snapshot) => {
    const target = snapshot.members.find((member) => member.id === memberId);
    return {
      ...snapshot,
      members: snapshot.members.filter((member) => member.id !== memberId),
      messages: target
        ? [buildSystemMessage(`${target.riderName} was removed from the room.`, target.id, target.riderName), ...snapshot.messages]
        : snapshot.messages
    };
  });
}

export async function setRoomLocked(roomId: string, locked: boolean) {
  const snapshot = await mutateRoom(roomId, (snapshot) => ({
    ...snapshot,
    room: {
      ...snapshot.room,
      locked
    },
    messages: [
      buildSystemMessage(locked ? "Leader locked the room." : "Leader reopened the room.", snapshot.room.leaderId, "Leader"),
      ...snapshot.messages
    ]
  }));

  await sendCoordinationNotification({
    title: locked ? "Room locked" : "Room reopened",
    body: locked ? "Leader locked new room entries while the pack gets organized." : "Leader reopened room entry for riders.",
    data: {
      roomId,
      kind: "system"
    }
  });

  return snapshot;
}

export async function startRideRoom(roomId: string) {
  const snapshot = await mutateRoom(roomId, (snapshot) => ({
    ...snapshot,
    room: {
      ...snapshot.room,
      lifecycle: "rolling",
      startedAt: nowIso()
    },
    riders: buildRidePresence(snapshot.members),
    layers: buildRideLayers(snapshot.room),
    messages: [
      buildSystemMessage("Leader started the ride.", snapshot.room.leaderId, "Leader"),
      ...snapshot.messages
    ]
  }));

  await sendCoordinationNotification({
    title: `${snapshot.room.title} started`,
    body: "Live ride tracking and room voice are now active.",
    data: {
      roomId,
      kind: "system"
    }
  });

  await recordDiagnosticEvent({
    category: "room",
    level: "info",
    title: "Ride started",
    detail: `${snapshot.room.title} moved into rolling mode.`,
    context: {
      roomId
    }
  });

  await trackEvent("ride_session_started", {
    rider_count: snapshot.room.riderCount
  });

  return snapshot;
}

export async function reportHazard(
  roomId: string,
  authIdentity: AuthIdentity,
  profile: RiderProfile,
  input: {
    title: string;
    note: string;
    severity: HazardSeverity;
    lat?: number;
    lng?: number;
  }
) {
  const timestamp = nowIso();

  const snapshot = await mutateRoom(roomId, (snapshot) => {
    const leadRider = snapshot.riders.find((rider) => rider.role === "leader") ?? snapshot.riders[0];
    const layerId = buildId("hazard-layer");
    const hazardId = buildId("hazard");
    const lat = input.lat ?? leadRider?.lat ?? ROOM_BASE_LAT;
    const lng = input.lng ?? leadRider?.lng ?? ROOM_BASE_LNG;

    return {
      ...snapshot,
      layers: [
        {
          id: layerId,
          type: "hazard",
          title: input.title.trim(),
          subtitle: `Reported by ${profile.riderName} | awaiting confirmation`,
          lat,
          lng
        },
        ...snapshot.layers
      ],
      messages: [
        buildUserMessage("ping", authIdentity, profile, `Hazard reported: ${input.title.trim()}`, {
          pingType: "hazard",
          severity: input.severity === "critical" ? "critical" : "high",
          metadata: {
            actorRole: "rider"
          }
        }),
        ...snapshot.messages
      ],
      safety: {
        ...snapshot.safety,
        hazards: [
          {
            id: hazardId,
            status: "reported",
            severity: input.severity,
            title: input.title.trim(),
            note: input.note.trim(),
            reporterUserId: authIdentity.uid,
            reporterName: profile.riderName,
            confirmations: [authIdentity.uid],
            confirmationNames: [profile.riderName],
            createdAt: timestamp,
            lat,
            lng,
            layerId
          },
          ...snapshot.safety.hazards
        ]
      }
    };
  });

  await sendCoordinationNotification({
    title: `Hazard reported: ${input.title.trim()}`,
    body: input.note.trim() || "Open the room to confirm the road condition.",
    data: {
      roomId,
      kind: "ping",
      pingType: "hazard"
    }
  });

  await recordDiagnosticEvent({
    category: "room",
    level: input.severity === "critical" ? "warning" : "info",
    title: "Hazard report created",
    detail: input.title.trim(),
    context: {
      roomId,
      severity: input.severity
    }
  });

  return snapshot;
}

export async function confirmHazardReport(roomId: string, hazardId: string, authIdentity: AuthIdentity, profile: RiderProfile) {
  return mutateRoom(roomId, (snapshot) => {
    const target = snapshot.safety.hazards.find((hazard) => hazard.id === hazardId);
    if (!target) {
      return snapshot;
    }

    const alreadyConfirmed = target.confirmations.includes(authIdentity.uid);
    const confirmationNames = alreadyConfirmed ? target.confirmationNames : [...target.confirmationNames, profile.riderName];
    const confirmations = alreadyConfirmed ? target.confirmations : [...target.confirmations, authIdentity.uid];
    const confirmed = confirmations.length >= 2;

    return {
      ...snapshot,
      layers: snapshot.layers.map((layer) =>
        layer.id === target.layerId
          ? {
              ...layer,
              subtitle: confirmed
                ? `Confirmed by ${confirmationNames.length} riders`
                : `Reported by ${target.reporterName} | awaiting one more confirmation`
            }
          : layer
      ),
      messages: confirmed
        ? [
            buildSystemMessage(`${profile.riderName} confirmed hazard: ${target.title}.`, authIdentity.uid, profile.riderName),
            ...snapshot.messages
          ]
        : snapshot.messages,
      safety: {
        ...snapshot.safety,
        hazards: snapshot.safety.hazards.map((hazard) =>
          hazard.id === hazardId
            ? {
                ...hazard,
                confirmations,
                confirmationNames,
                status: confirmed ? "confirmed" : hazard.status,
                confirmedAt: confirmed ? nowIso() : hazard.confirmedAt
              }
            : hazard
        )
      }
    };
  });
}

export async function clearActiveRideRoom(roomId: string) {
  return mutateRoom(roomId, (snapshot) => ({
    ...snapshot,
    room: {
      ...snapshot.room,
      lifecycle: "lobby"
    },
    riders: [],
    layers: [],
    activeAlert: snapshot.activeAlert?.status === "active" ? { ...snapshot.activeAlert, status: "resolved", resolvedAt: nowIso() } : snapshot.activeAlert,
    ridePlan: snapshot.ridePlan,
    safety: snapshot.safety
  }));
}

async function mutateRoom(roomId: string, updater: (snapshot: RideRoomSnapshot) => RideRoomSnapshot) {
  const store = await readStore();
  const targetIndex = store.rooms.findIndex((snapshot) => snapshot.room.id === roomId);
  if (targetIndex < 0) {
    await captureError("Room mutation failed", new Error("Room not found."), { roomId });
    throw new Error("Room not found.");
  }

  const updated = hydrateRoomSnapshot(updater(store.rooms[targetIndex]));
  store.rooms[targetIndex] = updated;
  await writeStore(store);
  return updated;
}

export async function shareRideRoomInvite(room: RideRoom) {
  const message = `Join ${room.title} in RideSync\nCode: ${room.code}\nLink: ${room.inviteLink}`;
  await Share.share({
    message
  });
}

export async function shareRideBrief(room: RideRoom, ridePlan: RidePlan | null, members: RoomMember[]) {
  if (!ridePlan) {
    throw new Error("Ride plan not available.");
  }

  const confirmed = members.filter((member) => member.rsvpStatus === "going").length;
  const stops = ridePlan.stops.map((stop) => `- ${stop.title} (${stop.type.replaceAll("_", " ")})`).join("\n");
  const message = `${room.title}\n${ridePlan.routeTitle}\n${new Date(ridePlan.scheduledFor).toLocaleString()}\nMeetup: ${ridePlan.meetupPoint}\nDistance: ${ridePlan.distanceMiles} mi\nETA: ${ridePlan.etaMinutes} min\nConfirmed riders: ${confirmed}\nStops:\n${stops}\nNotes: ${ridePlan.notes}`;

  await Share.share({
    message
  });
}
