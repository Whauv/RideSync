import { StyleSheet } from "react-native";

import { AppHeader } from "@/components/primitives/AppHeader";
import { EmptyState } from "@/components/primitives/EmptyState";
import { Screen } from "@/components/primitives/Screen";
import { Surface } from "@/components/primitives/Surface";
import { RiderRow } from "@/components/ride/RiderRow";
import { useAppStore } from "@/store/useAppStore";

export default function SquadScreen() {
  const activeRoom = useAppStore((state) => state.activeRoom);
  const riders = useAppStore((state) => state.riders);

  if (!activeRoom) {
    return (
      <Screen>
        <AppHeader
          eyebrow="SQUAD"
          subtitle="Presence and ride health appear here once a room is active."
          title="Roster"
        />
        <EmptyState body="Enter a room first to see the live rider roster." icon="account-group-outline" title="No roster yet" />
      </Screen>
    );
  }

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
