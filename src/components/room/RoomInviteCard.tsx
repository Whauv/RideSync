import { StyleSheet, View } from "react-native";
import { MaterialCommunityIcons } from "@expo/vector-icons";

import { AppText } from "@/components/primitives/AppText";
import { Button } from "@/components/primitives/Button";
import { Chip } from "@/components/primitives/Chip";
import { Surface } from "@/components/primitives/Surface";
import { useTheme } from "@/design/ThemeProvider";
import { RideRoom } from "@/types/domain";

interface RoomInviteCardProps {
  room: RideRoom;
  onShare: () => void;
}

function buildQrPattern(seed: string) {
  const chars = seed.split("");
  return Array.from({ length: 11 }, (_, row) =>
    Array.from({ length: 11 }, (_, column) => {
      const charCode = chars[(row + column) % chars.length]?.charCodeAt(0) ?? 0;
      return (charCode + row * 7 + column * 11) % 2 === 0;
    })
  );
}

export function RoomInviteCard({ room, onShare }: RoomInviteCardProps) {
  const theme = useTheme();
  const qr = buildQrPattern(room.code);

  return (
    <Surface raised style={styles.card}>
      <View style={styles.header}>
        <View>
          <AppText variant="footnote" tone="secondary">
            Join code
          </AppText>
          <AppText variant="title1">{room.code}</AppText>
        </View>
        <Chip label={room.privacyMode === "approval_required" ? "Approval" : "Invite only"} tone="accent" />
      </View>

      <View style={styles.content}>
        <View style={[styles.qrFrame, { backgroundColor: theme.colors.surfaceRaised, borderColor: theme.colors.lineSubtle }]}>
          {qr.map((row, rowIndex) => (
            <View key={`row-${rowIndex}`} style={styles.qrRow}>
              {row.map((filled, columnIndex) => (
                <View
                  key={`cell-${rowIndex}-${columnIndex}`}
                  style={[
                    styles.qrCell,
                    {
                      backgroundColor: filled ? theme.colors.textPrimary : "transparent"
                    }
                  ]}
                />
              ))}
            </View>
          ))}
        </View>

        <View style={styles.copy}>
          <AppText variant="title3">Invite riders by link or QR card</AppText>
          <AppText tone="secondary">
            Share the deep link, display this QR invite card, or have riders enter the room code directly.
          </AppText>
          <View style={styles.linkRow}>
            <MaterialCommunityIcons color={theme.colors.textTertiary} name="link-variant" size={16} />
            <AppText numberOfLines={1} tone="secondary" variant="footnote">
              {room.inviteLink}
            </AppText>
          </View>
          <Button label="Share invite" onPress={onShare} variant="secondary" />
        </View>
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
    alignItems: "flex-start",
    gap: 12
  },
  content: {
    flexDirection: "row",
    gap: 16
  },
  qrFrame: {
    width: 134,
    height: 134,
    borderRadius: 22,
    borderWidth: 1,
    padding: 12,
    justifyContent: "space-between"
  },
  qrRow: {
    flexDirection: "row",
    justifyContent: "space-between"
  },
  qrCell: {
    width: 8,
    height: 8,
    borderRadius: 2
  },
  copy: {
    flex: 1,
    gap: 8
  },
  linkRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8
  }
});
