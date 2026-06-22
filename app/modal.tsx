import { StyleSheet, View } from "react-native";
import { router } from "expo-router";

import { AppHeader } from "@/components/primitives/AppHeader";
import { AppText } from "@/components/primitives/AppText";
import { Button } from "@/components/primitives/Button";
import { Chip } from "@/components/primitives/Chip";
import { Screen } from "@/components/primitives/Screen";
import { Surface } from "@/components/primitives/Surface";

export default function RideModalScreen() {
  return (
    <Screen>
      <AppHeader eyebrow="ROOM CONTROLS" subtitle="Modal route example for secondary ride actions." title="Ride actions" />
      <Surface raised style={styles.panel}>
        <Chip label="Leader only" tone="warning" />
        <AppText tone="secondary">
          Use modal routes for actions that should interrupt the flow without polluting the main navigation hierarchy.
        </AppText>
        <View style={styles.actions}>
          <Button label="Pause room" variant="secondary" />
          <Button label="Close" onPress={() => router.back()} />
        </View>
      </Surface>
    </Screen>
  );
}

const styles = StyleSheet.create({
  panel: {
    padding: 18,
    gap: 14
  },
  actions: {
    gap: 10
  }
});
