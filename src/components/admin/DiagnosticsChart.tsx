import { motion } from "framer-motion";

import { DiagnosticEvent } from "@/types/runtime";

import { ease, fonts, palette } from "./adminConsoleStyles";

const CATEGORIES: DiagnosticEvent["category"][] = ["app", "room", "voice", "notification", "recovery"];

/**
 * Spike: a compact "diagnostics by category" bar chart for the admin console.
 *
 * Built token-native (inline SVG/flex + framer-motion, already a dependency)
 * rather than via Bklit UI, which is a shadcn + Tailwind registry this Expo /
 * React-Native-Web project does not use. It demonstrates the data-viz value the
 * admin console is missing without pulling in a new styling toolchain.
 */
export function DiagnosticsChart({ diagnostics }: { diagnostics: DiagnosticEvent[] }) {
  const rows = CATEGORIES.map((category) => ({
    category,
    count: diagnostics.filter((event) => event.category === category).length,
    hasAlert: diagnostics.some((event) => event.category === category && event.level !== "info")
  }));
  const max = Math.max(1, ...rows.map((row) => row.count));

  return (
    <div style={containerStyle}>
      <div style={captionStyle}>Events by category</div>
      <div style={{ display: "grid", gap: 8 }}>
        {rows.map((row, index) => (
          <div key={row.category} style={rowStyle}>
            <span style={labelStyle}>{row.category}</span>
            <div style={trackStyle}>
              <motion.div
                animate={{ width: `${(row.count / max) * 100}%` }}
                initial={{ width: 0 }}
                style={{ ...fillStyle, background: row.hasAlert ? palette.warning : palette.accent }}
                transition={{ duration: 0.5, delay: 0.1 + index * 0.06, ease }}
              />
            </div>
            <span style={countStyle}>{row.count}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

const containerStyle = {
  display: "grid",
  gap: 10,
  paddingBottom: 14,
  marginBottom: 12,
  borderBottom: "1px solid rgba(255,255,255,0.05)"
} as const;

const captionStyle = {
  fontFamily: fonts.body,
  fontSize: 10,
  fontWeight: 500,
  letterSpacing: "0.08em",
  textTransform: "uppercase",
  color: palette.textTertiary
} as const;

const rowStyle = {
  display: "grid",
  gridTemplateColumns: "76px 1fr 24px",
  alignItems: "center",
  gap: 10
} as const;

const labelStyle = {
  fontFamily: fonts.body,
  fontSize: 10,
  letterSpacing: "0.04em",
  textTransform: "uppercase",
  color: palette.textQuaternary
} as const;

const trackStyle = {
  height: 6,
  borderRadius: 3,
  background: "rgba(255,255,255,0.05)",
  overflow: "hidden"
} as const;

const fillStyle = {
  height: "100%",
  borderRadius: 3
} as const;

const countStyle = {
  fontFamily: fonts.mono,
  fontSize: 11,
  color: palette.textSecondary,
  textAlign: "right"
} as const;
