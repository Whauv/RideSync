import { useEffect, useMemo } from "react";

import { RiderPresence, RiderSignalState } from "@/types/domain";

interface UseSimulatedRideStreamOptions {
  enabled: boolean;
  riders: RiderPresence[];
  onTick: (riders: RiderPresence[]) => void;
  degraded?: boolean;
}

function normalizeHeading(value: number) {
  return (value + 360) % 360;
}

export function useSimulatedRideStream({ enabled, riders, onTick, degraded = false }: UseSimulatedRideStreamOptions) {
  const intervalMs = useMemo(() => {
    const lowBattery = riders.some((rider) => rider.batteryPct <= 30);
    if (degraded) {
      return 6200;
    }

    return lowBattery ? 4200 : 2600;
  }, [degraded, riders]);

  useEffect(() => {
    if (!enabled || riders.length === 0) {
      return;
    }

    const timer = setInterval(() => {
      const timestamp = new Date().toISOString();
      const nextRiders = riders.map((rider, index) => {
        const latOffset = 0.00055 + index * 0.00008;
        const lngOffset = 0.00044 + index * 0.00006;
        const headingShift = index % 2 === 0 ? 4 : -3;
        const signalState: RiderSignalState =
          rider.batteryPct < 28 ? "weak" : index === 0 ? "strong" : rider.signalState === "strong" ? "moderate" : rider.signalState;

        return {
          ...rider,
          headingDeg: normalizeHeading(rider.headingDeg + headingShift),
          speedMph: Math.max(18, rider.speedMph + (index % 2 === 0 ? 1 : -1)),
          lat: rider.lat + latOffset * (index % 2 === 0 ? 1 : -1),
          lng: rider.lng + lngOffset * (index % 3 === 0 ? 1 : -1),
          batteryPct: Math.max(14, rider.batteryPct - 1),
          signalState,
          lastUpdatedAt: timestamp
        };
      });

      onTick(nextRiders);
    }, intervalMs);

    return () => clearInterval(timer);
  }, [enabled, intervalMs, onTick, riders]);
}
