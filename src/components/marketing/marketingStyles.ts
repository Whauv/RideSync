import type { CSSProperties } from "react";

import { tokens } from "@/design/tokens";

/**
 * Shared style helpers and inline style constants for the marketing page.
 * Extracted verbatim from `app/marketing.web.tsx` so the route and its section
 * components share a single source of truth. The route keeps its own token
 * aliases for inline JSX styles.
 */

const palette = tokens.marketing.color;
const type = tokens.marketing.type;
const spacing = tokens.marketing.spacing;
const fonts = tokens.marketing.font;

export function navLinkStyle(active: boolean): CSSProperties {
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

export function primaryButtonStyle(large = false): CSSProperties {
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

export function ghostButtonStyle(): CSSProperties {
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

export function dataValue(value: string, accent = false): CSSProperties {
  return {
    fontFamily: fonts.mono,
    fontSize: type.data,
    fontWeight: 500,
    letterSpacing: "0.02em",
    color: accent ? palette.accent : palette.textPrimary
  };
}

export const pageStyle: CSSProperties = {
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

export const frameStyle: CSSProperties = {
  width: `min(1280px, calc(100vw - ${spacing.shellInset}px))`,
  margin: "0 auto"
};

export const navStyle: CSSProperties = {
  position: "sticky",
  top: 0,
  zIndex: 100,
  height: 56,
  borderBottom: "1px solid rgba(255,255,255,0)"
};

export const navInnerStyle: CSSProperties = {
  height: 56,
  display: "flex",
  alignItems: "center",
  justifyContent: "space-between",
  gap: 20
};

export const heroCopyStyle: CSSProperties = {
  position: "relative",
  zIndex: 3,
  display: "grid",
  alignContent: "center",
  paddingBottom: 0
};

export const heroHeadlineStyle: CSSProperties = {
  margin: 0,
  fontSize: type.displayXL,
  lineHeight: 1.05,
  fontWeight: 700,
  letterSpacing: "-0.04em",
  fontFamily: fonts.display
};

export const heroBodyStyle: CSSProperties = {
  margin: 0,
  maxWidth: 380,
  fontSize: type.bodyL,
  lineHeight: 1.65,
  color: palette.textSecondary
};

export const heroMapWrapStyle: CSSProperties = {
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

export const heroMapMobileWrapStyle: CSSProperties = {
  position: "relative",
  width: "100%",
  marginTop: 36,
  minHeight: 360
};

export const heroMapFadeLeftStyle: CSSProperties = {
  position: "absolute",
  inset: 0,
  background: "linear-gradient(to right, #080809 0%, rgba(8,8,9,0) 15%)",
  zIndex: 2
};

export const heroMapFadeBottomStyle: CSSProperties = {
  position: "absolute",
  inset: 0,
  background: "linear-gradient(to top, #080809 0%, rgba(8,8,9,0) 20%)",
  zIndex: 2
};

export const mapSectionNumberStyle: CSSProperties = {
  position: "absolute",
  left: -32,
  top: "50%",
  transform: "translateY(-50%) rotate(-90deg)",
  transformOrigin: "center",
  fontFamily: fonts.mono,
  fontSize: 9,
  letterSpacing: "0.06em",
  color: palette.textPrimary,
  pointerEvents: "none"
};

export const liveMapOverlineStyle: CSSProperties = {
  fontSize: 10,
  lineHeight: 1.2,
  fontWeight: 600,
  letterSpacing: "0.10em",
  textTransform: "uppercase",
  color: palette.accent,
  opacity: 0.75
};

export const liveMapBookmarkStyle: CSSProperties = {
  width: 0,
  height: 1.5,
  background: palette.accent,
  opacity: 0,
  marginBottom: 14
};

export const liveMapHeadingStyle: CSSProperties = {
  margin: 0,
  fontSize: 32,
  lineHeight: 1.08,
  fontWeight: 700,
  letterSpacing: "-0.025em",
  fontFamily: fonts.display,
  color: palette.textPrimary,
  maxWidth: 340
};

export const liveMapAccentBarStyle: CSSProperties = {
  height: 1.5,
  background: palette.accent,
  marginTop: 16,
  marginBottom: 20
};

export const liveMapBodyStyle: CSSProperties = {
  margin: 0,
  maxWidth: 360,
  fontSize: 14,
  lineHeight: 1.65,
  fontWeight: 400,
  color: "rgba(242,243,245,0.58)"
};

export const liveMapMetricsGridStyle: CSSProperties = {
  display: "grid",
  gridTemplateColumns: "1fr 1fr",
  rowGap: 16,
  columnGap: 24,
  maxWidth: 280,
  marginTop: 28
};

export const metricCalloutStyle: CSSProperties = {
  display: "grid",
  gridTemplateColumns: "1px 1fr",
  alignItems: "start",
  gap: 12,
  opacity: 0.85
};

export const metricBorderStyle: CSSProperties = {
  width: 1,
  height: 20,
  background: "rgba(0,196,154,0.35)",
  marginTop: 4
};

export const metricValueStyle: CSSProperties = {
  fontFamily: fonts.mono,
  fontSize: 24,
  lineHeight: 1,
  fontWeight: 600,
  color: palette.textPrimary
};

export const metricSuffixStyle: CSSProperties = {
  color: palette.accent
};

export const metricLabelStyle: CSSProperties = {
  fontSize: 9,
  lineHeight: 1.4,
  fontWeight: 500,
  letterSpacing: "0.08em",
  textTransform: "uppercase",
  whiteSpace: "pre-line",
  color: "rgba(238,238,240,0.32)"
};

export const liveMapLinkStyle: CSSProperties = {
  ...ghostButtonStyle(),
  position: "relative",
  width: "fit-content",
  marginTop: 24,
  color: palette.accent,
  opacity: 0.75,
  transition: "opacity 150ms ease"
};

export const liveMapLinkUnderlineStyle: CSSProperties = {
  position: "absolute",
  left: 0,
  right: 18,
  bottom: -4,
  height: 1,
  background: "rgba(0,196,154,0.4)",
  transformOrigin: "left center"
};

export const mapFadeLeftStyle: CSSProperties = {
  position: "absolute",
  left: 0,
  top: 0,
  bottom: 0,
  width: 80,
  background: "linear-gradient(to right, #080809 0%, rgba(8,8,9,0) 100%)",
  pointerEvents: "none",
  zIndex: 2
};

export const mapFadeTopStyle: CSSProperties = {
  position: "absolute",
  top: 0,
  left: 0,
  right: 0,
  height: 60,
  background: "linear-gradient(to bottom, #080809 0%, rgba(8,8,9,0) 100%)",
  pointerEvents: "none",
  zIndex: 2
};

export const mapFadeRightStyle: CSSProperties = {
  position: "absolute",
  right: 0,
  top: 0,
  bottom: 0,
  width: 80,
  background: "linear-gradient(to left, #080809 0%, rgba(8,8,9,0) 60%)",
  pointerEvents: "none",
  zIndex: 2
};

export const mapFadeBottomStyle: CSSProperties = {
  position: "absolute",
  bottom: 0,
  left: 0,
  right: 0,
  height: 80,
  background: "linear-gradient(to top, #080809 0%, rgba(8,8,9,0) 100%)",
  pointerEvents: "none",
  zIndex: 2
};

export const sectionHeadingStyle: CSSProperties = {
  margin: 0,
  fontSize: type.displayM,
  lineHeight: 1.12,
  fontWeight: 600,
  letterSpacing: "-0.025em",
  fontFamily: fonts.display,
  color: palette.textPrimary
};

export const sectionSublineStyle: CSSProperties = {
  margin: 0,
  fontSize: type.bodyS,
  lineHeight: 1.55,
  color: palette.textTertiary
};

export const bodyMediumStyle: CSSProperties = {
  margin: 0,
  fontSize: type.bodyM,
  lineHeight: 1.6,
  color: palette.textSecondary
};

export const microAccentStyle: CSSProperties = {
  fontSize: type.micro,
  lineHeight: 1.4,
  fontWeight: 500,
  letterSpacing: "0.08em",
  textTransform: "uppercase",
  color: palette.accent
};

export const microMutedStyle: CSSProperties = {
  fontSize: type.micro,
  lineHeight: 1.4,
  fontWeight: 500,
  letterSpacing: "0.08em",
  textTransform: "uppercase",
  color: palette.textQuiet
};

export const monoSmallStyle: CSSProperties = {
  fontFamily: fonts.mono,
  fontSize: 10,
  letterSpacing: "0.02em"
};

export const pillStyle: CSSProperties = {
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

export const iconButtonStyle: CSSProperties = {
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

export const ctaHeadingStyle: CSSProperties = {
  margin: 0,
  fontSize: type.displayL,
  lineHeight: 1.08,
  fontWeight: 700,
  letterSpacing: "-0.03em",
  fontFamily: fonts.display
};

export const footerInnerStyle: CSSProperties = {
  position: "relative",
  height: 64,
  display: "flex",
  alignItems: "center",
  justifyContent: "space-between"
};

export const footerLinkStyle: CSSProperties = {
  appearance: "none",
  border: "none",
  background: "transparent",
  padding: 0,
  cursor: "pointer",
  color: palette.textQuiet,
  fontSize: 12,
  transition: "color 150ms ease"
};
