# RideSync Web-First Development Mode

## Why this mode exists

- Expo Go and device networking can slow down iteration before the product flows are stable.
- Most of RideSync can be validated in the browser if native-only concerns are isolated behind adapters.
- Web-first mode keeps design, state, room logic, messaging, planning, analytics, and moderation moving quickly without contaminating the mobile architecture.

## What is real in the browser

- Authentication flows and gated navigation
- Room create, join, lobby, approvals, lock, and ride start
- Chat, pings, SOS flows, and moderation surfaces
- Planning, route references, readiness, and ride brief flows
- Analytics events, diagnostics, feature flags, and recovery UI
- Shared design system, motion, themes, and ecosystem surfaces

## What is simulated on web

- Live ride map transport: rendered through a browser-safe simulated map surface instead of native map SDKs
- Group voice transport: simulated voice roster and speaking indicators instead of native LiveKit audio session wiring
- Notifications: browser notification fallback instead of Expo native channels
- Audio session preparation: treated as ready in browser mode for product-flow validation

## Architecture rule

- Shared feature logic stays in common files.
- Native integrations live in platform-specific adapters such as `*.native.ts`.
- Browser-safe implementations live in `*.web.ts` or generic shared files when they are safe everywhere.
- We do not fork product flows just because the transport layer differs.

## Recommended dev loop

1. Run `npm run web`.
2. Validate auth, room, ride, comms, planning, safety, and admin flows in the browser.
3. Use simulated ride and voice states to harden UX, loading, recovery, and analytics.
4. Move to iOS and Android only when a feature truly depends on native hardware or background behavior.

## Mobile-only validation gates

- Background location accuracy and cadence
- LiveKit device routing and interruption handling
- Push delivery, alert priority, and background SOS behavior
- Audio session behavior and Bluetooth/intercom interactions
- Battery impact and permission edge cases on real devices
