import { create } from "zustand";

import { LeaderMusicState, RideMessage, RideRoom, RiderPresence } from "@/types/domain";

type ThemeMode = "system" | "light" | "dark";

interface AppState {
  themeMode: ThemeMode;
  isAuthenticated: boolean;
  currentUserName: string;
  activeRoom: RideRoom | null;
  riders: RiderPresence[];
  messages: RideMessage[];
  leaderMusic: LeaderMusicState;
  setThemeMode: (themeMode: ThemeMode) => void;
  signIn: (name: string) => void;
  joinRoom: (room: RideRoom, riders: RiderPresence[], messages: RideMessage[]) => void;
  postMessage: (message: RideMessage) => void;
}

const seededMusic: LeaderMusicState = {
  isPlaying: true,
  track: "Northern Pass",
  artist: "Signal / Line",
  elapsedSeconds: 96
};

export const useAppStore = create<AppState>((set) => ({
  themeMode: "system",
  isAuthenticated: false,
  currentUserName: "Alex Mercer",
  activeRoom: null,
  riders: [],
  messages: [],
  leaderMusic: seededMusic,
  setThemeMode: (themeMode) => set({ themeMode }),
  signIn: (name) => set({ isAuthenticated: true, currentUserName: name }),
  joinRoom: (room, riders, messages) => set({ activeRoom: room, riders, messages }),
  postMessage: (message) =>
    set((state) => ({
      messages: [message, ...state.messages]
    }))
}));
