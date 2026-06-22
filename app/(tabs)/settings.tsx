import { Pressable, StyleSheet, View } from "react-native";

import { AppText } from "@/components/core/AppText";
import { Screen } from "@/components/core/Screen";
import { Surface } from "@/components/core/Surface";
import { useTheme } from "@/design/ThemeProvider";
import { useAppStore } from "@/store/useAppStore";

const themeModes = ["system", "light", "dark"] as const;

export default function SettingsScreen() {
  const theme = useTheme();
  const themeMode = useAppStore((state) => state.themeMode);
  const setThemeMode = useAppStore((state) => state.setThemeMode);

  return (
    <Screen scroll>
      <View style={styles.header}>
        <AppText variant="title">System settings</AppText>
        <AppText tone="muted">Provider readiness, appearance, and safety defaults.</AppText>
      </View>

      <Surface>
        <AppText variant="caption" tone="soft" style={styles.sectionLabel}>
          Appearance
        </AppText>
        <View style={styles.optionRow}>
          {themeModes.map((mode) => (
            <Pressable
              key={mode}
              onPress={() => setThemeMode(mode)}
              style={[
                styles.option,
                {
                  backgroundColor: themeMode === mode ? theme.colors.accentSoft : theme.colors.surfaceMuted,
                  borderColor: themeMode === mode ? theme.colors.accent : theme.colors.line
                }
              ]}
            >
              <AppText style={{ fontWeight: "600" }}>{mode}</AppText>
            </Pressable>
          ))}
        </View>
      </Surface>

      <Surface muted style={styles.section}>
        <AppText variant="caption" tone="soft">
          Backend
        </AppText>
        <AppText>Firebase Auth, Firestore, and Functions scaffolded for production integration.</AppText>
      </Surface>

      <Surface muted style={styles.section}>
        <AppText variant="caption" tone="soft">
          Voice abstraction
        </AppText>
        <AppText>LiveKit adapter is the first implementation; Agora remains a drop-in future provider.</AppText>
      </Surface>
    </Screen>
  );
}

const styles = StyleSheet.create({
  header: {
    gap: 6,
    marginVertical: 18
  },
  sectionLabel: {
    marginBottom: 12
  },
  optionRow: {
    flexDirection: "row",
    gap: 10
  },
  option: {
    flex: 1,
    minHeight: 48,
    borderRadius: 16,
    borderWidth: 1,
    alignItems: "center",
    justifyContent: "center"
  },
  section: {
    marginTop: 12,
    gap: 6
  }
});
