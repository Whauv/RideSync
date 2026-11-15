import { RideRoomSnapshot } from "@/types/domain";

import { PersistedRooms, RoomRepository } from "./RoomRepository";

/**
 * Firestore-backed room repository (not yet wired for live traffic).
 *
 * This adapter exists to prove the `RoomRepository` seam fits a real backend:
 * it type-checks against the same interface the local repository implements, so
 * completing it is a matter of filling in the Firestore reads/writes and
 * enabling it in `index.ts` — no workflow or UI call site has to change.
 *
 * Expected Firestore layout once implemented:
 *   rooms/{roomId} -> RideRoomSnapshot
 * with a `room.code` field indexed for invite-code lookups.
 */
export class FirestoreRoomRepository implements RoomRepository {
  private unavailable(operation: string): never {
    throw new Error(
      `FirestoreRoomRepository.${operation} is not implemented yet. ` +
        "Enable it in src/services/rooms/index.ts once the Firestore reads/writes are complete."
    );
  }

  // The stored shape is identical to the local repository, so a future
  // implementation can serialize snapshots straight into `rooms/{roomId}`.
  protected toDocument(snapshot: RideRoomSnapshot): PersistedRooms["rooms"][number] {
    return snapshot;
  }

  async listRooms(): Promise<RideRoomSnapshot[]> {
    return this.unavailable("listRooms");
  }

  async getRoom(_roomId: string): Promise<RideRoomSnapshot | null> {
    return this.unavailable("getRoom");
  }

  async getRoomByCode(_code: string): Promise<RideRoomSnapshot | null> {
    return this.unavailable("getRoomByCode");
  }

  async saveRoom(_snapshot: RideRoomSnapshot): Promise<void> {
    return this.unavailable("saveRoom");
  }
}
