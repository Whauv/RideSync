import { StyleSheet, View } from "react-native";
import { MaterialCommunityIcons } from "@expo/vector-icons";

import { AppText } from "@/components/primitives/AppText";
import { useTheme } from "@/design/ThemeProvider";

interface ChipProps {
  label: string;
  tone?: "neutral" | "accent" | "success" | "warning" | "danger";
  icon?: keyof typeof MaterialCommunityIcons.glyphMap;
}

export function Chip({ label, tone = "neutral", icon }: ChipProps) {
  const theme = useTheme();
  const state =
    tone === "accent"
      ? { fill: theme.colors.accentMuted, text: theme.colors.accent, border: theme.colors.focusRing }
      : tone === "success"
        ? theme.state.success
        : tone === "warning"
          ? theme.state.warning
          : tone === "danger"
            ? theme.state.danger
            : theme.state.neutral;

  return (
    <View style={[styles.chip, { backgroundColor: state.fill, borderColor: state.border }]}>
      {icon ? <MaterialCommunityIcons color={state.text} name={icon} size={14} /> : null}
      <AppText variant="footnote" style={{ color: state.text }}>
        {label}
      </AppText>
    </View>
  );
}

const styles = StyleSheet.create({
  chip: {
    minHeight: 32,
    borderRadius: 999,
    borderWidth: 1,
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 10,
    gap: 6,
    alignSelf: "flex-start"
  }
});
