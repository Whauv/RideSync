import { StyleSheet, View } from "react-native";

import { AppText } from "@/components/core/AppText";
import { PrimaryButton } from "@/components/core/PrimaryButton";
import { Screen } from "@/components/core/Screen";
import { Surface } from "@/components/core/Surface";
import { useTheme } from "@/design/ThemeProvider";
import { useAppStore } from "@/store/useAppStore";

export default function CommsScreen() {
  const theme = useTheme();
  const messages = useAppStore((state) => state.messages);

  return (
    <Screen scroll>
      <View style={styles.header}>
        <AppText variant="title">Coordination</AppText>
        <AppText tone="muted">Fast signals, pings, and incident escalation.</AppText>
      </View>

      <View style={styles.actions}>
        <PrimaryButton label="Ping Leader" />
        <PrimaryButton label="Fuel Stop" kind="secondary" />
        <PrimaryButton label="SOS" kind="danger" />
      </View>

      <Surface>
        <AppText variant="caption" tone="soft" style={styles.sectionLabel}>
          Ride feed
        </AppText>
        {messages.map((message) => (
          <View key={message.id} style={[styles.messageRow, { borderBottomColor: theme.colors.line }]}>
            <View style={styles.messageMeta}>
              <AppText style={styles.sender}>{message.senderName}</AppText>
              <AppText variant="caption" tone="soft">
                {message.sentAt}
              </AppText>
            </View>
            <AppText tone={message.kind === "sos" ? "accent" : "muted"}>{message.body}</AppText>
          </View>
        ))}
      </Surface>
    </Screen>
  );
}

const styles = StyleSheet.create({
  header: {
    gap: 6,
    marginVertical: 18
  },
  actions: {
    gap: 10,
    marginBottom: 12
  },
  sectionLabel: {
    marginBottom: 12
  },
  messageRow: {
    gap: 6,
    paddingVertical: 12,
    borderBottomWidth: StyleSheet.hairlineWidth
  },
  messageMeta: {
    flexDirection: "row",
    justifyContent: "space-between"
  },
  sender: {
    fontWeight: "600"
  }
});
