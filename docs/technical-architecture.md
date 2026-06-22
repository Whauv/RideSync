# RideSync Technical Architecture

## Architecture stance

RideSync should ship first as a managed Expo app with strong seams around real-time voice, room state, and map rendering. The architecture favors delivery speed, typed boundaries, and provider swap flexibility over premature infrastructure complexity.

## Frontend

### Stack

- React Native with Expo
- TypeScript in strict mode
- Expo Router for navigation
- Zustand for app and session state
- TanStack Query for server cache and subscriptions
- tokenized `StyleSheet`-based design system

### Frontend responsibilities

- authentication shell and session bootstrap
- permission gating and denied-state recovery
- room lifecycle UX
- map rendering and rider presence display
- local command surfaces for quick actions and SOS
- resilient offline and reconnect UI states
- provider abstractions for voice and synchronized playback

### State model

- `session store`: auth state, rider profile, app settings
- `ride store`: active room, roster, map focus, quick-action queue
- `media store`: voice connection, playback sync state
- `query cache`: room snapshot, message history, route payloads

## Backend

### Primary stack

- Firebase Auth
- Cloud Firestore
- Cloud Functions
- Firebase Cloud Messaging
- Firebase Storage

### Why Firebase first

- fast product iteration for auth and room lifecycle
- real-time snapshot support for medium-sized group state
- serverless triggers for invites, alerts, and cleanup
- lower ops burden during MVP and early V1

### Backend responsibilities

- auth and rider identity
- room creation, membership, and role assignment
- invite token issuance and validation
- state fan-out for room updates
- moderation actions and abuse controls
- notification dispatch
- analytics event forwarding

## Firestore model

### Collections

- `users/{userId}`
- `rooms/{roomId}`
- `rooms/{roomId}/members/{memberId}`
- `rooms/{roomId}/messages/{messageId}`
- `rooms/{roomId}/events/{eventId}`
- `invites/{inviteId}`
- `devices/{deviceId}`

### Opinionated write pattern

- authoritative room metadata is stored on `rooms`
- rider ephemeral presence is updated on `members`
- high-volume telemetry is rate-limited and summarized, not written raw at full frequency
- Cloud Functions enforce leader-only mutations for sensitive operations

## Real-time communications

### Voice

- use a `VoiceProvider` interface in the app
- first implementation target: LiveKit
- alternate provider: Agora

### Recommendation

Use LiveKit first because it offers strong real-time media primitives, flexible deployment options, and cleaner long-term control if RideSync later needs custom media routing or incident recording policies.

### Voice session rules

- voice is room-scoped
- leader and tail rider receive speaking priority indicators
- background audio behavior must respect platform policies
- reconnect attempts use exponential backoff with user-visible state

## Map stack

### MVP choice

- `react-native-maps` in the managed Expo phase

### Why not Mapbox first

- Mapbox adds more integration weight and token/config complexity in early managed delivery
- RideSync MVP needs stable live markers and camera behavior more than advanced offline vector styling

### Migration path

- keep map rendering in `features/ride-map`
- isolate camera logic, rider markers, and route overlays behind typed interfaces
- migrate to Mapbox when offline maps or richer route rendering justify the cost

## Messaging

### MVP model

- Firestore-backed room message stream
- room-scoped quick actions represented as structured message types
- server timestamp on write

### Message classes

- `text`
- `ping`
- `fuel`
- `hazard`
- `regroup`
- `system`
- `sos`

## Music sync

### Product constraint

RideSync should not stream copyrighted audio itself in MVP.

### Technical model

- leader owns transport state
- app sends play, pause, seek, and track clock events
- rider app attempts local alignment against the leader clock
- support begins with a single integration target if any provider is added

### Recommended scope

- MVP: shared playback state abstraction only, with mocked transport
- V1: one real provider integration where platform terms allow it

## Authentication

### MVP auth

- Firebase Auth with phone number or email magic link

### Rationale

- fast onboarding
- low password friction during ride staging
- concrete identity without building full account recovery systems early

### Access model

- room membership requires authenticated identity
- invite token plus auth session is required to join private rooms
- leader role transfer is server-validated

## Storage

### Firestore

- room state, membership, messages, ride events

### AsyncStorage

- cached session info
- recent room list
- last known room snapshot
- local analytics retry queue

### Firebase Storage

- future incident attachments
- future route GPX assets

## Observability

### Crash and performance

- Sentry for mobile crash reporting and tracing
- Firebase Performance Monitoring only if signal quality is acceptable

### Operational logging

- Cloud Functions structured logs
- trace correlation IDs on room create, join, SOS, and provider connect flows

### Key dashboards

- room join failures
- voice connect failures
- stale presence spikes
- notification delivery failures

## Notifications

### MVP

- FCM/APNs via Expo or direct provider path depending delivery maturity
- room invite accepted
- ride started
- SOS raised
- leader message while user is backgrounded

### Rules

- no noisy social notifications
- emergency and operational signals only by default

## Analytics

### Pipeline

- client emits typed analytics events
- events batch locally
- delivery goes to Firebase first
- export to BigQuery for deeper analysis

### Measurement principles

- track ride lifecycle and reliability first
- avoid collecting unnecessary high-frequency location traces for analytics
- separate operational telemetry from product analytics

## Security

- Firestore security rules deny cross-room reads
- leader-only commands require server enforcement
- invite tokens expire
- rate-limit room joins and quick-action spam
- PII is minimized in analytics payloads

## Scalability notes

- Firestore is sufficient for MVP-sized rooms and early V1
- if room size or write rate grows materially, move presence fan-out and telemetry to a dedicated real-time service
- keep provider contracts narrow so room state can later move to WebSockets or LiveKit data channels if needed
