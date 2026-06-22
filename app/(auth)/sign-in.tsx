import { useMemo, useState } from "react";
import { KeyboardAvoidingView, Platform, StyleSheet, View } from "react-native";
import { router } from "expo-router";

import { AppHeader } from "@/components/primitives/AppHeader";
import { AppText } from "@/components/primitives/AppText";
import { Button } from "@/components/primitives/Button";
import { Screen } from "@/components/primitives/Screen";
import { SegmentedControl } from "@/components/primitives/SegmentedControl";
import { Surface } from "@/components/primitives/Surface";
import { TextField } from "@/components/primitives/TextField";
import { useToast } from "@/providers/ToastProvider";
import { signInWithEmail, signUpWithEmail } from "@/services/auth";

type AuthMode = "sign-in" | "sign-up";

export default function SignInScreen() {
  const { showToast } = useToast();
  const [mode, setMode] = useState<AuthMode>("sign-up");
  const [riderName, setRiderName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [errorText, setErrorText] = useState("");

  const passwordsMatch = useMemo(() => mode === "sign-in" || password === confirmPassword, [confirmPassword, mode, password]);

  async function handleSubmit() {
    if (!email.trim() || !password.trim()) {
      setErrorText("Enter your email and password to continue.");
      return;
    }

    if (mode === "sign-up" && !riderName.trim()) {
      setErrorText("Add your rider name so the room roster starts with the right identity.");
      return;
    }

    if (!passwordsMatch) {
      setErrorText("Passwords do not match.");
      return;
    }

    setLoading(true);
    setErrorText("");

    try {
      if (mode === "sign-up") {
        await signUpWithEmail(email, password, riderName);
      } else {
        await signInWithEmail(email, password);
      }

      router.replace("/(auth)/profile");
    } catch (error) {
      const message = error instanceof Error ? error.message : "Authentication failed.";
      setErrorText(message);
      showToast({
        title: "Authentication unavailable",
        message,
        tone: "danger"
      });
    } finally {
      setLoading(false);
    }
  }

  return (
    <Screen>
      <KeyboardAvoidingView behavior={Platform.select({ ios: "padding", android: undefined })} style={styles.flex}>
        <View style={styles.hero}>
          <AppText variant="label" tone="accent">
            ACCOUNT
          </AppText>
          <AppText variant="display">Set up a secure identity before you join the ride.</AppText>
          <AppText tone="secondary">Keep the auth surface compact, trustworthy, and fast enough for roadside use.</AppText>
        </View>

        <Surface raised style={styles.panel}>
          <AppHeader title="Sign in or create account" subtitle="Firebase Auth backs the session and persists it across launches." />
          <View style={styles.form}>
            <SegmentedControl
              onChange={setMode}
              options={[
                { label: "Create account", value: "sign-up" },
                { label: "Sign in", value: "sign-in" }
              ]}
              value={mode}
            />
            {mode === "sign-up" ? (
              <TextField
                autoCapitalize="words"
                label="Rider name"
                onChangeText={setRiderName}
                placeholder="Maya Chen"
                textContentType="name"
                value={riderName}
              />
            ) : null}
            <TextField
              autoCapitalize="none"
              keyboardType="email-address"
              label="Email"
              onChangeText={setEmail}
              placeholder="you@example.com"
              textContentType="emailAddress"
              value={email}
            />
            <TextField
              autoCapitalize="none"
              errorText={errorText || undefined}
              label="Password"
              onChangeText={setPassword}
              placeholder="Enter password"
              secureTextEntry
              textContentType="password"
              value={password}
            />
            {mode === "sign-up" ? (
              <TextField
                autoCapitalize="none"
                label="Confirm password"
                onChangeText={setConfirmPassword}
                placeholder="Repeat password"
                secureTextEntry
                textContentType="password"
                value={confirmPassword}
              />
            ) : null}
            <Button label={mode === "sign-up" ? "Create account" : "Sign in"} loading={loading} onPress={handleSubmit} />
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
    gap: 10,
    paddingTop: 24
  },
  panel: {
    padding: 18
  },
  form: {
    gap: 14
  }
});
