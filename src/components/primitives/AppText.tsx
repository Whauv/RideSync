import { PropsWithChildren } from "react";
import { StyleProp, StyleSheet, Text, TextStyle } from "react-native";

import { useTheme } from "@/design/ThemeProvider";

export type TextVariant =
  | "display"
  | "title1"
  | "title2"
  | "title3"
  | "body"
  | "bodyStrong"
  | "callout"
  | "footnote"
  | "label"
  | "metric";

interface AppTextProps extends PropsWithChildren {
  variant?: TextVariant;
  tone?: "primary" | "secondary" | "tertiary" | "inverse" | "accent" | "success" | "warning" | "danger";
  style?: StyleProp<TextStyle>;
  numberOfLines?: number;
}

export function AppText({
  children,
  variant = "body",
  tone = "primary",
  style,
  numberOfLines
}: AppTextProps) {
  const theme = useTheme();
  const toneColor =
    tone === "secondary"
      ? theme.colors.textSecondary
      : tone === "tertiary"
        ? theme.colors.textTertiary
        : tone === "inverse"
          ? theme.colors.textInverse
          : tone === "accent"
            ? theme.colors.accent
            : tone === "success"
              ? theme.colors.success
              : tone === "warning"
                ? theme.colors.warning
                : tone === "danger"
                  ? theme.colors.danger
                  : theme.colors.textPrimary;

  return (
    <Text numberOfLines={numberOfLines} style={[styles.base, theme.tokens.type[variant], { color: toneColor }, style]}>
      {children}
    </Text>
  );
}

const styles = StyleSheet.create({
  base: {
    fontFamily: "System",
    includeFontPadding: false
  }
});
