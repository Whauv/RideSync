import { tokens } from "@/design/tokens";

const palette = tokens.marketing.color;

export function Wordmark() {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
      <div style={{ width: 7, height: 7, borderRadius: 999, background: palette.accent, opacity: 0.85 }} />
      <span style={{ fontSize: 14, fontWeight: 600, letterSpacing: "-0.01em", color: palette.textPrimary }}>RideSync</span>
    </div>
  );
}
