import { useEffect, useState } from "react";
import { StyleSheet, View } from "react-native";
import { useRouter } from "expo-router";

import { EcosystemFrame } from "@/components/ecosystem/EcosystemFrame";
import { MetricRail } from "@/components/ecosystem/MetricRail";
import { AppHeader } from "@/components/primitives/AppHeader";
import { AppText } from "@/components/primitives/AppText";
import { Button } from "@/components/primitives/Button";
import { Chip } from "@/components/primitives/Chip";
import { EmptyState } from "@/components/primitives/EmptyState";
import { ListRow } from "@/components/primitives/ListRow";
import { Screen } from "@/components/primitives/Screen";
import { SkeletonLoader } from "@/components/primitives/SkeletonLoader";
import { Surface } from "@/components/primitives/Surface";
import { useTheme } from "@/design/ThemeProvider";
import { AdminConsoleOverview, AdminIncidentSummary, getAdminConsoleOverview } from "@/services/admin";

function formatTime(value: string) {
  return new Intl.DateTimeFormat(undefined, {
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit"
  }).format(new Date(value));
}

function severityTone(severity: AdminIncidentSummary["severity"]) {
  if (severity === "critical") return "danger";
  if (severity === "high") return "warning";
  if (severity === "medium") return "accent";
  return "neutral";
}

export default function AdminScreen() {
  const router = useRouter();
  const theme = useTheme();
  const [overview, setOverview] = useState<AdminConsoleOverview | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  async function loadOverview(isRefresh = false) {
    if (isRefresh) {
      setRefreshing(true);
    } else {
      setLoading(true);
    }

    try {
      setOverview(await getAdminConsoleOverview());
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }

  useEffect(() => {
    void loadOverview();
  }, []);

  return (
    <Screen contentStyle={styles.screen} onRefresh={() => loadOverview(true)} refreshing={refreshing} scroll>
      <AppHeader
        subtitle="Rooms, incidents, and moderation"
        title="RideSync Admin"
        right={<Button label="Marketing" onPress={() => router.push("/marketing")} variant="secondary" />}
      />

      <EcosystemFrame
        eyebrow="Operational beta console"
        subtitle="A lightweight internal surface for triage, room oversight, and safety review while the product scales."
        title="Calm visibility into ride operations"
      >
        {loading || !overview ? (
          <View style={styles.loadingStack}>
            <SkeletonLoader height={116} />
            <SkeletonLoader height={88} />
            <SkeletonLoader height={88} />
          </View>
        ) : (
          <>
            <MetricRail
              items={[
                { label: "Rooms", value: `${overview.rooms.length}`, detail: "Persisted local room snapshots" },
                { label: "Open incidents", value: `${overview.incidents.filter((item) => item.status !== "resolved").length}`, detail: "SOS, hazards, fuel, and connectivity signals" },
                { label: "Flags", value: `${overview.abuseReports.length}`, detail: "System-generated moderation review queue" }
              ]}
            />

            <View style={styles.consoleBands}>
              <View style={[styles.signalBand, { backgroundColor: theme.colors.surfaceMuted, borderColor: theme.colors.lineSubtle }]}>
                <Chip icon="radio-tower" label={`${overview.rooms.reduce((sum, room) => sum + room.connectedRiders, 0)} riders connected`} tone="success" />
                <Chip icon="account-clock-outline" label={`${overview.rooms.reduce((sum, room) => sum + room.pendingApprovals, 0)} pending approvals`} tone="warning" />
                <Chip icon="alert-outline" label={`${overview.diagnostics.filter((item) => item.level !== "info").length} diagnostic warnings`} tone="danger" />
              </View>
            </View>
          </>
        )}
      </EcosystemFrame>

      <View style={styles.section}>
        <AppText variant="title2">Active rooms</AppText>
        <AppText tone="secondary" variant="callout">
          Leader state, queue health, and room readiness in one pass.
        </AppText>
      </View>

      <Surface raised style={styles.panel}>
        {loading || !overview ? (
          <SkeletonLoader height={224} />
        ) : overview.rooms.length ? (
          overview.rooms.map((room) => (
            <ListRow
              key={room.id}
              leading={<Chip label={room.lifecycle === "rolling" ? "Rolling" : "Lobby"} tone={room.lifecycle === "rolling" ? "accent" : "neutral"} />}
              subtitle={`${room.riderCount} approved riders • ${room.pendingApprovals} pending • code ${room.code}`}
              title={room.title}
              trailing={
                <View style={styles.trailingMeta}>
                  {room.activeAlertKind ? (
                    <Chip icon="alert-octagon-outline" label="Alert" tone="danger" />
                  ) : room.locked ? (
                    <Chip icon="lock-outline" label="Locked" tone="warning" />
                  ) : (
                    <Chip icon="check-circle-outline" label="Stable" tone="success" />
                  )}
                  <AppText tone="tertiary" variant="footnote">
                    {formatTime(room.updatedAt)}
                  </AppText>
                </View>
              }
            />
          ))
        ) : (
          <EmptyState
            icon="motorbike"
            actionLabel="Open marketing"
            body="Create a room in the app and it will appear here for moderation and support review."
            onAction={() => router.push("/marketing")}
            title="No rooms yet"
          />
        )}
      </Surface>

      <View style={styles.section}>
        <AppText variant="title2">Incidents</AppText>
        <AppText tone="secondary" variant="callout">
          Ranked by urgency so operators can separate real risk from routine chatter.
        </AppText>
      </View>

      <Surface raised style={styles.panel}>
        {loading || !overview ? (
          <SkeletonLoader height={184} />
        ) : overview.incidents.length ? (
          overview.incidents.slice(0, 8).map((incident) => (
            <ListRow
              key={incident.id}
              leading={<Chip label={incident.severity.toUpperCase()} tone={severityTone(incident.severity)} />}
              subtitle={`${incident.roomTitle} • ${incident.detail}`}
              title={incident.title}
              trailing={
                <View style={styles.trailingMeta}>
                  <Chip
                    icon={incident.status === "active" ? "alert-circle-outline" : incident.status === "watch" ? "eye-outline" : "check-circle-outline"}
                    label={incident.status}
                    tone={incident.status === "active" ? "danger" : incident.status === "watch" ? "warning" : "success"}
                  />
                  <AppText tone="tertiary" variant="footnote">
                    {formatTime(incident.createdAt)}
                  </AppText>
                </View>
              }
            />
          ))
        ) : (
          <EmptyState body="SOS, hazard, and connectivity issues will surface here." icon="alert-outline" title="No active incidents" />
        )}
      </Surface>

      <View style={styles.section}>
        <AppText variant="title2">Moderation and diagnostics</AppText>
        <AppText tone="secondary" variant="callout">
          Lightweight hooks for abuse review and beta support without introducing a separate tooling stack.
        </AppText>
      </View>

      <View style={styles.stack}>
        <Surface raised style={styles.panel}>
          <AppText variant="bodyStrong">Abuse review queue</AppText>
          {loading || !overview ? (
            <SkeletonLoader height={132} />
          ) : overview.abuseReports.length ? (
            overview.abuseReports.map((report) => (
              <ListRow
                key={report.id}
                leading={<Chip label={report.severity.toUpperCase()} tone={severityTone(report.severity)} />}
                subtitle={`${report.roomTitle} • ${report.detail}`}
                title={report.subject}
                trailing={<Chip icon="shield-star-outline" label={report.disposition} tone="warning" />}
              />
            ))
          ) : (
            <EmptyState
              body="System flags for misuse will appear here when repeated emergency channel behavior needs review."
              icon="shield-outline"
              title="No abuse flags"
            />
          )}
        </Surface>

        <Surface raised style={styles.panel}>
          <AppText variant="bodyStrong">Latest diagnostics</AppText>
          {loading || !overview ? (
            <SkeletonLoader height={132} />
          ) : overview.diagnostics.length ? (
            overview.diagnostics.slice(0, 6).map((event) => (
              <ListRow
                key={event.id}
                leading={<Chip label={event.level.toUpperCase()} tone={event.level === "error" ? "danger" : event.level === "warning" ? "warning" : "neutral"} />}
                subtitle={`${event.category} • ${event.detail}`}
                title={event.title}
                trailing={
                  <AppText tone="tertiary" variant="footnote">
                    {formatTime(event.createdAt)}
                  </AppText>
                }
              />
            ))
          ) : (
            <EmptyState
              body="Recovery, voice, notification, and room events will flow here as the beta expands."
              icon="pulse"
              title="Diagnostics are quiet"
            />
          )}
        </Surface>
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  screen: {
    gap: 18,
    paddingTop: 8
  },
  loadingStack: {
    gap: 10
  },
  consoleBands: {
    gap: 10
  },
  signalBand: {
    borderWidth: 1,
    borderRadius: 22,
    padding: 12,
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8
  },
  section: {
    gap: 6
  },
  panel: {
    borderRadius: 26,
    padding: 10,
    gap: 6
  },
  trailingMeta: {
    alignItems: "flex-end",
    gap: 6
  },
  stack: {
    gap: 12
  }
});
