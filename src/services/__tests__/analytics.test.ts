import { buildAnalyticsEvent, setAnalyticsContext, startAnalyticsSession } from "@/services/analytics";

describe("analytics service", () => {
  beforeEach(() => {
    startAnalyticsSession();
    setAnalyticsContext({
      userId: "user-1",
      roomId: "room-1",
      rideSessionId: "ride-1",
      networkType: "wifi"
    });
  });

  test("builds the event envelope from context", () => {
    const event = buildAnalyticsEvent("room_created", {
      voice_provider: "livekit"
    });

    expect(event.event_name).toBe("room_created");
    expect(event.user_id).toBe("user-1");
    expect(event.room_id).toBe("room-1");
    expect(event.ride_session_id).toBe("ride-1");
    expect(event.network_type).toBe("wifi");
    expect(event.properties.voice_provider).toBe("livekit");
    expect(event.session_id).toContain("session-");
  });
});
