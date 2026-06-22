import { StyleSheet, View } from "react-native";

import { AppText } from "@/components/primitives/AppText";
import { Button } from "@/components/primitives/Button";
import { Chip } from "@/components/primitives/Chip";
import { Surface } from "@/components/primitives/Surface";
import { RideAlertState } from "@/types/domain";

interface ActiveAlertBannerProps {
  alert: RideAlertState;
  onResolve?: () => void;
}

export function ActiveAlertBanner({ alert, onResolve }: ActiveAlertBannerProps) {
  const serious = alert.kind === "sos";

  return (
    <Surface raised style={[styles.card, serious ? styles.serious : styles.warning]}>
      <View style={styles.header}>
        <Chip label={serious ? "SOS ACTIVE" : "EMERGENCY"} tone="danger" />
        <AppText variant="title3">{alert.triggeredByName}</AppText>
      </View>
      <AppText>{alert.detail}</AppText>
      <AppText tone="secondary" variant="footnote">
        Triggered {new Date(alert.createdAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
      </AppText>
      {onResolve ? <Button label="Resolve alert" onPress={onResolve} variant="danger" /> : null}
    </Surface>
  );
}

const styles = StyleSheet.create({
  card: {
    padding: 14,
    gap: 8
  },
  serious: {
    borderWidth: 1.5
  },
  warning: {
    borderWidth: 1
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    gap: 12
  }
});
