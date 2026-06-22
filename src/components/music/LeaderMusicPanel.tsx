import { StyleSheet, View } from "react-native";

import { MusicArtwork } from "@/components/music/MusicArtwork";
import { AppText } from "@/components/primitives/AppText";
import { Button } from "@/components/primitives/Button";
import { Chip } from "@/components/primitives/Chip";
import { Surface } from "@/components/primitives/Surface";
import { MusicSyncSnapshot } from "@/types/music";

interface LeaderMusicPanelProps {
  snapshot: MusicSyncSnapshot;
  onPlayPause: () => void;
  onSkipPrevious: () => void;
  onSkipNext: () => void;
}

function formatMs(value: number) {
  const totalSeconds = Math.floor(value / 1000);
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = `${totalSeconds % 60}`.padStart(2, "0");
  return `${minutes}:${seconds}`;
}

export function LeaderMusicPanel({ snapshot, onPlayPause, onSkipPrevious, onSkipNext }: LeaderMusicPanelProps) {
  const currentTrack = snapshot.queue[snapshot.currentIndex];
  const progress = currentTrack ? Math.min(1, snapshot.elapsedMs / currentTrack.durationMs) : 0;

  return (
    <Surface raised style={styles.card}>
      <View style={styles.header}>
        <View>
          <AppText tone="secondary" variant="footnote">
            Leader playback
          </AppText>
          <AppText variant="title3">Authoritative sync queue</AppText>
        </View>
        <View style={styles.headerChips}>
          <Chip label={snapshot.provider} tone="accent" />
          <Chip label={snapshot.syncHealth} tone={snapshot.syncHealth === "tight" ? "success" : snapshot.syncHealth === "watch" ? "warning" : "danger"} />
        </View>
      </View>

      {currentTrack ? (
        <View style={styles.nowPlaying}>
          <MusicArtwork size={72} token={currentTrack.artworkToken} />
          <View style={styles.trackCopy}>
            <AppText variant="title2">{currentTrack.title}</AppText>
            <AppText tone="secondary">{currentTrack.artist}</AppText>
            <AppText tone="tertiary" variant="footnote">
              {currentTrack.album}
            </AppText>
          </View>
        </View>
      ) : null}

      <View style={styles.timeline}>
        <View style={styles.trackBar}>
          <View style={[styles.trackFill, { width: `${progress * 100}%` }]} />
        </View>
        <View style={styles.timeRow}>
          <AppText tone="secondary" variant="footnote">
            {formatMs(snapshot.elapsedMs)}
          </AppText>
          <AppText tone="secondary" variant="footnote">
            {currentTrack ? formatMs(currentTrack.durationMs) : "0:00"}
          </AppText>
        </View>
      </View>

      <View style={styles.controls}>
        <Button icon="skip-previous" label="Previous" onPress={onSkipPrevious} variant="secondary" />
        <Button
          icon={snapshot.playbackState === "playing" ? "pause" : "play"}
          label={snapshot.playbackState === "playing" ? "Pause group" : "Play group"}
          onPress={onPlayPause}
        />
        <Button icon="skip-next" label="Next" onPress={onSkipNext} variant="secondary" />
      </View>

      <View style={styles.queue}>
        <AppText variant="footnote" tone="secondary">
          Queue
        </AppText>
        {snapshot.queue.map((track, index) => (
          <View key={track.id} style={styles.queueRow}>
            <View style={styles.queueIndex}>
              <AppText variant="footnote">{`${index + 1}`.padStart(2, "0")}</AppText>
            </View>
            <View style={styles.queueCopy}>
              <AppText variant="callout">{track.title}</AppText>
              <AppText tone="secondary" variant="footnote">
                {track.artist}
              </AppText>
            </View>
            {index === snapshot.currentIndex ? <Chip label="Live" tone="accent" /> : null}
          </View>
        ))}
      </View>
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
  headerChips: {
    flexDirection: "row",
    gap: 8,
    flexWrap: "wrap",
    justifyContent: "flex-end"
  },
  nowPlaying: {
    flexDirection: "row",
    gap: 14
  },
  trackCopy: {
    flex: 1,
    justifyContent: "center",
    gap: 2
  },
  timeline: {
    gap: 6
  },
  trackBar: {
    height: 7,
    borderRadius: 999,
    backgroundColor: "rgba(78, 195, 181, 0.16)",
    overflow: "hidden"
  },
  trackFill: {
    height: "100%",
    borderRadius: 999,
    backgroundColor: "#4EC3B5"
  },
  timeRow: {
    flexDirection: "row",
    justifyContent: "space-between"
  },
  controls: {
    flexDirection: "row",
    gap: 10
  },
  queue: {
    gap: 10
  },
  queueRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12
  },
  queueIndex: {
    width: 28
  },
  queueCopy: {
    flex: 1
  }
});
