# RideSync Music Sync Constraints

## Product stance

RideSync ships a provider-neutral music sync contract, not an app-owned streaming service. The first implementation is a metadata-and-timestamp simulation path that models queue control, play/pause/skip, sync health, drift, and rider lag without claiming rights to stream third-party catalog audio.

## Architecture decision

- Leader authority is the source of truth for queue order, track metadata, transport commands, and sync anchor timestamps.
- Riders receive synchronized metadata and timing targets, then resolve playback locally through a provider adapter.
- The default adapter is `simulation`, which is legally conservative because it does not stream provider-owned catalog audio.
- Future adapters can target `spotify`, `apple_music`, or `local_file`, but each must enforce provider-specific policy checks before enabling actual media playback.

## Spotify constraints

- Spotify’s Web Playback SDK is documented as creating a local Spotify Connect device and streaming Spotify content inside a website application. It requires Spotify Premium. Source: [Spotify Web Playback SDK](https://developer.spotify.com/documentation/web-playback-sdk).
- Spotify also states that the Web Playback SDK must not be used in commercial projects without prior written approval. Source: [Spotify Web Playback SDK legal section](https://developer.spotify.com/documentation/web-playback-sdk).
- Spotify’s developer policy is effective as of **May 15, 2025** and governs access to the Spotify Platform. Source: [Spotify Developer Policy](https://developer.spotify.com/policy).

Inference from those sources:
- We should not treat Spotify as a generic background audio transport inside RideSync.
- A future Spotify adapter should be opt-in, account-linked, and policy-gated.
- Shared playback should be modeled as synchronized control over provider playback, not rebroadcasting Spotify audio from one rider to the group.

## Apple Music / MusicKit constraints

- Apple exposes MusicKit as the official developer surface for Apple Music integrations. Source: [MusicKit](https://developer.apple.com/documentation/musickit).

Inference from Apple’s official positioning:
- Apple Music playback must remain inside an Apple-sanctioned integration path.
- RideSync should not assume cross-platform parity for Apple Music playback behavior.
- A future Apple Music adapter should be isolated behind capability checks and subscription / platform requirements.

## Local file constraints

- Local file playback is only safe when RideSync owns, licenses, or is explicitly permitted to use the underlying audio.
- User-imported local files may be technically feasible, but product policy should avoid implying redistribution or group sharing rights.
- For MVP and V1 architecture, local-file support should be framed as per-device playback under user or app ownership, not group rebroadcasting.

## Platform constraints

- Background audio behavior varies by platform and must be configured per provider and OS audio session rules.
- App Store review may scrutinize any experience that appears to recreate provider streaming outside approved SDKs.
- Precise shared playback can be affected by Bluetooth lag, device thermal state, route changes, and provider-specific transport delays.

## Recommended integration path

1. Keep the sync subsystem provider-neutral and timestamp-based.
2. Treat provider adapters as separate compliance boundaries.
3. Only enable real provider playback when:
   - the provider officially supports the target platform and use case,
   - the rider has the required account/subscription state,
   - RideSync can satisfy branding, playback, and policy requirements,
   - the adapter can expose measurable drift and re-sync behavior.
4. Keep simulation available for development, demos, and unsupported provider states.
