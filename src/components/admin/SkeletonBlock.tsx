import type { CSSProperties } from "react";
import { motion } from "framer-motion";

import { tokens } from "@/design/tokens";

const palette = tokens.admin.color;
const radius = tokens.admin.radius;

export function SkeletonBlock({
  height,
  radiusName = "panel",
  style,
  width = "100%"
}: {
  height: number | string;
  radiusName?: keyof typeof radius;
  style?: CSSProperties;
  width?: number | string;
}) {
  return (
    <div
      style={{
        position: "relative",
        overflow: "hidden",
        width,
        height,
        borderRadius: radius[radiusName],
        background: "linear-gradient(180deg, rgba(255,255,255,0.02) 0%, rgba(255,255,255,0.035) 100%)",
        ...style
      }}
    >
      <motion.div
        animate={{ x: ["-120%", "120%"] }}
        style={{
          position: "absolute",
          top: 0,
          bottom: 0,
          left: 0,
          width: "42%",
          background: `linear-gradient(90deg, rgba(255,255,255,0) 0%, ${palette.borderSubtle} 50%, rgba(255,255,255,0) 100%)`
        }}
        transition={{ duration: 1.5, ease: "linear", repeat: Number.POSITIVE_INFINITY }}
      />
    </div>
  );
}
