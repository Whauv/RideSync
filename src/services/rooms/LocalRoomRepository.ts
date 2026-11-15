import AsyncStorage from "@react-native-async-storage/async-storage";

import { RideRoomSnapshot } from "@/types/domain";

import { PersistedRooms, RoomRepository } from "./RoomRepository";

const ROOM_STORAGE_KEY = "ridesync-local-room-workflow";

/**
 * AsyncStorage-backed room repository.
 *
 * This is the local, offline-first simulation that drives the web-first product
 * today. It preserves the exact storage key and document shape used before the
 * repository seam was introduced, so persisted data remains compatible.
 */
export class LocalRoomRepository implements RoomRepository {
  private async read(): Promise<PersistedRooms> {
    const raw = await AsyncStorage.getItem(ROOM_STORAGE_KEY);
    if (!raw) {
      return { rooms: [] };
    }

    return JSON.parse(raw) as PersistedRooms;
  }

  private async write(store: PersistedRooms): Promise<void> {
    await AsyncStorage.setItem(ROOM_STORAGE_KEY, JSON.stringify(store));
  }

  async listRooms(): Promise<RideRoomSnapshot[]> {
    const store = await this.read();
    return store.rooms;
  }

  async getRoom(roomId: string): Promise<RideRoomSnapshot | null> {
    const store = await this.read();
    return store.rooms.find((snapshot) => snapshot.room.id === roomId) ?? null;
  }

  async getRoomByCode(code: string): Promise<RideRoomSnapshot | null> {
    const store = await this.read();
    return store.rooms.find((snapshot) => snapshot.room.code === code) ?? null;
  }

  async saveRoom(snapshot: RideRoomSnapshot): Promise<void> {
    const store = await this.read();
    const index = store.rooms.findIndex((item) => item.room.id === snapshot.room.id);

    if (index >= 0) {
      store.rooms[index] = snapshot;
    } else {
      store.rooms = [snapshot, ...store.rooms];
    }

    await this.write(store);
  }
}
