# RideSync

RideSync is a cross-platform mobile app for coordinated motorcycle group rides. This scaffold is built with Expo Router, TypeScript, Zustand, and TanStack Query, with production-oriented seams for Firebase, live voice, maps, and synchronized ride controls.

## Architecture

- `app/`: Expo Router entrypoints and tab navigation.
- `src/design/`: theme primitives, tokens, and appearance logic.
- `src/components/`: reusable UI surfaces and ride-specific display components.
- `src/features/`: feature hooks and future module growth points.
- `src/services/`: backend, voice, and mock data adapters.
- `src/store/`: app session and room state.
- `src/types/`: typed ride domain models.

## Technical decisions

- `react-native-maps` is used in the managed Expo baseline because it is materially more feasible than Mapbox in the first production-capable managed phase. The map UI is isolated behind ride components so we can migrate to Mapbox if the product later requires deeper offline vector styling or advanced route rendering.
- Firebase is the first backend target for auth, room presence, and server-side orchestration.
- Live voice is abstracted behind a provider adapter with LiveKit as the first implementation target.

## Product slices included

- rider entry and invite flow
- map-first ride overview
- real-time squad status surface
- coordination feed and incident actions
- settings for appearance and provider readiness

## Next implementation steps

1. Wire Firebase Auth, Firestore listeners, and Cloud Functions for room lifecycle.
2. Replace `MapPreview` with Mapbox-backed live rider map and clustering.
3. Integrate LiveKit room connect, voice activity, and audio session management.
4. Add QR join, deep links, permission flows, and offline reconnection queueing.
5. Add route planning, hazard reporting, telemetry ingestion, and post-ride summaries.
