# RideSync Beta Rollout Notes

## Rollout posture

RideSync beta should be treated as a supervised, rider-group-focused release rather than an open consumer launch.

Recommended rollout:

1. Internal team and trusted rider cohort
2. Expanded closed beta with known ride leaders
3. Broader invite-only beta after safety and reconnect telemetry are stable

## Suggested tester profile

- Group ride leaders who already coordinate rides manually
- Riders using helmet intercoms and phone mounts
- Mixed iPhone and Android testers
- At least a few testers with known weak-connectivity routes

## Build expectations to set with testers

- Voice, notifications, and safety logic are beta-grade and should be treated as assistive, not as emergency-critical infrastructure
- Crash monitoring remains experimental and is not an automated dispatch feature
- Music sync architecture is present, but licensed provider integrations are still constrained
- Analytics and diagnostics are active to improve beta quality

## Feedback collection priorities

- Join and lobby clarity
- Ride map legibility while moving
- Voice reconnect trustworthiness
- SOS seriousness and false-alarm risk
- Battery impact over a real group ride
- Whether any screen feels too dense or too vague under stress

## Rollout watch metrics

- `room_join_succeeded / room_join_started`
- `voice_connect_succeeded / voice_connect_started`
- count of `voice_connect_failed`
- count of `rider_marked_stale`
- count of `sos_triggered`
- diagnostics volume by category

## Beta stop conditions

- Repeated auth failure spikes
- Stale rider events across otherwise healthy rides
- Voice connect failures above acceptable threshold
- Notification failures for high-priority safety events
- Reported confusion around permission prompts or privacy expectations
