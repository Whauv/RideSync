import type { CSSProperties } from "react";
import { AnimatePresence, motion } from "framer-motion";

import { tokens } from "@/design/tokens";
import { SkeletonBlock } from "@/components/admin/SkeletonBlock";

const palette = tokens.admin.color;
const radius = tokens.admin.radius;
const fontStack = 'Inter, ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif';

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
  const numberColor =
    value === 0
      ? palette.textPrimary
      : color === "accent"
        ? palette.accent
        : color === "warning"
          ? palette.warning
          : color === "danger"
            ? palette.danger
            : palette.textPrimary;

  return (
    <motion.div
      animate={{ opacity: 1, y: 0 }}
      initial={{ opacity: 0, y: 12 }}
      style={cardStyle}
      transition={{ duration: 0.4, delay, ease: [0.16, 1, 0.3, 1] }}
      whileHover={{ backgroundColor: "#181820", borderColor: "rgba(255,255,255,0.12)" }}
    >
      <div style={labelStyle}>{label}</div>
      <div style={numberWrapStyle}>
        {loading ? (
          <SkeletonBlock height={28} radiusName="badge" width={72} />
        ) : (
          <AnimatePresence initial={false} mode="wait">
            <motion.span
              key={value}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -12 }}
              initial={{ opacity: 0, y: 12 }}
              style={{ ...numberStyle, color: numberColor }}
              transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
            >
              {value}
            </motion.span>
          </AnimatePresence>
        )}
      </div>
      <div style={progressTrackStyle}>
        <motion.div
          animate={{ scaleX: loading ? 0.25 : activityRatio }}
          initial={{ scaleX: 0 }}
          style={{ ...progressFillStyle, background: value === 0 ? palette.accent : numberColor }}
          transition={{ duration: 0.35, delay: delay + 0.12, ease: [0.16, 1, 0.3, 1] }}
        />
      </div>
    </motion.div>
  );
}

const cardStyle: CSSProperties = {
  background: palette.stat,
  border: `1px solid ${palette.borderDefault}`,
  borderRadius: radius.stat,
  padding: "16px 20px",
  minHeight: 112,
  display: "grid",
  alignContent: "space-between",
  transition: "background-color 150ms ease, border-color 150ms ease"
};

const labelStyle: CSSProperties = {
  fontFamily: fontStack,
  fontSize: 10,
  lineHeight: 1.4,
  fontWeight: 500,
  letterSpacing: "0.08em",
  textTransform: "uppercase",
  color: palette.textPrimary,
  opacity: 0.38
};

const numberWrapStyle: CSSProperties = {
  position: "relative",
  minHeight: 36,
  display: "flex",
  alignItems: "center"
};

const numberStyle: CSSProperties = {
  fontFamily: fontStack,
  fontSize: 28,
  lineHeight: 1,
  fontWeight: 700,
  fontVariantNumeric: "tabular-nums",
  color: palette.textPrimary
};

const progressTrackStyle: CSSProperties = {
  width: "100%",
  height: 1,
  background: "rgba(255,255,255,0.03)",
  overflow: "hidden"
};

const progressFillStyle: CSSProperties = {
  width: "100%",
  height: 1,
  transformOrigin: "left center"
};
