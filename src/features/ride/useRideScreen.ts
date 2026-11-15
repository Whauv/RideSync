import { useEffect, useMemo, useState } from "react";
import { AppState } from "react-native";

import { useToast } from "@/providers/ToastProvider";
import { QUICK_PINGS } from "@/services/coordination";
import { hapticSoftImpact, hapticSuccess, hapticWarning } from "@/services/haptics";
import { musicSyncAdapter } from "@/services/musicSync";
import {
  createRideRoom,
  getRideRoomSnapshot,
  joinRideRoom,
  resolveActiveAlert,
  sendQuickPing,
  shareRideRoomInvite,
  startRideRoom,
  triggerSosAlert,
  updateRoomMemberPresence
} from "@/services/roomWorkflow";
import { isRoomWorkflowError } from "@/services/rooms/errors";
import { buildSafetySnapshot } from "@/services/safety";
import { voiceAdapter } from "@/services/voice";
import { useAppStore } from "@/store/useAppStore";
import { RideRoomSnapshot, RoomPrivacyMode } from "@/types/domain";

import { useSimulatedRideStream } from "@/features/ride-map/useSimulatedRideStream";

export type RideEntryMode = "create" | "join";

/**
 * Chooses toast copy and tone for a room-workflow failure. Typed
 * `RoomWorkflowError`s are expected, user-recoverable outcomes (bad code, room
 * full/locked), so they read as warnings; anything else is an unexpected error.
 */
function describeRoomError(error: unknown, fallback: string): { message: string; tone: "warning" | "danger" } {
  if (isRoomWorkflowError(error)) {
    return { message: error.message, tone: "warning" };
  }

  return { message: error instanceof Error ? error.message : fallback, tone: "danger" };
}

/**
 * Platform-specific toast copy. The native and web ride screens phrase a few
 * confirmations differently; everything else about the controller is shared.
 */
export interface RideScreenCopy {
  joinApprovalMessage: string;
  joinLobbyMessage: string;
  rideStartedMessage: string;
  leaderAnnounceMessage: string;
}

/**
 * Shared controller for the ride screens.
 *
 * Both `app/(tabs)/index.tsx` (native) and `app/(tabs)/index.web.tsx` (web)
 * previously carried a near-identical ~380 lines of store wiring, derived
 * values, effects, and action handlers. That logic lives here once; each screen
 * keeps only its platform-specific layout. Callers pass the handful of copy
 * strings that differ between surfaces.
 */
export function useRideScreen({ copy }: { copy: RideScreenCopy }) {
  const { showToast } = useToast();
  const authIdentity = useAppStore((state) => state.authIdentity);
  const profile = useAppStore((state) => state.profile);
  const pendingJoinCode = useAppStore((state) => state.pendingJoinCode);
  const setPendingJoinCode = useAppStore((state) => state.setPendingJoinCode);
  const activeRoom = useAppStore((state) => state.activeRoom);
  const roomMembers = useAppStore((state) => state.roomMembers);
  const riders = useAppStore((state) => state.riders);
  const rideLayers = useAppStore((state) => state.rideLayers);
  const messages = useAppStore((state) => state.messages);
  const musicSync = useAppStore((state) => state.musicSync);
  const roomPresenceState = useAppStore((state) => state.roomPresenceState);
  const permissions = useAppStore((state) => state.permissions);
  const voiceSession = useAppStore((state) => state.voiceSession);
  const voiceParticipants = useAppStore((state) => state.voiceParticipants);
  const activeAlert = useAppStore((state) => state.activeAlert);
  const safety = useAppStore((state) => state.safety);
  const reliability = useAppStore((state) => state.reliability);
  const runtimePreferences = useAppStore((state) => state.runtimePreferences);
  const featureFlags = useAppStore((state) => state.featureFlags);
  const messageReadAtByRoom = useAppStore((state) => state.messageReadAtByRoom);
  const setRoomPresenceState = useAppStore((state) => state.setRoomPresenceState);
  const setRoomSession = useAppStore((state) => state.setRoomSession);
  const setRideTelemetry = useAppStore((state) => state.setRideTelemetry);

  const [entryMode, setEntryMode] = useState<RideEntryMode>("create");
  const [busy, setBusy] = useState(false);
  const [roomName, setRoomName] = useState("");
  const [privacyMode, setPrivacyMode] = useState<RoomPrivacyMode>("invite_only");
  const [routeTitle, setRouteTitle] = useState("");
  const [maxRiders, setMaxRiders] = useState(8);
  const [joinValue, setJoinValue] = useState("");
  const [sosVisible, setSosVisible] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  const currentMember = useMemo(
    () => roomMembers.find((member) => member.userId === authIdentity?.uid) ?? null,
    [authIdentity?.uid, roomMembers]
  );
  const isLeaderView = currentMember?.role === "leader";
  const canUseVoice = permissions.microphone === "granted" && permissions.audio === "granted";
  const approvedCount = roomMembers.filter((member) => member.approvalStatus === "approved").length;
  const pendingCount = roomMembers.filter((member) => member.approvalStatus === "pending").length;
  const readyCount = roomMembers.filter((member) => member.readiness === "ready" && member.approvalStatus === "approved").length;
  const unreadCount = useMemo(() => {
    if (!activeRoom) {
      return 0;
    }

    const lastReadAt = messageReadAtByRoom[activeRoom.id];
    return messages.filter((message) => !lastReadAt || message.createdAt > lastReadAt).length;
  }, [activeRoom, messageReadAtByRoom, messages]);
  const staleLocationSeconds = useMemo(() => {
    if (riders.length === 0) {
      return 0;
    }

    const latest = riders.reduce(
      (accumulator, rider) => (rider.lastUpdatedAt > accumulator ? rider.lastUpdatedAt : accumulator),
      riders[0]?.lastUpdatedAt ?? new Date().toISOString()
    );

    return Math.max(0, Math.round((Date.now() - new Date(latest).getTime()) / 1000));
  }, [riders]);

  useSimulatedRideStream({
    enabled: activeRoom?.lifecycle === "rolling",
    riders,
    degraded: roomPresenceState !== "connected",
    batterySaverMode: runtimePreferences.batterySaverMode,
    reducedCadence: runtimePreferences.reducedGpsCadence,
    onTick: (nextRiders) => {
      if (!activeRoom || !safety) {
        return;
      }

      const nextSafety = buildSafetySnapshot(
        {
          room: activeRoom,
          members: roomMembers,
          riders: nextRiders,
          layers: rideLayers,
          messages,
          activeAlert,
          ridePlan: null,
          safety
        },
        safety
      );
      setRideTelemetry(nextRiders, nextSafety);
    }
  });

  useEffect(() => {
    if (pendingJoinCode) {
      setEntryMode("join");
      setJoinValue(pendingJoinCode);
    }
  }, [pendingJoinCode]);

  useEffect(() => {
    if (!activeRoom || !authIdentity) {
      return;
    }

    const subscription = AppState.addEventListener("change", async (state) => {
      if (!currentMember) {
        return;
      }

      const nextPresence = state === "active" ? "connected" : "reconnecting";
      setRoomPresenceState(nextPresence);

      const snapshot = await updateRoomMemberPresence(activeRoom.id, authIdentity.uid, nextPresence);
      setRoomSession(snapshot);
    });

    return () => subscription.remove();
  }, [activeRoom, authIdentity, currentMember, setRoomPresenceState, setRoomSession]);

  async function handleCreateRoom() {
    if (!authIdentity) {
      return;
    }

    if (!roomName.trim()) {
      showToast({
        title: "Add a room name",
        message: "Leaders need a clear room name before inviting riders.",
        tone: "warning"
      });
      return;
    }

    setBusy(true);
    try {
      const snapshot = await createRideRoom(
        {
          roomName,
          privacyMode,
          routeTitle,
          maxRiders
        },
        authIdentity,
        profile
      );
      setRoomSession(snapshot);
      showToast({
        title: "Room created",
        message: `${snapshot.room.title} is ready for riders to join.`,
        tone: "success"
      });
      await hapticSuccess();
    } catch (error) {
      const detail = describeRoomError(error, "Unable to create room.");
      showToast({
        title: "Room creation failed",
        message: detail.message,
        tone: detail.tone
      });
    } finally {
      setBusy(false);
    }
  }

  async function handleJoinRoom() {
    if (!authIdentity) {
      return;
    }

    setBusy(true);
    try {
      const snapshot = await joinRideRoom({ value: joinValue }, authIdentity, profile);
      setRoomSession(snapshot);
      setPendingJoinCode(null);
      showToast({
        title: "Room joined",
        message: snapshot.room.privacyMode === "approval_required" ? copy.joinApprovalMessage : copy.joinLobbyMessage,
        tone: "success"
      });
      await hapticSuccess();
    } catch (error) {
      const detail = describeRoomError(error, "Unable to join room.");
      showToast({
        title: "Join failed",
        message: detail.message,
        tone: detail.tone
      });
    } finally {
      setBusy(false);
    }
  }

  async function handleShareInvite() {
    if (!activeRoom) {
      return;
    }

    await hapticSoftImpact();
    await shareRideRoomInvite(activeRoom);
  }

  async function handleLeaderAction(action: () => Promise<RideRoomSnapshot>) {
    if (!activeRoom) {
      return;
    }

    const snapshot = await action();
    setRoomSession(snapshot);
  }

  async function handleStartRide() {
    if (!activeRoom) {
      return;
    }

    const snapshot = await startRideRoom(activeRoom.id);
    setRoomSession(snapshot);
    showToast({
      title: "Ride started",
      message: copy.rideStartedMessage,
      tone: "success"
    });
    await hapticSuccess();
  }

  async function handleToggleMute() {
    await voiceAdapter.setMuted(!voiceSession.selfMuted);
  }

  async function handleRetryVoice() {
    await voiceAdapter.retryConnection();
  }

  async function handleLeaderAnnounce() {
    await voiceAdapter.requestLeaderAnnounce();
    await hapticSoftImpact();
    showToast({
      title: "Announce mode queued",
      message: copy.leaderAnnounceMessage,
      tone: "warning"
    });
  }

  async function handleQuickPing(type: (typeof QUICK_PINGS)[number]["type"]) {
    if (!activeRoom || !authIdentity) {
      return;
    }

    const snapshot = await sendQuickPing(activeRoom.id, authIdentity, profile, type);
    setRoomSession(snapshot);
    showToast({
      title: QUICK_PINGS.find((ping) => ping.type === type)?.label ?? "Ping sent",
      message: "The room was updated immediately.",
      tone: type === "emergency" || type === "hazard" ? "warning" : "success"
    });
    if (type === "emergency" || type === "hazard") {
      await hapticWarning();
      return;
    }

    await hapticSoftImpact();
  }

  async function handleResolveAlert() {
    if (!activeRoom || !authIdentity) {
      return;
    }

    const snapshot = await resolveActiveAlert(activeRoom.id, authIdentity, profile);
    setRoomSession(snapshot);
    await hapticSoftImpact();
  }

  async function handleConfirmSos(countdownSeconds: number) {
    if (!activeRoom || !authIdentity) {
      return;
    }

    setSosVisible(false);
    const snapshot = await triggerSosAlert(activeRoom.id, authIdentity, profile, countdownSeconds);
    setRoomSession(snapshot);
    await hapticWarning();
  }

  async function handleMusicPlayPause() {
    if (musicSync.playbackState === "playing") {
      await musicSyncAdapter.pause();
      return;
    }

    await musicSyncAdapter.play();
  }

  async function handleMusicNext() {
    await musicSyncAdapter.skipNext();
  }

  async function handleMusicPrevious() {
    await musicSyncAdapter.skipPrevious();
  }

  async function handleMusicResync() {
    await musicSyncAdapter.resyncNow();
  }

  async function handleRetryRoomSync() {
    if (!activeRoom) {
      return;
    }

    const snapshot = await getRideRoomSnapshot(activeRoom.id);
    if (!snapshot) {
      showToast({
        title: "Room snapshot unavailable",
        message: "No stored room snapshot could be recovered yet.",
        tone: "warning"
      });
      return;
    }

    setRoomSession(snapshot);
    showToast({
      title: "Room recovered",
      message: "Local room state was refreshed from the last stored snapshot.",
      tone: "success"
    });
    await hapticSuccess();
  }

  async function handleRefresh() {
    if (!activeRoom) {
      return;
    }

    setRefreshing(true);
    try {
      const snapshot = await getRideRoomSnapshot(activeRoom.id);
      if (snapshot) {
        setRoomSession(snapshot);
        await hapticSoftImpact();
      }
    } finally {
      setRefreshing(false);
    }
  }

  function handleMixDelta(delta: number) {
    musicSyncAdapter.setLocalMixPct(musicSync.localMixPct + delta);
  }

  return {
    // store state
    authIdentity,
    profile,
    pendingJoinCode,
    setPendingJoinCode,
    activeRoom,
    roomMembers,
    riders,
    rideLayers,
    messages,
    musicSync,
    roomPresenceState,
    permissions,
    voiceSession,
    voiceParticipants,
    activeAlert,
    safety,
    reliability,
    runtimePreferences,
    featureFlags,
    // local state
    entryMode,
    setEntryMode,
    busy,
    roomName,
    setRoomName,
    privacyMode,
    setPrivacyMode,
    routeTitle,
    setRouteTitle,
    maxRiders,
    setMaxRiders,
    joinValue,
    setJoinValue,
    sosVisible,
    setSosVisible,
    refreshing,
    // derived
    currentMember,
    isLeaderView,
    canUseVoice,
    approvedCount,
    pendingCount,
    readyCount,
    unreadCount,
    staleLocationSeconds,
    // handlers
    handleCreateRoom,
    handleJoinRoom,
    handleShareInvite,
    handleLeaderAction,
    handleStartRide,
    handleToggleMute,
    handleRetryVoice,
    handleLeaderAnnounce,
    handleQuickPing,
    handleResolveAlert,
    handleConfirmSos,
    handleMusicPlayPause,
    handleMusicNext,
    handleMusicPrevious,
    handleMusicResync,
    handleRetryRoomSync,
    handleRefresh,
    handleMixDelta
  };
}
