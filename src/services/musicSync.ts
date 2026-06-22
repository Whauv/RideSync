import { MusicProviderAdapter, MusicRoomBinding, MusicSyncHealth, MusicSyncSnapshot, MusicTrack } from "@/types/music";

const SIMULATED_QUEUE: MusicTrack[] = [
  {
    id: "track-northern-pass",
    title: "Northern Pass",
    artist: "Signal / Line",
    album: "Open Asphalt",
    durationMs: 248000,
    artworkToken: "northern-pass",
    sourceType: "simulation"
  },
  {
    id: "track-red-canyon",
    title: "Red Canyon",
    artist: "Mile Marker",
    album: "High Plains",
    durationMs: 221000,
    artworkToken: "red-canyon",
    sourceType: "simulation"
  },
  {
    id: "track-dawn-engine",
    title: "Dawn Engine",
    artist: "Contour Static",
    album: "First Light",
    durationMs: 264000,
    artworkToken: "dawn-engine",
    sourceType: "simulation"
  }
];

const defaultSnapshot: MusicSyncSnapshot = {
  provider: "simulation",
  transportMode: "metadata_sync",
  roomId: null,
  leaderUserId: null,
  localUserId: null,
  canControl: false,
  queue: SIMULATED_QUEUE,
  currentIndex: 0,
  currentTrackId: SIMULATED_QUEUE[0].id,
  playbackState: "paused",
  elapsedMs: 96000,
  anchorEpochMs: null,
  anchorPositionMs: 96000,
  queueVersion: 1,
  commandRevision: 0,
  lastCommandAt: null,
  syncHealth: "tight",
  resyncState: "idle",
  driftMs: 0,
  deviceLagMs: 80,
  lagCompensationMs: 0,
  localMixPct: 72,
  integrationReady: false,
  constraintNote: "Simulation only until a licensed provider adapter is configured."
};

function nowIso() {
  return new Date().toISOString();
}

function clamp(value: number, min: number, max: number) {
  return Math.min(max, Math.max(min, value));
}

class SimulationMusicAdapter implements MusicProviderAdapter {
  provider = "simulation" as const;

  private snapshot: MusicSyncSnapshot = defaultSnapshot;
  private listeners = new Set<(snapshot: MusicSyncSnapshot) => void>();
  private timer: ReturnType<typeof setInterval> | null = null;
  private tick = 0;

  bindRoom(binding: MusicRoomBinding) {
    if (this.snapshot.roomId === binding.roomId) {
      this.snapshot = {
        ...this.snapshot,
        leaderUserId: binding.leaderUserId,
        localUserId: binding.localUserId,
        canControl: binding.canControl
      };
      this.emit();
      return;
    }

    this.snapshot = {
      ...defaultSnapshot,
      roomId: binding.roomId,
      leaderUserId: binding.leaderUserId,
      localUserId: binding.localUserId,
      canControl: binding.canControl,
      playbackState: "playing",
      anchorEpochMs: Date.now(),
      anchorPositionMs: 96000,
      lastCommandAt: nowIso(),
      commandRevision: 1
    };
    this.startTimer();
    this.emit();
  }

  unbindRoom() {
    this.stopTimer();
    this.snapshot = defaultSnapshot;
    this.emit();
  }

  async play() {
    if (this.snapshot.playbackState === "playing") {
      return;
    }

    this.snapshot = {
      ...this.snapshot,
      playbackState: "playing",
      anchorEpochMs: Date.now(),
      anchorPositionMs: this.snapshot.elapsedMs,
      commandRevision: this.snapshot.commandRevision + 1,
      lastCommandAt: nowIso()
    };
    this.startTimer();
    this.emit();
  }

  async pause() {
    const elapsedMs = this.computeElapsedMs();
    this.snapshot = {
      ...this.snapshot,
      playbackState: "paused",
      elapsedMs,
      anchorPositionMs: elapsedMs,
      anchorEpochMs: null,
      commandRevision: this.snapshot.commandRevision + 1,
      lastCommandAt: nowIso()
    };
    this.emit();
  }

  async skipNext() {
    const nextIndex = (this.snapshot.currentIndex + 1) % this.snapshot.queue.length;
    this.applyTrackChange(nextIndex);
  }

  async skipPrevious() {
    const previousIndex = this.snapshot.currentIndex === 0 ? this.snapshot.queue.length - 1 : this.snapshot.currentIndex - 1;
    this.applyTrackChange(previousIndex);
  }

  setLocalMixPct(value: number) {
    this.snapshot = {
      ...this.snapshot,
      localMixPct: clamp(value, 0, 100)
    };
    this.emit();
  }

  async resyncNow() {
    this.snapshot = {
      ...this.snapshot,
      resyncState: "in_progress",
      lagCompensationMs: Math.max(0, this.snapshot.driftMs),
      driftMs: 0,
      syncHealth: "tight"
    };
    this.emit();

    setTimeout(() => {
      this.snapshot = {
        ...this.snapshot,
        resyncState: "idle",
        lagCompensationMs: 18,
        deviceLagMs: 72
      };
      this.emit();
    }, 700);
  }

  subscribe(listener: (snapshot: MusicSyncSnapshot) => void) {
    this.listeners.add(listener);
    listener(this.snapshot);

    return () => {
      this.listeners.delete(listener);
    };
  }

  getSnapshot() {
    return this.snapshot;
  }

  private applyTrackChange(nextIndex: number) {
    const playing = this.snapshot.playbackState === "playing";
    this.snapshot = {
      ...this.snapshot,
      currentIndex: nextIndex,
      currentTrackId: this.snapshot.queue[nextIndex]?.id ?? null,
      elapsedMs: 0,
      anchorPositionMs: 0,
      anchorEpochMs: playing ? Date.now() : null,
      queueVersion: this.snapshot.queueVersion + 1,
      commandRevision: this.snapshot.commandRevision + 1,
      lastCommandAt: nowIso(),
      driftMs: 0,
      syncHealth: "tight",
      resyncState: "idle"
    };
    this.emit();
  }

  private startTimer() {
    if (this.timer) {
      return;
    }

    this.timer = setInterval(() => {
      if (this.snapshot.playbackState !== "playing") {
        return;
      }

      this.tick += 1;
      const currentTrack = this.snapshot.queue[this.snapshot.currentIndex];
      const elapsedMs = this.computeElapsedMs();

      if (elapsedMs >= currentTrack.durationMs) {
        void this.skipNext();
        return;
      }

      const canControl = this.snapshot.canControl;
      const oscillation = Math.sin(this.tick / 2.6);
      const driftMs = canControl ? 0 : Math.round(oscillation * 135 + 96);
      const resyncState = canControl ? "idle" : Math.abs(driftMs) > 190 ? "in_progress" : Math.abs(driftMs) > 110 ? "scheduled" : "idle";
      const syncHealth: MusicSyncHealth = canControl ? "tight" : Math.abs(driftMs) > 190 ? "resync" : Math.abs(driftMs) > 110 ? "watch" : "tight";

      this.snapshot = {
        ...this.snapshot,
        elapsedMs,
        driftMs,
        deviceLagMs: canControl ? 24 : 58 + Math.round(Math.abs(oscillation) * 84),
        lagCompensationMs: canControl ? 0 : resyncState === "in_progress" ? Math.max(0, driftMs - 32) : 0,
        resyncState,
        syncHealth
      };
      this.emit();
    }, 1000);
  }

  private stopTimer() {
    if (this.timer) {
      clearInterval(this.timer);
      this.timer = null;
    }
  }

  private computeElapsedMs() {
    if (!this.snapshot.anchorEpochMs || this.snapshot.playbackState !== "playing") {
      return this.snapshot.elapsedMs;
    }

    const currentTrack = this.snapshot.queue[this.snapshot.currentIndex];
    return clamp(this.snapshot.anchorPositionMs + (Date.now() - this.snapshot.anchorEpochMs), 0, currentTrack.durationMs);
  }

  private emit() {
    this.listeners.forEach((listener) => listener(this.snapshot));
  }
}

export const musicSyncAdapter: MusicProviderAdapter = new SimulationMusicAdapter();
