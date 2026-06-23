import { useRouter } from "expo-router";
import { StyleSheet, View } from "react-native";
import { MaterialCommunityIcons } from "@expo/vector-icons";

import { EcosystemFrame } from "@/components/ecosystem/EcosystemFrame";
import { MetricRail } from "@/components/ecosystem/MetricRail";
import { AppHeader } from "@/components/primitives/AppHeader";
import { AppText } from "@/components/primitives/AppText";
import { Button } from "@/components/primitives/Button";
import { Chip } from "@/components/primitives/Chip";
import { Screen } from "@/components/primitives/Screen";
import { Surface } from "@/components/primitives/Surface";
import { useTheme } from "@/design/ThemeProvider";

const pillars = [
  {
    icon: "microphone-wireless",
    title: "Voice that stays with the pack",
    detail: "Live room comms, speaking indicators, and reconnection-aware audio states designed for real moving groups."
  },
  {
    icon: "map-marker-path",
    title: "Map-first ride awareness",
    detail: "Leader position, heading, regroup markers, straggler detection, and operational overlays tuned for at-a-glance use."
  },
  {
    icon: "shield-check-outline",
    title: "Safety without theater",
    detail: "SOS, hazard confirmation, fuel coordination, medical profile access, and conservative intelligence hooks for future growth."
  }
];

const productSurfaces = [
  {
    title: "Ride app",
    detail: "Room creation, lobby, live map, voice, pings, music sync, planning, and resilience features in one Expo codebase."
  },
  {
    title: "Marketing web",
    detail: "A premium landing surface with the same tokens, spacing rhythm, and product language as the mobile app."
  },
  {
    title: "Admin console",
    detail: "Operational triage for rooms, active incidents, diagnostics, and moderation review without a separate design system."
  }
];

export default function MarketingScreen() {
  const router = useRouter();
  const theme = useTheme();

  return (
    <Screen
      contentStyle={styles.screen}
      scroll
    >
      <AppHeader
        subtitle="Premium group ride coordination"
        title="RideSync"
        right={
          <View style={styles.headerActions}>
            <Button label="Admin" onPress={() => router.push("/admin")} variant="secondary" />
            <Button label="Open app" onPress={() => router.push("/(auth)/sign-in")} />
          </View>
        }
      />

      <EcosystemFrame
        eyebrow="Map-first rider operations"
        subtitle="RideSync brings comms, visibility, and coordination into one high-trust surface for group motorcycle rides."
        title="The control surface for serious group rides"
      >
        <View style={styles.heroMeta}>
          <Chip icon="shield-check-outline" label="Safety-first UX" tone="accent" />
          <Chip icon="signal" label="Realtime presence" tone="neutral" />
          <Chip icon="headset" label="Provider-ready voice" tone="neutral" />
        </View>

        <View style={styles.mockGrid}>
          <Surface muted style={[styles.mapMock, { backgroundColor: theme.colors.canvas }]}>
            <View style={styles.mapTopRow}>
              <AppText variant="label">Ride control</AppText>
              <Chip icon="account-group-outline" label="6 riders live" tone="success" />
            </View>
            <View style={[styles.routeRibbon, { backgroundColor: theme.colors.accentMuted, borderColor: theme.colors.focusRing }]}>
              <AppText tone="accent" variant="footnote">
                Peak to Plains / 118 mi
              </AppText>
            </View>
            <View style={styles.mapField}>
              <View style={[styles.mapArc, { borderColor: theme.colors.mapRoad }]} />
              <View style={[styles.mapArcSecondary, { borderColor: theme.colors.mapRoute }]} />
              <View style={[styles.riderDotLeader, { backgroundColor: theme.colors.mapLeader }]} />
              <View style={[styles.riderDot, { backgroundColor: theme.colors.mapRider }]} />
              <View style={[styles.riderDotTrailing, { backgroundColor: theme.colors.mapRider }]} />
            </View>
            <View style={styles.mapHud}>
              <View style={styles.hudItem}>
                <AppText tone="tertiary" variant="footnote">
                  Voice
                </AppText>
                <AppText variant="bodyStrong">Connected</AppText>
              </View>
              <View style={styles.hudItem}>
                <AppText tone="tertiary" variant="footnote">
                  Group drift
                </AppText>
                <AppText variant="bodyStrong">0.3 mi</AppText>
              </View>
              <View style={styles.hudItem}>
                <AppText tone="tertiary" variant="footnote">
                  SOS
                </AppText>
                <AppText variant="bodyStrong">Standby</AppText>
              </View>
            </View>
          </Surface>

          <MetricRail
            items={[
              { label: "Live stack", value: "Voice + map + pings", detail: "Built for moving squads, not chat rooms." },
              { label: "Safety posture", value: "Conservative by design", detail: "Clear escalation and experimental gating." },
              { label: "Operator tools", value: "Leader-first control", detail: "Join approvals, room lock, ride start, and room state recovery." }
            ]}
          />
        </View>
      </EcosystemFrame>

      <View style={styles.section}>
        <AppText variant="title2">Why it feels different</AppText>
        <AppText tone="secondary" variant="callout">
          The interface is compact, directional, and calm under stress. Every surface is designed around motion, gloves, low attention, and trust.
        </AppText>
      </View>

      <View style={styles.cardGrid}>
        {pillars.map((pillar) => (
          <Surface key={pillar.title} raised style={styles.pillarCard}>
            <View style={[styles.iconTile, { backgroundColor: theme.colors.surfaceMuted, borderColor: theme.colors.lineSubtle }]}>
              <MaterialCommunityIcons color={theme.colors.accent} name={pillar.icon as never} size={18} />
            </View>
            <AppText variant="bodyStrong">{pillar.title}</AppText>
            <AppText tone="secondary" variant="callout">
              {pillar.detail}
            </AppText>
          </Surface>
        ))}
      </View>

      <EcosystemFrame
        eyebrow="One language across surfaces"
        subtitle="The marketing site and internal console inherit the same tone, tokens, and interaction model as the mobile product."
        title="A cohesive ecosystem, not disconnected screens"
      >
        <View style={styles.cardGrid}>
          {productSurfaces.map((surface) => (
            <Surface key={surface.title} muted style={styles.surfaceCard}>
              <AppText variant="bodyStrong">{surface.title}</AppText>
              <AppText tone="secondary" variant="callout">
                {surface.detail}
              </AppText>
            </Surface>
          ))}
        </View>
        <View style={styles.ctaRow}>
          <Button icon="login" label="Enter beta app" onPress={() => router.push("/(auth)/sign-in")} />
          <Button icon="shield-star-outline" label="Open moderation console" onPress={() => router.push("/admin")} variant="secondary" />
        </View>
      </EcosystemFrame>
    </Screen>
  );
}

const styles = StyleSheet.create({
  screen: {
    gap: 18,
    paddingTop: 8
  },
  headerActions: {
    flexDirection: "row",
    gap: 10
  },
  section: {
    gap: 6
  },
  heroMeta: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8
  },
  mockGrid: {
    gap: 12
  },
  mapMock: {
    borderRadius: 26,
    padding: 16,
    gap: 14
  },
  mapTopRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center"
  },
  routeRibbon: {
    borderWidth: 1,
    borderRadius: 999,
    alignSelf: "flex-start",
    paddingHorizontal: 10,
    paddingVertical: 6
  },
  mapField: {
    height: 220,
    borderRadius: 22,
    overflow: "hidden",
    justifyContent: "center",
    alignItems: "center"
  },
  mapArc: {
    position: "absolute",
    width: 250,
    height: 250,
    borderRadius: 999,
    borderWidth: 16,
    opacity: 0.28,
    top: 18,
    left: -30
  },
  mapArcSecondary: {
    position: "absolute",
    width: 220,
    height: 220,
    borderRadius: 999,
    borderWidth: 4,
    borderStyle: "dashed",
    opacity: 0.6,
    bottom: -12,
    right: -18
  },
  riderDotLeader: {
    position: "absolute",
    width: 20,
    height: 20,
    borderRadius: 10,
    top: 62,
    left: 138
  },
  riderDot: {
    position: "absolute",
    width: 14,
    height: 14,
    borderRadius: 7,
    top: 118,
    left: 102
  },
  riderDotTrailing: {
    position: "absolute",
    width: 14,
    height: 14,
    borderRadius: 7,
    top: 150,
    right: 88
  },
  mapHud: {
    flexDirection: "row",
    gap: 10
  },
  hudItem: {
    flex: 1,
    gap: 2
  },
  cardGrid: {
    gap: 12
  },
  pillarCard: {
    borderRadius: 24,
    padding: 16,
    gap: 10
  },
  iconTile: {
    width: 36,
    height: 36,
    borderRadius: 12,
    borderWidth: 1,
    alignItems: "center",
    justifyContent: "center"
  },
  surfaceCard: {
    borderRadius: 24,
    padding: 16,
    gap: 8
  },
  ctaRow: {
    gap: 10
  }
});
