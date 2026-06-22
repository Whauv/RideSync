import { StyleSheet, View } from "react-native";

import { AppText } from "@/components/core/AppText";
import { useTheme } from "@/design/ThemeProvider";

interface StateBannerProps {
  title: string;
  body: string;
  tone?: "warning" | "danger" | "info";
}

export function StateBanner({ title, body, tone = "info" }: StateBannerProps) {
  const theme = useTheme();
  const bg =
    tone === "danger" ? "rgba(162, 49, 49, 0.14)" : tone === "warning" ? "rgba(168, 107, 30, 0.12)" : theme.colors.accentSoft;
  const color = tone === "danger" ? theme.colors.danger : tone === "warning" ? theme.colors.warning : theme.colors.accent;

  return (
    <View style={[styles.container, { backgroundColor: bg, borderColor: color }]}>
      <AppText style={{ color, fontWeight: "700" }}>{title}</AppText>
      <AppText tone="muted">{body}</AppText>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    borderRadius: 18,
    borderWidth: 1,
    padding: 14,
    gap: 6
  }
});
