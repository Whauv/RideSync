import { useState } from "react";
import { StyleSheet, View } from "react-native";
import { router } from "expo-router";
import { MaterialCommunityIcons } from "@expo/vector-icons";

import { AppText } from "@/components/primitives/AppText";
import { Button } from "@/components/primitives/Button";
import { Chip } from "@/components/primitives/Chip";
import { Screen } from "@/components/primitives/Screen";
import { Surface } from "@/components/primitives/Surface";
import { useTheme } from "@/design/ThemeProvider";
import { useAppStore } from "@/store/useAppStore";

const onboardingSteps = [
  {
    icon: "radio-handheld",
    eyebrow: "ROOM VOICE",
    title: "Stay in one channel while the pack stretches and compresses.",
    body: "Leader, sweep, and riders share one operational voice layer tuned for fast ride decisions."
  },
  {
    icon: "map-marker-path",
    eyebrow: "RIDE MAP",
    title: "See the group, not just the route.",
    body: "Live heading, rider spacing, and stale-state awareness keep regroup decisions grounded in reality."
  },
  {
    icon: "shield-check-outline",
    eyebrow: "PERMISSIONS",
    title: "We ask only for the capabilities the ride actually uses.",
    body: "Location, microphone, notifications, and audio readiness are requested with clear safety context."
  },
  {
    icon: "alert-decagram-outline",
    eyebrow: "SAFETY VALUE",
    title: "Fuel, hazard, and SOS cues stay immediate when conditions get messy.",
    body: "RideSync is designed to reduce ambiguity when riders split, stall, or need help quickly."
  }
] as const;

export default function OnboardingScreen() {
  const theme = useTheme();
  const completeOnboarding = useAppStore((state) => state.completeOnboarding);
  const [stepIndex, setStepIndex] = useState(0);
  const step = onboardingSteps[stepIndex];
  const isLast = stepIndex === onboardingSteps.length - 1;

  function handleNext() {
    if (isLast) {
      completeOnboarding();
      router.replace("/(auth)/sign-in");
      return;
    }

    setStepIndex((current) => current + 1);
  }

  return (
    <Screen>
      <View style={styles.container}>
        <View style={styles.header}>
          <Chip label={`0${stepIndex + 1} / 0${onboardingSteps.length}`} tone="accent" />
          <AppText variant="display">RideSync</AppText>
          <AppText tone="secondary">
            Premium coordination for motorcycle groups that need calm, high-trust tools.
          </AppText>
        </View>

        <Surface raised style={styles.card}>
          <View style={[styles.icon, { backgroundColor: theme.colors.accentMuted }]}>
            <MaterialCommunityIcons color={theme.colors.accent} name={step.icon} size={24} />
          </View>
          <View style={styles.copy}>
            <AppText variant="label" tone="accent">
              {step.eyebrow}
            </AppText>
            <AppText variant="title1">{step.title}</AppText>
            <AppText tone="secondary">{step.body}</AppText>
          </View>
          <View style={styles.progress}>
            {onboardingSteps.map((item, index) => (
              <View
                key={item.eyebrow}
                style={[
                  styles.dot,
                  {
                    backgroundColor: index === stepIndex ? theme.colors.accent : theme.colors.lineSubtle
                  }
                ]}
              />
            ))}
          </View>
          <Button label={isLast ? "Continue to sign in" : "Next"} onPress={handleNext} />
        </Surface>
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "space-between",
    paddingVertical: 24
  },
  header: {
    gap: 10,
    paddingTop: 24
  },
  card: {
    padding: 20,
    gap: 18
  },
  icon: {
    width: 56,
    height: 56,
    borderRadius: 20,
    alignItems: "center",
    justifyContent: "center"
  },
  copy: {
    gap: 8
  },
  progress: {
    flexDirection: "row",
    gap: 8
  },
  dot: {
    height: 4,
    flex: 1,
    borderRadius: 999
  }
});
