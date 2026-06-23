# RideSync Deployment Approach

## Opinionated stack

- Mobile app: Expo application shipped through EAS Build and EAS Update for iOS and Android.
- Web marketing and admin surfaces: Expo Router web build exported from the same repository and deployed to Firebase Hosting.
- Backend: Firebase Auth, Firestore, Cloud Functions, Cloud Messaging, and Cloud Storage.
- Realtime media: LiveKit as the first voice provider behind the app-side provider abstraction.
- Observability: Sentry for crash and performance monitoring, Firebase Analytics for growth funnels, and the local diagnostics stream for beta support.

## Why one repo and one routing layer

- Shared tokens, primitives, and motion rules keep the mobile product, landing page, and admin console visually aligned.
- Expo Router gives us mobile and web navigation without introducing a second frontend stack too early.
- Shared TypeScript domain models reduce drift between rider-facing flows and internal moderation views.

## Environments

- `development`: local Expo app, emulator devices, Firebase emulator suite where practical, and a staging LiveKit project.
- `staging`: internal beta environment with isolated Firebase project, staging Hosting site, and staged OTA updates.
- `production`: public mobile release, production Firebase project, production Hosting site, and locked-down provider credentials.

## Delivery topology

### Mobile

- Build native binaries with EAS for `preview`, `beta`, and `production` profiles.
- Use EAS Update for non-breaking JS, copy, analytics, and visual fixes.
- Reserve native rebuilds for permissions, SDK upgrades, and media stack changes.

### Web

- Export the Expo Router web bundle during CI.
- Deploy `marketing` and `admin` routes to Firebase Hosting with rewrite support for client-side navigation.
- Protect the admin Hosting target behind Firebase Auth plus allowlist rules before external moderator access is introduced.

## CI/CD

1. Run `npm run lint`, `npm run typecheck`, `npm test -- --runInBand`, and `npm run test:e2e` in CI.
2. Build preview artifacts for pull requests that touch app shell, ride flows, or shared primitives.
3. Promote to staging after product review, analytics verification, and permission disclosure review.
4. Promote to production only after store metadata, privacy disclosures, and backend rules are validated.

## Backend deployment notes

- Keep Firestore rules and Cloud Functions versioned alongside the app.
- Split callable functions by bounded domain: rooms, moderation, notifications, and telemetry ingestion.
- Store notification templates and moderation thresholds in Remote Config so operational tuning does not require a client release.

## Admin and moderation rollout

- Start with the lightweight in-repo admin console for internal beta operations.
- Move to authenticated server-backed admin queries once room volume or abuse volume exceeds what local snapshot inspection can support.
- Keep moderation actions auditable from day one, even if the first release is read-heavy.
