# RideSync

RideSync is a premium group ride coordination platform for motorcycle crews. The product is being developed web-first for planning, onboarding, room staging, moderation, and desktop command visibility, while keeping the Expo mobile path clean for true ride-time behavior later.

## Product overview

RideSync is built around a deliberate platform split:

- Web: marketing, onboarding, sign-in, room staging, route planning, desktop monitoring, moderation, and operations
- Mobile: live ride execution, background location, native permissions, notifications, audio routing, and real on-bike runtime behavior

The current repository includes:

- a public marketing site
- a browser-native admin and moderation console
- a signed-in product shell for room, map, coordination, and safety flows
- a shared design system and typed architecture that still supports Expo mobile delivery

## Stack

- Expo Router
- React Native + Expo Web
- TypeScript
- Zustand
- TanStack Query
- Firebase Auth + Firestore seams
- LiveKit-first voice abstraction
- Shared tokenized design system

## Primary routes

- `/marketing`: public landing page
- `/admin`: operations and moderation console
- `/`: root entry
  - on web, unauthenticated users route to marketing
  - authenticated users continue into the product shell
- `/(auth)`: onboarding, sign-in, permissions, and profile setup
- `/(tabs)`: signed-in product experience

## Repository layout

- `app/`: Expo Router routes for mobile and web surfaces
- `src/components/`: reusable primitives, feature UI, and web-specific marketing/admin components
- `src/design/`: tokens, themes, and appearance logic
- `src/features/`: bootstraps and domain feature hooks
- `src/providers/`: auth, analytics, resilience, monitoring, and app-level wiring
- `src/services/`: Firebase, room workflow, safety, analytics, voice, diagnostics, and platform adapters
- `src/store/`: persisted app and room state
- `src/types/`: typed domain, provider, analytics, and runtime models
- `docs/`: product, architecture, delivery, deployment, and environment documentation

## Local setup

### 1. Install dependencies

```bash
npm install
```

### 2. Add environment variables

Copy `.env.example` to `.env` and fill in the Firebase web app values:

```bash
EXPO_PUBLIC_FIREBASE_API_KEY=...
EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN=...
EXPO_PUBLIC_FIREBASE_PROJECT_ID=...
EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET=...
EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=...
EXPO_PUBLIC_FIREBASE_APP_ID=...
```

### 3. Start the web app

```bash
npm run web
```

If Expo has stale cache or a newly added dependency is not resolving, restart with:

```bash
npx expo start --web -c
```

Useful local routes:

- `http://localhost:8081/marketing`
- `http://localhost:8081/admin`
- `http://localhost:8081/`

## Development workflow

This project currently follows a web-first product workflow:

1. Build and validate flows in the browser first.
2. Keep product logic, state, and service boundaries mobile-safe.
3. Use the web surface for planning, auth, room setup, moderation, and product storytelling.
4. Move ride-time hardware-sensitive behavior back into native mobile when it depends on permissions, background execution, or device audio constraints.

Recommended daily loop:

1. Start the app with `npm run web`.
2. Work primarily in `/marketing`, `/admin`, `/(auth)`, and signed-in web tabs.
3. Run `npm run typecheck` after each meaningful change.
4. Run tests before pushing changes.
5. Only move a feature into mobile-specific work once the product behavior is proven on web.

## Validation workflow

Run these before opening a PR or pushing a branch:

```bash
npm run typecheck
npm test -- --runInBand
```

If end-to-end coverage is configured for the surface you touched:

```bash
npm run test:e2e
```

## Firebase workflow

Web sign-in depends on Firebase configuration.

1. Create a Firebase project.
2. Add a Web App inside Firebase.
3. Enable `Email/Password` authentication.
4. Create Firestore.
5. Copy the Firebase values into `.env`.
6. Restart Expo after saving `.env`.

Without Firebase configuration, the UI shell will load but authenticated flows will not complete.

## Product workflow assumptions

Important implementation decisions for the current phase:

- Headsets and intercoms should pair through the operating system Bluetooth settings first.
- The browser should use the selected system audio devices instead of depending on direct browser Bluetooth control.
- Web is the proving ground for product behavior, not the final substitute for native ride-time execution.

## What is ready on web today

- marketing site
- onboarding and auth shell
- room create, join, and lobby flows
- desktop command-center storytelling and product framing
- browser-safe map and coordination simulations
- chat, pings, SOS, moderation, diagnostics, and admin surfaces

## What still belongs to native mobile

- background location behavior
- native notification delivery
- ride-time battery and GPS cadence tuning
- true mobile audio routing edge cases
- permission-sensitive runtime behavior during active rides

## Suggested Git workflow

Use short-lived branches from the main line for each product slice:

1. Create a branch for one focused area of work.
2. Keep UI, docs, and service changes cohesive within that branch.
3. Run validation locally.
4. Push the branch to GitHub.
5. Open a PR with screenshots or notes for the affected web surface.

## Supporting docs

Start here:

- [docs/environment-setup.md](docs/environment-setup.md)
- [docs/deployment-approach.md](docs/deployment-approach.md)
- [docs/web-first-development.md](docs/web-first-development.md)
- [docs/technical-architecture.md](docs/technical-architecture.md)

## Status

The repository is now positioned as a serious product foundation with:

- a premium marketing surface
- a browser-first product experience
- internal admin tooling
- a shared architecture ready to continue into native mobile

The next major step is to keep hardening the signed-in web product while preserving the future mobile runtime path where real on-bike constraints matter most.
