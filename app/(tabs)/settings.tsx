import { useState } from "react";
import { StyleSheet } from "react-native";
import { router } from "expo-router";

import { AppHeader } from "@/components/primitives/AppHeader";
import { WebDevModeCard } from "@/components/dev/WebDevModeCard";
import { AppModal } from "@/components/primitives/AppModal";
import { AppText } from "@/components/primitives/AppText";
import { Button } from "@/components/primitives/Button";
import { Chip } from "@/components/primitives/Chip";
import { IconButton } from "@/components/primitives/IconButton";
import { ListRow } from "@/components/primitives/ListRow";
import { Screen } from "@/components/primitives/Screen";
import { SegmentedControl } from "@/components/primitives/SegmentedControl";
import { Surface } from "@/components/primitives/Surface";
import { useToast } from "@/providers/ToastProvider";
import { signOutUser } from "@/services/auth";
import { getPlatformCapabilities } from "@/services/platform";
import { useAppStore } from "@/store/useAppStore";

const themeModes = [
  { label: "System", value: "system" },
  { label: "Light", value: "light" },
  { label: "Dark", value: "dark" }
] as const;

export default function SettingsScreen() {
  const { showToast } = useToast();
  const themeMode = useAppStore((state) => state.themeMode);
  const runtimePreferences = useAppStore((state) => state.runtimePreferences);
  const featureFlags = useAppStore((state) => state.featureFlags);
  const setThemeMode = useAppStore((state) => state.setThemeMode);
  const setRuntimePreferences = useAppStore((state) => state.setRuntimePreferences);
  const signOutLocal = useAppStore((state) => state.signOutLocal);
  const [showProviderModal, setShowProviderModal] = useState(false);
  const platformCapabilities = getPlatformCapabilities();

  return (
    <Screen scroll>
      <AppHeader
        eyebrow="SETTINGS"
        right={<IconButton icon="palette-outline" onPress={() => showToast({ title: "Theme system active", message: "Light, dark, and system themes are wired into the shell." })} />}
        subtitle="Appearance, provider readiness, and internal diagnostics stay out of the primary ride surface."
        title="System"
      />

      <Surface style={styles.panel}>
        <AppText variant="title3">Appearance</AppText>
        <SegmentedControl onChange={setThemeMode} options={themeModes} value={themeMode} />
      </Surface>

      <WebDevModeCard />

      <Surface style={styles.panel}>
        <AppText variant="title3">Ride resilience</AppText>
        <SegmentedControl
          onChange={(value) => setRuntimePreferences({ batterySaverMode: value === "on" })}
          options={[
            { label: "Battery saver off", value: "off" },
            { label: "Battery saver on", value: "on" }
          ]}
          value={runtimePreferences.batterySaverMode ? "on" : "off"}
        />
        <SegmentedControl
          onChange={(value) => setRuntimePreferences({ reducedGpsCadence: value === "reduced" })}
          options={[
            { label: "Standard GPS", value: "standard" },
            { label: "Reduced cadence", value: "reduced" }
          ]}
          value={runtimePreferences.reducedGpsCadence ? "reduced" : "standard"}
        />
        <AppText tone="secondary">
          Battery saver stretches ride telemetry intervals. Reduced cadence lowers location update frequency for weak-power days.
        </AppText>
      </Surface>

      <Surface style={styles.panel}>
        <AppText variant="title3">Development surface</AppText>
        <AppText tone="secondary">
          Current surface: {platformCapabilities.surface}. Browser mode uses shared product flows with simulated map and voice transports so we can validate the system in one repo before deep device testing.
        </AppText>
      </Surface>

      <Surface style={styles.panel}>
        <ListRow
          chevron
          leading={<Chip label="Internal" tone="accent" />}
          onPress={() => router.push("/internal/design-showcase")}
          subtitle="Every primitive in isolation, plus tone and state references."
          title="Design showcase"
        />
        <ListRow
          chevron
          leading={<Chip label="Safety" tone="warning" />}
          onPress={() => router.push("/medical-card")}
          subtitle="Emergency contact context, medical notes, and leader-sharing preferences."
          title="Medical card"
        />
        <ListRow
          chevron
          leading={<Chip label="Provider" tone="neutral" />}
          onPress={() => setShowProviderModal(true)}
          subtitle="LiveKit-first voice abstraction and metadata-sync playback model with provider policy guardrails."
          title="Provider stack"
        />
        {featureFlags.developerDiagnostics ? (
          <ListRow
            chevron
            leading={<Chip label="Diagnostics" tone="accent" />}
            onPress={() => router.push("/diagnostics")}
            subtitle="Recovery state, local logs, crash placeholder status, and feature flags."
            title="Reliability console"
          />
        ) : null}
        <ListRow
          leading={<Chip label="Account" tone="warning" />}
          onPress={async () => {
            await signOutUser().catch(() => undefined);
            signOutLocal();
            router.replace("/(auth)/sign-in");
          }}
          subtitle="Clear the current rider session and return to authentication."
          title="Sign out"
        />
      </Surface>

      <AppModal onClose={() => setShowProviderModal(false)} title="Provider stack" visible={showProviderModal}>
        <AppText tone="secondary">
          RideSync is configured around a LiveKit-first voice adapter, Firebase-backed room state, and a timestamp-based
          playback sync contract. Simulation is legal-safe by default; provider-owned media playback only activates through
          licensed adapter integrations.
        </AppText>
        <Button label="Understood" onPress={() => setShowProviderModal(false)} />
      </AppModal>
    </Screen>
  );
}

const styles = StyleSheet.create({
  panel: {
    padding: 16,
    gap: 12,
    marginBottom: 12
  }
});
