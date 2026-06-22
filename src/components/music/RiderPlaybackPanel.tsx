import { StyleSheet, View } from "react-native";

import { MusicArtwork } from "@/components/music/MusicArtwork";
import { AppText } from "@/components/primitives/AppText";
import { Button } from "@/components/primitives/Button";
import { Chip } from "@/components/primitives/Chip";
import { Surface } from "@/components/primitives/Surface";
import { MusicSyncSnapshot } from "@/types/music";

interface RiderPlaybackPanelProps {
  snapshot: MusicSyncSnapshot;
  onMixDown: () => void;
  onMixUp: () => void;
}

function formatMs(value: number) {
  const totalSeconds = Math.floor(value / 1000);
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = `${totalSeconds % 60}`.padStart(2, "0");
  return `${minutes}:${seconds}`;
}

export function RiderPlaybackPanel({ snapshot, onMixDown, onMixUp }: RiderPlaybackPanelProps) {
  const currentTrack = snapshot.queue[snapshot.currentIndex];

  return (
    <Surface style={styles.card}>
      <View style={styles.header}>
        <View>
          <AppText tone="secondary" variant="footnote">
            Rider playback
          </AppText>
          <AppText variant="title3">Leader-controlled session</AppText>
        </View>
        <Chip label={snapshot.playbackState} tone={snapshot.playbackState === "playing" ? "success" : "neutral"} />
      </View>

      {currentTrack ? (
        <View style={styles.nowPlaying}>
          <MusicArtwork token={currentTrack.artworkToken} />
          <View style={styles.copy}>
            <AppText variant="title3">{currentTrack.title}</AppText>
            <AppText tone="secondary">{currentTrack.artist}</AppText>
            <AppText tone="tertiary" variant="footnote">
              Synced at {formatMs(snapshot.elapsedMs)}
            </AppText>
          </View>
        </View>
      ) : null}

      <View style={styles.mixCard}>
        <View>
          <AppText variant="footnote" tone="secondary">
            Local mix placeholder
          </AppText>
          <AppText variant="title2">{snapshot.localMixPct}%</AppText>
        </View>
        <View style={styles.mixActions}>
          <Button icon="minus" label="Less" onPress={onMixDown} variant="secondary" />
          <Button icon="plus" label="More" onPress={onMixUp} variant="secondary" />
        </View>
      </View>

      <AppText tone="secondary" variant="footnote">
        This contract syncs leader playback metadata and timing. Final per-device audio routing stays provider-specific.
      </AppText>
    </Surface>
  );
}

const styles = StyleSheet.create({
  card: {
    padding: 16,
    gap: 14
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    gap: 12
  },
  nowPlaying: {
    flexDirection: "row",
    gap: 14
  },
  copy: {
    flex: 1,
    justifyContent: "center",
    gap: 2
  },
  mixCard: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    gap: 12
  },
  mixActions: {
    flexDirection: "row",
    gap: 10
  }
});
