import { PropsWithChildren } from "react";
import { StyleProp, StyleSheet, View, ViewStyle } from "react-native";

import { useTheme } from "@/design/ThemeProvider";

interface SurfaceProps extends PropsWithChildren {
  style?: StyleProp<ViewStyle>;
  muted?: boolean;
  raised?: boolean;
}

export function Surface({ children, style, muted = false, raised = false }: SurfaceProps) {
  const theme = useTheme();

  return (
    <View
      style={[
        styles.base,
        raised ? theme.elevation.medium : theme.elevation.none,
        {
          backgroundColor: raised
            ? theme.colors.surfaceRaised
            : muted
              ? theme.colors.surfaceMuted
              : theme.colors.surface,
          borderColor: theme.colors.lineSubtle
        },
        style
      ]}
    >
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  base: {
    borderWidth: 1,
    borderRadius: 24
  }
});
