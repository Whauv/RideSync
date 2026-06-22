import { useEffect } from "react";
import { ActivityIndicator, View } from "react-native";
import { Redirect, useLocalSearchParams } from "expo-router";

import { AppText } from "@/components/primitives/AppText";
import { Screen } from "@/components/primitives/Screen";
import { useTheme } from "@/design/ThemeProvider";
import { useAppStore } from "@/store/useAppStore";

export default function JoinRedirectScreen() {
  const theme = useTheme();
  const params = useLocalSearchParams<{ code?: string }>();
  const setPendingJoinCode = useAppStore((state) => state.setPendingJoinCode);

  useEffect(() => {
    if (typeof params.code === "string" && params.code.trim()) {
      setPendingJoinCode(params.code.trim().toUpperCase());
    }
  }, [params.code, setPendingJoinCode]);

  if (typeof params.code === "string" && params.code.trim()) {
    return <Redirect href="/" />;
  }

  return (
    <Screen>
      <View style={{ flex: 1, alignItems: "center", justifyContent: "center", gap: 12 }}>
        <ActivityIndicator color={theme.colors.accent} />
        <AppText tone="secondary">Preparing invite handoff...</AppText>
      </View>
    </Screen>
  );
}
