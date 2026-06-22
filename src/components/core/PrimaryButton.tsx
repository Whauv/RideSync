import { Pressable, StyleSheet, View } from "react-native";

import { AppText } from "@/components/core/AppText";
import { useTheme } from "@/design/ThemeProvider";

interface PrimaryButtonProps {
  label: string;
  onPress?: () => void;
  kind?: "primary" | "secondary" | "danger";
}

export function PrimaryButton({ label, onPress, kind = "primary" }: PrimaryButtonProps) {
  const theme = useTheme();
  const backgroundColor =
    kind === "secondary" ? theme.colors.surfaceMuted : kind === "danger" ? theme.colors.danger : theme.colors.accent;
  const textColor = kind === "secondary" ? theme.colors.text : theme.colors.bg;

  return (
    <Pressable onPress={onPress} style={[styles.button, { backgroundColor }]}>
      <View style={styles.inner}>
        <AppText style={{ color: textColor, fontWeight: "600" }}>{label}</AppText>
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  button: {
    minHeight: 52,
    borderRadius: 18,
    justifyContent: "center"
  },
  inner: {
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 16,
    paddingVertical: 14
  }
});
