import { StyleSheet, View } from "react-native";
import { MaterialCommunityIcons } from "@expo/vector-icons";

import { AppText } from "@/components/primitives/AppText";
import { Avatar } from "@/components/primitives/Avatar";
import { Button } from "@/components/primitives/Button";
import { Chip } from "@/components/primitives/Chip";
import { Surface } from "@/components/primitives/Surface";
import { useTheme } from "@/design/ThemeProvider";
import { RoomMember } from "@/types/domain";
import { VoiceParticipantState } from "@/types/voice";

interface LobbyMemberRowProps {
  member: RoomMember;
  isLeaderView: boolean;
  isCurrentUser: boolean;
  voiceParticipant?: VoiceParticipantState;
  onApprove?: () => void;
  onRemove?: () => void;
  onToggleReady?: () => void;
  onToggleIntercom?: () => void;
}

export function LobbyMemberRow({
  member,
  isLeaderView,
  isCurrentUser,
  voiceParticipant,
  onApprove,
  onRemove,
  onToggleReady,
  onToggleIntercom
}: LobbyMemberRowProps) {
  const theme = useTheme();
  const readinessTone = member.readiness === "ready" ? "success" : "neutral";
  const presenceTone =
    member.presenceState === "connected" ? "success" : member.presenceState === "reconnecting" ? "warning" : "danger";
  const voiceTone =
    voiceParticipant?.networkQuality === "poor"
      ? "warning"
      : voiceParticipant?.isSpeaking
        ? "accent"
        : voiceParticipant?.isMuted
          ? "neutral"
          : "success";

  return (
    <Surface muted style={styles.card}>
      <View style={styles.topRow}>
        <View style={styles.identity}>
          <Avatar accent={member.role === "leader"} name={member.riderName} size={44} />
          <View style={styles.copy}>
            <View style={styles.titleRow}>
              <AppText variant="bodyStrong">{member.riderName}</AppText>
              {member.role === "leader" ? <Chip label="Leader" tone="accent" /> : null}
              {member.approvalStatus === "pending" ? <Chip label="Pending" tone="warning" /> : null}
            </View>
            <AppText tone="secondary" variant="callout">
              {member.bikeName}
            </AppText>
          </View>
        </View>
        <View style={styles.meta}>
          <Chip label={member.presenceState} tone={presenceTone} />
          <Chip label={member.readiness === "ready" ? "Ready" : "Review"} tone={readinessTone} />
        </View>
      </View>

      <View style={styles.statusRow}>
        <View style={styles.voiceStatus}>
          <MaterialCommunityIcons
            color={
              voiceParticipant?.isSpeaking
                ? theme.colors.accent
                : voiceParticipant?.networkQuality === "poor"
                  ? theme.colors.warning
                  : theme.colors.textTertiary
            }
            name={voiceParticipant?.isSpeaking ? "microphone" : voiceParticipant?.isMuted ? "microphone-off" : "waveform"}
            size={16}
          />
          <AppText tone="secondary" variant="footnote">
            {member.intercomState === "connected"
              ? voiceParticipant?.isSpeaking
                ? "Speaking now"
                : voiceParticipant?.networkQuality === "poor"
                  ? "Voice network weak"
                  : "Voice linked"
              : "Intercom not connected"}
          </AppText>
        </View>
        <AppText tone="secondary" variant="footnote">
          Last seen {new Date(member.lastSeenAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
        </AppText>
      </View>

      {voiceParticipant ? (
        <View style={styles.voiceChips}>
          <Chip label={voiceParticipant.isSpeaking ? "Speaking" : voiceParticipant.isMuted ? "Muted" : "Listening"} tone={voiceTone} />
          <Chip label={voiceParticipant.networkQuality} tone={voiceParticipant.networkQuality === "poor" ? "warning" : "neutral"} />
        </View>
      ) : null}

      <View style={styles.actions}>
        {isLeaderView && member.approvalStatus === "pending" ? (
          <Button label="Approve rider" onPress={onApprove} variant="secondary" />
        ) : null}
        {isCurrentUser ? (
          <>
            <Button
              label={member.readiness === "ready" ? "Mark reviewing" : "Mark ready"}
              onPress={onToggleReady}
              variant="ghost"
            />
            <Button
              label={member.intercomState === "connected" ? "Intercom linked" : "Link intercom"}
              onPress={onToggleIntercom}
              variant="secondary"
            />
          </>
        ) : null}
        {isLeaderView && member.role !== "leader" ? <Button label="Remove" onPress={onRemove} variant="ghost" /> : null}
      </View>
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
  identity: {
    flexDirection: "row",
    gap: 12,
    flex: 1
  },
  copy: {
    flex: 1,
    gap: 4
  },
  titleRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    flexWrap: "wrap"
  },
  meta: {
    alignItems: "flex-end",
    gap: 6
  },
  statusRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    gap: 12
  },
  voiceStatus: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6
  },
  voiceChips: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8
  },
  actions: {
    gap: 8
  }
});
