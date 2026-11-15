import type { CSSProperties } from "react";

import { tokens } from "@/design/tokens";

/**
 * Shared design tokens and inline style constants for the operations console.
 * Extracted verbatim from `app/admin.web.tsx` so the route file and the
 * console's presentational components share a single source of truth.
 */

export const palette = tokens.admin.color;
export const spacing = tokens.admin.spacing;
export const fonts = tokens.admin.font;
export const ease = [0.16, 1, 0.3, 1] as const;

export const pageStyle: CSSProperties = {
  height: "100vh",
  minHeight: "100vh",
  background: palette.background,
  color: palette.textPrimary,
  fontFamily: fonts.body,
  overflowX: "hidden",
  overflowY: "auto",
  WebkitOverflowScrolling: "touch",
  position: "relative"
};

export const shellStyle: CSSProperties = {
  width: "min(1280px, calc(100vw - 40px))",
  margin: "0 auto"
};

export const headerStyle: CSSProperties = {
  position: "sticky",
  top: 0,
  zIndex: 50,
  height: 52,
  background: "rgba(9,9,11,0.92)",
  borderBottom: "1px solid rgba(255,255,255,0.06)",
  backdropFilter: "blur(20px) saturate(130%)",
  WebkitBackdropFilter: "blur(20px) saturate(130%)"
};

export const headerInnerStyle: CSSProperties = {
  height: 52,
  display: "flex",
  alignItems: "center",
  justifyContent: "space-between",
  gap: 20
};

export const headerLeftStyle: CSSProperties = {
  display: "flex",
  alignItems: "center",
  gap: 10
};

export const headerAccentStyle: CSSProperties = {
  width: 2,
  height: 18,
  borderRadius: 1,
  background: palette.accent,
  opacity: 0.85,
  flexShrink: 0
};

export const headerTitleStyle: CSSProperties = {
  fontSize: 14,
  lineHeight: 1.1,
  fontWeight: 600,
  letterSpacing: "-0.01em",
  color: palette.textPrimary
};

export const headerSublineStyle: CSSProperties = {
  fontSize: 10,
  lineHeight: 1.25,
  fontWeight: 400,
  color: palette.textQuaternary
};

export const headerRightStyle: CSSProperties = {
  display: "flex",
  alignItems: "center",
  gap: 16
};

export const metaInlineStyle: CSSProperties = {
  display: "flex",
  alignItems: "center",
  gap: 8
};

export const metaValueStyle: CSSProperties = {
  fontSize: 11,
  lineHeight: 1,
  fontWeight: 400,
  color: palette.textTertiary
};

export const pulseWrapStyle: CSSProperties = {
  position: "relative",
  width: 6,
  height: 6,
  display: "inline-flex"
};

export const pulseRingStyle: CSSProperties = {
  position: "absolute",
  inset: 0,
  borderRadius: 999,
  background: palette.accent
};

export const pulseDotStyle: CSSProperties = {
  width: 6,
  height: 6,
  borderRadius: 999,
  background: palette.accent
};

export const headerDividerStyle: CSSProperties = {
  width: 1,
  height: 16,
  background: "rgba(255,255,255,0.08)"
};

export const clockStyle: CSSProperties = {
  minWidth: 76,
  textAlign: "right",
  fontFamily: fonts.mono,
  fontSize: 13,
  lineHeight: 1,
  fontWeight: 400,
  color: palette.textTertiary,
  fontVariantNumeric: "tabular-nums"
};

export const refreshButtonStyle: CSSProperties = {
  width: 28,
  height: 28,
  border: "none",
  background: "transparent",
  padding: 0,
  cursor: "pointer",
  color: palette.textPrimary,
  opacity: 0.35,
  display: "grid",
  placeItems: "center"
};

export const marketingLinkStyle: CSSProperties = {
  border: "none",
  background: "transparent",
  padding: 0,
  cursor: "pointer",
  fontFamily: fonts.body,
  fontSize: 12,
  lineHeight: 1.2,
  fontWeight: 400,
  color: palette.textQuaternary,
  transition: "color 130ms ease"
};

export const mainStyle: CSSProperties = {
  width: "min(1280px, calc(100vw - 40px))",
  margin: "0 auto",
  padding: "16px 0 32px",
  display: "grid",
  gap: 12
};

export const statGridStyle: CSSProperties = {
  display: "grid",
  gridTemplateColumns: "repeat(4, minmax(0, 1fr))",
  gap: 12
};

export const contentGridStyle: CSSProperties = {
  display: "grid",
  gridTemplateColumns: "1fr 380px",
  gap: 12,
  alignItems: "start"
};

export const leftColumnStyle: CSSProperties = {
  display: "flex",
  flexDirection: "column",
  gap: 12
};

export const rightColumnStyle: CSSProperties = {
  display: "flex",
  flexDirection: "column",
  gap: 12
};

export const panelListStyle: CSSProperties = {
  maxHeight: 320,
  overflowY: "auto"
};

export const roomRowStyle: CSSProperties = {
  height: 44,
  padding: "0 18px",
  borderBottom: "1px solid rgba(255,255,255,0.04)",
  display: "grid",
  gridTemplateColumns: "1fr auto",
  alignItems: "center",
  gap: 12
};

export const rowTitleStyle: CSSProperties = {
  fontSize: 13,
  lineHeight: 1.25,
  fontWeight: 500,
  color: palette.textPrimary,
  whiteSpace: "nowrap",
  overflow: "hidden",
  textOverflow: "ellipsis"
};

export const rowSubtitleStyle: CSSProperties = {
  marginTop: 2,
  fontSize: 10,
  lineHeight: 1.3,
  fontWeight: 400,
  color: palette.textQuaternary,
  whiteSpace: "nowrap",
  overflow: "hidden",
  textOverflow: "ellipsis"
};

export const rowRightStyle: CSSProperties = {
  display: "flex",
  alignItems: "center",
  gap: 8
};

export const rowMonoStyle: CSSProperties = {
  fontFamily: fonts.mono,
  fontSize: 11,
  lineHeight: 1.2,
  color: palette.textTertiary
};

export const statusDotStyle: CSSProperties = {
  width: 6,
  height: 6,
  borderRadius: 999
};

export const incidentRowStyle: CSSProperties = {
  minHeight: 44,
  padding: "10px 16px 10px 16px",
  borderBottom: "1px solid rgba(255,255,255,0.04)",
  display: "grid",
  gridTemplateColumns: "1fr auto",
  alignItems: "center",
  gap: 12
};

export const rowRightStackStyle: CSSProperties = {
  display: "grid",
  justifyItems: "end",
  gap: 4
};

export const timeAgoStyle: CSSProperties = {
  fontFamily: fonts.mono,
  fontSize: 11,
  lineHeight: 1.2,
  color: palette.textQuaternary,
  whiteSpace: "nowrap"
};

export const severityBadgeStyle: CSSProperties = {
  border: "1px solid",
  borderRadius: 3,
  padding: "2px 6px",
  fontSize: 9,
  lineHeight: 1.2,
  fontWeight: 600,
  textTransform: "uppercase"
};

export const liveTextStyle: CSSProperties = {
  fontSize: 9,
  lineHeight: 1,
  fontWeight: 600,
  letterSpacing: "0.08em",
  color: palette.accent
};

export const logListStyle: CSSProperties = {
  maxHeight: "calc(100vh - 260px)",
  overflowY: "auto"
};

export const roomSkeletonRowStyle: CSSProperties = {
  height: 44,
  padding: "0 18px",
  borderBottom: "1px solid rgba(255,255,255,0.04)",
  display: "grid",
  gridTemplateColumns: "1fr auto",
  alignItems: "center",
  gap: 12
};

export const logSkeletonRowStyle: CSSProperties = {
  minHeight: 44,
  padding: "10px 16px",
  borderBottom: "1px solid rgba(255,255,255,0.04)",
  display: "grid",
  gridTemplateColumns: "40px 1fr 40px",
  alignItems: "center",
  gap: 12
};

export const footerStyle: CSSProperties = {
  position: "relative",
  height: spacing.footerHeight,
  borderTop: "1px solid rgba(255,255,255,0.05)",
  display: "flex",
  alignItems: "center",
  padding: "0 20px"
};

export const footerLeftStyle: CSSProperties = {
  display: "flex",
  alignItems: "center",
  gap: 8,
  fontSize: 11,
  lineHeight: 1,
  color: palette.textQuaternary
};

export const footerDotStyle: CSSProperties = {
  width: 6,
  height: 6,
  borderRadius: 999,
  background: palette.accent
};

export const footerCenterStyle: CSSProperties = {
  position: "absolute",
  left: "50%",
  transform: "translateX(-50%)",
  fontSize: 11,
  lineHeight: 1,
  color: palette.textQuaternary
};

export const footerRightStyle: CSSProperties = {
  marginLeft: "auto",
  fontFamily: fonts.mono,
  fontSize: 11,
  lineHeight: 1,
  color: palette.textQuaternary
};
