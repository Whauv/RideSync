import { AppState, StyleSheet, View } from "react-native";
import { useEffect, useMemo, useState } from "react";
import { router } from "expo-router";

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
import { LobbyMemberRow } from "@/components/room/LobbyMemberRow";
import { RoomInviteCard } from "@/components/room/RoomInviteCard";
import { LiveRideMap } from "@/components/ride/LiveRideMap";
import { useSimulatedRideStream } from "@/features/ride-map/useSimulatedRideStream";
import { useToast } from "@/providers/ToastProvider";
import {
  approveRoomMember,
  clearActiveRideRoom,
  createRideRoom,
  joinRideRoom,
  removeRoomMember,
  setRoomLocked,
  shareRideRoomInvite,
  startRideRoom,
  updateRoomMemberIntercom,
  updateRoomMemberPresence,
  updateRoomMemberReadiness
} from "@/services/roomWorkflow";
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
  const leaderMusic = useAppStore((state) => state.leaderMusic);
  const roomPresenceState = useAppStore((state) => state.roomPresenceState);
  const setRoomPresenceState = useAppStore((state) => state.setRoomPresenceState);
  const setRoomSession = useAppStore((state) => state.setRoomSession);
  const setRiders = useAppStore((state) => state.setRiders);

  const [entryMode, setEntryMode] = useState<EntryMode>("create");
  const [busy, setBusy] = useState(false);
  const [roomName, setRoomName] = useState("");
  const [privacyMode, setPrivacyMode] = useState<RoomPrivacyMode>("invite_only");
  const [routeTitle, setRouteTitle] = useState("");
  const [maxRiders, setMaxRiders] = useState(8);
  const [joinValue, setJoinValue] = useState("");

  const currentMember = useMemo(
    () => roomMembers.find((member) => member.userId === authIdentity?.uid) ?? null,
    [authIdentity?.uid, roomMembers]
  );
  const isLeaderView = currentMember?.role === "leader";
  const approvedCount = roomMembers.filter((member) => member.approvalStatus === "approved").length;
  const pendingCount = roomMembers.filter((member) => member.approvalStatus === "pending").length;
  const readyCount = roomMembers.filter((member) => member.readiness === "ready" && member.approvalStatus === "approved").length;

  useSimulatedRideStream({
    enabled: activeRoom?.lifecycle === "rolling",
    riders,
    degraded: roomPresenceState !== "connected",
    onTick: setRiders
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
      setRoomSession(snapshot.room, snapshot.members, snapshot.riders, snapshot.layers, snapshot.messages);
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
      setRoomSession(snapshot.room, snapshot.members, snapshot.riders, snapshot.layers, snapshot.messages);
      showToast({
        title: "Room created",
        message: `${snapshot.room.title} is ready for riders to join.`,
        tone: "success"
      });
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
      setRoomSession(snapshot.room, snapshot.members, snapshot.riders, snapshot.layers, snapshot.messages);
      setPendingJoinCode(null);
      showToast({
        title: "Room joined",
        message:
          snapshot.room.privacyMode === "approval_required"
            ? "Your join request was sent to the leader."
            : "You are in the ride lobby.",
        tone: "success"
      });
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

    await shareRideRoomInvite(activeRoom);
  }

  async function handleLeaderAction(action: () => Promise<RideRoomSnapshot>) {
    if (!activeRoom) {
      return;
    }

    const snapshot = await action();
    setRoomSession(snapshot.room, snapshot.members, snapshot.riders, snapshot.layers, snapshot.messages);
  }

  async function handleStartRide() {
    if (!activeRoom) {
      return;
    }

    const snapshot = await startRideRoom(activeRoom.id);
    setRoomSession(snapshot.room, snapshot.members, snapshot.riders, snapshot.layers, snapshot.messages);
    showToast({
      title: "Ride started",
      message: "The room moved from lobby to live ride mode.",
      tone: "success"
    });
  }

  if (!activeRoom) {
    return (
      <Screen scroll>
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
      <Screen scroll>
        <AppHeader
          eyebrow={`ROOM ${activeRoom.code}`}
          right={<IconButton icon="dots-horizontal" onPress={() => router.push("/modal")} />}
          subtitle={`${activeRoom.routeTitle ?? "Open route"} | ${approvedCount} approved riders | ${roomPresenceState}`}
          title={activeRoom.title}
        />

        <LiveRideMap layers={rideLayers} riders={riders} room={activeRoom} />

        <View style={styles.metricsRow}>
          <Surface raised style={styles.metricCard}>
            <AppText tone="secondary" variant="footnote">
              Group pace
            </AppText>
            <AppText variant="metric">67</AppText>
            <Chip label="Rolling" tone="success" />
          </Surface>
          <Surface style={styles.metricCard}>
            <AppText tone="secondary" variant="footnote">
              Playback
            </AppText>
            <AppText variant="title2">{leaderMusic.track}</AppText>
            <AppText tone="secondary" variant="callout">
              {leaderMusic.artist}
            </AppText>
          </Surface>
        </View>

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
        right={<Chip label={activeRoom.locked ? "Locked" : "Open"} tone={activeRoom.locked ? "warning" : "success"} />}
        subtitle={`${activeRoom.routeTitle ?? "Route not set"} | ${approvedCount}/${activeRoom.maxRiders} approved riders`}
        title={activeRoom.title}
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
