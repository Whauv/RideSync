import { useMemo, useState } from "react";
import { StyleSheet, View, Pressable } from "react-native";
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

function fuelAlertTone(alert?: FuelAlert) {
  if (!alert) {
    return "success";
  }

  return alert.level === "critical" ? "danger" : "warning";
}

function projectPoints(riders: RiderPresence[], layers: RideLayerMarker[]) {
  const points = [
    ...riders.map((rider) => ({ id: rider.id, lat: rider.lat, lng: rider.lng })),
    ...layers.map((layer) => ({ id: layer.id, lat: layer.lat, lng: layer.lng }))
  ];
  const lats = points.map((point) => point.lat);
  const lngs = points.map((point) => point.lng);
  const minLat = Math.min(...lats);
  const maxLat = Math.max(...lats);
  const minLng = Math.min(...lngs);
  const maxLng = Math.max(...lngs);

  return (lat: number, lng: number) => ({
    left: 56 + ((lng - minLng) / Math.max(maxLng - minLng, 0.0001)) * 350,
    top: 74 + ((maxLat - lat) / Math.max(maxLat - minLat, 0.0001)) * 350
  });
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
  const selectedRider = useMemo(() => riders.find((rider) => rider.id === selectedRiderId) ?? null, [riders, selectedRiderId]);
  const project = useMemo(() => projectPoints(riders, layers), [layers, riders]);
  const topStraggler = safety.stragglers[0];
  const topFuelAlert = safety.fuelAlerts[0];

  return (
    <>
      <View style={[styles.shell, { borderColor: theme.colors.lineSubtle, backgroundColor: theme.colors.canvas }]}>
        <View
          style={[
            styles.mapPlane,
            {
              backgroundColor: mapMode === "night" ? theme.colors.mapBase : theme.colors.canvas
            }
          ]}
        >
          <View style={[styles.webModeBadge, { backgroundColor: theme.colors.surfaceOverlay, borderColor: theme.colors.lineSubtle }]}>
            <Chip icon="monitor" label="Web simulation map" tone="accent" />
          </View>

          <View style={[styles.routeBandPrimary, { borderColor: theme.colors.mapRoad }]} />
          <View style={[styles.routeBandSecondary, { borderColor: theme.colors.mapRoute }]} />

          {layers.map((layer) => {
            const position = project(layer.lat, layer.lng);

            return (
              <View
                key={layer.id}
                style={[
                  styles.layerNode,
                  position,
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
                  name={
                    layer.type === "emergency"
                      ? "alert-octagon"
                      : layer.type === "hazard"
                        ? "alert"
                        : layer.type === "fuel"
                          ? "gas-station"
                          : "map-marker-check"
                  }
                  size={14}
                />
              </View>
            );
          })}

          {riders.map((rider) => {
            const position = project(rider.lat, rider.lng);
            const voiceParticipant = voiceParticipants[rider.id];
            const isLeader = rider.role === "leader";
            const isSelected = selectedRiderId === rider.id;

            return (
              <Pressable key={rider.id} onPress={() => setSelectedRiderId(rider.id)} style={[styles.riderNodeWrap, position]}>
                {voiceParticipant?.isSpeaking ? (
                  <View style={[styles.speakingHalo, { borderColor: theme.colors.accent }]} />
                ) : null}
                <View
                  style={[
                    styles.riderNode,
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
              </Pressable>
            );
          })}
        </View>

        <View style={styles.topOverlay}>
          <Surface raised style={styles.hudCard}>
            <View style={styles.hudTop}>
              <View style={styles.hudCopy}>
                <AppText tone="secondary" variant="footnote">
                  {room.routeTitle ?? "Open route"} | {riders.length} riders
                </AppText>
                <AppText variant="title2">{room.title}</AppText>
              </View>
              <Chip label={mapMode} tone="accent" />
            </View>
            <View style={styles.hudMetrics}>
              <View>
                <AppText variant="metric">{safety.insights.averageSpeedMph || 0}</AppText>
                <AppText tone="secondary" variant="footnote">
                  Avg mph
                </AppText>
              </View>
              <View style={styles.metricCopy}>
                <AppText variant="title3">{layers[0]?.title ?? "Formation stable"}</AppText>
                <AppText tone="secondary" variant="footnote">
                  {layers[0]?.subtitle ?? "Browser surface mirrors core ride hierarchy."}
                </AppText>
              </View>
            </View>
            <View style={styles.statusChips}>
              <Chip
                label={topStraggler ? `${topStraggler.riderName} ${topStraggler.distanceMiles.toFixed(1)} mi back` : "Pack spacing stable"}
                tone={topStraggler ? (topStraggler.severity === "assist" ? "warning" : "accent") : "success"}
              />
              <Chip
                label={topFuelAlert ? `${topFuelAlert.riderName} ${Math.round(topFuelAlert.rangeMiles)} mi fuel` : "Fuel margin healthy"}
                tone={fuelAlertTone(topFuelAlert)}
              />
            </View>
            {activeAlert?.status === "active" ? (
              <View style={styles.alertRow}>
                <Chip label={activeAlert.kind === "sos" ? "SOS ACTIVE" : "Emergency"} tone="danger" />
                <AppText tone="secondary" variant="footnote">
                  {activeAlert.triggeredByName}
                </AppText>
              </View>
            ) : null}
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
            <AppText variant="title3">Web-first ride validation</AppText>
            <AppText tone="secondary" variant="footnote">
              Browser mode keeps the layout, overlays, and coordination flows testable while mobile-native map and audio adapters stay isolated.
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
                <AppText tone="secondary" variant="footnote">
                  Speed
                </AppText>
                <AppText variant="title2">{selectedRider.speedMph} mph</AppText>
              </Surface>
              <Surface muted style={styles.sheetMetricCard}>
                <AppText tone="secondary" variant="footnote">
                  Distance from leader
                </AppText>
                <AppText variant="title2">{(selectedRider.distanceFromLeaderMiles ?? haversineMiles(leader, selectedRider)).toFixed(1)} mi</AppText>
              </Surface>
            </View>

            <Surface muted style={styles.detailBlock}>
              <AppText tone="secondary" variant="footnote">
                Signal state
              </AppText>
              <AppText variant="title3">{selectedRider.signalState}</AppText>
              <AppText tone="secondary">
                Fuel range: {typeof selectedRider.fuelRangeMiles === "number" ? `${Math.round(selectedRider.fuelRangeMiles)} mi remaining` : "Not reported yet"}
              </AppText>
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
  mapPlane: {
    ...StyleSheet.absoluteFillObject
  },
  webModeBadge: {
    position: "absolute",
    top: 12,
    right: 12,
    borderWidth: 1,
    borderRadius: 999,
    padding: 6
  },
  routeBandPrimary: {
    position: "absolute",
    width: 420,
    height: 420,
    borderRadius: 999,
    borderWidth: 18,
    opacity: 0.15,
    top: -90,
    left: -40
  },
  routeBandSecondary: {
    position: "absolute",
    width: 300,
    height: 300,
    borderRadius: 999,
    borderWidth: 4,
    borderStyle: "dashed",
    opacity: 0.55,
    bottom: 18,
    right: -50
  },
  layerNode: {
    position: "absolute",
    width: 30,
    height: 30,
    borderRadius: 15,
    borderWidth: 1.5,
    alignItems: "center",
    justifyContent: "center",
    marginLeft: -15,
    marginTop: -15
  },
  riderNodeWrap: {
    position: "absolute",
    marginLeft: -21,
    marginTop: -21,
    alignItems: "center",
    justifyContent: "center"
  },
  speakingHalo: {
    position: "absolute",
    width: 54,
    height: 54,
    borderRadius: 27,
    borderWidth: 1.5
  },
  riderNode: {
    borderWidth: 1.5,
    alignItems: "center",
    justifyContent: "center"
  },
  topOverlay: {
    position: "absolute",
    top: 14,
    left: 14,
    right: 90
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
  metricCopy: {
    flex: 1,
    gap: 2
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
    bottom: 14,
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
