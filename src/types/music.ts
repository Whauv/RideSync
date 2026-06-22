export type MusicProviderKind = "simulation" | "spotify" | "apple_music" | "local_file";

export type MusicPlaybackState = "idle" | "playing" | "paused" | "buffering";

export type MusicSyncHealth = "tight" | "watch" | "resync";

export type MusicResyncState = "idle" | "scheduled" | "in_progress";

export interface MusicTrack {
  id: string;
  title: string;
  artist: string;
  album: string;
  durationMs: number;
  artworkToken: string;
  sourceType: MusicProviderKind;
  providerReference?: string;
}

export interface MusicSyncSnapshot {
  provider: MusicProviderKind;
  transportMode: "metadata_sync";
  roomId: string | null;
  leaderUserId: string | null;
  localUserId: string | null;
  canControl: boolean;
  queue: MusicTrack[];
  currentIndex: number;
  currentTrackId: string | null;
  playbackState: MusicPlaybackState;
  elapsedMs: number;
  anchorEpochMs: number | null;
  anchorPositionMs: number;
  queueVersion: number;
  commandRevision: number;
  lastCommandAt: string | null;
  syncHealth: MusicSyncHealth;
  resyncState: MusicResyncState;
  driftMs: number;
  deviceLagMs: number;
  lagCompensationMs: number;
  localMixPct: number;
  integrationReady: boolean;
  constraintNote: string;
}

export interface MusicRoomBinding {
  roomId: string;
  leaderUserId: string;
  localUserId: string;
  canControl: boolean;
}

export interface MusicProviderAdapter {
  provider: MusicProviderKind;
  bindRoom: (binding: MusicRoomBinding) => void;
  unbindRoom: () => void;
  play: () => Promise<void>;
  pause: () => Promise<void>;
  skipNext: () => Promise<void>;
  skipPrevious: () => Promise<void>;
  setLocalMixPct: (value: number) => void;
  resyncNow: () => Promise<void>;
  subscribe: (listener: (snapshot: MusicSyncSnapshot) => void) => () => void;
  getSnapshot: () => MusicSyncSnapshot;
}
