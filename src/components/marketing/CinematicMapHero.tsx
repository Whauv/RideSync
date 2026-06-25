import { motion } from "framer-motion";

import { tokens } from "@/design/tokens";

const palette = tokens.marketing.color;
const fonts = tokens.marketing.font;
const ease = tokens.marketing.motion.sectionEase;

const contourPaths = [
  "M632 98C578 58 472 48 384 82C290 118 234 188 220 250C206 312 234 372 314 406C392 440 512 438 608 394",
  "M720 122C656 78 526 74 420 114C322 152 260 220 242 286C226 348 248 408 320 454C390 498 514 512 638 484",
  "M760 178C700 132 590 126 468 160C348 194 280 254 266 320C252 392 292 458 388 500C478 540 620 538 726 494",
  "M754 242C684 214 594 208 496 236C384 268 312 326 304 384C296 442 348 502 444 538C520 566 634 570 730 540",
  "M678 38C570 18 438 24 330 72C204 126 134 212 128 286C120 374 174 446 276 502",
  "M800 316C724 302 650 300 562 322C464 346 390 390 370 438C346 498 382 556 452 598",
  "M544 12C458 0 364 20 286 60C178 116 116 206 108 292C96 394 162 486 262 548"
];

const riderPositions = [
  { name: "Maya", speed: "68", x: 252, y: 468, color: palette.accent, leader: true, angle: -18 },
  { name: "Allen", speed: "66", x: 324, y: 428, color: "#7B61FF", angle: -10 },
  { name: "Luis", speed: "64", x: 426, y: 374, color: "#FF6B35", angle: 2 },
  { name: "Kim", speed: "65", x: 546, y: 302, color: "#FFD23F", angle: 10 },
  { name: "Jon", speed: "63", x: 644, y: 228, color: "#60A5FA", angle: 18 }
];

function ArrowHead({ x, y, angle, color }: { x: number; y: number; angle: number; color: string }) {
  return (
    <g transform={`translate(${x}, ${y - 18}) rotate(${angle})`}>
      <polygon fill={color} points="0,-5 6,5 0,2 -6,5" />
    </g>
  );
}

export function CinematicMapHero() {
  return (
    <motion.div
      animate={{ opacity: 0.9, scale: 1 }}
      initial={{ opacity: 0, scale: 0.97 }}
      style={{ width: "100%", height: "100%" }}
      transition={{ duration: 1.6, delay: 0.2, ease }}
    >
      <svg preserveAspectRatio="xMidYMid slice" viewBox="0 0 800 720" width="100%">
        <defs>
          <linearGradient id="hero-route-glow" x1="0%" x2="100%" y1="0%" y2="0%">
            <stop offset="0%" stopColor="rgba(0,196,154,0.03)" />
            <stop offset="50%" stopColor="rgba(0,196,154,0.24)" />
            <stop offset="100%" stopColor="rgba(0,196,154,0.05)" />
          </linearGradient>
        </defs>

        {Array.from({ length: 14 }).map((_, index) => (
          <line
            key={`v-${index}`}
            stroke="rgba(255,255,255,0.018)"
            strokeWidth="1"
            x1={index * 60}
            x2={index * 60}
            y1="0"
            y2="720"
          />
        ))}
        {Array.from({ length: 12 }).map((_, index) => (
          <line
            key={`h-${index}`}
            stroke="rgba(255,255,255,0.018)"
            strokeWidth="1"
            x1="0"
            x2="800"
            y1={index * 60}
            y2={index * 60}
          />
        ))}

        <g transform="translate(0 72)">
          {contourPaths.map((d, index) => (
            <path
              key={d}
              d={d}
              fill="none"
              opacity={1 - index * 0.04}
              stroke="rgba(255,255,255,0.03)"
              strokeWidth="1"
            />
          ))}

          <motion.path
            d="M210 496C266 468 308 446 360 410C418 370 466 332 510 298C566 256 634 210 716 168"
            fill="none"
            initial={{ pathLength: 0 }}
            stroke="url(#hero-route-glow)"
            strokeDasharray="8 4"
            strokeLinecap="round"
            strokeWidth="3"
            transition={{ duration: 2.5, delay: 0.8, ease: "easeInOut" }}
            animate={{ pathLength: 1 }}
          />

          {riderPositions.map((rider) => (
            <g key={rider.name}>
              <ArrowHead angle={rider.angle} color={rider.color} x={rider.x} y={rider.y} />
              {rider.leader ? (
                <motion.circle
                  animate={{ opacity: [0.4, 0], scale: [1, 1.6] }}
                  cx={rider.x}
                  cy={rider.y}
                  r="10"
                  stroke={palette.accent}
                  strokeWidth="1.2"
                  style={{ transformOrigin: `${rider.x}px ${rider.y}px` }}
                  transition={{ duration: 2.5, ease: "easeOut", repeat: Number.POSITIVE_INFINITY }}
                />
              ) : null}
              <circle cx={rider.x} cy={rider.y} fill={rider.color} opacity={rider.leader ? 0.9 : 0.75} r={rider.leader ? 10 : 7} />
              <text
                fill={palette.textPrimary}
                fontFamily={fonts.display}
                fontSize="9"
                opacity="0.7"
                textAnchor="middle"
                x={rider.x}
                y={rider.y - 14}
              >
                {rider.name}
              </text>
              <text
                fill={palette.textTertiary}
                fontFamily={fonts.mono}
                fontSize="8"
                opacity="0.8"
                textAnchor="middle"
                x={rider.x}
                y={rider.y + 20}
              >
                {rider.speed} mph
              </text>
            </g>
          ))}
        </g>

        <g transform="translate(32 650)">
          <rect
            fill={palette.surface2}
            height="52"
            rx="8"
            stroke={palette.borderDefault}
            width="180"
            style={{ backdropFilter: tokens.marketing.blur.glass }}
          />
          <circle cx="18" cy="26" fill={palette.accent} r="4" />
          <text fill={palette.textPrimary} fontFamily={fonts.mono} fontSize="10" x="30" y="29">
            Voice linked
          </text>
          <text fill={palette.textPrimary} fontFamily={fonts.mono} fontSize="10" textAnchor="end" x="158" y="29">
            ↕ 118 mi
          </text>
        </g>
      </svg>
    </motion.div>
  );
}
