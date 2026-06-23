# RideSync

RideSync is a premium group ride coordination product for motorcycle crews. The codebase now supports a web-first product surface for planning, staging, monitoring, and marketing, while preserving the mobile path for ride-time native behavior.

## What the product is

RideSync is designed around a clear platform split:

- Web: marketing, onboarding, account setup, room staging, planning, desktop monitoring, moderation, and internal operations
- Mobile: live ride execution, native permissions, ride-time device behavior, background-safe flows, and future production ride runtime

The current repo includes:

- a public marketing site
- a browser-native admin and moderation console
- a desktop command center for room creation, lobby control, live map monitoring, chat/pings, safety state, and voice simulation
- a shared design system and typed product architecture that still supports Expo mobile delivery

## Current stack

- Expo Router
- React Native + Expo Web
- TypeScript
- Zustand
- TanStack Query
- Firebase Auth + Firestore seams
- LiveKit-first voice abstraction
- Shared tokenized design system

## Key routes

- `/marketing`: public product landing page
- `/admin`: operations and moderation console
- `/`: root entry
  - on web, unauthenticated users are redirected to marketing
  - authenticated users continue into the product shell
- `/(tabs)`: signed-in product experience

## Repository structure

- `app/`: Expo Router routes for mobile and web
- `src/components/`: reusable primitives plus ride, safety, comms, and web surfaces
- `src/design/`: theme, tokens, and appearance logic
- `src/features/`: bootstraps and feature hooks
- `src/providers/`: app-wide bootstraps for auth, analytics, resilience, monitoring, and web-first mode
- `src/services/`: Firebase, room workflow, safety, analytics, voice, diagnostics, and platform adapters
- `src/store/`: persisted app and room state
- `src/types/`: typed domain, runtime, analytics, and provider models
- `docs/`: product, architecture, beta, deployment, and web-first documentation

## Local setup

### Install

```bash
npm install
```

### Run the web app

```bash
npm run web
```

Useful routes once Expo is running:

- `http://localhost:8081/marketing`
- `http://localhost:8081/admin`
- `http://localhost:8081/`

### Run validation

```bash
npm run typecheck
npm test -- --runInBand
```

## Firebase setup

Web sign-in requires Firebase configuration.

1. Create a Firebase project.
2. Add a Web App in Firebase.
3. Enable `Email/Password` under Authentication.
4. Create Firestore.
5. Copy `.env.example` to `.env`.
6. Fill in the Firebase web values.
7. Restart Expo.

Expected env vars:

```bash
EXPO_PUBLIC_FIREBASE_API_KEY=...
EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN=...
EXPO_PUBLIC_FIREBASE_PROJECT_ID=...
EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET=...
EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=...
EXPO_PUBLIC_FIREBASE_APP_ID=...
```

## Web-first development mode

RideSync now uses an explicit web-first development strategy.

What works well on web today:

- onboarding and auth shell
- room create/join/lobby
- desktop command center layout
- live ride visualization with browser-safe map simulation
- chat, pings, SOS, safety state, diagnostics, and moderation
- product marketing and admin surfaces

What remains platform-specific:

- true mobile ride-time runtime
- background location behavior
- native notification delivery
- real device audio routing edge cases
- production mobile permission and battery behavior

## Important product decision

For desktop use, headset and intercom pairing should happen through the operating system Bluetooth settings, then the browser uses the selected audio devices. The web app should not rely on direct browser Bluetooth control as the primary product path.

## Supporting docs

Start here:

- [docs/environment-setup.md](docs/environment-setup.md)
- [docs/deployment-approach.md](docs/deployment-approach.md)
- [docs/web-first-development.md](docs/web-first-development.md)
- [docs/technical-architecture.md](docs/technical-architecture.md)

## Status

This repository is now positioned as a serious product foundation:

- premium marketing site
- browser-first product experience
- internal admin tooling
- shared mobile-compatible architecture

The next major step is to continue upgrading the signed-in web tabs and then deepen native mobile execution where real on-bike behavior matters most.
