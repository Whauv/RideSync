import { StyleSheet, View } from "react-native";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import MapView, { Marker, PROVIDER_GOOGLE } from "react-native-maps";

import { AppText } from "@/components/core/AppText";
import { useTheme } from "@/design/ThemeProvider";
import { RiderPresence } from "@/types/domain";

interface MapPreviewProps {
  riders: RiderPresence[];
}

export function MapPreview({ riders }: MapPreviewProps) {
  const theme = useTheme();
  const lead = riders[0];

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.surfaceStrong }]}>
      <MapView
        provider={PROVIDER_GOOGLE}
        style={StyleSheet.absoluteFill}
        scrollEnabled={false}
        rotateEnabled={false}
        pitchEnabled={false}
        toolbarEnabled={false}
        initialRegion={{
          latitude: lead?.lat ?? 39.7392,
          longitude: lead?.lng ?? -104.9903,
          latitudeDelta: 0.07,
          longitudeDelta: 0.07
        }}
        customMapStyle={[
          { elementType: "geometry", stylers: [{ color: theme.colors.mapTerrain }] },
          { elementType: "labels.text.fill", stylers: [{ color: theme.colors.textSoft }] },
          { elementType: "labels.text.stroke", stylers: [{ color: theme.colors.mapTerrain }] },
          { featureType: "road", elementType: "geometry", stylers: [{ color: theme.colors.mapRoad }] },
          { featureType: "poi", stylers: [{ visibility: "off" }] },
          { featureType: "transit", stylers: [{ visibility: "off" }] },
          { featureType: "water", elementType: "geometry", stylers: [{ color: theme.colors.surfaceMuted }] }
        ]}
      >
        {riders.map((rider) => (
          <Marker
            key={rider.id}
            coordinate={{ latitude: rider.lat, longitude: rider.lng }}
            title={rider.name}
            description={`${rider.speedMph} mph`}
          >
            <View
              style={[
                styles.pin,
                {
                  backgroundColor: rider.role === "leader" ? theme.colors.accent : theme.colors.surface,
                  borderColor: rider.role === "leader" ? theme.colors.accent : theme.colors.line
                }
              ]}
            >
              <MaterialCommunityIcons
                name={rider.role === "leader" ? "navigation-variant" : "motorbike"}
                size={14}
                color={rider.role === "leader" ? theme.colors.bg : theme.colors.text}
              />
            </View>
          </Marker>
        ))}
      </MapView>
      <View style={[styles.legend, { backgroundColor: theme.colors.bgOverlay, borderColor: theme.colors.line }]}>
        <AppText variant="caption">Formation live</AppText>
        <AppText variant="caption" tone="soft">
          Speed and heading update from location stream.
        </AppText>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    height: 340,
    borderRadius: 28,
    overflow: "hidden",
    position: "relative"
  },
  pin: {
    width: 34,
    height: 34,
    borderRadius: 17,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1.5
  },
  legend: {
    position: "absolute",
    left: 14,
    right: 14,
    bottom: 14,
    borderRadius: 18,
    borderWidth: 1,
    padding: 12,
    gap: 2
  }
});
