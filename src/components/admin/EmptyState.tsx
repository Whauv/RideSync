import type { CSSProperties, ReactNode } from "react";
import { motion } from "framer-motion";

import { tokens } from "@/design/tokens";

const palette = tokens.admin.color;
const fontStack = 'Inter, ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif';

export function EmptyState({
  body,
  heading,
  icon,
  tight = false
}: {
  body: string;
  heading: string;
  icon: ReactNode;
  tight?: boolean;
}) {
  return (
    <motion.div
      animate={{ opacity: 1, y: 0 }}
      initial={{ opacity: 0, y: 8 }}
      style={{ ...wrapStyle, paddingTop: tight ? 40 : 48, paddingBottom: tight ? 40 : 48 }}
      transition={{ duration: 0.5, delay: 0.3, ease: [0.16, 1, 0.3, 1] }}
    >
      <div>{icon}</div>
      <div style={headingStyle}>{heading}</div>
      <div style={bodyStyle}>{body}</div>
    </motion.div>
  );
}

export function RoadGlyph() {
  return (
    <svg height="32" viewBox="0 0 40 32" width="40">
      <path d="M14 2h12l8 28H6L14 2Z" fill="none" stroke="rgba(240,240,242,0.20)" strokeWidth="1.2" />
      <path d="M20 6v4m0 4v4m0 4v4" stroke={palette.textSecondary} strokeLinecap="round" strokeWidth="1.2" />
    </svg>
  );
}

export function ShieldCheckGlyph() {
  return (
    <svg height="24" viewBox="0 0 24 24" width="24">
      <path d="M12 3.5 18.5 6v5.6c0 4.1-2.6 7.2-6.5 8.9-3.9-1.7-6.5-4.8-6.5-8.9V6L12 3.5Z" fill="none" stroke={palette.accent} strokeOpacity="0.3" strokeWidth="1.2" />
      <path d="m9.1 12.1 2.1 2.1 3.8-4.1" fill="none" stroke={palette.accent} strokeOpacity="0.3" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.2" />
    </svg>
  );
}

export function CheckGlyph() {
  return (
    <svg height="24" viewBox="0 0 24 24" width="24">
      <circle cx="12" cy="12" fill="none" r="9" stroke="rgba(240,240,242,0.22)" strokeWidth="1.2" />
      <path d="m8.5 12.2 2.3 2.3 4.6-5" fill="none" stroke={palette.success} strokeLinecap="round" strokeLinejoin="round" strokeOpacity="0.65" strokeWidth="1.5" />
    </svg>
  );
}

const wrapStyle: CSSProperties = {
  minHeight: 220,
  display: "grid",
  justifyItems: "center",
  alignContent: "center",
  textAlign: "center"
};

const headingStyle: CSSProperties = {
  marginTop: 12,
  fontFamily: fontStack,
  fontSize: 14,
  lineHeight: 1.4,
  fontWeight: 500,
  color: palette.textPrimary,
  opacity: 0.7
};

const bodyStyle: CSSProperties = {
  marginTop: 8,
  maxWidth: 240,
  fontFamily: fontStack,
  fontSize: 12,
  lineHeight: 1.5,
  fontWeight: 400,
  color: palette.textPrimary,
  opacity: 0.35
};
