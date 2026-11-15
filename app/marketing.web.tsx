import "@fontsource/geist/400.css";
import "@fontsource/geist/500.css";
import "@fontsource/geist/600.css";
import "@fontsource/geist/700.css";
import "@fontsource/geist-mono/400.css";
import "@fontsource/geist-mono/600.css";

import { useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "expo-router";
import { motion, useScroll, useTransform } from "framer-motion";
import { useWindowDimensions } from "react-native";

import { CinematicMapHero } from "@/components/marketing/CinematicMapHero";
import { DesktopCommandCenter } from "@/components/marketing/DesktopCommandCenter";
import { VoiceRowIcon } from "@/components/marketing/MarketingGlyphs";
import { lifecycleStages, microCallouts, planningCapabilities, safetyCells, sectionIds, trustItems, voiceRows } from "@/components/marketing/marketingContent";
import type { SectionId } from "@/components/marketing/marketingContent";
import {
  bodyMediumStyle,
  ctaHeadingStyle,
  dataValue,
  footerInnerStyle,
  footerLinkStyle,
  frameStyle,
  ghostButtonStyle,
  heroBodyStyle,
  heroCopyStyle,
  heroHeadlineStyle,
  heroMapFadeBottomStyle,
  heroMapFadeLeftStyle,
  heroMapMobileWrapStyle,
  heroMapWrapStyle,
  liveMapAccentBarStyle,
  liveMapBodyStyle,
  liveMapBookmarkStyle,
  liveMapHeadingStyle,
  liveMapLinkStyle,
  liveMapLinkUnderlineStyle,
  liveMapMetricsGridStyle,
  liveMapOverlineStyle,
  mapFadeBottomStyle,
  mapFadeLeftStyle,
  mapFadeRightStyle,
  mapFadeTopStyle,
  mapSectionNumberStyle,
  metricBorderStyle,
  metricCalloutStyle,
  metricLabelStyle,
  metricSuffixStyle,
  metricValueStyle,
  microAccentStyle,
  microMutedStyle,
  navInnerStyle,
  navLinkStyle,
  navStyle,
  pageStyle,
  primaryButtonStyle,
  sectionHeadingStyle,
  sectionSublineStyle
} from "@/components/marketing/marketingStyles";
import { splitHeadline, staggerWords } from "@/components/marketing/marketingText";
import { NoiseOverlay, sectionContentStyle } from "@/components/marketing/NoiseOverlay";
import { RideStage } from "@/components/marketing/RideStage";
import { VoicePanel } from "@/components/marketing/VoicePanel";
import { Wordmark } from "@/components/marketing/Wordmark";
import { RideMapPreview } from "@/components/web/RideMapPreview";
import { tokens } from "@/design/tokens";

const palette = tokens.marketing.color;
const type = tokens.marketing.type;
const spacing = tokens.marketing.spacing;
const radius = tokens.marketing.radius;
const ease = tokens.marketing.motion.sectionEase;

export default function MarketingWebScreen() {
  const router = useRouter();
  const { width } = useWindowDimensions();
  const mobile = width < 920;
  const compact = width < 720;
  const [activeSection, setActiveSection] = useState<SectionId>("product");
  const [navScrolled, setNavScrolled] = useState(false);
  const [activeStage, setActiveStage] = useState(0);
  const mapSectionRef = useRef<HTMLElement | null>(null);
  const sectionRefs = useRef<Record<SectionId, HTMLElement | null>>({
    product: null,
    lifecycle: null,
    map: null,
    voice: null,
    safety: null,
    planning: null
  });

  useEffect(() => {
    const onScroll = () => setNavScrolled(window.scrollY > 40);

    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });

    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const { scrollYProgress: mapSectionProgress } = useScroll({
    target: mapSectionRef,
    offset: ["start end", "end start"]
  });
  const sectionNumberOpacity = useTransform(mapSectionProgress, [0, 0.5, 1], [0.12, 0.22, 0.12]);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries
          .filter((entry) => entry.isIntersecting)
          .sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0];

        if (visible?.target?.id && sectionIds.includes(visible.target.id as SectionId)) {
          setActiveSection(visible.target.id as SectionId);
        }
      },
      {
        rootMargin: "-20% 0px -55% 0px",
        threshold: [0.2, 0.35, 0.5, 0.7]
      }
    );

    sectionIds.forEach((id) => {
      const node = sectionRefs.current[id];

      if (node) {
        observer.observe(node);
      }
    });

    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    const timer = window.setInterval(() => {
      setActiveStage((current) => (current + 1) % lifecycleStages.length);
    }, 2500);

    return () => window.clearInterval(timer);
  }, []);

  const metrics = useMemo(
    () => [
      { value: "< 80ms", label: "voice latency target", accent: true },
      { value: "8 riders", label: "default room size" },
      { value: "Web + mobile", label: "unified platform" }
    ],
    []
  );

  const openGitHub = () => window.open("https://github.com/Whauv/RideSync", "_blank", "noopener,noreferrer");
  const openApp = () => router.push("/(auth)/sign-in");
  const openAdmin = () => router.push("/admin");

  const scrollToSection = (id: SectionId) => {
    sectionRefs.current[id]?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  return (
    <div style={pageStyle}>
      <motion.header
        animate={{
          borderBottomColor: navScrolled ? "rgba(255,255,255,0.06)" : "rgba(255,255,255,0)",
          backgroundColor: navScrolled ? "rgba(8,8,9,0.90)" : "rgba(8,8,9,0.72)"
        }}
        style={{
          ...navStyle,
          backdropFilter: tokens.marketing.blur.nav,
          WebkitBackdropFilter: tokens.marketing.blur.nav
        }}
        transition={{ duration: 0.3, ease: "easeOut" }}
      >
        <div style={frameStyle}>
          <div style={navInnerStyle}>
            <Wordmark />
            {!mobile ? (
              <div style={{ display: "flex", alignItems: "center", gap: 28 }}>
                <button onClick={() => scrollToSection("product")} style={navLinkStyle(activeSection === "product")}>Product</button>
                <button onClick={() => scrollToSection("lifecycle")} style={navLinkStyle(activeSection === "lifecycle")}>How it works</button>
                <button onClick={openGitHub} style={navLinkStyle(false)}>GitHub</button>
              </div>
            ) : null}
            <motion.button onClick={openApp} style={primaryButtonStyle(false)} whileHover={{ filter: "brightness(1.08)", y: -2 }} transition={{ duration: 0.15 }}>
              {"Open RideSync ->"}
            </motion.button>
          </div>
        </div>
      </motion.header>

      <main>
        <section
          id="product"
          ref={(node) => {
            sectionRefs.current.product = node;
          }}
          style={{
            position: "relative",
            minHeight: mobile ? "auto" : "100vh",
            overflow: "hidden",
            background: palette.background
          }}
        >
          <NoiseOverlay />
          <div
            style={{
              ...frameStyle,
              ...sectionContentStyle,
              position: "relative",
              display: "flex",
              alignItems: mobile ? "stretch" : "center",
              minHeight: mobile ? "auto" : "100vh"
            }}
          >
            <div style={{ ...heroCopyStyle, width: mobile ? "100%" : "48%", paddingTop: mobile ? 118 : 0 }}>
              <motion.span animate={{ opacity: 1, y: 0 }} initial={{ opacity: 0, y: 6 }} style={microAccentStyle} transition={{ duration: 0.4, delay: 0.1 }}>
                GROUP RIDE COORDINATION
              </motion.span>

              <div style={{ display: "grid", gap: 6 }}>
                <h1 style={heroHeadlineStyle}>{splitHeadline("Every rider.")}</h1>
                <h1 style={{ ...heroHeadlineStyle, marginLeft: mobile ? 0 : 32 }}>{splitHeadline("One channel.")}</h1>
              </div>

              <motion.div
                animate={{ width: 40 }}
                initial={{ width: 0 }}
                style={{ height: 2, background: palette.accent, margin: "28px 0" }}
                transition={{ duration: 0.4, delay: 0.5, ease: "easeOut" }}
              />

              <motion.p
                animate={{ opacity: 1, y: 0 }}
                initial={{ opacity: 0, y: 8 }}
                style={heroBodyStyle}
                transition={{ duration: 0.45, delay: 0.55, ease }}
              >
                RideSync runs the group from the first pin drop to the last mile. Voice, map, and signals - one room.
              </motion.p>

              <motion.div
                animate={{ opacity: 1, y: 0 }}
                initial={{ opacity: 0, y: 8 }}
                style={{ display: "flex", alignItems: "center", gap: 14, flexWrap: "wrap", marginTop: 32 }}
                transition={{ duration: 0.4, delay: 0.65, ease }}
              >
                <motion.button onClick={openApp} style={primaryButtonStyle(true)} whileHover={{ y: -2 }} transition={{ duration: 0.15 }}>
                  Open RideSync
                </motion.button>
                <motion.button initial="rest" onClick={() => scrollToSection("lifecycle")} style={ghostButtonStyle()} whileHover="hover">
                  <span>See how it works</span>
                  <motion.span variants={{ rest: { x: 0 }, hover: { x: 3 } }}>{"->"}</motion.span>
                </motion.button>
              </motion.div>

              <motion.div
                animate={{ opacity: 1 }}
                initial={{ opacity: 0 }}
                style={{
                  display: "grid",
                  gridTemplateColumns: compact ? "1fr" : "repeat(3, minmax(0, 1fr))",
                  gap: compact ? 14 : 18,
                  marginTop: 32,
                  maxWidth: 420
                }}
                transition={{ duration: 0.4, delay: 0.8 }}
              >
                {metrics.map((metric, index) => (
                  <div key={metric.label} style={{ paddingRight: compact ? 0 : 14, borderRight: !compact && index < metrics.length - 1 ? "1px solid rgba(255,255,255,0.3)" : "none" }}>
                    <div style={dataValue(metric.value, metric.accent)}>{metric.value}</div>
                    <div style={microMutedStyle}>{metric.label}</div>
                  </div>
                ))}
              </motion.div>
            </div>

            <motion.div
              animate={{ opacity: 0.9 }}
              initial={{ opacity: 0 }}
              style={mobile ? heroMapMobileWrapStyle : heroMapWrapStyle}
              transition={{ duration: 1.4, delay: 0.15, ease }}
            >
              <div style={heroMapFadeLeftStyle} />
              <div style={heroMapFadeBottomStyle} />
              <CinematicMapHero />
            </motion.div>
          </div>
        </section>

        <section style={{ position: "relative", background: palette.surface3, borderTop: "1px solid rgba(255,255,255,0.07)", borderBottom: "1px solid rgba(255,255,255,0.07)" }}>
          <NoiseOverlay opacity={0.016} />
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            style={{ ...frameStyle, ...sectionContentStyle, minHeight: 72, display: "flex", alignItems: "center", overflowX: "auto", scrollbarWidth: "none" }}
            transition={{ duration: 0.45, ease }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: 0, minWidth: "max-content" }}>
              {trustItems.map((item, index) => (
                <div
                  key={item}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 10,
                    padding: "0 18px",
                    height: 72,
                    borderRight: index < trustItems.length - 1 ? "1px solid rgba(255,255,255,0.2)" : "none"
                  }}
                >
                  <span style={{ width: 4, height: 4, borderRadius: 999, background: palette.accent, opacity: 0.5 }} />
                  <span style={{ fontSize: 12, fontWeight: 500, color: palette.textSecondary, whiteSpace: "nowrap" }}>{item}</span>
                </div>
              ))}
            </div>
          </motion.div>
        </section>

        <section
          id="lifecycle"
          ref={(node) => {
            sectionRefs.current.lifecycle = node;
          }}
          style={{ padding: `${spacing.sectionGap}px 0 ${spacing.sectionGap}px`, background: palette.background }}
        >
          <div style={frameStyle}>
            <div style={{ ...sectionContentStyle, display: "grid", gap: 22 }}>
              <div style={{ display: "grid", gap: 12 }}>
                <span style={microAccentStyle}>RIDE LIFECYCLE</span>
                <h2 style={sectionHeadingStyle}>From the first ping to the last mile.</h2>
                <p style={sectionSublineStyle}>Six stages, one room, zero hardware swaps.</p>
              </div>

              <div style={{ display: "flex", gap: 20, overflowX: "auto", paddingBottom: 4, scrollbarWidth: "none" }}>
                {lifecycleStages.map((stage, index) => (
                  <RideStage
                    key={stage.name}
                    active={index === activeStage}
                    description={stage.description}
                    index={index}
                    name={stage.name}
                    showConnector={index < lifecycleStages.length - 1}
                  />
                ))}
              </div>
            </div>
          </div>
        </section>

        <section
          id="map"
          ref={(node) => {
            sectionRefs.current.map = node;
            mapSectionRef.current = node;
          }}
          style={{ position: "relative", background: "#0A0B0E", padding: "120px 0 120px", borderBottom: "1px solid rgba(255,255,255,0.05)" }}
        >
          <div style={{ ...frameStyle, position: "relative", padding: "0 48px" }}>
            {!mobile && width >= 1100 ? (
              <motion.div style={{ ...mapSectionNumberStyle, opacity: sectionNumberOpacity }}>
                02
              </motion.div>
            ) : null}
            <div style={{ ...sectionContentStyle, position: "relative", display: "grid", gridTemplateColumns: mobile ? "1fr" : width < 1024 ? "1fr" : "420px 1fr", gap: mobile ? 32 : width < 1024 ? 36 : 80, alignItems: "center" }}>
              <div style={{ display: "grid", gap: 0, maxWidth: 420 }}>
                <motion.div
                  initial={{ opacity: 0, x: -8 }}
                  style={liveMapBookmarkStyle}
                  transition={{ duration: 0.5, ease: "easeOut" }}
                  whileInView={{ opacity: 0.35, x: 0, width: 48 }}
                  viewport={{ once: true }}
                />
                <motion.span
                  initial={{ opacity: 0, x: -8 }}
                  style={liveMapOverlineStyle}
                  transition={{ duration: 0.4, ease }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                >
                  LIVE MAP
                </motion.span>
                <div style={{ display: "grid", gap: 2, marginTop: 10 }}>
                  {["The whole group.", "One read.", "Zero guesswork."].map((line, index) => (
                    <motion.h2
                      key={line}
                      initial={{ opacity: 0, y: 10 }}
                      style={liveMapHeadingStyle}
                      transition={{ duration: 0.45, delay: 0.1 + index * 0.08, ease }}
                      whileInView={{ opacity: 1, y: 0 }}
                      viewport={{ once: true }}
                    >
                      {line}
                    </motion.h2>
                  ))}
                </div>
                <motion.div initial={{ width: 0 }} style={liveMapAccentBarStyle} transition={{ duration: 0.5, delay: 0.4, ease: "easeOut" }} whileInView={{ width: 32 }} viewport={{ once: true }} />
                <motion.p
                  initial={{ opacity: 0, y: 6 }}
                  style={liveMapBodyStyle}
                  transition={{ duration: 0.4, delay: 0.5, ease }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                >
                  Every rider&apos;s position, heading, and speed - updated live. Spacing issues, stragglers, and route deviations surface before they become problems.
                </motion.p>
                <div style={liveMapMetricsGridStyle}>
                  {microCallouts.map((item, index) => (
                    <motion.div
                      key={item.label}
                      initial={{ opacity: 0.85, y: 8 }}
                      style={metricCalloutStyle}
                      transition={{ duration: 0.4, delay: 0.65 + index * 0.08, ease }}
                      whileHover={{ opacity: 1 }}
                      whileInView={{ opacity: 0.85, y: 0 }}
                      viewport={{ once: true }}
                    >
                      <motion.div style={metricBorderStyle} whileHover={{ opacity: 0.6 }} />
                      <div style={{ display: "grid", gap: 6 }}>
                        <div style={metricValueStyle}>
                          {item.value}
                          {item.suffix ? <span style={metricSuffixStyle}>{item.suffix}</span> : null}
                        </div>
                        <div style={metricLabelStyle}>{item.label}</div>
                      </div>
                    </motion.div>
                  ))}
                </div>
                <motion.button initial="rest" onClick={openApp} style={liveMapLinkStyle} variants={{ rest: { opacity: 0.75 }, hover: { opacity: 1 } }} whileHover="hover">
                  <span>See it in the product</span>
                  <motion.span style={{ color: palette.accent }} variants={{ rest: { x: 0 }, hover: { x: 5 } }}>{"->"}</motion.span>
                  <motion.div
                    style={liveMapLinkUnderlineStyle}
                    variants={{ rest: { scaleX: 0 }, hover: { scaleX: 1 } }}
                  />
                </motion.button>
              </div>

              {!mobile ? (
                <div style={{ position: "relative", width: "100%", minHeight: width < 1024 ? 360 : 480, aspectRatio: width < 1024 ? "16 / 9" : "16 / 9", overflow: "hidden", background: "transparent" }}>
                  <motion.div style={mapFadeLeftStyle} />
                  <motion.div style={mapFadeTopStyle} />
                  <motion.div style={mapFadeRightStyle} />
                  <motion.div style={mapFadeBottomStyle} />
                  <RideMapPreview variant="signature" />
                </div>
              ) : null}
            </div>
          </div>
        </section>

        <section
          id="voice"
          ref={(node) => {
            sectionRefs.current.voice = node;
          }}
          style={{ padding: `${spacing.sectionGap}px 0`, background: palette.background }}
        >
          <div style={frameStyle}>
            <div style={{ ...sectionContentStyle, display: "grid", gridTemplateColumns: mobile ? "1fr" : "minmax(0, 0.55fr) minmax(0, 0.45fr)", gap: 40, alignItems: "start" }}>
              <div style={{ display: "grid", gap: 0 }}>
                {voiceRows.map((row) => (
                  <div
                    key={row.title}
                    style={{
                      display: "grid",
                      gridTemplateColumns: mobile ? "1fr" : "52px minmax(0, 1fr) auto",
                      gap: 12,
                      padding: "28px 0",
                      borderTop: "1px solid rgba(255,255,255,0.06)"
                    }}
                  >
                    {!mobile ? <VoiceRowIcon title={row.title} /> : null}
                    <div style={{ display: "grid", gap: 8 }}>
                      <h3 style={{ margin: 0, fontSize: type.subheading, lineHeight: 1.3, fontWeight: 500, color: palette.textPrimary }}>{row.title}</h3>
                      <p style={{ margin: 0, fontSize: type.bodyS, lineHeight: 1.55, color: palette.textTertiary }}>{row.body}</p>
                    </div>
                    <div style={{ ...dataValue(row.stat, false), alignSelf: "start" }}>{row.stat}</div>
                  </div>
                ))}
              </div>

              <VoicePanel />
            </div>
          </div>
        </section>

        <section
          id="safety"
          ref={(node) => {
            sectionRefs.current.safety = node;
          }}
          style={{ position: "relative", background: palette.shell, padding: `${spacing.sectionGap}px 0` }}
        >
          <NoiseOverlay opacity={0.02} />
          <div style={frameStyle}>
            <div style={{ ...sectionContentStyle, display: "grid", gap: 28 }}>
              <div style={{ display: "grid", gap: 12 }}>
                <span style={microAccentStyle}>SAFETY LAYER</span>
                <h2 style={sectionHeadingStyle}>The things that matter when the ride goes sideways.</h2>
                <p style={sectionSublineStyle}>Designed around real incidents. Not hypothetical features.</p>
              </div>

              <motion.div
                style={{
                  display: "grid",
                  gridTemplateColumns: compact ? "1fr" : "repeat(3, minmax(0, 1fr))",
                  gap: 16
                }}
                variants={{ visible: { transition: { staggerChildren: 0.06 } } }}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true }}
              >
                {safetyCells.map((cell) => (
                  <motion.div
                    key={cell.heading}
                    variants={{
                      hidden: { opacity: 0, y: 16 },
                      visible: { opacity: 1, y: 0, transition: { duration: 0.4, ease } }
                    }}
                    style={{
                      background: palette.surface1,
                      border: `1px solid ${palette.borderSubtle}`,
                      borderRadius: radius.cell,
                      padding: 24,
                      minHeight: 188,
                      display: "grid",
                      gap: 14
                    }}
                  >
                    <div style={{ height: 2, width: "100%", background: cell.color }} />
                    <span style={{ ...microAccentStyle, color: cell.color }}>{cell.label}</span>
                    <h3 style={{ margin: 0, fontSize: type.subheading, lineHeight: 1.3, fontWeight: 500, color: palette.textPrimary }}>{cell.heading}</h3>
                    <p style={{ margin: 0, fontSize: type.bodyS, lineHeight: 1.55, color: palette.textTertiary }}>{cell.body}</p>
                  </motion.div>
                ))}
              </motion.div>
            </div>
          </div>
        </section>

        <section
          id="planning"
          ref={(node) => {
            sectionRefs.current.planning = node;
          }}
          style={{ background: palette.shell, padding: `${spacing.sectionGap}px 0` }}
        >
          <div style={frameStyle}>
            <div style={{ ...sectionContentStyle, display: "grid", gridTemplateColumns: mobile ? "1fr" : "minmax(0, 0.45fr) minmax(0, 0.55fr)", gap: 40, alignItems: "center" }}>
              <div style={{ display: "grid", gap: 18 }}>
                <span style={microAccentStyle}>OPERATIONAL PLANNING</span>
                <h2 style={sectionHeadingStyle}>The ride starts before the engines do.</h2>
                <p style={bodyMediumStyle}>
                  Route briefings, staging, roster control, live monitoring, and moderation - all from a browser. The desktop command center handles the pre-ride complexity so the mobile app can stay focused on the road.
                </p>
                <div style={{ display: "grid", gap: 12 }}>
                  {planningCapabilities.map((item) => (
                    <div key={item} style={{ display: "flex", alignItems: "center", gap: 10 }}>
                      <span style={{ width: 10, height: 10, display: "inline-flex", alignItems: "center", justifyContent: "center" }}>
                        <span style={{ width: 8, height: 2, background: palette.accent, transform: "rotate(-45deg) translate(1px, 2px)", display: "block" }} />
                      </span>
                      <span style={{ fontSize: 13, color: palette.textSecondary }}>{item}</span>
                    </div>
                  ))}
                </div>
                <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
                  <motion.button onClick={openAdmin} style={primaryButtonStyle(false)} whileHover={{ y: -2 }} transition={{ duration: 0.15 }}>
                    Open admin
                  </motion.button>
                  <motion.button initial="rest" onClick={openApp} style={ghostButtonStyle()} whileHover="hover">
                    <span>Open product</span>
                    <motion.span variants={{ rest: { x: 0 }, hover: { x: 3 } }}>{"->"}</motion.span>
                  </motion.button>
                </div>
              </div>

              <DesktopCommandCenter />
            </div>
          </div>
        </section>

        <section style={{ position: "relative", background: palette.background, padding: "200px 0" }}>
          <NoiseOverlay opacity={0.02} />
          <div style={frameStyle}>
            <div style={{ ...sectionContentStyle, display: "grid", justifyItems: "center", textAlign: "center", gap: 12 }}>
              <span style={microAccentStyle}>EARLY ACCESS</span>
              <h2 style={{ ...ctaHeadingStyle, maxWidth: 720 }}>{staggerWords("Your next group ride starts here.")}</h2>
              <p style={{ ...bodyMediumStyle, color: palette.textTertiary, maxWidth: 360 }}>Open to early riders while the product is in beta.</p>
              <motion.button onClick={openApp} style={{ ...primaryButtonStyle(true), marginTop: 16 }} whileHover={{ y: -2 }} transition={{ duration: 0.15 }}>
                {"Open RideSync ->"}
              </motion.button>
              <p style={{ margin: 0, fontSize: 11, color: palette.textQuiet }}>No account required to explore the demo</p>
            </div>
          </div>
        </section>
      </main>

      <footer style={{ borderTop: "1px solid rgba(255,255,255,0.06)", background: palette.background }}>
        <div style={frameStyle}>
          <div style={footerInnerStyle}>
            <Wordmark />
            {!compact ? <span style={{ position: "absolute", left: "50%", transform: "translateX(-50%)", fontSize: 12, color: palette.textQuiet }}>Built for riders. Not for dashboards.</span> : null}
            <div style={{ display: "flex", alignItems: "center", gap: 20 }}>
              <button onClick={openGitHub} style={footerLinkStyle}>GitHub</button>
              <button onClick={openGitHub} style={footerLinkStyle}>Privacy</button>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
