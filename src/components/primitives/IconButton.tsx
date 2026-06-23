import { Pressable, StyleSheet } from "react-native";
import { MaterialCommunityIcons } from "@expo/vector-icons";

import { useTheme } from "@/design/ThemeProvider";

interface IconButtonProps {
  icon: keyof typeof MaterialCommunityIcons.glyphMap;
  onPress?: () => void;
  tone?: "default" | "accent" | "danger";
}

export function IconButton({ icon, onPress, tone = "default" }: IconButtonProps) {
  const theme = useTheme();
  const backgroundColor =
    tone === "accent" ? theme.colors.accentMuted : tone === "danger" ? theme.state.danger.fill : theme.colors.surfaceOverlay;
  const color = tone === "accent" ? theme.colors.accent : tone === "danger" ? theme.colors.danger : theme.colors.textPrimary;

  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [
        styles.button,
        {
          backgroundColor,
          borderColor: theme.colors.lineSubtle,
          opacity: pressed ? 0.86 : 1,
          transform: [{ scale: pressed ? 0.96 : 1 }]
        }
      ]}
    >
      <MaterialCommunityIcons color={color} name={icon} size={20} />
    </Pressable>
  );
}

const styles = StyleSheet.create({
  button: {
    width: 48,
    height: 48,
    borderRadius: 20,
    borderWidth: 1,
    alignItems: "center",
    justifyContent: "center"
  }
});
