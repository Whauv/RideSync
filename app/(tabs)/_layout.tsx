import { Tabs } from "expo-router";
import { MaterialCommunityIcons } from "@expo/vector-icons";

import { useTheme } from "@/design/ThemeProvider";

export default function TabsLayout() {
  const theme = useTheme();

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarStyle: {
          height: 72,
          paddingTop: 8,
          backgroundColor: theme.colors.bgElevated,
          borderTopColor: theme.colors.line
        },
        tabBarActiveTintColor: theme.colors.text,
        tabBarInactiveTintColor: theme.colors.textSoft,
        tabBarLabelStyle: {
          fontSize: 11,
          fontWeight: "600"
        }
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: "Ride",
          tabBarIcon: ({ color, size }) => <MaterialCommunityIcons name="map-outline" color={color} size={size} />
        }}
      />
      <Tabs.Screen
        name="comms"
        options={{
          title: "Comms",
          tabBarIcon: ({ color, size }) => <MaterialCommunityIcons name="radio-handheld" color={color} size={size} />
        }}
      />
      <Tabs.Screen
        name="squad"
        options={{
          title: "Squad",
          tabBarIcon: ({ color, size }) => <MaterialCommunityIcons name="account-group-outline" color={color} size={size} />
        }}
      />
      <Tabs.Screen
        name="settings"
        options={{
          title: "Settings",
          tabBarIcon: ({ color, size }) => <MaterialCommunityIcons name="tune-variant" color={color} size={size} />
        }}
      />
    </Tabs>
  );
}
