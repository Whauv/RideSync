import { AppStateStatus } from "react-native";
import { AudioSession, registerGlobals } from "@livekit/react-native";
import { ConnectionState, Participant, Room, RoomEvent } from "livekit-client";

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
    inputLabel: "Helmet mic",
    outputLabel: "Bluetooth intercom",
    bluetoothConnected: true,
    backgroundProtected: false
  },
  activeSpeakerIds: [],
  errorMessage: null
};

class LiveKitAdapter implements VoiceProviderAdapter {
  provider = "livekit" as const;

  private liveKitRoom: Room | null = null;
  private snapshot: VoiceSessionSnapshot = defaultSnapshot;
  private participants: VoiceParticipantState[] = [];
  private listeners = new Set<(snapshot: VoiceSessionSnapshot, participants: VoiceParticipantState[]) => void>();
  private speakingTimer: ReturnType<typeof setInterval> | null = null;
  private connectTimer: ReturnType<typeof setTimeout> | null = null;
  private currentUserId: string | null = null;
  private lastConnectOptions: VoiceConnectOptions | null = null;
  private usingSimulatedTransport = true;
  private turnIndex = 0;
  private lastAppState: AppStateStatus = "active";

  constructor() {
    registerGlobals();
  }

  async connect(options: VoiceConnectOptions) {
    this.lastConnectOptions = options;
    this.clearConnectTimer();
    await this.disconnect();
    this.currentUserId = options.currentUserId;

    this.snapshot = {
      ...this.snapshot,
      provider: options.provider,
      roomId: options.roomId,
      connectionState: "connecting",
      errorMessage: null,
      leaderAnnounceRequested: false
    };
    this.emit();

    const liveKitUrl = process.env.EXPO_PUBLIC_LIVEKIT_URL;
    const liveKitToken = process.env.EXPO_PUBLIC_LIVEKIT_TOKEN;

    if (liveKitUrl && liveKitToken) {
      await this.connectLiveKit(liveKitUrl, liveKitToken, options);
      return;
    }

    this.usingSimulatedTransport = true;
    this.connectTimer = setTimeout(() => {
      this.snapshot = {
        ...this.snapshot,
        connectionState: this.snapshot.poorNetwork ? "degraded" : "connected",
        networkQuality: this.snapshot.poorNetwork ? "poor" : "good",
        deviceStatus: {
          ...this.snapshot.deviceStatus,
          backgroundProtected: this.lastAppState !== "active"
        }
      };
      this.startSpeakingLoop();
      this.emit();
    }, 650);
  }

  async disconnect() {
    this.clearTimers();
    if (this.liveKitRoom) {
      this.liveKitRoom.removeAllListeners();
      await this.liveKitRoom.disconnect();
      this.liveKitRoom = null;
      await AudioSession.stopAudioSession();
    }

    this.currentUserId = null;
    this.participants = [];
    this.usingSimulatedTransport = true;
    this.snapshot = {
      ...defaultSnapshot,
      provider: this.provider
    };
    this.emit();
  }

  async setMuted(muted: boolean) {
    if (this.liveKitRoom) {
      await this.liveKitRoom.localParticipant.setMicrophoneEnabled(!muted);
    }

    this.snapshot = {
      ...this.snapshot,
      selfMuted: muted
    };

    if (this.currentUserId) {
      this.participants = this.participants.map((participant) =>
        participant.userId === this.currentUserId
          ? {
              ...participant,
              isMuted: muted,
              isSpeaking: muted ? false : participant.isSpeaking
            }
          : participant
      );
    }

    this.recomputeActiveSpeakers();
    this.emit();
  }

  async retryConnection() {
    if (!this.snapshot.roomId) {
      return;
    }

    if (this.liveKitRoom && this.lastConnectOptions) {
      await this.connect(this.lastConnectOptions);
      return;
    }

    this.snapshot = {
      ...this.snapshot,
      connectionState: "reconnecting",
      errorMessage: null
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
    }, 900);
  }

  async requestLeaderAnnounce() {
    this.snapshot = {
      ...this.snapshot,
      leaderAnnounceRequested: true
    };
    this.emit();
  }

  setAppState(state: AppStateStatus) {
    this.lastAppState = state;
    this.snapshot = {
      ...this.snapshot,
      deviceStatus: {
        ...this.snapshot.deviceStatus,
        backgroundProtected: state !== "active"
      }
    };

    if (!this.snapshot.roomId) {
      this.emit();
      return;
    }

    this.snapshot = {
      ...this.snapshot,
      connectionState:
        state === "active"
          ? this.snapshot.poorNetwork
            ? "degraded"
            : "connected"
          : "reconnecting"
    };

    if (state !== "active") {
      this.participants = this.participants.map((participant) => ({
        ...participant,
        isSpeaking: false
      }));
      this.recomputeActiveSpeakers();
    }

    this.emit();
  }

  setDegradedNetwork(degraded: boolean) {
    this.snapshot = {
      ...this.snapshot,
      poorNetwork: degraded,
      networkQuality: degraded ? "poor" : "excellent",
      connectionState:
        this.snapshot.roomId && this.lastAppState === "active"
          ? degraded
            ? "degraded"
            : "connected"
          : this.snapshot.roomId
            ? "reconnecting"
            : "idle"
    };

    this.participants = this.participants.map((participant) => ({
      ...participant,
      networkQuality: degraded && participant.role !== "leader" ? "poor" : degraded ? "good" : "excellent"
    }));
    if (this.usingSimulatedTransport) {
      this.startSpeakingLoop();
    }
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
        isSpeaking: member.connected ? previous?.isSpeaking ?? false : false,
        isMuted: isSelf ? this.snapshot.selfMuted : previous?.isMuted ?? false,
        networkQuality: member.connected
          ? previous?.networkQuality ?? (this.snapshot.poorNetwork ? "good" : "excellent")
          : "poor"
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

  private emit() {
    this.listeners.forEach((listener) => listener(this.snapshot, this.participants));
  }

  private async connectLiveKit(url: string, token: string, options: VoiceConnectOptions) {
    try {
      this.usingSimulatedTransport = false;
      await AudioSession.startAudioSession();

      const room = new Room();
      this.liveKitRoom = room;
      this.attachLiveKitListeners(room);
      await room.connect(url, token, {
        autoSubscribe: true
      });
      await room.localParticipant.setMicrophoneEnabled(!this.snapshot.selfMuted);

      this.snapshot = {
        ...this.snapshot,
        provider: options.provider,
        roomId: options.roomId,
        connectionState: this.snapshot.poorNetwork ? "degraded" : "connected",
        networkQuality: this.snapshot.poorNetwork ? "poor" : "excellent"
      };
      this.syncSpeakingParticipants(room.activeSpeakers);
      this.emit();
    } catch (error) {
      this.liveKitRoom = null;
      this.usingSimulatedTransport = true;
      await AudioSession.stopAudioSession();
      this.snapshot = {
        ...this.snapshot,
        connectionState: "error",
        errorMessage: error instanceof Error ? error.message : "LiveKit connection failed."
      };
      this.emit();
    }
  }

  private attachLiveKitListeners(room: Room) {
    room
      .on(RoomEvent.ConnectionStateChanged, (state) => {
        this.snapshot = {
          ...this.snapshot,
          connectionState: this.mapConnectionState(state),
          networkQuality: this.snapshot.poorNetwork ? "poor" : state === ConnectionState.Connected ? "excellent" : "good"
        };
        this.emit();
      })
      .on(RoomEvent.ActiveSpeakersChanged, (speakers: Participant[]) => {
        this.syncSpeakingParticipants(speakers);
        this.emit();
      })
      .on(RoomEvent.ParticipantConnected, () => {
        this.syncSpeakingParticipants(room.activeSpeakers);
        this.emit();
      })
      .on(RoomEvent.ParticipantDisconnected, () => {
        this.syncSpeakingParticipants(room.activeSpeakers);
        this.emit();
      })
      .on(RoomEvent.Reconnecting, () => {
        this.snapshot = {
          ...this.snapshot,
          connectionState: "reconnecting"
        };
        this.emit();
      })
      .on(RoomEvent.Reconnected, () => {
        this.snapshot = {
          ...this.snapshot,
          connectionState: this.snapshot.poorNetwork ? "degraded" : "connected"
        };
        this.syncSpeakingParticipants(room.activeSpeakers);
        this.emit();
      })
      .on(RoomEvent.Disconnected, () => {
        this.snapshot = {
          ...this.snapshot,
          connectionState: "idle",
          activeSpeakerIds: []
        };
        this.participants = this.participants.map((participant) => ({
          ...participant,
          isSpeaking: false
        }));
        this.emit();
      });
  }

  private syncSpeakingParticipants(speakers: Participant[]) {
    const speakerIds = new Set(speakers.map((speaker) => speaker.identity));
    this.participants = this.participants.map((participant) => ({
      ...participant,
      isSpeaking: speakerIds.has(participant.userId)
    }));
    this.recomputeActiveSpeakers();
  }

  private startSpeakingLoop() {
    this.clearSpeakingTimer();

    this.speakingTimer = setInterval(() => {
      if (this.snapshot.connectionState !== "connected" && this.snapshot.connectionState !== "degraded") {
        return;
      }

      const connectedParticipants = this.participants.filter((participant) => participant.networkQuality !== "poor" && !participant.isMuted);
      if (connectedParticipants.length === 0) {
        this.participants = this.participants.map((participant) => ({
          ...participant,
          isSpeaking: false
        }));
        this.recomputeActiveSpeakers();
        this.emit();
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
    }, this.snapshot.poorNetwork ? 4200 : 2600);
  }

  private recomputeActiveSpeakers() {
    this.snapshot = {
      ...this.snapshot,
      activeSpeakerIds: this.participants.filter((participant) => participant.isSpeaking).map((participant) => participant.memberId)
    };
  }

  private clearTimers() {
    this.clearSpeakingTimer();
    this.clearConnectTimer();
  }

  private clearSpeakingTimer() {
    if (this.speakingTimer) {
      clearInterval(this.speakingTimer);
      this.speakingTimer = null;
    }
  }

  private clearConnectTimer() {
    if (this.connectTimer) {
      clearTimeout(this.connectTimer);
      this.connectTimer = null;
    }
  }

  private mapConnectionState(state: ConnectionState): VoiceSessionSnapshot["connectionState"] {
    if (state === ConnectionState.Connected) {
      return this.snapshot.poorNetwork ? "degraded" : "connected";
    }

    if (state === ConnectionState.Connecting) {
      return "connecting";
    }

    if (state === ConnectionState.Reconnecting) {
      return "reconnecting";
    }

    if (state === ConnectionState.Disconnected) {
      return "idle";
    }

    return "error";
  }
}

export const voiceAdapter: VoiceProviderAdapter = new LiveKitAdapter();
