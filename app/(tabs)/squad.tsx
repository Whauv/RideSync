import { StyleSheet } from "react-native";

import { AppHeader } from "@/components/primitives/AppHeader";
import { Screen } from "@/components/primitives/Screen";
import { Surface } from "@/components/primitives/Surface";
import { RiderRow } from "@/components/ride/RiderRow";
import { useAppStore } from "@/store/useAppStore";

export default function SquadScreen() {
  const riders = useAppStore((state) => state.riders);

  return (
    <Screen scroll>
      <AppHeader
        eyebrow="SQUAD"
        subtitle="Compact presence, role context, and ride health for every rider currently in the room."
        title="Roster"
      />
      <Surface style={styles.roster}>
        {riders.map((rider) => (
          <RiderRow key={rider.id} rider={rider} />
        ))}
      </Surface>
    </Screen>
  );
}

const styles = StyleSheet.create({
  roster: {
    paddingHorizontal: 16
  }
});
