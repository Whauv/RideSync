import { useEffect, useState } from "react";

import { buildCrashDetectionPlaceholder } from "@/services/safety";
import { CrashDetectionSnapshot } from "@/types/domain";

interface UseExperimentalCrashDetectionOptions {
  enabled: boolean;
}

export function useExperimentalCrashDetection({ enabled }: UseExperimentalCrashDetectionOptions) {
  const [snapshot, setSnapshot] = useState<CrashDetectionSnapshot>(() =>
    buildCrashDetectionPlaceholder({
      enabled,
      availability: "unsupported",
      note:
        "Experimental only. This build exposes the crash-detection hook and review surface, but does not dispatch automated crash calls or alerts."
    })
  );

  useEffect(() => {
    if (!enabled) {
      setSnapshot((current) =>
        buildCrashDetectionPlaceholder({
          ...current,
          enabled: false,
          availability: current.availability === "ready" ? "ready" : "unsupported",
          lastEvent: "Monitoring paused",
          note:
            "Experimental only. Monitoring is off until the rider explicitly enables it, and no autonomous emergency dispatch is performed."
        })
      );
      return;
    }

    setSnapshot((current) =>
      buildCrashDetectionPlaceholder({
        ...current,
        enabled: true,
        availability: "unsupported",
        lastSampleAt: new Date().toISOString(),
        lastMotionScore: 0.12,
        lastEvent: "Sensor adapter placeholder active",
        note:
          "Experimental only. Sensor heuristics are staged for a future expo-sensors adapter and validated false-positive tuning."
      })
    );
  }, [enabled]);

  return snapshot;
}
