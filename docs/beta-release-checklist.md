# RideSync Beta Release Checklist

## Code and quality

- `npm install` completes without lockfile drift.
- `npm run typecheck` passes.
- `npm test -- --runInBand` passes.
- Playwright smoke suite is ready and passes against the target beta web build when applicable.
- No unresolved TypeScript suppression comments added for beta-only shortcuts.

## Product-critical flows

- Authentication works with staging Firebase.
- Profile setup persists across relaunch.
- Permission onboarding works for allow, deny, and recovery paths.
- Room create, join, approval, lock, and ride start flows are verified.
- Quick pings, hazard report, and SOS escalation are verified.
- Voice connect, reconnect affordance, and degraded-state UI are verified.
- Safety center, fuel updates, and diagnostics console render correctly.

## Observability

- Analytics events queue locally with correct envelope fields.
- Diagnostics log captures recovery, notification, room, and voice events.
- Monitoring boundary catches and logs unhandled render failures.
- Performance traces are recorded for auth and core room transitions.

## Release assets

- Beta tester notes are written and reviewed.
- Environment document matches staging config reality.
- Permission copy and privacy disclosures match actual runtime behavior.
- App icon, splash, package name, and bundle IDs are locked for beta.

## Manual device pass

- iPhone physical device
- Android physical device
- Background/foreground room recovery
- Notification receipt for hazard and SOS
- Weak connectivity / airplane toggle sanity check
- Battery saver and reduced cadence sanity check

## Go / no-go blockers

- Auth loop or redirect dead-end
- Room snapshot corruption
- SOS not visible room-wide
- Voice reconnect unable to recover
- Permission denial leaves user stuck
- Store privacy disclosure mismatch
