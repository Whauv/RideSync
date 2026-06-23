import { useMemo, useState } from "react";
import { StyleSheet, View } from "react-native";
import MapView, { Marker, Polyline, PROVIDER_GOOGLE } from "react-native-maps";
import { MaterialCommunityIcons } from "@expo/vector-icons";

import { AppText } from "@/components/primitives/AppText";
import { BottomSheet } from "@/components/primitives/BottomSheet";
import { Chip } from "@/components/primitives/Chip";
import { SegmentedControl } from "@/components/primitives/SegmentedControl";
import { Surface } from "@/components/primitives/Surface";
import { VoiceControlBar } from "@/components/voice/VoiceControlBar";
import { useTheme } from "@/design/ThemeProvider";
import { FuelAlert, RideAlertState, RideLayerMarker, RideMapMode, RideRoom, RiderPresence, SafetySnapshot } from "@/types/domain";
import { VoiceParticipantState, VoiceSessionSnapshot } from "@/types/voice";

interface LiveRideMapProps {
  room: RideRoom;
  riders: RiderPresence[];
  layers: RideLayerMarker[];
  activeAlert: RideAlertState | null;
  safety: SafetySnapshot;
  voiceSession: VoiceSessionSnapshot;
  voiceParticipants: Record<string, VoiceParticipantState>;
  canUseVoice: boolean;
  isLeaderView?: boolean;
  allowLeaderAnnounce?: boolean;
  onToggleMute: () => void;
  onRetryVoice: () => void;
  onLeaderAnnounce: () => void;
}

function getMapStyle(themeMode: "light" | "dark", mapMode: RideMapMode, theme: ReturnType<typeof useTheme>) {
  if (mapMode === "focus") {
    return [
      { elementType: "geometry", stylers: [{ color: theme.colors.surfaceInverse }] },
      { elementType: "labels.text.fill", stylers: [{ color: theme.colors.textTertiary }] },
      { featureType: "road", elementType: "geometry", stylers: [{ color: theme.colors.mapRoute }] },
      { featureType: "poi", stylers: [{ visibility: "off" }] },
      { featureType: "transit", stylers: [{ visibility: "off" }] },
      { featureType: "water", stylers: [{ visibility: "off" }] }
    ];
  }

  if (mapMode === "night" || themeMode === "dark") {
    return [
      { elementType: "geometry", stylers: [{ color: theme.colors.mapBase }] },
      { elementType: "labels.text.fill", stylers: [{ color: theme.colors.textTertiary }] },
      { featureType: "road", elementType: "geometry", stylers: [{ color: theme.colors.mapRoad }] },
      { featureType: "poi", stylers: [{ visibility: "off" }] },
      { featureType: "transit", stylers: [{ visibility: "off" }] },
      { featureType: "water", elementType: "geometry", stylers: [{ color: theme.colors.mapWater }] }
    ];
  }

  return [
    { elementType: "geometry", stylers: [{ color: theme.colors.mapBase }] },
    { elementType: "labels.text.fill", stylers: [{ color: theme.colors.textSecondary }] },
    { featureType: "road", elementType: "geometry", stylers: [{ color: theme.colors.mapRoad }] },
    { featureType: "water", elementType: "geometry", stylers: [{ color: theme.colors.mapWater }] },
    { featureType: "poi", stylers: [{ visibility: "off" }] },
    { featureType: "transit", stylers: [{ visibility: "off" }] }
  ];
}

function haversineMiles(a: RiderPresence, b: RiderPresence) {
  const toRad = (value: number) => (value * Math.PI) / 180;
  const earthRadiusMiles = 3958.8;
  const deltaLat = toRad(b.lat - a.lat);
  const deltaLng = toRad(b.lng - a.lng);
  const lat1 = toRad(a.lat);
  const lat2 = toRad(b.lat);

  const h =
    Math.sin(deltaLat / 2) * Math.sin(deltaLat / 2) +
    Math.cos(lat1) * Math.cos(lat2) * Math.sin(deltaLng / 2) * Math.sin(deltaLng / 2);

  return earthRadiusMiles * (2 * Math.atan2(Math.sqrt(h), Math.sqrt(1 - h)));
}

function layerTone(type: RideLayerMarker["type"]) {
  return type === "emergency" ? "danger" : type === "hazard" ? "warning" : type === "fuel" ? "accent" : "success";
}

function layerIcon(type: RideLayerMarker["type"]) {
  return type === "emergency"
    ? "alert-octagon"
    : type === "hazard"
      ? "alert"
      : type === "fuel"
        ? "gas-station"
        : "map-marker-check";
}

function fuelAlertTone(alert?: FuelAlert) {
  if (!alert) {
    return "success";
  }

  return alert.level === "critical" ? "danger" : "warning";
}

export function LiveRideMap({
  room,
  riders,
  layers,
  activeAlert,
  safety,
  voiceSession,
  voiceParticipants,
  canUseVoice,
  isLeaderView = false,
  allowLeaderAnnounce = true,
  onToggleMute,
  onRetryVoice,
  onLeaderAnnounce
}: LiveRideMapProps) {
  const theme = useTheme();
  const [mapMode, setMapMode] = useState<RideMapMode>("focus");
  const [selectedRiderId, setSelectedRiderId] = useState<string | null>(null);

  const leader = useMemo(() => riders.find((rider) => rider.role === "leader") ?? riders[0], [riders]);
  const selectedRider = useMemo(
    () => riders.find((rider) => rider.id === selectedRiderId) ?? null,
    [riders, selectedRiderId]
  );

  const routePoints = useMemo(
    () =>
      [leader, ...layers.filter((layer) => layer.type !== "emergency").map((layer) => ({ lat: layer.lat, lng: layer.lng }))].filter(Boolean) as {
        lat: number;
        lng: number;
      }[],
    [layers, leader]
  );

  const mapStyle = getMapStyle(theme.mode, mapMode, theme);
  const rideStatusLayer = layers[0];
  const topStraggler = safety.stragglers[0];
  const topFuelAlert = safety.fuelAlerts[0];

  return (
    <>
      <View style={[styles.shell, { borderColor: theme.colors.lineSubtle, backgroundColor: theme.colors.canvas }]}>
        <MapView
          customMapStyle={mapStyle}
          initialRegion={{
            latitude: leader?.lat ?? 39.7392,
            longitude: leader?.lng ?? -104.9903,
            latitudeDelta: 0.055,
            longitudeDelta: 0.05
          }}
          pitchEnabled
          provider={PROVIDER_GOOGLE}
          rotateEnabled={false}
          scrollEnabled
          style={StyleSheet.absoluteFill}
          toolbarEnabled={false}
        >
          <Polyline
            coordinates={routePoints.map((point) => ({ latitude: point.lat, longitude: point.lng }))}
            lineCap="round"
            lineJoin="round"
            strokeColor={theme.colors.mapRoute}
            strokeWidth={mapMode === "focus" ? 5 : 4}
          />

          {layers.map((layer) => (
            <Marker
              key={layer.id}
              coordinate={{ latitude: layer.lat, longitude: layer.lng }}
              description={layer.subtitle}
              title={layer.title}
            >
              <View
                style={[
                  styles.layerMarker,
                  {
                    backgroundColor:
                      layer.type === "emergency"
                        ? theme.state.danger.fill
                        : layer.type === "hazard"
                          ? theme.state.warning.fill
                          : layer.type === "fuel"
                            ? theme.colors.accentMuted
                            : theme.state.success.fill,
                    borderColor: theme.colors.surfaceRaised
                  }
                ]}
              >
                <MaterialCommunityIcons
                  color={
                    layer.type === "emergency"
                      ? theme.colors.danger
                      : layer.type === "hazard"
                        ? theme.colors.warning
                        : layer.type === "fuel"
                          ? theme.colors.accent
                          : theme.colors.success
                  }
                  name={layerIcon(layer.type)}
                  size={16}
                />
              </View>
            </Marker>
          ))}

          {riders.map((rider) => {
            const isLeader = rider.role === "leader";
            const isSelected = selectedRiderId === rider.id;
            const voiceParticipant = voiceParticipants[rider.id];

            return (
              <Marker
                anchor={{ x: 0.5, y: 0.5 }}
                coordinate={{ latitude: rider.lat, longitude: rider.lng }}
                key={rider.id}
                onPress={() => setSelectedRiderId(rider.id)}
                rotation={rider.headingDeg}
              >
                <View
                  style={[
                    styles.riderMarkerWrap,
                    {
                      transform: [{ rotate: `${rider.headingDeg}deg` }]
                    }
                  ]}
                >
                  {voiceParticipant?.isSpeaking ? (
                    <View
                      style={[
                        styles.speakingHalo,
                        {
                          borderColor: theme.colors.accent
                        }
                      ]}
                    />
                  ) : null}
                  <View
                    style={[
                      styles.riderMarker,
                      {
                        width: isLeader ? 42 : 34,
                        height: isLeader ? 42 : 34,
                        borderRadius: isLeader ? 21 : 17,
                        backgroundColor: isLeader ? theme.colors.mapLeader : theme.colors.surfaceRaised,
                        borderColor: isSelected ? theme.colors.accentPressed : theme.colors.lineStrong
                      }
                    ]}
                  >
                      <MaterialCommunityIcons
                        color={isLeader ? theme.colors.textInverse : theme.colors.textPrimary}
                        name={isLeader ? "navigation-variant" : "motorbike"}
                        size={isLeader ? 18 : 15}
                      />
                    </View>
                  {voiceParticipant ? (
                    <View
                      style={[
                        styles.voiceBadge,
                        {
                          backgroundColor:
                            voiceParticipant.networkQuality === "poor"
                              ? theme.state.warning.fill
                              : voiceParticipant.isSpeaking
                                ? theme.colors.accentMuted
                                : theme.colors.surfaceOverlay,
                          borderColor: theme.colors.surfaceRaised
                        }
                      ]}
                    >
                      <MaterialCommunityIcons
                        color={
                          voiceParticipant.networkQuality === "poor"
                            ? theme.colors.warning
                            : voiceParticipant.isSpeaking
                              ? theme.colors.accent
                              : theme.colors.textSecondary
                        }
                        name={voiceParticipant.isSpeaking ? "microphone" : voiceParticipant.isMuted ? "microphone-off" : "waveform"}
                        size={11}
                      />
                    </View>
                  ) : null}
                  <View style={[styles.markerTail, { backgroundColor: isLeader ? theme.colors.mapLeader : theme.colors.surfaceRaised }]} />
                </View>
              </Marker>
            );
          })}
        </MapView>

        <View style={styles.topOverlay}>
          <Surface raised style={styles.hudCard}>
            <View style={styles.hudTop}>
              <View style={styles.hudCopy}>
                <AppText variant="footnote" tone="secondary">
                  {room.routeTitle ?? "Open route"} | {riders.length} riders
                </AppText>
                <AppText variant="title2">{room.title}</AppText>
              </View>
              <Chip label={mapMode} tone="accent" />
            </View>
            <View style={styles.hudMetrics}>
              <View>
                <AppText variant="metric">{safety.insights.averageSpeedMph || 0}</AppText>
                <AppText variant="footnote" tone="secondary">
                  Avg mph
                </AppText>
              </View>
              <View>
                <AppText variant="title3">{rideStatusLayer?.title ?? "Regroup ready"}</AppText>
                <AppText variant="footnote" tone="secondary">
                  {rideStatusLayer?.subtitle ?? "Layer priority synced"}
                </AppText>
              </View>
            </View>
            <View style={styles.statusChips}>
              <Chip
                label={
                  topStraggler
                    ? `${topStraggler.riderName} ${topStraggler.distanceMiles.toFixed(1)} mi back`
                    : "Pack spacing stable"
                }
                tone={topStraggler ? (topStraggler.severity === "assist" ? "warning" : "accent") : "success"}
              />
              <Chip
                label={
                  topFuelAlert
                    ? `${topFuelAlert.riderName} ${Math.round(topFuelAlert.rangeMiles)} mi fuel`
                    : "Fuel margin healthy"
                }
                tone={fuelAlertTone(topFuelAlert)}
              />
            </View>
            {activeAlert?.status === "active" ? (
              <View style={styles.alertRow}>
                <Chip label={activeAlert.kind === "sos" ? "SOS ACTIVE" : "Emergency"} tone="danger" />
                <AppText tone="inverse" variant="footnote">
                  {activeAlert.triggeredByName}
                </AppText>
              </View>
            ) : null}
            {safety.hazards[0] ? (
              <View style={styles.alertRow}>
                <Chip label={safety.hazards[0].status === "confirmed" ? "Hazard confirmed" : "Hazard pending"} tone="warning" />
                <AppText tone="inverse" variant="footnote">
                  {safety.hazards[0].title}
                </AppText>
              </View>
            ) : null}
          </Surface>

          <Surface style={styles.ribbon}>
            <AppText variant="footnote" tone="secondary">
              Route ribbon
            </AppText>
            <View style={styles.ribbonChips}>
              {layers.map((layer) => (
                <Chip key={layer.id} label={layer.title} tone={layerTone(layer.type)} />
              ))}
            </View>
          </Surface>
        </View>

        <View style={styles.rightRail}>
          <SegmentedControl
            onChange={setMapMode}
            options={[
              { label: "Day", value: "day" },
              { label: "Night", value: "night" },
              { label: "Focus", value: "focus" }
            ]}
            value={mapMode}
          />
        </View>

        <View style={styles.bottomHud}>
          <View style={styles.bottomHudStack}>
            <Surface raised style={styles.bottomCard}>
              <View style={styles.bottomRow}>
                <Chip label={leader?.signalState ?? "strong"} tone={leader?.signalState === "weak" ? "warning" : "success"} />
                <Chip label={`${leader?.batteryPct ?? 80}% battery`} tone="neutral" />
                <Chip
                  icon={voiceSession.selfMuted ? "microphone-off" : "microphone"}
                  label={voiceSession.connectionState}
                  tone={voiceSession.connectionState === "connected" ? "success" : "warning"}
                />
              </View>
              <AppText variant="title3">Tap any rider marker for detail</AppText>
              <AppText variant="footnote" tone="secondary">
                Marker details, distance from leader, signal health, fuel margin, and live voice status stay one step deeper.
              </AppText>
            </Surface>

            <VoiceControlBar
              allowLeaderAnnounce={allowLeaderAnnounce}
              canUseVoice={canUseVoice}
              isLeaderView={isLeaderView}
              onLeaderAnnounce={onLeaderAnnounce}
              onRetry={onRetryVoice}
              onToggleMute={onToggleMute}
              voiceSession={voiceSession}
            />
          </View>
        </View>
      </View>

      <BottomSheet onClose={() => setSelectedRiderId(null)} visible={Boolean(selectedRider)}>
        {selectedRider && leader ? (
          <>
            <View style={styles.sheetHeader}>
              <View>
                <AppText variant="title2">{selectedRider.name}</AppText>
                <AppText tone="secondary">{selectedRider.bike}</AppText>
              </View>
              <Chip label={selectedRider.role === "leader" ? "Leader" : selectedRider.status} tone={selectedRider.role === "leader" ? "accent" : "neutral"} />
            </View>

            <View style={styles.sheetMetrics}>
              <Surface muted style={styles.sheetMetricCard}>
                <AppText variant="footnote" tone="secondary">
                  Speed
                </AppText>
                <AppText variant="title2">{selectedRider.speedMph} mph</AppText>
              </Surface>
              <Surface muted style={styles.sheetMetricCard}>
                <AppText variant="footnote" tone="secondary">
                  Distance from leader
                </AppText>
                <AppText variant="title2">{(selectedRider.distanceFromLeaderMiles ?? haversineMiles(leader, selectedRider)).toFixed(1)} mi</AppText>
              </Surface>
            </View>

            <Surface muted style={styles.detailBlock}>
              <AppText variant="footnote" tone="secondary">
                Signal state
              </AppText>
              <AppText variant="title3">{selectedRider.signalState}</AppText>
              {voiceParticipants[selectedRider.id] ? (
                <AppText tone="secondary">
                  Voice {voiceParticipants[selectedRider.id]?.isSpeaking ? "speaking" : voiceParticipants[selectedRider.id]?.isMuted ? "muted" : "listening"} |{" "}
                  {voiceParticipants[selectedRider.id]?.networkQuality} network
                </AppText>
              ) : null}
              <AppText tone="secondary">
                Fuel range: {typeof selectedRider.fuelRangeMiles === "number" ? `${Math.round(selectedRider.fuelRangeMiles)} mi remaining` : "Not reported yet"}
              </AppText>
              {safety.stragglers.find((alert) => alert.riderId === selectedRider.id) ? (
                <Chip
                  label={safety.stragglers.find((alert) => alert.riderId === selectedRider.id)?.detail ?? "Formation monitor"}
                  tone={safety.stragglers.find((alert) => alert.riderId === selectedRider.id)?.severity === "assist" ? "warning" : "accent"}
                />
              ) : null}
              <AppText tone="secondary">Battery estimate placeholder: {selectedRider.batteryPct}% remaining</AppText>
              <AppText tone="secondary">Last update {new Date(selectedRider.lastUpdatedAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit", second: "2-digit" })}</AppText>
            </Surface>
          </>
        ) : null}
      </BottomSheet>
    </>
  );
}

const styles = StyleSheet.create({
  shell: {
    height: 620,
    borderRadius: 32,
    borderWidth: 1,
    overflow: "hidden",
    position: "relative"
  },
  riderMarkerWrap: {
    alignItems: "center",
    justifyContent: "center",
    position: "relative"
  },
  speakingHalo: {
    position: "absolute",
    width: 52,
    height: 52,
    borderRadius: 26,
    borderWidth: 1.5,
    opacity: 0.85
  },
  riderMarker: {
    borderWidth: 1.5,
    alignItems: "center",
    justifyContent: "center"
  },
  voiceBadge: {
    position: "absolute",
    right: -4,
    top: -2,
    width: 18,
    height: 18,
    borderRadius: 9,
    borderWidth: 1,
    alignItems: "center",
    justifyContent: "center"
  },
  markerTail: {
    width: 8,
    height: 12,
    marginTop: -2,
    borderBottomLeftRadius: 4,
    borderBottomRightRadius: 4
  },
  layerMarker: {
    width: 34,
    height: 34,
    borderRadius: 17,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1.5
  },
  topOverlay: {
    position: "absolute",
    top: 14,
    left: 14,
    right: 90,
    gap: 10
  },
  hudCard: {
    padding: 14,
    gap: 10
  },
  hudTop: {
    flexDirection: "row",
    justifyContent: "space-between",
    gap: 12
  },
  hudCopy: {
    flex: 1,
    gap: 2
  },
  hudMetrics: {
    flexDirection: "row",
    justifyContent: "space-between",
    gap: 18
  },
  statusChips: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8
  },
  alertRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8
  },
  ribbon: {
    padding: 12,
    gap: 8
  },
  ribbonChips: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8
  },
  rightRail: {
    position: "absolute",
    top: 18,
    right: 14,
    width: 74
  },
  bottomHud: {
    position: "absolute",
    left: 14,
    right: 14,
    bottom: 14
  },
  bottomHudStack: {
    gap: 10
  },
  bottomCard: {
    padding: 12,
    gap: 6
  },
  bottomRow: {
    flexDirection: "row",
    gap: 8
  },
  sheetHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    gap: 12
  },
  sheetMetrics: {
    flexDirection: "row",
    gap: 12
  },
  sheetMetricCard: {
    flex: 1,
    padding: 14,
    gap: 4
  },
  detailBlock: {
    padding: 14,
    gap: 6
  }
});
