import AsyncStorage from "@react-native-async-storage/async-storage";
import * as Linking from "expo-linking";
import { Share } from "react-native";

import { AuthIdentity, RiderProfile } from "@/types/auth";
import {
  CreateRoomInput,
  MemberReadiness,
  PresenceState,
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

function formatClock(iso: string) {
  return new Date(iso).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
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
    presenceState: "connected",
    intercomState: "not_connected",
    joinedAt: timestamp,
    lastSeenAt: timestamp
  };
}

function buildRidePresence(members: RoomMember[]): RiderPresence[] {
  const approvedMembers = members.filter((member) => member.approvalStatus === "approved");
  const timestamp = nowIso();

  return approvedMembers.map((member, index) => ({
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
    lng: ROOM_BASE_LNG + index * 0.006
  }));
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

function buildSystemMessage(body: string, senderId: string, senderName: string): RideMessage {
  const timestamp = nowIso();

  return {
    id: buildId("message"),
    senderId,
    senderName,
    sentAt: formatClock(timestamp),
    kind: "system",
    body
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
  return {
    ...snapshot,
    room: {
      ...snapshot.room,
      riderCount: snapshot.members.filter((member) => member.approvalStatus === "approved").length
    },
    members: sortMembers(snapshot.members)
  };
}

export async function createRideRoom(input: CreateRoomInput, authIdentity: AuthIdentity, profile: RiderProfile) {
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
    messages: [buildSystemMessage("Leader opened the room.", leaderMember.id, leaderMember.riderName)]
  });

  store.rooms = [snapshot, ...store.rooms.filter((item) => item.room.id !== snapshot.room.id)];
  await writeStore(store);
  return snapshot;
}

export async function joinRideRoom(payload: RoomJoinPayload, authIdentity: AuthIdentity, profile: RiderProfile) {
  const code = parseJoinValue(payload.value);
  if (!code) {
    throw new Error("Enter a valid room code or invite link.");
  }

  const store = await readStore();
  const targetIndex = store.rooms.findIndex((snapshot) => snapshot.room.code === code);
  if (targetIndex < 0) {
    throw new Error("No room matches that code.");
  }

  const snapshot = store.rooms[targetIndex];
  if (snapshot.room.locked) {
    throw new Error("This room is locked.");
  }

  const currentMembers = snapshot.members.filter((member) => member.approvalStatus !== "pending" || member.userId !== authIdentity.uid);
  if (snapshot.members.filter((member) => member.approvalStatus === "approved").length >= snapshot.room.maxRiders) {
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
    ]
  });

  store.rooms[targetIndex] = nextSnapshot;
  await writeStore(store);
  return nextSnapshot;
}

export async function getRideRoomSnapshot(roomId: string) {
  const store = await readStore();
  const snapshot = store.rooms.find((item) => item.room.id === roomId);
  return snapshot ? hydrateRoomSnapshot(snapshot) : null;
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
  return mutateRoom(roomId, (snapshot) => ({
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
}

export async function startRideRoom(roomId: string) {
  return mutateRoom(roomId, (snapshot) => ({
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
}

export async function clearActiveRideRoom(roomId: string) {
  return mutateRoom(roomId, (snapshot) => ({
    ...snapshot,
    room: {
      ...snapshot.room,
      lifecycle: "lobby"
    },
    riders: [],
    layers: []
  }));
}

async function mutateRoom(roomId: string, updater: (snapshot: RideRoomSnapshot) => RideRoomSnapshot) {
  const store = await readStore();
  const targetIndex = store.rooms.findIndex((snapshot) => snapshot.room.id === roomId);
  if (targetIndex < 0) {
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
