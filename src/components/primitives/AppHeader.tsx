import { ReactNode } from "react";
import { StyleSheet, View } from "react-native";

import { AppText } from "@/components/primitives/AppText";
import { useTheme } from "@/design/ThemeProvider";

interface AppHeaderProps {
  eyebrow?: string;
  title: string;
  subtitle?: string;
  right?: ReactNode;
}

export function AppHeader({ eyebrow, title, subtitle, right }: AppHeaderProps) {
  const theme = useTheme();

  return (
    <View style={styles.row}>
      <View style={styles.copy}>
        {eyebrow ? (
          <AppText variant="label" tone="accent" style={styles.eyebrow}>
            {eyebrow}
          </AppText>
        ) : null}
        <AppText variant="title1">{title}</AppText>
        {subtitle ? (
          <AppText tone="secondary" style={{ maxWidth: right ? "84%" : "100%" }}>
            {subtitle}
          </AppText>
        ) : null}
      </View>
      {right ? <View style={[styles.right, { borderColor: theme.colors.lineSubtle }]}>{right}</View> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    gap: 12,
    marginBottom: 16,
    marginTop: 10
  },
  copy: {
    flex: 1,
    gap: 3
  },
  eyebrow: {
    marginBottom: 2
  },
  right: {
    borderRadius: 18
  }
});
