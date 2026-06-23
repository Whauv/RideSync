import { AppStateStatus } from "react-native";

import { recordDiagnosticEvent } from "@/services/diagnostics";
import { trackEvent } from "@/services/analytics";
import {
  VoiceConnectOptions,
  VoiceParticipantState,
  VoiceProvider,
  VoiceRosterMember,
  VoiceSessionSnapshot
} from "@/types/voice";

export interface VoiceProviderAdapter {
  provider: VoiceProvider;
  connect: (options: VoiceConnectOptions) => Promise<void>;
  disconnect: () => Promise<void>;
  setMuted: (muted: boolean) => Promise<void>;
  retryConnection: () => Promise<void>;
  requestLeaderAnnounce: () => Promise<void>;
  setAppState: (state: AppStateStatus) => void;
  setDegradedNetwork: (degraded: boolean) => void;
  syncRoster: (members: VoiceRosterMember[]) => void;
  subscribe: (listener: (snapshot: VoiceSessionSnapshot, participants: VoiceParticipantState[]) => void) => () => void;
  getSnapshot: () => {
    snapshot: VoiceSessionSnapshot;
    participants: VoiceParticipantState[];
  };
}

const defaultSnapshot: VoiceSessionSnapshot = {
  provider: "livekit",
  roomId: null,
  connectionState: "idle",
  networkQuality: "good",
  selfMuted: false,
  poorNetwork: false,
  leaderAnnounceRequested: false,
  deviceStatus: {
    inputLabel: "Browser mic",
    outputLabel: "Browser audio",
    bluetoothConnected: false,
    backgroundProtected: false
  },
  activeSpeakerIds: [],
  errorMessage: null
};

class BrowserSimulationVoiceAdapter implements VoiceProviderAdapter {
  provider = "livekit" as const;

  private snapshot: VoiceSessionSnapshot = defaultSnapshot;
  private participants: VoiceParticipantState[] = [];
  private listeners = new Set<(snapshot: VoiceSessionSnapshot, participants: VoiceParticipantState[]) => void>();
  private speakingTimer: ReturnType<typeof setInterval> | null = null;
  private connectTimer: ReturnType<typeof setTimeout> | null = null;
  private currentUserId: string | null = null;
  private turnIndex = 0;

  async connect(options: VoiceConnectOptions) {
    this.currentUserId = options.currentUserId;
    this.clearConnectTimer();
    this.snapshot = {
      ...this.snapshot,
      roomId: options.roomId,
      connectionState: "connecting",
      errorMessage: null,
      leaderAnnounceRequested: false
    };
    this.emit();
    void trackEvent("voice_connect_started", {
      provider: options.provider
    });

    this.connectTimer = setTimeout(() => {
      this.snapshot = {
        ...this.snapshot,
        connectionState: this.snapshot.poorNetwork ? "degraded" : "connected",
        networkQuality: this.snapshot.poorNetwork ? "poor" : "excellent"
      };
      this.startSpeakingLoop();
      this.emit();
      void recordDiagnosticEvent({
        category: "voice",
        level: "info",
        title: "Browser voice simulation active",
        detail: `Voice is running in simulated browser mode for room ${options.roomCode}.`
      });
    }, 450);
  }

  async disconnect() {
    this.clearTimers();
    this.currentUserId = null;
    this.participants = [];
    this.snapshot = {
      ...defaultSnapshot
    };
    this.emit();
  }

  async setMuted(muted: boolean) {
    this.snapshot = {
      ...this.snapshot,
      selfMuted: muted
    };
    this.participants = this.participants.map((participant) =>
      participant.userId === this.currentUserId
        ? {
            ...participant,
            isMuted: muted,
            isSpeaking: muted ? false : participant.isSpeaking
          }
        : participant
    );
    this.recomputeActiveSpeakers();
    this.emit();
  }

  async retryConnection() {
    if (!this.snapshot.roomId) {
      return;
    }

    this.snapshot = {
      ...this.snapshot,
      connectionState: "reconnecting"
    };
    this.emit();

    this.clearConnectTimer();
    this.connectTimer = setTimeout(() => {
      this.snapshot = {
        ...this.snapshot,
        connectionState: this.snapshot.poorNetwork ? "degraded" : "connected",
        networkQuality: this.snapshot.poorNetwork ? "poor" : "excellent"
      };
      this.emit();
    }, 700);
  }

  async requestLeaderAnnounce() {
    this.snapshot = {
      ...this.snapshot,
      leaderAnnounceRequested: true
    };
    this.emit();
  }

  setAppState(state: AppStateStatus) {
    this.snapshot = {
      ...this.snapshot,
      deviceStatus: {
        ...this.snapshot.deviceStatus,
        backgroundProtected: state !== "active"
      }
    };
    this.emit();
  }

  setDegradedNetwork(degraded: boolean) {
    this.snapshot = {
      ...this.snapshot,
      poorNetwork: degraded,
      networkQuality: degraded ? "poor" : "excellent",
      connectionState: this.snapshot.roomId ? (degraded ? "degraded" : "connected") : "idle"
    };
    this.participants = this.participants.map((participant) => ({
      ...participant,
      networkQuality: degraded && participant.role !== "leader" ? "poor" : degraded ? "good" : "excellent"
    }));
    this.startSpeakingLoop();
    this.emit();
  }

  syncRoster(members: VoiceRosterMember[]) {
    const existing = new Map(this.participants.map((participant) => [participant.memberId, participant]));

    this.participants = members.map((member) => {
      const previous = existing.get(member.memberId);
      const isSelf = member.userId === this.currentUserId;

      return {
        memberId: member.memberId,
        userId: member.userId,
        riderName: member.riderName,
        role: member.role,
        isSpeaking: previous?.isSpeaking ?? false,
        isMuted: isSelf ? this.snapshot.selfMuted : previous?.isMuted ?? false,
        networkQuality: member.connected ? previous?.networkQuality ?? "excellent" : "poor"
      };
    });

    this.recomputeActiveSpeakers();
    this.emit();
  }

  subscribe(listener: (snapshot: VoiceSessionSnapshot, participants: VoiceParticipantState[]) => void) {
    this.listeners.add(listener);
    listener(this.snapshot, this.participants);

    return () => {
      this.listeners.delete(listener);
    };
  }

  getSnapshot() {
    return {
      snapshot: this.snapshot,
      participants: this.participants
    };
  }

  private startSpeakingLoop() {
    if (this.speakingTimer) {
      clearInterval(this.speakingTimer);
    }

    this.speakingTimer = setInterval(() => {
      if (this.snapshot.connectionState !== "connected" && this.snapshot.connectionState !== "degraded") {
        return;
      }

      const connectedParticipants = this.participants.filter((participant) => participant.networkQuality !== "poor" && !participant.isMuted);
      if (connectedParticipants.length === 0) {
        return;
      }

      const nextSpeaker = connectedParticipants[this.turnIndex % connectedParticipants.length];
      this.turnIndex += 1;
      this.participants = this.participants.map((participant) => ({
        ...participant,
        isSpeaking: participant.memberId === nextSpeaker.memberId
      }));
      this.recomputeActiveSpeakers();
      this.emit();
    }, this.snapshot.poorNetwork ? 3800 : 2400);
  }

  private recomputeActiveSpeakers() {
    this.snapshot = {
      ...this.snapshot,
      activeSpeakerIds: this.participants.filter((participant) => participant.isSpeaking).map((participant) => participant.memberId)
    };
  }

  private clearConnectTimer() {
    if (this.connectTimer) {
      clearTimeout(this.connectTimer);
      this.connectTimer = null;
    }
  }

  private clearTimers() {
    this.clearConnectTimer();
    if (this.speakingTimer) {
      clearInterval(this.speakingTimer);
      this.speakingTimer = null;
    }
  }

  private emit() {
    this.listeners.forEach((listener) => listener(this.snapshot, this.participants));
  }
}

export const voiceAdapter: VoiceProviderAdapter = new BrowserSimulationVoiceAdapter();
