import { AppText } from "@/components/primitives/AppText";
import { Button } from "@/components/primitives/Button";
import { Surface } from "@/components/primitives/Surface";
import { useToast } from "@/providers/ToastProvider";
import { StyleSheet, View } from "react-native";

export function ToastDemoCard() {
  const { showToast } = useToast();

  return (
    <Surface style={styles.card}>
      <View style={styles.copy}>
        <AppText variant="title3">Toast system</AppText>
        <AppText tone="secondary">Transient operational confirmation designed for fast feedback without clutter.</AppText>
      </View>
      <Button
        label="Trigger Toast"
        onPress={() =>
          showToast({
            title: "Ride room updated",
            message: "Leader moved the regroup point to Canyon overlook.",
            tone: "success"
          })
        }
        variant="secondary"
      />
    </Surface>
  );
}

const styles = StyleSheet.create({
  card: {
    padding: 18,
    gap: 14
  },
  copy: {
    gap: 6
  }
});
