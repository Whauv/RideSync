import { buildSafetySnapshot, haversineMiles } from "@/services/safety";
import { RideRoomSnapshot } from "@/types/domain";

function buildSnapshot(overrides?: Partial<RideRoomSnapshot>): RideRoomSnapshot {
  return {
    room: {
      id: "room-1",
      code: "ABCDE",
      title: "Morning Run",
      leaderId: "leader-member",
      privacyMode: "invite_only",
      maxRiders: 8,
      locked: false,
      lifecycle: "rolling",
      inviteLink: "ridesync://join?code=ABCDE",
      createdAt: "2026-06-22T10:00:00.000Z",
      riderCount: 2,
      voiceProvider: "livekit"
    },
    members: [
      {
        id: "leader-member",
        userId: "leader-user",
        riderName: "Leader",
        avatarInitials: "LD",
        bikeName: "Scout",
        role: "leader",
        approvalStatus: "approved",
        readiness: "ready",
        rsvpStatus: "going",
        presenceState: "connected",
        intercomState: "connected",
        fuelRangeMiles: 120,
        joinedAt: "2026-06-22T10:00:00.000Z",
        lastSeenAt: "2026-06-22T10:00:00.000Z"
      },
      {
        id: "rider-member",
        userId: "rider-user",
        riderName: "Rider",
        avatarInitials: "RD",
        bikeName: "Tenere",
        role: "rider",
        approvalStatus: "approved",
        readiness: "ready",
        rsvpStatus: "going",
        presenceState: "connected",
        intercomState: "connected",
        fuelRangeMiles: 18,
        joinedAt: "2026-06-22T10:00:00.000Z",
        lastSeenAt: "2026-06-22T10:00:00.000Z"
      }
    ],
    riders: [
      {
        id: "leader-member",
        name: "Leader",
        role: "leader",
        bike: "Scout",
        speedMph: 58,
        headingDeg: 110,
        status: "rolling",
        isTalking: false,
        hasMusicSync: true,
        batteryPct: 70,
        signalState: "strong",
        lastUpdatedAt: new Date(Date.now() - 2000).toISOString(),
        lat: 39.7392,
        lng: -104.9903,
        fuelRangeMiles: 120
      },
      {
        id: "rider-member",
        name: "Rider",
        role: "rider",
        bike: "Tenere",
        speedMph: 22,
        headingDeg: 110,
        status: "rolling",
        isTalking: false,
        hasMusicSync: true,
        batteryPct: 43,
        signalState: "moderate",
        lastUpdatedAt: new Date(Date.now() - 45000).toISOString(),
        lat: 39.7492,
        lng: -104.9703,
        fuelRangeMiles: 18
      }
    ],
    layers: [
      {
        id: "fuel-stop",
        type: "fuel",
        title: "Fuel stop",
        subtitle: "Planned",
        lat: 39.7592,
        lng: -104.9603
      }
    ],
    messages: [],
    activeAlert: null,
    ridePlan: null,
    safety: {
      stragglers: [],
      hazards: [],
      fuelAlerts: [],
      crashDetection: {
        experimental: true,
        enabled: false,
        availability: "unavailable",
        note: "placeholder"
      },
      insights: {
        averageSpeedMph: 0,
        stopCount: 0,
        distanceMiles: 0,
        eventLog: []
      }
    },
    ...overrides
  };
}

describe("safety service", () => {
  test("calculates haversine distance in miles", () => {
    const distance = haversineMiles({ lat: 39.7392, lng: -104.9903 }, { lat: 39.7492, lng: -104.9703 });
    expect(distance).toBeGreaterThan(1);
    expect(distance).toBeLessThan(2);
  });

  test("derives conservative straggler and fuel alerts", () => {
    const snapshot = buildSnapshot();
    const safety = buildSafetySnapshot(snapshot, snapshot.safety);

    expect(safety.stragglers).toHaveLength(1);
    expect(safety.stragglers[0]?.severity).toBe("assist");
    expect(safety.fuelAlerts).toHaveLength(1);
    expect(safety.fuelAlerts[0]?.level).toBe("critical");
    expect(safety.insights.averageSpeedMph).toBe(40);
  });
});
