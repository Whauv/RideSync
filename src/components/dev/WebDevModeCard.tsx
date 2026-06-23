import { StyleSheet, View } from "react-native";

import { AppText } from "@/components/primitives/AppText";
import { Chip } from "@/components/primitives/Chip";
import { Surface } from "@/components/primitives/Surface";
import { getPlatformCapabilities } from "@/services/platform";

export function WebDevModeCard() {
  const capabilities = getPlatformCapabilities();

  if (!capabilities.webFirstMode) {
    return null;
  }

  return (
    <Surface raised style={styles.card}>
      <View style={styles.header}>
        <Chip icon="monitor" label="Web-first dev mode" tone="accent" />
        <Chip icon="check-circle-outline" label="Shared flows active" tone="success" />
      </View>
      <AppText variant="bodyStrong">Browser testing is now a first-class surface for RideSync.</AppText>
      <AppText tone="secondary" variant="callout">
        Rooms, chat, planning, pings, safety states, analytics, and admin all run in-browser. Map and voice stay simulation-backed on web so the mobile-native adapters remain isolated and swappable.
      </AppText>
      <View style={styles.chips}>
        <Chip label={capabilities.mapMode.replaceAll("_", " ")} tone="neutral" />
        <Chip label={capabilities.voiceMode.replaceAll("_", " ")} tone="neutral" />
        <Chip label={capabilities.notificationMode.replaceAll("_", " ")} tone="neutral" />
      </View>
    </Surface>
  );
}

const styles = StyleSheet.create({
  card: {
    padding: 14,
    gap: 10,
    marginBottom: 12
  },
  header: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8
  },
  chips: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8
  }
});
