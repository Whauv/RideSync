import { motion } from "framer-motion";

import { tokens } from "@/design/tokens";

import { iconButtonStyle, monoSmallStyle, pillStyle } from "./marketingStyles";

const palette = tokens.marketing.color;
const ease = tokens.marketing.motion.sectionEase;

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

export function VoicePanel() {
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
