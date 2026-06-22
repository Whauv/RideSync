import { useMemo, useState } from "react";
import { KeyboardAvoidingView, Platform, StyleSheet } from "react-native";
import { router } from "expo-router";

import { AppHeader } from "@/components/primitives/AppHeader";
import { Avatar } from "@/components/primitives/Avatar";
import { Button } from "@/components/primitives/Button";
import { Screen } from "@/components/primitives/Screen";
import { SegmentedControl } from "@/components/primitives/SegmentedControl";
import { Surface } from "@/components/primitives/Surface";
import { TextField } from "@/components/primitives/TextField";
import { useToast } from "@/providers/ToastProvider";
import { saveRiderProfile } from "@/services/profile";
import { deriveInitials, useAppStore } from "@/store/useAppStore";
import { RiderProfile } from "@/types/auth";

export default function ProfileScreen() {
  const { showToast } = useToast();
  const authIdentity = useAppStore((state) => state.authIdentity);
  const storedProfile = useAppStore((state) => state.profile);
  const replaceProfile = useAppStore((state) => state.replaceProfile);
  const [profile, setProfile] = useState<RiderProfile>(storedProfile);
  const [saving, setSaving] = useState(false);

  const avatarInitials = useMemo(() => deriveInitials(profile.riderName), [profile.riderName]);

  function updateProfile(next: Partial<RiderProfile>) {
    setProfile((current) => ({
      ...current,
      ...next,
      emergencyContact: {
        ...current.emergencyContact,
        ...next.emergencyContact
      }
    }));
  }

  async function handleContinue() {
    if (!authIdentity) {
      showToast({
        title: "Session missing",
        message: "Sign in again before saving your rider profile.",
        tone: "danger"
      });
      router.replace("/(auth)/sign-in");
      return;
    }

    setSaving(true);
    const nextProfile = {
      ...profile,
      avatarInitials
    };

    try {
      replaceProfile(nextProfile);
      await saveRiderProfile(authIdentity.uid, nextProfile);
      router.replace("/(auth)/permissions");
    } catch (error) {
      showToast({
        title: "Profile save failed",
        message: error instanceof Error ? error.message : "Unable to save profile.",
        tone: "danger"
      });
    } finally {
      setSaving(false);
    }
  }

  return (
    <Screen scroll>
      <KeyboardAvoidingView behavior={Platform.select({ ios: "padding", android: undefined })} style={styles.flex}>
        <AppHeader
          eyebrow="PROFILE"
          subtitle="Capture the minimum rider details the room needs to identify and support you cleanly."
          title="Rider setup"
        />

        <Surface raised style={styles.section}>
          <Avatar accent name={profile.riderName || "Ride Sync"} size={60} />
          <TextField autoCapitalize="words" label="Rider name" onChangeText={(value) => updateProfile({ riderName: value })} value={profile.riderName} />
          <TextField autoCapitalize="words" label="Bike name" onChangeText={(value) => updateProfile({ bikeName: value })} placeholder="Blue Tenere" value={profile.bikeName} />
          <TextField autoCapitalize="words" helperText="Optional but useful in the roster." label="Bike brand" onChangeText={(value) => updateProfile({ bikeBrand: value })} placeholder="Yamaha" value={profile.bikeBrand ?? ""} />
          <TextField autoCapitalize="words" helperText="Optional and only used for ride setup context." label="Intercom brand" onChangeText={(value) => updateProfile({ intercomBrand: value })} placeholder="Cardo Packtalk" value={profile.intercomBrand ?? ""} />
        </Surface>

        <Surface style={styles.section}>
          <TextField
            autoCapitalize="words"
            label="Emergency contact name"
            onChangeText={(value) =>
              updateProfile({
                emergencyContact: {
                  ...profile.emergencyContact,
                  name: value
                }
              })
            }
            value={profile.emergencyContact.name}
          />
          <TextField
            autoCapitalize="none"
            keyboardType="numeric"
            label="Emergency contact phone"
            onChangeText={(value) =>
              updateProfile({
                emergencyContact: {
                  ...profile.emergencyContact,
                  phone: value
                }
              })
            }
            placeholder="3035550198"
            textContentType="telephoneNumber"
            value={profile.emergencyContact.phone}
          />
        </Surface>

        <Surface style={styles.section}>
          <SegmentedControl
            onChange={(value) => updateProfile({ preferredUnits: value })}
            options={[
              { label: "Imperial", value: "imperial" },
              { label: "Metric", value: "metric" }
            ]}
            value={profile.preferredUnits}
          />
        </Surface>

        <Button label="Continue to permissions" loading={saving} onPress={handleContinue} />
      </KeyboardAvoidingView>
    </Screen>
  );
}

const styles = StyleSheet.create({
  flex: {
    flex: 1,
    gap: 12,
    paddingBottom: 24
  },
  section: {
    padding: 16,
    gap: 14,
    marginBottom: 12
  }
});
