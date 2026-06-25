import type { CSSProperties } from "react";
import { motion } from "framer-motion";

export function SkeletonLine({
  width = "100%",
  height = 10,
  style = {}
}: {
  width?: number | string;
  height?: number;
  style?: CSSProperties;
}) {
  return (
    <div
      style={{
        width,
        height,
        borderRadius: 4,
        overflow: "hidden",
        background: "rgba(255,255,255,0.04)",
        ...style
      }}
    >
      <motion.div
        animate={{ x: ["-100%", "100%"] }}
        style={{
          width: "200%",
          height: "100%",
          background: "linear-gradient(90deg, transparent 0%, rgba(255,255,255,0.055) 50%, transparent 100%)"
        }}
        transition={{ duration: 1.6, repeat: Number.POSITIVE_INFINITY, ease: "linear" }}
      />
    </div>
  );
}
