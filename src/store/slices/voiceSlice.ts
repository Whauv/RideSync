import { StateCreator } from "zustand";

import { VoiceParticipantState, VoiceSessionSnapshot } from "@/types/voice";

import { defaultVoiceSession } from "../defaults";
import { AppState } from "../types";

export interface VoiceSlice {
  voiceSession: VoiceSessionSnapshot;
  voiceParticipants: Record<string, VoiceParticipantState>;
  setVoiceSnapshot: (
    voiceSession: VoiceSessionSnapshot,
    voiceParticipants: Record<string, VoiceParticipantState>
  ) => void;
  resetVoiceState: () => void;
}

export const createVoiceSlice: StateCreator<AppState, [], [], VoiceSlice> = (set) => ({
  voiceSession: defaultVoiceSession,
  voiceParticipants: {},
  setVoiceSnapshot: (voiceSession, voiceParticipants) =>
    set({
      voiceSession,
      voiceParticipants
    }),
  resetVoiceState: () =>
    set({
      voiceSession: defaultVoiceSession,
      voiceParticipants: {}
    })
});
