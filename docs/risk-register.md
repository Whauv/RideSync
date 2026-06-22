# RideSync Risk Register

## Rating scale

- Probability: Low, Medium, High
- Impact: Low, Medium, High, Critical

## Risks

| ID | Risk | Probability | Impact | Why it matters | Mitigation | Contingency |
| --- | --- | --- | --- | --- | --- | --- |
| R1 | Background audio behavior differs across iOS and Android | High | High | Group voice and playback may stop or degrade when riders lock screens or switch apps | Keep background media scope narrow, use a tested voice provider, validate audio session policies early, and avoid unsupported background behaviors in MVP | Ship voice-first behavior and defer robust shared music control if platform rules block consistency |
| R2 | Riders deny precise location permission | High | Critical | The map-first coordination model loses reliability when precise location is missing | Ask only at point of need, explain operational value clearly, provide degraded coarse-state UI, and surface permission recovery paths | Allow room participation with reduced status but mark the rider as limited on the map |
| R3 | Rural internet dropouts break presence and voice continuity | High | Critical | Motorcycle rides often move through weak coverage; stale data can be mistaken for incidents | Add reconnect state, stale timers, local last-known cache, rate-limited retries, and visible confidence indicators | Fall back to cached room state and prioritize quick operational notifications when connectivity returns |
| R4 | Battery drain from GPS, screen use, and voice sessions causes churn | High | High | Riders may abandon the app mid-ride if power cost feels irresponsible | Use balanced location intervals, reduce telemetry write frequency, dim nonessential UI work, and warn on low battery | Provide low-power ride mode with reduced update frequency and optional voice-only participation |
| R5 | App Store review constraints around background location and audio delay approval | Medium | High | Over-requesting permissions can stall release or force product cuts late | Keep MVP on in-use location, justify permissions in product copy, and avoid speculative entitlements | Ship narrower behavior and request expanded permissions only after usage evidence supports it |
| R6 | Abuse or harassment in private ride rooms | Medium | High | Voice and messaging can become harmful without controls, especially in invite-based groups | Require authenticated identity, add block/report/audit hooks, rate-limit spam actions, and maintain moderation event trails | Add room owner moderation tools and server-side mute/ban flows before open growth features |
| R7 | Synchronized playback cannot be perfectly aligned across providers and devices | High | Medium | Users may expect music sync to behave like native multi-device playback, which is hard under mobile restrictions | Define music sync as best-effort transport coordination, not sample-accurate shared audio, and keep it opt-in | Reduce scope to leader-controlled cues and playback intent until a supported provider proves acceptable |

## Top launch risks

1. R2 precise location denial
2. R3 ride-time connectivity loss
3. R1 background audio inconsistency
4. R4 battery drain perception

## Launch gates

- voice reconnect behavior validated in prolonged background/foreground cycling
- stale rider state visibly differentiated from active rider state
- permission denial states reviewed on both iOS and Android
- battery usage tested on at least one long ride scenario per platform
