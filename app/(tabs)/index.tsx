import { useEffect, useState } from "react";
import { ActivityIndicator, StyleSheet, View } from "react-native";
import { router } from "expo-router";

import { AppHeader } from "@/components/primitives/AppHeader";
import { AppText } from "@/components/primitives/AppText";
import { BottomSheet } from "@/components/primitives/BottomSheet";
import { Button } from "@/components/primitives/Button";
import { Chip } from "@/components/primitives/Chip";
import { IconButton } from "@/components/primitives/IconButton";
import { ListRow } from "@/components/primitives/ListRow";
import { Screen } from "@/components/primitives/Screen";
import { Surface } from "@/components/primitives/Surface";
import { MapPreview } from "@/components/ride/MapPreview";
import { useTheme } from "@/design/ThemeProvider";
import { useRoomSnapshot } from "@/features/rooms/useRoomSnapshot";
import { useToast } from "@/providers/ToastProvider";
import { useAppStore } from "@/store/useAppStore";

export default function RideScreen() {
  const theme = useTheme();
  const { showToast } = useToast();
  const { data, isLoading } = useRoomSnapshot();
  const joinRoom = useAppStore((state) => state.joinRoom);
  const activeRoom = useAppStore((state) => state.activeRoom);
  const leaderMusic = useAppStore((state) => state.leaderMusic);
  const [showActions, setShowActions] = useState(false);

  useEffect(() => {
    if (data && !activeRoom) {
      joinRoom(data.room, data.riders, data.messages);
    }
  }, [activeRoom, data, joinRoom]);

  if (isLoading || !data) {
    return (
      <Screen>
        <View style={styles.loader}>
          <ActivityIndicator color={theme.colors.accent} />
          <AppText tone="secondary">Loading live ride shell…</AppText>
        </View>
      </Screen>
    );
  }

  return (
    <Screen scroll>
      <AppHeader
        eyebrow={`ROOM ${data.room.code}`}
        right={<IconButton icon="dots-horizontal" onPress={() => router.push("/modal")} />}
        subtitle={`${data.room.destination} · ETA ${data.room.etaMinutes} min · ${data.room.riderCount} riders`}
        title={data.room.title}
      />

      <MapPreview riders={data.riders} />

      <View style={styles.metricsRow}>
        <Surface raised style={styles.metricCard}>
          <AppText tone="secondary" variant="footnote">
            Group pace
          </AppText>
          <AppText variant="metric">67</AppText>
          <Chip label="Stable" tone="success" />
        </Surface>
        <Surface style={styles.metricCard}>
          <AppText tone="secondary" variant="footnote">
            Ride state
          </AppText>
          <AppText variant="title2">Rolling</AppText>
          <AppText tone="secondary" variant="callout">
            Tail confirms full pack through latest split.
          </AppText>
        </Surface>
      </View>

      <Surface style={styles.panel}>
        <AppText tone="secondary" variant="footnote">
          Leader playback
        </AppText>
        <AppText variant="title2">{leaderMusic.track}</AppText>
        <AppText tone="secondary">{leaderMusic.artist}</AppText>
        <View style={styles.row}>
          <Button
            label={leaderMusic.isPlaying ? "Pause group" : "Resume group"}
            onPress={() => showToast({ title: "Music sync updated", message: "Leader transport state broadcast to riders.", tone: "success" })}
            variant="secondary"
          />
          <Button label="Ride actions" onPress={() => setShowActions(true)} />
        </View>
      </Surface>

      <Surface muted style={styles.panel}>
        <ListRow
          chevron
          leading={<Chip label="Connectivity" tone="success" />}
          onPress={() => showToast({ title: "Network healthy", message: "Voice and presence round-trip are within target.", tone: "success" })}
          subtitle="Foreground sync, telemetry cache, and voice reconnect policies are configured."
          title="Operational status"
        />
      </Surface>

      <BottomSheet onClose={() => setShowActions(false)} visible={showActions}>
        <AppText variant="title2">Live ride actions</AppText>
        <Button label="Regroup at next turnout" variant="secondary" />
        <Button label="Mark hazard ahead" variant="secondary" />
        <Button label="Send fuel ping" variant="secondary" />
      </BottomSheet>
    </Screen>
  );
}

const styles = StyleSheet.create({
  loader: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    gap: 12
  },
  metricsRow: {
    flexDirection: "row",
    gap: 12,
    marginTop: 12
  },
  metricCard: {
    flex: 1,
    padding: 16,
    gap: 6
  },
  panel: {
    padding: 16,
    marginTop: 12,
    gap: 8
  },
  row: {
    flexDirection: "row",
    gap: 10,
    marginTop: 8
  }
});
