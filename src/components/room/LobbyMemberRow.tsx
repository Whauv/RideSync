import { StyleSheet, View } from "react-native";

import { AppText } from "@/components/primitives/AppText";
import { Avatar } from "@/components/primitives/Avatar";
import { Button } from "@/components/primitives/Button";
import { Chip } from "@/components/primitives/Chip";
import { Surface } from "@/components/primitives/Surface";
import { RoomMember } from "@/types/domain";

interface LobbyMemberRowProps {
  member: RoomMember;
  isLeaderView: boolean;
  isCurrentUser: boolean;
  onApprove?: () => void;
  onRemove?: () => void;
  onToggleReady?: () => void;
  onToggleIntercom?: () => void;
}

export function LobbyMemberRow({
  member,
  isLeaderView,
  isCurrentUser,
  onApprove,
  onRemove,
  onToggleReady,
  onToggleIntercom
}: LobbyMemberRowProps) {
  const readinessTone = member.readiness === "ready" ? "success" : "neutral";
  const presenceTone =
    member.presenceState === "connected" ? "success" : member.presenceState === "reconnecting" ? "warning" : "danger";

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
        <AppText tone="secondary" variant="footnote">
          Intercom {member.intercomState === "connected" ? "connected" : "not connected"}
        </AppText>
        <AppText tone="secondary" variant="footnote">
          Last seen {new Date(member.lastSeenAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
        </AppText>
      </View>

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
  actions: {
    gap: 8
  }
});
