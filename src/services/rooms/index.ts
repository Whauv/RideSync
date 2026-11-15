import { FirestoreRoomRepository } from "./FirestoreRoomRepository";
import { LocalRoomRepository } from "./LocalRoomRepository";
import { RoomRepository } from "./RoomRepository";

/**
 * Selects the active room repository.
 *
 * The local repository is the source of truth today. The Firestore adapter is
 * defined and type-checked against the same interface but is not yet wired for
 * live traffic, so we deliberately keep using the local store. Flipping to
 * Firestore is a single change here once its reads and writes are complete and
 * Firebase is configured (`isFirebaseConfigured` from `@/services/firebase`):
 *
 *   return isFirebaseConfigured ? new FirestoreRoomRepository() : new LocalRoomRepository();
 *
 * The Firebase SDK is intentionally not imported on this path so the local,
 * offline-first workflow never pulls it into its dependency graph.
 */
function selectRoomRepository(): RoomRepository {
  // Reference the adapter so the seam stays honest and the future switch is
  // unmistakable, without routing live traffic to the stub.
  void FirestoreRoomRepository;

  return new LocalRoomRepository();
}

export const roomRepository: RoomRepository = selectRoomRepository();

export type { RoomRepository, PersistedRooms } from "./RoomRepository";
export { LocalRoomRepository } from "./LocalRoomRepository";
export { FirestoreRoomRepository } from "./FirestoreRoomRepository";
export { RoomWorkflowError, isRoomWorkflowError } from "./errors";
export type { RoomWorkflowErrorCode } from "./errors";
