import { StyleSheet, View } from "react-native";

import { AppText } from "@/components/primitives/AppText";
import { Button } from "@/components/primitives/Button";
import { Chip } from "@/components/primitives/Chip";
import { Surface } from "@/components/primitives/Surface";
import { SafetySnapshot } from "@/types/domain";

interface SafetyOverviewCardProps {
  safety: SafetySnapshot;
  onOpenMedicalCard?: () => void;
}

export function SafetyOverviewCard({ safety, onOpenMedicalCard }: SafetyOverviewCardProps) {
  const activeHazards = safety.hazards.filter((hazard) => hazard.status !== "dismissed");

  return (
    <Surface raised style={styles.card}>
      <View style={styles.header}>
        <View style={styles.copy}>
          <AppText variant="footnote" tone="secondary">
            Safety layer v1
          </AppText>
          <AppText variant="title3">Conservative signals, never silent assumptions</AppText>
        </View>
        {onOpenMedicalCard ? <Button label="Medical card" onPress={onOpenMedicalCard} variant="ghost" /> : null}
      </View>

      <View style={styles.chips}>
        <Chip
          icon="account-alert-outline"
          label={safety.stragglers.length > 0 ? `${safety.stragglers.length} straggler checks` : "Formation steady"}
          tone={safety.stragglers.some((alert) => alert.severity === "assist") ? "warning" : "success"}
        />
        <Chip
          icon="alert-outline"
          label={activeHazards.length > 0 ? `${activeHazards.length} hazard reports` : "No active hazards"}
          tone={activeHazards.some((hazard) => hazard.status === "confirmed") ? "warning" : "neutral"}
        />
        <Chip
          icon="gas-station-outline"
          label={safety.fuelAlerts.length > 0 ? `${safety.fuelAlerts.length} low-range riders` : "Fuel margin healthy"}
          tone={safety.fuelAlerts.some((alert) => alert.level === "critical") ? "danger" : safety.fuelAlerts.length > 0 ? "warning" : "success"}
        />
        <Chip
          icon="speedometer-slow"
          label={safety.crashDetection.enabled ? "Experimental monitor on" : "Experimental monitor off"}
          tone={safety.crashDetection.enabled ? "warning" : "neutral"}
        />
      </View>
    </Surface>
  );
}

const styles = StyleSheet.create({
  card: {
    padding: 16,
    gap: 12
  },
  header: {
    flexDirection: "row",
    gap: 12,
    justifyContent: "space-between",
    alignItems: "flex-start"
  },
  copy: {
    flex: 1,
    gap: 2
  },
  chips: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8
  }
});
