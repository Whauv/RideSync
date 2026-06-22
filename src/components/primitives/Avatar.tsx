import { StyleSheet, View } from "react-native";

import { AppText } from "@/components/primitives/AppText";
import { useTheme } from "@/design/ThemeProvider";

interface AvatarProps {
  name: string;
  size?: number;
  accent?: boolean;
}

export function Avatar({ name, size = 42, accent = false }: AvatarProps) {
  const theme = useTheme();
  const initials = name
    .split(" ")
    .map((part) => part[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

  return (
    <View
      style={[
        styles.avatar,
        {
          width: size,
          height: size,
          borderRadius: size / 2,
          backgroundColor: accent ? theme.colors.accentMuted : theme.colors.surfaceMuted,
          borderColor: accent ? theme.colors.focusRing : theme.colors.lineSubtle
        }
      ]}
    >
      <AppText variant="footnote" tone={accent ? "accent" : "primary"}>
        {initials}
      </AppText>
    </View>
  );
}

const styles = StyleSheet.create({
  avatar: {
    borderWidth: 1,
    alignItems: "center",
    justifyContent: "center"
  }
});
