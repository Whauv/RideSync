import { AppState, StyleSheet, View, useWindowDimensions } from "react-native";
import { useEffect, useMemo, useState } from "react";
import { router } from "expo-router";

import { ActiveAlertBanner } from "@/components/coordination/ActiveAlertBanner";
import { QuickActionsTray } from "@/components/coordination/QuickActionsTray";
import { SOSModal } from "@/components/coordination/SOSModal";
import { LeaderMusicPanel } from "@/components/music/LeaderMusicPanel";
import { MusicSyncDiagnostics } from "@/components/music/MusicSyncDiagnostics";
import { RiderPlaybackPanel } from "@/components/music/RiderPlaybackPanel";
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
import { LiveRideMap } from "@/components/ride/LiveRideMap";
import { MapPreview } from "@/components/ride/MapPreview";
import { LobbyMemberRow } from "@/components/room/LobbyMemberRow";
import { RoomInviteCard } from "@/components/room/RoomInviteCard";
import { SafetyOverviewCard } from "@/components/safety/SafetyOverviewCard";
import { VoiceControlBar } from "@/components/voice/VoiceControlBar";
import { WebMetricCard } from "@/components/web/WebMetricCard";
import { WebScaffold } from "@/components/web/WebScaffold";
import { useSimulatedRideStream } from "@/features/ride-map/useSimulatedRideStream";
import { useToast } from "@/providers/ToastProvider";
import { QUICK_PINGS } from "@/services/coordination";
import { hapticSoftImpact, hapticSuccess, hapticWarning } from "@/services/haptics";
import { musicSyncAdapter } from "@/services/musicSync";
import {
  approveRoomMember,
  clearActiveRideRoom,
  createRideRoom,
  getRideRoomSnapshot,
  joinRideRoom,
  removeRoomMember,
  resolveActiveAlert,
  sendQuickPing,
  setRoomLocked,
  shareRideRoomInvite,
  startRideRoom,
  triggerSosAlert,
  updateRoomMemberIntercom,
  updateRoomMemberPresence,
  updateRoomMemberReadiness
} from "@/services/roomWorkflow";
import { buildSafetySnapshot } from "@/services/safety";
import { voiceAdapter } from "@/services/voice";
import { useAppStore } from "@/store/useAppStore";
import { RideRoomSnapshot, RoomPrivacyMode, RiderPresence } from "@/types/domain";

type EntryMode = "create" | "join";

const previewRiders: RiderPresence[] = [
  {
    id: "preview-leader",
    name: "Maya Chen",
    role: "leader",
    bike: "BMW R 1250 GS",
    speedMph: 64,
    headingDeg: 102,
    status: "rolling",
    isTalking: true,
    hasMusicSync: true,
    batteryPct: 84,
    signalState: "strong",
    lastUpdatedAt: new Date().toISOString(),
    lat: 39.7392,
    lng: -104.9903,
    fuelRangeMiles: 126
  },
  {
    id: "preview-rider-1",
    name: "Alex Park",
    role: "rider",
    bike: "Tiger 900 Rally",
    speedMph: 62,
    headingDeg: 106,
    status: "rolling",
    isTalking: false,
    hasMusicSync: true,
    batteryPct: 77,
    signalState: "moderate",
    lastUpdatedAt: new Date().toISOString(),
    lat: 39.7434,
    lng: -104.9821,
    fuelRangeMiles: 110
  },
  {
    id: "preview-rider-2",
    name: "Luis Ortega",
    role: "rider",
    bike: "Africa Twin",
    speedMph: 61,
    headingDeg: 98,
    status: "rolling",
    isTalking: false,
    hasMusicSync: false,
    batteryPct: 72,
    signalState: "moderate",
    lastUpdatedAt: new Date().toISOString(),
    lat: 39.7364,
    lng: -104.9704,
    fuelRangeMiles: 103
  }
];

export default function RideWebScreen() {
  const { showToast } = useToast();
  const { width } = useWindowDimensions();
  const desktop = width >= 1280;
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
      setRoomSession(snapshot.room, snapshot.members, snapshot.riders, snapshot.layers, snapshot.messages, snapshot.activeAlert, snapshot.ridePlan, snapshot.safety);
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
      setRoomSession(snapshot.room, snapshot.members, snapshot.riders, snapshot.layers, snapshot.messages, snapshot.activeAlert, snapshot.ridePlan, snapshot.safety);
      setPendingJoinCode(null);
      showToast({
        title: "Room joined",
        message: snapshot.room.privacyMode === "approval_required" ? "Your request was sent to the leader." : "You are in the web command center.",
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
    setRoomSession(snapshot.room, snapshot.members, snapshot.riders, snapshot.layers, snapshot.messages, snapshot.activeAlert, snapshot.ridePlan, snapshot.safety);
  }

  async function handleStartRide() {
    if (!activeRoom) {
      return;
    }

    const snapshot = await startRideRoom(activeRoom.id);
    setRoomSession(snapshot.room, snapshot.members, snapshot.riders, snapshot.layers, snapshot.messages, snapshot.activeAlert, snapshot.ridePlan, snapshot.safety);
    showToast({
      title: "Ride started",
      message: "The room moved from lobby to live desktop monitoring mode.",
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
      message: "Leader-priority routing remains transport-ready and provider-aware.",
      tone: "warning"
    });
  }

  async function handleQuickPing(type: (typeof QUICK_PINGS)[number]["type"]) {
    if (!activeRoom || !authIdentity) {
      return;
    }

    const snapshot = await sendQuickPing(activeRoom.id, authIdentity, profile, type);
    setRoomSession(snapshot.room, snapshot.members, snapshot.riders, snapshot.layers, snapshot.messages, snapshot.activeAlert, snapshot.ridePlan, snapshot.safety);
    showToast({
      title: QUICK_PINGS.find((ping) => ping.type === type)?.label ?? "Ping sent",
      message: "The room updated immediately.",
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
    setRoomSession(snapshot.room, snapshot.members, snapshot.riders, snapshot.layers, snapshot.messages, snapshot.activeAlert, snapshot.ridePlan, snapshot.safety);
    await hapticSoftImpact();
  }

  async function handleConfirmSos(countdownSeconds: number) {
    if (!activeRoom || !authIdentity) {
      return;
    }

    setSosVisible(false);
    const snapshot = await triggerSosAlert(activeRoom.id, authIdentity, profile, countdownSeconds);
    setRoomSession(snapshot.room, snapshot.members, snapshot.riders, snapshot.layers, snapshot.messages, snapshot.activeAlert, snapshot.ridePlan, snapshot.safety);
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

    setRoomSession(snapshot.room, snapshot.members, snapshot.riders, snapshot.layers, snapshot.messages, snapshot.activeAlert, snapshot.ridePlan, snapshot.safety);
    showToast({
      title: "Room recovered",
      message: "Local room state was refreshed from the last stored snapshot.",
      tone: "success"
    });
    await hapticSuccess();
  }

  function handleMixDelta(delta: number) {
    musicSyncAdapter.setLocalMixPct(musicSync.localMixPct + delta);
  }

  if (!activeRoom) {
    return (
      <Screen contentStyle={styles.screen} scroll>
        <WebScaffold
          eyebrow="WEB PRODUCT SURFACE"
          right={
            <>
              <Button label="Marketing" onPress={() => router.push("/marketing")} variant="secondary" />
              <Button label="Admin" onPress={() => router.push("/admin")} />
            </>
          }
          subtitle="Desktop is the right place for route planning, rider staging, device setup, and live group monitoring."
          title="RideSync command center"
        >
          <View style={[styles.shellGrid, desktop && styles.shellGridDesktop]}>
            <View style={styles.mainColumn}>
              <Surface raised style={styles.desktopHeroCard}>
                <View style={styles.desktopHeroHeader}>
                  <View style={styles.desktopHeroCopy}>
                    <Chip icon="headset" label="Pair headset in OS settings" tone="accent" />
                    <AppText variant="title1">Use the browser as the pre-ride and live-monitoring surface.</AppText>
                    <AppText tone="secondary" variant="callout">
                      Riders can pair a Bluetooth helmet headset or intercom to the laptop, then use RideSync for room voice, map awareness, and coordination before the mobile runtime takes over.
                    </AppText>
                  </View>
                  <View style={styles.desktopMetricStack}>
                    <WebMetricCard detail="Desktop-native planning and room control" label="Primary browser value" value="Pre-ride ops" />
                    <WebMetricCard detail="Mobile-native background, alerts, and ride-time hardware behavior" label="Mobile value" value="Ride runtime" />
                  </View>
                </View>

                <MapPreview riders={previewRiders} />
              </Surface>
            </View>

            <View style={styles.sidebarColumn}>
              <Surface raised style={styles.panel}>
                <View style={styles.panelHeader}>
                  <View style={styles.panelCopy}>
                    <AppText variant="title3">Create a room</AppText>
                    <AppText tone="secondary" variant="callout">
                      Set the ride name, route label, privacy, and group size before riders join.
                    </AppText>
                  </View>
                  <SegmentedControl
                    onChange={setEntryMode}
                    options={[
                      { label: "Create", value: "create" },
                      { label: "Join", value: "join" }
                    ]}
                    value={entryMode}
                  />
                </View>

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
                    <TextField helperText="Optional route or regroup label." label="Route title" onChangeText={setRouteTitle} placeholder="Nederland Loop" value={routeTitle} />
                    <Surface muted style={styles.maxRiderCard}>
                      <View>
                        <AppText tone="secondary" variant="footnote">
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
                    <TextField helperText="Paste a deep link or enter the room code." label="Invite link or code" onChangeText={setJoinValue} placeholder="A7Q9K or ridesync://join?code=A7Q9K" value={joinValue} />
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
                actionLabel="Open showcase"
                body="Once a room exists, the web app turns into a true command center with live map, roster, music, voice, and safety monitoring."
                icon="monitor-dashboard"
                onAction={() => router.push("/internal/design-showcase")}
                title="No active room yet"
              />
            </View>
          </View>
        </WebScaffold>
      </Screen>
    );
  }

  const roomStatusLabel = activeRoom.lifecycle === "rolling" ? "Live desktop monitoring" : "Staging lobby";

  return (
    <Screen contentStyle={styles.screen} scroll>
      <WebScaffold
        eyebrow={`ROOM ${activeRoom.code}`}
        right={
          <>
            <Chip label={roomStatusLabel} tone={activeRoom.lifecycle === "rolling" ? "accent" : "neutral"} />
            <Button label="Comms" onPress={() => router.push("/(tabs)/comms")} variant="secondary" />
            <Button label="Plan" onPress={() => router.push("/(tabs)/plan")} variant="secondary" />
          </>
        }
        subtitle={`${activeRoom.routeTitle ?? "Route not set"} • ${approvedCount}/${activeRoom.maxRiders} approved riders • ${roomPresenceState}`}
        title={activeRoom.title}
      >
        {activeAlert?.status === "active" ? <ActiveAlertBanner alert={activeAlert} onResolve={handleResolveAlert} /> : null}
        <ResilienceBanner
          onRetrySync={handleRetryRoomSync}
          onRetryVoice={handleRetryVoice}
          reliability={reliability}
          staleLocationSeconds={staleLocationSeconds}
          voiceSession={voiceSession}
        />

        <View style={styles.metricRow}>
          <WebMetricCard detail={`${readyCount} riders marked ready`} label="Approved riders" value={`${approvedCount}`} />
          <WebMetricCard detail={pendingCount > 0 ? `${pendingCount} riders waiting for approval` : "Roster queue is clear"} label="Presence" value={roomPresenceState} />
          <WebMetricCard detail={activeRoom.routeTitle ?? "Route title not set yet"} label="Mode" value={activeRoom.lifecycle === "rolling" ? "Ride live" : "Lobby staging"} />
          <WebMetricCard detail={voiceSession.deviceStatus.outputLabel} label="Audio route" value={voiceSession.connectionState} />
        </View>

        <View style={[styles.shellGrid, desktop && styles.shellGridDesktop]}>
          <View style={styles.leftRail}>
            <RoomInviteCard room={activeRoom} onShare={handleShareInvite} />
            {safety ? <SafetyOverviewCard onOpenMedicalCard={() => router.push("/medical-card")} safety={safety} /> : null}
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
              <LeaderMusicPanel onPlayPause={handleMusicPlayPause} onSkipNext={handleMusicNext} onSkipPrevious={handleMusicPrevious} snapshot={musicSync} />
            ) : (
              <RiderPlaybackPanel onMixDown={() => handleMixDelta(-8)} onMixUp={() => handleMixDelta(8)} snapshot={musicSync} />
            )}
            {featureFlags.musicSyncDiagnostics ? <MusicSyncDiagnostics onResync={handleMusicResync} snapshot={musicSync} /> : null}
          </View>

          <View style={styles.mainStage}>
            {activeRoom.lifecycle === "rolling" && safety ? (
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
            ) : (
              <Surface raised style={styles.stagingCard}>
                <View style={styles.panelHeader}>
                  <View style={styles.panelCopy}>
                    <AppText variant="title3">Lobby status</AppText>
                    <AppText tone="secondary" variant="callout">
                      Stage the roster, confirm intercom readiness, and start the ride when the group is prepared.
                    </AppText>
                  </View>
                  <Chip label={activeRoom.locked ? "Locked" : "Open"} tone={activeRoom.locked ? "warning" : "success"} />
                </View>
                <MapPreview riders={riders.length ? riders : previewRiders} />
              </Surface>
            )}

            <QuickActionsTray
              onOpenComms={() => router.push("/(tabs)/comms")}
              onOpenSos={() => setSosVisible(true)}
              onPing={handleQuickPing}
              pingOptions={QUICK_PINGS}
              unreadCount={unreadCount}
            />
          </View>

          <View style={styles.rightRail}>
            <Surface raised style={styles.panel}>
              <View style={styles.panelHeader}>
                <View style={styles.panelCopy}>
                  <AppText variant="title3">Rider roster</AppText>
                  <AppText tone="secondary" variant="callout">
                    Presence, readiness, and voice state stay readable on one desktop surface.
                  </AppText>
                </View>
              </View>
              <View style={styles.memberStack}>
                {roomMembers.map((member) => (
                  <LobbyMemberRow
                    key={member.id}
                    isCurrentUser={member.userId === authIdentity?.uid}
                    isLeaderView={Boolean(isLeaderView)}
                    member={member}
                    onApprove={() => handleLeaderAction(() => approveRoomMember(activeRoom.id, member.id))}
                    onRemove={() => handleLeaderAction(() => removeRoomMember(activeRoom.id, member.id))}
                    onToggleIntercom={() =>
                      handleLeaderAction(() => updateRoomMemberIntercom(activeRoom.id, member.userId, member.intercomState !== "connected"))
                    }
                    onToggleReady={() =>
                      handleLeaderAction(() => updateRoomMemberReadiness(activeRoom.id, member.userId, member.readiness === "ready" ? "review" : "ready"))
                    }
                    voiceParticipant={voiceParticipants[member.id]}
                  />
                ))}
              </View>
            </Surface>

            <Surface raised style={styles.panel}>
              <View style={styles.panelHeader}>
                <View style={styles.panelCopy}>
                  <AppText variant="title3">{isLeaderView ? "Leader controls" : "Room status"}</AppText>
                  <AppText tone="secondary" variant="callout">
                    {isLeaderView
                      ? "Approve riders, secure the room, and move the group into live ride mode."
                      : currentMember?.approvalStatus === "pending"
                        ? "Leader approval is still required before you fully enter the room."
                        : "You’re staged in the browser command center while the leader manages the room."}
                  </AppText>
                </View>
              </View>
              {isLeaderView ? (
                <>
                  <Button label={activeRoom.locked ? "Unlock room" : "Lock room"} onPress={() => handleLeaderAction(() => setRoomLocked(activeRoom.id, !activeRoom.locked))} variant="secondary" />
                  {activeRoom.lifecycle !== "rolling" ? <Button label="Start ride" onPress={handleStartRide} /> : null}
                  {activeRoom.lifecycle === "rolling" ? (
                    <Button label="Return to lobby" onPress={() => handleLeaderAction(() => clearActiveRideRoom(activeRoom.id))} variant="secondary" />
                  ) : null}
                </>
              ) : (
                <ListRow
                  leading={<Chip label={currentMember?.approvalStatus === "pending" ? "Pending" : "Staged"} tone={currentMember?.approvalStatus === "pending" ? "warning" : "success"} />}
                  subtitle="Current browser seat in the room, including approval status and roster visibility."
                  title="Your room access"
                />
              )}
            </Surface>
          </View>
        </View>
        <SOSModal onCancel={() => setSosVisible(false)} onConfirm={handleConfirmSos} visible={sosVisible} />
      </WebScaffold>
    </Screen>
  );
}

const styles = StyleSheet.create({
  screen: {
    paddingVertical: 0
  },
  shellGrid: {
    gap: 16
  },
  shellGridDesktop: {
    flexDirection: "row",
    alignItems: "flex-start"
  },
  mainColumn: {
    flex: 1,
    gap: 16
  },
  sidebarColumn: {
    width: 420,
    gap: 16
  },
  leftRail: {
    width: 330,
    gap: 16
  },
  mainStage: {
    flex: 1,
    gap: 16
  },
  rightRail: {
    width: 380,
    gap: 16
  },
  desktopHeroCard: {
    borderRadius: 32,
    padding: 18,
    gap: 18
  },
  desktopHeroHeader: {
    gap: 16
  },
  desktopHeroCopy: {
    gap: 8
  },
  desktopMetricStack: {
    flexDirection: "row",
    gap: 12,
    flexWrap: "wrap"
  },
  panel: {
    borderRadius: 28,
    padding: 16,
    gap: 12
  },
  panelHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    gap: 12
  },
  panelCopy: {
    flex: 1,
    gap: 4
  },
  form: {
    gap: 14
  },
  maxRiderCard: {
    padding: 14,
    borderRadius: 20,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center"
  },
  maxControls: {
    flexDirection: "row",
    gap: 8
  },
  stagingCard: {
    borderRadius: 32,
    padding: 18,
    gap: 16
  },
  metricRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 12
  },
  memberStack: {
    gap: 10
  }
});
