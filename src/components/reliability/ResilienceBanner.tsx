import { StyleSheet, View } from "react-native";

import { AppText } from "@/components/primitives/AppText";
import { Button } from "@/components/primitives/Button";
import { Chip } from "@/components/primitives/Chip";
import { Surface } from "@/components/primitives/Surface";
import { ReliabilitySnapshot } from "@/types/runtime";
import { VoiceSessionSnapshot } from "@/types/voice";

interface ResilienceBannerProps {
  reliability: ReliabilitySnapshot;
  staleLocationSeconds: number;
  voiceSession: VoiceSessionSnapshot;
  onRetrySync?: () => void;
  onRetryVoice?: () => void;
}

export function ResilienceBanner({
  reliability,
  staleLocationSeconds,
  voiceSession,
  onRetrySync,
  onRetryVoice
}: ResilienceBannerProps) {
  const showStale = staleLocationSeconds >= 18;
  const isOffline = reliability.connectivity === "offline";
  const isUnstable = reliability.connectivity === "unstable";
  const voiceNeedsHelp = voiceSession.connectionState === "reconnecting" || voiceSession.connectionState === "degraded" || voiceSession.connectionState === "error";

  if (!isOffline && !isUnstable && !showStale && !voiceNeedsHelp) {
    return null;
  }

  return (
    <Surface raised style={styles.card}>
      <View style={styles.header}>
        <View style={styles.copy}>
          <AppText variant="title3">{isOffline ? "Connection lost" : isUnstable ? "Weak connection" : "Recovery guardrails active"}</AppText>
          <AppText tone="secondary">
            {isOffline
              ? "RideSync is holding local state and waiting to recover room sync."
              : showStale
                ? `Location updates are stale by ${Math.round(staleLocationSeconds)}s.`
                : "The app is reducing trust in live telemetry until the ride stabilizes."}
          </AppText>
        </View>
        <View style={styles.chips}>
          <Chip label={reliability.connectivity} tone={isOffline ? "danger" : "warning"} />
          {voiceNeedsHelp ? (
            <Chip
              label={voiceSession.connectionState}
              tone={voiceSession.connectionState === "error" ? "danger" : "warning"}
            />
          ) : null}
        </View>
      </View>

      <View style={styles.actions}>
        {onRetrySync ? <Button label="Retry room sync" onPress={onRetrySync} variant="secondary" /> : null}
        {voiceNeedsHelp && onRetryVoice ? <Button label="Retry voice" onPress={onRetryVoice} variant="ghost" /> : null}
      </View>

      <AppText variant="footnote" tone="tertiary">
        {reliability.lastRoomSyncAt
          ? `Last stable room sync ${new Date(reliability.lastRoomSyncAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit", second: "2-digit" })}`
          : "No stable room sync recorded yet."}
      </AppText>
    </Surface>
  );
}

const styles = StyleSheet.create({
  card: {
    padding: 14,
    gap: 10
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    gap: 12
  },
  copy: {
    flex: 1,
    gap: 4
  },
  chips: {
    gap: 8,
    alignItems: "flex-end"
  },
  actions: {
    gap: 8
  }
});
