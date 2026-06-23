# RideSync Environment Setup

## Required local tools

- Node.js 20 LTS
- npm 10+
- Expo CLI via `npx expo`
- iOS Simulator or Android Emulator for local device testing
- Playwright browsers for web smoke checks: `npx playwright install`

## Install

```bash
npm install
```

## Local run commands

```bash
npm start
npm run web
npm run typecheck
npm test -- --runInBand
npm run test:e2e
```

## Firebase local setup

RideSync now supports Firebase through `EXPO_PUBLIC_FIREBASE_*` environment variables, which is the easiest path for web development.

1. In the Firebase console, create a project or use a staging project.
2. Add a **Web App** inside that project.
3. In **Authentication**, enable the **Email/Password** sign-in provider.
4. In **Firestore Database**, create the database in production or test mode for staging.
5. Copy `.env.example` to `.env`.
6. Fill in the values from your Firebase Web App config.

Expected `.env` shape:

```bash
EXPO_PUBLIC_FIREBASE_API_KEY=...
EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN=...
EXPO_PUBLIC_FIREBASE_PROJECT_ID=...
EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET=...
EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=...
EXPO_PUBLIC_FIREBASE_APP_ID=...
```

After adding `.env`, restart Expo so the values are picked up.

Legacy note:
- Expo `extra.firebase` is still supported as a fallback, but `.env` is the preferred local path.

## Runtime env notes

- `EXPO_PUBLIC_LIVEKIT_URL`
- `EXPO_PUBLIC_LIVEKIT_TOKEN`
- `E2E_BASE_URL`

Notes:
- Voice falls back to simulation when LiveKit values are missing.
- Playwright smoke coverage skips when `E2E_BASE_URL` is not set.
- Analytics, diagnostics, and release instrumentation are local-first in this beta baseline and safe to inspect without backend wiring.

## Beta staging expectations

- Firebase Auth and Firestore should point at a staging project, not production.
- Notification entitlements and device testing should be validated on physical iOS and Android hardware.
- LiveKit credentials should be short-lived and scoped to the beta environment.

## Validation before handing a build to testers

1. Confirm sign-in, profile setup, and permissions flow on at least one iOS and one Android device.
2. Verify room create/join, ping, SOS, safety, and diagnostics flows with staging config.
3. Run Jest with `npm test -- --runInBand`.
4. Run Playwright smoke checks against the deployed web preview if used in QA.
