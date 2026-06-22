export interface VoiceProviderAdapter {
  provider: "livekit" | "agora";
  connect: (roomId: string) => Promise<void>;
  disconnect: () => Promise<void>;
}

class LiveKitAdapter implements VoiceProviderAdapter {
  provider: "livekit" = "livekit";

  async connect(_roomId: string) {
    return Promise.resolve();
  }

  async disconnect() {
    return Promise.resolve();
  }
}

export const voiceAdapter: VoiceProviderAdapter = new LiveKitAdapter();
