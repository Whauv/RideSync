import { useEffect, useMemo, useState } from "react";
import { motion } from "framer-motion";

import { tokens } from "@/design/tokens";

const palette = tokens.marketing.color;
const fonts = tokens.marketing.font;
const ease = tokens.marketing.motion.sectionEase;

type Point = {
  x: number;
  y: number;
  angle: number;
};

type Rider = {
  name: string;
  speed: string;
  color: string;
  leader?: boolean;
  points: Point[];
};

const riders: Rider[] = [
  {
    name: "Maya",
    speed: "68 mph",
    color: palette.accent,
    leader: true,
    points: [
      { x: 188, y: 382, angle: -16 },
      { x: 204, y: 364, angle: -12 },
      { x: 218, y: 354, angle: -8 }
    ]
  },
  {
    name: "Allen",
    speed: "66 mph",
    color: "#7B61FF",
    points: [
      { x: 270, y: 338, angle: -10 },
      { x: 284, y: 330, angle: -7 },
      { x: 294, y: 322, angle: -4 }
    ]
  },
  {
    name: "Luis",
    speed: "64 mph",
    color: "#FF6B35",
    points: [
      { x: 362, y: 286, angle: 0 },
      { x: 376, y: 280, angle: 4 },
      { x: 392, y: 274, angle: 6 }
    ]
  },
  {
    name: "Kim",
    speed: "65 mph",
    color: "#FFD23F",
    points: [
      { x: 466, y: 228, angle: 8 },
      { x: 482, y: 222, angle: 10 },
      { x: 498, y: 214, angle: 14 }
    ]
  },
  {
    name: "Jon",
    speed: "63 mph",
    color: "#60A5FA",
    points: [
      { x: 556, y: 174, angle: 16 },
      { x: 572, y: 166, angle: 18 },
      { x: 588, y: 158, angle: 22 }
    ]
  }
];

const backgroundDots = Array.from({ length: 460 }, (_, index) => ({
  x: (index % 23) * 28 + ((Math.floor(index / 23) % 2) * 8) + 10,
  y: Math.floor(index / 23) * 24 + 12
}));

function ArrowHead({ angle, color, x, y }: { angle: number; color: string; x: number; y: number }) {
  return (
    <g transform={`translate(${x}, ${y - 15}) rotate(${angle})`}>
      <polygon fill={color} points="0,-4 5,4 0,2 -5,4" />
    </g>
  );
}

export function RideMapPreview({ variant = "signature" }: { variant?: "hero" | "signature" }) {
  const [frame, setFrame] = useState(0);

  useEffect(() => {
    const timer = window.setInterval(() => {
      setFrame((current) => (current + 1) % 3);
    }, 3000);

    return () => window.clearInterval(timer);
  }, []);

  const leader = riders[0].points[frame];
  const viewBox = variant === "hero" ? "0 0 640 560" : "0 0 640 560";

  const hud = useMemo(
    () => [
      { label: "Voice linked", value: "●" },
      { label: "Route", value: "118 mi" }
    ],
    []
  );

  return (
    <motion.div
      initial={{ opacity: 0 }}
      style={{
        position: "relative",
        width: "100%",
        border: `1px solid ${palette.borderDefault}`,
        borderRadius: 12,
        overflow: "hidden",
        background: palette.metalSlate,
        boxShadow: tokens.marketing.elevation.float
      }}
      transition={{ duration: 1, delay: 0.18, ease }}
      whileInView={{ opacity: 1 }}
      viewport={{ once: true }}
    >
      <svg preserveAspectRatio="xMidYMid meet" viewBox={viewBox} width="100%">
        <rect fill={palette.metalSlate} height="560" width="640" x="0" y="0" />

        {backgroundDots.map((dot, index) => (
          <circle key={`dot-${index}`} cx={dot.x} cy={dot.y} fill="rgba(255,255,255,0.015)" r="1.1" />
        ))}

        <path
          d="M18 430C92 348 144 278 208 258C264 242 318 260 352 240C398 212 438 160 490 150C544 140 588 162 622 200"
          fill="none"
          stroke="rgba(255,255,255,0.065)"
          strokeLinecap="round"
          strokeWidth="18"
        />
        <path
          d="M54 494C118 410 150 366 178 314C212 250 246 176 310 144"
          fill="none"
          stroke="rgba(255,255,255,0.05)"
          strokeLinecap="round"
          strokeWidth="16"
        />
        <path
          d="M314 520C362 454 420 390 506 352C554 330 600 324 624 322"
          fill="none"
          stroke="rgba(255,255,255,0.05)"
          strokeLinecap="round"
          strokeWidth="16"
        />

        <motion.path
          animate={{ pathLength: 1 }}
          d="M112 414C176 356 214 330 260 312C308 294 350 270 386 244C426 214 466 194 518 176C550 166 584 162 606 164"
          fill="none"
          initial={{ pathLength: 0 }}
          stroke={palette.road}
          strokeLinecap="round"
          strokeWidth="4"
          transition={{ duration: 2.5, delay: 0.3, ease: "easeInOut" }}
        />

        {riders.map((rider) => {
          const point = rider.points[frame];

          return (
            <motion.g
              key={rider.name}
              animate={{ x: point.x - rider.points[0].x, y: point.y - rider.points[0].y }}
              transition={{ duration: 2, ease: "easeInOut" }}
            >
              <ArrowHead angle={point.angle} color={rider.color} x={rider.points[0].x} y={rider.points[0].y} />
              {rider.leader ? (
                <circle
                  cx={rider.points[0].x}
                  cy={rider.points[0].y}
                  fill="none"
                  opacity="0.7"
                  r="12"
                  stroke={palette.accentBorder}
                  strokeWidth="1"
                />
              ) : null}
              <circle
                cx={rider.points[0].x}
                cy={rider.points[0].y}
                fill={rider.color}
                opacity={rider.leader ? 0.95 : 0.82}
                r={rider.leader ? 8 : 6}
              />
              <text
                fill={palette.textPrimary}
                fontFamily={fonts.body}
                fontSize="10"
                fontWeight="500"
                opacity="0.8"
                x={rider.points[0].x + 14}
                y={rider.points[0].y - 2}
              >
                {rider.name}
              </text>
              <text
                fill={palette.textTertiary}
                fontFamily={fonts.mono}
                fontSize="9"
                opacity="0.85"
                x={rider.points[0].x + 14}
                y={rider.points[0].y + 11}
              >
                {rider.speed}
              </text>
            </motion.g>
          );
        })}

        <rect fill={palette.surface3} height="24" width="640" x="0" y="536" />
        <text fill={palette.textQuiet} fontFamily={fonts.mono} fontSize="9" x="16" y="551">
          Simulated — live Mapbox map in product
        </text>
      </svg>

      <div
        style={{
          position: "absolute",
          left: 18,
          bottom: 34,
          display: "flex",
          gap: 10
        }}
      >
        {hud.map((item, index) => (
          <div
            key={item.label}
            style={{
              height: 34,
              minWidth: index === 0 ? 126 : 112,
              borderRadius: 17,
              border: `1px solid ${palette.borderDefault}`,
              background: palette.surface2,
              backdropFilter: tokens.marketing.blur.glass,
              WebkitBackdropFilter: tokens.marketing.blur.glass,
              display: "flex",
              alignItems: "center",
              padding: "0 14px",
              gap: 10
            }}
          >
            {index === 0 ? <span style={{ color: palette.accent, fontSize: 12 }}>{item.value}</span> : null}
            <span
              style={{
                color: palette.textPrimary,
                fontFamily: fonts.mono,
                fontSize: 11,
                fontWeight: 500
              }}
            >
              {index === 0 ? item.label : `${item.label} ${item.value}`}
            </span>
          </div>
        ))}
      </div>

      <motion.div
        animate={{ opacity: [0.35, 0], scale: [1, 1.8] }}
        style={{
          position: "absolute",
          left: `${(leader.x / 640) * 100}%`,
          top: `${(leader.y / 560) * 100}%`,
          width: 24,
          height: 24,
          marginLeft: -12,
          marginTop: -12,
          borderRadius: 999,
          border: `1px solid ${palette.accent}`,
          pointerEvents: "none"
        }}
        transition={{ duration: 2.5, ease: "easeOut", repeat: Number.POSITIVE_INFINITY }}
      />
    </motion.div>
  );
}
