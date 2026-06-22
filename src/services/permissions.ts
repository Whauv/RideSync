import { Linking, PermissionsAndroid, Platform } from "react-native";
import * as Location from "expo-location";
import * as Notifications from "expo-notifications";
import { Audio, InterruptionModeAndroid, InterruptionModeIOS } from "expo-av";

import { PermissionStatus } from "@/types/auth";

function mapExpoPermission(status: string, canAskAgain?: boolean): PermissionStatus {
  if (status === "granted") {
    return "granted";
  }

  if (status === "denied" && canAskAgain === false) {
    return "blocked";
  }

  return "denied";
}

export async function requestLocationAccess() {
  const permission = await Location.requestForegroundPermissionsAsync();
  return mapExpoPermission(permission.status, permission.canAskAgain);
}

export async function requestMicrophoneAccess(): Promise<PermissionStatus> {
  try {
    const permission = await Audio.requestPermissionsAsync();
    return mapExpoPermission(permission.status, permission.canAskAgain);
  } catch {
    if (Platform.OS === "android") {
      const granted = await PermissionsAndroid.request(PermissionsAndroid.PERMISSIONS.RECORD_AUDIO);
      return granted === PermissionsAndroid.RESULTS.GRANTED ? "granted" : "denied";
    }

    return "unavailable";
  }
}

export async function requestNotificationAccess(): Promise<PermissionStatus> {
  try {
    const existing = (await Notifications.getPermissionsAsync()) as {
      granted?: boolean;
      status?: string;
      canAskAgain?: boolean;
    };

    if (existing.granted) {
      return "granted";
    }

    const requested = (await Notifications.requestPermissionsAsync()) as {
      granted?: boolean;
      status?: string;
      canAskAgain?: boolean;
    };

    return requested.granted ? "granted" : mapExpoPermission(requested.status ?? "denied", requested.canAskAgain);
  } catch {
    if (Platform.OS === "android" && Platform.Version >= 33) {
      const granted = await PermissionsAndroid.request("android.permission.POST_NOTIFICATIONS");
      return granted === PermissionsAndroid.RESULTS.GRANTED ? "granted" : "denied";
    }

    return "unavailable";
  }
}

export async function prepareAudioSession(): Promise<PermissionStatus> {
  try {
    await Audio.setAudioModeAsync({
      allowsRecordingIOS: true,
      playsInSilentModeIOS: true,
      interruptionModeIOS: InterruptionModeIOS.DoNotMix,
      interruptionModeAndroid: InterruptionModeAndroid.DoNotMix,
      shouldDuckAndroid: true,
      staysActiveInBackground: false,
      playThroughEarpieceAndroid: false
    });

    return "granted";
  } catch {
    return "unavailable";
  }
}

export async function openSystemSettings() {
  await Linking.openSettings();
}
