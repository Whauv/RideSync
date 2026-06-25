import type { CSSProperties } from "react";
import { AnimatePresence, motion } from "framer-motion";

import { SkeletonLine } from "@/components/admin/SkeletonShimmer";
import { tokens } from "@/design/tokens";

const palette = tokens.admin.color;
const radius = tokens.admin.radius;
const fonts = tokens.admin.font;
const ease = [0.16, 1, 0.3, 1] as const;

function sparklinePoints(value: number) {
  if (value === 0) {
    return "0,15 10,15 20,15 30,15 40,15";
  }

  return "0,15 10,14 20,13 30,11 40,7";
}

export function StatCard({
  activityRatio,
  color = "default",
  delay,
  label,
  loading = false,
  value
}: {
  activityRatio: number;
  color?: "accent" | "danger" | "default" | "warning";
  delay: number;
  label: string;
  loading?: boolean;
  value: number;
}) {
  const semanticColor =
    color === "accent" ? palette.accent : color === "warning" ? palette.warning : color === "danger" ? palette.danger : palette.neutral;
  const bottomWidth = `${Math.max(0.08, activityRatio) * 100}%`;
  const valueColor = value === 0 ? palette.textPrimary : color === "default" ? palette.textPrimary : semanticColor;
  const metaLabel =
    label === "ROOMS"
      ? "active rooms"
      : label === "INCIDENTS"
        ? "open incidents"
        : label === "FLAGS"
          ? "pending review"
          : "log events";

  return (
    <motion.div
      animate={{ opacity: 1, y: 0 }}
      initial={{ opacity: 0, y: 10 }}
      style={cardStyle}
      transition={{ duration: 0.4, delay, ease }}
      whileHover={{ backgroundColor: palette.panelHover, borderColor: palette.borderStrong }}
    >
      <div style={leftColumnStyle}>
        <div style={labelStyle}>{label}</div>
        <div style={numberWrapStyle}>
          {loading ? (
            <SkeletonLine height={22} width={32} />
          ) : (
            <AnimatePresence initial={false} mode="wait">
              <motion.span
                key={value}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                initial={{ opacity: 0, y: 10 }}
                style={{ ...numberStyle, color: valueColor }}
                transition={{ duration: 0.15, ease }}
              >
                {value}
              </motion.span>
            </AnimatePresence>
          )}
        </div>
      </div>

      <div style={rightColumnStyle}>
        <svg height="20" viewBox="0 0 40 20" width="40">
          <polyline
            fill="none"
            points={sparklinePoints(value)}
            stroke={value === 0 ? "rgba(255,255,255,0.08)" : semanticColor}
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeOpacity={value === 0 ? 1 : 0.6}
            strokeWidth="1.4"
          />
        </svg>
        <div style={metaStyle}>{metaLabel}</div>
      </div>

      <div style={stripTrackStyle}>
        <motion.div
          animate={{ width: loading ? "16%" : bottomWidth }}
          initial={{ width: 0 }}
          style={{
            ...stripFillStyle,
            background: value === 0 ? "rgba(255,255,255,0.04)" : semanticColor
          }}
          transition={{ duration: 1, delay: delay + 0.06, ease: "easeOut" }}
        />
      </div>
    </motion.div>
  );
}

const cardStyle: CSSProperties = {
  position: "relative",
  height: 72,
  background: palette.panel,
  border: `1px solid ${palette.borderDefault}`,
  borderRadius: radius.stat,
  padding: "14px 18px",
  display: "grid",
  gridTemplateColumns: "1fr auto",
  alignItems: "start",
  overflow: "hidden",
  transition: "background-color 150ms ease, border-color 150ms ease"
};

const leftColumnStyle: CSSProperties = {
  display: "grid",
  alignContent: "start"
};

const labelStyle: CSSProperties = {
  fontFamily: fonts.body,
  fontSize: 9,
  lineHeight: 1.2,
  fontWeight: 600,
  letterSpacing: "0.09em",
  textTransform: "uppercase",
  color: palette.textTertiary
};

const numberWrapStyle: CSSProperties = {
  minHeight: 34,
  display: "flex",
  alignItems: "center",
  marginTop: 4
};

const numberStyle: CSSProperties = {
  fontFamily: fonts.body,
  fontSize: 30,
  lineHeight: 1,
  fontWeight: 700,
  fontVariantNumeric: "tabular-nums"
};

const rightColumnStyle: CSSProperties = {
  display: "grid",
  justifyItems: "end",
  alignContent: "start",
  gap: 4
};

const metaStyle: CSSProperties = {
  fontFamily: fonts.mono,
  fontSize: 9,
  lineHeight: 1.2,
  color: palette.textQuaternary
};

const stripTrackStyle: CSSProperties = {
  position: "absolute",
  left: 0,
  right: 0,
  bottom: 0,
  height: 2,
  background: "rgba(255,255,255,0.04)"
};

const stripFillStyle: CSSProperties = {
  height: "100%"
};
