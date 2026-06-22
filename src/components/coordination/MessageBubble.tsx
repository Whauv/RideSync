import { StyleSheet, View } from "react-native";

import { AppText } from "@/components/primitives/AppText";
import { useTheme } from "@/design/ThemeProvider";
import { RideMessage } from "@/types/domain";

interface MessageBubbleProps {
  message: RideMessage;
  isOwn: boolean;
  showSender: boolean;
  showTimestamp: boolean;
  startsUnread: boolean;
}

export function MessageBubble({ message, isOwn, showSender, showTimestamp, startsUnread }: MessageBubbleProps) {
  const theme = useTheme();
  const tone =
    message.kind === "sos"
      ? theme.state.danger
      : message.kind === "ping"
        ? message.severity === "critical"
          ? theme.state.danger
          : message.severity === "high"
            ? theme.state.warning
            : theme.state.neutral
        : theme.state.neutral;

  return (
    <View style={styles.wrap}>
      {startsUnread ? (
        <View style={styles.unreadRow}>
          <View style={[styles.line, { backgroundColor: theme.colors.lineSubtle }]} />
          <AppText tone="accent" variant="footnote">
            Unread
          </AppText>
          <View style={[styles.line, { backgroundColor: theme.colors.lineSubtle }]} />
        </View>
      ) : null}

      {showSender ? (
        <View style={[styles.senderRow, isOwn && styles.senderOwn]}>
          <AppText tone="secondary" variant="footnote">
            {isOwn ? "You" : message.senderName}
          </AppText>
          {showTimestamp ? (
            <AppText tone="tertiary" variant="footnote">
              {message.sentAt}
            </AppText>
          ) : null}
        </View>
      ) : null}

      <View
        style={[
          styles.bubble,
          isOwn ? styles.bubbleOwn : styles.bubbleOther,
          {
            backgroundColor:
              message.kind === "message"
                ? isOwn
                  ? theme.colors.accent
                  : theme.colors.surfaceMuted
                : tone.fill,
            borderColor:
              message.kind === "message"
                ? isOwn
                  ? theme.colors.accentPressed
                  : theme.colors.lineSubtle
                : tone.border
          }
        ]}
      >
        <AppText
          style={{
            color: message.kind === "message" && isOwn ? theme.colors.textInverse : theme.colors.textPrimary
          }}
          variant="callout"
        >
          {message.body}
        </AppText>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    gap: 6
  },
  unreadRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    marginVertical: 8
  },
  line: {
    flex: 1,
    height: 1
  },
  senderRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    gap: 10,
    paddingHorizontal: 4
  },
  senderOwn: {
    justifyContent: "flex-end"
  },
  bubble: {
    maxWidth: "86%",
    borderRadius: 22,
    borderWidth: 1,
    paddingHorizontal: 14,
    paddingVertical: 10
  },
  bubbleOwn: {
    alignSelf: "flex-end",
    borderBottomRightRadius: 10
  },
  bubbleOther: {
    alignSelf: "flex-start",
    borderBottomLeftRadius: 10
  }
});
