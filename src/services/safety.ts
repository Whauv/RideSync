import {
  CrashDetectionSnapshot,
  FuelAlert,
  FuelAlertLevel,
  HazardReport,
  RideEventLog,
  RideInsightsSnapshot,
  RideMessage,
  RideRoomSnapshot,
  RiderPresence,
  RoomMember,
  SafetySnapshot,
  StragglerAlert
} from "@/types/domain";

function toRadians(value: number) {
  return (value * Math.PI) / 180;
}

function nowIso() {
  return new Date().toISOString();
}

export function haversineMiles(a: { lat: number; lng: number }, b: { lat: number; lng: number }) {
  const earthRadiusMiles = 3958.8;
  const deltaLat = toRadians(b.lat - a.lat);
  const deltaLng = toRadians(b.lng - a.lng);
  const lat1 = toRadians(a.lat);
  const lat2 = toRadians(b.lat);

  const h =
    Math.sin(deltaLat / 2) * Math.sin(deltaLat / 2) +
    Math.cos(lat1) * Math.cos(lat2) * Math.sin(deltaLng / 2) * Math.sin(deltaLng / 2);

  return earthRadiusMiles * (2 * Math.atan2(Math.sqrt(h), Math.sqrt(1 - h)));
}

function deriveStragglers(riders: RiderPresence[]): StragglerAlert[] {
  const leader = riders.find((rider) => rider.role === "leader") ?? riders[0];
  if (!leader) {
    return [];
  }

  const now = Date.now();

  return riders
    .filter((rider) => rider.id !== leader.id)
    .map((rider) => {
      const distanceMiles = haversineMiles(leader, rider);
      const staleSeconds = Math.max(0, Math.round((now - new Date(rider.lastUpdatedAt).getTime()) / 1000));
      const severity = distanceMiles >= 0.9 || staleSeconds >= 40 ? "assist" : distanceMiles >= 0.45 || staleSeconds >= 20 ? "monitor" : null;

      if (!severity) {
        return null;
      }

      return {
        riderId: rider.id,
        riderName: rider.name,
        distanceMiles,
        staleSeconds,
        severity,
        detail:
          severity === "assist"
            ? "Gap is outside the conservative ride pack threshold."
            : "Rider is drifting beyond the normal formation window."
      } satisfies StragglerAlert;
    })
    .filter((alert): alert is StragglerAlert => Boolean(alert))
    .sort((left, right) => right.distanceMiles - left.distanceMiles);
}

function memberFuelCandidates(members: RoomMember[]) {
  return members
    .filter((member) => typeof member.fuelRangeMiles === "number")
    .map((member) => ({
      riderId: member.id,
      riderName: member.riderName,
      rangeMiles: member.fuelRangeMiles ?? 0
    }));
}

function riderFuelCandidates(riders: RiderPresence[]) {
  return riders
    .filter((rider) => typeof rider.fuelRangeMiles === "number")
    .map((rider) => ({
      riderId: rider.id,
      riderName: rider.name,
      rangeMiles: rider.fuelRangeMiles ?? 0
    }));
}

function deriveFuelLevel(rangeMiles: number): FuelAlertLevel | null {
  if (rangeMiles <= 20) {
    return "critical";
  }

  if (rangeMiles <= 35) {
    return "low";
  }

  return null;
}

function deriveFuelAlerts(riders: RiderPresence[], members: RoomMember[]): FuelAlert[] {
  const timestamp = nowIso();
  const candidates = riders.length > 0 ? riderFuelCandidates(riders) : memberFuelCandidates(members);

  return candidates
    .map((candidate) => {
      const level = deriveFuelLevel(candidate.rangeMiles);
      if (!level) {
        return null;
      }

      return {
        riderId: candidate.riderId,
        riderName: candidate.riderName,
        level,
        rangeMiles: candidate.rangeMiles,
        createdAt: timestamp
      } satisfies FuelAlert;
    })
    .filter((alert): alert is FuelAlert => Boolean(alert))
    .sort((left, right) => left.rangeMiles - right.rangeMiles);
}

function deriveDistanceMiles(snapshot: RideRoomSnapshot) {
  const leader = snapshot.riders.find((rider) => rider.role === "leader") ?? snapshot.riders[0];
  if (!leader || snapshot.layers.length === 0) {
    return snapshot.ridePlan?.distanceMiles ?? 0;
  }

  const routePoints = [
    { lat: leader.lat, lng: leader.lng },
    ...snapshot.layers
      .filter((layer) => layer.type !== "emergency")
      .map((layer) => ({ lat: layer.lat, lng: layer.lng }))
  ];

  return Number(
    routePoints
      .slice(1)
      .reduce((sum, point, index) => sum + haversineMiles(routePoints[index], point), 0)
      .toFixed(1)
  );
}

function buildEventLog(snapshot: RideRoomSnapshot, fuelAlerts: FuelAlert[], hazards: HazardReport[]): RideEventLog[] {
  const messageEvents = snapshot.messages.slice(0, 8).map((message) => ({
    id: `event-message-${message.id}`,
    type:
      message.kind === "sos"
        ? "sos"
        : message.kind === "ping"
          ? "ping"
          : message.body.toLowerCase().includes("hazard")
            ? "hazard_reported"
            : "system",
    createdAt: message.createdAt,
    actorName: message.senderName,
    detail: message.body,
    replayLabel: `${message.senderName} | ${message.body}`
  })) satisfies RideEventLog[];

  const hazardEvents = hazards.slice(0, 4).map((hazard) => ({
    id: `event-hazard-${hazard.id}`,
    type: hazard.status === "confirmed" ? "hazard_confirmed" : "hazard_reported",
    createdAt: hazard.confirmedAt ?? hazard.createdAt,
    actorName: hazard.reporterName,
    detail: `${hazard.title} (${hazard.status})`,
    replayLabel: `${hazard.title} | ${hazard.confirmationNames.length} confirmations`
  })) satisfies RideEventLog[];

  const fuelEvents = fuelAlerts.slice(0, 4).map((alert) => ({
    id: `event-fuel-${alert.riderId}`,
    type: "fuel_low",
    createdAt: alert.createdAt,
    actorName: alert.riderName,
    detail: `${alert.rangeMiles} mi remaining`,
    replayLabel: `${alert.riderName} fuel ${alert.level}`
  })) satisfies RideEventLog[];

  const roomEvent =
    snapshot.room.startedAt || snapshot.room.createdAt
      ? [
          {
            id: `event-room-${snapshot.room.id}`,
            type: snapshot.room.startedAt ? "room_started" : "room_created",
            createdAt: snapshot.room.startedAt ?? snapshot.room.createdAt,
            actorName: "RideSync",
            detail: snapshot.room.startedAt ? "Ride moved into live tracking." : "Room staged and ready.",
            replayLabel: snapshot.room.title
          } satisfies RideEventLog
        ]
      : [];

  return [...roomEvent, ...hazardEvents, ...fuelEvents, ...messageEvents]
    .sort((left, right) => right.createdAt.localeCompare(left.createdAt))
    .slice(0, 16);
}

function deriveInsights(snapshot: RideRoomSnapshot, fuelAlerts: FuelAlert[], hazards: HazardReport[]): RideInsightsSnapshot {
  const movingRiders = snapshot.riders.filter((rider) => rider.speedMph > 2);
  const averageSpeedMph =
    movingRiders.length > 0
      ? Math.round(movingRiders.reduce((sum, rider) => sum + rider.speedMph, 0) / movingRiders.length)
      : 0;

  return {
    averageSpeedMph,
    stopCount: Math.max(snapshot.layers.filter((layer) => layer.type === "fuel" || layer.type === "regroup").length - 1, 0),
    distanceMiles: deriveDistanceMiles(snapshot),
    eventLog: buildEventLog(snapshot, fuelAlerts, hazards)
  };
}

export function buildCrashDetectionPlaceholder(
  current?: Partial<CrashDetectionSnapshot>
): CrashDetectionSnapshot {
  return {
    experimental: true,
    enabled: current?.enabled ?? false,
    availability: current?.availability ?? "unavailable",
    note:
      current?.note ??
      "Experimental only. Motion sensor heuristics are placeholder scaffolding until expo-sensors and validated crash models are integrated.",
    lastSampleAt: current?.lastSampleAt,
    lastMotionScore: current?.lastMotionScore,
    lastEvent: current?.lastEvent
  };
}

export function buildSafetySnapshot(snapshot: RideRoomSnapshot, current?: SafetySnapshot): SafetySnapshot {
  const hazards = current?.hazards ?? [];
  const stragglers = deriveStragglers(snapshot.riders);
  const fuelAlerts = deriveFuelAlerts(snapshot.riders, snapshot.members);

  return {
    stragglers,
    hazards,
    fuelAlerts,
    crashDetection: buildCrashDetectionPlaceholder(current?.crashDetection),
    insights: deriveInsights(snapshot, fuelAlerts, hazards)
  };
}

export function getLatestHazardSummary(hazards: HazardReport[]) {
  const active = hazards.filter((hazard) => hazard.status !== "dismissed");
  return active[0] ?? null;
}

export function applyLeaderDistances(riders: RiderPresence[]) {
  const leader = riders.find((rider) => rider.role === "leader") ?? riders[0];
  if (!leader) {
    return riders;
  }

  return riders.map((rider) => ({
    ...rider,
    distanceFromLeaderMiles: rider.id === leader.id ? 0 : Number(haversineMiles(leader, rider).toFixed(2))
  }));
}

export function summarizeMessageSeverity(message: RideMessage) {
  if (message.kind === "sos" || message.severity === "critical") {
    return "danger";
  }

  if (message.severity === "high") {
    return "warning";
  }

  return "neutral";
}
