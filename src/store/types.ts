import { AuthSlice } from "./slices/authSlice";
import { MusicSlice } from "./slices/musicSlice";
import { PermissionsSlice } from "./slices/permissionsSlice";
import { ProfileSlice } from "./slices/profileSlice";
import { ReliabilitySlice } from "./slices/reliabilitySlice";
import { RoomSlice } from "./slices/roomSlice";
import { RuntimeSlice } from "./slices/runtimeSlice";
import { VoiceSlice } from "./slices/voiceSlice";

/**
 * The complete application store, composed from independently-defined slices.
 * Each slice's `set` is typed against this shape, so cross-slice updates (e.g.
 * sign-out, room-session reset) stay type-safe without the slices importing one
 * another.
 */
export type AppState = AuthSlice &
  ProfileSlice &
  PermissionsSlice &
  RoomSlice &
  ReliabilitySlice &
  RuntimeSlice &
  MusicSlice &
  VoiceSlice;
