import { StyleSheet, View } from "react-native";

import { AppText } from "@/components/primitives/AppText";
import { Button } from "@/components/primitives/Button";
import { Chip } from "@/components/primitives/Chip";
import { Surface } from "@/components/primitives/Surface";
import { MusicSyncSnapshot } from "@/types/music";

interface MusicSyncDiagnosticsProps {
  snapshot: MusicSyncSnapshot;
  onResync: () => void;
}

export function MusicSyncDiagnostics({ snapshot, onResync }: MusicSyncDiagnosticsProps) {
  return (
    <Surface muted style={styles.card}>
      <View style={styles.header}>
        <View>
          <AppText variant="footnote" tone="secondary">
            Sync diagnostics
          </AppText>
          <AppText variant="title3">Timing health</AppText>
        </View>
        <Chip
          label={snapshot.syncHealth}
          tone={snapshot.syncHealth === "tight" ? "success" : snapshot.syncHealth === "watch" ? "warning" : "danger"}
        />
      </View>

      <View style={styles.metricsRow}>
        <View style={styles.metric}>
          <AppText variant="footnote" tone="secondary">
            Drift
          </AppText>
          <AppText variant="title2">{snapshot.driftMs} ms</AppText>
        </View>
        <View style={styles.metric}>
          <AppText variant="footnote" tone="secondary">
            Device lag
          </AppText>
          <AppText variant="title2">{snapshot.deviceLagMs} ms</AppText>
        </View>
        <View style={styles.metric}>
          <AppText variant="footnote" tone="secondary">
            Lag compensation
          </AppText>
          <AppText variant="title2">{snapshot.lagCompensationMs} ms</AppText>
        </View>
      </View>

      <View style={styles.footer}>
        <Chip label={snapshot.resyncState} tone={snapshot.resyncState === "idle" ? "neutral" : "warning"} />
        <Button icon="refresh" label="Re-sync now" onPress={onResync} variant="ghost" />
      </View>
    </Surface>
  );
}

const styles = StyleSheet.create({
  card: {
    padding: 14,
    gap: 12
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    gap: 12
  },
  metricsRow: {
    flexDirection: "row",
    gap: 12
  },
  metric: {
    flex: 1,
    gap: 2
  },
  footer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    gap: 12
  }
});
