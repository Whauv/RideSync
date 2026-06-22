import { useMemo, useState } from "react";
import { StyleSheet, View } from "react-native";
import { useFocusEffect } from "@react-navigation/native";

import { ActiveAlertBanner } from "@/components/coordination/ActiveAlertBanner";
import { MessageBubble } from "@/components/coordination/MessageBubble";
import { QuickActionsTray } from "@/components/coordination/QuickActionsTray";
import { SOSModal } from "@/components/coordination/SOSModal";
import { AppHeader } from "@/components/primitives/AppHeader";
import { AppText } from "@/components/primitives/AppText";
import { Button } from "@/components/primitives/Button";
import { EmptyState } from "@/components/primitives/EmptyState";
import { Screen } from "@/components/primitives/Screen";
import { Surface } from "@/components/primitives/Surface";
import { TextField } from "@/components/primitives/TextField";
import { QUICK_PINGS } from "@/services/coordination";
import { resolveActiveAlert, sendQuickPing, sendRoomMessage, triggerSosAlert } from "@/services/roomWorkflow";
import { useAppStore } from "@/store/useAppStore";

export default function CommsScreen() {
  const authIdentity = useAppStore((state) => state.authIdentity);
  const profile = useAppStore((state) => state.profile);
  const activeRoom = useAppStore((state) => state.activeRoom);
  const messages = useAppStore((state) => state.messages);
  const activeAlert = useAppStore((state) => state.activeAlert);
  const messageReadAtByRoom = useAppStore((state) => state.messageReadAtByRoom);
  const markRoomMessagesRead = useAppStore((state) => state.markRoomMessagesRead);
  const setRoomSession = useAppStore((state) => state.setRoomSession);

  const [draft, setDraft] = useState("");
  const [sosVisible, setSosVisible] = useState(false);
  const [busy, setBusy] = useState(false);

  const roomReadAt = activeRoom ? messageReadAtByRoom[activeRoom.id] ?? null : null;
  const chronologicalMessages = useMemo(() => [...messages].reverse(), [messages]);
  const unreadCount = useMemo(() => {
    if (!activeRoom) {
      return 0;
    }

    return messages.filter((message) => !roomReadAt || message.createdAt > roomReadAt).length;
  }, [activeRoom, messages, roomReadAt]);

  useFocusEffect(() => {
    if (activeRoom) {
      markRoomMessagesRead(activeRoom.id);
    }
  });

  if (!activeRoom || !authIdentity) {
    return (
      <Screen>
        <AppHeader
          eyebrow="COORDINATION"
          subtitle="Room messaging and quick actions become active once you create or join a lobby."
          title="Comms"
        />
        <EmptyState
          body="Create or join a ride room first to unlock the coordination feed."
          icon="radio-handheld"
          title="No room active"
        />
      </Screen>
    );
  }

  const room = activeRoom;
  const identity = authIdentity;

  async function refreshFromSnapshot(
    action: ReturnType<typeof sendRoomMessage> | ReturnType<typeof sendQuickPing> | ReturnType<typeof triggerSosAlert> | ReturnType<typeof resolveActiveAlert>
  ) {
    const snapshot = await action;
    setRoomSession(snapshot.room, snapshot.members, snapshot.riders, snapshot.layers, snapshot.messages, snapshot.activeAlert);
  }

  async function handleSend() {
    if (!draft.trim()) {
      return;
    }

    setBusy(true);

    try {
      await refreshFromSnapshot(sendRoomMessage(room.id, identity, profile, draft));
      setDraft("");
    } finally {
      setBusy(false);
    }
  }

  async function handlePing(type: (typeof QUICK_PINGS)[number]["type"]) {
    await refreshFromSnapshot(sendQuickPing(room.id, identity, profile, type));
  }

  async function handleConfirmSos(countdownSeconds: number) {
    setSosVisible(false);
    await refreshFromSnapshot(triggerSosAlert(room.id, identity, profile, countdownSeconds));
  }

  async function handleResolveAlert() {
    await refreshFromSnapshot(resolveActiveAlert(room.id, identity, profile));
  }

  return (
    <Screen scroll>
      <AppHeader
        eyebrow="COORDINATION"
        subtitle="Fast signals, compact room chat, and unmistakable emergency state when the ride needs clarity now."
        title="Comms"
      />

      {activeAlert?.status === "active" ? <ActiveAlertBanner alert={activeAlert} onResolve={handleResolveAlert} /> : null}

      <QuickActionsTray
        onOpenComms={() => markRoomMessagesRead(room.id)}
        onOpenSos={() => setSosVisible(true)}
        onPing={handlePing}
        pingOptions={QUICK_PINGS}
        unreadCount={unreadCount}
      />

      <Surface style={styles.feed}>
        <View style={styles.feedHeader}>
          <View>
            <AppText variant="title3">Room chat</AppText>
            <AppText tone="secondary" variant="footnote">
              Compact, glove-readable messaging for regroups, context, and confirmation.
            </AppText>
          </View>
          {unreadCount > 0 ? (
            <AppText tone="accent" variant="footnote">
              {unreadCount} unread
            </AppText>
          ) : null}
        </View>

        <View style={styles.messageList}>
          {chronologicalMessages.map((message, index) => {
            const previous = chronologicalMessages[index - 1];
            const showSender = !previous || previous.senderId !== message.senderId || previous.kind !== message.kind;
            const showTimestamp =
              !previous || Math.abs(new Date(message.createdAt).getTime() - new Date(previous.createdAt).getTime()) > 240000;
            const startsUnread = Boolean(roomReadAt && previous && previous.createdAt <= roomReadAt && message.createdAt > roomReadAt);

            return (
              <MessageBubble
                key={message.id}
                isOwn={message.senderId === authIdentity.uid}
                message={message}
                showSender={showSender}
                showTimestamp={showTimestamp || showSender}
                startsUnread={startsUnread}
              />
            );
          })}
        </View>
      </Surface>

      <Surface raised style={styles.composer}>
        <TextField
          label="Message"
          multiline
          onChangeText={setDraft}
          placeholder="Add quick ride context for the room"
          value={draft}
        />
        <Button label="Send message" loading={busy} onPress={handleSend} />
      </Surface>

      <SOSModal onCancel={() => setSosVisible(false)} onConfirm={handleConfirmSos} visible={sosVisible} />
    </Screen>
  );
}

const styles = StyleSheet.create({
  feed: {
    padding: 16,
    gap: 16,
    marginTop: 12
  },
  feedHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    gap: 12
  },
  messageList: {
    gap: 12
  },
  composer: {
    padding: 16,
    gap: 12,
    marginTop: 12,
    marginBottom: 24
  }
});
