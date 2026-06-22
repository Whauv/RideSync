import { Animated, StyleSheet } from "react-native";
import { useEffect, useState } from "react";

import { useTheme } from "@/design/ThemeProvider";

interface SkeletonLoaderProps {
  height?: number;
  width?: number | `${number}%`;
  radius?: number;
}

export function SkeletonLoader({ height = 18, width = "100%", radius = 10 }: SkeletonLoaderProps) {
  const theme = useTheme();
  const [opacity] = useState(() => new Animated.Value(0.45));

  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(opacity, { toValue: 0.72, duration: theme.tokens.motion.standard, useNativeDriver: true }),
        Animated.timing(opacity, { toValue: 0.4, duration: theme.tokens.motion.standard, useNativeDriver: true })
      ])
    ).start();
  }, [opacity, theme.tokens.motion.standard]);

  return (
    <Animated.View
      style={[
        styles.bar,
        {
          width,
          height,
          borderRadius: radius,
          backgroundColor: theme.colors.surfaceMuted,
          opacity
        }
      ]}
    />
  );
}

const styles = StyleSheet.create({
  bar: {
    overflow: "hidden"
  }
});
