import { motion } from "framer-motion";

export function SkeletonLine({
  height = 12,
  width = "100%"
}: {
  height?: number;
  width?: number | string;
}) {
  return (
    <div
      style={{
        width,
        height,
        borderRadius: 4,
        overflow: "hidden",
        background: "rgba(255,255,255,0.04)"
      }}
    >
      <motion.div
        animate={{ x: ["-100%", "100%"] }}
        style={{
          width: "200%",
          height: "100%",
          background: "linear-gradient(90deg, transparent 0%, rgba(255,255,255,0.06) 50%, transparent 100%)"
        }}
        transition={{ duration: 1.5, repeat: Number.POSITIVE_INFINITY, ease: "linear" }}
      />
    </div>
  );
}
