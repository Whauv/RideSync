import { Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";

import { AppProviders } from "@/providers/AppProviders";

export default function RootLayout() {
  return (
    <AppProviders>
      <StatusBar style="auto" />
      <Stack screenOptions={{ headerShown: false, animation: "fade" }}>
        <Stack.Screen name="index" />
        <Stack.Screen name="marketing" />
        <Stack.Screen name="admin" />
        <Stack.Screen name="join" />
        <Stack.Screen name="(auth)" />
        <Stack.Screen name="(tabs)" />
        <Stack.Screen name="diagnostics" options={{ presentation: "modal", animation: "slide_from_right" }} />
        <Stack.Screen name="internal/design-showcase" />
        <Stack.Screen name="medical-card" options={{ presentation: "modal", animation: "slide_from_right" }} />
        <Stack.Screen name="modal" options={{ presentation: "modal", animation: "slide_from_bottom" }} />
      </Stack>
    </AppProviders>
  );
}
