# App Store and Play Store Readiness Notes

## Permission disclosure summary

### Location

Purpose:
- live rider map
- rider spacing
- stale location detection
- regroup coordination

Disclosure guidance:
- explain that precise foreground location is used to show rider position and ride coordination
- do not claim background tracking unless the native build explicitly implements and ships it

### Microphone

Purpose:
- group voice communication

Disclosure guidance:
- explain that microphone access powers room voice while the rider is participating in a ride room

### Notifications

Purpose:
- high-priority pings
- SOS
- ride-state reminders

Disclosure guidance:
- explain that notifications are used for safety-related ride updates and emergency alerts

### Audio / media session

Purpose:
- voice session readiness
- synchronized playback support

Disclosure guidance:
- describe audio session usage for voice communication and playback coordination

## Privacy disclosure notes

- Analytics must not include raw message bodies.
- Analytics must not include exact location traces.
- Emergency contact data and medical notes must not be used for analytics.
- Diagnostics are local-first in this beta baseline and should be documented accordingly.

## App Store Review considerations

- Make sure the permission strings in native manifests are specific and rider-centered.
- Do not describe crash detection as a finished safety system; it must remain labeled experimental.
- If shared playback provider integrations are not licensed, do not imply that RideSync streams provider-owned music on behalf of users.
- If background location is later added, update review notes and privacy nutrition labels before submission.

## Google Play Data Safety considerations

Current likely categories:
- approximate / precise location
- app activity
- diagnostics
- audio
- user identifiers
- optional emergency profile data

Before release:
- confirm whether any data leaves device for analytics or diagnostics in the current build
- align Data Safety answers with actual Firebase, notifications, and future telemetry behavior

## Reviewer notes template

Suggested reviewer summary:

RideSync is a closed beta mobile app for motorcycle group rides. Riders create or join ride rooms, coordinate with voice and quick safety actions, view live rider map context, and manage ride planning. Microphone, location, and notifications support live coordination during active rides. Experimental crash monitoring is present only as a labeled placeholder and does not perform automatic emergency dispatch.
