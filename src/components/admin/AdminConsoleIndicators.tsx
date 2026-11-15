import { motion } from "framer-motion";

import { metaInlineStyle, metaValueStyle, palette, pulseDotStyle, pulseRingStyle, pulseWrapStyle } from "./adminConsoleStyles";

export function HeaderPulseDot() {
  return (
    <span style={pulseWrapStyle}>
      <motion.span
        animate={{ opacity: [1, 0], scale: [1, 1.5] }}
        style={pulseRingStyle}
        transition={{ duration: 2, repeat: Number.POSITIVE_INFINITY, ease: "easeOut" }}
      />
      <span style={pulseDotStyle} />
    </span>
  );
}

export function RefreshIcon() {
  return (
    <svg height="16" viewBox="0 0 24 24" width="16">
      <path d="M19.5 12a7.5 7.5 0 1 1-2.2-5.3" fill="none" stroke="currentColor" strokeLinecap="round" strokeWidth="1.6" />
      <path d="M19.5 5.5v4h-4" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.6" />
    </svg>
  );
}

export function RoomStatusMeta({ riderCount }: { riderCount: number }) {
  const active = riderCount > 0;

  return (
    <div style={metaInlineStyle}>
      <span style={pulseWrapStyle}>
        {active ? (
          <motion.span
            animate={{ opacity: [1, 0], scale: [1, 1.5] }}
            style={{ ...pulseRingStyle, background: palette.accent }}
            transition={{ duration: 2, repeat: Number.POSITIVE_INFINITY, ease: "easeOut" }}
          />
        ) : null}
        <span style={{ ...pulseDotStyle, background: active ? palette.accent : "rgba(255,255,255,0.20)" }} />
      </span>
      <span style={{ ...metaValueStyle, color: active ? palette.accent : palette.textTertiary }}>{riderCount} riders</span>
    </div>
  );
}

export function IncidentStatusMeta({ count }: { count: number }) {
  const active = count > 0;

  return (
    <div style={metaInlineStyle}>
      {active ? <HeaderPulseDot /> : <span style={{ ...pulseDotStyle, background: palette.neutral }} />}
      <span style={{ ...metaValueStyle, color: active ? palette.warning : palette.textTertiary }}>{count} active</span>
    </div>
  );
}
