import { StyleSheet, View } from "react-native";

import { AppHeader } from "@/components/primitives/AppHeader";
import { Button } from "@/components/primitives/Button";
import { Chip } from "@/components/primitives/Chip";
import { ListRow } from "@/components/primitives/ListRow";
import { Screen } from "@/components/primitives/Screen";
import { Surface } from "@/components/primitives/Surface";
import { useAppStore } from "@/store/useAppStore";

export default function CommsScreen() {
  const messages = useAppStore((state) => state.messages);

  return (
    <Screen scroll>
      <AppHeader
        eyebrow="COORDINATION"
        subtitle="Fast signals for when the pack needs clarity faster than voice alone can provide."
        title="Comms"
      />

      <View style={styles.actions}>
        <Button label="Ping Leader" variant="secondary" />
        <Button label="Fuel stop" variant="secondary" />
        <Button label="SOS" variant="danger" />
      </View>

      <Surface style={styles.feed}>
        {messages.map((message) => (
          <ListRow
            key={message.id}
            leading={<Chip label={message.kind.toUpperCase()} tone={message.kind === "sos" ? "danger" : message.kind === "ping" ? "accent" : "neutral"} />}
            subtitle={message.body}
            title={`${message.senderName} · ${message.sentAt}`}
          />
        ))}
      </Surface>
    </Screen>
  );
}

const styles = StyleSheet.create({
  actions: {
    gap: 10,
    marginBottom: 12
  },
  feed: {
    paddingHorizontal: 16
  }
});
