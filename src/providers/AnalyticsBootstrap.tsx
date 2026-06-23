import { PropsWithChildren, useEffect } from "react";

import { setAnalyticsContext, startAnalyticsSession } from "@/services/analytics";
import { useAppStore } from "@/store/useAppStore";

export function AnalyticsBootstrap({ children }: PropsWithChildren) {
  const authIdentity = useAppStore((state) => state.authIdentity);
  const activeRoom = useAppStore((state) => state.activeRoom);
  const reliability = useAppStore((state) => state.reliability);

  useEffect(() => {
    startAnalyticsSession();
  }, []);

  useEffect(() => {
    setAnalyticsContext({
      userId: authIdentity?.uid ?? null,
      roomId: activeRoom?.id ?? null,
      rideSessionId: activeRoom?.startedAt ?? null,
      networkType:
        reliability.connectivity === "offline"
          ? "offline"
          : reliability.connectivity === "unstable"
            ? "cellular"
            : "wifi"
    });
  }, [activeRoom?.id, activeRoom?.startedAt, authIdentity?.uid, reliability.connectivity]);

  return children;
}
