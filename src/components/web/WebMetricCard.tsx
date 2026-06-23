import { StyleSheet } from "react-native";

import { AppText } from "@/components/primitives/AppText";
import { Surface } from "@/components/primitives/Surface";

interface WebMetricCardProps {
  label: string;
  value: string;
  detail: string;
}

export function WebMetricCard({ label, value, detail }: WebMetricCardProps) {
  return (
    <Surface raised style={styles.card}>
      <AppText tone="secondary" variant="footnote">
        {label}
      </AppText>
      <AppText variant="title2">{value}</AppText>
      <AppText tone="tertiary" variant="footnote">
        {detail}
      </AppText>
    </Surface>
  );
}

const styles = StyleSheet.create({
  card: {
    flex: 1,
    minWidth: 180,
    padding: 16,
    borderRadius: 24,
    gap: 4
  }
});
