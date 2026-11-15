import { RideRoomSnapshot } from "@/types/domain";

/**
 * Shape persisted by a room repository. Kept exported so adapters and tests can
 * reason about the stored document without reaching into an implementation.
 */
export interface PersistedRooms {
  rooms: RideRoomSnapshot[];
}

/**
 * Persistence boundary for ride rooms.
 *
 * The room workflow (orchestration) depends only on this interface, so the
 * backing store can move from local AsyncStorage to a real backend (Firestore)
 * without touching any call sites. Implementations are responsible purely for
 * storage; all domain shaping lives in `roomTransforms.ts`.
 */
export interface RoomRepository {
  /** Returns every stored room snapshot, newest-stored first. */
  listRooms(): Promise<RideRoomSnapshot[]>;
  /** Returns a single room by its id, or null when it does not exist. */
  getRoom(roomId: string): Promise<RideRoomSnapshot | null>;
  /** Returns a single room by its invite code, or null when none matches. */
  getRoomByCode(code: string): Promise<RideRoomSnapshot | null>;
  /**
   * Inserts or replaces a room snapshot. Existing rooms are replaced in place
   * (preserving order); new rooms are prepended.
   */
  saveRoom(snapshot: RideRoomSnapshot): Promise<void>;
}
