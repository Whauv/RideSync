import { useMemo, useState } from "react";
import { ScrollView, StyleSheet, View } from "react-native";

import { AppModal } from "@/components/primitives/AppModal";
import { AppHeader } from "@/components/primitives/AppHeader";
import { AppText } from "@/components/primitives/AppText";
import { Button } from "@/components/primitives/Button";
import { Chip } from "@/components/primitives/Chip";
import { EmptyState } from "@/components/primitives/EmptyState";
import { ListRow } from "@/components/primitives/ListRow";
import { Screen } from "@/components/primitives/Screen";
import { SegmentedControl } from "@/components/primitives/SegmentedControl";
import { SkeletonLoader } from "@/components/primitives/SkeletonLoader";
import { Surface } from "@/components/primitives/Surface";
import { TextField } from "@/components/primitives/TextField";
import {
  addRidePlanStop,
  getRideRoomSnapshot,
  importRideRouteReference,
  shareRideBrief,
  updateRidePlan,
  updateRoomMemberRsvp
} from "@/services/roomWorkflow";
import { hapticSoftImpact, hapticSuccess } from "@/services/haptics";
import { useAppStore } from "@/store/useAppStore";
import { RideStopType, RiderRsvpStatus } from "@/types/domain";
import { useToast } from "@/providers/ToastProvider";

const stopOptions: { label: string; value: RideStopType }[] = [
  { label: "Fuel", value: "fuel" },
  { label: "Food", value: "food" },
  { label: "Scenic", value: "scenic" },
  { label: "Break", value: "break" },
  { label: "Fallback", value: "emergency_fallback" }
];

const rsvpOptions: { label: string; value: RiderRsvpStatus }[] = [
  { label: "Going", value: "going" },
  { label: "Late", value: "late" },
  { label: "Pending", value: "pending" },
  { label: "Can't make it", value: "cant_make_it" }
];

function toneForRsvp(status: RiderRsvpStatus) {
  return status === "going" ? "success" : status === "late" ? "warning" : status === "cant_make_it" ? "danger" : "neutral";
}

export default function PlanScreen() {
  const { showToast } = useToast();
  const authIdentity = useAppStore((state) => state.authIdentity);
  const activeRoom = useAppStore((state) => state.activeRoom);
  const roomMembers = useAppStore((state) => state.roomMembers);
  const ridePlan = useAppStore((state) => state.ridePlan);
  const setRoomSession = useAppStore((state) => state.setRoomSession);

  const [routeTitle, setRouteTitle] = useState(ridePlan?.routeTitle ?? "");
  const [scheduledFor, setScheduledFor] = useState(ridePlan?.scheduledFor ?? "");
  const [meetupPoint, setMeetupPoint] = useState(ridePlan?.meetupPoint ?? "");
  const [notes, setNotes] = useState(ridePlan?.notes ?? "");
  const [distanceMiles, setDistanceMiles] = useState(`${ridePlan?.distanceMiles ?? 0}`);
  const [etaMinutes, setEtaMinutes] = useState(`${ridePlan?.etaMinutes ?? 0}`);
  const [importReference, setImportReference] = useState("");
  const [importType, setImportType] = useState<"gpx_reference" | "route_reference">("gpx_reference");
  const [stopTitle, setStopTitle] = useState("");
  const [stopNote, setStopNote] = useState("");
  const [stopEta, setStopEta] = useState("45");
  const [stopType, setStopType] = useState<RideStopType>("fuel");
  const [briefVisible, setBriefVisible] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  const currentMember = useMemo(
    () => roomMembers.find((member) => member.userId === authIdentity?.uid) ?? null,
    [authIdentity?.uid, roomMembers]
  );
  const isLeaderView = currentMember?.role === "leader";
  const goingCount = roomMembers.filter((member) => member.rsvpStatus === "going").length;

  if (!activeRoom || !ridePlan || !authIdentity) {
    return (
      <Screen>
        <AppHeader
          eyebrow="PLANNING"
          subtitle="Route planning, scheduled departure, and ride brief become available once a room exists."
          title="Plan"
        />
        <EmptyState body="Create or join a ride room first to start planning." icon="map-marker-distance" title="No planning context" />
      </Screen>
    );
  }

  const room = activeRoom;
  const plan = ridePlan;
  const identity = authIdentity;

  async function applySnapshot(action: Promise<Awaited<ReturnType<typeof updateRidePlan>>>) {
    const snapshot = await action;
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

  async function handleSavePlan() {
    await applySnapshot(
      updateRidePlan(room.id, {
        routeTitle: routeTitle.trim(),
        scheduledFor,
        meetupPoint: meetupPoint.trim(),
        notes: notes.trim(),
        distanceMiles: Number(distanceMiles) || plan.distanceMiles,
        etaMinutes: Number(etaMinutes) || plan.etaMinutes
      })
    );
    showToast({
      title: "Plan updated",
      message: "Route brief and stop plan are synced to the room.",
      tone: "success"
    });
    await hapticSuccess();
  }

  async function handleImportReference() {
    if (!importReference.trim()) {
      return;
    }

    await applySnapshot(
      importRideRouteReference(room.id, {
        type: importType,
        reference: importReference.trim()
      })
    );
    setImportReference("");
    showToast({
      title: importType === "gpx_reference" ? "GPX hook added" : "Route reference added",
      message: "Reference stored for the room plan.",
      tone: "success"
    });
    await hapticSoftImpact();
  }

  async function handleAddStop() {
    if (!stopTitle.trim()) {
      return;
    }

    await applySnapshot(
      addRidePlanStop(room.id, {
        type: stopType,
        title: stopTitle.trim(),
        note: stopNote.trim(),
        etaOffsetMinutes: Number(stopEta) || 0
      })
    );
    setStopTitle("");
    setStopNote("");
    setStopEta("45");
    await hapticSoftImpact();
  }

  async function handleRsvpChange(value: RiderRsvpStatus) {
    const snapshot = await updateRoomMemberRsvp(room.id, identity.uid, value);
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

  async function handleShareBrief() {
    await hapticSoftImpact();
    await shareRideBrief(room, plan, roomMembers);
  }

  async function handleRefresh() {
    setRefreshing(true);
    try {
      const snapshot = await getRideRoomSnapshot(room.id);
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
        setRouteTitle(snapshot.ridePlan?.routeTitle ?? "");
        setScheduledFor(snapshot.ridePlan?.scheduledFor ?? "");
        setMeetupPoint(snapshot.ridePlan?.meetupPoint ?? "");
        setNotes(snapshot.ridePlan?.notes ?? "");
        setDistanceMiles(`${snapshot.ridePlan?.distanceMiles ?? 0}`);
        setEtaMinutes(`${snapshot.ridePlan?.etaMinutes ?? 0}`);
      }
    } finally {
      setRefreshing(false);
    }
  }

  return (
    <Screen onRefresh={handleRefresh} refreshing={refreshing} scroll>
      <AppHeader
        eyebrow="PLANNING"
        right={<Chip label={`${goingCount} going`} tone="success" />}
        subtitle="Operational route setup, stop intent, and rider commitment before the room rolls."
        title={plan.routeTitle}
      />

      <View style={styles.summaryRow}>
        <Surface raised style={styles.summaryCard}>
          <AppText tone="secondary" variant="footnote">
            Distance
          </AppText>
          <AppText variant="metric">{plan.distanceMiles}</AppText>
          <AppText tone="secondary" variant="callout">
            miles planned
          </AppText>
        </Surface>
        <Surface style={styles.summaryCard}>
          <AppText tone="secondary" variant="footnote">
            ETA
          </AppText>
          <AppText variant="metric">{plan.etaMinutes}</AppText>
          <AppText tone="secondary" variant="callout">
            minutes total
          </AppText>
        </Surface>
      </View>
      {refreshing ? (
        <Surface muted style={styles.loadingBlock}>
          <SkeletonLoader width="36%" />
          <SkeletonLoader />
          <SkeletonLoader width="72%" />
        </Surface>
      ) : null}

      <Surface raised style={styles.panel}>
        <View style={styles.panelHeader}>
          <View>
            <AppText variant="title3">Pre-ride brief</AppText>
            <AppText tone="secondary">Core route intent, launch time, and meetup coordination.</AppText>
          </View>
          {isLeaderView ? <Button label="Share brief" onPress={() => setBriefVisible(true)} variant="secondary" /> : null}
        </View>
        <TextField label="Route title" onChangeText={setRouteTitle} value={routeTitle} />
        <TextField
          helperText="Use your preferred local date-time format."
          label="Date / time"
          onChangeText={setScheduledFor}
          value={scheduledFor}
        />
        <TextField label="Meetup point" onChangeText={setMeetupPoint} value={meetupPoint} />
        <TextField label="Ride notes" multiline onChangeText={setNotes} value={notes} />
        <View style={styles.inlineInputs}>
          <View style={styles.inlineField}>
            <TextField label="Distance (mi)" keyboardType="numeric" onChangeText={setDistanceMiles} value={distanceMiles} />
          </View>
          <View style={styles.inlineField}>
            <TextField label="ETA (min)" keyboardType="numeric" onChangeText={setEtaMinutes} value={etaMinutes} />
          </View>
        </View>
        {isLeaderView ? <Button label="Save ride plan" onPress={handleSavePlan} /> : null}
      </Surface>

      <Surface style={styles.panel}>
        <AppText variant="title3">Route import hooks</AppText>
        <AppText tone="secondary">
          Store GPX references or route links now so the room has a consistent operational source before departure.
        </AppText>
        <SegmentedControl
          onChange={(value) => setImportType(value as "gpx_reference" | "route_reference")}
          options={[
            { label: "GPX ref", value: "gpx_reference" },
            { label: "Route ref", value: "route_reference" }
          ]}
          value={importType}
        />
        <TextField
          helperText="Paste a GPX file reference, route share URL, or planner reference token."
          label="Reference"
          onChangeText={setImportReference}
          value={importReference}
        />
        <Button label="Add import hook" onPress={handleImportReference} variant="secondary" />

        <View style={styles.list}>
          {plan.imports.map((item) => (
            <ListRow
              key={item.id}
              leading={<Chip label={item.type === "gpx_reference" ? "GPX" : "ROUTE"} tone="accent" />}
              subtitle={new Date(item.importedAt).toLocaleString()}
              title={item.reference}
            />
          ))}
        </View>
      </Surface>

      <Surface style={styles.panel}>
        <AppText variant="title3">Stop plan</AppText>
        <AppText tone="secondary">Fuel, food, scenic pauses, rider breaks, and fallback points all live in one sequence.</AppText>
        <SegmentedControl onChange={(value) => setStopType(value as RideStopType)} options={stopOptions} value={stopType} />
        <TextField label="Stop title" onChangeText={setStopTitle} value={stopTitle} />
        <TextField label="Stop note" onChangeText={setStopNote} value={stopNote} />
        <TextField label="ETA offset (min)" keyboardType="numeric" onChangeText={setStopEta} value={stopEta} />
        <Button label="Add stop" onPress={handleAddStop} variant="secondary" />

        <View style={styles.list}>
          {plan.stops.map((stop) => (
            <ListRow
              key={stop.id}
              leading={<Chip label={stop.type.replaceAll("_", " ")} tone={stop.type === "emergency_fallback" ? "danger" : stop.type === "fuel" ? "accent" : "neutral"} />}
              subtitle={`${stop.etaOffsetMinutes} min in | ${stop.note}`}
              title={stop.title}
            />
          ))}
        </View>
      </Surface>

      <Surface style={styles.panel}>
        <AppText variant="title3">Rider RSVP</AppText>
        <AppText tone="secondary">Scheduled rides need commitment clarity before lobby readiness becomes useful.</AppText>
        <SegmentedControl
          onChange={(value) => handleRsvpChange(value as RiderRsvpStatus)}
          options={rsvpOptions}
          value={currentMember?.rsvpStatus ?? "pending"}
        />
        <View style={styles.list}>
          {roomMembers.map((member) => (
            <ListRow
              key={member.id}
              leading={<Chip label={member.rsvpStatus.replaceAll("_", " ")} tone={toneForRsvp(member.rsvpStatus)} />}
              subtitle={member.bikeName}
              title={member.riderName}
            />
          ))}
        </View>
      </Surface>

      <AppModal onClose={() => setBriefVisible(false)} title="Ride brief" visible={briefVisible}>
        <ScrollView contentContainerStyle={styles.briefBody}>
          <Chip label="Leader share view" tone="accent" />
          <AppText variant="title2">{plan.routeTitle}</AppText>
          <AppText tone="secondary">{new Date(plan.scheduledFor).toLocaleString()}</AppText>
          <AppText>{plan.meetupPoint}</AppText>
          <View style={styles.briefStats}>
            <Chip label={`${plan.distanceMiles} mi`} tone="neutral" />
            <Chip label={`${plan.etaMinutes} min`} tone="neutral" />
            <Chip label={`${goingCount} going`} tone="success" />
          </View>
          <AppText tone="secondary">{plan.notes}</AppText>
          {plan.stops.map((stop) => (
            <ListRow
              key={stop.id}
              leading={<Chip label={stop.type.replaceAll("_", " ")} tone={stop.type === "emergency_fallback" ? "danger" : "accent"} />}
              subtitle={`${stop.etaOffsetMinutes} min in`}
              title={stop.title}
            />
          ))}
          <Button label="Share ride brief" onPress={handleShareBrief} />
        </ScrollView>
      </AppModal>
    </Screen>
  );
}

const styles = StyleSheet.create({
  summaryRow: {
    flexDirection: "row",
    gap: 12,
    marginTop: 12,
    marginBottom: 12
  },
  summaryCard: {
    flex: 1,
    padding: 16,
    gap: 6
  },
  panel: {
    padding: 16,
    gap: 12,
    marginBottom: 12
  },
  panelHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    gap: 12
  },
  inlineInputs: {
    flexDirection: "row",
    gap: 12
  },
  inlineField: {
    flex: 1
  },
  list: {
    gap: 4
  },
  briefBody: {
    gap: 10
  },
  briefStats: {
    flexDirection: "row",
    gap: 8,
    flexWrap: "wrap"
  },
  loadingBlock: {
    padding: 16,
    gap: 10,
    marginBottom: 12
  }
});
