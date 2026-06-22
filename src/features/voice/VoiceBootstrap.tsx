import { PropsWithChildren, useEffect, useMemo } from "react";
import { AppState } from "react-native";

import { voiceAdapter } from "@/services/voice";
import { useAppStore } from "@/store/useAppStore";
import { VoiceParticipantState } from "@/types/voice";

function indexParticipants(participants: VoiceParticipantState[]) {
  return participants.reduce<Record<string, VoiceParticipantState>>((accumulator, participant) => {
    accumulator[participant.memberId] = participant;
    return accumulator;
  }, {});
}

export function VoiceBootstrap({ children }: PropsWithChildren) {
  const authIdentity = useAppStore((state) => state.authIdentity);
  const permissions = useAppStore((state) => state.permissions);
  const activeRoom = useAppStore((state) => state.activeRoom);
  const roomMembers = useAppStore((state) => state.roomMembers);
  const roomPresenceState = useAppStore((state) => state.roomPresenceState);
  const setVoiceSnapshot = useAppStore((state) => state.setVoiceSnapshot);
  const resetVoiceState = useAppStore((state) => state.resetVoiceState);

  const approvedCurrentMember = useMemo(
    () =>
      roomMembers.find((member) => member.userId === authIdentity?.uid && member.approvalStatus === "approved") ?? null,
    [authIdentity?.uid, roomMembers]
  );

  const voiceRoster = useMemo(
    () =>
      roomMembers
        .filter((member) => member.approvalStatus === "approved")
        .map((member) => ({
          memberId: member.id,
          userId: member.userId,
          riderName: member.riderName,
          role: member.role,
          connected: member.presenceState === "connected" && member.intercomState === "connected"
        })),
    [roomMembers]
  );

  useEffect(() => {
    const unsubscribe = voiceAdapter.subscribe((snapshot, participants) => {
      setVoiceSnapshot(snapshot, indexParticipants(participants));
    });

    return unsubscribe;
  }, [setVoiceSnapshot]);

  useEffect(() => {
    if (!activeRoom || !authIdentity || !approvedCurrentMember) {
      void voiceAdapter.disconnect();
      resetVoiceState();
      return;
    }

    if (permissions.microphone !== "granted" || permissions.audio !== "granted") {
      void voiceAdapter.disconnect();
      resetVoiceState();
      return;
    }

    voiceAdapter.syncRoster(voiceRoster);
    void voiceAdapter.connect({
      provider: activeRoom.voiceProvider,
      roomId: activeRoom.id,
      roomCode: activeRoom.code,
      currentUserId: authIdentity.uid
    });

    return () => {
      void voiceAdapter.disconnect();
    };
  }, [
    activeRoom?.code,
    activeRoom?.id,
    activeRoom?.voiceProvider,
    approvedCurrentMember?.id,
    authIdentity?.uid,
    permissions.audio,
    permissions.microphone,
    resetVoiceState
  ]);

  useEffect(() => {
    voiceAdapter.syncRoster(voiceRoster);
  }, [voiceRoster]);

  useEffect(() => {
    voiceAdapter.setDegradedNetwork(roomPresenceState !== "connected");
  }, [roomPresenceState]);

  useEffect(() => {
    const subscription = AppState.addEventListener("change", (state) => {
      voiceAdapter.setAppState(state);
    });

    return () => subscription.remove();
  }, []);

  return children;
}
