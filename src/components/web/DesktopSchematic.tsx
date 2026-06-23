import { motion } from "framer-motion";

import { tokens } from "@/design/tokens";

const palette = tokens.marketing.color;

const riders = [
  { name: "Maya", y: 150, state: "Lead", accent: palette.accent },
  { name: "Allen", y: 206, state: "Ready", accent: "rgba(240,240,242,0.72)" },
  { name: "Luis", y: 262, state: "Fuel", accent: "#E09A00" },
  { name: "Kim", y: 318, state: "Voice", accent: "#7B61FF" },
  { name: "Jon", y: 374, state: "Trail", accent: "#E05454" }
];

export function DesktopSchematic() {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.96 }}
      style={{ width: "100%" }}
      transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
      viewport={{ once: true, margin: "-80px" }}
      whileInView={{ opacity: 1, scale: 1 }}
    >
      <svg viewBox="0 0 1320 820" width="100%">
        <rect fill={palette.surface1} height="820" rx="28" width="1320" />
        <rect fill={palette.surface2} height="66" rx="28" width="1320" />
        <rect fill="rgba(255,255,255,0.04)" height="18" rx="9" width="180" x="28" y="24" />
        <rect fill="rgba(0,196,154,0.14)" height="18" rx="9" width="92" x="226" y="24" />
        <rect fill="rgba(255,255,255,0.05)" height="18" rx="9" width="66" x="1196" y="24" />

        <rect fill="#101013" height="708" rx="24" width="260" x="28" y="84" />
        <text fill={palette.textSecondary} fontFamily="Inter, sans-serif" fontSize="12" fontWeight="600" x="52" y="124">
          ROOM ROSTER
        </text>
        {riders.map((rider) => (
          <g key={rider.name}>
            <rect fill="rgba(255,255,255,0.03)" height="44" rx="14" width="212" x="44" y={rider.y - 26} />
            <circle cx="64" cy={rider.y - 4} fill={rider.accent} r="5" />
            <text fill={palette.textPrimary} fontFamily="Inter, sans-serif" fontSize="14" fontWeight="500" x="80" y={rider.y}>
              {rider.name}
            </text>
            <text fill={palette.textQuiet} fontFamily="Inter, sans-serif" fontSize="11" x="80" y={rider.y + 16}>
              {rider.state}
            </text>
          </g>
        ))}

        <rect fill="#0E0F11" height="708" rx="24" width="654" x="316" y="84" />
        <path
          d="M394 620 C486 544, 530 462, 624 430 C718 398, 772 388, 860 448 C922 490, 956 556, 1022 620"
          fill="none"
          stroke="rgba(0,196,154,0.14)"
          strokeLinecap="round"
          strokeWidth="56"
        />
        <path
          d="M394 620 C486 544, 530 462, 624 430 C718 398, 772 388, 860 448 C922 490, 956 556, 1022 620"
          fill="none"
          stroke="rgba(0,196,154,0.36)"
          strokeDasharray="6 14"
          strokeLinecap="round"
          strokeWidth="2"
        />
        <rect fill="rgba(255,255,255,0.04)" height="30" rx="15" width="132" x="350" y="118" />
        <rect fill="rgba(255,255,255,0.04)" height="30" rx="15" width="120" x="490" y="118" />
        <rect fill="rgba(0,196,154,0.14)" height="30" rx="15" width="126" x="814" y="118" />
        <circle cx="566" cy="514" fill={palette.accent} r="12" />
        <circle cx="666" cy="468" fill="#7B61FF" r="8" />
        <circle cx="756" cy="462" fill="#FF6B35" r="8" />
        <circle cx="854" cy="532" fill="#FFD23F" r="8" />
        <circle cx="918" cy="592" fill="#E05454" r="8" />
        <rect fill="rgba(12,12,14,0.88)" height="40" rx="20" width="140" x="356" y="708" />
        <rect fill="rgba(12,12,14,0.88)" height="40" rx="20" width="126" x="510" y="708" />
        <circle cx="378" cy="728" fill={palette.accent} r="5" />
        <text fill={palette.textPrimary} fontFamily="Inter, sans-serif" fontSize="12" fontWeight="500" x="392" y="732">
          Voice linked
        </text>
        <text fill={palette.textPrimary} fontFamily="Inter, sans-serif" fontSize="12" fontWeight="500" x="536" y="732">
          Route 118 mi
        </text>

        <rect fill="#101013" height="708" rx="24" width="294" x="998" y="84" />
        <text fill={palette.textSecondary} fontFamily="Inter, sans-serif" fontSize="12" fontWeight="600" x="1026" y="124">
          CHAT AND EVENTS
        </text>
        <rect fill="rgba(255,255,255,0.03)" height="68" rx="16" width="238" x="1026" y="156" />
        <text fill={palette.textPrimary} fontFamily="Inter, sans-serif" fontSize="13" fontWeight="500" x="1050" y="186">
          Hazard confirmed near mile 42
        </text>
        <text fill={palette.textQuiet} fontFamily="Inter, sans-serif" fontSize="11" x="1050" y="206">
          Luis raised it. Room acknowledged.
        </text>
        <rect fill="rgba(255,255,255,0.03)" height="68" rx="16" width="238" x="1026" y="238" />
        <text fill={palette.textPrimary} fontFamily="Inter, sans-serif" fontSize="13" fontWeight="500" x="1050" y="268">
          Fuel stop marked in 18 miles
        </text>
        <text fill={palette.textQuiet} fontFamily="Inter, sans-serif" fontSize="11" x="1050" y="288">
          Group range window still healthy.
        </text>
        <rect fill="rgba(255,255,255,0.03)" height="156" rx="18" width="238" x="1026" y="334" />
        <text fill={palette.textSecondary} fontFamily="Inter, sans-serif" fontSize="11" fontWeight="600" x="1050" y="366">
          ROOM HEALTH
        </text>
        <text fill={palette.textPrimary} fontFamily="Inter, sans-serif" fontSize="24" fontWeight="700" x="1050" y="412">
          8 riders
        </text>
        <text fill={palette.textQuiet} fontFamily="Inter, sans-serif" fontSize="11" x="1050" y="432">
          7 voiced in, 1 reconnecting
        </text>
        <text fill={palette.textPrimary} fontFamily="Inter, sans-serif" fontSize="24" fontWeight="700" x="1050" y="482">
          0 SOS
        </text>
        <text fill={palette.textQuiet} fontFamily="Inter, sans-serif" fontSize="11" x="1050" y="502">
          No active escalations
        </text>
      </svg>
    </motion.div>
  );
}
