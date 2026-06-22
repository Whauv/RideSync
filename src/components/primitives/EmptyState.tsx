import { StyleSheet, View } from "react-native";
import { MaterialCommunityIcons } from "@expo/vector-icons";

import { AppText } from "@/components/primitives/AppText";
import { Button } from "@/components/primitives/Button";
import { Surface } from "@/components/primitives/Surface";
import { useTheme } from "@/design/ThemeProvider";

interface EmptyStateProps {
  icon: keyof typeof MaterialCommunityIcons.glyphMap;
  title: string;
  body: string;
  actionLabel?: string;
  onAction?: () => void;
}

export function EmptyState({ icon, title, body, actionLabel, onAction }: EmptyStateProps) {
  const theme = useTheme();

  return (
    <Surface muted style={styles.card}>
      <View style={[styles.iconWrap, { backgroundColor: theme.colors.accentMuted }]}>
        <MaterialCommunityIcons color={theme.colors.accent} name={icon} size={24} />
      </View>
      <View style={styles.copy}>
        <AppText variant="title2">{title}</AppText>
        <AppText tone="secondary">{body}</AppText>
      </View>
      {actionLabel ? <Button label={actionLabel} onPress={onAction} variant="secondary" /> : null}
    </Surface>
  );
}

const styles = StyleSheet.create({
  card: {
    padding: 18,
    alignItems: "flex-start",
    gap: 14
  },
  iconWrap: {
    width: 50,
    height: 50,
    borderRadius: 18,
    alignItems: "center",
    justifyContent: "center"
  },
  copy: {
    gap: 6
  }
});
