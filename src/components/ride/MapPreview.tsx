import { StyleSheet, View } from "react-native";
import MapView, { Marker, PROVIDER_GOOGLE } from "react-native-maps";
import { MaterialCommunityIcons } from "@expo/vector-icons";

import { AppText } from "@/components/primitives/AppText";
import { Chip } from "@/components/primitives/Chip";
import { useTheme } from "@/design/ThemeProvider";
import { RiderPresence } from "@/types/domain";

interface MapPreviewProps {
  riders: RiderPresence[];
}

export function MapPreview({ riders }: MapPreviewProps) {
  const theme = useTheme();
  const lead = riders[0];

  return (
    <View style={[styles.shell, { backgroundColor: theme.colors.canvas, borderColor: theme.colors.lineSubtle }]}>
      <MapView
        customMapStyle={[
          { elementType: "geometry", stylers: [{ color: theme.colors.mapBase }] },
          { featureType: "road", elementType: "geometry", stylers: [{ color: theme.colors.mapRoad }] },
          { featureType: "water", elementType: "geometry", stylers: [{ color: theme.colors.mapWater }] },
          { featureType: "poi", stylers: [{ visibility: "off" }] },
          { featureType: "transit", stylers: [{ visibility: "off" }] }
        ]}
        initialRegion={{
          latitude: lead?.lat ?? 39.7392,
          longitude: lead?.lng ?? -104.9903,
          latitudeDelta: 0.06,
          longitudeDelta: 0.05
        }}
        pitchEnabled={false}
        provider={PROVIDER_GOOGLE}
        rotateEnabled={false}
        scrollEnabled={false}
        style={StyleSheet.absoluteFill}
        toolbarEnabled={false}
      >
        {riders.map((rider) => (
          <Marker key={rider.id} coordinate={{ latitude: rider.lat, longitude: rider.lng }} title={rider.name}>
            <View
              style={[
                styles.marker,
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
          </Marker>
        ))}
      </MapView>

      <View style={styles.topRail}>
        <Chip icon="cellphone-wireless" label="Voice live" tone="accent" />
        <Chip icon="signal" label="Telemetry stable" tone="success" />
      </View>

      <View style={[styles.legend, { backgroundColor: theme.colors.surfaceOverlay, borderColor: theme.colors.lineSubtle }]}>
        <AppText variant="footnote" tone="secondary">
          Rider formation
        </AppText>
        <AppText variant="title3">12 riders | Heading north-west | Pack intact</AppText>
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
  marker: {
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
