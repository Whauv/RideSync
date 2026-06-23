import { useRef } from "react";
import type { CSSProperties, RefObject } from "react";
import { useRouter } from "expo-router";
import { useWindowDimensions } from "react-native";
import { motion, useMotionTemplate, useMotionValue, useMotionValueEvent, useScroll } from "framer-motion";

import { AnimateIn } from "@/components/web/AnimateIn";
import { DesktopSchematic } from "@/components/web/DesktopSchematic";
import { RideMapPreview } from "@/components/web/RideMapPreview";
import { tokens } from "@/design/tokens";

const palette = tokens.marketing.color;
const scale = tokens.marketing.type;
const spacing = tokens.marketing.spacing;
const radius = tokens.marketing.radius;

const fontStack = 'Inter, ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif';
const ease = [0.22, 1, 0.36, 1] as const;

const statements = [
  {
    label: "VOICE ROOM",
    heading: "Talk without the group collapsing into a phone tree.",
    body: "Every helmet on the same channel before wheels roll."
  },
  {
    label: "RIDE MAP",
    heading: "Spacing and drift visible before they become a problem.",
    body: "Leader position, rider pace, route context - one glance."
  },
  {
    label: "SIGNALS",
    heading: "Fuel, hazards, and SOS that don't clutter the map.",
    body: "Only the signals riders actually act on, when they matter."
  }
];

const metrics = [
  { value: "< 80ms", label: "voice latency target" },
  { value: "118 mi", label: "long staged route" },
  { value: "8 riders", label: "default lobby profile" },
  { value: "3 views", label: "leader context layers" },
  { value: "1 room", label: "voice, map, and signals" },
  { value: "24/7", label: "ops console path" }
];

const webList = ["Route briefings", "Lobby control", "Live desktop map", "Rider approvals", "Ops console"];
const mobileList = ["Live GPS stream", "Background-safe alerts", "Voice in motion", "SOS escalation", "Glove-friendly controls"];

function splitWords(text: string) {
  return text.split(" ").map((word, index) => (
    <motion.span
      key={`${word}-${index}`}
      initial={{ opacity: 0, y: 20 }}
      style={{ display: "inline-block", marginRight: 10 }}
      transition={{ duration: 0.54, delay: index * 0.08, ease }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
    >
      {word}
    </motion.span>
  ));
}

function staggerWords(text: string, delayStep = 0.06) {
  return text.split(" ").map((word, index) => (
    <motion.span
      key={`${word}-${index}`}
      initial={{ opacity: 0, y: 16 }}
      style={{ display: "inline-block", marginRight: 10 }}
      transition={{ duration: 0.44, delay: index * delayStep, ease }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
    >
      {word}
    </motion.span>
  ));
}

function NavLink({ label, onClick }: { label: string; onClick: () => void }) {
  return (
    <motion.button
      initial="rest"
      onClick={onClick}
      style={navLinkStyle}
      whileHover="hover"
    >
      <span>{label}</span>
      <motion.span
        style={navUnderlineStyle}
        variants={{
          rest: { scaleX: 0, opacity: 0.4 },
          hover: { scaleX: 1, opacity: 1 }
        }}
      />
    </motion.button>
  );
}

function PrimaryButton({ label, onClick, large = false }: { label: string; onClick: () => void; large?: boolean }) {
  return (
    <motion.button
      onClick={onClick}
      style={{
        ...buttonReset,
        height: large ? 44 : 36,
        padding: large ? "0 20px" : "0 14px",
        borderRadius: large ? radius.button : radius.control,
        background: palette.accent,
        color: "#FFFFFF",
        fontFamily: fontStack,
        fontSize: large ? scale.body : scale.ui,
        fontWeight: 500,
        letterSpacing: "-0.01em"
      }}
      whileHover={{ y: -1 }}
      whileTap={{ scale: 0.99 }}
    >
      {label}
    </motion.button>
  );
}

function GhostButton({ label, onClick }: { label: string; onClick: () => void }) {
  const [text, arrow] = label.split("->");

  return (
    <motion.button
      initial="rest"
      onClick={onClick}
      style={{
        ...buttonReset,
        height: 44,
        padding: "0 2px",
        color: palette.textPrimary,
        fontFamily: fontStack,
        fontSize: scale.body,
        fontWeight: 500,
        letterSpacing: "-0.01em",
        gap: 6
      }}
      whileHover="hover"
    >
      <span>{text.trim()}</span>
      <motion.span
        variants={{
          rest: { x: 0, opacity: 0.72 },
          hover: { x: 4, opacity: 1 }
        }}
      >
        {arrow ? "→" : ""}
      </motion.span>
    </motion.button>
  );
}

function Statement({ item, index, showDivider }: { item: (typeof statements)[number]; index: number; showDivider: boolean }) {
  return (
    <>
      <AnimateIn delay={index * 0.12} direction="up">
        <div style={{ display: "grid", gridTemplateColumns: "2px 1fr", gap: 18, minWidth: 260 }}>
          <div style={{ width: 2, height: 32, background: palette.accent, opacity: 0.7, marginTop: 4 }} />
          <div style={{ display: "grid", gap: 10 }}>
            <span
              style={{
                fontFamily: fontStack,
                fontSize: scale.micro,
                fontWeight: 500,
                letterSpacing: "0.1em",
                color: palette.accent,
                opacity: 0.7
              }}
            >
              {item.label}
            </span>
            <h3 style={statementHeadingStyle}>{item.heading}</h3>
            <p style={statementBodyStyle}>{item.body}</p>
          </div>
        </div>
      </AnimateIn>
      {showDivider ? <div style={statementDividerStyle} /> : null}
    </>
  );
}

function PlatformHalf({
  title,
  body,
  items,
  accent = false,
  icon
}: {
  title: string;
  body: string;
  items: string[];
  accent?: boolean;
  icon: "browser" | "phone";
}) {
  const textColor = accent ? "#0C0C0E" : palette.textPrimary;
  const subtleColor = accent ? "rgba(0,0,0,0.55)" : palette.textSecondary;
  const listColor = accent ? "rgba(0,0,0,0.40)" : palette.textQuiet;

  return (
    <motion.div
      style={{
        flex: 1,
        minHeight: 360,
        background: accent ? palette.accent : palette.surface1,
        padding: 64,
        display: "grid",
        gap: 24
      }}
      whileHover={{ scale: 1.005 }}
      transition={{ duration: 0.2, ease }}
    >
      <div style={{ opacity: accent ? 0.7 : 0.5 }}>{icon === "browser" ? <BrowserGlyph dark={!accent} /> : <PhoneGlyph />}</div>
      <div style={{ display: "grid", gap: 12 }}>
        <h3
          style={{
            margin: 0,
            fontFamily: fontStack,
            fontSize: 48,
            lineHeight: 0.95,
            fontWeight: 700,
            letterSpacing: "-0.03em",
            color: textColor
          }}
        >
          {title}
        </h3>
        <p
          style={{
            margin: 0,
            fontFamily: fontStack,
            fontSize: scale.ui,
            lineHeight: 1.65,
            fontWeight: 400,
            color: subtleColor,
            maxWidth: 360
          }}
        >
          {body}
        </p>
      </div>
      <div style={{ display: "grid", gap: 8 }}>
        {items.map((item) => (
          <span
            key={item}
            style={{
              fontFamily: fontStack,
              fontSize: scale.ui,
              lineHeight: 1.5,
              fontWeight: 400,
              fontStyle: "italic",
              color: listColor
            }}
          >
            {item}
          </span>
        ))}
      </div>
    </motion.div>
  );
}

function BrowserGlyph({ dark }: { dark: boolean }) {
  return (
    <svg height="20" viewBox="0 0 24 24" width="20">
      <rect fill="none" height="16" rx="3" stroke={dark ? palette.textPrimary : "#0C0C0E"} strokeOpacity="0.7" strokeWidth="1.2" width="20" x="2" y="4" />
      <line stroke={dark ? palette.textPrimary : "#0C0C0E"} strokeOpacity="0.45" strokeWidth="1.2" x1="2" x2="22" y1="8" y2="8" />
      <circle cx="5.5" cy="6" fill={dark ? palette.textPrimary : "#0C0C0E"} fillOpacity="0.55" r="0.9" />
      <circle cx="8.5" cy="6" fill={dark ? palette.textPrimary : "#0C0C0E"} fillOpacity="0.55" r="0.9" />
    </svg>
  );
}

function PhoneGlyph() {
  return (
    <svg height="20" viewBox="0 0 24 24" width="20">
      <rect fill="none" height="18" rx="3" stroke="#0C0C0E" strokeOpacity="0.7" strokeWidth="1.2" width="10" x="7" y="3" />
      <circle cx="12" cy="17.5" fill="#0C0C0E" fillOpacity="0.55" r="0.9" />
    </svg>
  );
}

export default function MarketingWebScreen() {
  const router = useRouter();
  const { width } = useWindowDimensions();
  const mobile = width < 900;
  const heroRef = useRef<HTMLDivElement>(null);
  const storyRef = useRef<HTMLDivElement>(null);
  const { scrollY } = useScroll();
  const navOpacity = useMotionValue(0);
  const navBlur = useMotionValue(0);
  const navBorder = useMotionValue(0);
  const navBackground = useMotionTemplate`rgba(12,12,14,${navOpacity})`;
  const navBackdrop = useMotionTemplate`blur(${navBlur}px)`;
  const navBorderColor = useMotionTemplate`rgba(255,255,255,${navBorder})`;

  useMotionValueEvent(scrollY, "change", (value) => {
    const progress = Math.max(0, Math.min(1, value / 40));
    navOpacity.set(progress * 0.85);
    navBlur.set(progress * 16);
    navBorder.set(progress * 0.06);
  });

  const scrollTo = (ref: RefObject<HTMLDivElement>) => ref.current?.scrollIntoView({ behavior: "smooth", block: "start" });
  const openGitHub = () => window.open("https://github.com/Whauv/RideSync", "_blank", "noopener,noreferrer");

  return (
    <div style={pageStyle}>
      <motion.header
        style={{
          ...navShellStyle,
          backgroundColor: navBackground,
          backdropFilter: navBackdrop,
          WebkitBackdropFilter: navBackdrop as unknown as string,
          borderBottomColor: navBorderColor
        }}
      >
        <div style={navInnerStyle}>
          <div style={{ display: "grid", gap: 2 }}>
            <span style={wordmarkStyle}>RideSync</span>
            <span style={taglineStyle}>Group ride operations</span>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: mobile ? 12 : 20 }}>
            <div style={{ display: "flex", alignItems: "center", gap: mobile ? 8 : 12 }}>
              <NavLink label="Product" onClick={() => scrollTo(heroRef)} />
              {!mobile ? <NavLink label="Ops console" onClick={() => router.push("/admin")} /> : null}
              {!mobile ? <NavLink label="GitHub" onClick={openGitHub} /> : null}
            </div>
            <PrimaryButton label="Open web app" onClick={() => router.push("/(auth)/sign-in")} />
          </div>
        </div>
      </motion.header>

      <main style={{ width: "100%" }}>
        <section ref={heroRef} style={{ ...contentFrameStyle, ...heroSectionStyle, minHeight: mobile ? "auto" : "92vh" }}>
          <div style={{ ...heroCopyStyle, paddingTop: mobile ? 110 : 138 }}>
            <AnimateIn direction="fade" duration={0.6}>
              <span style={eyebrowStyle}>GROUP RIDE COORDINATION</span>
            </AnimateIn>

            <div style={{ display: "grid", gap: 6 }}>
              <h1 style={heroLineStyle}>{splitWords("Every rider.")}</h1>
              <h1 style={{ ...heroLineStyle, marginLeft: mobile ? 0 : 24 }}>{splitWords("One channel.")}</h1>
            </div>

            <motion.div
              initial={{ opacity: 0, scaleX: 0.65 }}
              style={heroRuleStyle}
              transition={{ duration: 0.5, delay: 0.28, ease }}
              whileInView={{ opacity: 1, scaleX: 1 }}
              viewport={{ once: true }}
            />

            <AnimateIn delay={0.6} direction="fade" duration={0.6}>
              <p style={heroSublineStyle}>
                RideSync runs the group from the first pin drop to the last mile. Voice, map, and rider signals - in a room that actually works.
              </p>
            </AnimateIn>

            <AnimateIn delay={0.68} direction="up" duration={0.45}>
              <div style={{ display: "flex", alignItems: "center", gap: 12, flexWrap: "wrap" }}>
                <PrimaryButton label="Open RideSync" large onClick={() => router.push("/(auth)/sign-in")} />
                <GhostButton label="See how it works ->" onClick={() => scrollTo(storyRef)} />
              </div>
            </AnimateIn>

            <AnimateIn delay={0.84} direction="fade" duration={0.6}>
              <p style={heroDisclosureStyle}>Simulated visualization - live map available in product.</p>
            </AnimateIn>
          </div>

          <div style={mobile ? heroMapMobileStyle : heroMapDesktopStyle}>
            <div style={heroMapFadeStyle} />
            <RideMapPreview />
          </div>
        </section>

        <section style={{ ...contentFrameStyle, ...statementStripStyle }}>
          <div style={{ display: "flex", alignItems: "stretch", gap: mobile ? 32 : 28, flexDirection: mobile ? "column" : "row" }}>
            {statements.map((statement, index) => (
              <div key={statement.label} style={{ display: "flex", alignItems: "center", flex: 1 }}>
                <Statement index={index} item={statement} showDivider={!mobile && index < statements.length - 1} />
              </div>
            ))}
          </div>
        </section>

        <section ref={storyRef} style={{ ...contentFrameStyle, ...editorialSectionStyle, flexDirection: mobile ? "column" : "row" }}>
          <AnimateIn direction="left" style={{ flex: 1 }}>
            <div style={{ display: "grid", gap: 18, maxWidth: 480 }}>
              <h2 style={editorialHeadlineStyle}>Built for the part of the ride nobody makes an app for.</h2>
              <p style={editorialBodyStyle}>
                Getting 8 riders from different zip codes to the same trailhead, with everyone briefed, voiced-in, and mapped - that's where most group rides fall apart. RideSync is the command layer that runs that moment.
              </p>
            </div>
          </AnimateIn>

          <AnimateIn direction="right" style={{ flex: 1 }}>
            <div style={metricGridStyle}>
              {metrics.map((metric) => (
                <div key={metric.label} style={metricCellStyle}>
                  <div style={metricValueStyle}>{metric.value}</div>
                  <div style={metricLabelStyle}>{metric.label}</div>
                </div>
              ))}
            </div>
          </AnimateIn>
        </section>

        <section style={{ ...commandSectionStyle, padding: mobile ? "96px 24px" : "120px 0" }}>
          <div style={contentFrameStyle}>
            <div style={{ display: "grid", gap: 18, maxWidth: 760, marginBottom: 40 }}>
              <AnimateIn direction="fade">
                <span style={eyebrowStyle}>DESKTOP COMMAND CENTER</span>
              </AnimateIn>
              <AnimateIn direction="up" delay={0.08}>
                <h2 style={commandHeadingStyle}>The group leader&apos;s view. Before and during the ride.</h2>
              </AnimateIn>
              <AnimateIn direction="up" delay={0.16}>
                <p style={commandBodyStyle}>
                  Room staging, lobby control, live map monitoring, safety state, and voice - in a single browser window. No hardware required beyond your OS-paired headset.
                </p>
              </AnimateIn>
            </div>
            <DesktopSchematic />
          </div>
        </section>

        <section style={{ ...contentFrameStyle, ...platformSplitWrapStyle, flexDirection: mobile ? "column" : "row" }}>
          <PlatformHalf
            body="Planning, staging, monitoring, moderation. Everything that happens before wheels turn."
            icon="browser"
            items={webList}
            title="Web"
          />
          <PlatformHalf
            accent
            body="Live execution. Background location. Native permissions. The ride-time runtime."
            icon="phone"
            items={mobileList}
            title="Mobile"
          />
        </section>

        <section style={{ ...contentFrameStyle, ...finalCtaStyle }}>
          <div style={{ display: "grid", gap: 18, justifyItems: "center", textAlign: "center" }}>
            <h2 style={finalHeadlineStyle}>{staggerWords("Your next group ride starts here.")}</h2>
            <p style={finalBodyStyle}>Get in the room.</p>
            <AnimateIn delay={0.24} direction="up">
              <PrimaryButton label="Open RideSync" large onClick={() => router.push("/(auth)/sign-in")} />
            </AnimateIn>
          </div>
        </section>
      </main>

      <footer style={footerStyle}>
        <div style={contentFrameStyle}>
          <div style={footerInnerStyle}>
            <span style={footerWordmarkStyle}>RideSync</span>
            <span style={footerCenterStyle}>Built for riders. Not for dashboards.</span>
            <motion.button onClick={openGitHub} style={footerLinkStyle} whileHover={{ opacity: 1 }}>
              GitHub
            </motion.button>
          </div>
        </div>
      </footer>
    </div>
  );
}

const buttonReset: CSSProperties = {
  appearance: "none",
  border: "none",
  outline: "none",
  cursor: "pointer",
  display: "inline-flex",
  alignItems: "center",
  justifyContent: "center",
  background: "transparent"
};

const pageStyle: CSSProperties = {
  height: "100vh",
  minHeight: "100vh",
  overflowY: "auto",
  overflowX: "hidden",
  WebkitOverflowScrolling: "touch",
  position: "relative",
  background: palette.background,
  color: palette.textPrimary,
  fontFamily: fontStack
};

const contentFrameStyle: CSSProperties = {
  width: "min(1280px, calc(100vw - 48px))",
  margin: "0 auto"
};

const navShellStyle: CSSProperties = {
  position: "fixed",
  top: 0,
  left: 0,
  right: 0,
  zIndex: 40,
  height: spacing.navHeight,
  borderBottom: "1px solid transparent"
};

const navInnerStyle: CSSProperties = {
  ...contentFrameStyle,
  height: spacing.navHeight,
  display: "flex",
  alignItems: "center",
  justifyContent: "space-between"
};

const wordmarkStyle: CSSProperties = {
  fontSize: scale.body,
  fontWeight: 600,
  letterSpacing: "-0.01em",
  lineHeight: 1
};

const taglineStyle: CSSProperties = {
  fontSize: scale.micro,
  fontWeight: 400,
  opacity: 0.35,
  lineHeight: 1.2
};

const navLinkStyle: CSSProperties = {
  ...buttonReset,
  position: "relative",
  height: 36,
  padding: "0 4px",
  color: "rgba(240,240,242,0.6)",
  fontFamily: fontStack,
  fontSize: scale.ui,
  fontWeight: 400
};

const navUnderlineStyle: CSSProperties = {
  position: "absolute",
  left: "50%",
  bottom: 7,
  width: 18,
  height: 1,
  marginLeft: -9,
  background: palette.accent,
  transformOrigin: "center"
};

const heroSectionStyle: CSSProperties = {
  position: "relative",
  display: "grid",
  alignItems: "center",
  paddingBottom: 72
};

const heroCopyStyle: CSSProperties = {
  position: "relative",
  zIndex: 2,
  display: "grid",
  gap: 0,
  maxWidth: 560
};

const eyebrowStyle: CSSProperties = {
  fontSize: scale.micro,
  lineHeight: 1.4,
  fontWeight: 500,
  letterSpacing: "0.12em",
  color: palette.accent
};

const heroLineStyle: CSSProperties = {
  margin: 0,
  fontSize: scale.hero,
  lineHeight: 0.96,
  fontWeight: 700,
  letterSpacing: "-0.03em"
};

const heroRuleStyle: CSSProperties = {
  width: 48,
  height: 1,
  background: palette.accent,
  transformOrigin: "left",
  margin: "24px 0"
};

const heroSublineStyle: CSSProperties = {
  margin: 0,
  maxWidth: 420,
  fontSize: scale.subhead,
  lineHeight: 1.6,
  fontWeight: 400,
  color: palette.textSecondary
};

const heroDisclosureStyle: CSSProperties = {
  margin: "24px 0 0",
  fontSize: scale.footnote,
  lineHeight: 1.4,
  fontWeight: 400,
  color: palette.textTertiary
};

const heroMapDesktopStyle: CSSProperties = {
  position: "absolute",
  right: -48,
  top: 100,
  width: "55%",
  maxWidth: 860,
  pointerEvents: "none"
};

const heroMapMobileStyle: CSSProperties = {
  position: "relative",
  width: "100%",
  marginTop: 48
};

const heroMapFadeStyle: CSSProperties = {
  position: "absolute",
  inset: 0,
  background: "linear-gradient(90deg, rgba(12,12,14,1) 0%, rgba(12,12,14,0.92) 18%, rgba(12,12,14,0) 48%)",
  zIndex: 2
};

const statementStripStyle: CSSProperties = {
  paddingBottom: spacing.sectionGap,
  overflowX: "auto",
  overflowY: "visible"
};

const statementHeadingStyle: CSSProperties = {
  margin: 0,
  fontSize: scale.statement,
  lineHeight: 1.25,
  fontWeight: 600,
  color: palette.textPrimary,
  maxWidth: 280
};

const statementBodyStyle: CSSProperties = {
  margin: 0,
  fontSize: scale.ui,
  lineHeight: 1.6,
  fontWeight: 400,
  color: "rgba(240,240,242,0.5)",
  maxWidth: 240
};

const statementDividerStyle: CSSProperties = {
  width: 1,
  height: 48,
  background: "rgba(255,255,255,0.1)",
  margin: "0 28px"
};

const editorialSectionStyle: CSSProperties = {
  display: "flex",
  gap: spacing.subsectionGap,
  paddingBottom: spacing.sectionGap
};

const editorialHeadlineStyle: CSSProperties = {
  margin: 0,
  fontSize: scale.display,
  lineHeight: 1.15,
  fontWeight: 600,
  letterSpacing: "-0.02em",
  color: palette.textPrimary
};

const editorialBodyStyle: CSSProperties = {
  margin: 0,
  fontSize: scale.body,
  lineHeight: 1.65,
  fontWeight: 400,
  color: "rgba(240,240,242,0.55)"
};

const metricGridStyle: CSSProperties = {
  display: "grid",
  gridTemplateColumns: "repeat(2, minmax(0, 1fr))",
  gap: 16
};

const metricCellStyle: CSSProperties = {
  minHeight: 108,
  display: "grid",
  alignContent: "start",
  gap: 8,
  paddingTop: 8,
  borderTop: `1px solid ${palette.borderSubtle}`
};

const metricValueStyle: CSSProperties = {
  fontSize: 22,
  lineHeight: 1,
  fontWeight: 700,
  letterSpacing: "-0.02em",
  color: palette.accent
};

const metricLabelStyle: CSSProperties = {
  fontSize: scale.footnote,
  lineHeight: 1.5,
  fontWeight: 400,
  color: "rgba(240,240,242,0.45)"
};

const commandSectionStyle: CSSProperties = {
  width: "100%",
  background: palette.backgroundElevated,
  marginBottom: spacing.sectionGap
};

const commandHeadingStyle: CSSProperties = {
  margin: 0,
  fontSize: scale.section,
  lineHeight: 1.15,
  fontWeight: 600,
  letterSpacing: "-0.02em"
};

const commandBodyStyle: CSSProperties = {
  margin: 0,
  fontSize: scale.ui,
  lineHeight: 1.65,
  fontWeight: 400,
  color: "rgba(240,240,242,0.5)",
  maxWidth: 620
};

const platformSplitWrapStyle: CSSProperties = {
  display: "flex",
  gap: 0,
  marginBottom: spacing.sectionGap
};

const finalCtaStyle: CSSProperties = {
  paddingTop: spacing.sectionGapLarge,
  paddingBottom: spacing.sectionGapLarge
};

const finalHeadlineStyle: CSSProperties = {
  margin: 0,
  fontSize: scale.display,
  lineHeight: 1.15,
  fontWeight: 600,
  letterSpacing: "-0.02em"
};

const finalBodyStyle: CSSProperties = {
  margin: 0,
  fontSize: scale.body,
  lineHeight: 1.5,
  fontWeight: 400,
  color: palette.textTertiary
};

const footerStyle: CSSProperties = {
  borderTop: `1px solid ${palette.borderSubtle}`
};

const footerInnerStyle: CSSProperties = {
  height: 56,
  display: "flex",
  alignItems: "center",
  justifyContent: "space-between",
  gap: 16
};

const footerWordmarkStyle: CSSProperties = {
  fontSize: scale.ui,
  fontWeight: 500,
  color: palette.textPrimary
};

const footerCenterStyle: CSSProperties = {
  fontSize: scale.caption,
  fontWeight: 400,
  color: palette.textQuiet
};

const footerLinkStyle: CSSProperties = {
  ...buttonReset,
  fontFamily: fontStack,
  fontSize: scale.caption,
  fontWeight: 400,
  color: palette.textSecondary,
  opacity: 0.4
};
