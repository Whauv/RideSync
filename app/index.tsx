import { Redirect } from "expo-router";
import { ActivityIndicator, View } from "react-native";

import { AppText } from "@/components/primitives/AppText";
import { Screen } from "@/components/primitives/Screen";
import { useTheme } from "@/design/ThemeProvider";
import { hasCorePermissions, isProfileComplete, useAppStore } from "@/store/useAppStore";

export default function Index() {
  const theme = useTheme();
  const authBootstrapped = useAppStore((state) => state.authBootstrapped);
  const authIdentity = useAppStore((state) => state.authIdentity);
  const hasSeenOnboarding = useAppStore((state) => state.hasSeenOnboarding);
  const profile = useAppStore((state) => state.profile);
  const permissions = useAppStore((state) => state.permissions);

  if (!authBootstrapped) {
    return (
      <Screen>
        <View style={{ flex: 1, alignItems: "center", justifyContent: "center", gap: 12 }}>
          <ActivityIndicator color={theme.colors.accent} />
          <AppText tone="secondary">Restoring your ride session...</AppText>
        </View>
      </Screen>
    );
  }

  if (!hasSeenOnboarding) {
    return <Redirect href="/(auth)" />;
  }

  if (!authIdentity) {
    return <Redirect href="/(auth)/sign-in" />;
  }

  if (!isProfileComplete(profile)) {
    return <Redirect href="/(auth)/profile" />;
  }

  if (!hasCorePermissions(permissions)) {
    return <Redirect href="/(auth)/permissions" />;
  }

  return <Redirect href="/(tabs)" />;
}
