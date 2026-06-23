import { PropsWithChildren, ReactNode } from "react";
import { StyleSheet, View } from "react-native";

import { AppText } from "@/components/primitives/AppText";
import { Surface } from "@/components/primitives/Surface";
import { useTheme } from "@/design/ThemeProvider";

interface WebScaffoldProps extends PropsWithChildren {
  eyebrow?: string;
  title: string;
  subtitle: string;
  right?: ReactNode;
  maxWidth?: number;
}

export function WebScaffold({
  eyebrow,
  title,
  subtitle,
  right,
  children,
  maxWidth = 1240
}: WebScaffoldProps) {
  const theme = useTheme();

  return (
    <View style={[styles.page, { backgroundColor: theme.colors.background }]}>
      <View style={styles.ambientLayer} pointerEvents="none">
        <View style={[styles.ambientPrimary, { borderColor: theme.colors.lineSubtle }]} />
        <View style={[styles.ambientSecondary, { borderColor: theme.colors.focusRing }]} />
      </View>

      <View style={[styles.shell, { maxWidth }]}>
        <Surface raised style={styles.headerCard}>
          <View style={styles.headerRow}>
            <View style={styles.copy}>
              {eyebrow ? (
                <AppText tone="accent" variant="label">
                  {eyebrow}
                </AppText>
              ) : null}
              <AppText variant="title1">{title}</AppText>
              <AppText tone="secondary" variant="callout">
                {subtitle}
              </AppText>
            </View>
            {right ? <View style={styles.right}>{right}</View> : null}
          </View>
        </Surface>
        {children}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  page: {
    flex: 1
  },
  ambientLayer: {
    ...StyleSheet.absoluteFillObject
  },
  ambientPrimary: {
    position: "absolute",
    width: 520,
    height: 520,
    borderRadius: 999,
    borderWidth: 28,
    opacity: 0.09,
    top: -180,
    right: -80
  },
  ambientSecondary: {
    position: "absolute",
    width: 320,
    height: 320,
    borderRadius: 999,
    borderWidth: 1.5,
    opacity: 0.4,
    bottom: 64,
    left: -90
  },
  shell: {
    width: "100%",
    alignSelf: "center",
    paddingHorizontal: 28,
    paddingTop: 28,
    paddingBottom: 40,
    gap: 18
  },
  headerCard: {
    paddingHorizontal: 22,
    paddingVertical: 18,
    borderRadius: 30
  },
  headerRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    gap: 18
  },
  copy: {
    flex: 1,
    gap: 6
  },
  right: {
    flexDirection: "row",
    gap: 10
  }
});
