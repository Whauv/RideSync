import { useState } from "react";
import { KeyboardAvoidingView, Platform, StyleSheet } from "react-native";
import { router } from "expo-router";

import { AppHeader } from "@/components/primitives/AppHeader";
import { Button } from "@/components/primitives/Button";
import { Chip } from "@/components/primitives/Chip";
import { Screen } from "@/components/primitives/Screen";
import { SegmentedControl } from "@/components/primitives/SegmentedControl";
import { Surface } from "@/components/primitives/Surface";
import { TextField } from "@/components/primitives/TextField";
import { useToast } from "@/providers/ToastProvider";
import { saveRiderProfile } from "@/services/profile";
import { useAppStore } from "@/store/useAppStore";

export default function MedicalCardScreen() {
  const { showToast } = useToast();
  const authIdentity = useAppStore((state) => state.authIdentity);
  const profile = useAppStore((state) => state.profile);
  const replaceProfile = useAppStore((state) => state.replaceProfile);
  const [draft, setDraft] = useState(profile);
  const [saving, setSaving] = useState(false);

  function updateField(key: keyof typeof draft.medicalProfile, value: string | boolean) {
    setDraft((current) => ({
      ...current,
      medicalProfile: {
        ...current.medicalProfile,
        [key]: value
      }
    }));
  }

  async function handleSave() {
    if (!authIdentity) {
      return;
    }

    setSaving(true);

    try {
      replaceProfile(draft);
      await saveRiderProfile(authIdentity.uid, draft);
      showToast({
        title: "Medical card saved",
        message: "Your emergency profile is available locally for ride leaders and future escalation flows.",
        tone: "success"
      });
      router.back();
    } catch (error) {
      showToast({
        title: "Unable to save",
        message: error instanceof Error ? error.message : "Medical card could not be updated.",
        tone: "danger"
      });
    } finally {
      setSaving(false);
    }
  }

  return (
    <Screen scroll>
      <KeyboardAvoidingView behavior={Platform.select({ ios: "padding", android: undefined })} style={styles.shell}>
        <AppHeader
          eyebrow="MEDICAL CARD"
          right={<Chip label="Safety only" tone="warning" />}
          subtitle="Keep this concise, current, and useful under pressure. This is not used for automated medical decisions."
          title="Emergency profile"
        />

        <Surface raised style={styles.section}>
          <TextField
            autoCapitalize="characters"
            helperText="Optional and rider-supplied."
            label="Blood type"
            onChangeText={(value) => updateField("bloodType", value)}
            placeholder="O+"
            value={draft.medicalProfile.bloodType}
          />
          <TextField
            helperText="Comma-separated works well here."
            label="Allergies"
            multiline
            onChangeText={(value) => updateField("allergies", value)}
            placeholder="Penicillin, peanuts"
            value={draft.medicalProfile.allergies}
          />
          <TextField
            label="Conditions"
            multiline
            onChangeText={(value) => updateField("conditions", value)}
            placeholder="Asthma, diabetes"
            value={draft.medicalProfile.conditions}
          />
          <TextField
            label="Medications"
            multiline
            onChangeText={(value) => updateField("medications", value)}
            placeholder="Inhaler, insulin"
            value={draft.medicalProfile.medications}
          />
          <TextField
            helperText="Access notes, helmet release info, or anything a leader should know."
            label="Emergency notes"
            multiline
            onChangeText={(value) => updateField("notes", value)}
            placeholder="ICE card is in left jacket pocket."
            value={draft.medicalProfile.notes}
          />
        </Surface>

        <Surface style={styles.section}>
          <SegmentedControl
            onChange={(value) => updateField("shareWithRideLeaders", value === "share")}
            options={[
              { label: "Share with leaders", value: "share" },
              { label: "Keep local", value: "local" }
            ]}
            value={draft.medicalProfile.shareWithRideLeaders ? "share" : "local"}
          />
        </Surface>

        <Button label="Save medical card" loading={saving} onPress={handleSave} />
      </KeyboardAvoidingView>
    </Screen>
  );
}

const styles = StyleSheet.create({
  shell: {
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
