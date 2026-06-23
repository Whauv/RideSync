import { StyleSheet, View } from "react-native";

import { AppText } from "@/components/primitives/AppText";
import { Surface } from "@/components/primitives/Surface";
import { useTheme } from "@/design/ThemeProvider";

interface MetricRailItem {
  label: string;
  value: string;
  detail?: string;
}

interface MetricRailProps {
  items: MetricRailItem[];
}

export function MetricRail({ items }: MetricRailProps) {
  const theme = useTheme();

  return (
    <View style={styles.rail}>
      {items.map((item) => (
        <Surface key={item.label} muted style={[styles.card, { backgroundColor: theme.colors.surfaceMuted }]}>
          <AppText tone="secondary" variant="footnote">
            {item.label}
          </AppText>
          <AppText variant="title2">{item.value}</AppText>
          {item.detail ? (
            <AppText tone="tertiary" variant="footnote">
              {item.detail}
            </AppText>
          ) : null}
        </Surface>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  rail: {
    gap: 10
  },
  card: {
    borderRadius: 22,
    padding: 14,
    gap: 4
  }
});
