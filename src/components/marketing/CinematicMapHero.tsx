import { useEffect, useMemo, useState } from "react";
import type { CSSProperties } from "react";
import { AnimatePresence, motion } from "framer-motion";

import { tokens } from "@/design/tokens";

const palette = tokens.marketing.color;
const fonts = tokens.marketing.font;
const ease = tokens.marketing.motion.sectionEase;

const viewBoxWidth = 940;
const viewBoxHeight = 520;

const routePath =
  "M198 420C244 396 288 364 336 346C392 324 436 312 488 308C554 304 608 288 678 250C740 216 786 182 844 136";

const contourPaths = [
  "M46 118C128 62 236 46 350 74C454 100 526 158 566 226C608 296 608 360 566 414C522 470 440 508 334 516",
  "M120 62C214 24 326 20 432 50C542 80 624 142 670 222C714 296 716 370 674 438C626 504 530 540 422 534",
  "M228 24C322 4 420 10 514 46C616 84 694 146 742 224C784 292 790 360 756 424C716 498 632 548 534 564",
  "M34 256C146 214 246 206 350 228C452 250 540 292 606 352C674 416 706 486 704 548",
  "M640 26C716 58 786 114 830 186C872 254 884 332 866 404C848 476 804 540 738 582",
  "M84 336C176 318 256 320 348 348C430 374 504 422 562 484C620 548 646 618 640 682"
];

const driftFrames = [
  [
    { x: 0, y: 0 },
    { x: 0, y: 0 },
    { x: 0, y: 0 },
    { x: 0, y: 0 },
    { x: 0, y: 0 }
  ],
  [
    { x: 8, y: -4 },
    { x: 5, y: -3 },
    { x: 4, y: -2 },
    { x: 3, y: -2 },
    { x: 2, y: -1 }
  ],
  [
    { x: -6, y: 3 },
    { x: -4, y: 2 },
    { x: -3, y: 1 },
    { x: -2, y: 2 },
    { x: -1, y: 1 }
  ],
  [
    { x: 6, y: 2 },
    { x: 3, y: 1 },
    { x: 2, y: -2 },
    { x: 2, y: -1 },
    { x: 1, y: -1 }
  ]
] as const;

const riders = [
  {
    name: "Maya",
    speed: "68",
    x: 262,
    y: 392,
    color: "#00C49A",
    leader: true,
    angle: -42,
    radius: 9,
    halo: 11,
    delay: 1.8,
    labelOffsetX: 16,
    labelOffsetY: -6
  },
  {
    name: "Allen",
    speed: "66",
    x: 378,
    y: 394,
    color: "#7B61FF",
    angle: -40,
    radius: 7,
    halo: 8,
    delay: 1.95,
    labelOffsetX: -52,
    labelOffsetY: -6
  },
  {
    name: "Luis",
    speed: "64",
    x: 458,
    y: 298,
    color: "#FF6B35",
    angle: -38,
    radius: 7,
    halo: 8,
    delay: 2.1,
    labelOffsetX: 16,
    labelOffsetY: -18
  },
  {
    name: "Kim",
    speed: "65",
    x: 632,
    y: 262,
    color: "#F5C542",
    angle: -35,
    radius: 7,
    halo: 8,
    delay: 2.25,
    labelOffsetX: 16,
    labelOffsetY: -6
  },
  {
    name: "Jon",
    speed: "63",
    x: 828,
    y: 200,
    color: "#60A5FA",
    angle: -32,
    radius: 7,
    halo: 8,
    delay: 2.4,
    labelOffsetX: 16,
    labelOffsetY: -6
  }
] as const;

function RiderDot({
  angle,
  color,
  delay,
  drift,
  halo,
  leader,
  labelOffsetX,
  labelOffsetY,
  name,
  radius,
  speed,
  x,
  y
}: {
  angle: number;
  color: string;
  delay: number;
  drift: { x: number; y: number };
  halo: number;
  leader?: boolean;
  labelOffsetX: number;
  labelOffsetY: number;
  name: string;
  radius: number;
  speed: string;
  x: number;
  y: number;
}) {
  return (
    <motion.g
      animate={{ opacity: 1, scale: 1, x: drift.x, y: drift.y }}
      initial={{ opacity: 0, scale: 0 }}
      style={{ transformOrigin: `${x}px ${y}px` }}
      transition={{
        opacity: { duration: 0.5, delay, ease },
        scale: { duration: 0.5, delay, ease },
        x: { duration: 2, delay: delay > 2.5 ? 0 : 3, ease: "easeInOut" },
        y: { duration: 2, delay: delay > 2.5 ? 0 : 3, ease: "easeInOut" }
      }}
    >
      {leader ? (
        <>
          <motion.circle
            animate={{ opacity: [0.6, 0], scale: [1, 2.2] }}
            cx={x}
            cy={y}
            fill="none"
            r="14"
            stroke="#00C49A"
            strokeOpacity="0.5"
            strokeWidth="1.5"
            style={{ transformOrigin: `${x}px ${y}px` }}
            transition={{ duration: 2.8, repeat: Number.POSITIVE_INFINITY, ease: "easeOut", delay: 0 }}
          />
          <motion.circle
            animate={{ opacity: [0.6, 0], scale: [1, 2.2] }}
            cx={x}
            cy={y}
            fill="none"
            r="14"
            stroke="#00C49A"
            strokeOpacity="0.5"
            strokeWidth="1.5"
            style={{ transformOrigin: `${x}px ${y}px` }}
            transition={{ duration: 2.8, repeat: Number.POSITIVE_INFINITY, ease: "easeOut", delay: 1.4 }}
          />
        </>
      ) : null}

      <circle cx={x} cy={y} fill={color} fillOpacity="0.12" r={halo} />
      <path
        d="M 0,-6 C 2,-4 2.5,-2 0,0 C -2.5,-2 -2,-4 0,-6"
        fill={color}
        fillOpacity="0.85"
        transform={`translate(${x}, ${y - radius - 4}) rotate(${angle}, 0, ${radius + 4})`}
      />
      <circle cx={x} cy={y} fill={color} filter={`drop-shadow(0 0 6px ${color}66)`} r={radius} />

      {leader ? (
        <text
          fill="#00C49A"
          fontFamily={fonts.body}
          fontSize="7"
          letterSpacing="0.08em"
          opacity="0.7"
          style={{ userSelect: "none" }}
          x={x + labelOffsetX}
          y={y + labelOffsetY - 8}
        >
          LEADER
        </text>
      ) : null}
      <text
        fill="rgba(238,238,240,0.85)"
        fontFamily="system-ui, -apple-system, sans-serif"
        fontSize="11"
        fontWeight="500"
        style={{ userSelect: "none" }}
        x={x + labelOffsetX}
        y={y + labelOffsetY + 4}
      >
        {name}
      </text>
      <text
        fill="rgba(238,238,240,0.4)"
        fontFamily={fonts.mono}
        fontSize="9"
        style={{ userSelect: "none" }}
        x={x + labelOffsetX}
        y={y + labelOffsetY + 16}
      >
        {speed} mph
      </text>
    </motion.g>
  );
}

export function CinematicMapHero({ className }: { className?: string }) {
  const [driftFrame, setDriftFrame] = useState(0);
  const [isDesktop, setIsDesktop] = useState(() => (typeof window === "undefined" ? true : window.innerWidth >= 768));

  useEffect(() => {
    const handleResize = () => setIsDesktop(window.innerWidth >= 768);

    handleResize();
    window.addEventListener("resize", handleResize);

    return () => window.removeEventListener("resize", handleResize);
  }, []);

  useEffect(() => {
    const timer = window.setInterval(() => {
      setDriftFrame((current) => (current + 1) % driftFrames.length);
    }, 4000);

    return () => window.clearInterval(timer);
  }, []);

  const riderOffsets = useMemo(() => driftFrames[driftFrame], [driftFrame]);

  if (!isDesktop) {
    return null;
  }

  return (
    <motion.div
      animate={{ opacity: 0.92, scale: 1 }}
      className={className}
      initial={{ opacity: 0, scale: 0.98 }}
      style={wrapStyle}
      transition={{ duration: 1.2, delay: 0.1, ease }}
    >
      <svg
        overflow="visible"
        preserveAspectRatio="xMidYMid slice"
        style={{ background: "transparent", overflow: "visible" }}
        viewBox={`0 0 ${viewBoxWidth} ${viewBoxHeight}`}
        width="100%"
      >
        <defs>
          <pattern height="40" id="map-grid" patternUnits="userSpaceOnUse" width="40">
            <path d="M 40 0 L 0 0 0 40" fill="none" stroke="rgba(255,255,255,0.018)" strokeWidth="1" />
          </pattern>
          <filter id="route-glow">
            <feGaussianBlur stdDeviation="4" />
          </filter>
        </defs>

        <rect fill="url(#map-grid)" height={viewBoxHeight} width={viewBoxWidth} x="0" y="0" />

        <motion.g animate={{ opacity: 1 }} initial={{ opacity: 0 }} transition={{ duration: 3, delay: 0.2, ease: "easeOut" }}>
          {contourPaths.map((path) => (
            <path key={path} d={path} fill="none" stroke="rgba(255,255,255,0.04)" strokeWidth="0.8" />
          ))}
        </motion.g>

        <path d={routePath} fill="none" stroke="rgba(255,255,255,0.04)" strokeLinecap="round" strokeWidth="28" />
        <path d={routePath} fill="none" stroke="rgba(255,255,255,0.07)" strokeLinecap="round" strokeWidth="18" />
        <path d={routePath} fill="none" filter="url(#route-glow)" stroke="rgba(0,196,154,0.12)" strokeLinecap="round" strokeWidth="8" />
        <motion.path
          animate={{ pathLength: 1 }}
          d={routePath}
          fill="none"
          initial={{ pathLength: 0 }}
          stroke="#00C49A"
          strokeLinecap="round"
          strokeOpacity="0.7"
          strokeWidth="2.5"
          transition={{ duration: 2.2, delay: 0.6, ease: "easeInOut" }}
        />

        {riders.map((rider, index) => (
          <RiderDot key={rider.name} drift={riderOffsets[index]} {...rider} />
        ))}
      </svg>

      <div style={fadeLeftStyle} />
      <div style={fadeRightStyle} />
      <div style={fadeTopStyle} />
      <div style={fadeBottomStyle} />

      <AnimatePresence>
        <>
          <motion.div
            animate={{ opacity: 1, y: 0 }}
            initial={{ opacity: 0, y: 8 }}
            style={hudPanelOverlayStyle}
            transition={{ duration: 0.5, delay: 2.5, ease }}
          >
            <div style={hudSectionStyle}>
              <span style={pulseWrapStyle}>
                <motion.span
                  animate={{ opacity: [1, 0], scale: [1, 1.4] }}
                  style={pulseRingStyle}
                  transition={{ duration: 2, repeat: Number.POSITIVE_INFINITY, ease: "easeOut" }}
                />
                <span style={pulseDotStyle} />
              </span>
              <span style={hudLiveLabelStyle}>Voice linked</span>
            </div>

            <div style={hudDividerStyle} />

            <div style={hudSectionStyle}>
              <span style={hudArrowStyle}>↕</span>
              <span style={hudRouteStyle}>118 mi route</span>
            </div>
          </motion.div>
          <motion.div
            animate={{ opacity: 1, y: 0 }}
            initial={{ opacity: 0, y: 8 }}
            style={hudAttributionStyle}
            transition={{ duration: 0.5, delay: 2.6, ease }}
          >
            Simulated visualization · live map available in product
          </motion.div>
        </>
      </AnimatePresence>
    </motion.div>
  );
}

const wrapStyle: CSSProperties = {
  position: "relative",
  width: "100%",
  height: "100%",
  background: "transparent",
  overflow: "clip"
};

const fadeBaseStyle: CSSProperties = {
  position: "absolute",
  pointerEvents: "none",
  zIndex: 5
};

const fadeLeftStyle: CSSProperties = {
  ...fadeBaseStyle,
  left: 0,
  top: 0,
  bottom: 0,
  width: 128,
  background: "linear-gradient(90deg, #080809 0%, rgba(8,8,9,0) 100%)"
};

const fadeRightStyle: CSSProperties = {
  ...fadeBaseStyle,
  right: 0,
  top: 0,
  bottom: 0,
  width: "4%",
  minWidth: 40,
  background: "linear-gradient(90deg, rgba(8,8,9,0) 0%, #080809 100%)"
};

const fadeTopStyle: CSSProperties = {
  ...fadeBaseStyle,
  left: 0,
  right: 0,
  top: 0,
  height: 72,
  background: "linear-gradient(180deg, rgba(8,8,9,0.7) 0%, rgba(8,8,9,0) 100%)"
};

const fadeBottomStyle: CSSProperties = {
  ...fadeBaseStyle,
  left: 0,
  right: 0,
  bottom: 0,
  height: 80,
  background: "linear-gradient(180deg, rgba(8,8,9,0) 0%, rgba(8,8,9,0.6) 100%)"
};

const hudPanelOverlayStyle: CSSProperties = {
  position: "absolute",
  left: "50%",
  bottom: 20,
  transform: "translateX(-50%)",
  width: 280,
  height: 36,
  background: "rgba(14,15,18,0.85)",
  backdropFilter: "blur(16px) saturate(120%)",
  WebkitBackdropFilter: "blur(16px) saturate(120%)",
  border: "1px solid rgba(255,255,255,0.10)",
  borderRadius: 10,
  padding: "0 14px",
  display: "flex",
  alignItems: "center",
  justifyContent: "space-between",
  zIndex: 10
};

const hudSectionStyle: CSSProperties = {
  display: "flex",
  alignItems: "center"
};

const pulseWrapStyle: CSSProperties = {
  position: "relative",
  width: 6,
  height: 6,
  display: "inline-flex"
};

const pulseRingStyle: CSSProperties = {
  position: "absolute",
  inset: 0,
  borderRadius: 999,
  background: palette.accent
};

const pulseDotStyle: CSSProperties = {
  width: 6,
  height: 6,
  borderRadius: 999,
  background: palette.accent
};

const hudLiveLabelStyle: CSSProperties = {
  marginLeft: 6,
  fontSize: 11,
  lineHeight: 1,
  fontWeight: 500,
  color: "rgba(0,196,154,0.90)"
};

const hudDividerStyle: CSSProperties = {
  width: 1,
  height: 14,
  background: "rgba(255,255,255,0.10)",
  margin: "0 12px"
};

const hudArrowStyle: CSSProperties = {
  fontSize: 11,
  lineHeight: 1,
  color: "rgba(0,196,154,0.70)",
  display: "inline-flex"
};

const hudRouteStyle: CSSProperties = {
  marginLeft: 4,
  fontSize: 11,
  lineHeight: 1,
  fontWeight: 400,
  color: "rgba(238,238,240,0.55)"
};

const hudAttributionStyle: CSSProperties = {
  position: "absolute",
  left: "50%",
  bottom: 6,
  transform: "translateX(-50%)",
  fontSize: 9,
  lineHeight: 1,
  color: "rgba(238,238,240,0.20)",
  textAlign: "center",
  whiteSpace: "nowrap",
  zIndex: 10
};
