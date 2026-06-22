import { useState } from "react";
import { StyleSheet } from "react-native";
import { router } from "expo-router";

import { AppHeader } from "@/components/primitives/AppHeader";
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
import { useAppStore } from "@/store/useAppStore";

const themeModes = [
  { label: "System", value: "system" },
  { label: "Light", value: "light" },
  { label: "Dark", value: "dark" }
] as const;

export default function SettingsScreen() {
  const { showToast } = useToast();
  const themeMode = useAppStore((state) => state.themeMode);
  const setThemeMode = useAppStore((state) => state.setThemeMode);
  const [showProviderModal, setShowProviderModal] = useState(false);

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
          leading={<Chip label="Provider" tone="neutral" />}
          onPress={() => setShowProviderModal(true)}
          subtitle="LiveKit-first voice abstraction and transport-safe playback model."
          title="Provider stack"
        />
      </Surface>

      <AppModal onClose={() => setShowProviderModal(false)} title="Provider stack" visible={showProviderModal}>
        <AppText tone="secondary">
          RideSync is configured around a LiveKit-first voice adapter, Firebase-backed room state, and a best-effort
          synchronized playback contract rather than app-owned streaming.
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
