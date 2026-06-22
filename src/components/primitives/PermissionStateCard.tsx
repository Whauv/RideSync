import { StyleSheet, View } from "react-native";
import { MaterialCommunityIcons } from "@expo/vector-icons";

import { AppText } from "@/components/primitives/AppText";
import { Button } from "@/components/primitives/Button";
import { Surface } from "@/components/primitives/Surface";
import { useTheme } from "@/design/ThemeProvider";

interface PermissionStateCardProps {
  icon: keyof typeof MaterialCommunityIcons.glyphMap;
  title: string;
  body: string;
  actionLabel: string;
  onAction?: () => void;
}

export function PermissionStateCard({ icon, title, body, actionLabel, onAction }: PermissionStateCardProps) {
  const theme = useTheme();

  return (
    <Surface style={styles.card} raised>
      <View style={styles.topRow}>
        <View style={[styles.badge, { backgroundColor: theme.colors.infoMuted }]}>
          <MaterialCommunityIcons color={theme.colors.info} name={icon} size={20} />
        </View>
        <AppText variant="label" tone="accent">
          REQUIRED FOR LIVE RIDE
        </AppText>
      </View>
      <View style={styles.copy}>
        <AppText variant="title2">{title}</AppText>
        <AppText tone="secondary">{body}</AppText>
      </View>
      <Button label={actionLabel} onPress={onAction} />
    </Surface>
  );
}

const styles = StyleSheet.create({
  card: {
    padding: 18,
    gap: 14
  },
  topRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10
  },
  badge: {
    width: 42,
    height: 42,
    borderRadius: 16,
    alignItems: "center",
    justifyContent: "center"
  },
  copy: {
    gap: 6
  }
});
