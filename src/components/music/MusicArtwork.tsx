import { StyleSheet, View } from "react-native";

import { AppText } from "@/components/primitives/AppText";
import { useTheme } from "@/design/ThemeProvider";

interface MusicArtworkProps {
  token: string;
  size?: number;
}

function tokenPalette(token: string) {
  if (token === "red-canyon") {
    return { top: "#8F4E33", bottom: "#D4A06D", accent: "#F7E5CE" };
  }

  if (token === "dawn-engine") {
    return { top: "#184244", bottom: "#4EC3B5", accent: "#DDF7E9" };
  }

  return { top: "#2A2F38", bottom: "#5C6A7A", accent: "#E6EBF0" };
}

export function MusicArtwork({ token, size = 68 }: MusicArtworkProps) {
  const theme = useTheme();
  const palette = tokenPalette(token);

  return (
    <View
      style={[
        styles.card,
        {
          width: size,
          height: size,
          borderColor: theme.colors.lineSubtle,
          backgroundColor: palette.top
        }
      ]}
    >
      <View style={[styles.band, { backgroundColor: palette.bottom }]} />
      <View style={[styles.dot, { backgroundColor: palette.accent }]} />
      <AppText style={styles.caption} tone="inverse" variant="footnote">
        RS
      </AppText>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: 18,
    borderWidth: 1,
    overflow: "hidden",
    position: "relative",
    justifyContent: "flex-end",
    padding: 8
  },
  band: {
    position: "absolute",
    left: 0,
    right: 0,
    bottom: 0,
    height: "48%"
  },
  dot: {
    position: "absolute",
    right: 10,
    top: 10,
    width: 12,
    height: 12,
    borderRadius: 6
  },
  caption: {
    letterSpacing: 0.6
  }
});
