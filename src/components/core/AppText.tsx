import { PropsWithChildren } from "react";
import { StyleProp, StyleSheet, Text, TextStyle } from "react-native";

import { useTheme } from "@/design/ThemeProvider";

interface AppTextProps extends PropsWithChildren {
  variant?: "caption" | "body" | "bodyLg" | "title" | "titleLg" | "metric";
  tone?: "default" | "muted" | "soft" | "accent";
  style?: StyleProp<TextStyle>;
}

export function AppText({ children, variant = "body", tone = "default", style }: AppTextProps) {
  const theme = useTheme();

  return (
    <Text
      style={[
        styles.base,
        styles[variant],
        {
          color:
            tone === "accent"
              ? theme.colors.accent
              : tone === "muted"
                ? theme.colors.textMuted
                : tone === "soft"
                  ? theme.colors.textSoft
                  : theme.colors.text
        },
        style
      ]}
    >
      {children}
    </Text>
  );
}

const styles = StyleSheet.create({
  base: {
    letterSpacing: 0.1
  },
  caption: {
    fontSize: 12,
    lineHeight: 16
  },
  body: {
    fontSize: 14,
    lineHeight: 20
  },
  bodyLg: {
    fontSize: 16,
    lineHeight: 22
  },
  title: {
    fontSize: 20,
    lineHeight: 24,
    fontWeight: "600"
  },
  titleLg: {
    fontSize: 28,
    lineHeight: 32,
    fontWeight: "700",
    letterSpacing: -0.4
  },
  metric: {
    fontSize: 32,
    lineHeight: 34,
    fontWeight: "700",
    letterSpacing: -1
  }
});
