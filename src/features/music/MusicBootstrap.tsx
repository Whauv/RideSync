import { PropsWithChildren, useEffect, useMemo } from "react";

import { musicSyncAdapter } from "@/services/musicSync";
import { useAppStore } from "@/store/useAppStore";

export function MusicBootstrap({ children }: PropsWithChildren) {
  const authIdentity = useAppStore((state) => state.authIdentity);
  const activeRoom = useAppStore((state) => state.activeRoom);
  const roomMembers = useAppStore((state) => state.roomMembers);
  const setMusicSyncSnapshot = useAppStore((state) => state.setMusicSyncSnapshot);
  const resetMusicSync = useAppStore((state) => state.resetMusicSync);

  const currentMember = useMemo(
    () => roomMembers.find((member) => member.userId === authIdentity?.uid) ?? null,
    [authIdentity?.uid, roomMembers]
  );

  const leaderMember = useMemo(() => roomMembers.find((member) => member.role === "leader") ?? null, [roomMembers]);

  useEffect(() => {
    const unsubscribe = musicSyncAdapter.subscribe((snapshot) => {
      setMusicSyncSnapshot(snapshot);
    });

    return unsubscribe;
  }, [setMusicSyncSnapshot]);

  useEffect(() => {
    if (!activeRoom || !authIdentity || !currentMember || !leaderMember) {
      musicSyncAdapter.unbindRoom();
      resetMusicSync();
      return;
    }

    musicSyncAdapter.bindRoom({
      roomId: activeRoom.id,
      leaderUserId: leaderMember.userId,
      localUserId: authIdentity.uid,
      canControl: currentMember.role === "leader"
    });
  }, [activeRoom?.id, authIdentity?.uid, currentMember, leaderMember, resetMusicSync]);

  return children;
}
