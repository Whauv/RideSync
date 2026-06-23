import { AppState, StyleSheet, View } from "react-native";
import { useEffect, useMemo, useState } from "react";
import { router } from "expo-router";

import { ActiveAlertBanner } from "@/components/coordination/ActiveAlertBanner";
import { QuickActionsTray } from "@/components/coordination/QuickActionsTray";
import { SOSModal } from "@/components/coordination/SOSModal";
import { WebDevModeCard } from "@/components/dev/WebDevModeCard";
import { LeaderMusicPanel } from "@/components/music/LeaderMusicPanel";
import { MusicSyncDiagnostics } from "@/components/music/MusicSyncDiagnostics";
import { RiderPlaybackPanel } from "@/components/music/RiderPlaybackPanel";
import { AppHeader } from "@/components/primitives/AppHeader";
import { AppText } from "@/components/primitives/AppText";
import { Button } from "@/components/primitives/Button";
import { Chip } from "@/components/primitives/Chip";
import { EmptyState } from "@/components/primitives/EmptyState";
import { IconButton } from "@/components/primitives/IconButton";
import { ListRow } from "@/components/primitives/ListRow";
import { Screen } from "@/components/primitives/Screen";
import { SegmentedControl } from "@/components/primitives/SegmentedControl";
import { Surface } from "@/components/primitives/Surface";
import { TextField } from "@/components/primitives/TextField";
import { ResilienceBanner } from "@/components/reliability/ResilienceBanner";
import { SafetyOverviewCard } from "@/components/safety/SafetyOverviewCard";
import { VoiceControlBar } from "@/components/voice/VoiceControlBar";
import { LobbyMemberRow } from "@/components/room/LobbyMemberRow";
import { RoomInviteCard } from "@/components/room/RoomInviteCard";
import { LiveRideMap } from "@/components/ride/LiveRideMap";
import { useSimulatedRideStream } from "@/features/ride-map/useSimulatedRideStream";
import { useToast } from "@/providers/ToastProvider";
import { QUICK_PINGS } from "@/services/coordination";
import { hapticSoftImpact, hapticSuccess, hapticWarning } from "@/services/haptics";
import { buildSafetySnapshot } from "@/services/safety";
import {
  approveRoomMember,
  clearActiveRideRoom,
  createRideRoom,
  joinRideRoom,
  removeRoomMember,
  resolveActiveAlert,
  sendQuickPing,
  setRoomLocked,
  shareRideRoomInvite,
  startRideRoom,
  triggerSosAlert,
  getRideRoomSnapshot,
  updateRoomMemberIntercom,
  updateRoomMemberPresence,
  updateRoomMemberReadiness
} from "@/services/roomWorkflow";
import { voiceAdapter } from "@/services/voice";
import { musicSyncAdapter } from "@/services/musicSync";
import { useAppStore } from "@/store/useAppStore";
import { RideRoomSnapshot, RoomPrivacyMode } from "@/types/domain";

type EntryMode = "create" | "join";

export default function RideScreen() {
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

  const [entryMode, setEntryMode] = useState<EntryMode>("create");
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
      (accumulator, rider) =>
        rider.lastUpdatedAt > accumulator ? rider.lastUpdatedAt : accumulator,
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
      setRoomSession(
        snapshot.room,
        snapshot.members,
        snapshot.riders,
        snapshot.layers,
        snapshot.messages,
        snapshot.activeAlert,
        snapshot.ridePlan,
        snapshot.safety
      );
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
      setRoomSession(
        snapshot.room,
        snapshot.members,
        snapshot.riders,
        snapshot.layers,
        snapshot.messages,
        snapshot.activeAlert,
        snapshot.ridePlan,
        snapshot.safety
      );
      showToast({
        title: "Room created",
        message: `${snapshot.room.title} is ready for riders to join.`,
        tone: "success"
      });
      await hapticSuccess();
    } catch (error) {
      showToast({
        title: "Room creation failed",
        message: error instanceof Error ? error.message : "Unable to create room.",
        tone: "danger"
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
      setRoomSession(
        snapshot.room,
        snapshot.members,
        snapshot.riders,
        snapshot.layers,
        snapshot.messages,
        snapshot.activeAlert,
        snapshot.ridePlan,
        snapshot.safety
      );
      setPendingJoinCode(null);
      showToast({
        title: "Room joined",
        message:
          snapshot.room.privacyMode === "approval_required"
            ? "Your join request was sent to the leader."
            : "You are in the ride lobby.",
        tone: "success"
      });
      await hapticSuccess();
    } catch (error) {
      showToast({
        title: "Join failed",
        message: error instanceof Error ? error.message : "Unable to join room.",
        tone: "danger"
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
    setRoomSession(
      snapshot.room,
      snapshot.members,
      snapshot.riders,
      snapshot.layers,
      snapshot.messages,
      snapshot.activeAlert,
      snapshot.ridePlan,
      snapshot.safety
    );
  }

  async function handleStartRide() {
    if (!activeRoom) {
      return;
    }

    const snapshot = await startRideRoom(activeRoom.id);
    setRoomSession(
      snapshot.room,
      snapshot.members,
      snapshot.riders,
      snapshot.layers,
      snapshot.messages,
      snapshot.activeAlert,
      snapshot.ridePlan,
      snapshot.safety
    );
    showToast({
      title: "Ride started",
      message: "The room moved from lobby to live ride mode.",
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
      message: "Leader-priority voice routing is stubbed in UI and ready for transport policy wiring.",
      tone: "warning"
    });
  }

  async function handleQuickPing(type: (typeof QUICK_PINGS)[number]["type"]) {
    if (!activeRoom || !authIdentity) {
      return;
    }

    const snapshot = await sendQuickPing(activeRoom.id, authIdentity, profile, type);
    setRoomSession(
      snapshot.room,
      snapshot.members,
      snapshot.riders,
      snapshot.layers,
      snapshot.messages,
      snapshot.activeAlert,
      snapshot.ridePlan,
      snapshot.safety
    );
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
    setRoomSession(
      snapshot.room,
      snapshot.members,
      snapshot.riders,
      snapshot.layers,
      snapshot.messages,
      snapshot.activeAlert,
      snapshot.ridePlan,
      snapshot.safety
    );
    await hapticSoftImpact();
  }

  async function handleConfirmSos(countdownSeconds: number) {
    if (!activeRoom || !authIdentity) {
      return;
    }

    setSosVisible(false);
    const snapshot = await triggerSosAlert(activeRoom.id, authIdentity, profile, countdownSeconds);
    setRoomSession(
      snapshot.room,
      snapshot.members,
      snapshot.riders,
      snapshot.layers,
      snapshot.messages,
      snapshot.activeAlert,
      snapshot.ridePlan,
      snapshot.safety
    );
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

    setRoomSession(
      snapshot.room,
      snapshot.members,
      snapshot.riders,
      snapshot.layers,
      snapshot.messages,
      snapshot.activeAlert,
      snapshot.ridePlan,
      snapshot.safety
    );
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
        setRoomSession(
          snapshot.room,
          snapshot.members,
          snapshot.riders,
          snapshot.layers,
          snapshot.messages,
          snapshot.activeAlert,
          snapshot.ridePlan,
          snapshot.safety
        );
        await hapticSoftImpact();
      }
    } finally {
      setRefreshing(false);
    }
  }

  function handleMixDelta(delta: number) {
    musicSyncAdapter.setLocalMixPct(musicSync.localMixPct + delta);
  }

  if (!activeRoom) {
    return (
      <Screen onRefresh={handleRefresh} refreshing={refreshing} scroll>
        <AppHeader
          eyebrow="RIDE ROOM"
          subtitle="Create a premium ride-control room or join from an invite link, QR card, or direct code."
          title="Control center"
        />

        <Surface raised style={styles.entryCard}>
          <SegmentedControl
            onChange={setEntryMode}
            options={[
              { label: "Create room", value: "create" },
              { label: "Join room", value: "join" }
            ]}
            value={entryMode}
          />

          {entryMode === "create" ? (
            <View style={styles.form}>
              <TextField label="Room name" onChangeText={setRoomName} placeholder="Front Range Dawn Run" value={roomName} />
              <SegmentedControl
                onChange={setPrivacyMode}
                options={[
                  { label: "Invite only", value: "invite_only" },
                  { label: "Approve riders", value: "approval_required" }
                ]}
                value={privacyMode}
              />
              <TextField
                helperText="Optional route or regroup label."
                label="Route title"
                onChangeText={setRouteTitle}
                placeholder="Nederland Loop"
                value={routeTitle}
              />
              <Surface muted style={styles.maxRiderCard}>
                <View>
                  <AppText variant="footnote" tone="secondary">
                    Max riders
                  </AppText>
                  <AppText variant="title2">{maxRiders}</AppText>
                </View>
                <View style={styles.maxControls}>
                  <IconButton icon="minus" onPress={() => setMaxRiders((current) => Math.max(2, current - 1))} />
                  <IconButton icon="plus" onPress={() => setMaxRiders((current) => Math.min(24, current + 1))} />
                </View>
              </Surface>
              <Button label="Create ride room" loading={busy} onPress={handleCreateRoom} />
            </View>
          ) : (
            <View style={styles.form}>
              <TextField
                helperText="Paste a deep link or enter the room code."
                label="Invite link or code"
                onChangeText={setJoinValue}
                placeholder="A7Q9K or ridesync://join?code=A7Q9K"
                value={joinValue}
              />
              {pendingJoinCode ? (
                <ListRow
                  leading={<Chip label="Invite detected" tone="accent" />}
                  subtitle="A deep link prefilled this code. You can edit it before joining."
                  title={pendingJoinCode}
                  trailing={<Button label="Clear" onPress={() => setPendingJoinCode(null)} variant="ghost" />}
                />
              ) : null}
              <Button label="Join ride room" loading={busy} onPress={handleJoinRoom} />
            </View>
          )}
        </Surface>

        <EmptyState
          actionLabel="Open design showcase"
          body="Once a room exists, the ride tab becomes a premium lobby with invite sharing, presence, and leader control."
          icon="motorbike"
          onAction={() => router.push("/internal/design-showcase")}
          title="No active room"
        />
      </Screen>
    );
  }

  if (activeRoom.lifecycle === "rolling") {
    return (
      <Screen onRefresh={handleRefresh} refreshing={refreshing} scroll>
        <AppHeader
          eyebrow={`ROOM ${activeRoom.code}`}
          right={<IconButton icon="dots-horizontal" onPress={() => router.push("/modal")} />}
          subtitle={`${activeRoom.routeTitle ?? "Open route"} | ${approvedCount} approved riders | ${roomPresenceState}`}
          title={activeRoom.title}
        />

        {activeAlert?.status === "active" ? <ActiveAlertBanner alert={activeAlert} onResolve={handleResolveAlert} /> : null}
        <ResilienceBanner
          onRetrySync={handleRetryRoomSync}
          onRetryVoice={handleRetryVoice}
          reliability={reliability}
          staleLocationSeconds={staleLocationSeconds}
          voiceSession={voiceSession}
        />
        {safety ? <SafetyOverviewCard onOpenMedicalCard={() => router.push("/medical-card")} safety={safety} /> : null}

        {safety ? (
          <LiveRideMap
            activeAlert={activeAlert}
            allowLeaderAnnounce={featureFlags.voiceLeaderAnnounce}
            canUseVoice={canUseVoice}
            isLeaderView={Boolean(isLeaderView)}
            layers={rideLayers}
            onLeaderAnnounce={handleLeaderAnnounce}
            onRetryVoice={handleRetryVoice}
            onToggleMute={handleToggleMute}
            riders={riders}
            room={activeRoom}
            safety={safety}
            voiceParticipants={voiceParticipants}
            voiceSession={voiceSession}
          />
        ) : null}

        <QuickActionsTray
          onOpenComms={() => router.push("/(tabs)/comms")}
          onOpenSos={() => setSosVisible(true)}
          onPing={handleQuickPing}
          pingOptions={QUICK_PINGS}
          unreadCount={unreadCount}
        />

        <View style={styles.metricsRow}>
          <Surface raised style={styles.metricCard}>
            <AppText tone="secondary" variant="footnote">
              Group pace
            </AppText>
            <AppText variant="metric">{safety?.insights.averageSpeedMph ?? 0}</AppText>
            <Chip label="Rolling" tone="success" />
          </Surface>
          <Surface style={styles.metricCard}>
            <AppText tone="secondary" variant="footnote">
              Safety focus
            </AppText>
            <AppText variant="title2">
              {safety?.fuelAlerts[0] ? `${Math.round(safety.fuelAlerts[0].rangeMiles)} mi margin` : "Clear"}
            </AppText>
            <AppText tone="secondary" variant="callout">
              {safety?.stragglers[0]
                ? `${safety.stragglers[0].riderName} needs formation review`
                : safety?.hazards[0]
                  ? `${safety.hazards[0].title} reported`
                  : "No active spacing or fuel escalations."}
            </AppText>
          </Surface>
        </View>

        {isLeaderView ? (
          <LeaderMusicPanel
            onPlayPause={handleMusicPlayPause}
            onSkipNext={handleMusicNext}
            onSkipPrevious={handleMusicPrevious}
            snapshot={musicSync}
          />
        ) : (
          <RiderPlaybackPanel
            onMixDown={() => handleMixDelta(-8)}
            onMixUp={() => handleMixDelta(8)}
            snapshot={musicSync}
          />
        )}

        {featureFlags.musicSyncDiagnostics ? <MusicSyncDiagnostics onResync={handleMusicResync} snapshot={musicSync} /> : null}

        <Surface style={styles.panel}>
          <ListRow
            leading={<Chip label={roomPresenceState} tone={roomPresenceState === "connected" ? "success" : "warning"} />}
            subtitle="Presence and reconnect state stay visible but calm while the ride is live."
            title="Presence status"
          />
          {isLeaderView ? <Button label="Return to lobby" onPress={() => handleLeaderAction(() => clearActiveRideRoom(activeRoom.id))} variant="secondary" /> : null}
        </Surface>
      </Screen>
    );
  }

  return (
    <Screen scroll>
      <AppHeader
        eyebrow={`ROOM ${activeRoom.code}`}
        right={
          activeAlert?.status === "active" ? (
            <Chip label="Alert active" tone="danger" />
          ) : (
            <Chip label={activeRoom.locked ? "Locked" : "Open"} tone={activeRoom.locked ? "warning" : "success"} />
          )
        }
        subtitle={`${activeRoom.routeTitle ?? "Route not set"} | ${approvedCount}/${activeRoom.maxRiders} approved riders`}
        title={activeRoom.title}
      />

      <WebDevModeCard />

      {activeAlert?.status === "active" ? <ActiveAlertBanner alert={activeAlert} onResolve={handleResolveAlert} /> : null}
      <ResilienceBanner
        onRetrySync={handleRetryRoomSync}
        onRetryVoice={handleRetryVoice}
        reliability={reliability}
        staleLocationSeconds={staleLocationSeconds}
        voiceSession={voiceSession}
      />

      <View style={styles.metricsRow}>
        <Surface raised style={styles.metricCard}>
          <AppText tone="secondary" variant="footnote">
            Approved riders
          </AppText>
          <AppText variant="metric">{approvedCount}</AppText>
          <Chip label={`${readyCount} ready`} tone="success" />
        </Surface>
        <Surface style={styles.metricCard}>
          <AppText tone="secondary" variant="footnote">
            Presence
          </AppText>
          <AppText variant="title2">{roomPresenceState}</AppText>
          <AppText tone="secondary" variant="callout">
            {pendingCount > 0 ? `${pendingCount} riders awaiting approval.` : "Room roster is clear."}
          </AppText>
        </Surface>
      </View>

      <RoomInviteCard room={activeRoom} onShare={handleShareInvite} />
      {safety ? <SafetyOverviewCard onOpenMedicalCard={() => router.push("/medical-card")} safety={safety} /> : null}

      <Surface style={styles.panel}>
          <ListRow
            leading={<Chip label={roomPresenceState} tone={roomPresenceState === "connected" ? "success" : "warning"} />}
            subtitle="Current device presence and reconnect health update with foreground changes."
            title="Presence sync"
            trailing={
              roomPresenceState !== "connected" ? (
                <Button
                  label="Retry"
                  onPress={() => {
                    if (!authIdentity) {
                      return;
                    }

                    void handleLeaderAction(() => updateRoomMemberPresence(activeRoom.id, authIdentity.uid, "connected"));
                  }}
                  variant="ghost"
                />
              ) : undefined
            }
          />
      </Surface>

      <VoiceControlBar
        allowLeaderAnnounce={featureFlags.voiceLeaderAnnounce}
        canUseVoice={canUseVoice}
        isLeaderView={Boolean(isLeaderView)}
        onLeaderAnnounce={handleLeaderAnnounce}
        onRetry={handleRetryVoice}
        onToggleMute={handleToggleMute}
        voiceSession={voiceSession}
      />

      {isLeaderView ? (
        <LeaderMusicPanel
          onPlayPause={handleMusicPlayPause}
          onSkipNext={handleMusicNext}
          onSkipPrevious={handleMusicPrevious}
          snapshot={musicSync}
        />
      ) : (
        <RiderPlaybackPanel
          onMixDown={() => handleMixDelta(-8)}
          onMixUp={() => handleMixDelta(8)}
          snapshot={musicSync}
        />
      )}

      {featureFlags.musicSyncDiagnostics ? <MusicSyncDiagnostics onResync={handleMusicResync} snapshot={musicSync} /> : null}

      <QuickActionsTray
        onOpenComms={() => router.push("/(tabs)/comms")}
        onOpenSos={() => setSosVisible(true)}
        onPing={handleQuickPing}
        pingOptions={QUICK_PINGS}
        unreadCount={unreadCount}
      />

      <View style={styles.memberStack}>
        {roomMembers.map((member) => (
          <LobbyMemberRow
            key={member.id}
            isCurrentUser={member.userId === authIdentity?.uid}
            isLeaderView={Boolean(isLeaderView)}
            member={member}
            voiceParticipant={voiceParticipants[member.id]}
            onApprove={() => handleLeaderAction(() => approveRoomMember(activeRoom.id, member.id))}
            onRemove={() => handleLeaderAction(() => removeRoomMember(activeRoom.id, member.id))}
            onToggleIntercom={() =>
              handleLeaderAction(() =>
                updateRoomMemberIntercom(activeRoom.id, member.userId, member.intercomState !== "connected")
              )
            }
            onToggleReady={() =>
              handleLeaderAction(() =>
                updateRoomMemberReadiness(activeRoom.id, member.userId, member.readiness === "ready" ? "review" : "ready")
              )
            }
          />
        ))}
      </View>

      {isLeaderView ? (
        <Surface raised style={styles.panel}>
          <AppText variant="title3">Leader controls</AppText>
          <AppText tone="secondary">
            Approve riders, secure the room, and start the ride when the roster is ready.
          </AppText>
          <Button
            label={activeRoom.locked ? "Unlock room" : "Lock room"}
            onPress={() => handleLeaderAction(() => setRoomLocked(activeRoom.id, !activeRoom.locked))}
            variant="secondary"
          />
          <Button label="Start ride" onPress={handleStartRide} />
        </Surface>
      ) : (
        <Surface style={styles.panel}>
          <AppText variant="title3">Waiting room status</AppText>
          <AppText tone="secondary">
            {currentMember?.approvalStatus === "pending"
              ? "Leader approval is still required before you enter the live ride."
              : "Set readiness and intercom state here while the leader stages the group."}
          </AppText>
        </Surface>
      )}
      <SOSModal onCancel={() => setSosVisible(false)} onConfirm={handleConfirmSos} visible={sosVisible} />
    </Screen>
  );
}

const styles = StyleSheet.create({
  entryCard: {
    padding: 16,
    gap: 16,
    marginBottom: 12
  },
  form: {
    gap: 14
  },
  maxRiderCard: {
    padding: 14,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center"
  },
  maxControls: {
    flexDirection: "row",
    gap: 8
  },
  metricsRow: {
    flexDirection: "row",
    gap: 12,
    marginTop: 12,
    marginBottom: 12
  },
  metricCard: {
    flex: 1,
    padding: 16,
    gap: 6
  },
  panel: {
    padding: 16,
    gap: 10,
    marginTop: 12
  },
  memberStack: {
    gap: 10,
    marginTop: 12
  }
});
