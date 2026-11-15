import { StateCreator } from "zustand";

import { LeaderMusicState } from "@/types/domain";
import { MusicSyncSnapshot } from "@/types/music";

import { defaultMusicSync, seededMusic } from "../defaults";
import { AppState } from "../types";

export interface MusicSlice {
  leaderMusic: LeaderMusicState;
  musicSync: MusicSyncSnapshot;
  setMusicSyncSnapshot: (snapshot: MusicSyncSnapshot) => void;
  resetMusicSync: () => void;
}

export const createMusicSlice: StateCreator<AppState, [], [], MusicSlice> = (set) => ({
  leaderMusic: seededMusic,
  musicSync: defaultMusicSync,
  setMusicSyncSnapshot: (musicSync) => set({ musicSync }),
  resetMusicSync: () => set({ musicSync: defaultMusicSync })
});
