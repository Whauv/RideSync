import type { CSSProperties, ReactNode } from "react";
import { motion } from "framer-motion";

import { tokens } from "@/design/tokens";

const palette = tokens.admin.color;
const fonts = tokens.admin.font;

export function EmptyState({
  body,
  heading,
  icon,
  minHeight = 140,
  paddingY = 40
}: {
  body: string;
  heading: string;
  icon: ReactNode;
  minHeight?: number;
  paddingY?: number;
}) {
  return (
    <motion.div
      animate={{ opacity: 1, y: 0 }}
      initial={{ opacity: 0, y: 6 }}
      style={{ ...wrapStyle, minHeight, paddingTop: paddingY, paddingBottom: paddingY }}
      transition={{ duration: 0.45, delay: 0.25, ease: [0.16, 1, 0.3, 1] }}
    >
      <div>{icon}</div>
      <div style={headingStyle}>{heading}</div>
      <div style={bodyStyle}>{body}</div>
    </motion.div>
  );
}

export function RoadGlyph() {
  return (
    <svg height="28" viewBox="0 0 36 28" width="36">
      <rect
        fill="rgba(255,255,255,0.03)"
        height="28"
        rx="2"
        stroke="rgba(255,255,255,0.07)"
        strokeWidth="1"
        width="14"
        x="11"
        y="0"
      />
      <rect fill="rgba(0,196,154,0.30)" height="4" rx="1" width="2" x="17" y="2" />
      <rect fill="rgba(0,196,154,0.30)" height="4" rx="1" width="2" x="17" y="10" />
      <rect fill="rgba(0,196,154,0.30)" height="4" rx="1" width="2" x="17" y="18" />
      <line stroke="rgba(255,255,255,0.05)" strokeWidth="1" x1="13" x2="13" y1="0" y2="28" />
      <line stroke="rgba(255,255,255,0.05)" strokeWidth="1" x1="23" x2="23" y1="0" y2="28" />
    </svg>
  );
}

export function ShieldCheckGlyph() {
  return (
    <svg height="28" viewBox="0 0 24 28" width="24">
      <path
        d="M12 1L2 5v8c0 6.5 4.5 11.5 10 13 5.5-1.5 10-6.5 10-13V5L12 1z"
        fill="rgba(0,196,154,0.04)"
        stroke="rgba(0,196,154,0.25)"
        strokeWidth="1.5"
      />
      <path
        d="M8 14l2.5 2.5 5-5.5"
        stroke="rgba(0,196,154,0.50)"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="1.5"
      />
    </svg>
  );
}

export function CheckGlyph() {
  return (
    <svg height="28" viewBox="0 0 28 28" width="28">
      <circle cx="14" cy="14" fill="none" r="12" stroke="rgba(0,196,154,0.20)" strokeWidth="1.5" />
      <path
        d="M9 14l3.5 3.5 6.5-7"
        stroke="rgba(0,196,154,0.55)"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="1.5"
      />
    </svg>
  );
}

const wrapStyle: CSSProperties = {
  display: "grid",
  justifyItems: "center",
  alignContent: "center",
  textAlign: "center"
};

const headingStyle: CSSProperties = {
  marginTop: 10,
  fontFamily: fonts.body,
  fontSize: 13,
  lineHeight: 1.35,
  fontWeight: 500,
  color: palette.textSecondary
};

const bodyStyle: CSSProperties = {
  marginTop: 6,
  maxWidth: 200,
  fontFamily: fonts.body,
  fontSize: 11,
  lineHeight: 1.55,
  fontWeight: 400,
  color: palette.textTertiary
};
