import { StateCreator } from "zustand";

import {
  PresenceState,
  RideAlertState,
  RideLayerMarker,
  RideMessage,
  RidePlan,
  RideRoom,
  RideRoomSnapshot,
  RiderPresence,
  RoomMember,
  SafetySnapshot
} from "@/types/domain";

import { defaultReliability } from "../defaults";
import { AppState } from "../types";

export interface RoomSlice {
  pendingJoinCode: string | null;
  activeRoom: RideRoom | null;
  roomMembers: RoomMember[];
  roomPresenceState: PresenceState;
  riders: RiderPresence[];
  rideLayers: RideLayerMarker[];
  messages: RideMessage[];
  activeAlert: RideAlertState | null;
  ridePlan: RidePlan | null;
  safety: SafetySnapshot | null;
  lastActiveRoomId: string | null;
  messageReadAtByRoom: Record<string, string | null>;
  setPendingJoinCode: (code: string | null) => void;
  /**
   * Loads a full room snapshot into state. Taking the `RideRoomSnapshot`
   * directly (instead of eight positional arguments) removes a long-standing
   * source of argument-order bugs at the ~28 call sites.
   */
  setRoomSession: (session: RideRoomSnapshot) => void;
  clearRoomSession: () => void;
  setRoomPresenceState: (presenceState: PresenceState) => void;
  setRideTelemetry: (riders: RiderPresence[], safety: SafetySnapshot) => void;
  markRoomMessagesRead: (roomId: string, lastReadAt?: string) => void;
  postMessage: (message: RideMessage) => void;
}

export const createRoomSlice: StateCreator<AppState, [], [], RoomSlice> = (set) => ({
  pendingJoinCode: null,
  activeRoom: null,
  roomMembers: [],
  roomPresenceState: "connected",
  riders: [],
  rideLayers: [],
  messages: [],
  activeAlert: null,
  ridePlan: null,
  safety: null,
  lastActiveRoomId: null,
  messageReadAtByRoom: {},
  setPendingJoinCode: (code) => set({ pendingJoinCode: code }),
  setRoomSession: (session) =>
    set({
      activeRoom: session.room,
      roomMembers: session.members,
      riders: session.riders,
      rideLayers: session.layers,
      messages: session.messages,
      activeAlert: session.activeAlert,
      ridePlan: session.ridePlan,
      safety: session.safety,
      lastActiveRoomId: session.room.id,
      reliability: {
        ...defaultReliability,
        connectivity: "online",
        recoveryState: "restored",
        lastRoomSyncAt: new Date().toISOString(),
        lastRecoveryAt: new Date().toISOString(),
        lastRecoveryError: null
      }
    }),
  clearRoomSession: () =>
    set({
      activeRoom: null,
      roomMembers: [],
      riders: [],
      rideLayers: [],
      messages: [],
      activeAlert: null,
      ridePlan: null,
      safety: null
    }),
  setRoomPresenceState: (roomPresenceState) => set({ roomPresenceState }),
  setRideTelemetry: (riders, safety) => set({ riders, safety }),
  markRoomMessagesRead: (roomId, lastReadAt) =>
    set((state) => ({
      messageReadAtByRoom: {
        ...state.messageReadAtByRoom,
        [roomId]: lastReadAt ?? new Date().toISOString()
      }
    })),
  postMessage: (message) =>
    set((state) => ({
      messages: [message, ...state.messages]
    }))
});
