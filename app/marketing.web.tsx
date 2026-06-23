import { useRouter } from "expo-router";
import { StyleSheet, View, useWindowDimensions } from "react-native";
import { MaterialCommunityIcons } from "@expo/vector-icons";

import { AppText } from "@/components/primitives/AppText";
import { Button } from "@/components/primitives/Button";
import { Chip } from "@/components/primitives/Chip";
import { Screen } from "@/components/primitives/Screen";
import { Surface } from "@/components/primitives/Surface";
import { useTheme } from "@/design/ThemeProvider";
import { WebMetricCard } from "@/components/web/WebMetricCard";

const productPillars = [
  {
    icon: "monitor-dashboard",
    title: "Command center on desktop",
    detail: "Planning, roster control, live desktop monitoring, moderation, and pre-ride setup all feel native to a browser."
  },
  {
    icon: "headset",
    title: "Headset-ready browser voice",
    detail: "Pair the helmet headset or intercom with the laptop at the OS level, then let the browser use it for voice sessions."
  },
  {
    icon: "motorbike",
    title: "Mobile where mobile matters",
    detail: "The mobile app remains the ride-time runtime for background-safe location, alerts, and native safety behaviors."
  }
];

const featureRows = [
  ["Realtime room voice", "Live rider map", "Quick pings", "Ride planning"],
  ["Safety states", "Invite links and join codes", "Leader controls", "Moderation console"]
];

export default function MarketingWebScreen() {
  const router = useRouter();
  const theme = useTheme();
  const { width } = useWindowDimensions();
  const desktop = width >= 1080;

  return (
    <Screen contentStyle={styles.screen} scroll>
      <View style={styles.page}>
        <Surface raised style={styles.nav}>
          <View style={styles.brand}>
            <View style={[styles.brandMark, { backgroundColor: theme.colors.accentMuted, borderColor: theme.colors.focusRing }]}>
              <MaterialCommunityIcons color={theme.colors.accent} name="motorbike" size={18} />
            </View>
            <View>
              <AppText variant="bodyStrong">RideSync</AppText>
              <AppText tone="tertiary" variant="footnote">
                Group ride operations
              </AppText>
            </View>
          </View>

          <View style={styles.navActions}>
            <Button label="Admin" onPress={() => router.push("/admin")} variant="secondary" />
            <Button label="Open web app" onPress={() => router.push("/(auth)/sign-in")} />
          </View>
        </Surface>

        <View style={[styles.hero, desktop && styles.heroDesktop]}>
          <View style={styles.heroCopy}>
            <Chip icon="monitor" label="Web-first command surface" tone="accent" />
            <AppText style={styles.heroTitle} variant="display">
              Plan on web. Ride on mobile. Keep the whole group in sync.
            </AppText>
            <AppText style={styles.heroBody} tone="secondary">
              RideSync is built for the full operating picture: route planning, roster control, live coordination, safety signals, and ride-time execution across desktop and mobile.
            </AppText>

            <View style={styles.heroActions}>
              <Button label="Launch product" onPress={() => router.push("/(auth)/sign-in")} />
              <Button label="View moderation" onPress={() => router.push("/admin")} variant="secondary" />
            </View>

            <View style={styles.metricRow}>
              <WebMetricCard detail="Voice, map, pings, and ride state in one system" label="Unified stack" value="One shared product" />
              <WebMetricCard detail="Browser desktop for setup, native mobile for ride-time runtime" label="Platform strategy" value="Desktop + mobile" />
              <WebMetricCard detail="Calm under stress, compact, and operational instead of decorative" label="Design posture" value="High trust" />
            </View>
          </View>

          <Surface raised style={styles.heroStage}>
            <View style={styles.stageHeader}>
              <View>
                <AppText tone="secondary" variant="footnote">
                  Desktop command center
                </AppText>
                <AppText variant="title2">Front Range Dawn Run</AppText>
              </View>
              <Chip icon="account-group-outline" label="8 riders staged" tone="success" />
            </View>

            <View style={styles.stageGrid}>
              <Surface muted style={[styles.stageMap, { backgroundColor: theme.colors.canvas }]}>
                <View style={[styles.stageMapRing, { borderColor: theme.colors.mapRoad }]} />
                <View style={[styles.stageMapArc, { borderColor: theme.colors.mapRoute }]} />
                <View style={[styles.stageLeader, { backgroundColor: theme.colors.mapLeader }]} />
                <View style={[styles.stageRiderOne, { backgroundColor: theme.colors.mapRider }]} />
                <View style={[styles.stageRiderTwo, { backgroundColor: theme.colors.mapRider }]} />
                <View style={styles.stageMapOverlay}>
                  <Chip icon="microphone" label="Voice linked" tone="success" />
                  <Chip icon="map-marker-path" label="118 mi route" tone="accent" />
                </View>
              </Surface>

              <View style={styles.stageRail}>
                <Surface muted style={styles.stageCard}>
                  <AppText tone="secondary" variant="footnote">
                    Desktop headset flow
                  </AppText>
                  <AppText variant="bodyStrong">Pair headset in macOS or Windows, then let the browser use that audio device.</AppText>
                </Surface>
                <Surface muted style={styles.stageCard}>
                  <AppText tone="secondary" variant="footnote">
                    Live safety layer
                  </AppText>
                  <AppText variant="bodyStrong">Straggler checks, fuel margin, hazards, and SOS escalation stay visible without cluttering the map.</AppText>
                </Surface>
              </View>
            </View>
          </Surface>
        </View>

        <View style={[styles.pillars, desktop && styles.pillarsDesktop]}>
          {productPillars.map((pillar) => (
            <Surface key={pillar.title} raised style={styles.pillarCard}>
              <View style={[styles.pillarIcon, { backgroundColor: theme.colors.surfaceMuted, borderColor: theme.colors.lineSubtle }]}>
                <MaterialCommunityIcons color={theme.colors.accent} name={pillar.icon as never} size={18} />
              </View>
              <AppText variant="bodyStrong">{pillar.title}</AppText>
              <AppText tone="secondary" variant="callout">
                {pillar.detail}
              </AppText>
            </Surface>
          ))}
        </View>

        <Surface raised style={styles.sectionCard}>
          <View style={[styles.sectionHeader, desktop && styles.sectionHeaderDesktop]}>
            <View style={styles.sectionCopy}>
              <AppText tone="accent" variant="label">
                PROFESSIONAL PRODUCT STORY
              </AppText>
              <AppText variant="title1">The product markets cleanly because the platform story is clear.</AppText>
              <AppText tone="secondary" variant="callout">
                Desktop is where groups plan, coordinate, monitor, and onboard. Mobile is where the ride actually runs. That split is coherent, credible, and easier to sell.
              </AppText>
            </View>
            <View style={styles.featureMatrix}>
              {featureRows.map((row, rowIndex) => (
                <View key={`row-${rowIndex}`} style={styles.featureRow}>
                  {row.map((item) => (
                    <Chip key={item} label={item} tone="neutral" />
                  ))}
                </View>
              ))}
            </View>
          </View>
        </Surface>

        <Surface raised style={styles.ctaCard}>
          <View style={[styles.ctaLayout, desktop && styles.ctaLayoutDesktop]}>
            <View style={styles.sectionCopy}>
              <AppText tone="accent" variant="label">
                NEXT SURFACE
              </AppText>
              <AppText variant="title1">Start with the web app. Prove the experience. Then push deeper into native ride-time execution.</AppText>
            </View>
            <View style={styles.ctaActions}>
              <Button label="Open RideSync web app" onPress={() => router.push("/(auth)/sign-in")} />
              <Button label="Review admin console" onPress={() => router.push("/admin")} variant="secondary" />
            </View>
          </View>
        </Surface>
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  screen: {
    paddingVertical: 20
  },
  page: {
    width: "100%",
    maxWidth: 1280,
    alignSelf: "center",
    paddingHorizontal: 28,
    gap: 22
  },
  nav: {
    paddingHorizontal: 22,
    paddingVertical: 14,
    borderRadius: 28,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    gap: 18
  },
  brand: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12
  },
  brandMark: {
    width: 40,
    height: 40,
    borderRadius: 14,
    borderWidth: 1,
    alignItems: "center",
    justifyContent: "center"
  },
  navActions: {
    flexDirection: "row",
    gap: 10
  },
  hero: {
    gap: 18
  },
  heroDesktop: {
    flexDirection: "row",
    alignItems: "stretch"
  },
  heroCopy: {
    flex: 1,
    gap: 16
  },
  heroTitle: {
    fontSize: 44,
    lineHeight: 48
  },
  heroBody: {
    maxWidth: 720,
    fontSize: 15,
    lineHeight: 22
  },
  heroActions: {
    flexDirection: "row",
    gap: 10
  },
  metricRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 12
  },
  heroStage: {
    flex: 1,
    minHeight: 520,
    padding: 18,
    borderRadius: 32,
    gap: 16
  },
  stageHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    gap: 12,
    alignItems: "flex-start"
  },
  stageGrid: {
    flex: 1,
    gap: 14
  },
  stageMap: {
    flex: 1,
    minHeight: 300,
    borderRadius: 26,
    overflow: "hidden"
  },
  stageMapRing: {
    position: "absolute",
    width: 360,
    height: 360,
    borderRadius: 999,
    borderWidth: 24,
    opacity: 0.16,
    top: -110,
    right: -40
  },
  stageMapArc: {
    position: "absolute",
    width: 240,
    height: 240,
    borderRadius: 999,
    borderWidth: 4,
    borderStyle: "dashed",
    opacity: 0.62,
    bottom: 30,
    left: 30
  },
  stageLeader: {
    position: "absolute",
    width: 20,
    height: 20,
    borderRadius: 10,
    top: 90,
    left: 210
  },
  stageRiderOne: {
    position: "absolute",
    width: 14,
    height: 14,
    borderRadius: 7,
    top: 150,
    left: 170
  },
  stageRiderTwo: {
    position: "absolute",
    width: 14,
    height: 14,
    borderRadius: 7,
    top: 184,
    right: 118
  },
  stageMapOverlay: {
    position: "absolute",
    left: 16,
    right: 16,
    bottom: 16,
    flexDirection: "row",
    gap: 8
  },
  stageRail: {
    flexDirection: "row",
    gap: 12
  },
  stageCard: {
    flex: 1,
    borderRadius: 22,
    padding: 14,
    gap: 6
  },
  pillars: {
    gap: 12
  },
  pillarsDesktop: {
    flexDirection: "row"
  },
  pillarCard: {
    flex: 1,
    borderRadius: 26,
    padding: 18,
    gap: 10
  },
  pillarIcon: {
    width: 38,
    height: 38,
    borderRadius: 14,
    borderWidth: 1,
    alignItems: "center",
    justifyContent: "center"
  },
  sectionCard: {
    borderRadius: 30,
    padding: 22
  },
  sectionHeader: {
    gap: 14
  },
  sectionHeaderDesktop: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start"
  },
  sectionCopy: {
    flex: 1,
    gap: 8
  },
  featureMatrix: {
    gap: 10,
    alignItems: "flex-start"
  },
  featureRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8
  },
  ctaCard: {
    borderRadius: 30,
    padding: 22
  },
  ctaLayout: {
    gap: 16
  },
  ctaLayoutDesktop: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center"
  },
  ctaActions: {
    flexDirection: "row",
    gap: 10
  }
});
