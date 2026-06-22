import { StyleSheet, View } from "react-native";
import { MaterialCommunityIcons } from "@expo/vector-icons";

import { AppText } from "@/components/primitives/AppText";
import { Avatar } from "@/components/primitives/Avatar";
import { Chip } from "@/components/primitives/Chip";
import { useTheme } from "@/design/ThemeProvider";
import { RiderPresence } from "@/types/domain";

interface RiderRowProps {
  rider: RiderPresence;
}

export function RiderRow({ rider }: RiderRowProps) {
  const theme = useTheme();

  return (
    <View style={[styles.row, { borderBottomColor: theme.colors.lineSubtle }]}>
      <Avatar accent={rider.role === "leader"} name={rider.name} />
      <View style={styles.copy}>
        <View style={styles.titleRow}>
          <AppText variant="bodyStrong">{rider.name}</AppText>
          <Chip
            label={rider.role === "leader" ? "Leader" : rider.status}
            tone={rider.role === "leader" ? "accent" : rider.status === "fuel" ? "warning" : "neutral"}
          />
        </View>
        <AppText variant="callout" tone="secondary">
          {rider.bike}
        </AppText>
      </View>
      <View style={styles.meta}>
        <View style={styles.speedRow}>
          {rider.isTalking ? <MaterialCommunityIcons color={theme.colors.accent} name="microphone" size={16} /> : null}
          <AppText variant="title3">{rider.speedMph}</AppText>
        </View>
        <AppText variant="footnote" tone="tertiary">
          mph
        </AppText>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    paddingVertical: 12,
    borderBottomWidth: StyleSheet.hairlineWidth
  },
  copy: {
    flex: 1,
    gap: 4
  },
  titleRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8
  },
  meta: {
    alignItems: "flex-end",
    gap: 2
  },
  speedRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6
  }
});
