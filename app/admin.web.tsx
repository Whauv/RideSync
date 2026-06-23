import { useEffect, useState } from "react";
import { StyleSheet, View, useWindowDimensions } from "react-native";
import { useRouter } from "expo-router";

import { AppText } from "@/components/primitives/AppText";
import { Button } from "@/components/primitives/Button";
import { Chip } from "@/components/primitives/Chip";
import { EmptyState } from "@/components/primitives/EmptyState";
import { ListRow } from "@/components/primitives/ListRow";
import { Screen } from "@/components/primitives/Screen";
import { SkeletonLoader } from "@/components/primitives/SkeletonLoader";
import { Surface } from "@/components/primitives/Surface";
import { AdminConsoleOverview, AdminIncidentSummary, getAdminConsoleOverview } from "@/services/admin";
import { WebMetricCard } from "@/components/web/WebMetricCard";
import { WebScaffold } from "@/components/web/WebScaffold";

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

export default function AdminWebScreen() {
  const router = useRouter();
  const { width } = useWindowDimensions();
  const desktop = width >= 1120;
  const [overview, setOverview] = useState<AdminConsoleOverview | null>(null);
  const [loading, setLoading] = useState(true);

  async function loadOverview() {
    setLoading(true);
    try {
      setOverview(await getAdminConsoleOverview());
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    void loadOverview();
  }, []);

  return (
    <Screen contentStyle={styles.screen} scroll>
      <WebScaffold
        eyebrow="INTERNAL OPERATIONS"
        right={
          <>
            <Button label="Refresh" onPress={loadOverview} variant="secondary" />
            <Button label="Marketing" onPress={() => router.push("/marketing")} />
          </>
        }
        subtitle="Read-heavy moderation, incident triage, and support visibility for beta operations."
        title="RideSync Operations Console"
      >
        {loading || !overview ? (
          <View style={styles.loadingStack}>
            <SkeletonLoader height={160} />
            <SkeletonLoader height={280} />
          </View>
        ) : (
          <>
            <View style={styles.metricRow}>
              <WebMetricCard detail="Persisted room states available to operations" label="Rooms" value={`${overview.rooms.length}`} />
              <WebMetricCard detail="Open watch items and live escalations" label="Incidents" value={`${overview.incidents.filter((item) => item.status !== "resolved").length}`} />
              <WebMetricCard detail="System-generated review queue for beta moderation" label="Flags" value={`${overview.abuseReports.length}`} />
              <WebMetricCard detail="Warnings and errors across recovery, voice, and notifications" label="Diagnostics" value={`${overview.diagnostics.filter((item) => item.level !== "info").length}`} />
            </View>

            <View style={[styles.dashboardGrid, desktop && styles.dashboardGridDesktop]}>
              <View style={styles.primaryColumn}>
                <Surface raised style={styles.panel}>
                  <View style={styles.panelHeader}>
                    <View style={styles.panelCopy}>
                      <AppText variant="title3">Active rooms</AppText>
                      <AppText tone="secondary" variant="callout">
                        Room state, join pressure, and operational readiness at a glance.
                      </AppText>
                    </View>
                    <Chip icon="account-group-outline" label={`${overview.rooms.reduce((sum, room) => sum + room.connectedRiders, 0)} riders connected`} tone="success" />
                  </View>
                  {overview.rooms.length ? (
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
                      actionLabel="Open marketing"
                      body="Create a room in the app and it will appear here for moderation and support review."
                      icon="motorbike"
                      onAction={() => router.push("/marketing")}
                      title="No rooms yet"
                    />
                  )}
                </Surface>

                <Surface raised style={styles.panel}>
                  <View style={styles.panelHeader}>
                    <View style={styles.panelCopy}>
                      <AppText variant="title3">Incidents</AppText>
                      <AppText tone="secondary" variant="callout">
                        Severity-ranked signals keep the operator focused on actual risk.
                      </AppText>
                    </View>
                    <Chip label={`${overview.incidents.filter((item) => item.status === "active").length} active`} tone="warning" />
                  </View>
                  {overview.incidents.length ? (
                    overview.incidents.slice(0, 10).map((incident) => (
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
                    <EmptyState body="SOS, hazard, fuel, and connectivity issues will surface here." icon="alert-outline" title="No active incidents" />
                  )}
                </Surface>
              </View>

              <View style={styles.secondaryColumn}>
                <Surface raised style={styles.panel}>
                  <View style={styles.panelHeader}>
                    <View style={styles.panelCopy}>
                      <AppText variant="title3">Abuse review queue</AppText>
                      <AppText tone="secondary" variant="callout">
                        Lightweight moderation hooks for beta operations.
                      </AppText>
                    </View>
                  </View>
                  {overview.abuseReports.length ? (
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
                      body="System-generated moderation flags will appear here as beta usage grows."
                      icon="shield-outline"
                      title="No abuse flags"
                    />
                  )}
                </Surface>

                <Surface raised style={styles.panel}>
                  <View style={styles.panelHeader}>
                    <View style={styles.panelCopy}>
                      <AppText variant="title3">Latest diagnostics</AppText>
                      <AppText tone="secondary" variant="callout">
                        Recovery, voice, and notification health for support visibility.
                      </AppText>
                    </View>
                  </View>
                  {overview.diagnostics.length ? (
                    overview.diagnostics.slice(0, 8).map((event) => (
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
                      body="Diagnostic events will accumulate here as rooms, pings, and recovery flows are exercised."
                      icon="pulse"
                      title="Diagnostics are quiet"
                    />
                  )}
                </Surface>
              </View>
            </View>
          </>
        )}
      </WebScaffold>
    </Screen>
  );
}

const styles = StyleSheet.create({
  screen: {
    paddingVertical: 0
  },
  loadingStack: {
    gap: 16
  },
  metricRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 12
  },
  dashboardGrid: {
    gap: 16
  },
  dashboardGridDesktop: {
    flexDirection: "row",
    alignItems: "flex-start"
  },
  primaryColumn: {
    flex: 1,
    gap: 16
  },
  secondaryColumn: {
    width: 380,
    gap: 16
  },
  panel: {
    borderRadius: 28,
    padding: 14,
    gap: 8
  },
  panelHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    gap: 12,
    paddingHorizontal: 4,
    paddingBottom: 4
  },
  panelCopy: {
    flex: 1,
    gap: 4
  },
  trailingMeta: {
    alignItems: "flex-end",
    gap: 6
  }
});
