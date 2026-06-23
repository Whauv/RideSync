import { useMemo, useState } from "react";
import { StyleSheet, View } from "react-native";
import { router } from "expo-router";

import { AppHeader } from "@/components/primitives/AppHeader";
import { AppText } from "@/components/primitives/AppText";
import { Button } from "@/components/primitives/Button";
import { Chip } from "@/components/primitives/Chip";
import { EmptyState } from "@/components/primitives/EmptyState";
import { Screen } from "@/components/primitives/Screen";
import { SegmentedControl } from "@/components/primitives/SegmentedControl";
import { SkeletonLoader } from "@/components/primitives/SkeletonLoader";
import { Surface } from "@/components/primitives/Surface";
import { TextField } from "@/components/primitives/TextField";
import { RiderRow } from "@/components/ride/RiderRow";
import { SafetyOverviewCard } from "@/components/safety/SafetyOverviewCard";
import { useExperimentalCrashDetection } from "@/features/safety/useExperimentalCrashDetection";
import { useToast } from "@/providers/ToastProvider";
import { hapticSoftImpact, hapticSuccess, hapticWarning } from "@/services/haptics";
import { confirmHazardReport, getRideRoomSnapshot, reportHazard, updateRiderFuelRange } from "@/services/roomWorkflow";
import { useAppStore } from "@/store/useAppStore";
import { HazardSeverity, RideRoomSnapshot } from "@/types/domain";

export default function SquadScreen() {
  const { showToast } = useToast();
  const authIdentity = useAppStore((state) => state.authIdentity);
  const profile = useAppStore((state) => state.profile);
  const activeRoom = useAppStore((state) => state.activeRoom);
  const roomMembers = useAppStore((state) => state.roomMembers);
  const riders = useAppStore((state) => state.riders);
  const safety = useAppStore((state) => state.safety);
  const setRoomSession = useAppStore((state) => state.setRoomSession);

  const [hazardTitle, setHazardTitle] = useState("");
  const [hazardNote, setHazardNote] = useState("");
  const [hazardSeverity, setHazardSeverity] = useState<HazardSeverity>("caution");
  const [fuelRangeInput, setFuelRangeInput] = useState("");
  const [crashMonitorEnabled, setCrashMonitorEnabled] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  const experimentalCrash = useExperimentalCrashDetection({ enabled: crashMonitorEnabled });
  const currentMember = useMemo(
    () => roomMembers.find((member) => member.userId === authIdentity?.uid) ?? null,
    [authIdentity?.uid, roomMembers]
  );
  const featureFlags = useAppStore((state) => state.featureFlags);
  const currentFuelRange = currentMember?.fuelRangeMiles ?? riders.find((rider) => rider.id === currentMember?.id)?.fuelRangeMiles;

  if (!activeRoom || !safety) {
    return (
      <Screen>
        <AppHeader
          eyebrow="SQUAD"
          subtitle="Safety, formation, and ride intelligence appear here once a room is active."
          title="Safety center"
        />
        <EmptyState body="Enter a room first to see hazards, fuel coordination, and ride insights." icon="shield-outline" title="No active ride data" />
      </Screen>
    );
  }

  const roomId = activeRoom.id;

  async function syncSnapshot(promise: Promise<RideRoomSnapshot>) {
    const snapshot = await promise;
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

  async function handleReportHazard() {
    if (!authIdentity || !hazardTitle.trim()) {
      showToast({
        title: "Add a hazard title",
        message: "Keep it short and unambiguous so the group can react quickly.",
        tone: "warning"
      });
      return;
    }

    await syncSnapshot(
      reportHazard(roomId, authIdentity, profile, {
        title: hazardTitle,
        note: hazardNote,
        severity: hazardSeverity
      })
    );

    setHazardTitle("");
    setHazardNote("");
    showToast({
      title: "Hazard reported",
      message: "The map and safety log were updated. A second confirmation keeps this signal conservative.",
      tone: "success"
    });
    await hapticWarning();
  }

  async function handleSaveFuelRange() {
    if (!authIdentity) {
      return;
    }

    const parsed = Number(fuelRangeInput);
    if (!Number.isFinite(parsed) || parsed <= 0) {
      showToast({
        title: "Enter a valid range",
        message: "Fuel range should be a positive number of miles remaining.",
        tone: "warning"
      });
      return;
    }

    await syncSnapshot(updateRiderFuelRange(roomId, authIdentity.uid, parsed));
    showToast({
      title: "Fuel margin updated",
      message: parsed <= 35 ? "Your low-range status is now visible to the room." : "Your updated fuel margin is visible to the room.",
      tone: parsed <= 20 ? "danger" : parsed <= 35 ? "warning" : "success"
    });
    if (parsed <= 35) {
      await hapticWarning();
      return;
    }

    await hapticSuccess();
  }

  async function handleRefresh() {
    setRefreshing(true);
    try {
      const snapshot = await getRideRoomSnapshot(roomId);
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

  return (
    <Screen onRefresh={handleRefresh} refreshing={refreshing} scroll>
      <AppHeader
        eyebrow="SQUAD"
        subtitle="Operational safety, conservative alerts, and replay-ready intelligence for the live room."
        title="Safety center"
      />

      <SafetyOverviewCard onOpenMedicalCard={() => router.push("/medical-card")} safety={safety} />
      {refreshing ? (
        <Surface muted style={styles.loadingCard}>
          <SkeletonLoader width="38%" />
          <SkeletonLoader />
          <SkeletonLoader width="64%" />
        </Surface>
      ) : null}

      <Surface raised style={styles.section}>
        <View style={styles.sectionHeader}>
          <View>
            <AppText variant="title3">Hazard reporting</AppText>
            <AppText tone="secondary">Report once, confirm deliberately, and keep the map quiet unless the group agrees.</AppText>
          </View>
          <Chip label={safety.hazards.length > 0 ? `${safety.hazards.length} open` : "Clear"} tone={safety.hazards.length > 0 ? "warning" : "success"} />
        </View>
        <TextField label="Hazard title" onChangeText={setHazardTitle} placeholder="Loose gravel in right apex" value={hazardTitle} />
        <TextField
          helperText="Optional context like lane position, weather, or best avoidance."
          label="Hazard note"
          multiline
          onChangeText={setHazardNote}
          placeholder="Right lane only, clears after the bridge."
          value={hazardNote}
        />
        <SegmentedControl
          onChange={(value) => setHazardSeverity(value as HazardSeverity)}
          options={[
            { label: "Advisory", value: "advisory" },
            { label: "Caution", value: "caution" },
            { label: "Critical", value: "critical" }
          ]}
          value={hazardSeverity}
        />
        <Button label="Report hazard" onPress={handleReportHazard} />
        <View style={styles.stack}>
          {safety.hazards.map((hazard) => (
            <Surface key={hazard.id} muted style={styles.innerCard}>
              <View style={styles.row}>
                <View style={styles.copy}>
                  <AppText variant="bodyStrong">{hazard.title}</AppText>
                  <AppText tone="secondary">{hazard.note || "No extra note provided."}</AppText>
                </View>
                <Chip
                  label={hazard.status === "confirmed" ? "Confirmed" : `${hazard.confirmations.length} confirmations`}
                  tone={hazard.status === "confirmed" ? "warning" : "accent"}
                />
              </View>
              <AppText variant="footnote" tone="tertiary">
                Reported by {hazard.reporterName}
              </AppText>
              {hazard.status !== "confirmed" && authIdentity ? (
                <Button
                  label={hazard.confirmations.includes(authIdentity.uid) ? "Confirmation logged" : "Confirm hazard"}
                  onPress={async () => {
                    await syncSnapshot(confirmHazardReport(roomId, hazard.id, authIdentity, profile));
                    await hapticSoftImpact();
                  }}
                  variant={hazard.confirmations.includes(authIdentity.uid) ? "secondary" : "ghost"}
                />
              ) : null}
            </Surface>
          ))}
        </View>
      </Surface>

      <Surface style={styles.section}>
        <View style={styles.sectionHeader}>
          <View>
            <AppText variant="title3">Fuel coordination</AppText>
            <AppText tone="secondary">Each rider reports their own remaining range. Alerts stay conservative at 35 mi and urgent at 20 mi.</AppText>
          </View>
          <Chip
            label={safety.fuelAlerts.length > 0 ? `${safety.fuelAlerts.length} low-range` : "Healthy"}
            tone={safety.fuelAlerts.some((alert) => alert.level === "critical") ? "danger" : safety.fuelAlerts.length > 0 ? "warning" : "success"}
          />
        </View>
        <TextField
          helperText={typeof currentFuelRange === "number" ? `Current saved range: ${Math.round(currentFuelRange)} mi` : "Enter your current estimated miles remaining."}
          keyboardType="numeric"
          label="My fuel range"
          onChangeText={setFuelRangeInput}
          placeholder="128"
          value={fuelRangeInput}
        />
        <Button label="Save fuel range" onPress={handleSaveFuelRange} />
        <View style={styles.stack}>
          {roomMembers
            .filter((member) => member.approvalStatus === "approved")
            .map((member) => (
              <Surface key={member.id} muted style={styles.innerCard}>
                <View style={styles.row}>
                  <View style={styles.copy}>
                    <AppText variant="bodyStrong">{member.riderName}</AppText>
                    <AppText tone="secondary">{member.bikeName}</AppText>
                  </View>
                  <Chip
                    label={typeof member.fuelRangeMiles === "number" ? `${Math.round(member.fuelRangeMiles)} mi` : "No fuel check"}
                    tone={typeof member.fuelRangeMiles !== "number" ? "neutral" : member.fuelRangeMiles <= 20 ? "danger" : member.fuelRangeMiles <= 35 ? "warning" : "success"}
                  />
                </View>
              </Surface>
            ))}
        </View>
      </Surface>

      {featureFlags.experimentalCrashDetection ? (
        <Surface style={styles.section}>
          <View style={styles.sectionHeader}>
            <View>
              <AppText variant="title3">Experimental crash monitor</AppText>
              <AppText tone="secondary">Architecture placeholder only. No automatic dispatch, no autonomous SOS, and false-positive tuning is not validated yet.</AppText>
            </View>
            <Chip label="Experimental" tone="warning" />
          </View>
          <SegmentedControl
            onChange={(value) => setCrashMonitorEnabled(value === "on")}
            options={[
              { label: "Off", value: "off" },
              { label: "On", value: "on" }
            ]}
            value={crashMonitorEnabled ? "on" : "off"}
          />
          <Surface muted style={styles.innerCard}>
            <AppText variant="bodyStrong">{experimentalCrash.lastEvent ?? "Monitoring paused"}</AppText>
            <AppText tone="secondary">{experimentalCrash.note}</AppText>
            <AppText variant="footnote" tone="tertiary">
              Availability: {experimentalCrash.availability} {experimentalCrash.lastSampleAt ? `| Last sample ${new Date(experimentalCrash.lastSampleAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}` : ""}
            </AppText>
          </Surface>
        </Surface>
      ) : null}

      <Surface style={styles.section}>
        <View style={styles.sectionHeader}>
          <View>
            <AppText variant="title3">Ride insights</AppText>
            <AppText tone="secondary">These are intentionally labeled as placeholders until telemetry and persisted replays land in the backend.</AppText>
          </View>
          <Chip label="Placeholder" tone="accent" />
        </View>
        <View style={styles.metricsRow}>
          <Surface muted style={styles.metricCard}>
            <AppText variant="footnote" tone="secondary">
              Average speed
            </AppText>
            <AppText variant="title2">{safety.insights.averageSpeedMph} mph</AppText>
          </Surface>
          <Surface muted style={styles.metricCard}>
            <AppText variant="footnote" tone="secondary">
              Stop count
            </AppText>
            <AppText variant="title2">{safety.insights.stopCount}</AppText>
          </Surface>
          <Surface muted style={styles.metricCard}>
            <AppText variant="footnote" tone="secondary">
              Distance
            </AppText>
            <AppText variant="title2">{safety.insights.distanceMiles} mi</AppText>
          </Surface>
        </View>
        <View style={styles.stack}>
          {safety.insights.eventLog.map((event) => (
            <Surface key={event.id} muted style={styles.innerCard}>
              <View style={styles.row}>
                <View style={styles.copy}>
                  <AppText variant="bodyStrong">{event.replayLabel}</AppText>
                  <AppText tone="secondary">{event.detail}</AppText>
                </View>
                <Chip label={event.type.replaceAll("_", " ")} tone="neutral" />
              </View>
            </Surface>
          ))}
        </View>
      </Surface>

      <Surface style={styles.section}>
        <AppText variant="title3">Live roster</AppText>
        {riders.map((rider) => (
          <RiderRow key={rider.id} rider={rider} />
        ))}
        {riders.length === 0 ? (
          <AppText tone="secondary">The roster fills with telemetry once the ride moves into live tracking.</AppText>
        ) : null}
      </Surface>
    </Screen>
  );
}

const styles = StyleSheet.create({
  section: {
    padding: 16,
    gap: 12,
    marginBottom: 12
  },
  sectionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    gap: 12,
    alignItems: "flex-start"
  },
  stack: {
    gap: 10
  },
  innerCard: {
    padding: 14,
    gap: 8
  },
  row: {
    flexDirection: "row",
    gap: 12,
    justifyContent: "space-between",
    alignItems: "flex-start"
  },
  copy: {
    flex: 1,
    gap: 3
  },
  metricsRow: {
    flexDirection: "row",
    gap: 10
  },
  metricCard: {
    flex: 1,
    padding: 12,
    gap: 4
  },
  loadingCard: {
    padding: 14,
    gap: 10,
    marginBottom: 12
  }
});
