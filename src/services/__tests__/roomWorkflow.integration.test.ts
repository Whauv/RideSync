const mockStorage = new Map<string, string>();

jest.mock("@react-native-async-storage/async-storage", () => ({
  getItem: jest.fn(async (key: string) => mockStorage.get(key) ?? null),
  setItem: jest.fn(async (key: string, value: string) => {
    mockStorage.set(key, value);
  }),
  removeItem: jest.fn(async (key: string) => {
    mockStorage.delete(key);
  })
}));

jest.mock("@/services/coordination", () => {
  const actual = jest.requireActual("@/services/coordination");
  return {
    ...actual,
    sendCoordinationNotification: jest.fn().mockResolvedValue(undefined),
    recordCoordinationAudit: jest.fn().mockResolvedValue(undefined)
  };
});

jest.mock("@/services/analytics", () => ({
  trackEvent: jest.fn().mockResolvedValue(undefined)
}));

jest.mock("@/services/diagnostics", () => ({
  recordDiagnosticEvent: jest.fn().mockResolvedValue(undefined)
}));

jest.mock("@/services/monitoring", () => ({
  startTrace: jest.fn((name: string) => ({ name, startedAt: Date.now() })),
  finishTrace: jest.fn(async () => 25),
  captureError: jest.fn().mockResolvedValue(undefined)
}));

import {
  createRideRoom,
  joinRideRoom,
  sendQuickPing,
  startRideRoom,
  triggerSosAlert
} from "@/services/roomWorkflow";

const leaderIdentity = {
  uid: "leader-user",
  email: "leader@example.com"
};

const riderIdentity = {
  uid: "rider-user",
  email: "rider@example.com"
};

const leaderProfile = {
  riderName: "Leader",
  bikeName: "Scout",
  avatarInitials: "LD",
  emergencyContact: {
    name: "Alex",
    phone: "3035551111"
  },
  preferredUnits: "imperial" as const,
  bikeBrand: "",
  intercomBrand: "",
  medicalProfile: {
    bloodType: "",
    allergies: "",
    conditions: "",
    medications: "",
    notes: "",
    shareWithRideLeaders: true
  }
};

const riderProfile = {
  ...leaderProfile,
  riderName: "Rider",
  bikeName: "Tenere",
  avatarInitials: "RD"
};

describe("room workflow integration", () => {
  beforeEach(() => {
    mockStorage.clear();
  });

  test("creates a room, joins it, and sends a hazard ping", async () => {
    const created = await createRideRoom(
      {
        roomName: "Front Range Dawn Run",
        privacyMode: "invite_only",
        routeTitle: "Nederland Loop",
        maxRiders: 6
      },
      leaderIdentity,
      leaderProfile
    );

    const joined = await joinRideRoom(
      {
        value: created.room.code
      },
      riderIdentity,
      riderProfile
    );

    const pinged = await sendQuickPing(joined.room.id, riderIdentity, riderProfile, "hazard");

    expect(created.room.title).toBe("Front Range Dawn Run");
    expect(joined.members.some((member) => member.userId === riderIdentity.uid)).toBe(true);
    expect(pinged.messages[0]?.kind).toBe("ping");
    expect(pinged.messages[0]?.pingType).toBe("hazard");
  });

  test("starts a ride and activates SOS", async () => {
    const created = await createRideRoom(
      {
        roomName: "Foothills Run",
        privacyMode: "invite_only",
        maxRiders: 6
      },
      leaderIdentity,
      leaderProfile
    );

    const rolling = await startRideRoom(created.room.id);
    const sos = await triggerSosAlert(rolling.room.id, leaderIdentity, leaderProfile, 5);

    expect(rolling.room.lifecycle).toBe("rolling");
    expect(rolling.riders.length).toBeGreaterThan(0);
    expect(sos.activeAlert?.kind).toBe("sos");
    expect(sos.messages[0]?.kind).toBe("sos");
  });
});
