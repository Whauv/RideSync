import { ReactNode } from "react";
import { Pressable, StyleSheet, View } from "react-native";
import { MaterialCommunityIcons } from "@expo/vector-icons";

import { AppText } from "@/components/primitives/AppText";
import { useTheme } from "@/design/ThemeProvider";

interface ListRowProps {
  title: string;
  subtitle?: string;
  leading?: ReactNode;
  trailing?: ReactNode;
  onPress?: () => void;
  chevron?: boolean;
}

export function ListRow({ title, subtitle, leading, trailing, onPress, chevron = false }: ListRowProps) {
  const theme = useTheme();

  return (
    <Pressable onPress={onPress} style={[styles.row, { borderBottomColor: theme.colors.lineSubtle }]}>
      {leading ? <View>{leading}</View> : null}
      <View style={styles.copy}>
        <AppText variant="bodyStrong">{title}</AppText>
        {subtitle ? (
          <AppText variant="callout" tone="secondary">
            {subtitle}
          </AppText>
        ) : null}
      </View>
      {trailing}
      {chevron ? <MaterialCommunityIcons color={theme.colors.textTertiary} name="chevron-right" size={18} /> : null}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  row: {
    minHeight: 62,
    paddingVertical: 12,
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    borderBottomWidth: StyleSheet.hairlineWidth
  },
  copy: {
    flex: 1,
    gap: 2
  }
});
