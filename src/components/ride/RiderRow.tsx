import { StyleSheet, View } from "react-native";
import { MaterialCommunityIcons } from "@expo/vector-icons";

import { AppText } from "@/components/core/AppText";
import { useTheme } from "@/design/ThemeProvider";
import { RiderPresence } from "@/types/domain";

interface RiderRowProps {
  rider: RiderPresence;
}

export function RiderRow({ rider }: RiderRowProps) {
  const theme = useTheme();

  return (
    <View style={[styles.row, { borderBottomColor: theme.colors.line }]}>
      <View style={styles.identity}>
        <View
          style={[
            styles.badge,
            { backgroundColor: rider.role === "leader" ? theme.colors.accentSoft : theme.colors.surfaceMuted }
          ]}
        >
          <MaterialCommunityIcons
            name={rider.isTalking ? "microphone" : "motorbike"}
            size={15}
            color={rider.isTalking ? theme.colors.accent : theme.colors.textMuted}
          />
        </View>
        <View>
          <AppText style={styles.name}>{rider.name}</AppText>
          <AppText variant="caption" tone="soft">
            {rider.bike}
          </AppText>
        </View>
      </View>
      <View style={styles.meta}>
        <AppText style={styles.metric}>{rider.speedMph}</AppText>
        <AppText variant="caption" tone="soft">
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
    justifyContent: "space-between",
    paddingVertical: 12,
    borderBottomWidth: StyleSheet.hairlineWidth
  },
  identity: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12
  },
  badge: {
    width: 36,
    height: 36,
    borderRadius: 14,
    alignItems: "center",
    justifyContent: "center"
  },
  name: {
    fontWeight: "600"
  },
  meta: {
    alignItems: "flex-end"
  },
  metric: {
    fontSize: 18,
    fontWeight: "700"
  }
});
