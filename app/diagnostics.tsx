import { useEffect, useState } from "react";
import { RefreshControl, ScrollView, StyleSheet, View } from "react-native";

import { AppHeader } from "@/components/primitives/AppHeader";
import { AppText } from "@/components/primitives/AppText";
import { Button } from "@/components/primitives/Button";
import { Chip } from "@/components/primitives/Chip";
import { Screen } from "@/components/primitives/Screen";
import { SegmentedControl } from "@/components/primitives/SegmentedControl";
import { Surface } from "@/components/primitives/Surface";
import { clearDiagnosticEvents, getCrashReportingStatus, readDiagnosticEvents } from "@/services/diagnostics";
import { useAppStore } from "@/store/useAppStore";
import { DiagnosticEvent } from "@/types/runtime";

export default function DiagnosticsScreen() {
  const [events, setEvents] = useState<DiagnosticEvent[]>([]);
  const [refreshing, setRefreshing] = useState(false);
  const runtimePreferences = useAppStore((state) => state.runtimePreferences);
  const featureFlags = useAppStore((state) => state.featureFlags);
  const reliability = useAppStore((state) => state.reliability);
  const roomPresenceState = useAppStore((state) => state.roomPresenceState);
  const voiceSession = useAppStore((state) => state.voiceSession);
  const activeRoom = useAppStore((state) => state.activeRoom);
  const setRuntimePreferences = useAppStore((state) => state.setRuntimePreferences);
  const setFeatureFlag = useAppStore((state) => state.setFeatureFlag);

  async function loadEvents() {
    setRefreshing(true);
    try {
      setEvents(await readDiagnosticEvents());
    } finally {
      setRefreshing(false);
    }
  }

  useEffect(() => {
    void loadEvents();
  }, []);

  const crashReporting = getCrashReportingStatus();

  return (
    <Screen>
      <AppHeader
        eyebrow="DIAGNOSTICS"
        subtitle="Runtime recovery state, feature flags, and local event logs for ride-hardening validation."
        title="Reliability console"
      />

      <ScrollView
        contentContainerStyle={styles.content}
        refreshControl={<RefreshControl onRefresh={loadEvents} refreshing={refreshing} />}
        showsVerticalScrollIndicator={false}
      >
        <Surface raised style={styles.section}>
          <AppText variant="title3">Runtime profile</AppText>
          <View style={styles.row}>
            <Chip label={reliability.connectivity} tone={reliability.connectivity === "online" ? "success" : reliability.connectivity === "unstable" ? "warning" : "danger"} />
            <Chip label={reliability.recoveryState} tone={reliability.recoveryState === "failed" ? "danger" : reliability.recoveryState === "recovering" ? "warning" : "accent"} />
            <Chip label={roomPresenceState} tone={roomPresenceState === "connected" ? "success" : "warning"} />
          </View>
          <AppText tone="secondary">
            Last room sync: {reliability.lastRoomSyncAt ? new Date(reliability.lastRoomSyncAt).toLocaleString() : "Not recorded"}
          </AppText>
          <AppText tone="secondary">
            Voice: {voiceSession.connectionState} | {voiceSession.networkQuality}
          </AppText>
          <AppText tone="secondary">Active room: {activeRoom?.title ?? "None"}</AppText>
          {reliability.lastRecoveryError ? (
            <AppText style={styles.errorText}>Last recovery error: {reliability.lastRecoveryError}</AppText>
          ) : null}
        </Surface>

        <Surface style={styles.section}>
          <AppText variant="title3">Power and cadence</AppText>
          <SegmentedControl
            onChange={(value) => setRuntimePreferences({ batterySaverMode: value === "on" })}
            options={[
              { label: "Battery saver off", value: "off" },
              { label: "Battery saver on", value: "on" }
            ]}
            value={runtimePreferences.batterySaverMode ? "on" : "off"}
          />
          <SegmentedControl
            onChange={(value) => setRuntimePreferences({ reducedGpsCadence: value === "reduced" })}
            options={[
              { label: "Standard GPS", value: "standard" },
              { label: "Reduced cadence", value: "reduced" }
            ]}
            value={runtimePreferences.reducedGpsCadence ? "reduced" : "standard"}
          />
        </Surface>

        <Surface style={styles.section}>
          <AppText variant="title3">Feature flags</AppText>
          <FlagRow
            description="Keep the crash-monitor placeholder and future sensor gate visible."
            label="Experimental crash"
            onValueChange={(value) => setFeatureFlag("experimentalCrashDetection", value)}
            value={featureFlags.experimentalCrashDetection}
          />
          <FlagRow
            description="Allow leader announce affordances while the transport policy stays provider-isolated."
            label="Leader announce"
            onValueChange={(value) => setFeatureFlag("voiceLeaderAnnounce", value)}
            value={featureFlags.voiceLeaderAnnounce}
          />
          <FlagRow
            description="Expose music drift and resync instrumentation in the product UI."
            label="Music diagnostics"
            onValueChange={(value) => setFeatureFlag("musicSyncDiagnostics", value)}
            value={featureFlags.musicSyncDiagnostics}
          />
          <FlagRow
            description="Keep this diagnostics route visible from Settings."
            label="Developer diagnostics"
            onValueChange={(value) => setFeatureFlag("developerDiagnostics", value)}
            value={featureFlags.developerDiagnostics}
          />
        </Surface>

        <Surface style={styles.section}>
          <AppText variant="title3">Crash reporting</AppText>
          <View style={styles.row}>
            <Chip label={crashReporting.enabled ? "Enabled" : "Placeholder"} tone={crashReporting.enabled ? "success" : "warning"} />
            <Chip label={crashReporting.provider} tone="neutral" />
          </View>
          <AppText tone="secondary">{crashReporting.note}</AppText>
        </Surface>

        <Surface style={styles.section}>
          <View style={styles.headerRow}>
            <AppText variant="title3">Event log</AppText>
            <Button
              label="Clear log"
              onPress={async () => {
                await clearDiagnosticEvents();
                await loadEvents();
              }}
              variant="ghost"
            />
          </View>
          {events.map((event) => (
            <Surface key={event.id} muted style={styles.eventCard}>
              <View style={styles.headerRow}>
                <View style={styles.copy}>
                  <AppText variant="bodyStrong">{event.title}</AppText>
                  <AppText tone="secondary">{event.detail}</AppText>
                </View>
                <Chip label={event.level} tone={event.level === "error" ? "danger" : event.level === "warning" ? "warning" : "neutral"} />
              </View>
              <AppText variant="footnote" tone="tertiary">
                {event.category} | {new Date(event.createdAt).toLocaleString()}
              </AppText>
            </Surface>
          ))}
          {events.length === 0 ? <AppText tone="secondary">No diagnostics recorded yet.</AppText> : null}
        </Surface>
      </ScrollView>
    </Screen>
  );
}

function FlagRow({
  label,
  description,
  value,
  onValueChange
}: {
  label: string;
  description: string;
  value: boolean;
  onValueChange: (value: boolean) => void;
}) {
  return (
    <Surface muted style={styles.eventCard}>
      <View style={styles.headerRow}>
        <View style={styles.copy}>
          <AppText variant="bodyStrong">{label}</AppText>
          <AppText tone="secondary">{description}</AppText>
        </View>
        <Chip label={value ? "On" : "Off"} tone={value ? "accent" : "neutral"} />
      </View>
      <SegmentedControl
        onChange={(next) => onValueChange(next === "on")}
        options={[
          { label: "Off", value: "off" },
          { label: "On", value: "on" }
        ]}
        value={value ? "on" : "off"}
      />
    </Surface>
  );
}

const styles = StyleSheet.create({
  content: {
    paddingBottom: 120,
    gap: 12
  },
  section: {
    padding: 16,
    gap: 12,
    marginBottom: 12
  },
  row: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8
  },
  headerRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    gap: 12,
    alignItems: "flex-start"
  },
  copy: {
    flex: 1,
    gap: 3
  },
  eventCard: {
    padding: 12,
    gap: 8
  },
  errorText: {
    color: "#C25454"
  }
});
