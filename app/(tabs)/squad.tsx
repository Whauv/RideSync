import { StyleSheet, View } from "react-native";

import { AppText } from "@/components/core/AppText";
import { Screen } from "@/components/core/Screen";
import { Surface } from "@/components/core/Surface";
import { RiderRow } from "@/components/ride/RiderRow";
import { useAppStore } from "@/store/useAppStore";

export default function SquadScreen() {
  const riders = useAppStore((state) => state.riders);

  return (
    <Screen scroll>
      <View style={styles.header}>
        <AppText variant="title">Rider roster</AppText>
        <AppText tone="muted">Role-aware presence, voice status, and at-a-glance ride health.</AppText>
      </View>

      <Surface>
        {riders.map((rider) => (
          <RiderRow key={rider.id} rider={rider} />
        ))}
      </Surface>
    </Screen>
  );
}

const styles = StyleSheet.create({
  header: {
    gap: 6,
    marginVertical: 18
  }
});
