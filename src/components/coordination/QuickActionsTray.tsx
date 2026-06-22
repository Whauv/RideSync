import { Pressable, ScrollView, StyleSheet, View } from "react-native";
import { MaterialCommunityIcons } from "@expo/vector-icons";

import { AppText } from "@/components/primitives/AppText";
import { Chip } from "@/components/primitives/Chip";
import { Surface } from "@/components/primitives/Surface";
import { useTheme } from "@/design/ThemeProvider";
import { PingDefinition } from "@/types/coordination";

interface QuickActionsTrayProps {
  pingOptions: PingDefinition[];
  unreadCount: number;
  onPing: (type: PingDefinition["type"]) => void;
  onOpenComms: () => void;
  onOpenSos: () => void;
}

export function QuickActionsTray({ pingOptions, unreadCount, onPing, onOpenComms, onOpenSos }: QuickActionsTrayProps) {
  const theme = useTheme();

  return (
    <Surface raised style={styles.card}>
      <View style={styles.header}>
        <View>
          <AppText variant="footnote" tone="secondary">
            Quick coordination
          </AppText>
          <AppText variant="title3">Glove-first action tray</AppText>
        </View>
        <View style={styles.headerActions}>
          <Pressable onPress={onOpenComms} style={[styles.linkButton, { borderColor: theme.colors.lineSubtle }]}>
            <MaterialCommunityIcons color={theme.colors.textPrimary} name="message-text-outline" size={18} />
            <AppText variant="footnote">Comms</AppText>
            {unreadCount > 0 ? <Chip label={`${unreadCount}`} tone="accent" /> : null}
          </Pressable>
          <Pressable onPress={onOpenSos} style={[styles.sosButton, { backgroundColor: theme.colors.danger }]}>
            <MaterialCommunityIcons color={theme.colors.textInverse} name="alert-octagon" size={18} />
            <AppText style={{ color: theme.colors.textInverse }} variant="footnote">
              SOS
            </AppText>
          </Pressable>
        </View>
      </View>

      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.actionsRow}>
        {pingOptions.map((ping) => (
          <Pressable
            key={ping.type}
            onPress={() => onPing(ping.type)}
            style={({ pressed }) => [
              styles.pingButton,
              {
                backgroundColor:
                  ping.tone === "danger"
                    ? theme.state.danger.fill
                    : ping.tone === "warning"
                      ? theme.state.warning.fill
                      : ping.tone === "success"
                        ? theme.state.success.fill
                        : ping.tone === "accent"
                          ? theme.colors.accentMuted
                          : theme.colors.surfaceMuted,
                borderColor:
                  ping.tone === "danger"
                    ? theme.state.danger.border
                    : ping.tone === "warning"
                      ? theme.state.warning.border
                      : ping.tone === "success"
                        ? theme.state.success.border
                        : ping.tone === "accent"
                          ? theme.colors.focusRing
                          : theme.colors.lineSubtle,
                opacity: pressed ? 0.82 : 1
              }
            ]}
          >
            <MaterialCommunityIcons
              color={
                ping.tone === "danger"
                  ? theme.colors.danger
                  : ping.tone === "warning"
                    ? theme.colors.warning
                    : ping.tone === "success"
                      ? theme.colors.success
                      : ping.tone === "accent"
                        ? theme.colors.accent
                        : theme.colors.textPrimary
              }
              name={ping.icon}
              size={18}
            />
            <AppText variant="footnote">{ping.shortLabel}</AppText>
          </Pressable>
        ))}
      </ScrollView>
    </Surface>
  );
}

const styles = StyleSheet.create({
  card: {
    padding: 14,
    gap: 12
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    gap: 12
  },
  headerActions: {
    flexDirection: "row",
    gap: 8
  },
  linkButton: {
    minHeight: 44,
    borderRadius: 16,
    borderWidth: 1,
    paddingHorizontal: 12,
    flexDirection: "row",
    alignItems: "center",
    gap: 8
  },
  sosButton: {
    minHeight: 44,
    borderRadius: 16,
    paddingHorizontal: 14,
    flexDirection: "row",
    alignItems: "center",
    gap: 8
  },
  actionsRow: {
    gap: 10,
    paddingRight: 8
  },
  pingButton: {
    minWidth: 108,
    minHeight: 74,
    borderRadius: 20,
    borderWidth: 1,
    paddingHorizontal: 14,
    paddingVertical: 12,
    justifyContent: "space-between"
  }
});
