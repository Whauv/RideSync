import { motion } from "framer-motion";

import { tokens } from "@/design/tokens";

const palette = tokens.marketing.color;

export function DesktopCommandCenter() {
  const regions = [
    { key: "shell", delay: 0 },
    { key: "sidebar", delay: 0.1 },
    { key: "map", delay: 0.2 },
    { key: "chat", delay: 0.3 },
    { key: "topbar", delay: 0.4 }
  ];

  return (
    <motion.div
      initial={{ opacity: 0, y: 14 }}
      style={{ width: "100%" }}
      transition={{ duration: 0.55, ease: [0.16, 1, 0.3, 1] }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
    >
      <svg viewBox="0 0 560 380" width="100%">
        <motion.rect
          animate={{ opacity: 1 }}
          fill={palette.surface1}
          height="360"
          initial={{ opacity: 0 }}
          rx="10"
          stroke={palette.borderDefault}
          transition={{ delay: regions[0].delay, duration: 0.35 }}
          width="540"
          x="10"
          y="10"
        />
        <motion.rect
          animate={{ opacity: 1 }}
          fill={palette.surface3}
          height="32"
          initial={{ opacity: 0 }}
          rx="8"
          transition={{ delay: regions[4].delay, duration: 0.35 }}
          width="500"
          x="30"
          y="28"
        />
        {[0, 1, 2].map((index) => (
          <motion.rect
            key={`pill-${index}`}
            animate={{ opacity: 1 }}
            fill={palette.borderStrong}
            height="8"
            initial={{ opacity: 0 }}
            rx="4"
            transition={{ delay: regions[4].delay + index * 0.05, duration: 0.3 }}
            width={index === 1 ? 58 : 42}
            x={44 + index * 56}
            y="40"
          />
        ))}

        <motion.rect
          animate={{ opacity: 1 }}
          fill={palette.surface2}
          height="272"
          initial={{ opacity: 0 }}
          rx="8"
          transition={{ delay: regions[1].delay, duration: 0.35 }}
          width="120"
          x="30"
          y="78"
        />
        {[0, 1, 2, 3].map((index) => (
          <g key={`rider-${index}`}>
            <motion.circle
              animate={{ opacity: 1 }}
              cx="48"
              cy={110 + index * 50}
              fill={index === 0 ? palette.accent : palette.textSecondary}
              initial={{ opacity: 0 }}
              r="4"
              transition={{ delay: regions[1].delay + index * 0.05, duration: 0.3 }}
            />
            <motion.rect
              animate={{ opacity: 1 }}
              fill={palette.borderStrong}
              height="6"
              initial={{ opacity: 0 }}
              rx="3"
              transition={{ delay: regions[1].delay + index * 0.05, duration: 0.3 }}
              width={index === 2 ? 38 : 48}
              x="60"
              y={106 + index * 50}
            />
          </g>
        ))}

        <motion.rect
          animate={{ opacity: 1 }}
          fill={palette.metalSlate}
          height="272"
          initial={{ opacity: 0 }}
          rx="8"
          transition={{ delay: regions[2].delay, duration: 0.35 }}
          width="230"
          x="170"
          y="78"
        />
        <motion.path
          animate={{ opacity: 1, pathLength: 1 }}
          d="M194 274C232 236 258 198 298 194C332 190 358 214 380 178"
          fill="none"
          initial={{ opacity: 0, pathLength: 0 }}
          stroke={palette.accent}
          strokeDasharray="5 4"
          strokeLinecap="round"
          strokeWidth="3"
          transition={{ delay: regions[2].delay + 0.05, duration: 1.4, ease: "easeInOut" }}
        />
        {[0, 1, 2].map((index) => (
          <motion.circle
            key={`map-dot-${index}`}
            animate={{ opacity: 1 }}
            cx={[214, 286, 366][index]}
            cy={[248, 206, 190][index]}
            fill={index === 0 ? palette.accent : palette.textSecondary}
            initial={{ opacity: 0 }}
            r={index === 0 ? 5 : 4}
            transition={{ delay: regions[2].delay + 0.12 + index * 0.06, duration: 0.3 }}
          />
        ))}

        <motion.rect
          animate={{ opacity: 1 }}
          fill={palette.surface2}
          height="272"
          initial={{ opacity: 0 }}
          rx="8"
          transition={{ delay: regions[3].delay, duration: 0.35 }}
          width="112"
          x="418"
          y="78"
        />
        {[0, 1, 2, 3, 4, 5].map((index) => (
          <motion.rect
            key={`msg-${index}`}
            animate={{ opacity: 1 }}
            fill={index % 2 === 0 ? palette.borderStrong : palette.borderDefault}
            height="6"
            initial={{ opacity: 0 }}
            rx="3"
            transition={{ delay: regions[3].delay + index * 0.04, duration: 0.25 }}
            width={[62, 46, 54, 36, 58, 40][index]}
            x={index % 2 === 0 ? 430 : 446}
            y={102 + index * 26}
          />
        ))}
      </svg>
    </motion.div>
  );
}
