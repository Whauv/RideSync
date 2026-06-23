import { StyleSheet, View } from "react-native";
import { MaterialCommunityIcons } from "@expo/vector-icons";

import { AppText } from "@/components/primitives/AppText";
import { Chip } from "@/components/primitives/Chip";
import { useTheme } from "@/design/ThemeProvider";
import { RiderPresence } from "@/types/domain";

interface MapPreviewProps {
  riders: RiderPresence[];
}

function projectPoints(riders: RiderPresence[]) {
  const lats = riders.map((rider) => rider.lat);
  const lngs = riders.map((rider) => rider.lng);
  const minLat = Math.min(...lats);
  const maxLat = Math.max(...lats);
  const minLng = Math.min(...lngs);
  const maxLng = Math.max(...lngs);

  return (lat: number, lng: number) => ({
    left: 48 + ((lng - minLng) / Math.max(maxLng - minLng, 0.0001)) * 250,
    top: 56 + ((maxLat - lat) / Math.max(maxLat - minLat, 0.0001)) * 180
  });
}

export function MapPreview({ riders }: MapPreviewProps) {
  const theme = useTheme();
  const project = projectPoints(riders);

  return (
    <View style={[styles.shell, { backgroundColor: theme.colors.canvas, borderColor: theme.colors.lineSubtle }]}>
      <View style={[styles.arcPrimary, { borderColor: theme.colors.mapRoad }]} />
      <View style={[styles.arcSecondary, { borderColor: theme.colors.mapRoute }]} />

      {riders.map((rider) => {
        const position = project(rider.lat, rider.lng);

        return (
          <View
            key={rider.id}
            style={[
              styles.marker,
              position,
              {
                width: rider.role === "leader" ? 38 : 34,
                height: rider.role === "leader" ? 38 : 34,
                borderRadius: rider.role === "leader" ? 19 : 17,
                backgroundColor: rider.role === "leader" ? theme.colors.mapLeader : theme.colors.surface,
                borderColor: rider.role === "leader" ? theme.colors.mapLeader : theme.colors.lineStrong
              }
            ]}
          >
            <MaterialCommunityIcons
              color={rider.role === "leader" ? theme.colors.textInverse : theme.colors.mapRider}
              name={rider.role === "leader" ? "navigation-variant" : "motorbike"}
              size={16}
            />
          </View>
        );
      })}

      <View style={styles.topRail}>
        <Chip icon="monitor" label="Web map" tone="accent" />
        <Chip icon="signal" label="Telemetry stable" tone="success" />
      </View>

      <View style={[styles.legend, { backgroundColor: theme.colors.surfaceOverlay, borderColor: theme.colors.lineSubtle }]}>
        <AppText variant="footnote" tone="secondary">
          Browser ride preview
        </AppText>
        <AppText variant="title3">Shared UI, simulated map transport, same ride hierarchy</AppText>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  shell: {
    height: 360,
    borderRadius: 30,
    borderWidth: 1,
    overflow: "hidden",
    position: "relative"
  },
  arcPrimary: {
    position: "absolute",
    width: 320,
    height: 320,
    borderRadius: 999,
    borderWidth: 18,
    opacity: 0.16,
    top: -80,
    left: -34
  },
  arcSecondary: {
    position: "absolute",
    width: 220,
    height: 220,
    borderRadius: 999,
    borderWidth: 4,
    borderStyle: "dashed",
    opacity: 0.55,
    bottom: 6,
    right: -24
  },
  marker: {
    position: "absolute",
    marginLeft: -17,
    marginTop: -17,
    borderWidth: 1.5,
    alignItems: "center",
    justifyContent: "center"
  },
  topRail: {
    position: "absolute",
    top: 14,
    left: 14,
    flexDirection: "row",
    gap: 8
  },
  legend: {
    position: "absolute",
    left: 14,
    right: 14,
    bottom: 14,
    borderWidth: 1,
    borderRadius: 22,
    padding: 12,
    gap: 2
  }
});
