import { ReactNode } from "react";
import { ActivityIndicator, Pressable, StyleSheet, View } from "react-native";
import { MaterialCommunityIcons } from "@expo/vector-icons";

import { AppText } from "@/components/primitives/AppText";
import { useTheme } from "@/design/ThemeProvider";

interface ButtonProps {
  label: string;
  onPress?: () => void;
  disabled?: boolean;
  loading?: boolean;
  variant?: "primary" | "secondary" | "ghost" | "danger";
  icon?: keyof typeof MaterialCommunityIcons.glyphMap;
  trailing?: ReactNode;
}

export function Button({
  label,
  onPress,
  disabled,
  loading,
  variant = "primary",
  icon,
  trailing
}: ButtonProps) {
  const theme = useTheme();
  const palette =
    variant === "secondary"
      ? {
          bg: theme.colors.surfaceMuted,
          border: theme.colors.lineSubtle,
          text: theme.colors.textPrimary
        }
      : variant === "ghost"
        ? {
            bg: "transparent",
            border: theme.colors.lineSubtle,
            text: theme.colors.textPrimary
          }
        : variant === "danger"
          ? {
              bg: theme.colors.danger,
              border: theme.colors.danger,
              text: theme.colors.textInverse
            }
          : {
              bg: theme.colors.accent,
              border: theme.colors.accent,
              text: theme.colors.textInverse
            };

  return (
    <Pressable
      disabled={disabled || loading}
      onPress={onPress}
      style={({ pressed }) => [
        styles.button,
        {
          backgroundColor: pressed && variant === "primary" ? theme.colors.accentPressed : palette.bg,
          borderColor: palette.border,
          opacity: disabled ? 0.45 : 1,
          transform: [{ scale: pressed ? 0.985 : 1 }]
        }
      ]}
    >
      <View style={styles.content}>
        {loading ? (
          <ActivityIndicator color={palette.text} />
        ) : (
          <>
            {icon ? <MaterialCommunityIcons color={palette.text} name={icon} size={18} /> : null}
            <AppText variant="bodyStrong" style={{ color: palette.text }}>
              {label}
            </AppText>
            {trailing}
          </>
        )}
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  button: {
    minHeight: 54,
    borderRadius: 20,
    borderWidth: 1,
    justifyContent: "center",
    paddingHorizontal: 16
  },
  content: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 10
  }
});
