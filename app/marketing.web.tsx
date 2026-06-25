import "@fontsource/geist/400.css";
import "@fontsource/geist/500.css";
import "@fontsource/geist/600.css";
import "@fontsource/geist/700.css";
import "@fontsource/geist-mono/400.css";
import "@fontsource/geist-mono/600.css";

import { useEffect, useMemo, useRef, useState } from "react";
import type { CSSProperties } from "react";
import { useRouter } from "expo-router";
import { motion } from "framer-motion";
import { useWindowDimensions } from "react-native";

import { CinematicMapHero } from "@/components/marketing/CinematicMapHero";
import { DesktopCommandCenter } from "@/components/marketing/DesktopCommandCenter";
import { NoiseOverlay, sectionContentStyle } from "@/components/marketing/NoiseOverlay";
import { RideStage } from "@/components/marketing/RideStage";
import { RideMapPreview } from "@/components/web/RideMapPreview";
import { tokens } from "@/design/tokens";

const palette = tokens.marketing.color;
const type = tokens.marketing.type;
const spacing = tokens.marketing.spacing;
const radius = tokens.marketing.radius;
const fonts = tokens.marketing.font;
const ease = tokens.marketing.motion.sectionEase;

const trustItems = [
  "Hardware-free voice",
  "Works with any Bluetooth headset",
  "Live GPS across the full group",
  "Web-first, mobile-native",
  "No subscription required for beta"
];

const lifecycleStages = [
  { name: "Plan", description: "Set the route, timing, and stop plan before anyone leaves the garage." },
  { name: "Gather", description: "Approve riders, check readiness, and bring everyone into one room." },
  { name: "Voice", description: "Lock in the live channel so the pack can talk without setup friction." },
  { name: "Ride", description: "Track spacing, heading, and movement with one shared live read." },
  { name: "Handle", description: "Signal hazards, pull-overs, and incidents without breaking focus." },
  { name: "Review", description: "Replay the ride, inspect events, and tighten the next departure." }
];

const microCallouts = [
  { value: "1s", label: "location update interval" },
  { value: "360deg", label: "heading tracked per rider" },
  { value: "inf", label: "riders viewable on map" },
  { value: "2px", label: "route ribbon precision" }
];

const voiceRows = [
  {
    title: "Voice room",
    body: "Talk to the group through your helmet. Any Bluetooth headset, no pairing required between riders.",
    stat: "< 80ms"
  },
  {
    title: "Quick signals",
    body: "Pull over, fuel stop, hazard, all good. One tap, everyone informed, nobody distracted.",
    stat: "8 signals"
  },
  {
    title: "Group music",
    body: "Leader queues the soundtrack. Every rider hears it through their own audio channel.",
    stat: "sync'd"
  }
];

const safetyCells = [
  {
    label: "CRASH DETECTION",
    heading: "Impact events trigger a 30-second countdown",
    body: "Riders cancel if they're fine. Group gets notified automatically if they don't.",
    color: palette.accent
  },
  {
    label: "STRAGGLER ALERT",
    heading: "Group leader notified when a rider falls behind",
    body: "Configurable distance threshold. Auto-ping before the gap becomes a safety issue.",
    color: palette.stateCaution
  },
  {
    label: "FUEL COORDINATION",
    heading: "Shortest range in the group sets the stop",
    body: "Everyone enters their tank level. The app finds the stop before someone runs out.",
    color: palette.accent
  },
  {
    label: "SOS ESCALATION",
    heading: "One button, group alert, emergency contacts notified",
    body: "Countdown to cancel. If unanswered, location is sent to pre-set emergency contacts.",
    color: palette.stateEmergency
  },
  {
    label: "RECONNECT LOGIC",
    heading: "Dropped signal doesn't drop the rider",
    body: "Auto-rejoin to voice, location, and room state. Last known position stays visible to the group.",
    color: palette.stateSync
  },
  {
    label: "BATTERY AWARE",
    heading: "GPS cadence adapts to save power on long rides",
    body: "Switchable from 1-second to 5-second updates. Keeps the group visible without draining the phone.",
    color: palette.accent
  }
];

const planningCapabilities = [
  "Pre-ride route briefing and waypoints",
  "Lobby staging with rider approval",
  "Desktop live map monitoring",
  "Incident and SOS moderation console",
  "Post-ride diagnostics and replay"
];

const sectionIds = ["product", "lifecycle", "map", "voice", "safety", "planning"] as const;
type SectionId = (typeof sectionIds)[number];

function splitHeadline(text: string) {
  return text.split(" ").map((word, index) => (
    <motion.span
      key={`${word}-${index}`}
      animate={{ opacity: 1, y: 0 }}
      initial={{ opacity: 0, y: 14 }}
      style={{ display: "inline-block", marginRight: 10 }}
      transition={{ duration: 0.5, delay: 0.2 + index * 0.06, ease }}
    >
      {word}
    </motion.span>
  ));
}

function staggerWords(text: string) {
  return text.split(" ").map((word, index) => (
    <motion.span
      key={`${word}-${index}`}
      initial={{ opacity: 0, y: 12 }}
      style={{ display: "inline-block", marginRight: 8 }}
      transition={{ duration: 0.4, delay: index * 0.05, ease }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
    >
      {word}
    </motion.span>
  ));
}

function Wordmark() {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
      <div style={{ width: 7, height: 7, borderRadius: 999, background: palette.accent, opacity: 0.85 }} />
      <span style={{ fontSize: 14, fontWeight: 600, letterSpacing: "-0.01em", color: palette.textPrimary }}>RideSync</span>
    </div>
  );
}

function navLinkStyle(active: boolean): CSSProperties {
  return {
    appearance: "none",
    border: "none",
    background: "transparent",
    cursor: "pointer",
    padding: 0,
    fontFamily: fonts.body,
    fontSize: 13,
    fontWeight: 400,
    color: active ? palette.accent : "rgba(242,243,245,0.5)",
    transition: "opacity 130ms ease, color 130ms ease",
    opacity: active ? 1 : 0.85
  };
}

function primaryButtonStyle(large = false): CSSProperties {
  return {
    appearance: "none",
    border: "none",
    cursor: "pointer",
    display: "inline-flex",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    height: large ? 44 : 34,
    padding: large ? "0 20px" : "0 14px",
    borderRadius: large ? 8 : 6,
    background: palette.accent,
    color: "#FFFFFF",
    fontFamily: fonts.body,
    fontSize: 13,
    fontWeight: 500,
    letterSpacing: "-0.01em",
    boxShadow: "inset 0 1px 0 rgba(255,255,255,0.10)"
  };
}

function ghostButtonStyle(): CSSProperties {
  return {
    appearance: "none",
    border: "none",
    background: "transparent",
    cursor: "pointer",
    display: "inline-flex",
    alignItems: "center",
    gap: 8,
    padding: 0,
    color: palette.textTertiary,
    fontFamily: fonts.body,
    fontSize: 13,
    fontWeight: 500
  };
}

function dataValue(value: string, accent = false): CSSProperties {
  return {
    fontFamily: fonts.mono,
    fontSize: type.data,
    fontWeight: 500,
    letterSpacing: "0.02em",
    color: accent ? palette.accent : palette.textPrimary
  };
}

function VoiceBars({ active }: { active?: boolean }) {
  return (
    <div style={{ display: "flex", alignItems: "flex-end", gap: 2, height: 12 }}>
      {[0, 1, 2].map((bar) => (
        <motion.span
          key={bar}
          animate={active ? { height: [4, 12, 6, 10, 4] } : { height: 4 }}
          style={{
            display: "block",
            width: 3,
            height: 4,
            borderRadius: 2,
            background: active ? palette.accent : palette.textQuiet
          }}
          transition={{ duration: 0.6, repeat: active ? Number.POSITIVE_INFINITY : 0, delay: bar * 0.08, ease: "easeInOut" }}
        />
      ))}
    </div>
  );
}

function VoicePanel() {
  const riders = [
    { name: "Maya", initial: "M", color: palette.accentDim, speaking: true, mute: "Leader" },
    { name: "Allen", initial: "A", color: "rgba(123,97,255,0.18)", mute: "Live" },
    { name: "Luis", initial: "L", color: "rgba(255,107,53,0.18)", mute: "Muted" },
    { name: "Kim", initial: "K", color: "rgba(255,210,63,0.16)", mute: "Live" },
    { name: "Jon", initial: "J", color: "rgba(96,165,250,0.16)", mute: "Live" }
  ];

  return (
    <motion.div
      initial={{ opacity: 0, x: 32 }}
      style={{
        background: palette.surface2,
        border: `1px solid ${palette.borderDefault}`,
        borderRadius: 14,
        padding: 18,
        backdropFilter: tokens.marketing.blur.glass,
        WebkitBackdropFilter: tokens.marketing.blur.glass,
        boxShadow: tokens.marketing.elevation.panel
      }}
      transition={{ duration: 0.6, ease }}
      whileInView={{ opacity: 1, x: 0 }}
      viewport={{ once: true }}
    >
      <div style={{ display: "grid", gap: 16 }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <div style={{ display: "grid", gap: 4 }}>
            <span style={{ fontSize: 12, fontWeight: 500, color: palette.textPrimary }}>Front Range Dawn Run</span>
            <span style={{ ...monoSmallStyle, color: palette.textTertiary }}>voice room / linked to ride room</span>
          </div>
          <div style={{ ...pillStyle, borderColor: palette.accentBorder, color: palette.accent }}>Connected</div>
        </div>

        <div style={{ display: "grid", gap: 10 }}>
          {riders.map((rider) => (
            <div
              key={rider.name}
              style={{
                display: "grid",
                gridTemplateColumns: "24px 1fr auto auto",
                alignItems: "center",
                gap: 10,
                minHeight: 36
              }}
            >
              <div
                style={{
                  width: 24,
                  height: 24,
                  borderRadius: 999,
                  display: "grid",
                  placeItems: "center",
                  background: rider.color,
                  color: palette.textPrimary,
                  fontSize: 11,
                  fontWeight: 600
                }}
              >
                {rider.initial}
              </div>
              <span style={{ fontSize: 13, color: palette.textPrimary }}>{rider.name}</span>
              <VoiceBars active={rider.speaking} />
              <span style={{ ...monoSmallStyle, color: rider.mute === "Muted" ? palette.textTertiary : palette.textSecondary }}>{rider.mute}</span>
            </div>
          ))}
        </div>

        <div style={{ display: "flex", gap: 10 }}>
          <button style={iconButtonStyle}>Mute</button>
          <button style={{ ...iconButtonStyle, color: palette.textSecondary }}>Leave</button>
        </div>
      </div>
    </motion.div>
  );
}

function VoiceGlyph() {
  return (
    <svg height="28" viewBox="0 0 40 28" width="40">
      <path d="M10 10C10 6 13 4 16 4C19 4 22 6 22 10V14C22 18 19 20 16 20C13 20 10 18 10 14V10Z" fill="none" stroke={palette.textSecondary} strokeWidth="1.2" />
      <path d="M26 8C29 10 30 13 30 16C30 19 29 22 26 24" fill="none" stroke={palette.textSecondary} strokeWidth="1.2" />
    </svg>
  );
}

function SignalGlyph() {
  return (
    <svg height="28" viewBox="0 0 40 28" width="40">
      <path d="M6 22L16 10L24 16L34 6" fill="none" stroke={palette.textSecondary} strokeWidth="1.2" />
      <circle cx="6" cy="22" fill={palette.accent} r="2.5" />
      <circle cx="24" cy="16" fill={palette.textSecondary} r="2.5" />
    </svg>
  );
}

function MusicGlyph() {
  return (
    <svg height="28" viewBox="0 0 40 28" width="40">
      <path d="M14 8V20" fill="none" stroke={palette.textSecondary} strokeWidth="1.2" />
      <path d="M14 8L28 5V17" fill="none" stroke={palette.textSecondary} strokeWidth="1.2" />
      <circle cx="14" cy="22" fill={palette.accent} r="2.6" />
      <circle cx="28" cy="19" fill={palette.textSecondary} r="2.6" />
    </svg>
  );
}

function VoiceRowIcon({ title }: { title: string }) {
  if (title === "Voice room") {
    return <VoiceGlyph />;
  }

  if (title === "Quick signals") {
    return <SignalGlyph />;
  }

  return <MusicGlyph />;
}

export default function MarketingWebScreen() {
  const router = useRouter();
  const { width } = useWindowDimensions();
  const mobile = width < 920;
  const compact = width < 720;
  const [activeSection, setActiveSection] = useState<SectionId>("product");
  const [navScrolled, setNavScrolled] = useState(false);
  const [activeStage, setActiveStage] = useState(0);
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
          }}
          style={{ background: palette.metalSlate, padding: `${spacing.sectionGap}px 0` }}
        >
          <div style={frameStyle}>
            <div style={{ ...sectionContentStyle, display: "grid", gridTemplateColumns: mobile ? "1fr" : "minmax(320px, 0.4fr) minmax(0, 0.6fr)", gap: 40, alignItems: "center" }}>
              <div style={{ display: "grid", gap: 18 }}>
                <span style={microAccentStyle}>LIVE MAP</span>
                <h2 style={{ ...sectionHeadingStyle, maxWidth: 340 }}>The whole group. One read. Zero guesswork.</h2>
                <p style={{ ...bodyMediumStyle, maxWidth: 320 }}>
                  Every rider&apos;s position, heading, and speed - updated live. Spacing issues, stragglers, and route deviations surface before they become problems.
                </p>
                <div style={{ display: "grid", gridTemplateColumns: "repeat(2, minmax(0, 1fr))", gap: 16, maxWidth: 300 }}>
                  {microCallouts.map((item) => (
                    <div key={item.label} style={{ display: "grid", gap: 4 }}>
                      <span style={{ fontFamily: fonts.mono, fontSize: 20, color: palette.accent }}>{item.value}</span>
                      <span style={microMutedStyle}>{item.label}</span>
                    </div>
                  ))}
                </div>
                <motion.button initial="rest" onClick={openApp} style={ghostButtonStyle()} whileHover="hover">
                  <span style={{ color: palette.accent }}>See it in the product</span>
                  <motion.span variants={{ rest: { x: 0 }, hover: { x: 3 } }} style={{ color: palette.accent }}>{"->"}</motion.span>
                </motion.button>
              </div>

              <RideMapPreview variant="signature" />
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

const pageStyle: CSSProperties = {
  background: palette.background,
  color: palette.textPrimary,
  fontFamily: fonts.body,
  height: "100vh",
  minHeight: "100vh",
  overflowX: "hidden",
  overflowY: "auto",
  WebkitOverflowScrolling: "touch",
  position: "relative"
};

const frameStyle: CSSProperties = {
  width: `min(1280px, calc(100vw - ${spacing.shellInset}px))`,
  margin: "0 auto"
};

const navStyle: CSSProperties = {
  position: "sticky",
  top: 0,
  zIndex: 100,
  height: 56,
  borderBottom: "1px solid rgba(255,255,255,0)"
};

const navInnerStyle: CSSProperties = {
  height: 56,
  display: "flex",
  alignItems: "center",
  justifyContent: "space-between",
  gap: 20
};

const heroCopyStyle: CSSProperties = {
  position: "relative",
  zIndex: 3,
  display: "grid",
  alignContent: "center",
  paddingBottom: 0
};

const heroHeadlineStyle: CSSProperties = {
  margin: 0,
  fontSize: type.displayXL,
  lineHeight: 1.05,
  fontWeight: 700,
  letterSpacing: "-0.04em",
  fontFamily: fonts.display
};

const heroBodyStyle: CSSProperties = {
  margin: 0,
  maxWidth: 380,
  fontSize: type.bodyL,
  lineHeight: 1.65,
  color: palette.textSecondary
};

const heroMapWrapStyle: CSSProperties = {
  position: "absolute",
  right: -10,
  top: 56,
  bottom: 24,
  width: "52%",
  display: "flex",
  alignItems: "center",
  justifyContent: "flex-end",
  pointerEvents: "none"
};

const heroMapMobileWrapStyle: CSSProperties = {
  position: "relative",
  width: "100%",
  marginTop: 36,
  minHeight: 360
};

const heroMapFadeLeftStyle: CSSProperties = {
  position: "absolute",
  inset: 0,
  background: "linear-gradient(to right, #080809 0%, rgba(8,8,9,0) 15%)",
  zIndex: 2
};

const heroMapFadeBottomStyle: CSSProperties = {
  position: "absolute",
  inset: 0,
  background: "linear-gradient(to top, #080809 0%, rgba(8,8,9,0) 20%)",
  zIndex: 2
};

const sectionHeadingStyle: CSSProperties = {
  margin: 0,
  fontSize: type.displayM,
  lineHeight: 1.12,
  fontWeight: 600,
  letterSpacing: "-0.025em",
  fontFamily: fonts.display,
  color: palette.textPrimary
};

const sectionSublineStyle: CSSProperties = {
  margin: 0,
  fontSize: type.bodyS,
  lineHeight: 1.55,
  color: palette.textTertiary
};

const bodyMediumStyle: CSSProperties = {
  margin: 0,
  fontSize: type.bodyM,
  lineHeight: 1.6,
  color: palette.textSecondary
};

const microAccentStyle: CSSProperties = {
  fontSize: type.micro,
  lineHeight: 1.4,
  fontWeight: 500,
  letterSpacing: "0.08em",
  textTransform: "uppercase",
  color: palette.accent
};

const microMutedStyle: CSSProperties = {
  fontSize: type.micro,
  lineHeight: 1.4,
  fontWeight: 500,
  letterSpacing: "0.08em",
  textTransform: "uppercase",
  color: palette.textQuiet
};

const monoSmallStyle: CSSProperties = {
  fontFamily: fonts.mono,
  fontSize: 10,
  letterSpacing: "0.02em"
};

const pillStyle: CSSProperties = {
  height: 24,
  padding: "0 10px",
  borderRadius: 999,
  border: `1px solid ${palette.borderDefault}`,
  display: "inline-flex",
  alignItems: "center",
  justifyContent: "center",
  fontSize: 10,
  fontWeight: 500,
  letterSpacing: "0.08em",
  textTransform: "uppercase"
};

const iconButtonStyle: CSSProperties = {
  appearance: "none",
  border: `1px solid ${palette.borderDefault}`,
  background: palette.surface3,
  height: 34,
  borderRadius: 7,
  padding: "0 12px",
  color: palette.textPrimary,
  cursor: "pointer",
  fontSize: 12,
  fontWeight: 500
};

const ctaHeadingStyle: CSSProperties = {
  margin: 0,
  fontSize: type.displayL,
  lineHeight: 1.08,
  fontWeight: 700,
  letterSpacing: "-0.03em",
  fontFamily: fonts.display
};

const footerInnerStyle: CSSProperties = {
  position: "relative",
  height: 64,
  display: "flex",
  alignItems: "center",
  justifyContent: "space-between"
};

const footerLinkStyle: CSSProperties = {
  appearance: "none",
  border: "none",
  background: "transparent",
  padding: 0,
  cursor: "pointer",
  color: palette.textQuiet,
  fontSize: 12,
  transition: "color 150ms ease"
};
