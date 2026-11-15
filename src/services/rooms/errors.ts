export type RoomWorkflowErrorCode =
  | "invalid_code"
  | "room_not_found"
  | "room_locked"
  | "room_full"
  | "empty_message"
  | "plan_unavailable";

/**
 * A typed failure raised by the room workflow layer.
 *
 * Carrying a stable `code` lets the UI render consistent, localized error and
 * retry states (see Phase 5) without string-matching on `message`. The human
 * readable `message` is preserved from the original workflow so existing
 * surfaces and analytics (`error_code`) keep behaving the same.
 */
export class RoomWorkflowError extends Error {
  readonly code: RoomWorkflowErrorCode;

  constructor(code: RoomWorkflowErrorCode, message: string) {
    super(message);
    this.name = "RoomWorkflowError";
    this.code = code;
  }
}

export function isRoomWorkflowError(error: unknown): error is RoomWorkflowError {
  return error instanceof RoomWorkflowError;
}
