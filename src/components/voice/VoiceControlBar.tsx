import { StyleSheet, View } from "react-native";

import { AppText } from "@/components/primitives/AppText";
import { Button } from "@/components/primitives/Button";
import { Chip } from "@/components/primitives/Chip";
import { Surface } from "@/components/primitives/Surface";
import { VoiceSessionSnapshot } from "@/types/voice";

interface VoiceControlBarProps {
  voiceSession: VoiceSessionSnapshot;
  canUseVoice: boolean;
  isLeaderView?: boolean;
  allowLeaderAnnounce?: boolean;
  onToggleMute: () => void;
  onRetry: () => void;
  onLeaderAnnounce: () => void;
}

function connectionTone(state: VoiceSessionSnapshot["connectionState"]) {
  if (state === "connected") {
    return "success";
  }

  if (state === "degraded" || state === "reconnecting") {
    return "warning";
  }

  if (state === "error") {
    return "danger";
  }

  return "neutral";
}

export function VoiceControlBar({
  voiceSession,
  canUseVoice,
  isLeaderView = false,
  allowLeaderAnnounce = true,
  onToggleMute,
  onRetry,
  onLeaderAnnounce
}: VoiceControlBarProps) {
  const stateLabel =
    voiceSession.connectionState === "connected"
      ? "Voice connected"
      : voiceSession.connectionState === "degraded"
        ? "Voice degraded"
        : voiceSession.connectionState === "reconnecting"
          ? "Voice reconnecting"
          : voiceSession.connectionState === "connecting"
            ? "Voice joining"
            : "Voice idle";

  return (
    <Surface raised style={styles.card}>
      <View style={styles.topRow}>
        <View style={styles.copy}>
          <AppText variant="footnote" tone="secondary">
            Group voice
          </AppText>
          <AppText variant="title3">{stateLabel}</AppText>
        </View>
        <View style={styles.chips}>
          <Chip
            icon={voiceSession.selfMuted ? "microphone-off" : "microphone"}
            label={voiceSession.selfMuted ? "Muted" : "Open mic"}
            tone={voiceSession.selfMuted ? "warning" : "success"}
          />
          <Chip label={voiceSession.provider.toUpperCase()} tone="accent" />
        </View>
      </View>

      <View style={styles.metaRow}>
        <AppText tone="secondary" variant="footnote">
          {voiceSession.deviceStatus.inputLabel} to {voiceSession.deviceStatus.outputLabel}
        </AppText>
        <Chip label={voiceSession.connectionState} tone={connectionTone(voiceSession.connectionState)} />
      </View>

      <View style={styles.metaRow}>
        <AppText tone="secondary" variant="footnote">
          {voiceSession.deviceStatus.backgroundProtected ? "Background audio protected" : "Foreground audio active"}
        </AppText>
        {voiceSession.poorNetwork ? <Chip icon="signal" label="Poor network" tone="warning" /> : null}
      </View>

      <View style={styles.actions}>
        <Button
          icon={voiceSession.selfMuted ? "microphone" : "microphone-off"}
          label={voiceSession.selfMuted ? "Unmute self" : "Mute self"}
          onPress={onToggleMute}
          variant={voiceSession.selfMuted ? "secondary" : "primary"}
        />
        {voiceSession.connectionState !== "connected" ? (
          <Button icon="refresh" label="Retry voice" onPress={onRetry} variant="ghost" />
        ) : null}
        {isLeaderView && allowLeaderAnnounce ? (
          <Button
            disabled={!canUseVoice}
            icon="bullhorn-outline"
            label={voiceSession.leaderAnnounceRequested ? "Announce queued" : "Announce mode"}
            onPress={onLeaderAnnounce}
            variant="secondary"
          />
        ) : null}
      </View>

      {!canUseVoice ? (
        <AppText tone="warning" variant="footnote">
          Link microphone and media permissions to enter the room voice channel.
        </AppText>
      ) : null}
    </Surface>
  );
}

const styles = StyleSheet.create({
  card: {
    padding: 14,
    gap: 10
  },
  topRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    gap: 12
  },
  copy: {
    flex: 1,
    gap: 2
  },
  chips: {
    flexDirection: "row",
    gap: 8,
    flexWrap: "wrap",
    justifyContent: "flex-end"
  },
  metaRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    gap: 12
  },
  actions: {
    gap: 8
  }
});
