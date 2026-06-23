import { PropsWithChildren, useEffect, useMemo, useRef } from "react";
import { AppState } from "react-native";

import { trackEvent } from "@/services/analytics";
import { recordDiagnosticEvent } from "@/services/diagnostics";
import { getRideRoomSnapshot } from "@/services/roomWorkflow";
import { useAppStore } from "@/store/useAppStore";

export function ResilienceBootstrap({ children }: PropsWithChildren) {
  const authIdentity = useAppStore((state) => state.authIdentity);
  const activeRoom = useAppStore((state) => state.activeRoom);
  const lastActiveRoomId = useAppStore((state) => state.lastActiveRoomId);
  const roomPresenceState = useAppStore((state) => state.roomPresenceState);
  const riders = useAppStore((state) => state.riders);
  const setRoomSession = useAppStore((state) => state.setRoomSession);
  const setConnectivityState = useAppStore((state) => state.setConnectivityState);
  const setRecoveryState = useAppStore((state) => state.setRecoveryState);
  const markRoomSynced = useAppStore((state) => state.markRoomSynced);

  const latestLocationAt = useMemo(() => {
    if (riders.length === 0) {
      return null;
    }

    return riders.reduce((latest, rider) => (rider.lastUpdatedAt > latest ? rider.lastUpdatedAt : latest), riders[0]?.lastUpdatedAt ?? "");
  }, [riders]);
  const staleLocationSeconds = useMemo(() => {
    if (!latestLocationAt) {
      return 0;
    }

    return Math.max(0, Math.round((Date.now() - new Date(latestLocationAt).getTime()) / 1000));
  }, [latestLocationAt]);

  const restoringRef = useRef(false);
  const previousConnectivityRef = useRef<"online" | "unstable" | "offline">("online");

  useEffect(() => {
    async function restoreRoom(reason: "boot" | "foreground") {
      if (restoringRef.current || !authIdentity || !lastActiveRoomId || activeRoom) {
        return;
      }

      restoringRef.current = true;
      setRecoveryState("recovering", { lastRecoveryError: null });

      try {
        const snapshot = await getRideRoomSnapshot(lastActiveRoomId);
        if (snapshot) {
          setRoomSession(
            snapshot.room,
            snapshot.members,
            snapshot.riders,
            snapshot.layers,
            snapshot.messages,
            snapshot.activeAlert,
            snapshot.ridePlan,
            snapshot.safety
          );
          markRoomSynced();
          setRecoveryState("restored", { lastRecoveryAt: new Date().toISOString(), lastRecoveryError: null });
          await recordDiagnosticEvent({
            category: "recovery",
            level: "info",
            title: "Room restored",
            detail: `Recovered room ${snapshot.room.title} during ${reason}.`,
            context: {
              roomId: snapshot.room.id,
              reason
            }
          });
        } else {
          setRecoveryState("failed", {
            lastRecoveryAt: new Date().toISOString(),
            lastRecoveryError: "No stored room snapshot was available."
          });
        }
      } catch (error) {
        const detail = error instanceof Error ? error.message : "Room recovery failed.";
        setRecoveryState("failed", {
          lastRecoveryAt: new Date().toISOString(),
          lastRecoveryError: detail
        });
        await recordDiagnosticEvent({
          category: "recovery",
          level: "error",
          title: "Room recovery failed",
          detail,
          context: {
            roomId: lastActiveRoomId,
            reason
          }
        });
      } finally {
        restoringRef.current = false;
      }
    }

    void restoreRoom("boot");

    const subscription = AppState.addEventListener("change", (state) => {
      if (state === "active") {
        void restoreRoom("foreground");
      }
    });

    return () => subscription.remove();
  }, [activeRoom, authIdentity, lastActiveRoomId, markRoomSynced, setRecoveryState, setRoomSession]);

  useEffect(() => {
    if (!activeRoom) {
      setConnectivityState("online");
      return;
    }

    const staleSeconds = latestLocationAt ? (Date.now() - new Date(latestLocationAt).getTime()) / 1000 : 0;
    if (roomPresenceState === "offline" || staleSeconds >= 35) {
      setConnectivityState("offline");
      if (activeRoom && previousConnectivityRef.current !== "offline") {
        void trackEvent("rider_marked_stale", {
          stale_seconds: Math.round(staleSeconds),
          role: "rider"
        });
      }
      previousConnectivityRef.current = "offline";
      return;
    }

    if (roomPresenceState !== "connected" || staleSeconds >= 18) {
      setConnectivityState("unstable");
      if (activeRoom && previousConnectivityRef.current === "online") {
        void trackEvent("location_stream_degraded", {
          reason: roomPresenceState !== "connected" ? "presence_degraded" : "stale_location"
        });
      }
      previousConnectivityRef.current = "unstable";
      return;
    }

    setConnectivityState("online");
    markRoomSynced();
    if (activeRoom && previousConnectivityRef.current !== "online" && staleLocationSeconds > 0) {
      void trackEvent("rider_recovered_from_stale", {
        stale_seconds: staleLocationSeconds
      });
      void trackEvent("location_stream_recovered", {
        reason: "fresh_location"
      });
    }
    previousConnectivityRef.current = "online";
  }, [activeRoom, latestLocationAt, markRoomSynced, roomPresenceState, setConnectivityState, staleLocationSeconds]);

  return children;
}
