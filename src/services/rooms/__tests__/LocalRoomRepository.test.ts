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

import { LocalRoomRepository } from "@/services/rooms/LocalRoomRepository";
import { RideRoomSnapshot } from "@/types/domain";

function buildSnapshot(id: string, code: string): RideRoomSnapshot {
  return {
    room: {
      id,
      code,
      title: `Room ${id}`,
      leaderId: `${id}-leader`,
      privacyMode: "invite_only",
      maxRiders: 6,
      locked: false,
      lifecycle: "lobby",
      inviteLink: `https://example.com/join?code=${code}`,
      createdAt: new Date().toISOString(),
      riderCount: 1,
      voiceProvider: "livekit",
      musicTrack: "Northern Pass"
    },
    members: [],
    riders: [],
    layers: [],
    messages: [],
    activeAlert: null,
    ridePlan: null,
    safety: null
  } as unknown as RideRoomSnapshot;
}

describe("LocalRoomRepository", () => {
  beforeEach(() => {
    mockStorage.clear();
  });

  test("returns null for a missing room and empty list when unstored", async () => {
    const repo = new LocalRoomRepository();
    expect(await repo.getRoom("missing")).toBeNull();
    expect(await repo.getRoomByCode("NOPE")).toBeNull();
    expect(await repo.listRooms()).toEqual([]);
  });

  test("prepends new rooms and looks them up by id and code", async () => {
    const repo = new LocalRoomRepository();
    await repo.saveRoom(buildSnapshot("room-a", "AAAAA"));
    await repo.saveRoom(buildSnapshot("room-b", "BBBBB"));

    const rooms = await repo.listRooms();
    expect(rooms.map((snapshot) => snapshot.room.id)).toEqual(["room-b", "room-a"]);
    expect((await repo.getRoom("room-a"))?.room.code).toBe("AAAAA");
    expect((await repo.getRoomByCode("BBBBB"))?.room.id).toBe("room-b");
  });

  test("replaces an existing room in place without reordering", async () => {
    const repo = new LocalRoomRepository();
    await repo.saveRoom(buildSnapshot("room-a", "AAAAA"));
    await repo.saveRoom(buildSnapshot("room-b", "BBBBB"));

    const updated = buildSnapshot("room-a", "AAAAA");
    updated.room.title = "Updated A";
    await repo.saveRoom(updated);

    const rooms = await repo.listRooms();
    expect(rooms.map((snapshot) => snapshot.room.id)).toEqual(["room-b", "room-a"]);
    expect((await repo.getRoom("room-a"))?.room.title).toBe("Updated A");
  });
});
