import { useMemo, useState } from "react";
import { StyleSheet, View } from "react-native";
import { router } from "expo-router";

import { AppHeader } from "@/components/primitives/AppHeader";
import { AppText } from "@/components/primitives/AppText";
import { Button } from "@/components/primitives/Button";
import { Chip } from "@/components/primitives/Chip";
import { PermissionStateCard } from "@/components/primitives/PermissionStateCard";
import { Screen } from "@/components/primitives/Screen";
import { Surface } from "@/components/primitives/Surface";
import { useToast } from "@/providers/ToastProvider";
import {
  openSystemSettings,
  prepareAudioSession,
  requestLocationAccess,
  requestMicrophoneAccess,
  requestNotificationAccess
} from "@/services/permissions";
import { hasCorePermissions, useAppStore } from "@/store/useAppStore";
import { PermissionStatus } from "@/types/auth";

const permissionCopy = {
  location: {
    title: "Precise location",
    body: "Lets the leader see rider spacing, stale states, and regroup context while the ride is active."
  },
  microphone: {
    title: "Microphone",
    body: "Powers low-friction room voice without forcing riders into phone-call patterns."
  },
  notifications: {
    title: "Notifications",
    body: "Delivers regroup, safety, and SOS events if the app drops behind the foreground."
  },
  audio: {
    title: "Audio readiness",
    body: "Prepares the device audio session for voice and synchronized playback behavior."
  }
} as const;

export default function PermissionsScreen() {
  const { showToast } = useToast();
  const permissions = useAppStore((state) => state.permissions);
  const updatePermission = useAppStore((state) => state.updatePermission);
  const [loadingKey, setLoadingKey] = useState<keyof typeof permissionCopy | null>(null);

  const readyForApp = useMemo(() => hasCorePermissions(permissions), [permissions]);

  async function runPermissionRequest(key: keyof typeof permissionCopy) {
    setLoadingKey(key);

    try {
      const status =
        key === "location"
          ? await requestLocationAccess()
          : key === "microphone"
            ? await requestMicrophoneAccess()
            : key === "notifications"
              ? await requestNotificationAccess()
              : await prepareAudioSession();

      updatePermission(key, status);

      if (status === "granted") {
        showToast({
          title: `${permissionCopy[key].title} ready`,
          message: "RideSync can use this capability during live coordination.",
          tone: "success"
        });
      }
    } finally {
      setLoadingKey(null);
    }
  }

  function statusTone(status: PermissionStatus) {
    if (status === "granted") {
      return "success";
    }

    if (status === "denied" || status === "blocked") {
      return "danger";
    }

    if (status === "unavailable") {
      return "warning";
    }

    return "neutral";
  }

  return (
    <Screen scroll>
      <AppHeader
        eyebrow="PERMISSIONS"
        subtitle="Explain the why clearly, then let riders recover from denial without dead ends."
        title="Device readiness"
      />

      <View style={styles.stack}>
        {(Object.keys(permissionCopy) as (keyof typeof permissionCopy)[]).map((key) => {
          const currentStatus = permissions[key];
          const recoveryNeeded = currentStatus === "blocked" || currentStatus === "denied";

          return (
            <Surface key={key} raised style={styles.card}>
              <View style={styles.cardHeader}>
                <Chip label={currentStatus.toUpperCase()} tone={statusTone(currentStatus)} />
                {recoveryNeeded ? <Button label="Open settings" onPress={openSystemSettings} variant="ghost" /> : null}
              </View>

              <PermissionStateCard
                actionLabel={currentStatus === "granted" ? "Granted" : loadingKey === key ? "Requesting..." : "Allow access"}
                body={permissionCopy[key].body}
                icon={
                  key === "location"
                    ? "crosshairs-gps"
                    : key === "microphone"
                      ? "microphone-outline"
                      : key === "notifications"
                        ? "bell-ring-outline"
                        : "waveform"
                }
                onAction={currentStatus === "granted" ? undefined : () => runPermissionRequest(key)}
                title={permissionCopy[key].title}
              />

              {recoveryNeeded ? (
                <AppText tone="secondary">
                  If you denied this earlier, open system settings and re-enable it to unlock the full ride experience.
                </AppText>
              ) : null}
            </Surface>
          );
        })}
      </View>

      <Surface style={styles.footer}>
        <AppText variant="title3">Before you enter the ride room</AppText>
        <AppText tone="secondary">
          Location and microphone are required. Notifications can be denied, but we still need a decision recorded. Audio
          readiness prepares the device for voice and group playback.
        </AppText>
      </Surface>

      <Button
        disabled={!readyForApp}
        label={readyForApp ? "Enter RideSync" : "Finish required permissions"}
        onPress={() => router.replace("/(tabs)")}
      />
    </Screen>
  );
}

const styles = StyleSheet.create({
  stack: {
    gap: 12,
    marginBottom: 12
  },
  card: {
    padding: 14,
    gap: 12
  },
  cardHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    gap: 10
  },
  footer: {
    padding: 16,
    gap: 8,
    marginBottom: 12
  }
});
