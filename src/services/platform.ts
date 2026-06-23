import { Platform } from "react-native";

export type DevelopmentSurface = "web" | "ios" | "android";

export interface PlatformCapabilitySnapshot {
  surface: DevelopmentSurface;
  webFirstMode: boolean;
  mapMode: "simulated_web_map" | "native_map";
  voiceMode: "simulated_browser_voice" | "livekit_native";
  notificationMode: "browser_fallback" | "expo_native";
  permissionMode: "browser_prompt" | "native_prompt";
}

export function getDevelopmentSurface(): DevelopmentSurface {
  if (Platform.OS === "ios" || Platform.OS === "android") {
    return Platform.OS;
  }

  return "web";
}

export function getPlatformCapabilities(): PlatformCapabilitySnapshot {
  const surface = getDevelopmentSurface();
  const webFirstMode = surface === "web";

  return {
    surface,
    webFirstMode,
    mapMode: webFirstMode ? "simulated_web_map" : "native_map",
    voiceMode: webFirstMode ? "simulated_browser_voice" : "livekit_native",
    notificationMode: webFirstMode ? "browser_fallback" : "expo_native",
    permissionMode: webFirstMode ? "browser_prompt" : "native_prompt"
  };
}
