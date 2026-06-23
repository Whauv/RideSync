import { PropsWithChildren } from "react";
import { LinearGradient } from "expo-linear-gradient";
import { StyleSheet, View } from "react-native";

import { AppText } from "@/components/primitives/AppText";
import { Surface } from "@/components/primitives/Surface";
import { useTheme } from "@/design/ThemeProvider";

interface EcosystemFrameProps extends PropsWithChildren {
  eyebrow: string;
  title: string;
  subtitle: string;
}

export function EcosystemFrame({ eyebrow, title, subtitle, children }: EcosystemFrameProps) {
  const theme = useTheme();

  return (
    <View style={styles.frame}>
      <LinearGradient
        colors={[
          theme.mode === "dark" ? "rgba(255,255,255,0.02)" : "rgba(255,255,255,0.74)",
          theme.mode === "dark" ? "rgba(78,195,181,0.06)" : "rgba(15,125,116,0.08)"
        ]}
        end={{ x: 1, y: 1 }}
        start={{ x: 0, y: 0 }}
        style={[styles.heroBand, { borderColor: theme.colors.lineSubtle }]}
      >
        <View style={styles.heroCopy}>
          <AppText tone="accent" variant="label">
            {eyebrow}
          </AppText>
          <AppText variant="title1">{title}</AppText>
          <AppText tone="secondary" variant="callout">
            {subtitle}
          </AppText>
        </View>
      </LinearGradient>
      <Surface raised style={[styles.body, { backgroundColor: theme.colors.surfaceRaised }]}>
        {children}
      </Surface>
    </View>
  );
}

const styles = StyleSheet.create({
  frame: {
    gap: 12
  },
  heroBand: {
    borderWidth: 1,
    borderRadius: 28,
    paddingHorizontal: 18,
    paddingVertical: 18
  },
  heroCopy: {
    gap: 8
  },
  body: {
    borderRadius: 28,
    padding: 18,
    gap: 18
  }
});
