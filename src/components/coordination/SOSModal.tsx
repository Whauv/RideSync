import { useEffect, useState } from "react";
import { StyleSheet, View } from "react-native";

import { AppModal } from "@/components/primitives/AppModal";
import { AppText } from "@/components/primitives/AppText";
import { Button } from "@/components/primitives/Button";
import { Chip } from "@/components/primitives/Chip";
import { Surface } from "@/components/primitives/Surface";

interface SOSModalProps {
  visible: boolean;
  onCancel: () => void;
  onConfirm: (countdownSeconds: number) => void;
}

const START_COUNTDOWN = 5;

export function SOSModal({ visible, onCancel, onConfirm }: SOSModalProps) {
  const [countdown, setCountdown] = useState(START_COUNTDOWN);

  useEffect(() => {
    if (!visible) {
      setCountdown(START_COUNTDOWN);
      return;
    }

    setCountdown(START_COUNTDOWN);
    const timer = setInterval(() => {
      setCountdown((current) => {
        if (current <= 1) {
          clearInterval(timer);
          onConfirm(START_COUNTDOWN);
          return 0;
        }

        return current - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [onConfirm, visible]);

  return (
    <AppModal onClose={onCancel} title="Emergency escalation" visible={visible}>
      <Surface raised style={styles.hero}>
        <Chip label="SOS" tone="danger" />
        <AppText variant="title2">Room-wide emergency alert</AppText>
        <AppText tone="secondary">
          This will notify the room immediately, mark the ride in emergency state, and trigger high-priority alert plumbing.
        </AppText>
      </Surface>

      <View style={styles.countdownBlock}>
        <AppText variant="metric">{countdown}</AppText>
        <AppText tone="secondary">Seconds until escalation</AppText>
      </View>

      <View style={styles.actions}>
        <Button label="Cancel SOS" onPress={onCancel} variant="secondary" />
      </View>
    </AppModal>
  );
}

const styles = StyleSheet.create({
  hero: {
    padding: 14,
    gap: 8
  },
  countdownBlock: {
    alignItems: "center",
    gap: 4,
    paddingVertical: 8
  },
  actions: {
    gap: 10
  }
});
