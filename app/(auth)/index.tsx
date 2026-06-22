import { useState } from "react";
import { KeyboardAvoidingView, Platform, StyleSheet, View } from "react-native";
import { router } from "expo-router";

import { AppHeader } from "@/components/primitives/AppHeader";
import { AppText } from "@/components/primitives/AppText";
import { Button } from "@/components/primitives/Button";
import { OTPInput } from "@/components/primitives/OTPInput";
import { Screen } from "@/components/primitives/Screen";
import { SegmentedControl } from "@/components/primitives/SegmentedControl";
import { Surface } from "@/components/primitives/Surface";
import { TextField } from "@/components/primitives/TextField";
import { useTheme } from "@/design/ThemeProvider";
import { useAppStore } from "@/store/useAppStore";

type AuthMode = "link" | "code";

export default function AuthScreen() {
  const theme = useTheme();
  const signIn = useAppStore((state) => state.signIn);
  const [authMode, setAuthMode] = useState<AuthMode>("link");
  const [name, setName] = useState("Alex Mercer");
  const [contact, setContact] = useState("alex@ridesync.app");
  const [code, setCode] = useState("A7Q9K");

  function handleEnter() {
    signIn(name.trim() || "Rider");
    router.replace("/(tabs)");
  }

  return (
    <Screen>
      <KeyboardAvoidingView behavior={Platform.select({ ios: "padding", android: undefined })} style={styles.flex}>
        <View style={styles.hero}>
          <AppText variant="label" tone="accent">
            RIDESYNC
          </AppText>
          <AppText variant="display">A premium ride ops layer for groups that need to move with precision.</AppText>
          <AppText tone="secondary">
            Built for map-first coordination, live comms, fast signals, and low-friction room entry on the roadside.
          </AppText>
        </View>

        <Surface raised style={styles.panel}>
          <AppHeader title="Enter your room" subtitle="Choose the lightest-weight join flow for the moment." />
          <View style={styles.form}>
            <SegmentedControl
              onChange={setAuthMode}
              options={[
                { label: "Magic Link", value: "link" },
                { label: "Code", value: "code" }
              ]}
              value={authMode}
            />
            <TextField helperText="Used for the active ride roster." label="Rider name" onChangeText={setName} value={name} />
            {authMode === "link" ? (
              <TextField
                helperText="Phone auth can replace this in production."
                keyboardType="email-address"
                label="Email"
                leadingIcon="email-outline"
                onChangeText={setContact}
                placeholder="you@example.com"
                value={contact}
              />
            ) : (
              <OTPInput digits={5} label="Ride code" onChangeText={setCode} value={code} />
            )}
            <View style={[styles.rule, { backgroundColor: theme.colors.lineSubtle }]} />
            <Button label="Enter RideSync" onPress={handleEnter} />
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
    paddingTop: 20
  },
  panel: {
    padding: 18
  },
  form: {
    gap: 16
  },
  rule: {
    height: 1
  }
});
