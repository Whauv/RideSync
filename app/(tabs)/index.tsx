import { useEffect } from "react";
import { ActivityIndicator, StyleSheet, View } from "react-native";
import { MaterialCommunityIcons } from "@expo/vector-icons";

import { AppText } from "@/components/core/AppText";
import { PrimaryButton } from "@/components/core/PrimaryButton";
import { Screen } from "@/components/core/Screen";
import { Surface } from "@/components/core/Surface";
import { StateBanner } from "@/components/feedback/StateBanner";
import { MapPreview } from "@/components/ride/MapPreview";
import { useTheme } from "@/design/ThemeProvider";
import { useRoomSnapshot } from "@/features/rooms/useRoomSnapshot";
import { useAppStore } from "@/store/useAppStore";

export default function RideScreen() {
  const theme = useTheme();
  const { data, isLoading } = useRoomSnapshot();
  const joinRoom = useAppStore((state) => state.joinRoom);
  const leaderMusic = useAppStore((state) => state.leaderMusic);
  const activeRoom = useAppStore((state) => state.activeRoom);

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
          <AppText tone="muted">Loading ride room…</AppText>
        </View>
      </Screen>
    );
  }

  return (
    <Screen scroll>
      <View style={styles.header}>
        <View>
          <AppText variant="caption" tone="accent">
            LIVE ROOM {data.room.code}
          </AppText>
          <AppText variant="title">{data.room.title}</AppText>
          <AppText tone="muted">
            {data.room.destination} · ETA {data.room.etaMinutes} min
          </AppText>
        </View>
        <View style={[styles.voicePill, { backgroundColor: theme.colors.accentSoft }]}>
          <MaterialCommunityIcons name="microphone-wireless" size={16} color={theme.colors.accent} />
          <AppText variant="caption">Voice live</AppText>
        </View>
      </View>

      <MapPreview riders={data.riders} />

      <View style={styles.metricsRow}>
        <Surface style={styles.metricCard}>
          <AppText variant="caption" tone="soft">
            Group speed
          </AppText>
          <AppText variant="metric">67</AppText>
          <AppText tone="muted">Cruise steady</AppText>
        </Surface>
        <Surface style={styles.metricCard} muted>
          <AppText variant="caption" tone="soft">
            Ride status
          </AppText>
          <AppText variant="title">Rolling</AppText>
          <AppText tone="muted">2 riders need fuel soon</AppText>
        </Surface>
      </View>

      <Surface>
        <View style={styles.musicHeader}>
          <View>
            <AppText variant="caption" tone="soft">
              Leader sync playback
            </AppText>
            <AppText variant="title">{leaderMusic.track}</AppText>
            <AppText tone="muted">{leaderMusic.artist}</AppText>
          </View>
          <PrimaryButton label={leaderMusic.isPlaying ? "Pause Group" : "Resume Group"} />
        </View>
      </Surface>

      <StateBanner
        title="Offline resilience"
        body="Last good telemetry is cached locally. Riders degrade to stale state before disconnecting."
      />
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
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginVertical: 18
  },
  voicePill: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    borderRadius: 999,
    paddingHorizontal: 12,
    paddingVertical: 8
  },
  metricsRow: {
    flexDirection: "row",
    gap: 12,
    marginTop: 12,
    marginBottom: 12
  },
  metricCard: {
    flex: 1
  },
  musicHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    gap: 16
  }
});
