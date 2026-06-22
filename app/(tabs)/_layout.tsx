import { Redirect, Tabs } from "expo-router";
import { MaterialCommunityIcons } from "@expo/vector-icons";

import { useTheme } from "@/design/ThemeProvider";
import { hasCorePermissions, isProfileComplete, useAppStore } from "@/store/useAppStore";

export default function TabsLayout() {
  const theme = useTheme();
  const authBootstrapped = useAppStore((state) => state.authBootstrapped);
  const authIdentity = useAppStore((state) => state.authIdentity);
  const profile = useAppStore((state) => state.profile);
  const permissions = useAppStore((state) => state.permissions);

  if (!authBootstrapped) {
    return null;
  }

  if (!authIdentity || !isProfileComplete(profile) || !hasCorePermissions(permissions)) {
    return <Redirect href="/" />;
  }

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarStyle: {
          height: 74,
          paddingTop: 8,
          paddingBottom: 10,
          backgroundColor: theme.colors.surfaceOverlay,
          borderTopColor: theme.colors.lineSubtle,
          position: "absolute"
        },
        tabBarActiveTintColor: theme.colors.textPrimary,
        tabBarInactiveTintColor: theme.colors.textTertiary,
        tabBarLabelStyle: {
          ...theme.tokens.type.footnote
        }
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: "Ride",
          tabBarIcon: ({ color, size }) => <MaterialCommunityIcons color={color} name="map-marker-path" size={size} />
        }}
      />
      <Tabs.Screen
        name="comms"
        options={{
          title: "Comms",
          tabBarIcon: ({ color, size }) => <MaterialCommunityIcons color={color} name="radio-handheld" size={size} />
        }}
      />
      <Tabs.Screen
        name="squad"
        options={{
          title: "Squad",
          tabBarIcon: ({ color, size }) => <MaterialCommunityIcons color={color} name="account-group-outline" size={size} />
        }}
      />
      <Tabs.Screen
        name="settings"
        options={{
          title: "Settings",
          tabBarIcon: ({ color, size }) => <MaterialCommunityIcons color={color} name="tune-variant" size={size} />
        }}
      />
    </Tabs>
  );
}
