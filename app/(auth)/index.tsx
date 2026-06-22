import { useState } from "react";
import { KeyboardAvoidingView, Platform, StyleSheet, View } from "react-native";
import { router } from "expo-router";

import { AppText } from "@/components/core/AppText";
import { PrimaryButton } from "@/components/core/PrimaryButton";
import { Screen } from "@/components/core/Screen";
import { Surface } from "@/components/core/Surface";
import { TextField } from "@/components/core/TextField";
import { StateBanner } from "@/components/feedback/StateBanner";
import { useTheme } from "@/design/ThemeProvider";
import { useAppStore } from "@/store/useAppStore";

export default function AuthScreen() {
  const theme = useTheme();
  const signIn = useAppStore((state) => state.signIn);
  const [name, setName] = useState("Alex Mercer");
  const [inviteCode, setInviteCode] = useState("A7Q9K");

  function handleContinue() {
    signIn(name.trim() || "Rider");
    router.replace("/(tabs)");
  }

  return (
    <Screen>
      <KeyboardAvoidingView
        behavior={Platform.select({ ios: "padding", android: undefined })}
        style={styles.flex}
      >
        <View style={styles.hero}>
          <AppText variant="caption" tone="accent">
            RIDE OPS, REFINED
          </AppText>
          <AppText variant="titleLg">Real-time group coordination built for riders who move as one.</AppText>
          <AppText tone="muted">
            Voice, map, ride messaging, sync cues, and leader control in one glove-friendly command surface.
          </AppText>
        </View>

        <Surface style={[styles.panel, { backgroundColor: theme.colors.bgElevated }]}>
          <View style={styles.form}>
            <TextField label="Rider name" value={name} onChangeText={setName} placeholder="Your display name" />
            <TextField
              label="Invite code"
              value={inviteCode}
              onChangeText={setInviteCode}
              placeholder="Room code or link token"
            />
            <StateBanner
              title="Permissions readiness"
              body="The app requests microphone and location only when you enter a ride room."
            />
            <PrimaryButton label="Enter RideSync" onPress={handleContinue} />
          </View>
        </Surface>
      </KeyboardAvoidingView>
    </Screen>
  );
}

const styles = StyleSheet.create({
  flex: {
    flex: 1,
    justifyContent: "space-between",
    paddingVertical: 24
  },
  hero: {
    gap: 12,
    paddingTop: 24
  },
  panel: {
    marginTop: 32
  },
  form: {
    gap: 16
  }
});
