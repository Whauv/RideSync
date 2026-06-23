import { PermissionStatus } from "@/types/auth";

function mapBrowserPermission(state: PermissionState | NotificationPermission | "unsupported"): PermissionStatus {
  if (state === "granted") {
    return "granted";
  }

  if (state === "denied") {
    return "blocked";
  }

  if (state === "unsupported") {
    return "unavailable";
  }

  return "denied";
}

export async function requestLocationAccess(): Promise<PermissionStatus> {
  if (typeof navigator === "undefined" || !navigator.geolocation) {
    return "unavailable";
  }

  return new Promise((resolve) => {
    navigator.geolocation.getCurrentPosition(
      () => resolve("granted"),
      () => resolve("denied"),
      { enableHighAccuracy: true, timeout: 6000 }
    );
  });
}

export async function requestMicrophoneAccess(): Promise<PermissionStatus> {
  if (typeof navigator === "undefined" || !navigator.mediaDevices?.getUserMedia) {
    return "unavailable";
  }

  try {
    const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
    stream.getTracks().forEach((track) => track.stop());
    return "granted";
  } catch {
    return "denied";
  }
}

export async function requestNotificationAccess(): Promise<PermissionStatus> {
  if (typeof window === "undefined" || !("Notification" in window)) {
    return "unavailable";
  }

  const status = Notification.permission === "default" ? await Notification.requestPermission() : Notification.permission;
  return mapBrowserPermission(status);
}

export async function prepareAudioSession(): Promise<PermissionStatus> {
  return "granted";
}

export async function openSystemSettings() {
  if (typeof window !== "undefined") {
    window.open("https://support.apple.com/guide/iphone/control-access-to-information-in-apps-iph251e92810/ios", "_blank", "noopener,noreferrer");
  }
}
