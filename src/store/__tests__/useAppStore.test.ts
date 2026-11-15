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

import { useAppStore } from "@/store/useAppStore";
import { RideMessage, RideRoomSnapshot } from "@/types/domain";

function buildSnapshot(): RideRoomSnapshot {
  return {
    room: {
      id: "room-1",
      code: "ABC12",
      title: "Front Range Run",
      leaderId: "member-leader",
      privacyMode: "invite_only",
      maxRiders: 6,
      locked: false,
      lifecycle: "lobby",
      inviteLink: "https://example.com/join?code=ABC12",
      createdAt: new Date().toISOString(),
      riderCount: 1,
      voiceProvider: "livekit",
      musicTrack: "Northern Pass"
    },
    members: [{ id: "member-leader", riderName: "Leader" }],
    riders: [{ id: "member-leader", name: "Leader" }],
    layers: [{ id: "layer-1" }],
    messages: [{ id: "message-1", body: "Leader opened the room." }],
    activeAlert: null,
    ridePlan: { id: "plan-1" },
    safety: { hazards: [] }
  } as unknown as RideRoomSnapshot;
}

describe("useAppStore room session", () => {
  beforeEach(() => {
    useAppStore.getState().clearRoomSession();
    useAppStore.getState().signOutLocal();
  });

  test("setRoomSession loads a snapshot object into state", () => {
    const snapshot = buildSnapshot();
    useAppStore.getState().setRoomSession(snapshot);

    const state = useAppStore.getState();
    expect(state.activeRoom?.id).toBe("room-1");
    expect(state.roomMembers).toHaveLength(1);
    expect(state.rideLayers).toHaveLength(1);
    expect(state.lastActiveRoomId).toBe("room-1");
    expect(state.reliability.recoveryState).toBe("restored");
  });

  test("postMessage prepends to the message list", () => {
    useAppStore.getState().setRoomSession(buildSnapshot());
    const message = { id: "message-2", body: "New ping" } as unknown as RideMessage;
    useAppStore.getState().postMessage(message);

    expect(useAppStore.getState().messages[0]?.id).toBe("message-2");
  });

  test("signOutLocal clears identity and the active room across slices", () => {
    useAppStore.getState().setAuthIdentity({ uid: "user-1", email: "rider@example.com" });
    useAppStore.getState().setRoomSession(buildSnapshot());

    useAppStore.getState().signOutLocal();

    const state = useAppStore.getState();
    expect(state.authIdentity).toBeNull();
    expect(state.activeRoom).toBeNull();
    expect(state.lastActiveRoomId).toBeNull();
    expect(state.messages).toEqual([]);
  });
});
