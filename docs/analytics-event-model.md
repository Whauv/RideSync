# RideSync Analytics Event Model

## Principles

- Track decisions and outcomes, not raw continuous location traces.
- Separate product analytics from operational telemetry.
- Every event must have a clear owner and actionability.
- PII should be minimized and never include message bodies or exact ride coordinates in analytics.

## Common event envelope

All analytics events should include:

| Field | Type | Notes |
| --- | --- | --- |
| `event_name` | string | stable snake_case name |
| `event_id` | string | client-generated UUID |
| `occurred_at` | string | ISO timestamp |
| `user_id` | string | authenticated rider id |
| `room_id` | string nullable | included when ride-scoped |
| `platform` | enum | `ios`, `android` |
| `app_version` | string | semver or build |
| `network_type` | enum nullable | `wifi`, `cellular`, `offline`, `unknown` |
| `session_id` | string | app session id |
| `ride_session_id` | string nullable | active ride session correlation id |

## Core events

### Authentication and onboarding

| Event | When | Key properties |
| --- | --- | --- |
| `auth_started` | auth flow begins | `method` |
| `auth_succeeded` | auth completes | `method`, `is_new_user` |
| `auth_failed` | auth fails | `method`, `error_code` |
| `permission_prompt_shown` | permission explanation shown | `permission_type`, `context` |
| `permission_result` | user responds to OS prompt | `permission_type`, `result` |

### Room lifecycle

| Event | When | Key properties |
| --- | --- | --- |
| `room_create_started` | leader opens create flow | `entry_point` |
| `room_created` | room successfully created | `voice_provider`, `music_mode` |
| `room_join_started` | user attempts join | `join_method` |
| `room_join_succeeded` | room entry completes | `join_method`, `join_duration_ms`, `role` |
| `room_join_failed` | join attempt fails | `join_method`, `error_code` |
| `room_left` | rider leaves room | `leave_reason`, `role` |
| `leader_transferred` | leadership changes | `transfer_reason` |

### Ride lifecycle

| Event | When | Key properties |
| --- | --- | --- |
| `ride_session_started` | staged room becomes active ride | `rider_count` |
| `ride_session_paused` | leader pauses active ride | `reason` |
| `ride_session_resumed` | ride resumes | `reason` |
| `ride_session_ended` | ride ends | `duration_minutes`, `rider_count_end` |
| `rider_marked_stale` | presence exceeds stale threshold | `stale_seconds`, `role` |
| `rider_recovered_from_stale` | updates resume | `stale_seconds` |

### Voice and comms

| Event | When | Key properties |
| --- | --- | --- |
| `voice_connect_started` | client begins voice connection | `provider` |
| `voice_connect_succeeded` | voice session ready | `provider`, `connect_duration_ms` |
| `voice_connect_failed` | voice connection fails | `provider`, `error_code` |
| `voice_reconnect_attempted` | reconnect loop starts | `provider`, `attempt_number` |
| `voice_reconnect_succeeded` | reconnect succeeds | `provider`, `attempt_count`, `duration_ms` |
| `quick_action_sent` | rider sends quick action | `action_type`, `role` |
| `message_sent` | rider sends text message | `message_type` |
| `sos_triggered` | confirmed SOS raised | `role`, `battery_bucket` |
| `sos_cleared` | SOS resolved | `resolution_type` |

### Mapping and location

| Event | When | Key properties |
| --- | --- | --- |
| `location_stream_started` | foreground ride location starts | `permission_precision` |
| `location_stream_degraded` | updates reduce in quality | `reason` |
| `location_stream_recovered` | normal quality resumes | `reason` |
| `map_view_changed` | user changes map mode | `view_mode` |

### Music sync

| Event | When | Key properties |
| --- | --- | --- |
| `music_sync_enabled` | rider opts in | `provider` |
| `music_sync_disabled` | rider opts out | `reason` |
| `music_transport_received` | leader transport event received | `transport_type` |
| `music_sync_error` | sync failed | `provider`, `error_code` |

## Derived metrics

- join conversion = `room_join_succeeded / room_join_started`
- permission acceptance by type = `permission_result`
- voice connection success rate = `voice_connect_succeeded / voice_connect_started`
- stale rider rate = `rider_marked_stale / ride_session_started`
- quick-action adoption = `quick_action_sent / ride_session_started`
- SOS false-positive rate = `sos_cleared` where resolution is `false_alarm`

## Event ownership

- product analytics schema owner: product + mobile lead
- implementation owner: frontend platform
- warehouse semantics owner: data/analytics

## Anti-events

Do not log:

- raw message contents
- exact coordinate streams for analytics
- audio metadata beyond provider and session health
- emergency contact details
