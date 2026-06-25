import type { CSSProperties, ReactNode } from "react";
import { motion } from "framer-motion";

import { tokens } from "@/design/tokens";

const palette = tokens.marketing.color;
const fonts = tokens.marketing.font;

function StageVisual({ stage }: { stage: string }) {
  const stroke = palette.textSecondary;

  switch (stage) {
    case "Plan":
      return (
        <svg height="60" viewBox="0 0 80 60" width="80">
          <path d="M6 46C18 34 24 18 38 18C52 18 54 38 72 24" fill="none" stroke={stroke} strokeWidth="1.4" />
          <circle cx="12" cy="40" fill={palette.accent} r="3" />
          <circle cx="38" cy="18" fill="none" r="3" stroke={stroke} strokeWidth="1.2" />
          <circle cx="70" cy="24" fill="none" r="3" stroke={stroke} strokeWidth="1.2" />
        </svg>
      );
    case "Gather":
      return (
        <svg height="60" viewBox="0 0 80 60" width="80">
          <circle cx="18" cy="18" fill={stroke} r="3" />
          <circle cx="62" cy="18" fill={stroke} r="3" />
          <circle cx="40" cy="44" fill={palette.accent} r="4" />
          <path d="M18 18L40 44L62 18" fill="none" stroke={stroke} strokeWidth="1.2" />
        </svg>
      );
    case "Voice":
      return (
        <svg height="60" viewBox="0 0 80 60" width="80">
          {[18, 28, 38, 48, 58].map((x, index) => (
            <rect key={x} fill={index === 2 ? palette.accent : stroke} height={[10, 18, 26, 18, 10][index]} rx="1.5" width="4" x={x} y={30 - [10, 18, 26, 18, 10][index] / 2} />
          ))}
        </svg>
      );
    case "Ride":
      return (
        <svg height="60" viewBox="0 0 80 60" width="80">
          <path d="M8 44C26 20 40 18 72 14" fill="none" stroke={stroke} strokeDasharray="3 4" strokeWidth="1.3" />
          <circle cx="18" cy="34" fill={palette.accent} r="4" />
          <circle cx="38" cy="26" fill={stroke} r="3" />
          <circle cx="60" cy="18" fill={stroke} r="3" />
        </svg>
      );
    case "Handle":
      return (
        <svg height="60" viewBox="0 0 80 60" width="80">
          <path d="M40 12L60 20V30C60 40 53 48 40 52C27 48 20 40 20 30V20L40 12Z" fill="none" stroke={stroke} strokeWidth="1.2" />
          <rect fill={palette.stateEmergency} height="16" rx="2" width="4" x="38" y="22" />
          <circle cx="40" cy="42" fill={palette.stateEmergency} r="2.2" />
        </svg>
      );
    case "Review":
    default:
      return (
        <svg height="60" viewBox="0 0 80 60" width="80">
          <path d="M12 40C22 26 34 20 50 20C58 20 64 22 70 26" fill="none" stroke={stroke} strokeWidth="1.2" />
          <path d="M54 12L70 26L56 40" fill="none" stroke={palette.accent} strokeWidth="1.4" />
          <circle cx="24" cy="32" fill={stroke} r="2.4" />
        </svg>
      );
  }
}

export function RideStage({
  index,
  name,
  description,
  active,
  showConnector
}: {
  index: number;
  name: string;
  description: string;
  active: boolean;
  showConnector: boolean;
}) {
  return (
    <div
      style={{
        display: "flex",
        alignItems: "stretch",
        gap: 18,
        minWidth: 190,
        flex: showConnector ? 1 : undefined
      }}
    >
      <div
        style={{
          position: "relative",
          borderLeft: `1px solid ${active ? palette.accentBorder : palette.borderSubtle}`,
          paddingLeft: 16,
          display: "grid",
          gap: 12,
          flex: 1
        }}
      >
        {active ? (
          <motion.div
            layoutId="activeStage"
            style={{
              position: "absolute",
              left: -1,
              top: 0,
              bottom: 0,
              width: 2,
              background: palette.accent
            }}
          />
        ) : null}
        <span
          style={{
            fontFamily: fonts.body,
            fontSize: tokens.marketing.type.micro,
            letterSpacing: "0.08em",
            textTransform: "uppercase",
            color: palette.accent,
            opacity: 0.5
          }}
        >
          {String(index + 1).padStart(2, "0")}
        </span>
        <StageVisual stage={name} />
        <div style={{ display: "grid", gap: 8 }}>
          <h3
            style={{
              margin: 0,
              fontFamily: fonts.body,
              fontSize: tokens.marketing.type.subheading,
              lineHeight: 1.3,
              fontWeight: 500,
              color: active ? palette.accent : palette.textPrimary
            }}
          >
            {name}
          </h3>
          <p
            style={{
              margin: 0,
              maxWidth: 160,
              fontFamily: fonts.body,
              fontSize: 12,
              lineHeight: 1.5,
              color: palette.textTertiary
            }}
          >
            {description}
          </p>
        </div>
      </div>
      {showConnector ? (
        <div
          aria-hidden
          style={{
            alignSelf: "center",
            width: 56,
            borderTop: `1px dashed rgba(255,255,255,0.08)`,
            opacity: 0.85
          }}
        />
      ) : null}
    </div>
  );
}
