import { motion } from "framer-motion";

import { tokens } from "@/design/tokens";

const palette = tokens.marketing.color;

const riders = [
  { name: "Maya", speed: "68 mph", x: 174, y: 164, color: palette.accent, leader: true, angle: -20 },
  { name: "Allen", speed: "66 mph", x: 302, y: 216, color: "#7B61FF", angle: -10 },
  { name: "Luis", speed: "64 mph", x: 426, y: 254, color: "#FF6B35", angle: 2 },
  { name: "Kim", speed: "65 mph", x: 560, y: 306, color: "#FFD23F", angle: 14 },
  { name: "Jon", speed: "63 mph", x: 670, y: 386, color: "#E05454", angle: 22 }
];

function Arrow({ x, y, angle, color }: { x: number; y: number; angle: number; color: string }) {
  return (
    <g transform={`translate(${x}, ${y - 18}) rotate(${angle})`}>
      <polygon fill={color} points="0,-6 6,6 0,3 -6,6" />
    </g>
  );
}

export function RideMapPreview() {
  const leader = riders[0];

  return (
    <motion.div
      initial={{ opacity: 0 }}
      style={{ position: "relative", width: "100%" }}
      transition={{ duration: 0.8, delay: 0.4, ease: [0.22, 1, 0.36, 1] }}
      whileInView={{ opacity: 1 }}
    >
      <svg viewBox="0 0 800 520" width="100%">
        <path
          d="M68 438 C164 348, 210 252, 312 218 C412 184, 496 182, 584 238 C654 282, 708 352, 756 420"
          fill="none"
          stroke={palette.road}
          strokeLinecap="round"
          strokeWidth="28"
        />
        <path
          d="M68 438 C164 348, 210 252, 312 218 C412 184, 496 182, 584 238 C654 282, 708 352, 756 420"
          fill="none"
          stroke={palette.roadCenter}
          strokeDasharray="5 12"
          strokeLinecap="round"
          strokeWidth="2"
        />
        <path
          d="M96 134 C162 92, 232 74, 336 86"
          fill="none"
          opacity="0.14"
          stroke={palette.textPrimary}
          strokeWidth="1"
        />
        <path
          d="M540 106 C626 114, 688 152, 742 214"
          fill="none"
          opacity="0.12"
          stroke={palette.textPrimary}
          strokeWidth="1"
        />

        {riders.map((rider) => (
          <g key={rider.name}>
            <Arrow angle={rider.angle} color={rider.color} x={rider.x} y={rider.y} />
            <circle cx={rider.x} cy={rider.y} fill={rider.color} r={rider.leader ? 12 : 8} />
            <text fill={palette.textPrimary} fontFamily="Inter, sans-serif" fontSize="10" fontWeight="500" opacity="0.85" x={rider.x + 16} y={rider.y - 4}>
              {rider.name}
            </text>
            <text fill={palette.textPrimary} fontFamily="Inter, sans-serif" fontSize="9" fontWeight="400" opacity="0.5" x={rider.x + 16} y={rider.y + 10}>
              {rider.speed}
            </text>
          </g>
        ))}

        <rect fill="rgba(26,26,30,0.90)" height="34" rx="17" width="126" x="28" y="458" />
        <rect fill="rgba(26,26,30,0.90)" height="34" rx="17" width="120" x="168" y="458" />
        <circle cx="48" cy="475" fill={palette.accent} r="4.5" />
        <text fill={palette.textPrimary} fontFamily="Inter, sans-serif" fontSize="11" fontWeight="500" x="60" y="479">
          Voice linked
        </text>
        <text fill={palette.textPrimary} fontFamily="Inter, sans-serif" fontSize="11" fontWeight="500" x="190" y="479">
          Route 118 mi
        </text>
      </svg>

      <motion.div
        animate={{ opacity: [0.4, 0], scale: [1, 1.8] }}
        style={{
          position: "absolute",
          left: `${(leader.x / 800) * 100}%`,
          top: `${(leader.y / 520) * 100}%`,
          width: 24,
          height: 24,
          borderRadius: 999,
          border: `1px solid ${palette.accent}`,
          marginLeft: -12,
          marginTop: -12,
          pointerEvents: "none"
        }}
        transition={{ duration: 2, ease: "easeOut", repeat: Number.POSITIVE_INFINITY }}
      />
    </motion.div>
  );
}
