import { PropsWithChildren } from "react";
import { StyleProp, StyleSheet, View, ViewStyle } from "react-native";

import { useTheme } from "@/design/ThemeProvider";

interface SurfaceProps extends PropsWithChildren {
  style?: StyleProp<ViewStyle>;
  muted?: boolean;
}

export function Surface({ children, style, muted = false }: SurfaceProps) {
  const theme = useTheme();

  return (
    <View
      style={[
        styles.base,
        theme.shadow.card,
        {
          backgroundColor: muted ? theme.colors.surfaceMuted : theme.colors.surface,
          borderColor: theme.colors.line
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
    borderRadius: 24,
    padding: 16
  }
});
