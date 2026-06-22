# RideSync Feature-Based Folder Structure

## Principles

- Organize by business capability, not by generic technical layer alone.
- Keep UI, hooks, services, and types close to the feature that owns them.
- Promote only truly shared primitives into global folders.
- Separate product analytics, operational telemetry, and provider adapters.

## Proposed structure

```text
RideSync/
  app/
    _layout.tsx
    index.tsx
    (auth)/
    (app)/
      _layout.tsx
      home.tsx
      room/
        [roomId].tsx
      settings.tsx
  docs/
  src/
    core/
      api/
        firebase/
        functions/
      config/
      constants/
      errors/
      logging/
      permissions/
      storage/
      telemetry/
      types/
      utils/
    design/
      tokens/
      themes/
      motion/
      typography/
    providers/
      AppProviders.tsx
    shared/
      components/
      hooks/
      stores/
    features/
      analytics/
        events/
        hooks/
        services/
        types/
      auth/
        components/
        hooks/
        screens/
        services/
        store/
        types/
      rooms/
        components/
        hooks/
        screens/
        services/
        store/
        types/
      ride-map/
        components/
        hooks/
        services/
        types/
      ride-presence/
        hooks/
        services/
        types/
      voice/
        components/
        hooks/
        services/
        providers/
        store/
        types/
      messaging/
        components/
        hooks/
        services/
        types/
      music-sync/
        hooks/
        services/
        providers/
        types/
      notifications/
        services/
        hooks/
      safety/
        components/
        hooks/
        services/
        types/
      settings/
        components/
        hooks/
        screens/
        store/
    test/
      fixtures/
      mocks/
```

## Ownership boundaries

### `core/`

- app-wide infrastructure
- Firebase clients
- low-level permission wrappers
- logging and storage utilities

### `design/`

- token system
- theme primitives
- motion constants
- typography decisions

### `shared/`

- reusable UI that is not product-specific
- cross-feature hooks with no domain ownership

### `features/`

- each feature owns its API client calls, store slices, feature components, and local types
- provider integrations live inside the owning feature unless globally required

## Concrete conventions

- Each feature gets an `index.ts` barrel only if imports become noisy.
- Server DTOs should live next to the feature service that consumes them.
- Analytics event definitions live in `features/analytics`, not sprinkled through product features.
- Avoid a global `components/` folder for domain-specific UI like rider cards or voice indicators.
- Keep screen files thin; move logic into hooks and services.

## First features to build against this structure

1. `auth`
2. `rooms`
3. `ride-map`
4. `ride-presence`
5. `voice`
6. `messaging`
7. `safety`
